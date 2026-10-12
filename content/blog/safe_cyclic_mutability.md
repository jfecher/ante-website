+++
authors = ["Jake Fecher"]
title = "Achieving Zero-cost Safe Cyclic Mutability"
date = "2026-10-08"
categories = ["mutability", "thread safety", "memory management"]
banner = "img/banners/antelope_canyon2.jpg"
+++

--- 
# Background
---

Ante is a low-level[^low-level] functional language built on ownership semantics and borrowing, similar to Rust.
Unlike Rust, however, a core goal of Ante is to be more lenient in its borrow checker, notably by relaxing Rust's
rule that you can either alias a reference or mutate it, but never both at the same time.

```rs
let mut my_tuple = (1, 2);
let first_elem = &my_tuple.0;

// error[E0506]: cannot assign to `my_tuple` because it is borrowed
my_tuple = (3, 4);

println!("{first_elem}");
```

I wanted to allow for code like the above while still disallowing code that would lead to dangling
pointers, and I wanted to do this entirely statically in the type system.

Alas! That's old news - the [very first
blog post](/blog/safe_shared_mutability/) on this site covered it. That post is frankly quite outdated
now. It's been years since then
and Ante's approach has substantially changed, having accrued many additions to make it more flexible.
Now, it has changed again, having blended many elements from
[group borrowing](https://verdagon.dev/blog/group-borrowing) with my own ideas to produce a more
radically safe whole.
In this post, I want to go over the new design and show how it leads to a more flexible kind of safe, shared
mutability that is expressive enough to even support _cyclic mutability_ safely.

[^low-level]: Low-level is always a contentious term. I'm using it here to mean a language with unboxed
types by default and no pervasive GC. If you have a preferred definition, let me know!

---
# Aside: What was wrong with Ante's previous rules?

I imagine most will not be familiar with Ante's old borrow checking rules, but for those curious I'll
lay out some more motivations for the change. If this isn't you, feel free to skip this section.

The [original article](/blog/safe_shared_mutability/) mentions Ante's `ref` and `mut` references as being
`&Cell<T>` analogues in a way, and this has largely remained true at its core. Most of the extensions
made since then were to extend this in some way, notably by introducing "local uniqueness" where a shared
mutable reference only needed to be _locally unique_ to be used where a `uniq` reference (think `&mut T` in Rust)
was expected. This meant the compiler only needed to show that any variable used at the same time as a `mut String`
did not mutably alias it. This ended up taking the form of a `Distinct a b` trait which was implemented if
`a` did not occur anywhere within `b`. For example, if you use a `Vec Foo` at the same time a `mut String` is
treated as a `uniq String`, the compiler would check a `Distinct String (Vec I32)` constraint in the background.
Since a `String` can't occur within a `Vec I32`, the code is allowed and the `String` is locally unique. This
would be repeated for each variable used while the converted `uniq String` reference was still alive.

Allowing what is essentially a `&Cell<T>` to `&mut T` conversion like this was great for flexibility but had a few major flaws:
- Common types like `String` would occur within other types more often making them more difficult to use
compared to less common types when converted into a `local uniq` reference.
- `Distinct a b` recurs into every field of `b`, including private fields. This meant adding a private
field to a public struct in a library was a breaking change since it could make previously valid local unique
conversions invalid.
- Converting between `mut` and `local uniq` happened often, and was confusing even though the compiler
did it automatically.
- It relied on four reference types: `ref` and `mut` which allow shared mutability, and `imm` and `uniq` which don't.

It wasn't all bad though. Notably, it was powerful enough to encode _safe, cyclic mutability_, with the caveat
that some `Rc` values had to be cloned (have their reference count incremented) during traversal.

For the reasons above though, it was clear the design had to change. The rest of the article is about the
new design I eventually landed on which fixes all of these issues, but still keeps the good parts
like safe, cyclic mutability[^cyclic-perf].

[^cyclic-perf]: The new design is actually more efficient for cyclic mutability! It doesn't require the clones
the previous design did.

---
# Why Shared Mutability?

Since many Rustaceans are skeptical on the value of shared mutability at all, it's worth reiterating
why being more lenient here is useful. More lenience means:

- Fewer borrow checker errors. Fewer errors both eases the learning curve for
new users and speeds up iteration times for experienced ones.
- More design patterns are allowed. The observer pattern is difficult to get working without shared
mutability. Cyclic types can also be more directly represented.
- Existing design patterns can have fewer workarounds. Fewer forced indices into vectors in particular.
While this can be a useful pattern, I don't believe the language should force users into this approach.
- More straightforward interop with other languages that also support shared mutability.

The last point in particular is more important than it seems. Ante is meant to be opt-in to ownership
to some extent so that by default using it feels more like C# than it does Rust. This is an aspirational
goal but allowing shared mutability greatly helps here.

---
# The Core Problem

Why are some cases of shared mutability safe, like:

```ante
safe (var pair: String, String) =
    name = ref pair.first
    pair.first := "Foo"
    println name  // Ok!
```

While others are not?:

```ante
unsafe (vec: mut Vec t) =
    elem = vec.get 1
    vec.clear ()
    println elem  // Dangling ref!
```

The difference is in what I call _shape stability_. If the shape of a type is stable, then there is no way
to mutate it such that a previously valid reference into it becomes invalid. Picturing the references
in memory helps here. Let's look at how `pair` and `name` look in memory:

```
Before mutation:

      name
       |
       V
pair: ((first_ptr, first_len, ..), (second_ptr, second_len, ..))


After mutation:

      name
       |
       V
pair: ((first_ptr, first_len, ..), (second_ptr, second_len, ..))
```

Each `String` is an unboxed tuple of `ptr, len, metadata`, and each component of the
outer pair is also unboxed. With this layout, there's no way we could mutate `pair`
to invalidate `name`!

Looking at `vec` and `elem` however, we see a clear difference:

```
Before mutation:

vec: (data_ptr, length, capacity)
          |
          V
          [0, 1, 2, 3]
              ^
              |
             elem


After mutation:

vec: (data_ptr, length, capacity)
          |
          V
          []
              ^
              |
             elem
```

`elem` is clearly dangling! The problem here is mutating `vec` can mutate `data_ptr`, causing
it to potentially point elsewhere when it is reallocated. Its shape has changed,
leaving `elem` stranded.

It'd be nice if we could encode this stability relationship in reference types in a succinct
way - then we could do away with uniqueness in favor of a much more accurate restriction that
rejects less valid code.

---
# Places Over Lifetimes

The first core part of the puzzle is the use of _places_ instead of lifetimes.

Unlike a lifetime which is some arbitrary symbol representing an abstract region of code a
variable or reference is valid for, a place is the exact set of places a reference may borrow
from:

```ante
foo (x: I32) (y: I32): Unit =
    r1: ref 'x I32 = ref x
    r2: ref 'y I32 = ref y

    r3: ref '(x, y) I32 =
        if true then ref x else ref y
```

Above, `r1` borrows from only `x` so it has the place `'x`. Similarly, `r2` borrows from only `y`
so it has the place `'y`. `r3` may borrow from `x` or `y` so its place is the union of both: `'(x, y)`.
Places can also be paths such as `'z.bar` to represent a reference borrowing from the struct field
`bar` on a variable `z`.

Places don't always name variables, there are anonymous places as well such as those for a reference
to a temporary like `ref 2`, but that's not important for this article.

> Places make borrow checking easier in general too!
> Borrow checking in Ante is actually very simple: whenever a value is used, error if any place it
> refers to has already been moved. There is truthfully
> a little bit more to it than that, but that really is the core and it can be implemented in only
> a few lines of code.

---
# Unstable Places

Once we have places we can model _unstable_ places with a simple marker: `!`.
An unstable place like `a!` will be invalidated by any mutation to the place `a`.
This also means if we have 20 variables with place `a!`, we can mutate them all simultaneously
since mutating them would only invalidate variables with place `a!!`.

This is a bit abstract though, so let's see how this works in practice. Starting off, we have some
Rust code which should be safe but gets rejected by the compiler:

```rs
fn rejected(v: &mut Vec<String>) {
    // error: cannot borrow `*v` as mutable more than once at a time
    let (first, last) = (v.first_mut().unwrap(), v.last_mut().unwrap());
    *first = "Mutate first".to_string();
    println!("{last}");
}
```

Rust's compiler rejects this even though it would be safe to mutate an element, then print
another separately after retrieving it again. Theoretically, even if the first element is also
the last, this code should still be valid.

We can model this in Ante by flagging any references to returned elements of a vector as _unstable_:

```ante
Vec.first_mut (v: mut Vec t): mut 'v! t can Fail = ...
Vec.last_mut  (v: mut Vec t): mut 'v! t can Fail = ...
```

Now, we can write the equivalent of `rejected` just fine:

```rs
not_rejected (v: mut Vec String) =
    first, last = v.first_mut (), v.last_mut ()
    first.* := "Mutate first"
    println last  // ok!
```

Above, `first` and `last` both have the type `mut 'v! String` so when we mutate `first`
it would prevent us from using anything with a place of `v!!`, but nothing does. So we're
free to use both `first` and `last` even if they alias.

> Whether a reference is unstable or not is inferred in practice and doesn't need to
> be a manual choice by users. Any reference through a tagged union or element of a collection
> type will be unstable for example.

---
# Exclusivity

It's possible to write functions that are only valid if certain parameters don't alias:

```ante
a_and_b_cant_alias (a: mut Vec String) (b: mut Vec String) =
    elem = a.first_mut ()
    b.clear ()
    println elem
```

In cases like these the compiler still needs some kind of exclusivity rule. In this case,
when a parameter is mutated the compiler needs to ensure the caller of the function gives
a unique value for it:

```ante
bad_caller (c: mut Vec String) =
    // error: 'a cannot alias 'b in this use of a_and_b_cant_alias, but 'c was used for both
    a_and_b_cant_alias c c
```

To check for this, whenever a mutation occurs the compiler issues a `Mutate 'p` effect
which tags a function with the places that may be mutated. At callsites, each place that
may be mutated must be unique from other places instantiated[^note].

[^note]: Any places that were already `'p` are actually okay. The body of the function
would already be aware of and check those cases. This enables patterns like passing
in an immutable container and a mutable reference inside the same container.

---
# Shared Mutability

We can use unstable places to safely allow mutating shared pointers like a `Rc<T>` in Rust.

The first realization is that since our analysis is based on places, `Rc` needs a place
to represent the shared element: `Rc 'p t`. This isn't needed on other
pointer types like `Box`, but for `Rc`, this extra parameter `'p` is necessary to link
separate clones of the same value to the same internal value.

When modeling getting a mutable reference into the interior of an `Rc`, we need to make
use of a union of places from earlier:

```ante
Rc.get (rc: mut 'outer (Rc 'inner t)): mut '(outer!, inner) t = ...
```

This type says that if we have a mutable reference to an `Rc`, we can get a mutable
reference to the inner element. This returned reference will have two places: `outer!`
(unstable because we're crossing through a shared pointer boundary, and the `Rc` value
itself may be swapped out), and `inner` - the
shared value pointed to by every clone of this `Rc`.

Let's try an example:

```ante
mutate_rc_bad (rc1: mut Rc 'p (Vec String)) (rc2: mut Rc 'p (Vec String)) =
    // string_ref: mut '(rc!!, p!) String
    string_ref = rc1.get () |> Vec.first_mut

    // Mutates 'p, so string_ref with unstable 'p! is invalidated
    rc2.get () |> Vec.clear

    println string_ref  // error! string_ref 
```

Great! We can safely mutate through an `Rc` value with no runtime checks, and the
compiler still has our back if we try to do something unsafe. Is this enough
to represent even cyclic references though? Spoiler: yes.

---
# Cyclic Mutability

For cyclic mutability we need... well nothing else! We can just
start using `Rc` to form cycles[^leak].

```ante
type List 'p t =
   | Nil
   | Cons t (Rc 'p (List 'p t))

main () =
    var f = Rc.of (Cons false (Rc.of Nil))  // false -> []
    var t = Rc.of (Cons true f)             // true -> false -> []
    if f is Cons _ tail then
        // tail's places are '(f!!, a!), so it'd be invalidated by any mutation to f or the shared place 'a.
        // The later 'a invalidation is important to prevent us from using it if we mutate any other shared node.
        tail := t

    emit_list t
        |> take 5
        |> iter println  // true, false, true, false, true

// The `do` here is unrelated, it just returns a thunk to be used as a generator function
emit_list (l: ref List t) = do
    if l is Cons elem tail then
        emit elem
        emit_list tail
```

To my knowledge, no other borrow-checked language can safely represent cyclic mutation
without runtime checks like this![^actually]

If we wanted, we could even use `shared mut type` sugar to simplify things a bit, see
[the relevant section in the docs](/docs/language#shared-mutable-types) for that.

[^eh]: The actual representation is configurable between `Rc` and other shared
pointer types, including opting in to a tracing GC (unimplemented!).

[^leak]: Using `Rc` to form cycles still leads to leaks! Some other collection
mechanism is needed to prevent leaks, but that is a separate issue from the
mutability of a cycle.

[^actually]: Ante could actually represent it in its previous system as well, but these new rules
tracking unstable places allow us to do it even more efficiently without incrementing reference counts.

---
# Summary

This was a lot! Thanks for anyone sticking around to the end! It's a lot to grok at once but despite the length
this article ended up being I do think the core concepts aren't that complex. The main mental model is in keeping
track of the _places_ a reference may borrow from, and whether any are unstable.

This article is mostly a restating of ante's [shared mutability rules](/docs/language#Shared-Mutability-and-Stability)
in its documentation, but I wanted to write an article version of it to follow up the original shared mutability article and
to speak on some motivations behind the change.

If any of this interests you, join [Ante's Discord](https://discord.gg/NPJncGBAws) to keep up with the language and ask me questions!
You can also clone the compiler at [github page](https://github.com/jfecher/ante) to try out the language yourself.
