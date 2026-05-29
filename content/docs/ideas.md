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
# Overloading

Some form of overloading could help alleviate user frustration
by allowing modules like `Vec` and `HashMap` to both be imported despite defining conflicting names like `empty`,
`of`, `insert`, `get`, etc. Overloading would also reduce the need for abilities as users would no longer need to
use abilities to be lazy with their function names. It would however complicate documentation somewhat. An identifier
would no longer be uniquely determined by its full module path, referring to a specific instance of it must now
specify the full module path and type of the function.

Basic usage would be relatively simple:

```ante
import Map
import Vec

foo (map: HashMap I32 String) =
    elem = get map 4
    print elem
```

Here, the type checker has both `get: HashMap a b - a -> Maybe b` and `get: Vec a - Usz -> Maybe a` in scope.
Since it knows `map: HashMap I32 String`, there is only one valid choice and the code is thus unambiguous. It's worth
noting there may be implementation concerns - if we have more than 2 of these in scope, the resolution
order of these constraints could affect whether subsequent constraints can be inferred to a single instance or not.

In addition, there is the question of what should be done for the following code:

```ante
foo map =
    elem = get map 4
    print elem
```

This `foo` would be valid for both `map: HashMap (Int a) b` and `map: Vec b` (given `Print b`).
There are two options here:

1. We can be more flexible and generalize the constraint:

```ante
foo: a -> Unit given
    get: a -> Int b -> c,
    Print c
```

In which case we end up with a kind of compile-time duck typing. Worst case scenario if we made
a typo (`gett` instead of `get`), this could generalize our `gett` constraint instead of issuing
a method not found error. This seems like it can be avoided however by only generalizing if there
is actually at least 2 functions in scope with that name.

It is an open question whether generalized function requirements should be resolved via the set of
functions visible to the caller or just those visible to the definer. If it is the former, this functions
as a sort of ad-hoc ability feature and the "only generalize if there are at least 2 functions in scope" of the
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
that may match in scope. If the user still wishes to allow such functionality, they must use abilities
and implement the ability for each combination of types they want. This approach is less compatible with
type inference and may lead to users avoiding type inference to be able to use overloading. It may
also be a stumbling block for new programmers, though both of these proposals realistically may be.

---
# Compile-time Code Execution and Macros

Compile-time code generation is a powerful feature that is often required by certain use cases.
While it can often cause issues for language servers and error reporting, omission of any compile-time
execution or macros can be equally or more frustrating for the use cases that do need it.

A good starting place for compile-time execution and macros would be adding a `comptime` modifier
to signify something that is run at compile-time. In addition, `quote` can be a new operator which
quotes the code on its right hand side and returns an object of type `Code` that can be manipulated.
Other `Code` objects can be interpolated into this via `$`. `comptime` functions which return a
`Code` object will automatically interpolate this code into their callsite, unless the result is
captured with a `comptime` variable.

```ante
comptime loop_unroll (iterations: U8) (body: U8 -> Code) : Code =
    loop (i = 0) ->
        if i >= iterations
        then quote ()
        else quote
            $(body i)
            $(recur (i + 1))

comptime pow (base: Code) (exponent: U8) : Code =
    quote
        result = mut 1
        $(loop_unroll exponent fn _ ->
            quote result *= $base)
        result

x = mut 2
x = pow (quote x) 5
print x  //=> 32

// A `macro` keyword can be considered for compile-time functions which return `Code` values.
macro pow base (exponent: U8) =
    result = mut 1
    $(loop_unroll exponent fn _ ->
        quote result *= $base)
    result
```

This could be expanded to include compile-time introspection functions on `Code` objects to retrieve
the AST kind, type of the object, etc.

Implementing this scheme would likely require a full meta-cyclical evaluator. Compile-time functions
would be evaluated after type checking, and affected code may need to restart name resolution and
type checking until there are no more compile-time functions to be evaluated.

It would also be possible to implement `derive` using this:

```ante
comptime derive_functions = mut HashMap.new ()

comptime register_derive (function: Code -> Code) (ability_name: Code): Unit =
    insert derive_functions ability_name function

comptime derive (type_definition: Code) (ability_name: Code): Code =
    if not is_type_definition type_definition then
        error "derive can only be used on type definitions"

    match get derive_functions ability_name
    | Some derive_function ->
        new_impl = derive_function type_definition
        concat type_definition new_impl
    | None ->
        error "No derive function registered for ${ability_name}"
```

Using this, we could register a handler by:

```ante
!register_derive Eq
derive_eq (type_definition: Code): Code =
    arg1 = quote arg1
    arg2 = quote arg2

    // for structs return `arg1.field1 == arg2.field1 and ... and arg1.fieldN == arg2.fieldN`
    body = if is_struct_definition type_definition then
        derive_eq_struct_helper arg1 arg2 type_definition

    // for unions return `match union | Variant1 field1 .. fieldN -> case1 | Variant2 .. -> case2 | ... | VariantN .. -> caseN`
    // where each case is a struct derivation for Eq
    else if is_union_definition type_definition then
        variants = variants_of_type type_definition
        cases = map variants fn variant ->
            derive_eq_struct_helper arg1 arg2 variant

        into_match variants cases
    else
        error "derive_eq: Expected a type definition"

    typename = type_name type_definition
    generics = generics type_definition

    quote impl Eq ($typename $generics) with
        eq $arg1 $arg2 = $body


/// Transforms:
///   [`a`, `b`, .., `z`]
/// Into:
///   arg1.a == arg2.a and arg2.b == arg2.b and ... and arg1.z == arg2.z
comptime derive_eq_struct_helper (arg1: Code) (arg2: Code) (typ: Code): Code =
    fields = fields_of_type typ
    field_names = vecmap fields field_name

    calls = map fields fn field ->
        quote $arg1.$field == $arg2.$field

    join_with calls fn call1 call2 ->
        quote $call1 and $call2
```

Which could be used as:

```ante
!derive Eq
type MyType =
    x: I32
    y: U32
```

---
# Abilities Object Types

Abilities are already types in Ante, but they are more akin to a dictionary of functions
or a vtable than an actual object that can perform those operations. Usually an ability
like `Display t` will be paired with an actual object of type `t`. It is often useful however,
to bundle together an object with some abilities:

```ante
type DisplayObj = exists t env.
    value: t
    vtable: Display t env

implicit display_displayobj {obj: DisplayObj}: Display DisplayObj = Display with
    display obj = obj.vtable.display obj.value
```

There are some issues with this however:
- This is a rough equivalent to `dyn Trait` in Rust, but there is no `impl Trait` equivalent
- This relies on users manually creating wrappers for each ability they want to use
- This only works for abilities with a single non-env argument

To the second point, we could alleviate it a bit by making the type more generic:

```ante
type Obj (ability_: fn type type -> type) = exists t env.
    value: t
    vtable: ability_ t env
```

Now we could make a `DisplayObj` via `Obj Display` or use it with other traits like `Obj Hash`.
However, we can no longer define an implicit like `display_displayobj` before. We'd have
to return a generic value of `a (Obj a) env` somehow, but we cannot construct such a generic value
as-is. It may be possible if our `vtable` also held a constructor for the ability in question.

---
# Derive Without Macros

Ability deriving is an extremely useful feature for any language with abilities and ability impls.
It cuts down on so much boilerplate that I would even argue it to be necessary. Rust, for example,
relies on implementing derives via procedural macros which are quite difficult for IDEs to handle,
slow compile times, come with a hefty learning curve, and are required to be put in a separate crate.
To provide a derive mechanism without these downsides, I propose a system based on GHC's [Datatype
Generic Programming](https://wiki.haskell.org/GHC.Generics) in which we can define how to derive a
ability by specifying rules for what to do for product types, sum types, and annotated types.

Here's an example in ante (syntax not final):

```ante
ability Hash a =
    hash: fn a -> U64

derive Hash a via match a
| Product a b -> hash_combine (hash a) (hash b)
| Sum (Left s) -> hash s
| Sum (Right s) -> hash s
| Field t _name -> hash t
| Annotated t _anno -> hash t

type Foo = x: I32, y: I32

hash_foo = impl Hash Foo via derive
```

These would function somewhat as type-directed rules for the compiler to generate impls
from a given type. The exact cases we would need may push toward a different list of cases
(e.g. a simple Product pair type won't enable easy differentiation of the begin and end of a
struct's fields) so the final design may be more general with a bit more noise (e.g. we could
add StartStruct and StructEnd variants which may be useful for Serialization and other abilities).

The above strategy with Hash simply recurses on each field of the type. This is a common enough
usecase that we can consider even providing this as a builtin strategy to save users some trouble:

```ante
derive Hash a via recur hash_combine
```

If the ability functions take more than the single `a` parameter it is unclear if an error should be
issued or the strategy can default to passing along these parameters as-is. We could try to generalize
the `with` clause to accept a function taking all parameters and return values as well but this starts
to cut into its brevity and ease of use over the more general approach.

---
# Allocator Optimizations

The default allocator malloc in addition to its faster friends jemalloc and mimalloc are
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
    l1 = [1, 2, 3] : List I32
    l2 = [4, 5, 6] ++ l1
    ...
    ()
```

A naive implementation may allocate all these list nodes separately but since they are created adjacent
to each other and neither are needed outside the current function we should be able to optimize the 6
list node allocations into 1 call to the allocator. In this specific example, the allocator may also
simply be the stack itself since we do not need a dynamic lifetime for these nodes in this function.

Grouping allocations in this way however leads to questions on how aggressively we should group adjacent
items. What if they are separated by other definitions? Or arbitrary function calls? In general widening
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
ante users would be downloading both the textual code and the incremental version rather than just the latter. It is unclear
how much of a problem it would be in practice. One potential solution would be to ensure the incremental data of a library
or program contains all the information needed to compile it. Then downloading the release of a library from a package manager
would only entail downloading the metadata and not the source code itself. One potential issue with this solution is IDE integration.
A hypothetical ante-language-server could be able to read type signatures or documentation from this, but if the user wished
to explore the source code of the library they would likely only be able to see a pretty-printed AST recreated from the metadata.

---
# Builtin Recursion Schemes

Often in functional programming we encounter familiar looping patterns that can be factored out
into functions like map, filter, or fold. Functions over arbitrary recursive types (like trees)
however, tend to be written by hand with manual recursion.
[Recursion Schemes](https://hackage.haskell.org/package/recursion-schemes) provide a solution to
factoring out these recursive patterns, but they come with a high barrier to understanding and
require users to manually define a fixpoint version of their types. Ante could in theory create
and convert between the fixpoint version of the type behind the scenes to give users a nicer API.
Let's consider a sum function for a tree type:

```ante
type Tree =
   | Branch Tree Tree
   | Leaf I32

sum tree =
    match tree
    | Branch a b -> sum a + sum b
    | Leaf x -> x
```

We can use the `cata` (or `fold`) recursion scheme to replace each recursive part of our
data type with the result of our recursive function on that data. Here's an example using
a new `fold` keyword for this purpose:

```ante
sum tree =
    fold tree
    | Branch a b -> a + b
    | Leaf x -> x
```

So far, the little we gain in brevity is countered with the additional cognitive overhead
of requiring users to understand the additional construct(s) that would be added to the language.
Let's look at a more complex example:

```ante
type Ast =
    | Var String
    | Int I32
    | Let (name: String) (value: Ast) (body: Ast)
    | Add Ast Ast

free_vars (ast: Ast) : Set String =
    match ast
    | Var name -> [name]
    | Int _ -> []
    | Let name value body -> (free_vars value ++ free_vars body).remove name
    | Add l r -> free_vars l ++ free_vars r
```

And written with the cata/fold scheme:

```ante
free_vars (ast: Ast) : Set String =
    fold ast
    | Var name -> [name]
    | Int _ -> []
    | Let name value_names body_names -> (value_names ++ body_names).remove name
    | Add l r -> l ++ r
```

Another slight improvement. It is also worth noting that recursive functions taking multiple
parameters would not work with this scheme since it would not know which values to pass
at each recursive call. There are other recursion schemes including `ana` for unfolding, and
`hylo` for folding and unfolding, among many more that are more flexible, though adding these
must be weighed against the additional complexity they would add to the language. Currently the
expected benefit of adding support for recursion schemes directly into the language seems
too small to be worth the implementation effort, but it was still a useful avenue to explore.

---

# Refinement Types

Refinement types are an additional boolean constraint on a normal type.
For example, we may have an integer type that must be greater than 5.
This is written as `x: I32 where x > 5`. These refinements can be
written anywhere after a type is expected, and are mostly restricted
to numbers or "uninterpreted functions." This limitation is so we can
infer these refinements like normal types. If we instead allow any value
to be used in refinements we would get fully-dependent types for which
inference and basic type checking (without manual proofs) is undecidable.

Refinement types can be used to ensure indexing into a vector is always valid:

```ante
get (a: Vec t) (index: Usz where index < len a) : t = ...

a = [1, 2, 3]
get a 2  // valid
get a 3  // error: couldn't satisfy 3 < len a

n = random_in (1..10)
get a n  // error: couldn't satisfy n < len a

// The solver is smart enough to know len a > n <=> n < len a
if len a > n then
    get a n  // valid
```

Uninterpreted functions can also be used to tag values. The following
example uses this technique to tag vectors returned by the `sort`
function as being sorted, then restricting the input of `binary_search`
to only sorted vectors:

```ante
// You can name a return type for use in refinements
sort (vec: Vec t) : ret: Vec t where sorted ret = ...

binary_search (vec: Vec t where sorted vec) (elem: t) : Maybe (index: Usz where index < len vec) = ...
```

Type aliases can be used to cut down on the annotations:

```ante
SortedVec t = a: Vec t where sorted a

Index vec = x:Usz where x < len vec

sort (vec: Vec t) : SortedVec t = ...

binary_search (vec: SortedVec t) (elem: t) : Maybe (Index vec) = ...
```

Each of these refinements would be in the type system and would be checked during compile-time with the help of a SMT solver.

---
# Lifetime Inference

Lifetime inference (originally "region inference") is a technique
that can be used to conservatively estimate the lifetime of references
at compile time. If included into Ante, a lifetime-inferred pointer
would need to be an owning pointer type, e.g. `Ref t`. This is because
it has the ability to automatically extend the lifetime of its contents
depending on how far down the call stack the compiler infers that it
may reach.

If included in the language, `Ref`s can be created with `new : a -> Ref a`
and the underlying value can be accessed with `deref : Ref a -> a`. Here's
a simple example:

```ante
get_value () : Ref I32 =
    new 3

value = get_value ()

// the Ref value is still valid here and
// is deallocated when it goes out of scope.
print value
```

The above program would be compiled to the equivalent of destination-passing
style in C:

```c
void get_value(int* three) {
    *three = 3;
}

int main() {
    int value;
    get_value(&value);
    print(value); // print impl is omitted for brevity
}
```

The above program showcased we can return a `Ref` value to extend its
lifetime. Unlike borrowing for example, we can never have a lifetime error in this
system since the lifetime is simply extended instead.

There are many tradeoffs here however between lack of runtime
checks, compile-times, and runtime memory usage. It is possible, for example,
to statically determine the furthest stack frame any allocation may reach
and use that memory for the allocation (which may still be on the heap if the
inferred region must allocate multiple values). However, in practice many of
these objects could be deallocated far before the end of this stack frame is
reached. This can be improved with more complex analysis (like the
[AFL](https://www.microsoft.com/en-us/research/publication/better-static-memory-management-improving-region-based-analysis-of-higher-order-languages/)
or [imperative region management](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.388.4008&rep=rep1&type=pdf) schemes),
but there are still some fundamental issues of these schemes with regard
to collection types. The problem is since this analysis is type based, and
all elements in a collection have their type unified, then their lifetimes
are unified as well. Ante aims to mitigate this via move semantics and runtime
checks. These runtime checks would be configurable since lifetime inference
already assures memory safety, they would only serve to further tighten lifetimes
and deallocate earlier. Their exact form is indeterminate however and further
restricting inferred lifetimes could be an exciting part of research.

## Details

Internally, lifetime inference of refs would start out by using the original Tofte-Taplin
stack-based algorithm. This algorithm can infer references which
can be optimized to allocate on the stack instead of the heap
even if it needs to be allocated on a prior stack frame. The
tradeoff for this is that, as previously mentioned, the inferred
lifetimes tend to be imprecise. As such, `Ref`s should be avoided when
you need more precise control over when something is deallocated.
They would not be a complete replacement for other smart pointer types
such as `Box` and `Rc`.
The place where `Ref`s are typically worst is in implementing container types.
`Ref`s are implemented using memory pools on the stack under the
hood so any container that wants to free early or reallocate and
free/resize memory (ie. the vast majority of containers) should use
one of the smart pointer types to hold their elements instead.

For these reasons, lifetime inference isn't incredibly useful for Ante
today so it is not included in the language.

# Borrowing Alternatives

## Second-class reference parameters

Ante's previous design for borrowing used second-class references similar to [Hylo](https://www.hylo-lang.org/).
These are a good fit for parameters which is the majority use case for most references. Since
they are second class they do not allow being passed around anywhere (they are limited to purely
being a parameter-passing mode) and thus aren't allowed within structs at all. This removes
the complicated corner cases for the compiler but the programmer may still want to return
references or store them in structs for their use case.

For returning or storing references, the standard approach is to extend the second-class universe to
include second-class subscript functions, second-class structs, second-class closures, etc. Continuing with
this though means dividing the language into two colors: second-class and non-second class. Second-class references
not being a type for example means you'd need another separate `map` function which takes its argument by reference
instead of by value. This is quite the negative for Ante which uses algebraic effects to otherwise avoid the
function coloring problem which affects many other languages.

## First-class runtime-checked references

Alternatively, using a reference type that is first-class but has its lifetime checked at runtime instead
of compile-time (e.g. generational references). This avoids the coloring problem but incurs extra runtime
overhead and opens up the possibility for additional runtime errors.

Another point to consider is that allowing both mutable and immutable references to be first-class and untracked
breaks thread safety. We could easily have a program which sends an immutable reference to a separate thread
while the original thread mutates a mutable reference to the same value in a non-atomic manner. To prevent this,
these mutable references need to be removed entirely. Mutation of values however would still be possible through
the various wrapper types providing interior mutability such as `Cell`, `RefCell`, `Mutex`, etc. This preserves
thread safety since the compiler can see these types within a value and knows whether the type as a whole will
be thread safe if it uses no thread unsafe types like `Cell` or `RefCell`.

A downside to this approach is that it becomes much more awkward to mutate values since you must go through
one of these wrapper types:

```ante
type Ctx = logs: Cell (Vec String)

// Mutable references no longer exist so we can no longer tell from the
// signature of `log` that it mutates `self`
Ctx.log &self (new_log: String) =
    // Pushing to a vector is now a 3 step process
    mut logs = self.logs.take ()
    logs.push new_log
    self.logs.set logs
```
Using `RefCell` is not much better:
```ante
type Ctx = logs: RefCell (Vec String)

Ctx.log &self (new_log: String) =
    self.logs.borrow_mut () |>.push new_log
```

This would be a hit to the ease of use of mutable values in general, but its possible Ante as a more FP-leaning
language could get away with this by pushing for more immutability. This approach is actually fairly similar
to ML languages like OCaml which use primarily immutable values but allow mutation only through special types
like `ref`.

Lifetime errors being moved to a runtime error would help quicken workflow and lower annotation burden but
would also allow programmers to write invalid programs which appear correct but actually lead to lifetime
errors at runtime - potentially only in rare cases. Consider:

```ante
type Error =
   // Take a reference to log to avoid cloning the string
   | InvalidLog (log: &String)

Ctx.try_push_log &self (log: String): Unit can Throw Error =
    self.log log

    if too_many_logs self then
        last_log: &String = self.get_last_log ()
        throw (InvalidLog last_log)
```

This code may seem odd but fine but becomes increasingly problematic when used in contexts it was not
originally intended in. For example, we may want to collect all errors that occur _after_ `Ctx` gets
dropped. If this happens, any references within the `InvalidLog` variant would be invalidated and we'd
get a runtime error trying to print the string. With explicit lifetimes, the compiler would have caught
this and prevented the code to collect errors after context is dropped from being written in the first place.
Patterns like this require additional documentation to document where the lifetime of the log in `InvalidLog`
is coming from in the first place and the maximum time it can be expected to be valid. In addition,
additional unit tests may be needed to ensure lifetime errors do not arise in certain situations. At this
point, explicit lifetimes may be preferable since they enforce this documentation is provided, prevent
invalid code from being written, and require fewer unit tests.
