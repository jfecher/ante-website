+++
authors = ["Jake Fecher"]
title = "Algebraic Effects, Ownership, and Borrowing"
date = "2024-02-20"
categories = ["effects", "thread safety", "memory management"]
banner = "img/banners/anteater2_cropped.jpg"
+++

---

# Introduction

[Algebraic Effects](/docs/language/#algebraic-effects) are a useful abstraction
for reasoning about effectful programs by letting us leave the interpretation
of these effects to callers. However, most existing literature discusses these
in the context of a pure functional language with pervasive sharing of values.
What restrictions would we need to introduce algebraic effects into a language
with ownership and borrowing - particularly Ante?[^1]

---

# Ownership

Consider the following program:

```ante
effect Read a with
    read : Unit -> a

the_value (value: a) (f: Unit -> b can Read a) : b =
    handle f ()
    | read () -> resume value
```

This seems like it'd pass type checking at first glance, but we can easily
construct a program that tries to use the same moved value twice:

```ante
foo () : Unit can Read String =
    s1 = read ()
    s2 = read ()

foo () with the_value "foo"

// The above is sugar for
// the_value "foo" (fn () -> foo ())
```

Since a handler's body may be called multiple times, it may not move any
value in its environment. This restriction is similar to moving values in a loop:

```ante
the_value (value: a) (f: Unit -> b can Read a) : b =
    handle f ()
    // Error: Handler body moves `value` which will still
    //         be needed if the handler is called again
    | read () -> resume value
```

---

# Borrowing

Things get more complicated when we consider borrowing. Although Ante's references
[do not have explicit lifetime variables](/docs/language/#borrowing),
we still need to ensure their lifetime is sound.

## Returning Owning References

Consider the following program:

```ante
bad () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Uh-oh, we've just obtained a second mutable owning reference to the same String
    s2 = read ()
    s2_inner_ref = as_ref s2

    // Drop the old Box referenced by s1 and s2
    s1 := Box.of "foo"

    // And now we're printing a dangling reference
    print s2_inner_ref

the_ref (ref: &own mut t) (f: Unit -> a can Read (&own mut t)) : a =
    handle f ()
    | read () -> resume ref

my_string = mut Box.of "bar"
bad () with the_ref &my_string
```

This breaks the aliasing restriction on `&own mut` in a way the compiler
cannot verify with existing rules on tracking lifetimes.

The solution to this is that each function using the same `Read (&own mut Box String)`
effect is considered to borrow from the same effect handler. Attempting to retrieve
two owned, mutable references from the same handler then would be a lifetime error:

```ante
bad () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Error: Cannot create a new aliased reference with `s1` still in scope
    s2 = read ()

    print s1
```

Similarly, trying to obfuscate this by calling a function which indirectly
returns another reference should also fail:

```ante
indirect () can Read (&own mut Box String) =
    read ()

foo () can Read (&own mut Box String) =
    r1 = read ()

    // Error: Cannot borrow from `Read` effect again with `r1` still in scope
    r2 = indirect ()
```

## Owned Reference Parameters

Now let's consider how we can break programs which pass references to effects.
For this we're going to use the `Yield a` effect which is used for creating
generators or streams:

```ante
effect Yield a with
    yield: a -> Unit

foo () : Unit can Yield (&own mut I32) =
    vec = mut Vec.of [1, 2]
    yield (get_mut &vec 0)
    vec := Vec.of [3]
    yield (get_mut &vec 0)

bar () =
    x = mut None

    handle foo ()
    | yield y ->
        if Some x = x then
            // foo has cleared the underlying vec by this point,
            // so this would print a dangling reference!
            print x

        x := Some y
        resume ()
```

To prevent this we need to tie `y` to the variable that owns it - which is `resume`.
This way we can still yield owned references if needed, but we cannot call `resume` until they are dropped.

Conceptually, we can think of a handle expression as receiving a single `resume` object which
is then unpacked:

```ante
handle foo ()
| MyEffect a b ->
    ...

// Conceptually the same as:
handle foo ()
| MyEffect resume ->
    a = resume.a
    b = resume.b
    resume = resume.continuation
    ...
```

---

# Resume

One core aspect of effects that we've glossed over so far is the `resume` function
which resumes an effectful computation from the handler. Since `resume` refers to an
in-progress computation, we need a way to safely encode this environment, yet we
need to do so when defining the effect before the environment is known.
What type should be given to `resume`?

Consider the following code:

```ante
effect Fork with
    fork: Unit -> Bool

foo () : Unit can Fork =
    message = "branch"

    if fork () then
        print "${message} A"
        drop message
    else
        print "${message} B"

handle_fork (f: Unit -> a can Fork) : a =
    handle f ()
    | fork () ->
        // Run `resume` twice, arbitrarily returning the second result
        resume true
        resume false

handle_fork foo
```

After resuming from the `fork` the second time, we enter the false branch.
When doing so, `message` has already been moved, so we'd be reading from an
already-dropped value.

This is the problem the different closure types already solve. We just need
some way to determine if `resume` should be a `Fn`, `FnMut`, or `FnOnce` since
we cannot know this within the handler itself.

One possibility is to require this in the definition of `Fork`:

```ante
effect Fork with
    fork: Unit -> Bool

    // The underscores here are because we're omitting the closure environment
    // type as well as the actual function type - which is derived from fork's type.
    // Although the environment type can be specified if desired, the function type of resume
    // must be omitted because its return type will be the handler type, which is
    // not known at this point.
    fork.resume: FnMut _ _
```

Note that `fork` is still callable without restrictions.
It is only `resume` that will be a `FnMut` when it is introduced.

Anyways, now we'd get an error when writing `foo`:

```ante
foo () : Unit can Fork =
    message = "branch"

    // Error: `fork` can be resumed multiple times, but `message` would
    //         possibly be moved after the first call to `resume`.
    if fork () then
        print "${message} A"
        // Note: `message` is moved here
        drop message
    else
        print "${message} B"
```

Since this error would otherwise be much more common, `resume` is by
default a `FnOnce` unless otherwise specified. This means when defining
an effect we will need to think about what kinds of effect handlers we
want to permit.

Also note that after removing `drop`, `message` will not be dropped at the
end of `foo`. Instead, it is part of `resume`'s environment and will be dropped
after the last use of `resume` in the effect handler.

## Environment Type Quantification

Most effects which give an explicit type for `resume` will either omit the
environment type, or specify it as a type variable quantified over the function:

```ante
effect Foo with
    foo: Unit -> Unit
    foo.resume: FnOnce env _

    // The above means:
    // foo.resume: forall env. FnOnce env _
```

This is generally desired since it allows the `resume` closure to be unboxed most
of the time. However, what would happen if the user wrote the trait as the following:

```ante
effect Foo env with
    foo: Unit -> Unit
    foo.resume: FnOnce env _
```

Since each generic instance of a trait would be separate (e.g. `Read I32` versus `Read String`),
each use of this effect with a different environment would be a separate effect:

```ante
forced_example (x: &I32) =
    foo ()
    y = x
    foo ()
    print (x, y)
```

Above, `forced_example` would be inferred to have the effects `Foo Env1` and `Foo Env2` where
`Env1` and `Env2` are both opaque types representing the environments. Since each of these would
need to be handled by separate effect handlers, this technique could be used to limit an effect
to being called at most once per handler. It remains to be seen how useful this would be however.

## Restricting the environment type

If any capabilities are required on the `resume` closure, a `given` clause can be added.
Since most traits on closures are defined as long as they're defined on the closure environment,
it is usually sufficient to require the trait on the closure environment alone:

```ante
effect FooCloneEnv with
    foo: Unit -> Unit
    foo.resume: FnOnce env _ given Clone env
```

Note that since `resume` is a continuation, this environment type includes any captured variables
across other function calls as well. So the `Clone` constraint above would also apply to
the `vec` variable below:

```ante
inner_fn () : Unit can FooCloneEnv =
    // x may be cloned
    x = 3
    foo ()
    print x

outer_fn () : Unit can FooCloneEnv =
    // vec may also be cloned
    vec = Vec.of [1, 2, 3]
    function2 ()
    print vec
```

Since environment types can grow quite large, it is generally recommended to avoid cloning
`resume`. A more useful trait constraint on `resume` is covered in the next section.

---

# Multithreading

Going back to the `Fork` example, what would happen if we tried to run each
resumption in its own thread?

```ante
effect Fork with
    fork: Unit -> Bool

    // Changed to Fn so that we can alias this twice below
    fork.resume: Fn env _

multithread_fork (f: Unit -> a can Fork) : a =
    handle f ()
    | fork () ->
        // Spawn two threads and wait for them both to complete
        Thread.wait fn () ->
            // Error: Expected argument of `Thread.spawn` to be `Send`
            //        No impl found for `Send (Fn _ (Unit -> Bool))`
            Thread.spawn (fn () -> resume true)
            Thread.spawn (fn () -> resume false)
```

In order to spawn a new thread to call `resume` we'd need to require
a reference to the closure environment is `Send`:

```ante
effect Fork with
    fork: Unit -> Bool
    foo.resume: Fn env _ given Send &env

multithread_fork (f: Unit -> a can Fork) : a =
    handle f ()
    | fork () ->
        Thread.wait fn () ->
            Thread.spawn (fn () -> resume true)
            Thread.spawn (fn () -> resume false)
```
---
# Polymorphic Effects

Ante also enables functions to be polymorphic over their effects.
For example, the `map` function has the type:

```ante
map: Stream a -> FnMut a => b can e -> Unit can Emit b, e
```

Now, recalling the `FooCloneEnv` example from earlier:

```ante
inner_fn () : Unit can FooCloneEnv =
    // x may be cloned
    x = 3
    foo ()
    print x

outer_fn () : Unit can FooCloneEnv =
    // vec may also be cloned
    vec = Vec.of [1, 2, 3]
    function2 ()
    print vec
```

This works fine, but how could we pass a function such as `outer_fn` to
`map`? The effect variable `e` would be instantiated to `FooCloneEnv` but
now we'd also need to know if the environment of `map` when it calls the
passed-in function is clone-able. In the most general case, we'd need to
be able to verify any trait from `map` and whether it can allow the function
used to resume multiple times or not.

We'd have to add these constraints to the effect variables directly:

```
map: Stream a -> FnMut a => b can e -> Unit
    given Clone e, Send e, Fn e.resume _
    can Emit b, e
```

This is a big hit to the usability of effects in this scheme since these constraints
would have to be manually specified on `map` for its contents to be checked. If not
specified, a new version of `map` would have to be written with a `Send`able environment
or similar. This will inevitably lead to some duplication when using effects that algebraic
effect handlers are usually meant to remove.

In a later article, we'll focus on ways to simplify the usability of this scheme by
providing sane defaults where possible.

---
# Implementation Details and Boxing

So far, each of the rules covered above should apply to any language with effects,
ownership, and borrowing. Different implementations of effects can have wildly
different runtime costs however.

For example, most languages implementing the full spectrum of algebraic effects
will keep track of the stack of effect handlers at runtime. When an effect call
is made, a lookup needs to be performed then the code needs to jump to the relevant
handler and back. This may be done by jumping up the call stack and copying stack frames or
by converting effectful functions to continuation passing style (CPS) - like Ante does.

Languages without algebraic effects aren't completely free from the costs of effects
either though. Even if we restrict ourselves to just the `async` effect, we can
see plenty of languages which include it - each with its own unique implementation
and performance characteristics.

Consider Rust's `async` effect which is implemented by compiling async functions
to state machines. In this scheme, the following code is rejected:

```rust
async fn recursive() {
    recursive().await;
    recursive().await;
}
```

Because the resulting state machine would have infinite size:

```rust
enum Recursive {
    First(Recursive),
    Second(Recursive),
}
```

To get around this, users need to box recursive functions:

```rust
use futures::future::{BoxFuture, FutureExt};

fn recursive() -> BoxFuture<'static, ()> {
    async move {
        recursive().await;
        recursive().await;
    }.boxed()
}
```

If we try to implement a similar example in future-Ante[^2]:

```ante
effect Async with
    await: Unit -> Unit

recursive () : Unit can Await =
    // This doesn't quite match the semantics of the Rust example above,
    // but lets us use a simpler definition for `await`
    await ()
    recursive ()
    await ()
    recursive ()

handle recursive ()
| await f -> resume ()
```

The result would look quite different:

```ante
recursive () : Unit =
    recursive ()
    recursive ()
```

So theoretically no boxing is needed for recursion alone.
The performance characteristics here look quite different - but that is
because in Ante they're largely determined by the handler that is used
rather than the call site of the effect. If we use a different handler
which does not resume in a tail position, boxing will be required.
For example:

```ante
handle recursive ()
| await f ->
    resume (f ())
    print "done"
```

Compiles to[^3]:

```ante
recursive k =
    recursive fn () ->
      recursive k
      print "done"
    print "done"
```

Here we can see the inner continuation captures the outer continuation `k`.

To give `k` a valid type, we'd need to box it to ensure it always has the
same size for each recursive call. This is similar to what we'd need to do
in the Rust example, but there are some unique problems with requiring users manually
box these continuations in Ante:

- The continuation is added by the compiler, so it isn't clear to the user where
they should add the boxing.
- Whether boxing is required is dependent on the structure of the handler. We don't
want to always add boxing since tail-resume is the more common case.

We could try to get around this by marking whether a given effect must have a tail-resumptive
handler or not, and requiring recursive functions using non-tail-resumptive handlers to
box their continuations somehow. This would make effects much more cumbersome to use however,
and one of Ante's goals is to be a slightly _higher_ level language than Rust. If effects are
not simple to use then users will avoid them.

For these reasons, the current plan is for the compiler to automatically insert boxing
of closures where appropriate and infer their lifetimes via [lifetime inference](/docs/ideas/#lifetime-inference).
Lifetime inference is a very interesting topic to me - it was one of Ante's original goals
to experiment with it. When it works well it can be great since it can stack-allocate
potentially even to prior stack frames. The downside is that the inferred lifetimes can be imprecise.
Although, in this case, if lifetimes cannot be accurately inferred, we would still know
their longest possible lifetime is that of the effect handler.[^4]
This is a topic that deserves much more detail though so I'll leave it to a future
blog post. If you're still curious, there are some papers on it reachable from the documentation link above.


[^1]: Note that ownership & borrowing are a recent addition to Ante and the changes in this article
are not yet reflected in the documentation!
[^2]: Getting the desired output here requires an optimization for `resume` in a tail position,
which is not currently implemented.
[^3]: This output has been heavily cleaned.
[^4]: This is because effects are implemented via delimited continuations which are evaluated at compile-time.
Ante takes this approach from Effekt and it is further detailed in [Zero-cost Effect Handlers by Staging](https://se.cs.uni-tuebingen.de/publications/schuster19zero.pdf)
