+++
authors = ["Jake Fecher"]
title = "Simplification Through Addition"
date = "2024-03-17"
categories = ["sugar", "memory management", "syntax"]
banner = "img/banners/antelope_canyon.jpg"
+++

---

Ante's goal was always to be a slightly higher level language than Rust.
I always imagined Ante to fill this gap in language design between higher-level garbage collected
languages like Java, Python, and Haskell, and lower level non-garbage collected languages like C,
C++, and Rust. I still think there's room there for a language which tries to manage things by
default but also allows users to manually do so if needed as an optimization. Other languages always
have some degree of this of course - but doing so often requires using raw pointers, FFI, or generally
sacrificing everything just to write somewhat more efficient code. I wanted this transition in Ante
to be as easy as switching from reference-counted to non-reference-code in Rust.

However, after the changes in [the first blog post](/blog/safe_shared_mutability), Ante is arguably
even more complex than Rust. This is especially true once you factor in Ante's other features such
as algebraic effects and [their restrictions](/blog/effects_ownership_and_borrowing). At the moment,
even the language's tag line of being "a safe, easy systems language" is misleading at best.

To remedy this, this blog post will focus on some additions and changes to simplify using the language.
Yes - I did say additions to make the language simpler. This is somewhat
oxymoronic but I believe additional features can make a language simpler to use
if they change the way code is written such that it is easier to reason about. For example, if more complex
specifications only appear in complex code, it'd make more complex code easier
to identify compared to if it were required everywhere. So I do believe introducing a second,
simpler alternative can be simpler than only having one more cumbersome approach even if it makes
the language itself larger.

But all this has been too vague. The rest of this post will focus on some actual changes starting
with smaller ones and building up to the largest of the bunch.

---

# Minor Items

## Effect Variable Ellision

The simplest change is a mere syntactic one.

Effectful functions always have a `can E` as part of their type signature. This clause
corresponds to which effects a function can perform. For example the function `foo` below
prints out values internally and thus `can Print`:

```ante
foo (): Unit can Print =
    print "Hello, World!"
```

What effects should a higher-order function like `vecmap` take however? Theoretically, it can
perform any effect that the function that was passed to it can, in addition to whatever effects
`vecmap` performs in its own body. The solution is an effect variable is used. This effect variable
shows that whatever effects performed by `f`, we're going to call those `e`, and the outer `map`
function also performs those same effects (since it calls `f` internally):

```ante
vecmap (stream: Stream a) (f: FnMut a => b can e): Vec b can e =
    // map in Ante performs a `Yield b` effect which can be
    // handled by `collect` or other functions which operate on generators
    map stream f with collect
```

The inclusion of these effect variables adds noise whenever we use higher order functions.
If we want to get technical, all functions should be effect polymorphic over
the environment they're called in - otherwise they'd only be callable in (for example) an
environment with a single `can Print` effect and nothing else. In practice however,
nearly all effectful languages lift this restriction and make the desired approach the more natural
one.

Ante will be no different here. Ante will now include the sugar where effect variables are implicitly
added to function signatures. This means any function that only ever requires one effect variable
(the vast majority of them) will no longer require explicit effect variables. Here's `vecmap` again:

```ante
vecmap (stream: Stream a) (f: FnMut a => b): Vec b =
    ...
```

Quite a bit simpler. The main case where this would not be wanted is if a function
takes another function as an argument but does not call it:

```ante
forced_example (f: a -> b can e1): WrapperObj can e2 =
    // Return some kind of function wrapper object
    WrapperObj f
```

---

## Auto Derives

The next feature to add is to expand the amount of traits which are derived automatically for a given
type. A good starting point would be to automatically derive `Debug`, `Clone`, `Eq`, and `Hash`.
`Copy` is another candidate here, but I've stopped just short of it since it'd make it easier to
introduce a breaking change just by adding a non-copyable field to a type.

---

## Trait Objects

Adding trait objects in Ante is more difficult than in Rust since Ante does not arbitrarily bless
the first argument of a trait with its own hidden generic named `Self`. A trait in Rust such as
`Clone` generally corresponds to a trait with more more generic in Ante: `Clone t`. This actually
helps simplify complex trait bounds but in the context
of trait objects, it makes choosing which generic should be the actual object more difficult.
There's been some [ideas](/docs/ideas/#trait-objects) floating around for quite a while on how
to remedy this flexibly by allowing any parameter to be the object, but I'm just going to give
in to practicality and arbitrarily choose the first parameter.

With this, when traits are used in a type position the first parameter can be omitted and the function
will be callable with any value that implements that trait. I'll also be elliding the `impl` prefix
here based on some negative opinions I've heard from non-rustaceans on it. In their view it is a somewhat
extraneous specification since OO langs often let an interface be used directly without an additional keyword.
One could argue the `impl` helps key in when this is happening but since the goal is to inch Ante
more towards the higher level languages, I'll omit it for now.

```ante
// Stream is a helper trait for using generators
trait Stream t elem with
    stream: t -> Unit can Yield elem

filter (s: Stream a) (f: FnMut a => bool): Unit can Yield a =
    handle stream s
    | Yield x ->
        if f x then yield x
        resume ()

// The above is equivalent to
// filter (s: t) (f: a -> bool): Unit
//    given Stream t a
//    can Yield a = ...
```

---

## Overloading

Now begins the more controversial section of this list.

Most programmers take some form of implicit imports or overloading for granted.
This most often comes from method calling syntax `foo.bar()` in which `bar`
can be called despite never being imported into scope! Ante could have taken
the easy route here as well and adopted similar semantics but all is not perfect
in method land.

The main issue with methods is that they can only resolve to
functions defined within the type's class, module, package, or crate depending on
the language. In Ante's case specifically, it is an ML descendant (syntax-wise at least),
and it already has an infix function calling operator: `|>`. Should Ante introduce
another operator to do the same thing but for methods? Or should `|>` be changed to
be able to call methods as well? What if there is a name conflict between a method
and a function in scope?

Instead, I'm abandoning methods altogether and allowing ad-hoc overloading of names:

```ante
// In Vec.an
new () : Vec a = ...
push (v: &mut Vec a) (elem: a) : Unit = ...
get (v: &owned Vec a) (index: Usz) : &owned a can Fail = ...

// In HashMap.an
new () : HashMap k v = ...
insert (m: &mut HashMap k v) (key: k) (value: v) : Maybe v = ...
get (m: &owned HashMap k v) (key: &k) : &owned v can Fail = ...

// Foo.an
import Vec.new push get
import HashMap.new insert get  // ok!
```

This will allow functions with conflicting names to be imported and an error will only
be issued if any given call is ambiguous.

```ante
foo (vec: Vec a) (map: Map I32 v) other =
    elem1 = get vec 0  // ok! Resolves to Vec.get
    elem2 = get map 0  // ok! Resolves to Map.get

    _ = get other 0  // error! Call is ambiguous. Do you mean Vec.get or Map.get?
```

Another advantage is that the infix function
call syntax can be used even on functions from a third-party library without the use
of a workaround like extension traits.

Without name overloading, names like `get` would need to be renamed on import nearly
every time they are used or otherwise not imported directly and only referred to via
`Vec.get` or `M.get`. This is not good from a user perspective since it makes these
names less consistent across code bases, which in turn makes the language more difficult to read.
Library authors also can anticipate this renaming and
instead directly choose to name the functions `vget` or `hmget` to avoid users having to do so on
every import. Doing this though keeps the code from reading more naturally.

Finally, despite the initially negative reactions I'm sure many have to function overloading,
it's worth stating again how similar it is to the implicit imports provided by method
calls in most other languages. Notably, both share the downside of a name being potentially
difficult to discern without knowing the object type. At least with function overloading,
that function will still be imported at the top of a file.

---

# Shared by Default

Alright, now onto the main reason this article was written.

It's no secret that perhaps the largest hurdle to learning Ante and Rust are their ownership
semantics and borrowing rules. While there are other complex parts of both languages, ownership
& borrowing is something that users encounter almost immediately when trying out either language.
Time must be devoted up front to learning these before users can move on to more intermediate code.
Other complex features like multithreading or effect handlers do not have this problem since they
can more easily be delayed or rearranged in a curriculum.

To address this, I'm introducing two "modes" into Ante:

- `owned`: In the `owned` mode, values are all owned by default and move semantics apply. This
is no different from existing Ante and Rust code.
- `shared`: The real addition is the `shared` mode in which values are shared by default and can
be trivially copied. The goal here is to use values as much as possible, avoid references, and
avoid `clone`. Internally these values are effectively reference-counted by default.

The most important point when designing these modes for me was that they must, above
all else, be able to cleanly interact with each other. Failure to do so would essentially split
the language into two parts with libraries written for one mode being incompatible for an application
using the other. This proposal avoids this very simply:

- In the `owned` mode, a shared type `t` corresponds to just `Shared t`. This is effectively a type
alias for `Rc t` but it is kept vague by the language to allow for compiler optimizations.
- In the `shared` mode, an owned type `t` is displayed as an `owned t`.
  - `owned t` types have movement semantics which can be useful or necessary for some
    types even in shared mode (see GC'd languages like [OCaml introducing ownership semantics](https://blog.janestreet.com/oxidizing-ocaml-ownership/#the-linearity-mode)).
  - If movement semantics still aren't desired, users can wrap these owned types in a
    `Shared` wrapper manually.

Importantly, there is just one language underneath.

## Switching Between Modes

The `shared` mode will be enabled by default with the `owned` mode being able to be switched to
by specifying:

```ante
owned module
```

I think most users will want to set the mode for their entire project by default which is why specifying
this will set the mode of the current module as well as all child modules. Similarly, if the current
module is owned due to a parent module being owned, this can be overriden via:

```ante
shared module
```

With the new shared mode being the default, Ante is essentially now an impure functional language
built on top of a somewhat lower-level rust-like procedural language. Users of high-level languages
like Python today often rely on libraries written in C for speed. It will be quite nice for users
to use Ante as a high level language and directly be able to leverage libraries written in owned mode
for a bit of extra performance.

## Recursive Unions

Defining and operating on recursive unions is much more natural in `shared` mode:

```ante
type Expr =
   | Integer I64
   | Variable String
   | Let String (rhs: Expr) (body: Expr)
   | Add Expr Expr

simplify expr =
    // Nested matching
    match expr
    | Add (Add lhs (Integer x)) (Integer y) ->
        Add (simplify lhs) (Integer (x + y))
    | Add (Add (Integer x) rhs) (Integer y) ->
        Add (Integer (x + y)) (simplify rhs)
    ...
```

Nested pattern matching is something that I'd also like for the `owned` mode eventually,
but even just removing the pointer type wrapper from `Expr`'s type definition shouldn't
be overlooked as a simplification to users. Now when defining `Expr` every case
contains only business logic and is free from low-level details.

## Mutability

I mulled over whether shared values should be mutable by default or not but I think
the best answer is that they are not mutable. Backing up a bit, Rust users may question
how the `a` in `Rc a` could be mutable but due to Ante's support for [shared mutability](/blog/safe_shared_mutability),
the operation `as_mut: &mut Rc a -> &shared mut a` is a perfectly safe one.

The `Shared a` type diverges from `Rc a` a bit in that it does not provide this operation because:
1. Although not entirely uncommon in other programming languages, having certain values have mutable
reference semantics by default could be confusing. Mutating one value and having another change would
be a type of spooky action at a distance behavior. Such a behavior would only happen in the shared mode
which I think would give it an unnecessary difference compared the owned mode.
2. Not providing this function enables the compiler to implement `Shared a` in a possibly thread-safe
way. For example, the compiler could detect when these values are used in a multithreaded context
and switch to atomic reference counting (see [Perceus](https://www.microsoft.com/en-us/research/uploads/prod/2020/11/perceus-tr-v4.pdf)).
3. Users would still be able to mutate these types but would need to use an internally-mutable
wrapper type such as `Mut t` which provides `as_mut: &Mut t -> &shared mut t`.
    - Pointing to each `Mut t` as an example of what makes the type not thread safe is also simpler than trying
to point to an implicit `Shared` wrapper.
4. Even without `Mut t`, it will still be possible to mutate a shared value by checking its
reference count and cloning if it is more than one.

## Owned Types

One disadvantage of shared types is that since they are shared you cannot obtain an owned,
mutable reference to them. This isn't as common a requirement in Ante as it is in Rust. For
example, types such as `Vec a` and `HashMap k v` are perfectly usable in a shared context:

```ante
// push does not require a `&owned mut Vec a`
push (v: &mut Vec a) (elem: a) : Unit = ...

pop (v: &mut Vec a) : a can Fail = ...

// Indexing a Vec also does not require an owned, mutable reference
impl Extract (&Vec a) Usz a given Copy a with
    // Extract in Ante provides the `vec.[i]` syntax.
    // Assigning to `vec.[i]` requires the separate Insert trait.
    extract vec i = ...

// get_mut does require an owned, mutable Vec. If Vec elements need to be
// mutated in a shared context however, users can still use a `Vec (Mut t)`
// and access them via `vec.[i]` since the element is presumably shared
// and thus implements Copy.
get_mut (v: &owned mut Vec a) (index: Usz) : &owned mut a can Fail = ...
```

Types which do need owned, mutable references can optionally be declared with the `owned`
keyword:

```ante
owned type Foo = ...
```

These types will never be wrapped in an implicit `Shared` wrapper in shared contexts,
and they will still have move semantics as a result.

---

# Conclusion

This article has been a bit all over the place, so thank you to anyone still reading.
Programming languages are often made cumbersome through the accumulation of a thousand paper cuts
rather than just one rock wall. For this reason, I felt the need to write about more than just
the new `shared` mode. I also want to draw attention to the fact that while languages can
be, and often are, made simpler through additions, this is obviously a fine line to walk
as a designer. If the addition doesn't hold it's weight then the language has just been made more
complex for everyone as they have to learn about more features they may encounter that aren't
even technically required for the language to function. It is of course possible to define a
language without any such usability features but these languages tend to be too minimal to be
practical. I hope I've achieved a good middle ground with the features given in this article.
It's something I'll be monitoring as Ante grows to make sure they pull their weight.
