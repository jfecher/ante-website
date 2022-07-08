+++
title = "Ideas"
date = "2021-11-02"
categories = ["docs"]
+++

---

This page is an incomplete list of features that are currently
being considered for ante but for one reason or another are not
included in the language already. These features are listed
in no particular order.

---
# Derive Without Macros

Trait deriving is an extremely useful feature for any language with traits and trait impls.
It cuts down on so much boilerplate that I would even argue it to be necessary. Rust, for example,
relies on implementing derives via procedural macros which are quite difficult for IDEs to handle,
slow compile times, come with a hefty learning curve, and are required to be put in a separate crate.
To provide a derive mechanism without these downsides, I propose aa system based on GHC's [Datatype
Generic Programming](https://wiki.haskell.org/GHC.Generics) in which we can define how to derive a 
trait by specifying rules for what to do for product types, sum types, and annotated types.

Here's an example in ante (syntax not final):

```ante
trait Hash a with
    hash: a -> u64

derive Hash a via match a
| Product a b -> hash_combine (hash a) (hash b)
| Sum (Left s) -> hash s
| Sum (Right s) -> hash s
| Field t _name -> hash t
| Annotated t _anno -> hash t

type Foo = x: i32, y: i32

hash_foo = impl Hash Foo via derive
```

These would function somewhat as type-directed rules for the compiler to generate impls
from a given type. The exact cases we would need may push toward a different list of cases
(e.g. a simple Product pair type won't enable easy differentiation of the begin and end of a 
struct's fields) so the final design may be more general with a bit more noise (e.g. we could
add StartStruct and StructEnd variants which may be useful for Serialization and other traits).

The above strategy with Hash simply recurses on each field of the type. This is a common enough
usecase that we can consider even providing this as a builtin strategy to save users some trouble:

```ante
derive Hash a via recur hash_combine
```

If the trait functions take more than the single `a` parameter it is unclear if an error should be
issued or the strategy can default to passing along these parameters as-is. We could try to generalize
the `with` clause to accept a function taking all parameters and return values as well but this starts
to cut into its brevity and ease of use over the more general approach.

---
# Method Forwarding

Without inheritance, it can still be useful to provide easier composition via a feature like Go's
[struct embeddings](https://golangbyexample.com/inheritance-go-struct/):

```go
type person struct {
    animal
    job string
}
```

This will forward all methods of `animal` to work with the type `person`. Notably, this does not make
person a subtype of animal, it only generates new wrapper functions.

Implementing a similar feature for ante is more difficult since ante doesn't have true methods. There
are a few paths we could explore:

1. Explicit inclusion of functions into a new type:

  ```ante
  // Create species, size, and ferocity wrapper functions around the `animal` field
  !include animal species size ferocity
  type Person =
      animal: Animal
      job: string
  ```

  Since these are arbitrary functions with no `self` parameter we must decide how to translate the
  types within, say `Animal.species` to our new `Person.species` function. One approach would be
  to naively translate all references of `Animal` to `Person`, but this gets difficult for parameters
  with types like `Vec Animal` where we now must add an entire map operation. It would be simpler to
  only change parameters matching exactly the type `Animal`, but this leaves out the common usecases
  of pointer-wrapper types like `ref Animal`. We could try to only replace types `a` given `Deref a Animal`,
  but involving impl search in this makes it increasingly complex.

  With these complexities it may be better to have users write some boilerplate wrappers for the methods
  since the boilerplate is at least easier in ante with type inference:

  ```ante
  species p = species p.animal
  size p = size p.animal
  ferocity p = ferocity p.animal
  ```

  But this is a rather unsatisfactory solution.

2. Abandon the notion of forwarding arbitrary functions and limit it to only forward impls. This
approach still has its own difficulties. Notably, there is no notion of a Self type for traits either,
though it may be reasonable to manually specify which type to use for Self as the [derive without macros](#derive-without-macros)
and [traits as types](#traits-as-types) proposals do. A similar effect to impl forwarding can be achieved
with normal impl deriving for newtypes:

```ante
type NonZeroU32 = x: u32

derives = impl (Add, Mul) NonZeroU32 via derive
```

However, a generalized forwarding mechanism could be made more generic. For example, it could allow
deriving from some (but not all) fields:

```ante
type Wrapper =
    a: i32
    b: i32
    context: OpaqueContext

hash_wrapper = impl Hash Wrapper via forward a b
```

---
# Overloading

Given ante does not have true methods, some form of overloading could greatly help alleviate user frustration
by allowing modules like `Vec` and `HashMap` to both be imported despite defining conflicting names like `empty`,
`of`, `insert`, `get`, etc. Overloading would also reduce the need for traits as users would no longer need to
use traits to be lazy with their function names. It would however complicate documentation somewhat. An identifier
would no longer be uniquely determined by its full module path, referring to a specific instance of it must now
specify the full module path and type of the function.

Basic usage would be relatively simple:

```ante
import Map
import Vec

foo (map: HashMap i32 string) =
    elem = get map 4
    print elem
```

Here, the type checker has both `get: HashMap a b - a -> Maybe b` and `get: Vec a - usz -> Maybe a` in scope.
Since it knows `map: HashMap i32 string` ther is only valid choice and the code is thus unambiguous. Its worth
noting there may be implementation concerns - if we have more than 2 of these in scope, the resolution
order of these constraints could affect whether subsequent constraints can be inferred to a single instance or not.

In addition, there is the question of what should be done for the following code:

```ante
foo map =
    elem = get map 4
    print elem
```

This `foo` would be valid for both `map: HashMap a b` and `map: Vec b` (given `Int a, Print b`).
There are two options here:

1. We can be more flexible and generalize the constraint: 

```ante
foo: a -> unit given 
    get: a -> b -> c, 
    Int b, 
    Print c
```

In which case we end up with a kind of compile-time duck typing. Worst case scenario if we made
a typo (`gett` instead of `get`), this could generalize our `gett` constraint instaed of issuing
a method not found error. This seems like it can be avoided however by only generalizing if there
is actually at least 2 functions in scope with that name.

It is an open question whether generalized function requirements should be resolved via the set of
functions visible to the caller or just those visible to the definer. If it is the former, this functions
as a sort of ad-hoc trait feature and the "only generalize if there are at least 2 functions in scope" of the
definer rule seems more arbitrary if these functions won't be used for resolution anyway. For this reason,
it is perhaps better to opt into this feature via a separate syntax, e.g. via `.` hinting at method
calls in other languages:

```ante
foo map =
    elem = map.get 4
    print elem
```

This method is opt-in so users are less likely to accidentally hit it and get confused. Moreover, it
largely follows the already-established type inference and generalization rules for `.` on fields.

2. We can choose to never generalize and always issue an error if there are more than two functions
that may match in scope. If the user still wishes to allow such functionality, they must use traits
and impl the trait for each combination of types they want. This approach is less compatible with
type inference and may lead to users avoiding type inference to be able to use overloading. It may
also be a stumbling block for new programmers, though both of these proposals realistically may be.

---
# Allocator Effect

In low level code it can often be helpful to provide a custom allocator for a type.
Languages like rust and C++ realized the usefulness of this later on and needed to refactor types like `std::vector` and `std::vec::Vec`
to be parameterized over an allocator. Zig on the other hand instead opts to have users manually thread through
an allocator parameter to all functions that may allocate. This simplifies the types and makes it easier to make libraries
providing custom types also accept custom allocators but can be quite burdensome to users to manually thread the allocator through everywhere.standard 
Can we do better?

Yes we can. This pattern of "manually threading through X through our program" is the same as the `State` effect. We can design a similar
effect for allocate which should compile to the same state-passing code but standard with the benefit of having the compiler thread through
the allocator for us:

```ante
effect Allocate a with
    allocate: unit -> Ptr a
```

Now functions that may allocate are marked with an effect:

```ante
type Rc a =
    raw_ptr: Ptr a
    aliases: u32

of (value: a) : Rc a can Allocate a =
    Rc (allocate a) 1
```

Providing a custom allocator can now be done through a regular handler:

```ante
malloc_allocator (f: unit -> a can Allocate b) : a =
    handle f ()
    | allocate () -> size_of (MkType : Type b) |> malloc |> resume

rc = Rc.of 3 with malloc_allocator
```

or if no handler is provided then `main` will automatically handle Allocate effects
with a default handler (presumably deferring to malloc or region allocation).

There are a number of open questions however:

1. The interface to `allocate` is unclear, the interface above doesn't
allow allocating dynamically sized arrays. An interface closer to 
`calloc` may be better here.

2. A raw `Ptr` is returned by the Allocator interface. This means we can
easily leak values if not careful. We could try to add a lifetime constraint
of sorts, or perhaps this limitation may be acceptable for users that need
the low level control.

3. Allocators also need `deallocate` functionality which is not given. There
are two options I see here: Add `deallocate` to the `Allocate` interface (more flexible),
or expect all `Allocate` handlers to outlive their allocations and cleanup when
the handler finishes (this would be another useful place for a lifetime parameter).
The first approach seems more viable than the second since the second can be implemented
in terms of the first by adding cleanup code to the end of the handler and using an
empty `deallocate` match.

4. This `Allocate a` effect would be so ubiquitous that it is perhaps unreasonable to expect
users to type `can Allocate a, Allocate b` for every function that may allocate types a and b.
If we get rid of the type variable and use a slightly different design:

```ante
effect Allocate with
    allocate: Type a -> Ptr a
```

Then the effect could be folded into the `IO` effect alias: `IO = can Print, Allocate, ...`, though
this would force all allocations within a function to use the same allocator (rather than just
all allocations of the same type) which seems too limiting. Alternatively, we could encourage users
to infer the effects for most functions rather than explicitly adding `can` clauses. This could possibly
be added with an effect row `..` to specify some effects while inferring the rest: `foo: a -> a can Print, ..`.

--- 
# Traits as Types

Allowing traits to be used in a type position such that they match with any type
that implements them could help ease some of the notational burden of traits. Prior
art here includes `impl Trait` and `dyn Trait` in rust, existential types in haskell,
any interface type in OO langs, and others.

An ideal implementation would take advantage of ante being slightly higher level than
rust to get rid of the distinction between `impl` and `dyn` trait to just choose the right
one where possible. This should allow for both:

```ante
print (x: Show) -> unit =
    printne "${show x}\n"
```

and

```ante
print_all (xs: Vec Show) -> unit =
    printne '['
    fields = map xs show |> join ", "
    iter fields printne
    printne ']'
```

Where the semantics of `print` likely translates to `fn print(x: impl Show)` in rust, and
the semantics of `print_all` likely translate to `fn print_all(xs: Vec<dyn Show>)`. An
alternative would be to have both functions be polymorphic over whether the underlying type
is known or whether the trait is dynamic.

## Multiple variable traits

In traits with multiple type parameters or traits with type parameters which are not used
directly in a function's parameters it is unclear which type a trait object would represent
at runtime. For example, given the traits

```ante
trait Pair a b with
    pack : a -> b -> string

trait Parse a with
    parse : string -> a

example1 (x: Pair) = pack ???

example2 (y: Parse) = parse ?
```

What should a trait object for `Pair` represent? Arbitrarily picking one type seems out
of the question. To be able to call `pack` we'd need to supply both parameters somehow.
A valid response may be just to limit trait objects to single parameter traits with
"object-safe" functions as rust does, but this may be more limiting than is needed. For
example, if we change our syntax such that the existential type variable must be explicitly
specified, then `Pair` becomes usable as a trait object as long as we specify a type to pack with:

```ante
example1 (x: Pair _ i32) = pack x 7

example1b (x: Pair string _) = pack "hello" x
```

This would incur some notational burden but is otherwise explicit and strictly more
flexible than the previous approach. `_` is likely not a good keyword to be used here
however since it is already used for explicit currying in ante, and this may be
applicable to type constructors some day.

## Exists syntax

It is worth briefly exploring a more explicit and flexible syntax via an `exists`
keyword to introduce an existential type variable (rather than the default `forall` quantified
type variables ante has). It sidesteps most of the issues with previous syntaxes for trait
objects by separating the exists clause from where the type is used later in the signature:

```ante
example1 (x: e?) -> string with Pair e? i32 = ...
```

Although flexible, this does not solve the original problem of improving the ergonomics of
using traits in function signatures. Instead, it makes it worse.

## Traits and effects

Since traits in ante can be thought of as a restricted form of effects which must resume in
a tail position and have an automatic impl search, a natural question that arises is "if there
are trait objects, are there effect objects too?"

At the time of writing, I'm leaning towards "no" as an answer for two reasons.
1. Trait objects exist to ease notational burden of traits or to provide dynamic dispatch.
   - Effects do not have the same notational burden since they do not need to have a type
   implementing the effect passed in through the function's parameters. There would thus
   be no benefit for most effects like `State s` because these are already only found in
   the effects clause of a type signature. Using traits in this way would be useless since
   without an accompanying `(iter: it)` parameter, a trait like `Iterator it elem` would
   not be usable within a function to begin with.
   - For similar reasons, effects do not need to be dynamically dispatched since they have
   no type that can represent them and handlers should be statically known.
2. Erasing effects in any way increases the difficulty of optimizing effects which would be
   a hard sell when algebraic effects must already be carefully optimized out to not incur
   great performance loss.

--- 
# Allocator Optimizations

The default allocator malloc in addition to it's faster friends jemalloc and mimalloc are
designed in such a way to make them general purpose: they must be thread-safe and they cannot
assume any lifetime constraints of their data. A very common manual optimization in languages
like C or C++ is then to switch out to a faster allocator for some data. For example, a game
may elect to use a bump-pointer allocator for any temporary data that is only needed to process
the current frame. Another optimization could be to swap out these global allocators for faster
thread-local allocators that require no atomic or locking instructions for synchronization.

## Automatic usage of thread-local allocators

In Ante, the goal should be to perform these optimizations automatically. The compiler should
be able to analyze the transfer of data such that if it is only used in a single thread, a faster thread-local
allocator is used over the global allocator. Otherwise, we'd fall back to a global thread-safe allocator like mimalloc.
This optimization would be similar to Koka's Perceus system in which atomic reference count instructions
are optimized into non-atomic reference count instructions if the referenced data is used in a single
threaded manner.

This will likely end up being an important optimization since thread local allocators can be 
substantially faster than global allocators. A key property of this optimization however is that it 
would only change the default allocator. If users wish to manually optimize their program and decide
which allocators to use where they will still be able to as before.

## Allocate all memory up-front on the stack

If the compiler can put a bound on the amount of memory a thread may allocate for either thread-local 
or shared data, we would be able to allocate all of a thread's memory up front. Thread-local data could 
simply be allocated on the thread's stack and shared data on the parent thread's stack or global allocator.
This optimization is likely less practical for longer running threads where no memory bound
is likely to be found.

## Grouping allocations with lifetime inference

A good way to optimize allocations is to simply make fewer of them. Ante should be able to leverage
lifetime analysis to find places where we can combine allocations and deallocations of multiple variables.
A trivial example would be:

```ante
foo () =
    l1 = [1, 2, 3] : List i32
    l2 = [4, 5, 6] ++ l1
    ...
    ()
```

A naive implementation may allocate all these list nodes separately but since they are created adjacent
to each other and neither are needed outside the current function we should be able to optimize the 6
list node allocations into 1 call to the allocator. In this specific example, the allocator may also
simply be the stack itself since we do not need a dynamic lifetime for these nodes in this function.

Grouping allocations in this way however leads to questions on how aggressively we should group adjacent
items. What if they are separated by other definitons? Or arbitrary function calls? In general widening
the lifetime of one allocation to match another's so it may be grouped increases the amount of memory
the resulting program would use by allocating earlier and freeing later. It is unclear what heuristics
should be used - if any - to make this decision on when to group allocations separated by other statements.

---
# Always Incremental Compilation

For languages with long compile times like rust (and presumably ante due to refinement types, lifetime inference,
and monomorphisation) incremental compilation largely solves the problem of speeding up compile times when developers
are iterating on a problem. It does not solve the problem for users however when they go to download a 
program or library which now must be recompiled from scratch. Why is this the case? Even if the user is on 
some new architecture that the compiler must optimize for, this does not mean we should have to re-do all of 
lexing, parsing, name resolution, type checking, etc for programs that we already know to compile.

Ante's solution to this will be experimenting with distributing the incremental compilation metadata along with
the code. When you download a library from a trusted source (centralized package repository or a company-specific
local repository) you can compile the project incrementally rather than compiling from scratch. Downloading a new
library and adding a line to your program making use of it should take no longer to compile than adding a line to 
your program without adding a new library.

## Formatting

The language Unison represents a codebase as a sqlite database rather than traditional text. It achieves
incremental compilation by only inserting verified code that passed type checking and all
prior passes into this database. It would be possible for ante to store incremental compilation metadata in 
such a database as well. Advantages of this scheme would be leveraging a pre-existing tool and packing metadata
together into a single somewhat standard binary format.

## Limitations

This approach of distributing incremental compilation metadata has a few limitations that are worth noting.

### Space and Downloads

Locally, little to no extra space should be required from this feature as the extra incremental information downloaded
from a library would have been created anyway when users go to compile the library. It is possible to use extra space 
if the compiler ever stores extra information that would be unneeded for some users. For example, caching different llvm
IR representations that are dependent on the host's architecture. Solving this may either mean compressing the data so that
as little space as possible is duplicated, or it may mean not saving data that is very dependent on the host's system such 
as llvm IR.

Downloading this data rather than creating it on compilation would mean an increase in download times. Compared to Unison,
ante users would be downloading both the textual code and the incremental version rather than just the later. It is unclear
how much of a problem it would be in practice. One potential solution would be to ensure the incremental data of a library
or program contains all the information needed to compile it. Then downloading the release of a library from a package manager
would only entail downloading the metadata and not the source code itself. One potential issue with this solution is IDE integration.
A hypothetical ante-language-server could be able to read type signatures or documentation from this, but if the user wished
to explore the source code of the library they would likely only be able to see a pretty-printed AST recreated from the metadata.
