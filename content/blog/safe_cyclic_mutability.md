+++
authors = ["Jake Fecher"]
title = "Borrow Checking Zero-Cost Cyclic Mutability"
date = "2026-10-19"
categories = ["mutability", "thread safety", "memory management"]
banner = "img/banners/antelope_canyon2.jpg"
+++

Ante is a low-level[^low-level] functional language built on ownership semantics and borrowing, similar to Rust.
Unlike Rust, however, a core goal of Ante is to be more lenient in its borrow checker, notably by relaxing Rust's
rule that you can either alias a reference or mutate it, but never both at the same time.

```rs
// In Rust:
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
mutability that is expressive enough to support _cyclic mutability_ and _complex data flow_ safely.

[^low-level]: Low-level is always a contentious term. I'm using it here to mean a language with unboxed
types by default and no pervasive GC. If you have a preferred definition, let me know!

---
# Why Shared Mutability?

Since many Rustaceans are skeptical of the value of shared mutability at all, it's worth reiterating
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
# Aside: What was wrong with Ante's previous rules?

I imagine most will not be familiar with Ante's old borrow checking rules, but for those curious I'll
lay out some more motivations for the change. If this isn't you, feel free to skip this section.

<details>
<summary>I am not most readers</summary>

The [original article](/blog/safe_shared_mutability/) mentions Ante's `ref` and `mut` references as being
`&Cell<T>` analogues in a way, and this has largely remained true at its core. Most of the extensions
made since then were to extend this in some way, notably by introducing "local uniqueness" where a shared
mutable reference only needed to be _locally unique_ to be used where a `uniq` reference (think `&mut T` in Rust)
was expected. This meant the compiler only needed to show that any variable used at the same time as a `mut String`
did not mutably alias it. This ended up taking the form of a `Distinct a b` trait which was implemented if
`a` did not occur anywhere within `b`. For example, if you use a `Vec I32` at the same time a `mut String` is
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
like safe, cyclic mutability[^cyclic-perf] and thread-safety.
</details>

[^cyclic-perf]: The new design is actually more efficient for cyclic mutability! It doesn't require the clones
the previous design did.

---
# The Core Problem

Why are some cases of shared mutability safe, like:

```ante
my_safe_fn (var pair: String, String) =
    name = ref pair.first
    pair.first := "Foo"
    println name  // Ok!
```

While others are not:

```ante
my_unsafe_fn (vec: mut Vec t) =
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

`elem` is clearly dangling! The problem here is that mutating `vec` can mutate `data_ptr`, causing
it to potentially point elsewhere when it is reallocated. Its shape has changed,
leaving `elem` stranded.

It'd be nice if a reference type could remember whether it's pointing at something stable or
unstable - then we could do away with uniqueness in favor of a much more accurate restriction that
rejects fewer valid programs.

---
# Places Over Lifetimes

The first core part of the puzzle is the use of _places_ instead of lifetimes.

Unlike a lifetime which is some arbitrary symbol representing an abstract region of code a
variable or reference is valid for, a place is the exact set of things a reference may borrow
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

Places don't always name variables. There are anonymous places as well such as those for a reference
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

Rust's compiler rejects this even though there is no way we can mutate `first` which would invalidate `last`.
Theoretically, even if the first element is also the last, this code should still be valid[^rusty].

We can model this in Ante by flagging any references to returned elements of a vector as _unstable_:

```ante
// Declare a `first_mut` method taking a mutable vector and returning
// an unstable reference inside 'v to the first element
Vec.first_mut (v: mut Vec t): mut 'v! t can Fail = ...
Vec.last_mut  (v: mut Vec t): mut 'v! t can Fail = ...
```

Now, we can write the equivalent of `rejected` just fine:

```ante
not_rejected (v: mut Vec String) =
    first, last = v.first_mut (), v.last_mut ()
    first.* := "Mutate first"
    println last  // ok!
```

Above, `first` and `last` both have the type `mut 'v! String` so when we mutate `first`
it would prevent us from using anything with a place of `v!!`[^nesting], but nothing does. So we're
free to use both `first` and `last` even if they alias.

> Whether a reference is unstable or not is inferred in practice and doesn't always need to
> be a manual choice by users. Any reference through a tagged union or element of a collection
> type will be unstable for example.

[^rusty]: It wouldn't be sound in Rust since multiple `&mut` references to the same
data would violate aliasing assumptions, but it should be in our target semantics!

[^nesting]: `!` on places can nest! `'foo!` is an unstable place within `'foo` while `'foo!!`
would be an unstable place within that previous unstable place. This could be, for example, a
String element of a `Vec (Vec String)`. If a type has multiple sources of instability (e.g. a
struct holding multiple vectors), an API designer may choose to expose the separate fields, e.g.
`'foo.bar!` vs `'foo.baz!`, or may choose to hide this by coercing to the parent place `'foo!`.

## Loops

Loops and branching in general are fairly straightforward. They largely follow the same rules
ownership has where an error is issued if a variable declared outside of the loop is
invalidated within it:

```ante
var v = Vec.of [1, 2, 3]
one = v.get 0

for _ in 0 .. 3 do
    println one  // error: one may be invalidated by a later mutation in the for loop
    v.clear ()   // note: one invalidated here
```

Similarly, any closure which invalidates any part of its captured environment is treated
as a `FnOnce` in Rust terms, preventing it from being called more than a single time.

> Ante has effect handlers too! Control-flow for them is more complex and the rules
> for how they interact with invalidations of unstable places are [documented here](/docs/language/#in-traits-and-effect-handlers),
> but are subject to change (I think they're a bit hacky). Note that `handle` interactions
> with unstable places are (at the time of writing) still unimplemented.

---
# Exclusivity

It's possible to write functions that are only valid if certain parameters don't alias:

```ante
a_and_b_cant_alias (a: mut Vec String) (b: mut Vec String) =
    elem = a.first_mut ()
    b.clear ()
    println elem  // ok! But how?
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
which tags a function with the places that may be mutated. At call sites, each place that
may be mutated must be distinct from other places instantiated[^note]. Note that `mut` itself
still allows arbitrary aliasing. It is only when an actual mutation occurs and `Mutate 'p` is
issued does the compiler check call sites that any generic used doesn't become `'p` while it
is still in scope.

## Use vs Mention

`Mutate 'p` is an example of a _use_ vs _mention_ distinction. Code which merely mentions
mutability isn't subject to any uniqueness constraints. This is most notable since places
can be paths so we may pass an entire `mut Context` to a function but it may only `Mutate 'ctx.field`.
This scenario often occurs when iterating mutably over a field of some context value:

```ante
type Entity = name: String, health: I32
type Context = entities: Vec Entity, events: Vec String, score: U32

Context.on_death (ctx: mut Context) (entity: ref Entity): Unit
    can Mutate 'ctx.events
=
    ctx.score += 10
    ctx.events.push "${entity.name} died"

iterate_example (ctx: mut Context) =
    for entity in ctx.entities do
        entity.health -= 1
        if entity.health <= 0 then
            ctx.on_death entity  // ok!
```

In Rust the above code would be rejected, but there are actually several options in Ante.
You can expose `Mutate 'ctx.events` on `Context.on_death` above, guaranteeing only that
field may be mutated (`ctx.score` doesn't need a similar annotation because mutating integers
can never invalidate references), or you can tell `on_death` that `entity` may be stored
within `ctx` to begin with:

```ante
Context.on_death (ctx: mut Context) (entity: ref 'ctx.entities! Entity): Unit
    can Mutate 'ctx
=
    ctx.score += 10
    ctx.events.push "${entity.name} died"
```

Above, we're saying all of `'ctx` may be mutated. For this specific example, this is less
desirable since it'd mean `entity` as an unstable reference wouldn't be valid after the
call to `on_death` ends. For other patterns of code though, we may truly need to mutate
all of `'ctx` or keep it opaque[^opaque] and this would be exactly what we'd want.

[^note]: Any places that were already `'p` are actually okay. The body of the function
would already be aware of and check those cases. This enables patterns like passing
in an immutable container and a mutable reference inside the same container.

[^opaque]: Future versions of Ante will allow for 'abstract places' where structs could
declare a set of places inside of them to expose, separate from their actual fields.
Library authors wanting to hide specific struct fields while keeping multiple places
within the same struct distinct from each other in usual code could make use of this.
The downside is that since these aren't connected to specific struct fields, it'd be
up to the library author to keep the translation to abstract places sound.

## Complex Data-Flow

Taking a bit of a step back, I want to show a bit how powerful it is to reframe
borrow checking in terms of _places_ and _mutations_ rather than lifetimes. Because
lifetimes are tied to a region of code, Rust can struggle with complex data-flow:

```rs
fn get_default<'r, K: Hash + Eq + Copy, V: Default>(
    map: &'r mut HashMap<K, V>,
    key: K,
) -> &'r mut V {
    match map.get_mut(&key) {
    //    --- first mutable borrow occurs here
        Some(value) => value,
        None => {
            map.insert(key, V::default());
            //  ^~~~~~ error[E0499]: cannot borrow `*map` as mutable more than once at a time
            map.get_mut(&key).unwrap()
        }
    }
}
```

With Rust's current model, getting the above code working requires a next-gen borrow checker
called [Polonius](https://goals.rust-lang.org/2026/polonius.html) which models lifetimes as
something much closer to places (alias sets) than regions of source code.
In Ante, it just works:

```ante
get_default
    (map: mut 'r HashMap k v)
    (key: k)
    {Hash k} {Eq k} {Copy k} {Default v}
: mut 'r! v can Mutate 'r, Panic =
    match try do map.get_mut key
    | Some value -> value
    | None ->
        map.insert key (default ())  // ok!
        map.get_mut key ~> panic_on_fail
```

Ante's borrow checker is already based on places and thus doesn't try tying references
to any particular region of code. Instead, since the returned element reference from `map.get_mut`
is unused in the `None` branch, it doesn't need to be verified at all.
This should make some intuitive sense. If the reference is never used, it shouldn't matter whether
it's dangling or not.

Let's look at another example:

```rs
struct Thing;

impl Thing {
    fn maybe_next(&mut self) -> Option<&mut Self> { None }
}

fn main() {
    let mut temp = &mut Thing;

    loop {
        match temp.maybe_next() {
        //    ^^^^ error: `*temp` was mutably borrowed here in the previous iteration
        //         of the loop first borrow used here, in later iteration of loop
            Some(v) => { temp = v; }
            None => { }
        }
    }
}
```

Above, Rust thinks the `maybe_next` borrow may last longer than the loop itself due
to the `temp = v;` assignment to a variable defined outside of the loop.

```ante
type Thing = x: Unit

Thing.maybe_next (_: mut Thing): Maybe (mut Thing) = None

main () =
    var temp = mut Thing ()

    while true do
        match temp.maybe_next ()  // ok!
        | Some v -> temp := v
        | None -> ()
```

Meanwhile, the equivalent Ante code is okay since `temp` gets some anonymous place `'p`,
`maybe_next` returns the same `'p`, and the mutation would only invalidate any _unstable_
references to `'p`.

---
# Shared Mutability

We can use unstable places to safely allow mutating shared pointers like an `Rc<T>`
(reference-counted pointer) in Rust.

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
    // string_ref: mut '(rc1!!, p!) String
    string_ref = rc1.get () |> Vec.first_mut

    // Mutates 'p, so string_ref with unstable 'p! is invalidated
    // note: string_ref may be invalidated by this mutation
    rc2.get () |> Vec.clear

    // error: string_ref may have been invalidated by an earlier mutation
    println string_ref       
```

Great! We can safely mutate through an `Rc` value with no runtime checks, and the
compiler still has our back if we try to do something unsafe. Is this enough
to represent even cyclic references though?

---
# Cyclic Mutability

For cyclic mutability we need... well, nothing else! We can just
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
        // The latter 'a invalidation is important to prevent us from using it if we mutate any other shared node.
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

This pattern is very similar to using [GhostCell](https://plv.mpi-sws.org/rustbelt/ghostcell/) in Rust,
but in a more ergonomic (no more `GhostToken`), built-in way. I'll also emphasize that these checks are
_entirely static_ with _no runtime checks_.

If we wanted, we could even use `shared mut type` sugar to simplify things a bit. See
[the relevant section in the docs](/docs/language#shared-mutable-types) for that.

[^leak]: Using `Rc` to form cycles still leads to leaks! Some other collection
mechanism is needed to prevent leaks, but that is a separate issue from the
mutability of a cycle.

# Note on Multi-threading

With more permissive shared mutability, how does Ante maintain thread-safety?

There's not a very interesting answer here. Ante simply copies Rust's `Send`/`Sync` traits.
`ref`/`mut` references both allow for shared mutability and thus implement neither trait.

Instead, Ante has additional reference kinds `imm` and `uniq` which correspond to Rust's
`&` and `&mut`. These references are _very rarely used_ - they're more or less only used
in multi-threaded code where after passing a thread boundary they can degrade back to `ref`/`mut` 
to call functions.

> In the future, the kind of a reference will be attached to the place variable to more easily
> write code which is polymorphic over any reference kind.

---
# Summary

This was a lot! Thanks to anyone sticking around to the end! It's a lot to grok at once but despite the length
this article ended up being, I do think the core concepts aren't _that_ complex. There are certainly rules to be
had but most are in service of making the language more flexible and making more code "just work." The main
mental model is keeping track of the _places_ a reference may borrow from, and whether any are unstable.

This article is mostly a restating of Ante's [shared mutability rules](/docs/language#shared-mutability-and-stability)
documentation, but I wanted to write an article version of it to follow up the original shared mutability article and
to speak on some motivations behind the change.

If any of this interests you, join [Ante's Discord](https://discord.gg/NPJncGBAws) to keep up with the language and ask me questions!
You can also clone the compiler at [GitHub page](https://github.com/jfecher/ante) to try out the language yourself.
If you are interested in the project, the best way to help would be to help spread the project around
to get some more visibility on it! Contributing would be appreciated as well of course (the compiler is small and I can help)!
