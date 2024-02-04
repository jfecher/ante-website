+++
authors = ["Jake Fecher"]
title = "Algebraic Effects, Ownership, and Borrowing"
date = "2024-02-04"
categories = ["effects", "thread safety", "memory management"]
banner = "img/banners/anteater2.jpg"
+++

---

# Introduction

[Algebraic Effects](/docs/language/#algebraic-effects) are a useful abstraction
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

## Add note that this is required because an effect may be called multiple times, `Fn` comparison from below

Unlike `resume`, nothing is preventing the `the_value` from being called multiple times, etc.

---

# Borrowing

Things get more complicated when we consider borrowing. Although Ante's references are
[second-class](http://localhost:1313/docs/language/#second-class-references) and thus
do not require lifetime variables, we still need to ensure their lifetime is sound.

## Owning References

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
each reference returned from an effect as having the same lifetime:

```ante
bad () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Error: Cannot create a new aliased reference with `s1` still in scope
    s2 = read ()

    print s1
```

Similarly, trying to obfuscate this by passing our reference into a function
and obtaining the second reference there also fails:

```ante
bad1 () : Unit can Read (&own mut Box String) =
    s1 = read ()

    // Error: Cannot pass `s1` as `&own mut`, it will be aliased by
    //         the return value of `can Read (&own mut Box String)` in `bad2`
    bad2 s1

// This function is fine. The compiler sees two references which must be disjoint
bad2 (s1: &own mut Box String) : Unit can Read (&own mut Box String) =
    s2 = read ()
    s1 := Box.of ""
    print s2
```

If we pretend Ante has explicit lifetimes it can be easier to see why this happens:

```ante
bad1 () : Unit can Read (&'a own mut Box String) =
    s1: &'a ... = read ()

    // Error: Cannot borrow lifetime 'a as mutable more than once at a time
    bad2 s1

// This function is fine. The compiler sees two references which must be disjoint
bad2 (s1: &'b own mut Box String) : Unit can Read (&'a own mut Box String) =
    s2 = read ()
    s1 := Box.of ""
    print s2
```

Note that this same check will occur for any effect returning a reference, not
just ones parameterized over a reference. Due to Ante's rules for second-class
references, any parameters passed as references to the effect will be tied to
the same lifetime as the return value.

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
    fork: FnMut Unit => Bool
```

Now we'd get an error when writing `foo`:

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

Since this error would otherwise be much more common, effect functions
are by default `FnOnce`.

Also note that after removing `drop`, `message` will not be dropped at the
end of `foo`. Instead, it is part of `fork`'s environment and will be dropped
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
a different environment type (pseudocode):

```ante
effect Foo with
    foo: forall env. FnOnce env (Unit -> Unit)
```

### Note on second-class resume
### Note on Clone env

---

# Multithreading

Just require `Send env`
