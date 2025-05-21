+++
authors = ["Jake Fecher"]
title = "Why Algebraic Effects?"
date = "2025-05-19"
categories = ["effects"]
banner = "img/banners/lantern3.jpg"
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

If you have further questions I again encourage you to read [some documentation]((/docs/language#algebraic-effects)) on effects, but now
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
    // `with` is sugar to apply effect handler functions, you can mostly ignore it
    with filter (fn x -> x % 2 == 0)
    with my_for_each print  // prints 2 then 4
```

You can similarly implement a cooperative scheduler with a `yield: Unit -> Unit` effect which
yields control back to a handler which switches execution to another function. [Here's an example](https://effekt-lang.org/docs/casestudies/scheduler)
of that in Effekt.

Basically, algebraic effects get you a lot of expressivity in your language, and as a bonus these different
effects interact well with each other as well. We'll get into this more later but algebraic effects composing well
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
        resume (DbResponse.Ok)

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
        resule, all_messages
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

## Nice APIs

- State effect, Allocator, Random, Parsers, Build Systems
- Writing in direct style, avoiding `map`

---

## Guaranteeing Purity

- spawn threads
- Software transactional memory (STM)
  - https://github.com/effekt-community/effekt-stm/blob/main/stm.effekt
- Capability-based Security

---

## Comparisons with Monads


[^1]: The "algebraic" in algebraic effects is mostly a vestigial term. Using "effect handlers" is probably more accurate but I'll be referring to these mostly as algebraic effects since that is the term most users are familiar with. Also I think it is confusing to say "effect handlers" when talking about the effect itself and not just the handler.
