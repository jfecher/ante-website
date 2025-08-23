+++
authors = ["Jake Fecher"]
title = "More on Safe, Aliasable Mutability with Unboxed Types"
date = "2025-08-21"
categories = ["mutability", "thread safety", "memory management"]
banner = "img/banners/antelope_flowers_cropped.jpg"
+++

This post is an exploration on some additional possible semantics for mutability (and immutability).

# Introduction

---

In my first blog post I introduced `&shared mut` references as a way to achieve safe, shared mutability
in a language with unboxed types. For those unfamiliar with them, I encourage you to start with
[the first blog post](/blog/safe_shared_mutability). As a brief summary though, I started with Rust's
system with owned mutable references which I referred to as `&own mut`, and added on `&shared mut` from
there. `&shared mut` references allow mutation and aliasing but disallow obtaining a reference into any shape-unstable members
where shape-unstable is defined as any member in which a mutation may cause it to be dropped. Think of an
optional string value (`Maybe String`) where the inner String will be dropped if the outer value is mutated
to `None`.

Summary out of the way - there is an issue with the previous blog post! Namely, it details _one_
method of shared mutability, but more than one zero-cost method exists! Perhaps even more egregious,
this new method has much more obvious semantics than the `shared` references from the first post.

---

# Syntax

Before we get further into it I'll give a note on syntax since Ante's syntax has changed since the original
post. In today's Ante, `&t` is an immutable reference to a type `t`, while `!t` is a shared mutable reference to
a type `t`, and `!own t` is a Rust-style owned mutable reference to `t`. To avoid confusion though, I'll always refer
to shared mutable references as `!shared t` in this post.

---
# Get to the Point

The kind of mutable reference that I missed originally is what I'm calling a shape-stable mutable reference: `!stable t`.
This reference (unlike `!shared t`[^naming]) does let you project a reference into any member of the type but restricts
mutation to only shape-stable changes such that nothing can be dropped. With this for example, you can pattern
match on tagged-union values as deep as you want and mutate an integer you find within.

To highlight how this compares to other kinds of mutable references, here's a comparison:

| Reference Type | Shape-stable Mutations | Shape-unstable Mutations | Shape-stable projections | Shape-unstable projections | Copy |
|----------------|:----------------------:|:------------------------:|:------------------------:|:--------------------------:|:----:|
| `!shared t`    |            ✓           |             ✓            |             ✓            |              X             |   ✓  |
| `!stable t`    |            ✓           |             X            |             ✓            |              ✓             |   ✓  |
| `!own t`       |            ✓           |             ✓            |             ✓            |              ✓             |   X  |
| `&Cell t`      |            ✓           |             ✓            |             X            |              X             |   ✓  |

Alternatively, you can think about these in terms of what operations they'd support on a `Vec t` (growable array) type:

| Reference Type  | push, pop | Retrieve a mutable reference to an element | Trivially[^1] retrieve mutable references to two elements   |
|-----------------|:---------:|:------------------------------------------:|:--------------------------------------------------------:|
| `!shared Vec t` |     ✓     |                      X                     |                             X                            |
| `!stable Vec t` |     X     |                      ✓                     |                             ✓                            |
| `!own Vec t`    |     ✓     |                      ✓                     |                             X                            |
| `&Cell (Vec t)` |   ~[^0]   |                      X                     |                             X                            |

This table looks a bit different because vectors don't have any shape-stable projection or mutations.
If users were allowed to access the integer length or capacity fields directly these would be shape-stable,
but allowing users to mutate them directly could break invariants of course.


[^naming]: Perhaps `!shared t` should be called `!unstable t` since it can mutate unstably.
[^0]: Via `Cell::replace` or similar, then using other kinds of mutable references on the resulting owned value
[^1]: Without proving disjointness of each index

In the original post I mentioned that `!shared t` is effectively a built-in version of `&Cell t`. Now, although we may also think of
`!stable t` as a variant on `&Cell t`, we can see above that `!stable t` is not `!shared t`, and neither
is quite the same as `&Cell t`. I think these differences speak to the value of these constructs not necessarily for
real-world usability (since Ante is still in its early stages) but in creating a language to communicate different safe
mutability schemes. Both `!stable t` and `!shared t` better communicate intent versus a `&u` where `u` uses interior mutability:

```ante
type FooCell =
    x: Cell U32
    y: Option String

type FooPlain =
    x: U32
    y: Option String

// Is x mutated? Maybe..
bar1 (x: &FooCell) = ...

// Is x mutated? No!
bar2 (x: &FooPlain) = ...

// Is x mutated? Almost definitely!
// Insights: only integers or plain-old-data is likely to be mutated (`y` is safe).
bar3 (x: !stable FooPlain) = ...

// Is x mutated? Almost definitely!
// Insights: whatever is mutated won't be within a shape-unstable member of the type.
// So the `String` inside `y` won't be directly mutated but the outer `Option` may be!
bar3 (x: !shared FooPlain) = ...
```

---

# Interior Mutability

One mild annoyance I have with rust that is based more on theoretic grounds rather than an actual practical
concern is that its immutable references aren't actually immutable:

```rust
// Does this mutate bar? Maybe! We'd need to know if there are any types providing internal mutability within `Bar` to be sure.
fn foo(bar: &Bar) {...}
```

Once you opt for interior mutability on a type you lose valuable information in type signatures on whether
that function may mutate your type or not.

I think shared, mutable references have the potential to be a solution here. After all, they largely share the same use
as interior mutability types: providing shared mutability. For example, let's consider the `Clone` trait which requires
an immutable reference in Rust despite the existence of types like `Rc t` which need to be mutated to be cloned. If we
change this trait to accepts a mutable parameter as a `!stable t` instead, we can implement it soundly while still
allowing aliasing:

```ante
// Imagine if `Clone` took a `!stable t` parameter instead of `&t`:
impl Clone (Rc t) with
    clone (rc: !stable Rc t): Rc t =
        rc.internal_reference_count += 1
        as_ptr self |> deref
```

That being said, changing `Clone` to the signature above would mean it'd be impossible to clone immutable references - unless
we allow coercing `&t` to `!stable t` - which would defeat the point of immutable references in the first place I think.

It'd also be somewhat unsatisfactory if a trait like `Clone`, which conceptually is not supposed to mutate its parameters, takes
a mutable reference to its data because of corner cases like `Rc t` where mutation is required. Should the general case be less
clear due to the existence of corner-cases? Taking this to its logical extent, nearly all traits which accept immutable reference
parameters should actually accept some kind of shared, mutable parameter instead just for the rare exception where they are required.
Perhaps something like `Rc t` is best implemented with an explicitly interior-mutable counter such as `Cell U32` after all.

---

## Another Immutable Reference?

So if `Cell t` and other interior-mutability types are still useful to provide an exception for mutating an otherwise immutable
reference, would it be useful to tackle the problem from the other end by providing _actual_ immutable references to the few
methods where it is a requirement? For example, we may have a library which stores arbitrary user-data where it would be
unsafe to mutate it, but we want to give out a reference to it anyway:

```ante
type MyBTreeMap k v = ...

// Retrieve a reference to the first (key, value) pair in the map
MyBTreeMap.first (self: &MyBTreeMap): (&k, &v) can Fail = ...
```

The above interface would be unsafe since `k` may contain interior mutability and the user may mutate it, interfering with
the internal invariant that keys within our map are stored in an ordered fashion. A proper API would return a wrapper type
instead which re-orders the map anytime the user mutated the key. Alternatively, if we had another kind of reference, let's
call it `&imm t` which disallows _all_ mutations, even those through interior mutable types, then the API would be safe, right?

```ante
type MyBTreeMap k v = ...

// Retrieve a reference to the first (key, value) pair in the map
MyBTreeMap.first (self: &MyBTreeMap k v): (&imm k, &v) can Fail = ...
```

Well... no. As long as we can retrieve an owned version of the same underlying value and mutate that, we still have the
same problem:

```ante
bad (map: &MyBTreeMap (Rc I32) v) =
    key, _ = map.first ()

    // uh-oh, no more &imm
    mut key_clone: Rc I32 = clone key
    @key_clone := 32  // nothing to trigger `map` to re-order
```

So a `&imm t` type alone would not actually gain us anything of value. To be useful it'd need to be an infectious _mode_
so that it applies to all values (not just references) such that not even a `clone` may remove it:

```ante
MyBTreeMap.first (self: &MyBTreeMap k v): (imm &k, &v) can Fail = ...

bad (map: &MyBTreeMap (Rc I32) v) =
    key, _ = map.first ()

    // Still get an `imm` now when cloning
    mut key_clone: imm Rc I32 = clone key
    @key_clone := 32  // error: mutating an immutable value
```

When thinking about this type my original thought was that it must be thread-safe even if it contained types with interior
mutability. After all, mutations should be blocked on those types like they are in the example above. Unfortunately,
it still isn't thread-safe. It's possible to use ye olde Rc trick:

```ante
data = Arc.of <| Cell.of <| Vec.of [1, 2, 3]

// Even if we need an owned value to make an `imm` wrapper, this is still unsound
imm_data = imm clone data

spawn_thread fn () ->
    foo &imm_data

// The original still isn't imm so we can mutate the inner Cell
data.set (Vec.new ())
```

Mutating a value in one thread while another reads it is generally an ungood thing to do.

Preventing this requires the `t` in `imm t` have the usual `Send`/`Sync` requirements when used in multiple threads.
Without thread-safety, `imm t` would be an entire additional core language feature, along with a change to the
`Clone` trait, just to prevent interior mutability in some rare cases. So perhaps it is not so useful after all.

---

## Allegations against `!stable t`

If `Cell t` is still needed, is `!stable t` useful at all then when it is effectively just a way to wrap each nested
member with `Cell` automatically?

Maybe.

There are a few advantages `!stable t` has over `Cell t`:
- `!stable t` doesn't require the user change the definition of `t` to add shared mutability for each desired member.
- Due to the above, `t` is still thread-safe (!). Although we of course can't copy `!stable t` to multiple threads
we can still use `&t` just fine. If `t` used `Cell` internally, it wouldn't be safe even with immutable references.
- `!stable t` is easier to add after-the-fact. Consider a user with a type `t` with several methods on it. One day
they add a new method where they discover that one field on the type should really be wrapped in a `Cell`. To
refactor this they will have to change every instance of the field to handle the wrapping and unwrapping
of the outer `Cell` wrapper. Compare this with them using `!stable` mutability instead: they may not need to change
any code at all[^2] and could simply continue writing their method.
- `!stable t` is more discoverable than `Cell t`. This is more of a minor point, but as a dedicated language construct,
`!stable` references may be easier for new users to reach for compared to `Cell`. Although either could easily be
forgotten about, the later also requires remembering useful conversions such as
[`Cell::from_mut`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.from_mut) and
[`Cell::as_slice_of_cells`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.as_slice_of_cells).

That being said, there are some major disadvantages to `!stable t` as well:
- `!stable t` cannot even set a struct to a new value if the struct contains a shape-unstable type like `Vec u`.
With `Cell<T>` in Rust this is possible through [`Cell::set`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.set).
This limits `!stable t` to only the most trivial of mutations in practice.
- Including both `!stable t` and `Cell t` complicates the language for a very small gain.
- If we allow obtaining a `!shared t` from a `Rc t`, it wouldn't be valid to also allow obtaining a `!stable t` from a `Rc t`.
If it was allowed, we could use `!stable t` to project a reference deep into the type, then use a `!shared t` to the
same value to drop the value that's being held. The `Rc t` to `!shared t` conversion is useful to keep but if we have
to remove the `Rc t` to `!stable t` conversion **then `!stable t`'s advantage of being able to project into any type
isn't actually true.**

[^2]: Whether they need to change any code depends on whether they need their mutability to merely be aliasable or
if they really do need to mutate through an "immutable" reference.

---
## Experiment: Can We Track Whether A Type's Interior is Aliased?

The Problem:
- `!stable t` is useful for projecting mutable references into a type, but once we find a mutation we want to
perform, unless it is a very simple one like incrementing an integer, odds are it is shape-unstable and
we cannot actually perform it through a `!stable t`.
- `!shared t` is useful for performing most mutations but traversing through a type requires we clone each time
we step into the shape-unstable interior of a type.

What We Want:
- A way to traverse through a type with `!stable t` then convert to `!shared t` when a mutation is needed.

In theory, this would be sound to do if we can guarantee that the stable reference wasn't used to project
into any field that may be dropped by the shared reference. We want a kind of local uniqueness where we
don't care if any parent nodes in a tree are aliased, but want to ensure that child nodes are not. This
would be the reverse of a `!own t` to `!shared t` or `!stable t` coercion which lets you alias children of the
current value but not any parents.

If we did have such tracking then we could imagine the following code would be invalid:
```ante
lets_trigger_an_error (x: !stable Maybe String) =
    if x is Some s then
        // error: this is a shape-unstable mutation which may drop `s`
        x := None
        // note: `s` still used later here
        print s
```
While the following would be allowed since no shape-unstable references exist when the mutation is performed:
```ante
ok (x: !stable Maybe String) =
    x_alias = x
    if x is Some _s then
        // `_s` is unused so this assignment is ok
        x := None

    print x
    print x_alias
```
We can imagine that the compiler may keep track of this internally using the lifetime variable on references.
Perhaps it could have an internal list of variables in the local scope that share a lifetime along with which,
if any, are projections into a shape-unstable type from another reference. This clues us into an issue with
the above scheme: how should the compiler track aliases which do not share the same lifetime - for example
via a cloned `Rc t`? 
```ante
bad (x: !stable Rc (Maybe String)) =
    x_clone = clone x
    string_ref: &String = match &x_clone
        | Some s -> s
        | None -> panic "oops"

    // Compiler: "Hmm, well `x` doesn't appear to be aliased internally..."
    x := None
    print string_ref // uh-oh! `string_ref` was already dropped
```

There are a couple ways we could fix this, although I don't find any satisfactory:
1. We could disallow projection of `!stable t` into shared types like `Rc t`.
  - This removes one of the only usecases of `!stable t` - its ability to be projected anywhere.
  With this restriction, the already niche `!stable t` would no longer be able to be projected
  into recursive union types for example. If users need shared mutability and are already required
  to clone `Rc t` values, they might as well use `!shared t` instead.
2. We could attach a lifetime to `Rc t` (becoming `Rc a t`... rcat.. reverse-cat.. hmm)
  - This makes lifetimes much more infectious. Something like `LinkedList t` for example would
  now need to be `LinkedList a t` assuming it uses `Rc a t` internally.
  - Since the lifetime is on the type, this now also prevents dynamic-splitting of reference-counted
  data. For example, consider a tree which uses `Rc a Tree` links for each node. If we had `Rc Tree`
  links we would be able to cut off branches from this tree and treat them as two separate trees.
  With `Rc a Tree` links, when we cut off branches, the two resulting trees are still linked via
  the same lifetime variable, preventing independent mutation on both.

---

# Ghost Cell 👻🦠

Yet another type of aliasable mutability which doesn't require runtime support is the well-known
[ghost cell](https://docs.rs/ghost-cell/latest/ghost_cell/ghost_cell/struct.GhostCell.html#). Ghost cells
are pretty cool because they provide a kind of interior mutability that can accomplish anything a `!own t`
can but are also aliasable (or at least a `&GhostCell a t` is) and even thread-safe! The trick is that 
to mutably borrow the data within a ghost cell, you have to provide a
[`!own GhostToken a`](https://docs.rs/ghost-cell/latest/ghost_cell/ghost_cell/struct.GhostToken.html) -
and similarly for borrowing the `t` immutably. This effectively separates permissions from the data such that
all your ownership constraints are now on this separate token you must also pass around.

This gives us some great advantages but also comes with some downsides. Namely:
- In order for each `GhostToken` to correspond to one or more `GhostCell`s, they must both be branded with a
unique type - in Rust's case a unique lifetime is used. This results in similar issues to the `Rc a Tree` experiment
above where recursive data will need to share the same brand, and the data effectively cannot be separated from the
rest of the recursive tree after it is constructed.
