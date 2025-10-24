+++
authors = ["Jake Fecher"]
title = "A Vision for Future Low-Level Languages"
date = "2025-10-22"
categories = ["ideals"]
banner = "img/banners/anteater3.jpg"
+++

# A Vision for Future Low-Level Languages

I've had this vision in my head for quite a while now on what code written in a low-level language _could_
look like. This vision has shaped my design of Ante and although I've alluded to it before, I've never explicitly
stated it until now.

Now, what makes a language low-level is a bit contentious. I'm using it here to describe a group of languages
I have no better descriptor for: C, C++, Rust, and Zig, among others. These are languages which programmers often
use because they need more control (and thus predictability) of their compiled code[^low]. They have
a reputation of being difficult to use, but must it be this way? Notably, although these languages allow users
to obtain such control, they don't necessarily always require it[^high]. For example, any of these languages can be
used with one of any number of libraries implementing tracing garbage-collection if so desired. Often the question
is not what is possible but how practical it is to get what you want done.

So must a low-level language really be constrained to only low-level code? I don't think so. What I'm imagining
for the future of these languages is for a language to better support both high and low-level use cases.
One should be able to program in a high-level style without worrying about the details and should
still be able to program at a lower level when desired - for example when writing tight loops or efficient
libraries. This is a pattern I call "high-level shell, low-level core."
Such a pattern already occurs in Python, for example, where libraries are often written in C for greater performance.
I just think it's possible for one language to do both.

---

# A Vision for Ante

For me that language is Ante. It doesn't have to be of course - perhaps the project will run out of steam or simply
crawl along too slowly and be outpaced by others. Even so, my hope is that by sharing this vision, more people
may understand where I'm coming from in desiring a new language to fill this gap.

> Code snippets in the rest of this article will be written in Ante, which is still in development so any
> code is subject to change in the future. Don't worry too much if you're unfamiliar
> with the language - this post is written so hopefully anyway can follow along. What is important is exploring
> the idea that we can wrap otherwise low-level code in a nice looking bow.

---

## A High-Level Shell

Even for otherwise low-level languages, having a high-level shell is important because it decreases friction, allowing
programmers to spend less time on mundane parts of their program and more time on the actually important parts. It also allows new
developers to learn a subset of the language more quickly which can help in larger teams where not everyone
needs to be an expert.

Can a low-level language even achieve the same kind of ease of use as a higher-level one though? Maybe not entirely,
but I do think we can get much closer than the state of the art today where there are large usability gaps between the two.
The first observation is that higher-level languages are often easier to use because their types are boxed by default
(ie. shared by default) and they have tracing garbage collectors. This already isn't impossible to achieve in a lower-level
language though - after all those languages can have boxed types as well (`Rc<T>`, `shared_ptr<T>`, etc.), and they can
even have tracing garbage collectors as libraries. That being said, a tracing GC is probably not strictly necessary as long
as there is some mechanism to free space.[^rcperf]

Now, let's look at the following Ante code:

```ante
shared type Color = | R | B

shared type RbTree t =
    | Empty
    | Tree Color (RbTree t) t (RbTree t)

balance (tree: RbTree t): RbTree t =
    match tree
    | Tree B (Tree R (Tree R a x b) y c) z d
    | Tree B (Tree R a x (Tree R b y c)) z d
    | Tree B a x (Tree R (Tree R b y c) z d)
    | Tree B a x (Tree R b y (Tree R c z d)) -> Tree R (Tree B a x b) y (Tree B c z d)
    | other -> other
```

The code above almost exactly matches the red-black tree balancing function you'd find in a textbook. It has no
mention of ownership, borrowing, allocations, etc. Aside from syntactical differences, the only oddity we'd find is this `shared`
keyword in front of the type definition - we'll get to what this means later. I will emphasize though that there's
no magic going on here. This is all code you'd be able to write in Rust, C++, Zig, etc., just with a bit more ceremony.

Speaking of which, let's compare this to some roughly equivalent Rust code:

```rust
use std::sync::Arc;

#[derive(Copy, Clone)]
enum Color { R, B }

enum RbTree<T> {
    Empty,
    Tree(Color, Arc<RbTree<T>>, T, Arc<RbTree<T>>),
}

fn balance<T: Copy>(tree: Arc<RbTree<T>>) -> Arc<RbTree<T>> {
    let make_tree = |a: &Arc<RbTree<T>>, x, b: &Arc<RbTree<T>>, y, c: &Arc<RbTree<T>>, z, d: &Arc<RbTree<T>>| {
        let a = a.clone();
        let b = b.clone();
        let c = c.clone();
        let d = d.clone();
        Arc::new(RbTree::Tree(Color::R, Arc::new(RbTree::Tree(Color::B, a, x, b)), y, Arc::new(RbTree::Tree(Color::B, c, z, d))))
    };

    match tree.as_ref() {
        RbTree::Tree(Color::B, l_tree, elem, r_tree) => {
            match (l_tree.as_ref(), r_tree.as_ref()) {
                (RbTree::Tree(Color::R, ll_tree, l_elem, lr_tree), _) => {
                    match (ll_tree.as_ref(), lr_tree.as_ref()) {
                        (RbTree::Tree(Color::R, a, x, b), _) => make_tree(a, *x, b, *l_elem, lr_tree, *elem, r_tree),
                        (_, RbTree::Tree(Color::R, b, y, c)) => make_tree(ll_tree, *l_elem, b, *y, c, *elem, r_tree),
                        _ => tree,
                    }
                }
                (_, RbTree::Tree(Color::R, rl_tree, r_elem, rr_tree)) => {
                    match (rl_tree.as_ref(), rr_tree.as_ref()) {
                        (RbTree::Tree(Color::R, b, y, c), _) => make_tree(l_tree, *elem, b, *y, c, *r_elem, rr_tree),
                        (_, RbTree::Tree(Color::R, c, z, d)) => make_tree(l_tree, *elem, rl_tree, *r_elem, c, *z, d),
                        _ => tree,
                    }
                }
                _ => tree,
            }
        }
        _ => tree,
    }
}
```

This version was _significantly_ more difficult for me to write, and I'd wager it'd be significantly more difficult to find bugs in as well.
When I have a limited amount of time per day spent programming, more time spent writing the code leaves me less time for other important things like designing
and testing. True to form, as a low-level language, Rust requires we specify in more detail exactly what we want. Notably, we must specify
the pointer wrapper type `Arc`, and this causes our `match` to be split into 3 since Rust cannot currently match through `Arc` directly. What
Rust does not allow us to do is to opt out of this in any way. Rust doesn't just _let_ the programmer specify in more detail what they want,
it _requires_ it. This is great for parts of our codebase which actually that level of control, but can unnecessarily slow down the programmer
in parts of the codebase which don't.

Anyways, this isn't meant to be a dig on Rust - I didn't even try writing this with `std::variant` in C++ after all. It's meant to call attention
to the things developers using these languages put up with that they shouldn't need to.

---

## A Low-level Core

Even if the majority of code is expected to be written in a high-level style, a flexible language must still
be able to reason about the same code in a lower-level way so that it can call into code already written
in a low-level style, or vice-versa. Otherwise, the ecosystem would be split in two. At its core, Ante is a
language with ownership and borrowing allowing users to control where allocations and deallocations occur, yet
each of the examples above still translate into code which follows these rules. For example,
the red-black tree balance example uses `shared` types which can be thought of as a wrapper over atomic reference-counting
(while `shared mut` types can be thought of as a wrapper over non-atomic reference-counting):

```ante
derive Copy
type Color = | R | B

type RbTree t =
    | Empty
    | Tree Color (Arc (RbTree t)) t (Arc (RbTree t))

// The inferred `Copy t` constraint was hidden before but is shown here
balance (tree: Arc (RbTree t)) {Copy t}: Arc (RbTree t) =
    match tree
    // Arc.as_ref is pure so we know it should be safe to match through
    | Tree B (Tree R (Tree R a x b) y c) z d
    | Tree B (Tree R a x (Tree R b y c)) z d
    | Tree B a x (Tree R (Tree R b y c) z d)
    // `Arc` implements Copy, so no need to explicitly clone each field
    | Tree B a x (Tree R b y (Tree R c z d)) -> Arc.of (Tree R (Arc.of (Tree B a x b)) y (Arc.of (Tree B c z d)))
    | other -> other
```

That's a lot of `Arc`-wrapping! It does however help illustrate how close the higher-level shell really is to
languages like Java where nearly everything is wrapped in a pointer and cleaned up for us automatically. How
should a low-level language get closer to a higher-level one? Auto-box more things. Sure, this can be inefficient,
but it also isn't as much of an issue when users must explicitly opt-into doing so.

Also - what happens if a user actually wants some other pointer type to represent their shared types? Or maybe
they don't want pointers at all and would prefer indices?

While the representation of shared types can be customized, if a user needs to guarantee a specific representation,
they should not be using shared types to begin with. Such a user wants low-level predictability but is using a high-level
solution. To solve this, they can delve into the low-level depths and simply write the above code using their
preferred pointer or index type directly, no need to use shared types at all. Put another way - want a
type to use `MyPtr`? Then just explicitly wrap it with `MyPtr`.

Anyways, my point is that while all this code is _possible_ to write in existing languages,
it isn't always _easy_. Developers deserve more control over not just what they make but also how easily
they want to be able to make it, and they should be able to do so without needing to switch to an entirely
different language for different parts of their application.

---

## Other Ideals

While I'm talking about ideals shaping Ante's design, I should mention a few more things:

---

### Expressivity: Shared Mutability

A language's strength is often in its expressivity, or how easy it is to express what a programmer wants to write.
When a programmer tries to write code one way but gets an error from the compiler and must do it a different way, this causes
friction. Rust is infamous for this, particularly when programmers are used to using cyclic references and shared mutability,
they must now learn how to restructure their program not to use these things.

Yet even in Rust, creating such programs isn't _truly_ impossible. There are tools like internal mutability to often achieve
what you want anyway. It's just that using these tools is often cumbersome (or comes with runtime errors) which steer
away programmers from these patterns. We can debate on how often programs _should_ make use of such features, but the reality
is that the amount is still likely non-zero (even Haskell has `IORef`). So our language should be able to express these
patterns as well:

```ante
shared mut type NonEmptyList a =
    value: a
    next: Maybe (NonEmptyList a)

main () =
    var head = NonEmptyList 0 None
    var tail = NonEmptyList 1 None
    head.next := Some tail
    tail.next := Some head

    print head  // prints: NonEmptyList 0 (Some (NonEmptyList 1 (Some (NonEmptyList 0 (Some ...)))))
```

Shared mutability, while a possible source of bugs, also enables patterns like the observer pattern and makes certain
classes of applications, such as UI development, easier (citation needed).

In general, I often think a high-level language's ease of use is related to how easily it can express the patterns
developers want to use to create their programs. In this respect, supporting shared mutability can be advantageous even
if its use is discouraged. This is actually the case for Ante as well, which markets itself as a functional language in spite
of its many non-functional features. Immutability is encouraged when possible, but even immutability directly benefits
from mutability. Other languages may encourage a functional-but-in-place ([FBIP](https://xnning.github.io/papers/perceus.pdf))
style where `if reference_count == 1 then mutate else immutable_fallback`
checks are automatically added as an optimization, but this alone is not always sufficient. By directly supporting
mutability, developers are able to create their own immutable data types using mutability internally for efficiency.
An example of such a type is a [vlist](https://trout.me.uk/lisp/vlist.pdf) which is a kind of vector-list hybrid that
is persistent but is closer to a vector than a linked list in terms of performance.

I mentioned in the previous section that Ante is a language with ownership & borrowing - doesn't shared
mutability break borrowing rules?

Well yes, but actually no. It breaks Rust's borrowing rules, but not Ante's. The short of it is that Ante
extends Rust's borrowing rules to allow shared mutability based on Rust's `Cell<T>` type. You can
read more about it in [the documentation for reference kinds](/docs/language/#shared-mutability-and-reference-kinds)
or in [the blog post where they were first introduced](/blog/safe-shared-mutability).

We can roughly translate the `NonEmptyList` example to the following with each `shared mut` type removed:

```ante
type NonEmptyList a =
    value: Rc a
    next: Maybe (Rc (NonEmptyList a))

main () =
    var head = Rc.of (NonEmptyList 0 None)
    var tail = Rc.of (NonEmptyList 1 None)
    (head.as_mut ()).next := Some tail
    (tail.as_mut ()).next := Some head

    print head  // prints: NonEmptyList 0 (Some (NonEmptyList 1 (Some (NonEmptyList 0 (Some ...)))))
```

When we do this, we see an `Rc.as_mut` method. Such a method would not be safe in rust where mutable references must be
unique, but are safe in Ante which provides not only Rust-style mutable references (spelled `uniq`), but
also mutable references which may not be unique (spelled `mut`), yet are still safe to use:

```ante
// This reference-counted pointer may be aliased elsewhere so even if we have a unique reference to it,
// we can only give out shared references to the contents. Also note that requiring a unique reference
// here instead of a shared one ensures the reference count stays at least one while the returned
// reference is alive.
Rc.as_mut (self: uniq Rc a): mut a = ...
```

Specifics aside, shared mutability comes with its own fair share of difficulties but is ultimately still important
for low-level languages today. I'm generally of the mind that it should be avoided when possible,
but when it is needed it can still be simpler than the alternatives. Determining "when it is needed" is left
as an exercise for the reader.

---

### Abstraction: Effects

One of the most important concepts in programming is _abstraction_. Without abstraction, you're wasting
time repeating yourself or worrying about often irrelevant details. It is a common and important-enough tool that
I expect everyone reading this to already be familiar with it. Yet many languages (even high-level ones) fall victim
to repeating themselves or segmenting their ecosystem implementing features like exceptions, async, or generators
all separately instead of part of one abstraction.

...Yes, this is the segue into effect handlers.

This won't be an explainer for effect handlers (for that, see [Ante's own documentation on them](/docs/language/#algebraic-effects)),
just an argument why they're useful.

Effects are pervasive in programming - even in functional programming - and it is useful to have a more structured
way to reason about them and make use of them. Ad-hoc approaches can lead to problems like
[colored functions](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) preventing users from
writing code abstracting over effects (particularly async, although you can argue Java's checked exceptions lead
to colored functions to a degree) and preventing the use of otherwise effect-agnostic functions like `map`.
`map` is a simple function though - it should be simple to write too:

```ante
// Take a function that can emit (yield) something, apply `f` to that thing, and emit it again
map (emitter: fn Unit -> Unit can Emit a) (f: fn a -> b): Unit can Emit b =
    handle emitter ()
    | emit x ->
        emit (f x)
        resume ()
```

What type should `map` accept? Any function that can `Emit` values.
What type should it collect into, if any? We don't care. What about functions users
may pass in for `f` which can throw exceptions or call asynchronous code? We don't care! `map` is effect agnostic
and may accept an `f` with any effects clause. If we did care we could specify `f: fn a -> b pure` or
something else, but we don't. High-level code's biggest strength is in letting developers say "I don't care,"
and just making the code work anyway. A language missing out on effect handlers then is not as high-level
as it otherwise _could_ be.

This isn't meant to be a complete list of cases where effect handlers are useful (far from it), but I do want
to highlight another example: mocking. Effect handlers enable developers to cleanly mock their
code without rewiring it to pass around mock objects everywhere. This isn't impossible without effect handlers
of course. Just like existing low-level languages _can_ make use of high-level patterns,
it isn't about whether it's possible, it's about how _easy_ it is to actually do so. It's easy to discount ease
of implementation as unimportant but it has real a real effect on how likely a particular solution is to actually
be adopted in practice. Even if an alternative will noticeably improve a program in some way, if it is too difficult
to implement (verbose, obfuscated, conflicts with other goals, etc), it may not be. The right thing to do
should be the easy thing to do, but most languages just don't have the necessary tools for this when effects are involved.

Case in point: with traditional mocking, a developer must have mocking in mind and design their functions to use it. With
effect handlers, the code is just mockable by default.

```ante
// Original code (no effects or mocking)
foo () =
    // Assume this is a language with untracked effects. We must read documentation
    // to know `query` queries the database (the name seems obvious but other designs may
    // e.g. return an object which we must call `.execute()` or similar on to actually
    // execute the query).
    MyDb.query "..."
    MyDb.query "..."
    MyDb.query "..."

// Mocked code (no effects)
// In a real-world program making this change may involve threading `db` through
// many functions and even changing trait interfaces.
foo (db: MyDbWrapper) =
    db.query "..."
    db.query "..."
    db.query "..."

main () = foo (MyDbWrapper.real_db ())
test () =
    mock_db = MyDbWrappper.mock_db ()
    foo mock_db
    assert (mock_db.all_is_well ())

/////////////////////////////////////////
// Original code & mocked code (effects)
foo () can Db =
    // `MyDb.query` declared as `can Db`, so `foo` must be too
    MyDb.query "..."
    MyDb.query "..."
    MyDb.query "..."

main () = foo () with real_db_handler
test () =
    mock_db = foo () with mock_db_handler
    assert (mock_db.all_is_well ())
```

The downside? Mocking your effectful code may not have as nice a mocking interface as the mocking code you wrote from scratch,
particularly if you're using a large effect like `IO` for a narrower task like a database. Replacing the effectful interface
with a narrower one for your specific use case though will still be much easier than changing a codebase to use purpose-built
mock objects instead of ad-hoc untracked effects.

---

## Complexity

From a language design perspective, Ante uses Rust as a base, adding on rules for shared mutability and effects, among other things.
Ask many non-Rust programmers though and they'll tell you one of if not the main reason they don't use Rust is because of
its complexity and therefore difficulty. I want to challenge this equivalence though. On the other end of things, we often
here of languages being very simple and thus easy to use. Indeed, simplicity is often used as a reason to cut otherwise useful 
features out of languages (such as generics in the original version of Go) in pursuit of an idealistic minimal language.
Taken to its extreme though, its trivial to see that prioritization of simplicity of language design over all else does _not_
simplify things for the programmer. Just look at the [Brainfuck](https://en.wikipedia.org/wiki/Brainfuck) language - it only
has 8 commands, yet writing programs in it is generally considerably more difficult than an equivalent python program (which
by all accounts is a much more complex language).

So language simplicity is different from how simple it is to actually use that language. We can't just look at every new
feature in a language as something more to learn, and therefore negative.

Bringing things back to Ante, it does add features to Rust but some of the features it adds (shared types & rules for shared mutability)
are notably ways to fix the paper cuts many developers get when using Rust. Theoretically, if there were an Ante book teaching
the language, an author would be able to more gradually ease in readers by teaching an easier subset of the language first,
only graduating them to the full language with ownership & borrowing in later chapters on optimizing programs.

---

# Conclusion

Many of the things I've mentioned in this article are ideals. I don't know how well some of them will turn out in practice,
but I aim to steer as close as possible to achieving them. Anyways, my hope is that I've shined some light not necessarily
on Ante's specific feature set but more importantly on _why_ it has these features and _why_ Ante exists at all.

If you've stuck with me this far, thank you! Please consider joining [Ante's discord](https://discord.gg/NPJncGBAws)
to follow the project or ask me questions directly. I'm also looking for contributors - the
compiler is in the middle of a full rewrite so now is a great time to join in (in particular I'd welcome someone
willing to update the old language server to the new incremental compiler)! It makes my day whenever
I read comments expressing interest or curiosity in the language. There is still a long road ahead but Ante
has already progressed further than I've imagined.

[^low]: For example, control over where/when/how allocations occur for constrained environments, preventing or
moving possible pauses in execution for real-time applications, etc. 

[^high]: Similarly, higher-level languages like C# or Swift may still allow users to optimize with value types or even
rust-style borrowing.

[^rc]: To allow for more control over shared types, the runtime representation of shared types may be controlled by
the developer of the final binary (to prevent ecosystem fragmentation, library authors may not control this compiler option).
Some representations of shared types, mainly the reference-counted pointer representation, may leak at runtime if used in cycles.
If reference-counting and cyclic types are both requirements, it is suggested to group allocations such that they may be
freed all at once at a known safe point later, or to use a separate cycle collector.

[^rcperf]: Performance of naive reference-counting is often quite a bit lower than a modern tracing GC, but for the purpose
of this article it doesn't matter which GC implementation is chosen - just that garbage is somehow collected.
