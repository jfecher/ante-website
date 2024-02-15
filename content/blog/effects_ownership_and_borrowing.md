+++
authors = ["Jake Fecher"]
title = "Algebraic Effects, Ownership, and Borrowing"
date = "2024-02-05"
categories = ["effects", "thread safety", "memory management"]
banner = "img/banners/anteater2.jpg"
+++

---

# Introduction

[Algebraic Effects](/docs/language/#algebraic-effects)[^1] are a useful abstraction
for reasoning about effectful programs by letting us leave the interpretation
of these effects to callers. However, most existing literature discusses these
in the context of a pure functional language with pervasive sharing of values.
What restrictions would we need to introduce algebraic effects into a language
with ownership and borrowing - particularly Ante?

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

Things get more complicated when we consider borrowing. Although Ante's references are
[do not have explicit lifetime variables](http://localhost:1313/docs/language/#second-class-references),
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

The solution to this is that the compiler needs to conservatively treat
each reference returned from an effect as originating from the same value:

```ante
bad () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Error: Cannot create a new aliased reference with `s1` still in scope
    s2 = read ()

    print s1
```

Similarly, trying to obfuscate this by passing our reference into a function
and obtaining the second reference there should also fail:

```ante
bad1 () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Error: Cannot pass `s1` as `&own mut`, it will be aliased by
    //         the return value of the effect `can Read (&own mut Box String)` in `bad2`
    bad2 s1

// This function is fine. The compiler sees two references which must be disjoint
bad2 (s1: &own mut Box String) : Unit can Read (&own mut Box String) =
    s2 = read ()
    s1 := Box.of ""
    print s2
```

Note that this same check will occur for any effect returning a reference, not
just ones parameterized over a reference.

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
    clear &vec
    push &vec 3
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

---

# Resume

One core aspect of effects that we've glossed over so far is the `resume` function
which resumes an effectful computation from the handler. Since `resume` refers to an
in-progress computation, we need a way to safely encode this environment yet we
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
When doing so, `message` has already been moved, so we'd be reading an
already-dropped value.

This is the problem the different closure types already solve. We just need
some way to determine if `resume` should be a `Fn`, `FnMut`, or `FnOnce` since
we cannot know this within the handler itself.

One possibility is to require this in the type of `fork` itself:

```ante
effect Fork with
    fork: Unit -> Bool

    // The underscores here are because we're omitting the closure environment
    // type as well as the actual function type - which is derived from fork's type.
    fork.resume: FnMut _ _
```

Note that `fork` itself is still callable without restrictions.
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

## Tracking the Environment Type

The above rules give us a way of reasoning about `resume` in terms of
`Fn`, `FnMut`, and `FnOnce`, but another aspect of these types is the environment
type parameter that is usually hidden. Like Rust and C++, Ante uses unboxed closures,
so knowing the environment type is necessary to determine how much space the closure
requires. So how do we determine the environment type?

Unlike returning a reference, the environment type of an effect is expected to
change when using it throughout functions, so we cannot apply the same solution
from returning references and unify all of these environments together. Doing so
is technically possible but would result to every environment variable being kept
alive until the effect is fully handled - it'd also likely require implicit allocations
for recursive functions.

Instead, we want something where each invocation of our effect can be used with
a different environment type:

```ante
effect Foo with
    foo: Unit -> Unit
    foo.resume: FnOnce env _
```

Since `env` here is introduced by the function rather than the effect, each invocation
of `foo` is allowed to use its own environment type.

Also note that 

### Note on second-class resume
### TODO: How do we know if `fork.resume` captures second-class references?
### Note on Clone env

---

# Multithreading

Going back to the `Fork` example, what would happen if we tried to run each
resumption in its own thread?

```ante
effect Fork with
    fork: Unit -> Bool

    // Changed to Fn so that we can alias this twice in Thread.run_all.
    // The `env` parameter is also now explicit for foreshadowing reasons
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
the function is `Send`. For closures, we can do this easily by requiring
the environment is `Send`:

```ante
effect Fork with
    fork: Fn env (Unit -> Bool) given Send env

multithread_fork (f: Unit -> a can Fork) : a =
    handle f ()
    | fork () ->
        Thread.wait fn () ->
            Thread.spawn (fn () -> resume true)
            Thread.spawn (fn () -> resume false)
```

---
# Implementation Details and Boxing

Different implementations of effects can have wildly different runtime costs.

### Note on other langs, koka, etc

Consider Rust's `async` effect which is implented by compiling async functions
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
    // but let's us use a simpler definition for `await`
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
Unfortunately, boxing can quickly become required when using a handler
that does not call `resume` in a tail position. Consider:

```ante
handle recursive ()
| await f ->
    resume (f ())
    print "done"
```

Which compiles to[^3]:

```ante
recursive k =
    recursive fn () -> 
      recursive k
      print "done"
    print "done"
```

Here we can see the inner continuation captures the outer continuation `k`.

To give `k` a valid type, we'd need to box it to ensure it always has the
same size for each recursive call. There are problems with having users manually
box these continuations however:

- The continuation is added by the compiler, so it isn't clear to the user where
they should add the boxing.
- Whether boxing is required is dependent on the structure of the handler. We don't
want to always add boxing since tail-resume is the more common case.

For these reasons, the current plan is for the compiler to automatically insert boxing
of closures where appropriate and infer their lifetimes via [lifetime inference](/docs/ideas/#lifetime-inference).
Lifetime inference can be imprecise, but I think this could be a good use case of it.
In the worst case where the lifetimes cannot be accurately inferred, we would still know
their longest possible lifetime is that of the effect handler.[^4]


[^1]: Note that ownership & borrowing are a recent addition to Ante and the changes in this article
are not yet reflected in the documentation!
[^2]: Getting the desired output here requires an optimization for `resume` in a tail position,
which is not currently implemented.
[^3]: This output has been heavily cleaned.
[^4]: This is because effects are implemented via delimited continuations which are evaluated at compile-time.
Ante takes this approach from Effekt and it is detailed in [Zero-cost Effect Handlers by Staging](https://se.cs.uni-tuebingen.de/publications/schuster19zero.pdf)
