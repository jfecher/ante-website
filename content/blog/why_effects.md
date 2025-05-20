+++
authors = ["Jake Fecher"]
title = "Why Algebraic Effects?"
date = "2025-05-19"
categories = ["effects"]
banner = "img/banners/lantern3.jpg"
+++

# Why Algebraic Effects

With the idea of algebraic effects slowly gaining more traction and as Ante's own implementation of algebraic effects gets closer to completion,
one thing I've noticed is that while there exists articles or documentation explaining _what_ algebraic effects are (including a
[section in Ante's documentation](/docs/language#algebraic-effects)), there are much fewer resources explaining _why_ you'd want them in the first place.
Often this is for practical reasons. If you want to give people a good understanding of algebraic effects, explaining how they work
is often essential. Here though I'm going to answer a different question: why should you care about algebraic effects? How can they be used in real
programs? Are they only for functional programmers who care about purity? Are they useful for ordinary business logic? Are they useful for low-level
programming?

The rest of this blog post will mostly be a list of different use cases algebraic effects are useful for. I'm not going to focus too much on the precise
details of the examples. The examples will also all be written in Ante pseudocode (surprise, surprise, I know) but should apply to most languages with
algebraic effects - I'll make a note where they do not.

Before we get into the actual examples I'll give you the quick summary: algebraic effects are useful because they allow programmers to implement
constructs like generators, exceptions, and asynchronous code in their own libraries without these being built-in language features. Moreover,
algebraic effects allow us to abstract out interfaces almost trivially - more on this later.

---

## User-defineable control-flow

- Generators, exceptions, async (https://effekt-lang.org/docs/casestudies/scheduler)
- Automatic Differentiation (https://effekt-lang.org/docs/casestudies/ad)

--- 

## Abstraction

- Dependency Injection
- Database

---

## Nice APIs

- State effect, Allocator, Random, Parsers, Build Systems
- Writing in direct style, avoiding `map`

---

## Guaranteeing Purity

- spawn threads
- Software transactional memory (STM)
  - https://github.com/effekt-community/effekt-stm/blob/main/stm.effekt

---

## Error Handling

One of the most common uses for algebraic effects [citation needed] is in error handling. You may have heard from other explanations that
algebraic effects "are basically resumeable exceptions" - and yeah, if you just don't resume an algebraic effect when it is performed you
get an exception! Why is this even exciting? For one, like exceptions, algebraic effects can be composed easily, so you don't have to
worry about error-enums (unless you want to):

```ante
import Std.File
import Library.LibError, lib_function

my_function () : Unit can IO, Throw File.Error, Throw String, Throw LibError =
    foo = File.open "foo.txt"  // may throw File.Error
    if foo.is_empty () then
        throw "empty file"     // may throw String

    lib_function foo           // may throw LibError
```

`File.Error` and `LibError` are both error types from separate libraries above and yet they're able to be used in `my_function` without
defining a custom error enum for it. The errors don't require special handling to just propagate them upward but are still explicit
in that they show up in the type of `my_function`.

Find all the typing annoying? You can define an effect type alias containing all of your effects:

```ante
import Std.File
import Library.LibError, lib_function

type alias MyErrors = can Throw File.Error, Throw String, Throw LibError

my_function () : Unit can IO, MyErrors =
    foo = File.open "foo.txt"
    if foo.is_empty () then
        throw "empty file"

    lib_function foo
```

So compared to error unions they compose more easily. How about compared to exceptions? What makes these anything more than just
checked exceptions in Java? Truth be told they are practically the same thing. The main difference I can note here is one of how
they tend to be handled. Where exceptions in object oriented languages tend to be handled with explicit an `try/catch`, effects
often make use of helper functions. For example, there is the `default` function which takes a function which `can Fail` and a default
value, and returns the default value on failure:

```ante
get_name (person: &Person) (names: &HashMap Person String): String =
    // handle the `can Fail` effect with the `default` function
    names.lookup person with default "whatshisname"
```

Note that `default` is just a normal function so any additional combinators can be easily defined:

```ante
default (f: Unit -> a can Fail) (default_value: a): a =
    // run f, and on failure return the default value
    handle f ()
    | fail () -> default_value
```

If you don't understand this code that is fine - you just need to know that algebraic effects can be used as exceptions fairly
easily and that they make combinator functions on them fairly simple to define which makes using them more ergonomic.

---

## State

A common pattern seen across many programs and libraries is the use of some sort of `Context` object passed around to
most functions. Algebraic effects can make this a bit more ergonomic by making the argument-passing of the Context
object implicit (while still keeping the fact it is happening explicit in the function type of course).

Compare:
```ante
// `!` is a mutable reference in Ante
eval (expr: Expr) (env: !HashMap String I32): I32 =
    match expr
    | Int x -> x
    | Var name -> lookup env name
    | Add lhs rhs -> eval lhs env + eval rhs env

lookup env name : I32 =
    env.lookup name with default 0
```

with:
```ante
eval (expr: Expr): I32 can Interpret =
    match expr
    | Int x -> x
    | Var name -> lookup name
    | Add lhs rhs -> eval lhs + eval rhs

lookup name : I32 can Interpret =
    env = Interpret.get ()
    env.lookup name with default 0
```

Now the code focuses more on the business logic rather than details of how state is passed around.
Of course this is missing the handler for the new `Interpret` effect but if we assume `Interpret` is
a type alias around a `Use (HashMap String I32)` effect (often called `State<HashMap<String, I32>>` in other languages),
then we can re-use the existing handler for that effect.

The above seems minor but genuinly does make some libraries and patterns nicer to use. Rustaceans may be aware of
the common pattern to give out indices into a central `Vec` or other collection as a way of simplifying ownership.
With a state effect, this central Vec wouldn't need to be passed around explicitly. Like with exceptions as well,
we could also define a type alias to combine state effects from passing around several of these without needing
to wrap them in a single gigantic struct.

### Globals

---

## Earlier Returns and Loops

A rather minor (but neet I think!) benefit of effects is something I call _earlier returns_. We're all familiar
with normal early returns:

```ante
try_find (needle: &a) (haystack: &Vec a): Maybe &a given Eq a =
    for item in haystack do
        if item == needle then
            // Early return!
            return Some item

    None
```

But what if we want to return to somewhere else other than the end of the current function?
For example, what if we're using iterator functions like `.for_each (...)` instead of a dedicated `for` loop?
Or what if we want to "return" out of the block but call a function on the return value before we return it?
Normally if there isn't a dedicated language feature for it we just can't. With algebraic effects though, it is quite easy to define
such a construct (in fact it looks identical to `Throw a`, it only differs in intent):

```ante
// Define our new effect
effect EarlyReturn a with
    early_return: a -> b

// Define the handler function for it
catch_early_return (f: Unit -> a can EarlyReturn a): a =
    handle f ()
    | early_return ret -> ret


try_find (needle: &a) (haystack: &Vec a): Maybe &a given Eq a =
    catch_early_return fn () ->
        for_each haystack fn item ->
            if item == needle then
                // Early return out of a helper function!
                early_return (Some item)

        None
```

TODO: continue & break as effects?

---

## Generators

---

## Capability-based Security

---

## Abstractions and Mocking

- Redirect IO into string buffer

---

## Async and Coroutines

---

## Prevent Side Effects Where it Counts

---

## Comparisons with Monads
