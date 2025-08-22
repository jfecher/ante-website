+++
authors = ["Jake Fecher"]
title = "More on Safe, Aliasable Mutability with Unboxed Types"
date = "2025-08-21"
categories = ["mutability", "thread safety", "memory management"]
banner = "img/banners/antelope_flowers_cropped.jpg"
+++

# Introduction

---

In my first blog post I introduced `&shared mut` references as a way to achieve safe, shared mutability
in a language with unboxed types. For those unfamiliar with them, I encourage you to start with
[the first blog post](/blog/safe_shared_mutability). As a brief summary though, I started with Rust's
system with owned, mutable references which I referred to as `&own mut`, and added on `&shared mut` from
there. `&shared mut` references allow mutation but disallow obtaining a reference into any shape-unstable members
where shape-unstable is defined as any member in which a mutation may cause it to be dropped. Think of an
optional string value (`Maybe String`) where the inner String will be dropped if the outer value is mutated
to `None`.

Summary out of the way - there is an issue with the previous blog post! Namely, it details _one_
method of shared mutability, but there exist more than one (zero-cost) method! Perhaps even more egregious,
it has much more obvious semantics than the `shared` references from the first post.

---

# Syntax

Before we get further into it I'll give a note on syntax since Ante's syntax has changed since the original
post. In today's Ante, `&t` is an immutable reference to a type `t`, while `!t` is a shared mutable reference to
a type `t`, and `!own t` is a Rust-style owned reference to `t`. To avoid confusion though, I'll always refer
to shared-mutable references as `!shared t` in this post.

---
# Get to the Point

The kind of mutable reference that I missed originally is what I'm calling a shape-stable mutable reference.
This reference (unlike `!shared t`) does let you project a reference into any member of the type but restricts
mutation to only shape-stable changes such that nothing can be dropped. With this for example, you can pattern
match on tagged-union values as deep as you want and mutate an integer you find within.

To highlight how this compares to other kinds of mutable references, here's a comparison:

| Reference Type | Shape-stable Mutations | Shape-unstable Mutations | Shape-stable projections | Shape-unstable projections | Copy |
|----------------|:----------------------:|:------------------------:|:------------------------:|:--------------------------:|:----:|
| `!shared t`    |            ✓           |             ✓            |             ✓            |              X             |   ✓  |
| `!stable t`    |            ✓           |             X            |             ✓            |              ✓             |   ✓  |
| `!own t`       |            ✓           |             ✓            |             ✓            |              ✓             |   X  |

Alternatively, you can think about these in terms of what operations they'd support on a `Vec t` (growable array) type:

| Reference Type  | push, pop | Retrieve a mutable reference to an element | Retrieve mutable references to two elements (separately) |
|-----------------|:---------:|:------------------------------------------:|:--------------------------------------------------------:|
| `!shared Vec t` |     ✓     |                      X                     |                             X                            |
| `!stable Vec t` |     X     |                      ✓                     |                             ✓                            |
| `!own Vec t`    |     ✓     |                      ✓                     |                             X                            |

This table looks a bit different because `Vec`'s don't have any shape-stable projection or mutations. If users were allowed to access
the integer length or capacity fields directly these would be shape-stable, but allowing mutating them directly could break invariants of course.

---

# Interior Mutability

`!shared` references were interesting since their inability to project references into shape-unstable types necessitated `Clone` to
be an unsafe trait to still allow cloning these types see the [original post](/blog/safe_shared_mutability). `!stable t` has no
such issue though since it supports all kinds of projections. We can even express something like `Clone (!stable Rc t)` without
any interior-mutability hacks:

```ante
// Imagine if `Clone` required a stable, mutable ref:
impl Clone (Rc t) with
    clone (rc: !stable Rc t): Rc t =
        rc.internal_reference_count += 1
        as_ptr self |> deref
```

I _do_ find it rather unsatisfying how methods which seem to take a variable immutably in Rust may still mutate them after all:

```rust
// Does this mutate bar? Maybe! We'd need to know if there are any types providing internal mutability within `Bar`.
fn foo(bar: &Bar) {...}
```

That being said, changing `Clone` to the signature above would mean it'd be impossible to clone immutable references - unless
we allow coercing `&stable t` to `!stable t` - which would defeat the point of immutable references in the first place I think.

It'd also be somewhat unsatisfactory if a trait like `Clone`, which conceptually is not supposed to mutate its parameters, takes
a mutable reference to its data because of corner cases like `Rc t` where mutation is required. Should the general case be less
clear due to the existence of corner-cases? Perhaps something like `Rc t` is best with an explicitly interior-mutable counter
such as `Cell U32` after all.

---

## `Cell t` Allegations

So `Cell t` is likely still needed, but is `!stable t` useful at all then when it is effectively just a way to wrap each nested
member with `Cell` automatically?

I think so.

There are a few advantages `!stable t` has over `Cell t`:
- `!stable t` doesn't require the user change the definition of `t` to add shared mutability for each desired member.
- Due to the above, `t` is still thread-safe (!). Although we of course can't copy `!stable t` to multiple threads we can still use `&t` just fine. If `t` used `Cell` internally, it wouldn't be safe even with immutable references.
- `!stable t` is easier to add after-the-fact. Consider a user with a type `t` with several methods on it. One day they add a new method where they discover that one field on the type should really be wrapped in a `Cell`. To refactor this they will have to change every instance and usage of the field to handle the wrapping and unwrapping of the outer `Cell` wrapper. Compare this with them using `!stable` mutability instead: they may not need to change any code at all and could simply continue writing their method.
- `!stable t` is more discoverable than `Cell t`. This is more of a minor point, but as a dedicated language construct, `!stable` references may be easier for new users to reach for compared to `Cell`. Although either could easily be forgotten about, the later also requires remembering useful conversions such as [`Cell::from_mut`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.from_mut) and [`Cell::as_slice_of_cells`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.as_slice_of_cells).

---

## `!stable t`, `!shared t`, and `&Cell t`

In both the original post and this post I've mentioned that `!stable t` and `!shared t` are effectively a built-in version of `&Cell t`.
Yet, as the above comparisons have shown, `!stable t` is not `!shared t`, and neither is quite the same as `&Cell t`. I think these differences
speak to the value of these constructs not in real-world usability (since Ante is still in its early stages) but in giving a language to
communicating different safe, mutability schemes. When a user sees a `!stable MyType` or `!shared MyType`, both these types better communicate
intent versus a `&MyType` which uses interior mutability:

```ante
type Foo1 =
    x: U32
    y: String

type Foo2 =
    x: Cell U32
    y: String

// Is self mutated? No!
Foo1.bar &self =
    ... complex bar logic ...

// Is self mutated? Maybe..
Foo2.bar &self =
    ... complex bar logic ...

// Is self mutated? Almost definitely! And in a stable way!
Foo1.baz (self: !stable Foo1) =
    ... complex bar logic ...
```

---

# `!shared t`, Garbage Collection, and Bike-Shedding

`!shared t` versus `!unstable t`

---

# `GhostCell a t`
