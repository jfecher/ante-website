+++
authors = ["Jake Fecher"]
title = "Why Algebraic Effects?"
date = "2025-05-21"
categories = ["effects"]
banner = "img/banners/lanterns.jpg"
+++

# Why Algebraic Effects

Algebraic effects[^1] (a.k.a. effect handlers) are a very useful up-and-coming feature that I personally think will see a huge surge in popularity in the programming
languages of tomorrow. They're one of the core features of Ante, as well as being the focus of many research
languages including [Koka](https://koka-lang.github.io/koka/doc/index.html), [Effekt](https://effekt-lang.org/), [Eff](https://www.eff-lang.org/),
and [Flix](https://flix.dev/). However, while many articles or documentation snippets try to explain _what_ effect handlers are (including
[Ante's own documentation](/docs/language#algebraic-effects)), I think few really take the time to focus on _why_ you would want to use them.
Believe me when I say that effect handlers have so many use-cases that it would be difficult to enumerate them all. That's why I'm going to focus
on a couple categories instead and do my best to mention use-cases that fall into those categories.

## A Note on Syntax and Semantics

I'll be using Ante pseudocode for much of this article. If you're not familiar with effect handlers or Ante I encourage you to read the documentation link
above or read from any of the other effectful languages for a good head start! But I recognize it's hard to get buy-in to learn something before showing
why it is useful first (hence this blog post!). So I'll give a quick elevator pitch on a good mental model to think about effects.

You can think of algebraic effects essentially as exceptions that you can resume. You can declare an effect function:

```ante
effect SayMessage with
    // This effect function takes a Unit type and returns a Unit type.
    // Note that `Unit` is roughly the same as `void` in imperative languages.
    // There are differences between them but none that are relevant here.
    say_message: Unit -> Unit
```

You can "throw" an effect by calling the function, and the function you're in must declare it can use that effect similar to checked exceptions:

```ante
foo () can SayMessage =
    say_message ()
    42
```

And you can "catch" effects with a `handle` expression (think of these as `try/catch` expressions):

```ante
handle foo ()
| say_message () ->
    print "Hello World!"  // print out Hello World!
    resume ()             // then resume the computation, returning 42
```

If you have further questions I again encourage you to read [some documentation](/docs/language#algebraic-effects) on effects, but now
that we can recognize effects when they're used I'll get into why exactly the idea of exceptions-you-can-resume are so useful!

---

## User-defineable control-flow

The most common reason you'll hear for why to have effect handlers is that they are a single language feature which
allow for implementing what would normally be multiple separate language features (generators, exceptions, async, coroutines, etc)
as libraries. Moreover, they solve the [what color is your function](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)
problem by making functions polymorphic over effects. For example, a `map` function for vectors (growable arrays) can be written once:

```ante
map (input: Vec a) (f: a -> b can e): Vec b can e =
    // Implementation omitted!
```

This function's signature says that the input function `f` can perform _any_ effect(s) `e`, and that
`map` will perform those same effects `e`. So we can instantiate this with an `f` that prints to stdout,
an `f` that calls asynchronous functions, an `f` that yields elements into a stream, etc. Most languages
with effect handlers will let you omit the polymorphic effect variable `e` as well, giving us the
old, familiar signature for `map`:

```ante
map (input: Vec a) (f: a -> b): Vec b =
    // Implementation omitted!
```

Ok, back to the topic though. Effect handlers are cool because we can implement generators, exceptions, coroutines,
[automatic differentiation](https://effekt-lang.org/docs/casestudies/ad), and much more with them. Surely such
constructs are difficult to implement, requiring low-level knowledge though, right? Nope. Most of these are pretty
straightforward actually.

Let's consider exceptions. Remember when I described algebraic effects as resumeable exceptions? This actually works
pretty well as a hint on how to implement exceptions via effects. How do we do it? Just don't `resume` the effect when it is thrown:

```ante
effect Throw a with
    throw: a -> never_returns

safe_div x y =
    if y == 0 then
        throw "error: Division by zero!"

    x / y

// Output: "error: Division by zero!"
handle 
    safe_div 5 0
    print "successfully divided by zero" // we never get to this point
| throw msg ->
    print msg
```

How about something more advanced? Surely generators must be more difficult? Well, a little but the code still fits
onto a sticky note:

```ante
effect Yield a with
    yield: a -> Unit

yield_all_elements_of_vec (vec: Vec a): Unit can Yield a =
    vec.for_each fn elem ->
        yield elem

// To filter a generator we're going to take in a generator function to filter
// as well as a predicate to tell us which elements to keep
filter (generator: Unit -> Unit can Yield a) (predicate: a -> Bool): Unit can Yield a =
    handle generator ()
    | yield x ->
        // when `generator` yields us an element, re-raise it if `predicate` returns true for it
        if predicate x then
            yield x
        resume ()  // continue yielding elements

// Finally, lets add a helper function for applying a function to each yielded element
my_for_each (generator: Unit -> Unit can Yield a) (f: a -> Unit): Unit =
    handle generator ()
    | yield x ->
        f x
        resume ()

// Let's use it!
yield_all_elements_of_vec (Vec.of [1, 2, 3, 4])
    // `with` is sugar to apply effect handler functions
    with filter (fn x -> x % 2 == 0)
    with my_for_each print  // prints 2 then 4
```

You can similarly implement a cooperative scheduler with a `yield: Unit -> Unit` effect which
yields control back to a handler which switches execution to another function. [Here's an example](https://effekt-lang.org/docs/casestudies/scheduler)
of that in Effekt.

Basically, algebraic effects get you a lot of expressivity in your language, and as a bonus these different
effects compose well with each other. We'll get into this more later but algebraic effects composing well
is a huge usability win over other effect abstractions.

--- 

## As an Abstraction

Okay, now that the really flashy stuff is out of the way I want to go over some less obvious benefits of algebraic effects.
Since discussion on effects can often seem like they're _only_ for implementing generators, exceptions, async, etc., I want to
highlight that even if you don't personally care for these features, there are still good reasons to use algebraic effects
in your run of the mill business application.

One reason to use them in such an application is that effects can be used for _dependency injection_. Let's assume
we have code that touches a database:

```ante
business_logic (db: Database) (x: I32) =
    db.query "..."
    db.query "..."
    db.query "..."
    x * 2
```

This is all well and fine until we want to use a different database, restrict access to this database, or you know, actually
test these functions. What we can do is move the database to an effect:

```ante
effect Database with
    query: String -> DbResponse

business_logic (x: I32) can Database =
    query "..."
    query "..."
    query "..."
    x * 2
```

Now we can swap out the specific database used further up the call stack (let's say in `main`) with a different database,
or even with a mock database for testing:

```ante
mock_database (f: Unit -> a can Database): a =
    handle f ()
    | query _msg ->
        // Ignore the message and always return Ok
        resume DbResponse.Ok

test_business_logic () =
    // Apply the `mock_database` handler to the rest of the function
    with mock_database

    assert (business_logic 0 == 0)
    assert (business_logic 1 == 2)
    assert (business_logic 21 == 42)
    // etc
```

We can even redirect print outs into a string:

```ante
output_messages (): U32 can Print =
    print "Hello!"
    print "Not sure what to write here, honestly"
    1234

// Collect `print` calls into a single string, separating each with newlines
print_to_string (f: Unit -> a can Print): a, String can Print =
    mut all_messages = ""

    handle
        result = f ()
        result, all_messages
    | print msg ->
        all_messages := all_messages ++ "\n" ++ msg
        resume ()

// Now we can test `output_messages` without it printing to stdout
test_output_messages () =
    int, messages = output_messages () with print_to_string
    assert (int == 1234)
    assert (messages == "Hello!\nNot sure what to write here, honestly")
```

Or conditionally disable logging output:

```ante
effect Log with
    log: LogLevel -> String -> Unit

type LogLevel = | Error | Warn | Info

LogLevel.greater_than_or_equal self (other: LogLevel): Bool =
    match self, other
    | Error, _ -> true
    | Warn, (Warn | Info) -> true
    | Info, Info -> true
    | _, _ -> false

foo () =
    log Info "Entering foo..."
    log Warn "foo is a fairly lazy example function"
    log Error "an error occurred!"

log_handler (f: Unit -> a can Log) (level: LogLevel): a can Print =
    handle f ()
    | log msg_level msg ->
        if level.greater_than_or_equal msg_level then
            print msg
        resume ()

foo () with log_handler Error  // outputs "an error occurred!"
```

---

## Cleaner APIs

Algebraic effects can also make designing cleaner APIs easier. A common pattern in just about
any programming language is the use of a `Context` object which often needs to be passed to
most functions in the program or library. We can encode this pattern as an effect. All
we need are functions to `get` the context and to `set` it:

```ante
effect Use a with
    get: Unit -> a
    set: a -> Unit
```

Most languages call this a state effect and it is generic over the type of state to use.

We can define a handler to provide the initial state value like so[^2]:

```ante
state (f: Unit -> a can Use s) (initial: s): a =
    mut context = initial
    handle f ()
    | get () -> resume context  // give the context to the caller of `get`
    | set new_context ->
        context := new_context
        resume ()
```

And we can use this to help clean up code that uses one or more context objects.
Let's imagine we have code which uses a vector internally and hands out references 
to elements as indices into this vector. This would normally require passing around
the vector everywhere:

```ante
type Strings = vec: Vec String
type StringKey = index: Usz

// `!` is a mutable reference
push_string (strings: !Strings) (string: String): StringKey =
    key = StringKey (strings.len ())
    strings.push string
    key

get_string (strings: &Strings) (key: StringKey): &String =
    strings.get key |> unwrap

append_with_separator (strings: !Strings) (string1_key separator string2_key: String) =
    string1 = get_string strings string1_key
    string2 = get_string strings string2_key
    push_string strings (string1 ++ separator ++ string2)

example (strings: !Strings) =
    string1 = push_string strings "Hello!"
    string2 = push_string strings "Goodbye."

    // We have to pass `strings` to every function in our call stack which needs it
    append_with_separator strings string1 " " string2

run_example () =
    mut context = Strings (Vec.new ())
    example !context
```

Using a state effect essentially threads through the context automatically:

```ante
type Strings = vec: Vec String
type StringKey = index: Usz

push_string (string: String): StringKey can Use Strings =
    mut strings = get () : Strings
    key = StringKey (strings.len ())
    strings.push string
    // We could modify `Use a` to give mutable references or
    // use it via `Use !Strings` but for the sake of example
    // we just make sure to `set` here when mutating `strings`.
    set strings
    key

get_string (key: StringKey): String can Use Strings =
    strings = get () : Strings
    strings.get key |> unwrap

append_with_separator (string1_key separator string2_key: String) can Use Strings =
    string1 = get_string string1_key
    string2 = get_string string2_key
    push_string (string1 ++ separator ++ string2)

example () can Use Strings =
    string1 = push_string "Hello!"
    string2 = push_string "Goodbye."
    // No need to pass `strings` manually
    append_with_separator string1 " " string2

run_example () =
    context = Strings (Vec.new ())
    example () with state context
```

From the above we can see we now have to call `get` or `set` to access `strings`
in the primitive operations `push_string` and `get_string`, but we no longer have
to explicitly pass around `strings` in code that just uses these primitive operations.
Generally speaking, this trade-off works well for libraries and abstractions which
will usually completely wrap these operations, eliminating the need for code using
these libraries to care about the internal details of how context objects are passed around.

This pattern pops up in quite a few places. Using a `Use a` effect locks us to passing
around a particular context type but we can also abstract the functions we need into
an interface. If the interface requires an internal context to implement it will be
automatically passed around with the effect handler. This leads us into the next point:

### As a substitute for globals

There are a few interfaces programmers may often think of as stateless but actually
require passing around state, often by global values for convenience. Some examples
of this are generating random numbers or simply allocating memory.

Let's consider an API for random numbers:

```ante
Prng.new (): Prng = ...

// Return a random byte
Prng.random !self: U8 = ...
```

We would have to require users to explicitly thread through the Prng object through their
program just to use random numbers for this API. This is perhaps a mild inconvenience but
it scales with the size of the program and is notable in that random numbers are usually
a small implementation detail to the program logic. Why should such a small implementation
detail cost so much to the terseness of the program? If we want to avoid this, we may make
the Prng a global, which many languages and libraries do, but this comes with the usual
downsides of globals - most notably requiring the object to be thread safe. If we make
it an effect like the following:

```ante
effect Random with
    // Return a random byte
    random: Unit -> U8
```

We gain the ability to thread it through a program mostly for free
(users must still explicitly initialize it somewhere up the call stack with a handler).
Plus, if we later decide we want to use `/dev/urandom` or some other source of random
numbers instead of the Prng object, we only need to swap out the effect handler. Nothing
else in the call stack needs to be changed.

Similarly, let's consider an `Allocate` effect:

```ante
effect Allocate with
    allocate: (size: Usz) -> Alignment -> Ptr a
    free: Ptr a -> Unit

// example usage
Box.new (elem: a): Box a can Allocate =
    ...
```

Such an effect would let us swap how we perform allocations by adding a different effect
handler for it somewhere up the call stack. We could use the global allocator for most calls,
then in a tight loop swap out each allocation in that loop with an arena allocator by just
adding a handler over the loop body.

I could go on with more examples of this (parsers, build systems, ...) but I think
you get the gist.

### Writing in a Direct Style

As a small note, effects being things that are thrown/performed rather than dedicated
values does often enable us to write in a more direct style compared to the alternative.

Exceptions are the easy example here, but just know this also applies to asynchronous
functions with `Future<T>` values or other types that are usually some wrapped effect.

So without exceptions we may use an error union or optional value like `Maybe t` which can be
`Some t` or `None`. If we have several computations returning results, we'll need
to `map` the `Some` value in-between steps:

```ante
// Imagine we have:
try_get_line_from_stdin (): Maybe String can IO = ...
try_parse (s: String): Maybe U32 = ...

// read an integer from stdin, returning that value doubled
call_result_functions (): Maybe U32 can IO =
    try_get_line_from_stdin () |>.and_then fn line ->
        try_parse line |>.map fn (x: U32) ->
            x * 2
```

This is cumbersome enough languages like Rust provide syntax-sugar like `?`
to automatically return error values and focus on the good path. That isn't
needed with effects though. The direct approach just works:

```ante
// Now imagine we have:
get_line_from_stdin (): String can Fail, IO = ...
parse (s: String): U32 can Fail = ...

// read an integer from stdin, returning that value doubled
call_result_functions (): U32 can Fail =
    line = Std.IO.Stdin.get_line ()
    x = parse line : U32
    x * 2
```

If we need to go off the good path we can just apply a handler:

```ante
call_result_functions (): U32 can Fail =
    // get_line's Fail effect is now handled by `default` which returns "42" instead of failing
    line = Std.IO.Stdin.get_line () with default "42"
    x = parse line : U32
    x * 2
```

Compared to error unions we never have to wrap our data in `Some`/`Ok` and we don't
have to worry about error types not composing well either:

```ante
// Now imagine we have:
LibraryA.foo (): U32 can Throw LibraryA.Error = ...
LibraryB.bar (): U32 can Throw LibraryB.Error = ...

type MyError = message: String

// Composing the different error types just works
my_function (): Unit can Throw LibraryA.Error, Throw LibraryB.Error, Throw MyError =
    x = LibraryA.foo ()
    y = LibraryB.bar ()
    if x + y < 10 then
        throw (MyError "The results of `foo` and `bar` are too small")
```

And if it gets too cumbersome to type out all those `Throw` clauses we can make a type alias
for the effects we want to handle:

```ante
AllErrors = can Throw LibraryA.Error, Throw LibraryB.Error, Throw MyError

my_function (): Unit can AllErrors =
    x = LibraryA.foo ()
    y = LibraryB.bar ()
    if x + y < 10 then
        throw (MyError "The results of `foo` and `bar` are too small")
```

---

## Guaranteeing Purity

Most languages with effect handlers (barring perhaps only OCaml) also use effects wherever
side-effects may occur. You may have noticed the `can Print` or `can IO` on previous examples,
and it's true - you can't use side-effects in Ante without marking that the function may perform
them[^3]. Setting aside the cases when `IO` or print outs are redirected or used for mocking,
these effects are usually handled in `main` automatically - so what benefit does it actually
provide by making programmers mark these functions?

For one, a number of functions actually require other non-side-effectful (ie. pure) functions
as input. When spawning threads for example, we can't allow the spawning thread to call into
handlers owned by our thread:

```ante
// Spawn all the given functions as threads and wait until they complete
spawn_all (functions: Vec (Unit -> a pure)): Vec a can IO = ...
```

There is also a technique for concurrency called Software Transactional Memory (STM) which
requires pure functions. It works by running many functions simultaneously and if a value is
ever mutated out from under one thread while it was performing a transaction, it just restarts
that transaction. For the curious, there's a proof of concept implementation of it in Effekt
[here](https://github.com/effekt-community/effekt-stm/blob/main/stm.effekt).

### Capability-based Security

The requirement to include all unhandled effects as part of the type signature of a function
helps greatly when auditing the security of libraries. When you call a function
`get_pi: Unit -> F64` you know that it isn't doing any sneaky IO in the background. If that
library is later updated to `get_pi: Unit -> F64 can IO` you know something suspicious is
probably happening, and you'll get an error in your code as long as the function you're calling
`get_pi` in doesn't already require the `IO` effect[^4][^5]. This has parallels with [Capability
Based Security](https://joeduffyblog.com/2015/11/10/objects-as-secure-capabilities/)
(bonus paper [Designing with Static Capabilities and Effects](https://arxiv.org/abs/2005.11444))
where we must pass around capabilities like `fs: FileSystem` as explicit objects and only
functions with these objects can access the file system.

---

Whew! That was a lot, but we made it through. Obviously this post focused on the positives of effects
and why I think they're going to be much more pervasive in the future, but there are negatives as well.
Mainly efficiency concerns, although it should be said that compilation output of effects has improved
greatly in recent years. Most languages with algebraic effects will optimize "tail-resumptive" effects
(any effect where the last thing the handler does is call `resume`) into normal closure calls. This is great
because this is already most effects in practice (citation needed - although _all_ the examples in this blog
post fit in this category!). Different languages also have their own strategies for optimizing the remaining
effect handlers: [Koka](https://koka-lang.github.io/koka/doc/index.html) uses
[evidence passing](https://www.microsoft.com/en-us/research/wp-content/uploads/2021/08/genev-icfp21.pdf)
and bubbles up effects to handlers to compile to C without a runtime, [Ante](https://antelang.org/) and 
[OCaml](https://github.com/ocaml-multicore/ocaml-effects-tutorial) limit `resume` to only being called
once which precludes some effects like non-determinism but allows the internal continuations to be implemented
more efficiently (e.g. via segmented stacks), and [Effekt](https://effekt-lang.org/) specializes handlers
out of the program completely[^6]!


[^1]: The "algebraic" in algebraic effects is mostly a vestigial term. Using "effect handlers" is probably more accurate but I'll be referring to these mostly as algebraic effects since that is the term most users are familiar with. Also I think it is confusing to say "effect handlers" when talking about the effect itself and not just the handler.
[^2]: This definition of `state` completely ignores ownership rules. We'd need a `Copy a` restriction for a real implementation but I didn't want to get side-tracked explaining ownership and traits in this post since it isn't relevant for effects in general. Most languages with algebraic effects allow pervasive sharing of values. Ante with its ownership semantics derived from Rust's is a bit of a black sheep here.
[^3]: The compiler can't check `extern` definitions for you, so the type definitions on those have to be trusted. There is also a (planned) way to perform an `IO` effect only when compiling in debug mode to allow debug printouts while still maintaining effect safety on release mode.
[^4]: This is one reason why it's usually preferable to declare the minimum amount of effects. Like saying your function `can Print` rather than bringing in all of `can IO`.
[^5]: The addition of a new effect to `get_pi` would also break semantic versioning so it can't be snuck into a bugfix version.
[^6]: This comes with the limitation that most functions are second-class but you can still get first-class functions by boxing them and switching to a pay-as-you-go approach. See [the docs](https://effekt-lang.org/tour/captures) as well as [this paper](https://dl.acm.org/doi/10.1145/3527320).
