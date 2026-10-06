+++
title = "Language Tour"
date = "2021-03-01"
categories = ["docs"]
+++

---

Ante is a low-level impure functional programming language. It is low-level
in the sense that types are not boxed by default and programmers can still
delve down to optimize allocation/representation of memory if desired. A
central goal of Ante however, is to not force this upon users and provide
sane defaults where possible. This can be seen in the ability to opt out
of move semantics and even temporary references much of the time by using
shared types which resemble programming in a garbage-collected language
with boxed values.

Compared to other low-level languages, Ante is memory safe like Rust but tries
to be easier in general, for example by allowing shared mutability by
default. Generally, application-level Ante code is meant to be written with
shared types to enable high-level code, while libraries are meant to use
ownership & borrowing internally to improve performance.

---
# Literals

## Integers

Integer literals can be of any signed integer type (I8, I16,
I32, I64, Isz) or any unsigned integer type (U8, U16, U32, U64, Usz) but by
default integer literals are [polymorphic](#int-type). Integers come in
different sizes given by the number in their type that specifies
how many bits they take up. `Isz` and `Usz` are the signed and unsigned
integer types respectively of the same size as a pointer.

```ante
// Integer Literals are polymorphic, so if we don't specify their
// type via a suffix then we can use them with any other integer type.
100 + 1usz == 101

// When no integer type is specified, integers default to `I32`
100 + 1 == 101

// Ante does not implicitly cast integer types. The following is a type error:
3u8 + 3u16

// Large numbers can use _ to separate digits
1_000_000
54_000_000_u64
```

## Floats

Floats in Ante conform to the IEEE 754 standard for floating-point arithmetic
and come in two varieties: `F32` and `F64` for 32-bit floats and 64-bit
floats respectively. Floats have a similar syntax to integers, but with
a `.` separating the decimal digits.

```ante
// Floats without a specified type are polymorphic and default to `F64`
3.0 + 4.5 / 1.5

// 32-bit floats can be created with the F32 suffix
3.0f32
```

Like integers, floating-point literals are also [polymorphic](#float-type).
If no type is specified they will default to `F64`.

## Booleans

Ante also has boolean literals which are of the `Bool` type and can be either
`true` or `false`.

## Characters

Characters in Ante are a single, 32-bit [Unicode scalar value](http://www.unicode.org/glossary/#unicode_scalar_value).
Note that since `String`s are UTF-8, multiple characters are packed into strings and if
the string contains only ASCII characters, its size in memory is 1 byte per character in the string.

```ante
print 'H'
print 'i'
```

Character escapes can also be used to represent characters not on a traditional keyboard:

```ante
'\n' // newline
'\r' // carriage-return
'\t' // tab
'\0' // null character

'\xFFFF' // an arbitrary Unicode scalar value given by the
         // number 'FFFF' in hex
```

## Strings

Ante supports several different string types for different use cases but the most common `String`
type which string literals are given by default is represented as a reference-counted pointer
to a growable UTF-8 string with copy-on-write semantics. `String` is not null terminated.
String literals in code are stored in read only memory and do not require heap allocation.
Attempting to mutate these values however, will be treated as if they are always aliased and
will invoke copy-on-write semantics which will copy to the heap before making the mutation.

This is meant to be relatively efficient for the general case, although users with more specific
optimization or representation requirements may wish to use alternative string types. Examples
of alternate types include the null-terminated `C.String` and the OS-dependent `OsString`.

```ante
var my_str = "Hello!"

hello = my_str  // String implements `Copy` with a relatively cheap rc-increment

// Modifying `my_str` will not modify `hello`
my_str.replace "H" "Y"
print my_str  //=> Yello!
print hello   //=> Hello!
```

## String Interpolation

Ante supports string interpolation via `$` or `${...}` within a string. Within
the brackets, arbitrary expressions will be converted to strings and spliced
at that position in the string as a whole.

```ante
name = "Ante"
print "Hello, $name!"
//=> Hello, Ante!

offset = 4
print "The ${offset}th number after 3 is ${3 + offset}"
//=> The 4th number after 3 is 7

```

---
# Variables

Variables are immutable by default and can be created via `=`.
Also note that Ante is strongly, statically typed yet we do not
need to specify the types of variables.
This is because Ante has global [type inference](#type-inference).

```ante
n = 3 * 4
name = "Alice"

// We can optionally specify a variable's type with `:`
reading_about_variables: Bool = true
```

## Mutability

A variable can be made mutable by using the `var` keyword when defining the variable:

```ante
// Mutable variables can be created with `var`:
var pet_name = "Ember"
print pet_name  //=> Ember

// And can be mutated with `:=`
pet_name := "Cinder"
print pet_name  //=> Cinder
```

Here's another example showing a function that can mutate the passed in parameter using a
temporary mutable reference (`mut`):

```ante
// We can do this with mutable state:
count_evens (array: Array n t) (counter: mut I32) =
    iter array fn elem ->
        if even elem then
            counter += 1

var counter = 0
count_evens [4, 5, 6] (mut counter)
count_evens [0, 2, 4] (mut counter)
print counter  //=> 5

// Although in practice it is good to prefer immutability:
count_evens2 (array: Array n t): I32 =
    array.filter even |> count

print (count_evens2 [4, 5, 6] + count_evens2 [0, 2, 4])
```

`mut <expr>` lets you take a temporary mutable reference to the given expression
on the right-hand side. In the case of variables and struct fields, this reference will refer
to the existing value, and will require the original variable to be mutable. In the case of
other values, such as those returned from a function, a temporary mutable reference is still
obtained.

```ante
var my_pair = 1, 2
my_pair.first := 3

// Without the `mut` this would copy the `second` field into a new variable
field_ref = mut my_pair.second
field_ref := 4

print my_pair  //=> 3, 4

// The following two lines give an error because we never declared `bad` to be mutable
bad = 1, 2
bad.first := 3  // error! `bad` is not mutable
```

# Functions

Functions in Ante are also defined via `=` and are just syntactic
sugar for assigning a lambda for a variable. That is, `foo1` and `foo2`
below are exactly equivalent except for their name.

```ante
foo1 a b =
    print (a + b)

foo2 = fn a b ->
    print (a + b)
```

Functions can have their parameter types and return types specified via `:`

```ante
bar (a: U32) (b: U32): Unit =
    print a
    print b
    print (a + b)
```

### Module Namespacing

By default functions are placed in the current module. Optionally, functions may also
be placed in a child module by prefixing the function's name with the module name.
For example:

```ante
Foo.bar (a: U32) (b: U32): Unit =
    print "I am defined in Foo now"
```

### Methods

Module namespacing is also how methods are defined. In Ante the `.` operator can be used
for method calls as well as field accesses. When used for method calls, the function name
will be searched for in the module with the same full path as the type of the first argument.

Methods may only be added to types defined in the current project. If the type is defined in
a dependency, it may not have new methods added to it.

When defining a method, the `self` variable can be used as an argument which is implicitly
of the same type as the module name. If there is no such type (e.g. it is just a normal module),
an error will be given. Like other parameters, `self` on its own will use move semantics. It
can also be borrowed either mutably or immutably by prepending a reference type such as `ref self`.

For example, the standard library defines the `Vec` type for a mutable vector and defines
methods on it like so:

```ante
type Vec a = ... // implementation omitted

Vec.new () = ...

Vec.push (vec: mut Vec a) (elem: a): Unit = ...

// Call the methods. This can be done without explicitly importing `Vec.new` or `Vec.push`:
var vec = Vec.new ()
vec.push "called"
vec.push "a"
vec.push "method!"
```

---
# Significant Whitespace

Ante uses significant whitespace to help declutter source code and prevent bugs
(such as Apple's infamous
[goto fail](https://nakedsecurity.sophos.com/2014/02/24/anatomy-of-a-goto-fail-apples-ssl-bug-explained-plus-an-unofficial-patch/)
bug). In general, Ante tries to be simple with its whitespace semantics:
if the next line is indented 2 or more spaces from the previous non-commented line
then an indent token is issued. If the lines differ by only 1 space then it is
considered to be a mistake and an error is issued. There is no notion of indenting
to or past an exact column like in Haskell's [offside rule](https://www.haskell.org/onlinereport/haskell2010/haskellch10.html#x17-17800010.3).

Secondly, anytime an unindent to a previous column occurs, an unindent token is issued.
Indents and unindents follow a stack discipline: each unindent is a return to a previous
indentation level rather than to a new one. So the following program is invalid since the
`else` was not unindented to the previous indent level.

```ante
if true then
        print "foo"
    else
        print "bar"
```

Thirdly, when a newline between two lines of code at the same indent level occurs,
a newline token is issued to separate the two expressions.

From these three rules we get `Indent`, `Unindent`, and `Newline` tokens which the
parser can parse just as if they were `{`, `}`, and `;` tokens in the source program.

## Line Continuations

With the above 3 rules the syntax is transformed into one with the equivalent of
explicit `{`, `}`, and `;` tokens. ~95% of programs just work now and Ante could stop
there if it wanted to, and for a long time it did. A problem arises however with the
third rule of using newlines as `;` tokens. Sometimes, users may wish to continue an
expression onto multiple lines. This is a problem with parallels of automatic semicolon
insertion in other languages. The main difference being Ante also has significant whitespace
to help it clue into this problem.

Ante's original solution was more of a band-aid. It followed the python example of continuing
lines with `\` at the end of a line which would tell the lexer not to issue a newline token.
There was also a similar rule for eliding newlines while we were inside `()` or `[]` pairs.
This solution was quite annoying in practice however. Ante is much more expression-oriented
than python and particularly when working with the [pipeline operators](#pipeline-operators) we would end up with a long
chain of lines ending with `\`:

```ante
data  \
|> map (_ + 2) \
|> filter (_ > 5) \
|> max

a = 3 + 2 *  \
    5 + 4    \
    * data

what_a_long_function_name \
    function_arg_with_long_name1 \
    function_arg_with_long_name2 \
    (a + 1)
```

In practice this ugly bit of syntax tended to discourage the otherwise good practice of
splitting long lines onto multiple lines. Ante thus needed a better solution. The goals
of the new solution were to be unambiguous, ergonomic, match a developer's mental model
of their program, and to issue error messages if needed instead of silently inferring the wrong thing.

This was initially difficult to solve but eventually Ante landed on a solution based upon the
observance that when programmers want to continue lines, they almost always use indentation
to do so. Thus, to continue an expression in Ante, the continuation must just be indented and
you can continue to use that same indentation level if you need multiple lines.

This is done by tracking when an indent is expected in the lexer and
only issuing the indent (and following unindent) if so. Ante's grammar is designed in
such a way that the lexer only needs to look at the previous token to find out if it expects
an indent afterward or not. These tokens that may have indentation after them are `if`, `then`,
`else`, `while`, `for`, `do`, `match`, `with`, along with `=`, `->`, and the assignment operators.
Semantically, these are the tokens needed for if-expressions, loops, match expressions, definitions,
and assignments. This is the list of tokens the programmer would normally need an indent for a block
of code after - it is analogous to knowing when you need to type `{` in curly-braced languages.

Note that an important part of this being implemented entirely in the lexer is that operator precedence
after continued lines just works (it is harder than it may seem if continuation is a parser rule).

When the lexer sees an indent without one of these tokens preceding it, it does not issue
an indent token and also does not issue newline tokens for any expression at that same level of
ignored indentation. Note that this is tracked on a per-block basis, so if we wanted we could
also still use constructs like `if` inside these blocks with ignored indentation - since we'd
be indenting to a new level and that new level would have the indent tokens issued as normal.

With this rule, we can continue any line just by indenting it. Here's the previous example again
with the new rule:

```ante
// |> is actually the exception to the "programmers typically indent
// continuation lines" rule. Naively trying the following lines however
// shows us another nice property of the rules above: we get an error
// if we mess up.
data
|> map (_ + 2)  // error here, |> has no lhs! We must continue the line by indenting it
|> filter (_ > 5)
|> max

// Here's the fixed, indented version
map data (_ + 2)
    |> filter (_ > 5)
    |> max

// The other examples work as expected
a = 3 + 2 *
    5 + 4
    * data

what_a_long_function_name
    function_arg_with_long_name1
    function_arg_with_long_name2
    (a + 1)
```

---
# Operators

Operators in Ante are normal names like `foo` or `bar`, just with special parser
support so we can call them infix (`foo + bar`) instead of prefix (`+ foo bar`) like other names.
Most operators are defined in [traits](#traits) in the prelude. Here are some
common operators:

```ante
// The standard set of numeric ops with operator precedence as you'd expect
trait Add a =
    (+): fn a a -> a

trait Sub a =
    (-): fn a a -> a

trait Mul a =
    (*): fn a a -> a

trait Div a =
    (/): fn a a -> a

/// `%` is modulus rather than remainder. For unsigned numbers there is no
/// difference, but for signed numbers `-3 % 5` would be `2` for modulus and `-3` for remainder.
trait Mod a =
    (%): fn a a -> a

/// `%%` is a convenience operator for checking if `a` is divisible by `b` without a remainder
(%%) a b = a % b == 0

trait Eq a =
    (==): fn (ref a) (ref a) -> Bool

(!=) a b = not (a == b)

// Comparison operators are implemented in terms of the `Cmp` trait
trait Cmp a =
    compare: fn (ref a) (ref a) -> Ordering

type Ordering = | Lesser | Equal | Greater

(<) a b = compare a b == Lesser
(>) a b = compare a b == Greater
(<=) a b = compare a b != Greater
(>=) a b = compare a b != Lesser
```

There are also various compound assignment operators for convenience
when mutating data, including `+=`, `-=`, `*=`, `/=`, and `%=`.

Logical operators have their names spelled out fully and will short-circuit:
```ante
if true and false then print "foo"

if false or true then print "bar"

if not false then print "baz"

// This will not call spill_the_soup
if true or spill_the_soup () then ..
```

`and` binds tighter than `or`, so the following prints `true`:
```ante
if false and true or true and true then
    print true

// parsed as:
if (false and true) or (true and true) then
    print true
```

Since fiddling with individual bits is not a common operation, and precedence of these
operators in other languages is often confused, there are no bitwise operators in Ante.
Instead, there are functions in the `Bits` module for dealing with bits.

## Subscript Operator

The subscript operator for retrieving elements out of a collection
is spelled `a.[i]` in Ante. The more common spelling of `a[i]`
would be ambiguous with a function call to a function `a` taking a single
argument that is a collection with 1 element `i`.

```ante
average_first_two array =
    (array.[0] + array.[1]) / 2
```

Note that `.[]` has a high enough precedence to be used in function calls:

```ante
foo array.[0]
```

Additionally, references to elements can be retrieved using the subscript operator
with a reference kind:

```ante
print (ref my_array.[0])

mutate (mut my_array.[1])
```

## Dereference Operator, Copy, and Clone

Dereferencing a reference in Ante requires the element type of the reference to implement
either `Copy` or `Clone`. Both traits have the same semantics in that they both perform
copies (although certain values like `Rc t` may be shared), but types implementing `Copy`
are generally expected to be cheaper to copy than types only implementing `Clone`.

These traits can be called via the `copy` or `clone` functions, but there is also the
postfix `.*` operator available as an alias to `copy`. This operator has a higher precedence
than function calls and can be more convenient in some cases.

```ante
type Person = age: U8, name: String

foo (person: ref Person) (id: ref U32) =
    bar person.age.* id.*

bar (a: U8) (b: U32) = ...
```

If you need to access a struct field, `struct.field` will retrieve a reference to the
given field if `struct` is a reference, otherwise it will attempt to copy or move the
field out of the struct. Also note that if a value was expected but a reference was
provided, there is a coercion such that the reference will be automatically copied,
providing its element type implements `Copy`. This means `foo` above could be rewritten to:

```ante
foo (person: ref Person) (id: ref U32) =
    bar person.age id
```

There is also an equivalent coercion if an immutable reference (`ref` or `imm`) was expected
but a value was provided to automatically reference the value. Mutable references must
remain explicit however.

> Note that there is no requirement for `Copy` types to be memcpy-able. Instead it is
> used for types which are "cheap" to copy - usually meaning they don't need to allocate
> any memory on the heap. A result of this is that `Rc t` implements `Copy`.

## Pipeline Operators

The pipeline operators `|>` and `<|` are sugar for function application and
serve to pipe the results from one function to the input of another.

`x |> f y` is equivalent to `f x y` and functions similar to method syntax
`x |> f(y)` in object-oriented languages. It is left-associative so `x |> f y |> g z`
desugars to `g (f x y) z`. This operator is particularly useful for chaining
iterator functions:

```ante
// Parse a csv's data into a matrix of integers
parse_csv (text: String): Vec (Vec I32) =
    lines text
        |> skip 1  // Skip the column labels line
        |> split ","
        |> map parse
        |> collect
```

In contrast to `|>`, `<|` is right associative and applies a function on its
left to an argument on its right. Where `|>`
is used mostly to spread operations across multiple lines, `<|` is often
used for getting rid of parentheses on one line.

```ante
print (sqrt (3 + 1))

// Could also be written as:
print <| sqrt <| 3 + 1
```

### Pipelines and Methods

Note that method calls can still be used with the pipeline operators.
Method calls also work stand-alone (e.g. `.push 3` is short for `_.push 3`)
as long as the expected object type can be figured out by the environment.
So one can write code such as:

```ante
Vec.of [1, 2, 3] |> .split_first  // (1, [2, 3])
```

## Pair Operator

Ante does not have tuples, instead it provides a right-associative pair
operator `,` to construct a value of the pair type. We can use it like
`1, 2, 3` to construct a value of type `I32, I32, I32`
which in turn is just sugar for `Pair I32 (Pair I32 I32)`.

Compared to tuples, pairs are:

1. Simpler: They do not need to be built into the compiler or its type
system. Instead, they can be defined as a normal struct type in the standard
library:

```ante
type Pair a b = first: a, second: b
```

2. Easier to work with: Because pairs are just normal data types, we get
all the capabilities of normal types for free. For example, we know all pairs
will have exactly two fields. This makes creating `impl`s for them much easier.
Let's compare the task of converting a tuple to a string with doing the same for pairs.
With tuples we must [create a different impl for every possible tuple size](https://hackage.haskell.org/package/base-4.14.1.0/docs/src/GHC.Show.html#line-268).
With pairs on the other hand the simple implementation works for all sizes:

```ante
impl cast_pair_string: Cast (Pair a b) String with
    cast (a, b) = "$a, $b"
```

3. Just as efficient: both pairs and tuples have roughly the same representation
in memory (the exact same if you discount alignment differences and reordering of fields).

4. More composable: having the right-associative `,` operator means we can
easily combine pairs or add an element if needed. For example, if we had a function
`unzip: fn (List (a, b)) -> List a, List b`, we could use `unzip` even on a `List (a, b, c)`
to extract a `List a, List (b, c)` for us. This means if we wanted, we may implement
`unzip3` using `unzip` (though this would require two traversals instead of one):

```ante
// given we have unzip: fn (List (a, b)) -> List a, List b
unzip3 (list: List (a, b, c)): List a, List b, List c =
    as, bcs = unzip list
    bs, cs = unzip bcs
    as, bs, cs
```

- Another place this shows up in is when deconstructing pair values.
Let's say we wanted to define a function `first` for getting the first
element of any tuple of length >= 2 (remember, we are using nested pairs,
so there are no 1-tuples!), and `third` for getting the third
element of any tuple of length >= 3. We can define the functions:

    ```ante
    first (a, _) = a
    third (_, _, c) = c

    first (1, 2) == 1
    first ("one", 2.0, 3, 4) == "one"

    third (1, 2, 3) == 3
    third (1, "two", 3.0, "4", 5.5) == (3.0, "4", 5.5)

    // If the above is confusing, remember that , is right-associative,
    // so the parser will parse `third` and the call as follows:
    //
    // third (_, (_, c)) = c
    // third (1, ("two", (3.0, ("4", 5.5)))) == (3.0, ("4", 5.5))
    ```

    Note that to work with nested pairs of any length >= 3 instead of >= 4, our implementation of
    `third` will really return a nested pair of `(third, rest...)` for
    pairs of length > 3. This is usually what we want when working with
    generic code (since it also works with nested pairs of exactly length 3 and
    enables the nice syntax in the next section).

One last minor advantage of pairs is that we can use the fact that `,` is
right-associative to avoid some extra parentheses compared to if we had tuples.
A common example is when enumerating a tuple, most languages would need two sets
of parentheses but in Ante since tuples are just nested pairs you can just add another `,`:

```ante
pairs = [(1, 2), (3, 4)]

// Other languages require deconstructing with nested parentheses:
for (i, (one, two)) in enumerate pairs do
    print "Iteration $i: sum = ${one + two}"

// But since `,` is just a normal operator,
// the following version is equally valid
for i, one, two in enumerate pairs do
    print "Iteration $i: sum = ${one + two}"
```

Finally, it's necessary to mention that the earlier `Cast` example printed nested
pairs as `1, 2, 3` whereas the `Show` instances in Haskell printed tuples as `(1, 2, 3)`.
If we wanted to surround our nested pairs with parentheses we have to work a bit
harder by specializing the impl for pairs:

```ante
impl cast_pair_string: Cast (Pair a b) String with
    cast pair = "(${to_string_no_parens pair})"

// Convert a pair to a string without parens
to_string_no_parens (x, y) =
    str = "${x}, "
    rhs = if Type.of y |> is_pair_type then to_string_no_parens y else cast y
    str ++ rhs
```

And these two functions will cover all possible lengths of nested pairs.

---
# Lambdas

Lambdas in Ante have the following syntax: `fn arg1 arg2 ... argN -> body`.
All functions in Ante must have at least one parameter. When the first argument is excluded (as in `fn -> body`), 
this is taken as sugar for a function taking a `Unit` parameter: `fn () -> body`.

Additionally a function definition
`foo a b c = body` is sugar for a variable assigned to
a lambda: `foo = fn a b c -> body`.

Lambdas can also capture part of
the variables in the scope they were declared in. When they do this,
they are called closures:

```ante
augend = 2
data = 1..100

map data fn x -> x + augend
//=> 3, 4, 5, ..., 100, 101
```

## Explicit Currying

While Ante opts out of including implicit currying in favor of better
error messages, it does include an explicit version where arguments
of a function can be explicitly curried by placing `_` where that argument
would normally go. For example, in the following example, `f1` and `f2` are
equivalent:

```ante
f1 = fn x -> x + 2
f2 = _ + 2
```

Compared to implicit currying, explicit currying lets us curry function
arguments in whatever order we want:

```ante
add3 a b c = a + b + c

g1 = add3 _ 0 _

// g1 is equivalent to:
g2 = fn a c -> add3 a 0 c
```

Explicit currying only curries the innermost function, so using
it with nested function calls will yield a type error unless the
outermost function is expecting another function:

```ante
// Nesting _ like this gives a type error:
// add3 expects an integer argument but a function was given.
nested = add3 1 2 (_ + 3)

// To make nested a function, it needs to be rewritten as a lambda:
nested = fn x -> add3 1 2 (x + 3)

// Or a function definition
nested x = add3 1 2 (x + 3)
```

`_` really shines when using higher order functions and iterators:
```ante
// Given a matrix of Vec (Vec I32), output a String formatted like a csv file
map matrix to_string
  |> map (join _ ",") // join columns with commas
  |> join "\n"        // and join rows with newlines.
```

---
# Control-Flow

Ante's control flow keywords should be very familiar to any programmer used
to expression-based languages.

If expressions expect a boolean condition (there are no falsey values) and
conditionally evaluate and return the then branch if it is true, and the
else branch otherwise. The else branch may also be omitted - in that case
the whole expression returns the unit value. The if condition, then branch,
or else branch can either be single expressions or an indented block expression.

```ante
three = if false then 2 else 3

if should_print () then
    print three
```

## Loops

Ante includes the traditional `for` and `while` loops along with `break` and `continue`.
`for` loops must iterate over an increasing range. For anything more complex, streams must be used.

```ante
for i in 0 .. 10 do
    if i %% 3 then continue
    if i > 7 then break
    println i

while true do println "hello"
```

For more complex loops, Ante favors recursive functions like `map`, `foldl`, `iter`, and `for_`, which operate on streams:

```ante
iter (0..10) println   // prints 0-9 inclusive

// `for_` allows using `continue_` and `break_` via the `Loop` effect
for_ (enumerate array) fn (i, elem) ->
    if i %% 3 then continue_ ()
    if i > 7 then break_ ()
    print elem
```

Occasionally, it is natural to reach for a recursive function:

```ante
sum numbers =
    go numbers total =
        match numbers
        | Nil -> total
        | Cons x xs -> go xs (total + x)

    go numbers 0
```

But this can be cumbersome when you just want a quick loop in the middle of a function.
For this case, Ante provides the `loop` and `recur` keywords for creating an immediately
invoked helper function. The following definition of sum is equivalent to the previous:

```ante
sum numbers =
    loop numbers (total = 0) ->
        match numbers
        | Nil -> total
        | Cons x xs -> recur xs (total + x)
```

After the loop keyword comes a list of variables/patterns which are translated into the
parameters of the helper function. If these variables are already defined like numbers
is above, then the value of that variable is used for the initial invocation of the helper
function. Otherwise, if the variable/pattern isn’t already in scope then it must be supplied
an initial value via =, as is the case with total in the above example. The body of the loop
becomes the body of the recursive function, with recur standing in for the name of the function.

Since loop/recur uses recursion internally it is even more general than loops, and can be
used to translate otherwise complex while loops into Ante. Take for example this while loop
which builds up a list of the number’s digits, mutating the number as it goes:

```c++
list<unsigned int> get_digits(unsigned int x) {
    list<unsigned int> ret;
    while (x != 0) {
        unsigned int last_digit = x % 10;
        ret.push_front(last_digit);
        x /= 10;
    }
    return ret;
}
```

This can be translated into Ante as the following loop:

```ante
get_digits (x: U32): List U32 =
    loop x (digits = Nil) ->
        if x == 0 then return digits
        last_digit = x % 10
        recur (x / 10) (Cons last_digit digits)
```

---
# Pattern Matching

Pattern matching on algebraic data types can be done with a `match`
expression:

```ante
match foo
| Some bar -> print bar
| None -> ()
```

Since `match` is an expression, each branch must match type. The value
of the matched branch is evaluated and becomes the result of the whole
match expression. The compiler will also warn us if we forget a case
or include one that is redundant and will never be matched.

```ante
// Error: Missing case: Some None
match foo
| Some (Some bar) -> ...
| None -> ...
```

Note that in Ante variables must be lower case while type constructors are
uppercase. This carries over to match expressions where each uppercase word
is a tag to match on while each lowercase word is a variable to bind. This reduces
the common error in other languages of misspelling a tag value and accidentally
creating a new variable binding and match-all pattern in doing so.

If a variable binding is created but otherwise unused it will issue an unused
warning unless its name starts with an underscore:

```ante
match foo
| Some bar -> () // warning: `bar` is unused
| None -> ()

match foo
| Some _bar -> () // ok!
| None -> ()
```

If a type has many fields to match on but several are unneeded, they can be omitted
with `..`:

```ante
type MyStruct =
    foo: I32
    bar: I32
    baz: I32
    qux: I32

match MyStruct 1 2 3 4
| MyStruct .. -> print "This struct is indeed a struct"

// `..` also works for a subset of fields:
match MyStruct 1 2 3 4
| MyStruct my_foo my_bar .. -> print "foo = $my_foo, bar = $my_bar"
```

As seen above, structs are matched using positional argument order similar to how they are constructed.
They may also be matched by field name using the same `with` syntax for named struct field construction:

```ante
match MyStruct 1 2 3 4
| MyStruct with bar, qux, .. -> print "bar = $bar, qux = $qux"

// Fields can be renamed:
match MyStruct 1 2 3 4
| MyStruct with bar = bar2, .. -> print "bar = $bar2"
```

In addition to the usual suspects (tagged-unions, structs, pairs), we can
also include literals and guards in our patterns and it will work as
we expect:

```ante
type IntOrString =
   | Int I32
   | String String

match Int 7
| Int 3 -> print "Found 3!"
| Int n if n < 10 -> print "Found a small Int!"
| String "hello" -> print "Found a greeting!"
| value -> print "Found something else: $value"
```

Note that there are a few subtle design decisions:

1. All type constructors must be capitalized in Ante, so when
   we see a lower-case variable in a pattern match we know we
   will always create a new variable rather than match on some
   nullary constructor (like `None`).

2. Each pattern is prefixed with `|` rather than being indented like
   in some other languages. Doing it this way means if we indent the
   body as well, we only need to indent once past the `match` instead
   of twice which saves us valuable horizontal space.

## `is` Operator

The `is` operator can be used to pattern match within arbitrary expressions.
The syntax for an `is` expression is `<expr> is <pattern>`. These expressions
can be used to test whether an expression matches a particular case, for example:

```ante
shared type Expr =
   | Int I32
   | Var String
   | Add Expr Expr

is_variable (e: Expr) =
    e is Var _

print (is_variable (Var "foo")) //=> true
print (is_variable (Int 3))     //=> false
```

If an `and` is used after the `is` expression, any variables defined in the pattern
will be in scope of the right-hand side of the `and` expression:

```ante
is_even_int (e: Expr) =
    e is Int x and even x
```

Note that because `<expr> is <pattern>` is an expression and `and` also accepts two expressions,
chaining matches is also possible:

```ante
print_if_large_product (x: Maybe I32) (y: Maybe I32) =
    if x is Some x2 and y is Some y2 and x2 * y2 > 1000 then
        // x2 and y2 are still in scope
        print (x2 * y2)
```

Additionally, as we saw above, if `is` expressions are used within an `if` condition (or match guard)
the variables defined within the `is` expression will also be in scope of the corresponding
`if` or `match` branch. Note that for these variables to be in scope, the `is` expression
must be in the outermost portion of the condition such that only `and` expressions may be
joining them. An `is` in a nested expression like `if e is Var a or e is Int x then ...` will
not have its variables in scope of the then branch since `a` or `x` may not actually be matched.
If this happens you'll get a compiler warning that `a` and `x` cannot be used (since they will
never be in scope).

With these limitations in mind, `is` can still be a very useful operator to shorten code using
pattern matching.

```ante
incorrect_example (x: Maybe I32) =
    if not (x is Some y) and y > 2 then //error! `y` is not in scope here: (x is Some y) may not match
        ...
```

```ante
evaluate (e: Expr) (env: HashMap String I32): I32 can Error =
    match e
    // We can check if `name` is in our HashMap within this match
    | Var name if lookup env name is Some value -> value
    | Var name -> error "${name} is not defined"
    | Int x -> x
    | Add lhs rhs -> evaluate lhs env + evaluate rhs env
```

---
# Type Inference

Types almost never need to be manually specified due to the global type inference
algorithm which is based on an extended version of Hindley-Milner with let-polymorphism
and implicits, among other extensions.

This means Ante can infer variable types, parameter types, function return types, and
even infer which traits and effects are needed in generic function signatures.

```ante
// Something is iterable if we can call `next` on it and
// get either Some element and the rest of the iterator or
// None and we finish iterating
trait Iterator it elem =
    next: fn it -> Maybe (it, elem)

first_equals it target =
    match next it
    | Some (_, x) -> x == target
    | _ -> false
```
We never gave any type for `first_equals` yet Ante infers its type for us as
`fn a b {Iterator a b} {Eq b} -> Bool` - that is a function that returns a `Bool` and takes
two generic parameters along with an [implicit parameter](#implicits) which is an instance
of the iterator trait for an iterator of type `a` producing elements of type `b`.

### Type Inference in Idiomatic Code

Note that while global type inference is possible, it is not idiomatic to have large
code bases omitting types on every function. Generally speaking, the larger the code base,
the more important it is to have clear type signatures for globally visible functions to
improve type errors in the case types change. Given it is preferred to have explicit type
signatures for functions, one may wonder why offer type inference on them at all? There
are a few reasons for this.

1. When contributing to a new or existing code base a developer often adds a couple of functions at a time.
The intended work-flow of Ante is to omit the types of these functions,
and when the programmer is satisfied, they can have the compiler write in the
inferred function types itself after a successful compilation. This way the programmer does less
unnecessary work but still gets explicit types in the end. They are also still free to write explicit
types for any particularly difficult functions they need before then to help with type errors.

2. For smaller scripts it can be nice to write code without types. A type error affecting the inferred
types of other functions is less of an issue when you only have a handful of them and don't intend to write more.

3. Even in larger code bases, inferred types on functions can still be useful in some rare cases like
particularly trivial helper functions, or trait methods where the trait always dictates the function
type anyway.

4. In a teaching scenario, it can be useful to have the flexibility to defer teaching about types a little.
They should likely still be taught early but any bit of lowering the initial shock value for students new to programming can help.

---
# Types

Ante is a strongly, statically typed language with global type inference.
Types are used to restrict the set of values as best as possible such that
only valid values are representable. For example, since references in Ante
cannot be null we can instead represent possibly null references with
`Maybe (ref t)` which makes it explicit whether a function can accept or
return possibly null values.

## Type Definitions

Both struct and tagged union types can be defined with the
`type Name args = ...` construct where `args` is the space-separated
list of type variables the type is generic over.

You can define struct types with commas separating each field or
newlines if the type spans multiple lines:

```ante
type Person = name: String, age: U8

// `a` is a generic type parameter which can stand in for any type later. For example,
// `Vec I32` would be a vector of integers while `Vec String` would be a vector of strings.
type Vec a =
    data: Ptr a
    len: Usz
    capacity: Usz
```

### Optional Type Parameters

Type parameters can be made optional by specifying a default value with `=`. Optional type parameters must be at
the end of a type's parameter list and the default type given can reference any prior type parameter as well.
If a value of `_` is given as the default, e.g. in `type Foo (t = _)`, then the type parameter will be defaulted
to a fresh type parameter when otherwise unspecified. Optional type parameters are commonly used in [trait types](#traits).

```ante
/// We want to write a `Thunk` type alias for closure types but don't want
/// users to have to specify the closure environment type. Like normal closure
/// types, the optional `env` here allows users to leave it implicit most of the
/// time but still specify it when needed.
type Thunk t (env = _) =
    fn Unit [env] -> t

run_thunk (thunk: Thunk I32): I32 =
    thunk ()

/// All optional parameters must be explicit in type definitions
type TwoThunks (env1 = I32) (env2 = Vec env1) =
    thunk1: Thunk String env1
    thunk2: Thunk U32 env2
```

### Tagged Unions

Tagged unions can be defined with `|`s separating each variant.
The `|` before the first variant is mandatory. Ante currently has
no support for untagged C unions.

```ante
type Maybe t =
   | Some t
   | None

type Result t e =
   | Ok t
   | Err e
```

#### Repeated Union Fields

Many tagged unions include one or more of the same fields between all variants. Often this leads
to refactoring the tagged union into two types: the tagged union and a wrapper struct.
This hampers readability though, and makes matching on these types more cumbersome,
particularly hurting nested matches which now have to go through an additional struct.

```ante
shared type ExprInner =
    | Int I32
    | Var String
    | Add Expr Expr

type Expr =
    inner: ExprInner
    location: Location

simplify (expr: Expr): Expr =
    match expr.inner
    | Int x -> Expr (Int x) expr.location
    | Var s -> Expr (Var s) expr.location
    | Add (Expr (Int 0) _lhs_loc) rhs -> rhs
    | Add lhs (Expr (Int 0) _rhs_loc) -> lhs
    | Add lhs rhs -> Expr (Add (simplify lhs) (simplify rhs)) expr.location
```

This pattern can be improved with the `with` keyword which will include a given list of fields
in all union variants, eliminating the need for a wrapper struct.
These extra fields are placed at the end of each variant's list of fields.

```ante
shared type Expr =
    | Int I32
    | Var String
    | Add Expr Expr
    with location: Location

simplify (expr: Expr): Expr =
    match expr
    | Int x loc -> Int x loc
    | Var s loc -> Var s loc
    | Add (Int 0 _lhs_loc) rhs _loc -> rhs
    | Add lhs (Int 0 _rhs_loc) _loc -> lhs
    | Add lhs rhs loc -> Add (simplify lhs) (simplify rhs) loc
```

Each of the locations in the first two `Add` cases was written explicitly here to show where they would go, but if
these fields are unneeded in a pattern match they can also be excluded with `..` which will
automatically fill in any remaining fields in a pattern:

```ante
simplify (expr: Expr): Expr =
    match expr
    | Int x .. -> Int x
    | Var s .. -> Var s
    | Add (Int 0..) rhs -> rhs
    | Add lhs (Int 0..) -> lhs
    | Add lhs rhs -> Add (simplify lhs) (simplify rhs)
```

Here the difference between ignoring a single field with `_` and multiple fields with `..` is minimal because there is only
one ignored field, but the difference will be larger when more ignored fields are involved:

```ante
is_int (expr: Expr): Bool =
    // Ignore the `I32` and `Location` fields
    expr is Int ..
```

Because the extra fields added by `with` are included on every variant, they can also be accessed on the
tagged union itself as if it were a struct type:

```ante
Expr.file (e: Expr): File =
    // No need to match on each variant
    e.location.file
```

#### Variant Types

Each variant of a tagged union is also defined as its own struct type. These types
can be accessed in the namespace of the tagged union:

```ante
type Shape =
   | Circle (radius: U32)
   | Square (length: U32)

area_circle (circle: Shape.Circle): U32 =
    radius = F64 circle.radius
    result = F64.pi * radius * radius
    result.truncate ()  // round towards 0

// Variant types can also have methods
Shape.Square.area self: U32 =
    self.length * self.length
```

Normally when matching on tagged unions, you will need to match on each field of
each variant. To get a value of the variant type instead, you can collect all fields
to a single variable by placing `..` immediately after the variant name:

```ante
Shape.area self: U32 =
    match self
    | Circle ..c -> area_circle c
    | Square ..s -> s.area ()
```

This feature is not often useful in smaller types but can be useful in larger types
to break up code. For example, functions just matching on each variant of a tagged union
like `Shape.area` above can be derived such that users need only to implement the methods
for each individual variant like `Shape.Square.area`, `Shape.Circle.area`, etc.

## Type Annotations

Even with global type inference, there are still situations where
types need to be manually specified. For these cases, the `x: t`
type annotation syntax can be used. This is valid anywhere an expression
or irrefutable pattern is expected. It is often used in practice
for annotating parameter types and for deciding an unbounded generic
type - for example when parsing a value from a string then printing it.
Both operations are generic so we'll need to specify what type we should
parse out of the string:

```ante
parse_and_print_int (s: String): Unit =
    x = parse s : I32
    // alternatively we could do
    // x: I32 = parse s
    print x
```

## Int Type

Ante has quite a few [integer types](#integers) so one question
that gets raised is what is the type of an integer literal?
If we randomly choose a type like `I32` then when using all
other integer types we'd have to constantly annotate our
operations with the type used which can be annoying. Imagine
`a + 1u64` every few lines.

Instead, integer literals are given the polymorphic `Int a` type:

```ante
3 : Int a // for some unknown 'a' which will later be resolved
          // to one of I8, I16, ..., U8, U16, ... etc.
```

When we use an integer with no specific type, the integer literal
keeps this generic type. This sometimes pops up in function signatures:

```ante
// This works with any integer type
add1 (x: Int a): Int a =
    x + 1
```

If we do use it with a specific type however, then just like with
normal generics, the generic type variable is constrained to be
that concrete type (and the concrete type must satisfy the `Int`
constraint - i.e. it must be a primitive integer or we get a compile-time error).

```ante
// Fine, we're still generic over a
foo (): Int a =
    0

x: I32 = 1  // also fine, we constrained 1 : I32 now

y = 2u16  // still fine, now we're specifying the type
          // of the integer literal directly
```

## Float Type

Like the [Int type](#int-type), there is also a polymorphic `Float a` type:

```ante
3.0  // has the type `Float a` until it is later used in an expression
     // which forces it to be either a F32 or F64.
```

Values of the `Float a` type will default to `F64` if they are never constrained:

```ante
print 5.0  // Since we can print any float type, we arbitrarily default 5.0 to an F64
           // making this snippet equivalent to `print (5.0 : F64)`
```

## Function Types

Function types in Ante are of the form `fn arg1 arg2 .. argN -> return_type`.
Note that functions in Ante always have at least one argument. Zero-argument functions
are usually encoded as functions accepting a single unit value as an argument, e.g. `fn Unit -> I32`,
which there is also sugar for: `fn -> I32`.

Function types can also have an optional effect clause at the end such as
`fn a -> b can Fail`, `fn a -> b can Fail, Panic`, or `fn a -> b is pure` for a function that uses no effects.
More on effects in [Effects](#effects).

## Anonymous Struct Types

If we have multiple types with the same field in scope:

```ante
type A = foo: I32

type B = foo: String
```

Then we are left with the problem of deciding what the type
of an `x.foo` expression should be:

```ante
// Does this work?
// - If so what type do we get?
// - If not, what is the error?
get_foo x = x.foo
```

Ante solves this with anonymous struct types which are row-polymorphic.
In other words, they are polymorphic over what fields are in the struct,
which allows any struct type to be used so long as it has the required
fields. For example, `{ x: I32 }` would be the type of any struct that
has a field `x` of type `I32`.

Using this, we can type `get_foo` as a function which takes
any struct that has a field named `foo` of type `b`:

```ante
get_foo (x: { foo: b }): b =
    x.foo
```

As a more complex example, here's a function that can print anything with a `debug` field
that itself is printable and a `prefix` field that must be a string:

```ante
// Type inferred as:
//   fn (prefix: String, debug: a) {Display a} -> Unit can Print
print_debug x =
    prefix = x.prefix ++ ": "
    print prefix
    print x.debug
```
---
# Ownership

Values in Ante are affine by default (may be used 0 or 1 time
before they are dropped and deallocated). These values are called
"owned" values. If we ever want to use such values more than once, we would
need to borrow them by creating temporary references to them which can be used
any number of times, but prevent the underlying value from being moved until
any references to it are no longer used.

The only values which may be used more than once without borrowing them are those
implementing the `Copy` trait. This trait signals a type may be trivially copied
each time it is referred to:

```ante
s: String = "my string"
x: I32 = 42

// We've moved `s` into `foo`, trying to access it afterwards would give a compile-time error
foo s x

// Since there is an implementation for Copy I32, we can still refer to `x` after it was passed into `foo`
bar x
```

## Borrowing

If a value needs to be used multiple times, we can borrow references
to it so that we can refer to the value as many times as we need.

```ante
s = "my string"

// References can be used as many times as needed
baz (ref s)
baz (ref s)
```

Creating a temporary reference to a value can be done via a `ref <expr>` expression.
These references do not allow mutation of the underlying value. If a mutable reference
is desired, they can be created via `mut <expr>`:

```ante
var s = "my string"

// This function call may modify our string
qux (mut s)

print s  //=> "???"
```

Borrowing prevents the underlying value from being moved while any reference to it is still used:

```ante
bad (foo: Foo) =
    // Error: Cannot move `foo` while the borrowed reference `ref foo` is still alive
    bar (ref foo) foo
```

Trying to move the underlying value while the reference is still alive will result in an error.
Additionally, we cannot return a reference to an outer scope after the variable it references may be dropped.
To keep track of when a reference is valid, each reference stores the set of variables it may borrow from in its type.

### Places

Each reference in Ante is parameterized by an element type and a place, where the place refers to what path(s) the
borrowed reference may refer to.
The full form of a reference type is `<reference-kind> p t` where `p` is the place and `t` is the element type.
The place can often be omitted from the type, in which case it will either be inferred or
a fresh place will be used.

The place parameter represents what a reference may borrow from. In the following example:

```ante
foo = 32
bar = ref foo
```

`bar` will have the type `ref 'foo I32` because it is a reference to the variable `foo` which holds an `I32`.

It is also possible for a reference to borrow from multiple places:

```ante
foo = "foo"
bar = "bar"
baz = if rand () then ref foo else ref bar
```

Above, `baz` will have the type `ref '(foo, bar) String` because it may refer to either `foo` or `bar`.
When using `baz`, it will be valid for as long as _both_ `foo` and `bar` remain in scope and are not moved.

Places can also refer to paths, as well as anonymous values in the local scope:

```ante
pair = 1, 2
one = ref pair.first

three = ref 3
foo three
```

In this case, `one` has type `ref 'pair.first I32` and `three` has type `ref 'a I32` where `a` is
a fresh name generated by the compiler, only valid for the current scope. It is as if the user had
written:

```ante
a = 3
three = ref a
foo three
```

Trying to return a reference past the scope where its places remain valid gives an error:

```ante
example (a: ref 'a I32) =
    b = 1
    if true then a else ref b  // error! This reference to b outlives its scope
```

If this code were allowed we would return a dangling reference which will likely lead
to a runtime crash when later dereferenced. Luckily, Ante prevents this for us with the above error.

When used in a function signature, places may be elided. When this happens, the following
rules are used for determining what the place is assumed to be:

- If it is in a parameter, the place is assumed to be a unique, fresh variable.
- If it is in a return type:
  - If there is a single place in the parameters, the return type must refer to that same place
  - If there are multiple possible places (usually because there are multiple parameters), an error will be issued requiring users to explicitly specify which one to use.

Most of the time, these rules mean we can omit places unless the function both takes multiple
reference parameters and returns a reference.

```ante
concat_foo (foo1: ref Foo) (foo2: ref Foo): String =
    foo1.msg ++ foo2.msg
```

#### Types with Places

Places can also be added to type definitions. This is necessary if a type needs
to hold onto a temporary reference, although most of the time users should favor
wrapper types such as `Arc t` as these will generally be easier to work with. Place
parameters are distinguished from regular type parameters by the `'` sigil:

```ante
type Context 'l =
    global_context: ref 'l GlobalContext
```

---

### Shared Mutability and Stability

Although largely built upon Rust, Ante's borrowing semantics differ in that it
allows shared (aliasable) mutability. This is done by tracking the "shape-stability"
of a type.

While shared mutability may not be safe in general to allow since it can cause
dangling references, among other issues:

```ante
bad (a: mut Vec t) (b: mut Maybe String) (c: String, String) =
    elem = a.get 1
    a.clear ()
    println elem  // Dangling ref!

    s = if b is Some s then s else panic ""
    b := None
    println s  // Dangling ref!

    name = ref c.first
    c.first := "Foo"
    println name  // Ok!
```

If the above were allowed, it'd be very bad! Shared mutability can be dangerous, but
at the same time it isn't always unsafe, and being more permissive can help avoid
slowing down users by rejecting fewer valid programs. When looking at the above example,
what differentiates the mutation of `a` and `b` from `c`'s is that only `c` is shape-stable.
If we imagine what `c` and `name` look like in memory before and after the mutation:

```
Before mutation:

    name
      |
      V
c:  ( (first_ptr, first_len, ..), (second_ptr, second_len, ..) )

After mutation:

    name
      |
      V
c:  ( (first_ptr, first_len, ..), (second_ptr, second_len, ..) )
```

We can see that the pointer to `name` stably points to the first `String` struct value
in `c` regardless of how `c` is mutated. Now compare this with the `Vec` example of `a` and `elem`:

```
Before mutation:

a: (elem_ptr, length, capacity)
        |
        V
        [0, 1, 2, 3]
            ^
            |
           elem

After mutation:

a: (elem_ptr, length, capacity)
        |
        V
        []
            ^
            |
           elem
```

`elem` clearly points to nothing now! The difference between these scenarios is that the _shape of the data changed_.
When the shape of some data changes, any references to it may be invalidated since what they point to may no longer be there.
If an operation may cause the shape of data to be changed, it is shape-unstable (or simply 'unstable').

#### Tracking Stability

To prevent issues like the above while still allowing shared mutability, Ante tracks stability in the type system.
Specifically, stability is tracked on places. An unstable place is marked with `!`. We can still get references
to unstable places:

```ante
example1 (v: mut Vec t) =
    a: ref 'v! t = v.get 0
    b: ref 'v! t = v.get 0
    println a  // ok!
    println b  // ok!
```

However, whenever a reference with place `p` is mutated, any unstable references with `p` as a parent, such as
`ref 'p! I32` or `ref 'p.bar!.baz I32`, will be invalidated:

```ante
example2 (v: mut Vec String) =
    a: ref 'v! String = v.get 0
    b: mut 'v! String = v.get_mut 0

    println a  // ok!

    b := "foo" // ok!
    println b  // ok! Mutating 'v! above only invalidates 'v!!

    v.clear () // note: 'v mutated here
    println b  // error: 'v was mutated on the line above, which may invalidate b.
```

Generally, most collection types (with the exception of arrays) will be shape-unstable in their element types,
and pointer types that allow shared mutability like `Rc` will be shape-unstable as well.

`Rc` specifically, because each clone of it shares the same underlying value, has a place attached to it: `Rc 'p t`
is a reference-counted pointer to some data `p` of type `t`. This is sufficient to support type-safe shared
mutability on reference-counted pointers, including supporting cyclic data types:

```ante
type List 'p t =
   | Nil
   | Cons t (Rc 'p (List 'p t))

// Note that projecting through an Rc gives unstable refs:
Rc.get (rc: mut 'outer Rc 'inner t): mut '(outer!, inner) t = ...

main () =
    var f = Rc.of (Cons false (Rc.of Nil))  // false -> []
    var t = Rc.of (Cons true f)             // true -> false -> []
    if f is Cons _ tail then
        // Note that `tail: mut '(f!!, a!) Rc 'a (List 'a Bool)`
        // where 'a is shared by `f` and `t`. The double `!` comes from the instability of the Rc and the inner union.
        // Taken as a whole, this means mutating either `f`, the list union, or inside the List may invalidate `tail`.
        tail := t

        // If we matched again:
        //   if tail is Cons _ tail2 then
        // We would get:
        //   `tail2: mut '(f!!!!, a!!!, a!) Rc 'a (List 'a Bool)`
        // Which would be invalidated by even more mutations. Cyclic refs are fragile in this way, by necessity.

    emit_list t
        |> take 5
        |> iter println  // true, false, true, false, true

emit_list (l: ref List t) = do
    if l is Cons elem tail then
        emit elem
        emit_list tail
```

Although due to Rc semantics, `t`'s memory is still leaked at end of scope!

> "This is complex and I don't understand it!"
>
> The good news is you largely don't need to! For the most part, the standard library defines
> primitives like `Rc.get` itself and users don't need to worry about manually upholding invariants.
> Places can be inferred as well, so it is always valid to omit them and have the compiler write
> in the correct types to the source file if desired. You can also use [shared types](#shared-types)
> which provide a cleaner interface over types like `Rc`.

#### The `Mutate` Effect

When a reference `mut 'e t` is mutated, the compiler issues a `Mutate 'e` effect. This effect
is what is used to invalidate any value of a type referencing `'e!` afterward. For convenience,
this effect is currently automatically added to a function's
signature whenever the function mentions a mutable reference parameter.

The `Mutate 'p` effect cannot be manually handled by users but will be automatically handled once
the function signature it is propagated to no longer references `'p`. In the case of mutating a
combination of places such as `Mutate '(a, b)` with only `'a` going out of scope, the `Mutate '(a, b)`
effect will be propagated as `Mutate 'b` instead.

`Mutate 'p` ensures mutation is safe even in generic code:

```ante
twice (f: fn a a => Unit) (x: a) {Copy a} =
    f x x

mutate_b (a: mut 'a Vec I32) (b: mut 'b Vec I32): Unit can Mutate 'b = ...

caller () =
    var v = Vec.of [1, 2, 3]

    // note: mutate_b used as `fn (mut 'v Vec I32) (mut 'v Vec I32) -> Unit can Mutate 'v`
    // error: 'v is mutably aliased in mutate_b
    twice mutate_b (mut v)
```

Another example with an effect and aliasing in a closure environment:

```ante
run (f: fn Unit => Unit can e) (xs: ref Vec I32): Unit can e =
    first = xs.get 0
    f ()             // If e is Mutate 'xs, the next line would be unsafe
    println first

caller () =
    var v = Vec.of [1, 2, 3]

    // note: run used as `fn (fn Unit [mut 'v Vec I32] -> Unit can Mutate 'v) (ref 'v Vec I32) -> Unit can Mutate 'v`
    // error: 'v is mutably aliased in run
    run (do v.clear ()) v
```

#### In Loops

Similar to how a variable declared outside a loop cannot be moved within a loop, a variable
declared outside a loop cannot be used in a loop at all if it'd be invalidated later in the
same loop body:

```ante
foo1 () =
    var v = Vec.of [1, 2, 3]
    one = v.get 0

    for i in 0 .. 3 do
        println one  // error: one may already be invalidated by code later in the loop
        v.clear ()   // note: one invalidated here, causing the next iteration to use a dangling reference
```

Similarly, a closure that invalidates its own capture is a `FnOnce`, so the following is prevented:

```ante
foo2 () =
    var v = Vec.of [1, 2, 3]
    one = v.get 0

    // error: repeat requires a Fn, but was passed a FnOnce
    repeat 3 fn _ ->
        println one
        v.clear ()  // note: closure is a FnOnce because it invalidates a capture here
```

#### In Traits and Effect Handlers

For simplicity, effect handlers and traits do not have place parameters, but this means they have
some restrictions:
- Trait implementations cannot capture places in their closure environment.
- Effect handler branches cannot `Mutate` any places used in the handled expression.
- Effect handler branches may be entered several times and are thus treated as loop bodies where
they are not allowed to use any places that are invalidated later in the handler body (by any branch).

Also note that any effects performed in a handled expression are also seen by each handler branch,
so the following:

```ante
bad1 () =
    var v = Vec.of [1, 2, 3]
    handle
        emit (v.get 0)
        v.clear ()
    | emit elem ->
        resume ()     // calls v.clear ()
        println elem  // println after the clear
```

Is prevented by the `Mutate 'v` effect of the handled expression which invalidates the element reference.
Note that this will invalidate `elem` even before `resume` is called as well.

Any temporary place passed to an effect handler is assumed to be dropped when `resume` is called:

```ante
bad2 () =
    handle
        v = Vec.of [1, 2, 3]
        emit (v.get 0)
    | emit elem ->
        resume ()     // handled expr finishes, v is dropped
        println elem  // error: elem used here after being dropped by `resume`
```

Specifically, `elem` is given the type `ref '(_, resume) I32`, which is invalidated
once `resume` is moved by being called. Additionally, because of the anonymous local place `'_`
given to `elem`, the handle branch is not allowed to mutate `elem` which prevents code
like `bad3` from compiling:

```ante
bad3 () =
    handle
        var v = Vec.of [1, 2, 3]
        first = v.get 0
        emit (mut v)
        println first
    | emit v2 ->
        v2.clear ()  // error: Cannot mutate v2 which is shared by the handled expression
        resume ()
```

> This restriction may be removed in the future. It may be possible to assume `emit r` for some
> mutable reference `r` issues a `Mutate 'r_elem` effect which can then be tracked and used
> to invalidate `first`.

If mutating a value passed to an effect handler is needed, `uniq` references should be
used instead. A branch may mutate a `uniq` reference's place but not any that may be shared
still (such as those through an `Rc`):

```ante
ok () =
    handle
        v = Vec.of [1, 2, 3]
        first = v.get 0
        emit (uniq v)  // note: first dropped here when v was used again, which it borrows from
        println first  // error: Conflicting borrow, first is no longer valid
    | emit v2 ->
        v2.clear ()  // ok
        resume ()
```

#### Distinct Places

Sometimes, code may only be safe if separate places are distinct:

```ante
foo (a: ref 'a Vec I32) (b: mut 'b Vec I32): Unit can Mutate 'b =
    a_elem = a.get 0
    b.clear ()
    println a_elem   // This would be unsafe if b aliases a
```

If `foo`'s caller is allowed to pass the same vector for `a` and `b` then we would print
a dangling reference to a cleared element. To prevent this, the compiler ensures any place
used in a `Mutate` effect must be distinct from other places given to the function:

```ante
caller1 (v: mut Vec I32) =
    foo v v  // error! 'a cannot alias 'b in call to foo, but 'v was used for both
```

#### Thread Safety of References

Since `ref` and `mut` both allow mutable aliasing, neither implements `Send` nor `Sync`.
Instead, Ante provides additional reference types `imm` and `uniq`. These additional reference
types are rarely used, typically only in multithreaded code, and come with stricter invariants:

- While `imm t` is being borrowed, we can only borrow other `imm` references from `t`.
- While `uniq t` is being borrowed, we cannot borrow any other references from `t`.

Since `uniq t` allows for mutability while `imm t` does not, we can freely `Send (imm t)` or `Sync (imm t)`
between threads, and can still `Send (uniq t)` as well. Once in another thread,
`imm t` can be used where a `ref t` is expected and `uniq t` can be used where any other reference
type is expected.

### Shared Types

Shared types are a way to opt out of ownership rules for a type by automatically wrapping
it in a copyable wrapper. These types can be declared via `shared type` and also do not
require explicit boxing (they are always boxed):

```ante
// Immutable shared type
shared type Expr =
    | Int I32
    | Var String
    | Add Expr Expr  // No explicit boxing required

main () =
    my_expr = Expr.Add (Int 3) (Var "foo")

    // We can freely copy any shared type
    alias1 = my_expr
    alias2 = my_expr
```

You can think of these types as always being wrapped in a reference-counted pointer. They are
meant to be used when efficiency is less of a concern than code clarity. For example, when
gradually transitioning new users to use ownership rules it can be helpful if they have to worry
about it for fewer types - even if they still need to handle it for built-in types like `Vec a`.
These are also useful in cases when types need to be boxed anyway, such as `Expr` above or
the various shared, immutable container types.

It is possible to obtain `ref`s to fields inside of `shared` types, but it is not possible to
receive `mut` references to them since `shared` types are immutable:

```ante
var_name1 (e: Expr): ref String can Fail =
    if e is Var s then s  // we'd get an error if we tried to return `mut String` here
    else fail ()
```

#### Shared Mutable Types

In addition to `shared type`, which declares a shared, but immutable type, we can declare a shared,
mutable type via `shared mut type`:

```ante
shared mut type MutExpr =
    | Int I32
    | Var String
    | Add MutExpr MutExpr

main () =
    my_expr = MutExpr.Add (Int 3) (Var "foo")

    // We can freely copy and mutate any shared mutable type
    var alias1 = my_expr
    alias2 = my_expr

    // `alias1 := Int 0` would just rebind `alias1`
    if alias1 is Add lhs _ then
        lhs := Int 0

    assert_eq my_expr (Add (Int 0) (Var "foo"))
    assert_eq alias2 (Add (Int 0) (Var "foo"))
```

> Using shared mutable types is meant to feel like using types in a high-level, garbage-collected
> language like Java.

Unlike normal shared types, shared mutable types allow mutation into their shared contents and are
thus not thread-safe. Similar to `Rc 'p t`, we must also track the places these types may refer to,
so an implicit place parameter is added to each `shared mut type` to keep shared mutability safe.

We can obtain `ref` or `mut` references inside `shared mut type`s. When we do, the place these references
refer to will be the same as the implicit place variable on the type:

```ante
var_name2 (e: ref MutExpr): mut String can Fail =
    if e is Var s then s
    else fail ()

// Or with explicit places:
var_name2 (e: ref 'outer MutExpr 'inner): mut '(outer!!, inner!) String can Fail = ...

foo (expr: MutExpr 'e) =
    name = var_name2 expr
    ...
```

Shared types are meant to be an easy-to-use alternative to explicit boxing. As an example, here's the cyclic
`List` example from earlier, rewritten to use a `shared mut type List` instead:

```ante
shared mut type List t =
    | Nil
    | Cons t (List t)

main () =
    f = Cons false Nil  // false -> []
    t = Cons true f     // true -> false -> []

    if f is Cons _ tail then
        tail := t

    emit_list t
        |> take 5
        |> iter println  // true, false, true, false, true

emit_list (l: ref List t) = do
    if l is Cons elem tail then
        emit elem
        emit_list tail
```

### Internal Mutability

Although Ante provides type-system-checked shared mutability by tracking stability in a type,
it is sometimes necessary to track the validity at runtime instead. For this, Ante provides
several types implementing internal mutability to mutate what is otherwise an immutable-looking `ref t` type.
`RefCell t` will be a familiar sight to those used to Rust, but using this type entails runtime
checking to uphold reference safety: either a mutable reference can be made or multiple immutable
references, but never both at once.

## Thread Safety

Ante uses the familiar `Send` and `Sync` traits from Rust for safe concurrency. It does
not innovate here but continues with the safe, tried and true model.

---
# Implicits

In addition to normal, explicit parameters, functions can have _implicitly passed parameters_.
Implicit parameters are written with curly braces `{}` surrounding them to distinguish them
from normal parameters, and may have their names omitted if they are not otherwise used.

```ante
foo (x: I32) {y: I32}: I32 =
    x + y

bar (x: I32) {I32}: I32 =
    // bar's second parameter is automatically forwarded to `foo` here
    foo x
```

When looking for an implicit value, the compiler will consider any implicit parameter already
in scope in addition to each definition with the `implicit` modifier:

```ante
implicit pi: I32 = 3  // close enough

main () =
    // pi is the only implicit I32 in scope, so it is used
    bar 0
```

When there are multiple conflicting values of the requested type to use, the compiler will
issue an error:

```ante
implicit pi: I32 = 3
implicit zero: I32 = 0

main () =
    // error: `bar` requests an implicit `I32` but there are multiple conflicting implicits in scope: `pi` and `zero`
    // note: try explicitly specifying which implicit to use
    bar 0
```

As the note tells us, when this happens we can disambiguate by explicitly passing the desired
value to `bar`. This can be done using curly braces:

```ante
implicit pi: I32 = 3
implicit zero: I32 = 0

main () =
    bar 0 {pi}
```

Implicits are most commonly used for passing around [trait values](#traits).

---
# Traits

While unrestricted generic functions are useful, often we don't want
to abstract over "forall t." but rather abstract over all types that
have certain operations available on them - like adding. In Ante, this
is done via traits. You can define a trait as follows:

```ante
trait Stringify t =
    stringify: fn t -> String
```

Here we say `stringify` is a function that takes a value of type `t` and returns a
`String`. With this, we can write another function that abstracts over all `t`'s that
can be converted to strings:

```ante
stringify_print (x: t) {Stringify t}: Unit =
    print (stringify x)
```

Each trait is just a type definition internally with:

- Each function in the trait translating to a field of type function.
- An accessor function defined for retrieving the field from an implicit value of that trait.
- Any captured data in closures is stored after each function in the trait struct, effectively
  making it a vtable. This captured data is shown in the trait type as an optional parameter which
  can be used to match each trait to a particular impl. `HashMap k v h` uses this for example to
  match multiple maps to the same `Hash k h` impl.

If we were to desugar the `Stringify` trait above, we'd get the following:

```ante
type Stringify t (env = _) =
    // The closure environment for stringify is the trait value itself
    stringify: fn t [ref Stringify t env] -> String
    impl_data: env

// This lets us call `stringify my_obj` and the constructor will look for 
// an implicit `Stringify t` in scope to find how to stringify `t`.
stringify {s: Stringify t} x = s.stringify x
```

Since traits are just structs internally, we can construct them like any other struct:

```ante
implicit stringify_bool: Stringify Bool = Stringify with
    stringify b _ = if b then "true" else "false"
    impl_data = ()

implicit stringify_maybe {elem: Stringify t}: Stringify (Maybe t) = Stringify with
    stringify m env = if m is Some x then env.impl_data.stringify x env.impl_data else "None"
    impl_data = elem
```

But manually managing the `impl_data` environment field is laborious so Ante provides `impl` sugar
for defining an implicit trait value where each function's captures are automatically collected
into the `impl_data` field:

```ante
impl stringify_bool: Stringify Bool with
    stringify b = if b then "true" else "false"

impl stringify_maybe {Stringify t}: Stringify (Maybe t) with
    stringify m = if m is Some x then stringify x else "None"
```

Additionally, each `impl` defines its own unique struct type for these closure captures. This
struct type has the same name as the impl value and can be used to ensure a selected impl remains
consistent within some context. Since Ante's traits have no global [coherence](#coherence), this
is useful for some data structures like `HashMap` which need to ensure the trait implementation
they use is consistent:


```ante
type HashMap k v h = ...

/// Find a particular hash impl `h` on construction
HashMap.empty {Hash k h}: HashMap k v h = ...

/// ... and ensure it is consistent through each subsequent get/insert/eq with other maps, etc.
HashMap.get (map: mut HashMap k v h) (key: ref k) {Hash k h}: ref v can Fail = ...
```

Traits are often passed as implicit parameters into function calls
(see `stringify_print` above). Since implicit resolution only looks for implicit values in scope,
we need to ensure any trait values we use are either marked `implicit`, imported via `import implicit`,
or already in scope via an implicit parameter.

```ante
// Allow `stringify_bool` to be used implicitly in this module
impl stringify_bool: Stringify Bool with
    stringify b = if b then "true" else "false"

// Or, in another module:
import implicit Example.stringify_bool
```

## Multiple Type Parameters

Like any other type, traits can also have multiple type parameters.
We can use this to define relations over multiple types. For example,
we may want to be more general than the `stringify` function above and
have a trait to cast to any result type. To do this we can have a
trait that defines a cast function from one type to another:

```ante
trait Cast a b =
    cast: fn a -> b

// Assuming we defined a `Cast I32 String`, we could now cast
// an I32 to a String via:
cast 3 : String
```

## Inferred Implicit Parameters

When inferring a function's type, if that function requires an
implicit that references a parameter type, the implicit will be inferred
to be a parameter of the function itself. That is, the following definitions
of `double_cast` are mostly the same:

```ante
// This:
double_cast x = cast (x + x)

// Is inferred as:
double_cast (x: t) {Add t} {Copy t} {Cast t u}: u =
    cast (x + x)
```

There is one small difference between the two: implicits inferred to be parameters
cannot be explicitly specified by users at call sites:

```ante
double_cast x = print (x + x)

main () =
    // error! `double_cast` was not declared with any implicit arguments
    _ = double_cast 2 {add_i32}
```

The reason for this is that if all implicits on a function are inferred, it would not
be clear which order they should be passed in. For this reason, an error is
issued if a user tries to specify implicit arguments on a function with inferred implicits.

> Q: Why not have the compiler choose an ordering, such as ordering alphabetically?
> 
> A: If the compiler chose to order implicits alphabetically when inferred in a function
> signature, that would make renaming any type a breaking change since it may change
> the ordering of function parameters.

Since it is often a good idea to allow users of your library to specify implicits when
necessary, explicitly specifying each function's signature is encouraged. One pattern to
consider is to write code with types inferred, then after a successful compilation, use
Ante's compiler option to write inferred types into the file.

## Named Impls

Unlike trait implementations or typeclasses in other languages, trait values in Ante
are normal values, and like other normal values, they can be named and imported/exported
by name.

```ante
import implicit Foo.Impls.eq_foo
```

When an [implicit parameter](#implicits) is ambiguous, you can just specify it explicitly:

```ante
import implicit Foo.Bar.stringify_bool

implicit conflicting_impl: Stringify t =
    Stringify fn _ -> ""

print_to_string true {stringify_bool}
```

Having multiple conflicting implementations of a trait or typeclass anywhere in a codebase
is often an error in other languages, necessitating extensive use of the newtype pattern
for otherwise unnecessary wrapper types and boilerplate. Ante does not enforce global
[coherence](#coherence), instead opting for this name-based approach to disambiguate where necessary.

## Coherence

Ante has no concept of global coherence for traits, so it is perfectly valid to define overlapping
implementations or define implementations for types outside of the modules the type or trait was declared in.
If there are ever conflicts with multiple valid implementations being found, an error is given at the callsite
and the user will have to manually specify which to use either by only importing one of these values
or by explicitly specifying which [implicit parameter](#implicits) to use:

```ante
implicit add = Combine I32 with (++) = (+)
implicit mul = Combine I32 with (++) = (*)

print (2 ++ 3)  // Error, multiple matching implicits found! `add` and `mul` are both in scope

print (add.(++) 2 3)  //=> 5
print (mul.(++) 2 3)  //=> 6
```

> Q: What about constructs like HashMap which rely on a consistent Hash implementation?
>
> A: The plan is to have these types parameterized over the implementation chosen for them.
> This generic can then be used to ensure consistency everywhere the type is used.

The lack of global coherence also notably allows traits to be used in some places typical
traits or interfaces are not, such as interning.

### Example: Interning

Interning values is a common optimization but unfortunately often makes these interned values
more cumbersome to work with. For example, often when implementing traits they require wrapper
objects to be created first to bundle them with the appropriate context. Since we can
define arbitrary functions to return trait values in Ante, we can define a closure which
captures this context to implement any trait we need:

```ante
type Data = bytes: Vec U8

type DataId = id: U32

type Context =
    // Each `DataId` is an index into this map
    map: Vec Data

implicit display_data_id {ctx: ref Context} = Display DataId with 
    display (id: DataId) =
        display (ctx.map.get id) ~> on_fail panic
```

---
# Effects

Effects are a control-flow abstraction similar to a resumable exception. They are a
useful tool since they can be used to abstract over several kinds of non-local control-flow
(exceptions, generators, async, early-returns, etc.).

> If you are familiar with monads, effects serve a similar purpose, but unlike monads,
> they compose together more naturally without the need to decide the handler ordering
> in the type itself.

We can create an effect in Ante using the `effect` keyword to define a type holding several
function values, similar to a trait:

```ante
effect Yield t =
    yield: fn t -> Unit
```

Calling an effectful function like `yield` will perform the effect in the calling function.
To perform the effect we must specify the calling function `can Yield` (or let it be inferred).
If we are performing multiple effects, we can separate them with commas.

```ante
yield_and_return_10 (): I32 can Yield I32 =
    yield 5
    yield 7
    10
```

Alone, `yield 5` means nothing. To give meaning to an effect, we must handle it with an
effect handler. Handlers can be defined with the syntax: `handle <expr> | <capability-pattern> -> <expr> | ...`.
This syntax defines a handler for the effect in `<capability-pattern>`. The `| <capability-pattern> -> <expr>`
portion must list each function of an effect and its implementation, separated by `|` if needed,
similar to match branches. Additionally, the special `resume` function will be visible within each handle
branch. This `resume` function is special - it lets us resume the function that called our effect function.

A good mental model of effects is that they're like checked exceptions which we can throw by performing the effect,
catch by using effect handlers, but can also `resume` back to the code that performed the effect.
We'll get into more of the implications of this later but for now let's see a basic handler:

```ante
print_each_yield (f: fn Unit => a can Yield t) {Display t}: a can Print =
    handle f ()
    | yield elem ->
        resume (println elem)

main () =
    x = print_each_yield yield_and_return_10  // `5` and `7` are printed
    assert_eq x 10
```

Above we define a handler inside `print_each_yield` and run `f` with that handler.
Then in `main`, we call `print_each_yield` with the `yield_and_return_10` function from
before as an argument. This will run that function, and when `yield 5` is encountered,
we will print `5` out before hitting the next yield, printing `7`, and finally returning `10`.

Aside from the new syntax, this should not be too surprising. The control-flow here is as
we'd expect from any other function - that is because when implementing `yield` we gave
it a function which calls resume in a tail position (i.e. as the last thing it does).
When called in a tail-position, the code is performing the entire function then finishing
and resuming back to where `yield` was called.

We can still do some interesting things with only `resume` in a tail position. For example,
we can collect each yielded value into a container:

```ante
// Collect each `yield elem` in `f` into a `Seq`, returning it alongside
// `f`'s original return value.
collect_yields_into_seq (f: fn Unit => a can Yield t): a, Seq t =
    var yielded = Seq.empty ()
    // ret will hold the result of `f ()`
    ret = handle f ()
    | yield elem ->
        yielded := yielded.push elem
        resume ()
    ret, yielded
```

The real power of effects comes from when we call `resume` outside of tail-calls. For example,
we can choose to call it in the _middle_ of our yield implementation or even _not call it at all_.

If we choose not to call `resume` at all, we should expect the code calling `yield` to never resume!
This may sound odd or undesired, but it is actually a very common use case: it is what exceptions do!

```ante
abort_after_first_yield (f: fn Unit => I32 can Yield I32): I32 =
    handle f ()
    | yield elem -> elem

main () =
    x = abort_after_first_yield yield_and_return_10
    assert (x == 5)
```

Now when we run the program, when `yield 5` is first called, our handler returns `5` and does
not resume the call, so `5` is returned from `abort_after_first_yield` as well, changing
the value of `x` at the end.

If we resumed in the middle of our `yield` function (and performed more work afterward), then
that additional work would not be run until after the entire handled expression. This control-flow
can be difficult to conceptualize. As a mental model,
you can think of performing an effect as suspending the current call stack, jumping to the handler,
executing it, and jumping back when resume is called. If the handler didn't finish (i.e. there is more
work to do after the resume call), it will accumulate extra stack frames to run when the computation
is finished.

This can be a lot to wrap one's head around at first - a good way of learning may be by looking through
some examples.

### Error Handling

Some of the most common effects you'll see are the `Fail` and `Throw e` effects for
error handling. These roughly correspond to the `Maybe t` and `Result t e` types respectively.
Being effects however, these do not need to be manually unpacked at each call site.

```ante
/// The Fail effect represents a generic failure. It is meant to be used
/// when the reason why is obvious and needs no extra information.
effect Fail =
    fail: fn Unit -> Never

/// Throw on the other hand will throw a value to its handler.
/// It can be thought of as an exception.
effect Throw e =
    throw: fn e -> Never

safe_div (a: U32) (b: U32): U32 can Fail =
    fail_if (b == 0)
    a / b

type Name = first: String, last: String
type ParseError = | NoName | NoLastName | ComplexName

parse_name (name: String): Name can Throw ParseError =
    parts = Vec.of (name.split " ")

    if parts.len () == 0 then
        throw NoName
    else if parts.len () == 1 then
        throw NoLastName
    else if parts.len () > 2 then
        throw ComplexName

    Name with first = parts.[0], last = parts.[1]
```

Handling these effects can be done via manual `handler` expressions, or
a variety of helper functions in the `Std.Fail` and `Std.Throw` modules.
Implementing these functions is generally simple. Effects are often described
as resumable exceptions, so if we want normal exceptions all we must do
is not call `resume` in the handler. A function like `try` will instead
return `None` while `on_fail` provides a default value on error.

```ante
try (f: fn Unit => a can Fail): Maybe a =
    handle Some (f ())
    | fail () -> None

catch (f: fn Unit => a can Throw e): Result a e =
    handle Ok (f ())
    | throw e -> Err e

print (safe_div 6 2 ~> try) //=> Some 3
print (safe_div 6 0 ~> on_fail do 42) //=> 42

print (parse_name "First Last" ~> catch) //=> Ok (Name "First" "Last")
print (parse_name "First" ~> catch) //=> Err NoLastName
print (parse_name "" ~> catch_or (Name "Bob" "Default")) //=> Name "Bob" "Default"
```

Because effects can be naturally composed, functions returning multiple
different errors can also be naturally composed without requiring users
to define their own error unions:

```ante
foo (): Unit can Throw FileError, Throw ParseError, Throw BarError =
    f = File.open "foo.txt"
    contents = parse (read f)
    bar contents
```

Effect union type aliases may still be declared to cut down on typing if desired:

```ante
effect MyEffects = Throw FileError, Throw ParseError, Throw BarError 

foo (): Unit can MyEffects =
    f = File.open "foo.txt"
    contents = parse (read f)
    bar contents
```

### Applying Handlers

Most handler functions like `try` or `catch` above take a function as an argument to supply
the handler for. Instead of manually wrapping each operation as in `try (fn _ -> safe_div 6 2)`,
it is convenient to have alternate ways to apply handlers, similar to how we can apply normal
functions directly: `f x`, or with the pipeline operators: `f <| x`, `x |> f`.

#### Applying Handlers with `~>`

`~>` works by automatically creating a closure such that `try (fn _ -> safe_div 6 2)` is equivalent
to `safe_div 6 2 ~> try`.

#### Applying Handlers with `do`

`do x` is sugar for `fn _ -> x` and can be used as a trailing argument on functions. This makes it
resemble the reverse of `~>`. Where `~>` has the function on the left and handler on the right, `do`
has the function on the right and handler on the left. We can also compare these to `|>` and `<|`,
where `|>` is to `~>` as `<|` is to `do`.

It is most often used for handling entire blocks of code.

```ante
try fn _ ->
    failable_function1 ()
    failable_function2 ()
    failable_function3 ()

// Equivalent to:
try do
    failable_function1 ()
    failable_function2 ()
    failable_function3 ()

// Equivalent to:
try do
failable_function1 ()
failable_function2 ()
failable_function3 ()
```

Being sugar for a closure, `do` is also often used on functions like `on_fail`:

```ante
my_failable_fn 3 + 8
    ~> on_fail do panic "oh no!"

// Equivalent to:
on_fail
    (fn _ -> (my_failable_fn 3) + 8)
    (fn _ -> panic "oh no!")
```

#### Applying Handlers with Currying

Since the `~>` operator introduces a new implicit, for patterns where you're threading through
many implicits of the same effect (most notably generators), you may get "multiple matching implicits"
errors when using it. For this reason, generators in Ante are designed to return functions
directly instead (essentially manually currying them). This is why you'll see the various stream functions defined as:

```ante
map (s: s) {Stream s a} (f: fn a => b) = fn () ->
    ...

// And since these functions already return
// functions, we can pipeline them easily:
doubled_evens stream =
    filter stream (_ %% 2)
        |> map (_ * 2)
        |> Vec.of
```

### Effect Control-Flow

Effects have a control-flow that is likely novel to many programmers. It is similar
to an exception that may be resumed. We can create a handler to better
show this unique control-flow:

```ante
effect MyEffect =
    my_effect: fn String -> Unit

debug_effect_control_flow (f: Unit => a can MyEffect): a can Print =
    handle f ()
    | my_effect msg ->
        // Print the message
        println "my_effect '${msg}' called!"
        // Resume the computation & finish it entirely (including other calls to my_effect!)
        r = resume ()
        // And only then print `finished`
        println "resume '${msg}' finished"
        r

foo () can MyEffect, Print =
    println "foo called!"
    _ = my_effect "foo a"
    _ = my_effect "foo b"
    println "foo finished"

bar () can MyEffect, Print =
    println "bar called!"
    _ = my_effect "bar a"
    _ = my_effect "bar b"
    println "bar finished"

example () can MyEffect, Print =
    foo ()
    bar ()
```

Now when we run `debug_effect_control_flow example` we get the following printouts:

```
foo called!
my_effect 'foo a' called!
my_effect 'foo b' called!
foo finished
bar called!
my_effect 'bar a' called!
my_effect 'bar b' called!
bar finished
resume 'bar b' finished
resume 'bar a' finished
resume 'foo b' finished
resume 'foo a' finished
```

Note that we do not get any of the "resume ... finished" printouts until the entire
computation `f ()` finishes. We are continually pushing stack frames to the handler to
finish later until all resumes finish from the last to the first as the stack frames
are popped.

The novel control-flow of this is all from code after the `resume` call in the handler. If the
handler does not have any code after `resume` (i.e. it is tail-resumptive) it can actually
be optimized into a normal function call. When performance is vital and an effect may be
handled in a tail-resumptive way, it is possible to specify when declaring the effect that
all handlers for it must be tail-resumptive. That way a library or application developer
can guarantee certain performance characteristics of the effect no matter its implementation.

### Step-by-Step Evaluation

In case the above example was difficult to understand, we'll walk through an example showing
step-by-step how the function may be evaluated. This will be our example:

```ante
effect Foo =
    foo: fn String -> I32

do_math (x: I32): I32 can Foo =
    a = foo "zero"
    b = foo "bar"
    5 + a + b

count_foo_calls (f: fn Unit => a can Foo): I32 =
    // This handler is in scope for `f (); 0`,
    // so the `resume` call ends right after the `0`
    handle f (); 0
    | foo _ -> 1 + resume 0

do_math 5 ~> count_foo_calls  //=> 2
```

This example can be confusing at first - how can we always return
an integer representing the number of `foo` calls if our function
says it returns some type `a`? Let's work this out step by step
to see how it expands:

```ante
do_math 5 ~> count_foo_calls

// First we expand and substitute
handle
    a = foo "zero"
    b = foo "bar"
    5 + a + b
    0
| foo _ -> 1 + resume 0

// Then reduce via our `foo` rule - continuing
// the computation with the value 0 and adding 1 to the result
handle 
  1 + (
    a = 0
    b = foo "bar"
    5 + a + b
    0
  )
| foo _ -> 1 + resume 0

// Reduce via foo again for b
handle 
  1 + (1 + (
    a = 0
    b = 0
    5 + a + b
    0
  ))
| foo _ -> 1 + resume 0

// Now we finish evaluating the function and would
// normally get a result of 5 - but it is sequenced immediately after,
// discarding the `5` and returning a `0` instead.
handle 
  1 + (1 + (
    5
    0
  ))
| foo _ -> 1 + resume 0

// After sequencing:
handle 1 + (1 + 0)
| foo _ -> 1 + resume 0

// The handled expression is now done evaluating, so the `handler` is finished.
1 + (1 + 0)

// Finally, 1 + 1 + 0 evaluates to 2 with no further effects
2
```

### Resuming Multiple Times

In other languages with effects and handlers it may be possible to resume
multiple times. This is currently not possible in Ante largely due to
issues with mutability and efficiency, but may be allowed in the future.

Instead, `resume` in Ante is typed as a `FnOnce` which limits it to only
being called once. The plus side of this is that it opens up more opportunities
for implementing effects in an efficient way and limits unexpected interactions.

### Useful Effects

Effects are a very broadly useful feature, yet the previous examples
have been rather abstract. Here are some practical use cases for effects.

#### Exceptions

See [Error Handling](#error-handling)

#### Generators

The `emit` effect provides a way to implement generators.
This function is also often named `yield`.

```ante
effect Emit a =
    emit: fn a -> Unit

/// Streams the contents of `t` to the emit handler
///
/// Most streams are generator functions, others are containers that supply a
/// function to emit each element.
trait Stream t a =
    stream: fn t -> Unit can Emit a

/// Emit numbers from 0 to `n`, end-exclusive
/// This returns a function (along with most other functions below) since a
/// `fn Unit => Unit can Emit a` is itself a stream.
iota n = fn () ->
    for i in 0usz .. n do emit i

/// Applies `f` to each element from the stream, re-emitting each result.
/// 
/// Given `a1, a2, .., aN`, emit `f a1, f a2, .., f aN`
map (s: s) {Stream s a} (f: fn a => b) = fn () ->
    handle stream s
    | emit a ->
        emit (f a)
        resume ()

/// Re-emits only the elements from the original stream for which `f elem` is true
///
/// E.g. `filter (iota 5) (_ > 2)` will emit `3` and `4`.
filter (s: s) {Stream s a} (f: fn (ref a) => Bool) = fn () ->
    handle stream s
    | emit a ->
        if f (ref a) then emit a
        resume ()

/// Infinite stream example
fibonacci (): Unit can Emit U64 =
    var current, next = 0, 1
    while true do
        emit current

        tmp = current + next
        current := next
        next := tmp

main () =
    numbers = iota 5        // 0, 1, 2, 3, 4
        |> filter (_ %% 2)  // 0, 2, 4
        |> map (_ + 1)      // 1, 3, 5
        |> Vec.of

    iter fibonacci println  // 0, 1, 1, 2, 3, 5, 8, ...
```

See the [Stream module in the stdlib](/docs/stdlib/stream/) for more functions on streams.

#### Loops and Early-Returns

We can combine generators with a `Loop` effect that lets us `continue` and `break`
out of loops.

```ante
effect Loop =
    break_: fn Unit -> Never
    continue_: fn Unit -> Never

/// Consumes the given stream, applying `f` to each element, with
/// an additional Loop handler installed to allow breaking/continuing
/// within the overall loop.
for_ (s: s) {Stream s a} (f: fn a => b can Loop): Unit =
    var broke = false
    handle Stream.stream s
    | emit a ->
        handle f a; ()
        | break_ () -> broke := true
        | continue_ () -> ()

        if not broke then resume ()

main () =
    // Print `12457`:
    for_ (iota 20) fn i ->
        if i %% 3 then continue ()
        if i > 7 then break ()
        print i
```

Similarly, there is the `EarlyReturn` effect for early-returning. Since this is
an effect, we can use it even to early return out of multiple closures:

```ante
effect EarlyReturn a =
    early_return: fn a -> Never

with_early_return (f: fn Unit => t can EarlyReturn t): t =
    handle f ()
    | early_return x -> x

/// Find the index of the given element in the sequence.
/// Fails if there is no matching element.
find_in_seq (seq: Seq t) (target: ref t) {Eq t}: Usz can Fail =
    with_early_return do
    enumerate seq |> iter fn (i, elem) ->
        if target == elem then
            early_return i

    fail ()

/// If we wanted, we could even refactor `find_in_seq` into multiple functions
find_in_seq2 (seq: Seq t) (target: ref t) {Eq t}: Usz can Fail =
    with_early_return do
    enumerate seq |> iter (early_return_if_items_match _ target)
    fail ()

early_return_if_items_match (i: Usz, a: ref t) (b: ref t) {Eq t}: Unit can EarlyReturn Usz =
    if a == b then early_return i
```

> In future versions of Ante, the `return` keyword may be removed and replaced with
> the `EarlyReturn` effect entirely. This will only happen once the compiler can guarantee
> the efficiency of `EarlyReturn` is always equivalent to that of a native `return`.

#### Logging and Mocking

Testing logging output can be done in other languages, but this often involves refactoring code to
be generic over a logging interface which can be mocked. Since effects in Ante must be used
on any effectful function, and we can already swap out their implementation, we get this
abstraction for free.

```ante
effect Print =
    print: fn String -> Unit

effect QueryDatabase =
    querydb: fn String -> Response

database f can IO =
    db = Database.connect "..."
    result = handle f ()
        | querydb msg -> resume (db.send msg)
    close db
    result

ignore_db f =
    handle f ()
    | querydb _ -> resume Response.Empty

business_logic (should_query: Bool): Unit can Print, QueryDatabase =
    if should_query then
        print "querying..."
        response = querydb "SELECT column FROM table"
        ...
        print "done with db"
    else
        print "did not query"

// Print handling is built in, let Ante handle it
main () can Print, IO =
    business_logic true ~> database

// Mock our business function. Use a different handler for
// testing instead of the database handler that will actually
// connect to the database.
test () can Fail =
    handle business_logic false
    | print msg ->
        assert (msg == "did not query")
        resume ()
    | querydb _ ->
        error "Tried to query when should_query = false!"
        resume ()

    logs = business_logic true ~> ignore_db ~> collect_prints
    assert (not is_empty logs)
```

#### Others

Other examples include using effects to
implement [asynchronous functions](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/05/asynceffects-msr-tr-2017-21.pdf),
a clean design for [handling animations in games](https://gopiandcode.uk/logs/log-bye-bye-monads-algebraic-effects.html),
random state, or parsers, among others.

---

## Capability-based Security

By requiring each effect used by a function to be documented in its type, Ante has
capability-based security. Library functions without a `can Net` effect for example may
not access the network. A pure function in a library may not later be updated to secretly
log user data without adding a `Net` effect - a breaking change.

There is a caveat here: if a function already has a `can Net` clause, a once-innocent function like `innocent`:

```ante
foo (bar: Bar) can Net =
    innocent bar
    my_network_fn ()

// In another library:
innocent (bar: Bar) = ...
```

May be updated to maliciously use a `Net` effect and `foo` wouldn't require a source update
since it is already declared as `can Net`:

```ante
foo (bar: Bar) can Net =
    innocent bar
    my_network_fn ()

// In another library (updated):
innocent (bar: Bar) can Net =
    send_user_data_to_private_servers bar
```

This is unfortunate and although it is a problem shared with more traditional effect systems, it
is still weaker than other capability-based security models where everything must be passed explicitly.
To mitigate this:

- The package manager can warn when a library is updated to require additional capabilities
- Ensure untrusted library functions are called in contexts with minimal effects. 

```ante
foo (bar: Bar): Unit =
    innocent bar  // error! This requires a `Net` effect but `foo` is marked pure
    my_non_network_fn ()

// In another library:
innocent (bar: Bar) can Net =
    send_user_data_to_private_servers bar
```

Even with this downside however, Ante remains more secure than existing programming
languages where all effects are untracked.

---
# Modules

Ante's module system follows a simple, hierarchical structure
based on the file system. Given the following file system:

```
.
├── foo.an
├── bar.an
├─┬ baz
│ ╰── nested.an
╰─┬ qux
  ├── nested.an
  ╰── qux.an
```

We get the corresponding module hierarchy:

```ante
Foo
Bar
Baz.Nested
Qux
Qux.Nested
```

Note how `qux/qux.an` is considered a top-level module
because it matched the name of the folder it was in and
how `baz/nested.an` is under `Baz`'s namespace because it was
in the `baz` folder. The two `nested.an` files are also in
separate parent modules so there is no name conflict.

## Imports

Importing symbols within a module into scope can be
done with an `import` expression. Using the module hierarchy
from the [section above](#modules), in our `Baz.Nested` file we
may have:

```ante
nested_baz = 0

print_baz () =
    print "baz"

get_baz () = "baz"
```

To use these definitions from `Foo` we can import them:

```ante
import Baz.Nested.nested_baz, get_baz

baz = get_baz ()
print "baz: $baz, nested_baz = $nested_baz"
```

Note that Ante does not support wildcard imports. This is an intentional decision to speed up the
name resolution step in the compiler by enabling it to be done without collecting all names
in the current project & dependencies first.

```ante
// This syntax was chosen so that when adding new imports
// you only need to edit the end of the line rather than
// needing to add a '{' or similar token before print_baz as well.
import Baz.Nested.print_baz, get_baz

print (get_baz ())
print_baz ()
```

You may also rename imports via `as`:

```ante
import Baz.Nested.get_baz as other_get_baz

import Foo.a as foo_a, b, c, d as foo_d

// No error here
get_baz () = ...
```

## Implicit Imports

To import a value into scope and enable any definitions searching for an `implicit` of the
same type to use it, the value must be imported via `import implicit`. This is most often
used to bring capabilities into scope:

```ante
import Lib.MyType
import implicit Lib.MyType.eq_mytype

main () =
    x = MyType.new ()
    print (x == x)  // requires Eq MyType
```

## Exports and Visibility

All names defined at global scope are by default visible to the entire
package but not to any external packages. Items can optionally be exported
across package boundaries by adding each name to an `export` list at the top
of the module.

```ante
// fib and sum will be exported as library functions
export fib, sum

fib n = fib_helper n 0 1

fib_helper n a b =
    if n <= 0 then a
    else fib_helper (n - 1) b (a + b)

sum n = sum_helper n 0

sum_helper n acc =
    if n <= 0 then acc
    else sum_helper (n - 1) (acc + n)
```

---
# Packages

In addition to modules, Ante has another unit of organization called packages.
Each package is meant to correspond to a project where each dependency is
also a package.

At the source code level, import paths are prefixed by a package name.
For example, in `import Foo.Bar.Baz`, `Foo` is the package to search for `Bar.Baz`
within. For new programs in an otherwise empty directory, the only packages
visible will be the current package, using the current directory's name,
and the `Std` package containing the standard library.

Packages are not required to all be in the same directory as the current project.
Instead, the compiler searches for packages in a few directories by default:

- `.` for the current package
- `/path/to/stdlib` for the stdlib
- `./deps` for dependencies of the current package

These directories to search for packages in are called the "relative roots" and can
be configured via compiler flags. The advantages of this design are as follows:

- An internet connection is never required to build a project
- This design is flexible and compatible with a package manager, although it does not require one
- Git repositories or other local projects can be cloned into the `deps` directory to quickly add local dependencies
- Dependencies aren't required to be registered with a package repository just to be used at the language level
- A package manager is free to configure the relative roots itself so that users never need to touch
  the `deps` directory or relative roots if they use a package manager
- Versioning is left to the package manager
- Multiple projects sharing the same dependencies can be accomplished by simple symlinks
- Diamond dependencies are naturally allowed

## Diamond Dependencies

Diamond dependencies occur when two dependencies of a project both depend on the same
dependency, e.g. package `A` has dependencies `B` and `C` which both depend on `D`.

```
  A
 / \
B   C
 \ /
  D
```

This is a valid configuration, and whether or not the `D` that is shared by `B` and `C`
is the same `D` is determined by the absolute file path to `D`. If the file path is the
same, the package is the same and its types are thus interchangeable. This can be done
automatically - for example by a package manager recognizing both `B` and `C` require `D`
and providing the same `D` to both by configuring the compiler's relative roots or using symlinks.

Similarly, if `B` and `C` require different versions of `D`, these will naturally be
located at separate file paths and treated as different packages. So `B` would require `D1`
and `C` would require `D2`. The result would be the following valid package graph, and
types from `D1` would be incompatible with types from `D2` (and vice versa).

```
  A
 / \
B   C
|   |
D1  D2
```
