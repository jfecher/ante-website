+++
title = "Language Tour"
date = "2021-03-01"
categories = ["docs"]
+++

---

Ante is a low-level impure functional programming language. It is low-level
in the sense that types are not boxed by default and programmers can still
delve down to optimize allocation/representation of memory if desired. A
central goal of ante however, is to not force this upon users and provide
sane defaults where possible. This can be seen in the ability to opt-out
of move semantics and even temporary references much of the time by using
shared types which resemble programming in a garbage-collected language
with boxed values.

Compared to other low-level languages, ante is memory safe like rust but tries
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

// Type error: operands of '+' must be of the same type
3i8 + 3u8

// Large numbers can use _ to separate digits
1_000_000
54_000_000_u64
```

## Floats

Floats in ante conform to the IEEE 754 standard for floating-point arithmetic
and come in two varieties: `F32` and `F64` for 32-bit floats and 64-bit
floats respectively. Floats have a similar syntax to integers, but with
a `.` separating the decimal digits.

```ante
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

Characters in ante are a single, 32-bit [Unicode scalar value](http://www.unicode.org/glossary/#unicode_scalar_value).
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
Also note that ante is strongly, statically typed yet we do not
need to specify the types of variables.
This is because ante has global [type inference](#type-inference).

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
    for elem in array do
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
bar (a: U32) (b: U32) : Unit =
    print a
    print b
    print (a + b)
```

As a shorthand for defining multiple parameters of the same type, the parameters
can share the same type annotation by grouping them together:

```ante
bar (a b: U32) : Unit =
    print a
    print b
    print (a + b)
```

### Module Namespacing

By default functions are placed in the current module. Optionally, functions may also
be placed in a child module by prefixing the function's name with the module name.
For example:

```ante
Foo.bar (a b: U32): Unit =
    print "I am defined in Foo now"
```

### Methods

Module namespacing is also how methods are defined. In Ante the `.` operator can be used
for method calls as well as field accesses. When used for method calls, the function name
will be searched for in the module with the same full path as the type of the first argument.

Note that you can only add methods to types defined in your current project. Methods cannot
be added to any types defined in dependencies.

When defining a method, the `self` variable can be used as an argument which is implicitly
of the same type as the module name. If there is no such type (e.g. it is just a normal module),
an error will be given. Like other parameters, `self` on its own will use move semantics. It
can also be borrowed either mutably or immutably by prepending a reference type such as `ref self`.

For example, the standard library defines the `Vec` type for a mutable vector and defines
methods on it like so:

```ante
type Vec a = ... // implementation omitted

Vec.new () = ...

(Vec a).push (mut self) (elem: a) = ...

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
bug). In general, ante tries to be simple with its whitespace semantics:
if the next line is indented 2+ or more spaces from the previous non-commented line
then an indent token is issued. If the lines differ by only 1 space then it is
considered to be a mistake and an error is issued. There is no notion of indenting
to or past an exact column like in Haskell's [offside rule](https://www.haskell.org/onlinereport/haskell2010/haskellch10.html#x17-17800010.3).

Secondly, anytime an unindent to a previous column occurs, an unindent token is issued.
Indents and unindents follow a stack discipline, each unindent is a return to a previous
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
explicit `{`, `}`, and `;` tokens. ~95% of programs just work now and ante could stop
there if it wanted to, and for a long time it did. A problem arises however with the
third rule of using newlines as `;` tokens. Sometimes, users may wish to continue an
expression onto multiple lines. This is a problem with parallels of automatic semicolon
insertion in other languages. The main difference being ante also has significant whitespace
to help it clue into this problem.

Ante's original solution was more of a band-aid. It followed the python example of continuing
lines with `\` at the end of a line which would tell the lexer not to issue a newline token.
There was also a similar rule for elliding newlines while we were inside `()` or `[]` pairs.
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
of the new solution were to be unambiguous, ergnomic, match a developer's mental model
of their program, and to issue error messages if needed instead of silently inferring the wrong thing.

This was initially difficult to solve but eventually ante landed on a solution based upon the
observance that when programmers want to continue lines, they almost always use indentation
to do so. Thus, to continue an expression in ante, the continuation must just be indented and
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

When the lexer sees an indent that without one of these tokens preceeding it, it does not issue
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

Operators in ante are essentially infix functions, they're even
defined in `trait`s the same way many functions are. Here are some
standard one's you're probably used to:

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
```

```ante
// Comparison operators are implemented in terms of the `Cmp` trait
trait Cmp a =
    compare: fn a a -> Ordering

type Ordering = | Lesser | Equal | Greater

(<) a b = compare a b == Lesser
(>) a b = compare a b == Greater
(<=) a b = compare a b != Greater
(>=) a b = compare a b != Lesser
```

There are also various compound assignment operators for convenience
when mutating data (`+=`, `-=`, and friends).

Logical operators have their names spelled out fully:
```ante
if true and false then print "foo"

if false or true then print "bar"

if not false then print "baz"
```

`and` binds tighter than `or`, so the following prints `true`:
```ante
if false and true or true and true then
    print true

// parsed as:
if (false and true) or (true and true) then
    print true
```

Since fiddling with individual bits is not a common operation, there
are no bitwise operators. Instead there are functions in the
`Bits` module for dealing with bits.

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

Dereferencing reference in Ante requires the element type of the reference to implement
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
parse_csv (text: String) : Vec (Vec I32) =
    lines text
        |> skip 1  // Skip the column labels line
        |> split ","
        |> map parse
        |> collect
```

In contrast to `|>`, `<|` is right associative and applies a function on its
left to an argument on its right. Where `|>`
is used mostly to spread operations across multiple lines, `<|` is often
used for getting rid of parenthesis on one line.

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
Lets compare the task of converting a tuple to a string with doing the same for pairs.
With tuples we must [create a different impl for every possible tuple size](https://hackage.haskell.org/package/base-4.14.1.0/docs/src/GHC.Show.html#line-268).
with pairs on the other hand the simple implementation works for all sizes:

```ante
cast_pair_string = impl Cast (Pair a b) String via
    cast (a, b) = "$a, $b"
```

3. Just as efficient: both pairs and tuples have roughly the same representation
in memory (the exact same if you discount allignment differences and reordering of fields).

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
Lets say we wanted to define a function `first` for getting the first
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
right-associative to avoid some extra parenthesis compared to if we had tuples.
A common example is when enumerating a tuple, most languages would need two sets
of parenthesis but in ante since tuples are just nested pairs you can just add another `,`:

```ante
pairs = [(1, 2), (3, 4)]

// Other languages require deconstructing with nested parenthesis:
for (enumerate pairs) fn (i, (one, two)) ->
    print "Iteration $i: sum = ${one + two}"

// But since `,` is just a normal operator,
// the following version is equally valid
for (enumerate pairs) fn (i, one, two) ->
    print "Iteration $i: sum = ${one + two}"
```

Finally, its necessary to mention that the earlier `Cast` example printed nested
pairs as `1, 2, 3` where as the `Show` instances in haskell printed tuples as `(1, 2, 3)`.
If we wanted to surround our nested pairs with parenthesis we have to work a bit
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

Lambdas in ante have the following syntax: `fn arg1 arg2 ... argN -> body`.
All functions in Ante must have at least one parameter. When the first argument is excluded (as in `fn -> body`), 
this is taken as sugar for a function taking a `Unit` parameter: `fn () -> body`.

Additionally a function definition
`foo a b c = body` is sugar for a variable assigned to
a lambda: `foo = fn a b c -> body`.

Lambdas can also capture part of
the variables in the scope they were declared. When they do this,
they are called closures:

```ante
augend = 2
data = 1..100

map data fn x -> x + augend
//=> 3, 4, 5, ..., 100, 101
```

## Explicit Currying

While ante opts out of including implicit currying in favor of better
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

```
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
for_ (enumerate array) fn (index, elem) {Loop} ->
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
used to translate otherwise complex while loops into ante. Take for example this while loop
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

This can be translated into ante as the following loop:

```ante
get_digits (x: U32) : List U32 =
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
| None

match foo
| Some _bar -> () // ok!
| None
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

1. All type constructors must be capitalized in ante, so when
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
can be used to test an expression matches a particular case, for example:

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
algorithm which is based on an extended version of Hindley-Milner with let-polymorphism,
multi-parameter typeclasses (traits) and a limited form of functional dependencies.

This means ante can infer variable types, parameter types, function return types, and
even infer which traits are needed in generic function signatures.

```ante
// Something is iterable if we can call `next` on it and
// get either Some element and the rest of the iterator or
// None and we finish iterating
trait Iterator it -> elem =
    next: fn it -> Maybe (it, elem)

first_equals_two it =
    match next it
    | Some (2, _) -> true
    | _ -> false
```
We never gave any type for `first_equals_two` yet ante infers its type for us as
`fn a {Iterator a I32} -> Bool` - that is a function that returns a `Bool` and takes
a generic parameter of type `a` along with an [implicit parameter](#implicits) which is an instance
of the iterator trait for `a` producing elements of type `I32`.

### Type Inference in Idiomatic Code

Note that while global type inference is possible, it is not idiomatic to have large
code bases omitting types on every function. Generally speaking, the larger the code base,
the more important it is to have clear type signatures for globally visible functions to
improve type errors in the case types change. Given it is preferred to have explicit type
signatures for functions, one may wonder why offer type inference on them at all? There
are a few reasons for this.

1. When contributing to a new or existing code base a developer often adds a couple functions at a time.
The intended work-flow of Ante is to omit the types of these functions,
and when the programmer is satisfied, they can have the compiler write in the
inferred function types itself after a successful compilation. This way the programmer does less
unnecessary work but still gets explicit types in the end. They are also still free to write explicit
types for any particularly difficult functions they need before then to help with type errors.

2. For smaller scripts it can be nice to write code without types. A type error affecting the inferred
types of other functions is less of an issue when you only have a handful of them and don't intend to write more.

3. Even in larger code bases, inferred types on functions can still be useful in some rare cases like
particularly trivial helper functions, or trait impl methods where the trait always dictates the function
type anyway.

4. In a teaching scenario, it can be useful to have the flexibility to defer teaching about types a little.
They should likely still be taught early but any bit of lowering the initial shock value for students new to programming can help.

---
# Types

Ante is a strongly, statically typed language with global type inference.
Types are used to restrict the set of values as best as possible such that
only valid values are representable. For example, since references in ante
cannot be null we can instead represent possibly null references with
`Maybe (ref t)` which makes it explicit whether a function can accept or
return possibly null values.

## Type Definitions

Both struct and tagged union types can be defined with the
`type Name args = ...`construct where `args` is the space-separated
list of type variables the type is generic over.

You can define struct types with commas separating each field or
newlines if the type spans multiple lines:

```ante
type Person = name: String, age: U8

type Vec a =
    data: Ptr [a]
    len: Usz
    capacity: Usz
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

Each of the locations in the first two `Add` cases were written explicitly here to show where they would go, but if
these fields are unneeded in a pattern match they can also be excluded with `..` which will
automatically fill in an remaining fields in a pattern:

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
types need to be manually specified. For these cases, the `x : t`
type annotation syntax can be used. This is valid anywhere an expression
or irrefutable pattern is expected. It is often used in practice
for annotating parameter types and for deciding an unbounded generic
type - for example when parsing a value from a string then printing it.
Both operations are generic so we'll need to specify what type we should
parse out of the string:

```ante
parse_and_print_int (s: String) : Unit =
    x = parse s : I32
    // alternatively we could do
    // x: I32 = parse s
    print x
```

## Int Type

Ante has quite a few [integer types](#integers) so one question
that gets raised is what is the type of an integer literal?
If we randomly choose a type like `I32` then when using all
other integer types we'd have to constaintly annotate our
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
add1 (x: Int a) : Int a =
    x + 1
```

If we do use it with a specific type however, then just like with
normal generics, the generic type variable is constrained to be
that concrete type (and the concrete type must satisfy the `Int`
constraint - ie it must be a primitive integer or we get a compile-time error).

```ante
// Fine, we're still generic over a
foo () : Int a =
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

Function types can also have an optional effect clause at the end. More on this
in [Effects in Function Types](#effects-in-function-types).

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
get_foo (x: { foo: b }) : b =
    x.foo
```

As a more complex example, here's a function that can print anything with `debug` field
that itself is printable and a `prefix` field that must be a string:

```ante
// Type inferred as:
//   fn (prefix: String, debug: a) {Print a} -> Unit
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
any amount of times, but prevent the underlying value from being moved until
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

### Borrow Sets

Each reference in Ante is parameterized by an element type and a borrow set.
The full form of a reference type is `<reference-kind> s t` where `s` is the borrow set and `t` is the element type.
The borrow set can often be omitted from the type, in which case the borrow set will either be inferred or
a fresh borrow set will be used.

The borrow set parameter represents which variable(s) a reference borrows from. In the following example:

```ante
foo = 32
bar = ref foo
```

`bar` will have the type `ref 'foo I32` because it is a reference to the variable `foo` which holds an `I32`.

Sometimes, the exact variable a reference borrows from is unknown:

```ante
example1 (foo: ref 'foo I32) (bar: ref 'bar I32) =
    // Is the return type `ref 'foo I32` or `ref 'bar I32`?
    if random () then foo else bar
```

This is why references have a borrow _set_ rather than always a single variable. For the
example above, the reference type returned would be `ref '(foo, bar) I32`. When calling
`example1`, the returned reference will be valid for only as long as _both_ arguments
to the function are:

```ante
example2 (a: ref 'a I32) =
    b = 1
    example1 a (ref b)  // error! returned reference borrows from `b` but `b` is dropped here while the reference is still used!
```

In the example above we call `example1` to return one of the two references but `b` is local
to `example2` and will be dropped when the function finishes! If this code were allowed we
would return a dangling reference which will likely lead to a runtime crash when later
dereferenced. Luckily, Ante prevents this for us with the above error.

When used in a function signature, borrow sets may be elided. When this happens, the following
rules are used for determining what the borrow set is assumed to be:

- If it is in a parameter, the borrow set is assumed to be a unique, fresh variable.
- If it is in a return type:
  - If there is a single borrow set in the parameters, the return type must refer to that same set
  - If there are multiple possible borrow sets (usually because there are multiple parameters), an error will be issued requiring users to explicitly specify which borrow set to use.

Using these rules, we can rewrite `example1`:

```ante
example1 (foo: ref I32) (bar: ref I32): ref '(foo, bar) I32 =
    if random () then foo else bar
```

Most of the time, these rules mean we can omit borrow sets unless the function both takes multiple reference parameters
and returns a reference.

```ante
concat_foo (foo1: ref Foo) (foo2: ref Foo) : String =
    foo1.msg ++ foo2.msg
```

#### Types with Borrow Sets

Borrow sets can also be added to type definitions. This is necessary if a type needs
to hold onto a temporary reference, although most of the time users should favor
wrapper types such as `Rc t` as these will generally be easier to work with. Borrow
set parameters are distinguished from regular type parameters by the `'` sigil:

```ante
type Context 'l =
    global_context: ref 'l GlobalContext
```

---

### Shared Mutability and Reference Kinds

Although largely built-upon Rust, Ante's borrowing semantics differ in that it
allows shared (aliasable) mutability via different reference kinds. Ante has
the following kinds of references:

- `ref`: Disallows mutation but may be aliased with other `ref` or `mut` references.
- `mut`: Allows mutation and may be aliased with other `ref` or `mut` references.
- `imm`: Disallows mutation and may only be aliased with other `imm` references.
  - This is exactly equivalent to `&T` in Rust.
- `uniq`: Allows mutation and may not be aliased.
  - This is exactly equivalent to `&mut T` in Rust.

`ref` and `mut` reference kinds in Ante allow shared mutability and thus have no
equivalent in Rust but can be thought of as similar to `&Cell<T>`.

Here's a table showing the two axes of what operations these reference types allow:

|           | Allows mutable aliasing | Disallows mutable aliasing |
|-----------|:-----------------------:|:--------------------------:|
| Immutable | `ref`                   |            `imm`           |
| Mutable   | `mut`                   |            `uniq`          |

So if we have a `ref` or a `mut` reference, there can be any number of other `ref` or `mut`
references to the same value at the same time. If we have a `imm` reference, there may only be other `imm`
references to the same value. Finally, if we have an exclusive reference (`uniq`), there will not
be any other reference of any kind to the same value while we hold the exclusive reference.

```ante
var message = "Hello"

// Create two shared, mutable references to the same string value
ref1: mut String = mut message
ref2: mut String = mut message

// It is safe to modify the string through shared, mutable references
ref1.* := "${message}, WorZd!"  // "Hello, WorZd!"
ref2.replace "Z" "l"
print ref2                     // "Hello, World!"
```

The `imm` and `uniq` reference kinds are used prevent operations that would be unsafe
on references which may be mutably shared. A common indication of when an operation may
be unsafe if it is mutably shared is if they hand out references inside of a type with
an unstable shape. For example, handing out a reference to a `Vec` element would be unsafe
in a shared context since the `Vec`'s contents may be reallocated by another reference.
To prevent this, `Vec.get` requires an immutable reference:

```ante
// Raises Fail if the index is out of bounds
get (v: imm Vec t) (index: Usz) {Fail}: imm t
```

Other Vec functions like `push` or `pop` would still be safe to call on shared `mut`
references to Vecs since they do not hand out references to elements. If we ever
need a Vec element when all we have is a `ref Vec t`, we can still retrieve
an element through something like `Vec.get_cloned`:

```ante
// Raises Fail if the index is out of bounds
get_cloned (v: ref Vec t) (index: Usz) {Clone t} {Fail}: t
```

As a result, if you know you're going to be working with mutably shared Vecs
or other container types, and your element type is expensive to clone, you may
want to wrap each element in a pointer type to reduce the cost of cloning: `Vec (Rc t)`.

A good rule of thumb is that shared references (`ref` and `mut`) can be used for any operations except ones
which project the reference value into a value which may be dropped if its parent reference
is mutated. This includes something like the `a` in `Maybe a` which would be dropped
if the value is set to `None`, but notably excludes fields of a struct.

#### Reference Promotions

> These rules are a work in progress!

Converting from a reference which does not allow shared mutability (`imm` or `uniq`) to one that does (`ref` or `mut`) is trivial and is always allowed:

```ante
// This works with uniq to mut as well
imm_to_ref (x: imm t) =
    requires_ref x  // ok
    foo = return_ref x  // ok
    ...

requires_ref (y: ref t): Unit = ...
return_ref (y: ref t): ref t = y
```

Above we know that `y` is a temporary reference only valid within `requires_ref`, so once the call ends we can continue
using `x` as an `imm t` reference - it isn't possible for `y` to outlive its temporary lifetime. When `return_ref` is called
we borrow `x` as a `ref` again, and this time may not use `x` again until `foo` is dropped.

Weakening references like is done above is very simple, but going the other way around from `ref` to `imm` or from `mut` to
`uniq` is more difficult. This type of conversion is called a "reference promotion" since the resulting reference
is more powerful than the original.

> Reference promotions are meant as an optimization tool to avoid clones and provide more code reuse by
> enabling `ref` and `mut` to be used in more function parameters. This lowers requirements for callers
> who are now free to pass owned (`imm`, `uniq`) or mutably shared (`ref`, `mut`) data.

A reference promotion occurs when a `imm` or `uniq` reference is required but only a `ref` or `mut` reference
is provided. When promoting a reference, instead of getting a `imm t` or `uniq t`, a `local imm t`
or `local uniq t` is received instead. Compared to the non-local versions, local references only
require us to show to the compiler that the reference is not _locally_ mutably aliased. In other words,
a `local uniq t` doesn't need to be unique globally, it only needs to be unique while it is still being used.
This allows for aliases to exist further up the call stack as long as they aren't accessed while the local
reference is alive.

Note that in the case of cyclic types, a variable is counted as a possible alias to itself and thus cannot
be promoted.


```ante
shared_to_owned (x: ref t) =
    requires_owned x 0  // ok! `x` is not used with any possible mutable aliases

requires_owned (y: imm t) (z: I32) = ...

promote_invalid (x: mut t): uniq t =
    // Converting to `uniq t` is okay - but we can't return these without keeping the `local` part
    // error! Cannot return a uniq reference promoted from a mut reference - it may be aliased by the caller
    x

promote_valid (x: mut t): local uniq t =
    // ok! Using this in the calling scope will come with the restrictions `local` provides
    x
```

The way the compiler proves a variable is not mutably aliased locally is by requiring a `Distinct a b` trait constraint
whenever a mutable variable of type `b` is used while a `local` reference to a type `a` is still alive. This trait is automatically
implemented by the compiler when the type `a` is not contained within the type `b`. For example, in
the following code, we'd expect a constraint for `Distinct String I32` to be issued (and solved):

```ante
convert_string_ref (s: mut String) (i: I32) =
    promotion: uniq String = s
    print i  // i is used while `promotion` is still used, `Distinct String I32` is searched for & satisfied
    print promotion
```

This constraint is important for preventing use of values which may have been dropped:

```ante
invalid_shared_to_owned (x: mut Vec t) (y: mut Vec t) =
    // `get` requires an `imm` reference so this must promote to `local imm Vec t`
    element_ref = v.get 0 |> unwrap
    print element_ref  // ok

    y.clear ()  // Error! Using `y: mut Vec t` may mutate the promoted reference from `v.get 0`
                // causing any references derived from this `v` to be dropped!
                // Note: No impl found for `Distinct (Vec t) (Vec t)`, so the compiler inferred these values may alias

    print element_ref
```

If we passed the same vector for both parameters to `invalid_shared_to_owned` we would be clearing the same vector we're
still holding an element reference from. Luckily, this code does not compile because the compiler rightly cannot
assume `x` and `y` are distinct.

Note that this is only an issue because `y.clear()` is called while `element_ref` is still used later. If we remove
the final `print` or move `y.clear()` after it, we no longer get any errors. The alias restriction can be as local
as we like, so as long as we can make a block of code where `v` isn't used at the same time as `y`, we are all good!

The `Distinct a b` constraint is only issued when we use variables that may be mutated, which includes mutable
references and moved values. Notably, this allows us convert many variables of the same type from `ref` to `imm` easily.
Since they are not mutable, they don't require a `Distinct a b` restriction, letting us alias the resulting `imm`
references as well:

```ante
promote_to_imm (x: ref a) (y: ref b): Unit =
    requires_imm x y

requires_imm (x: imm a) (y: imm b): Unit = ...
```

Although we promoted two generic types above, there is no need to require a `Distinct a b` or `Distinct b a`
constraint since they are both used immutably!

One downside of the `Distinct a b` check is that promoting common types like `ref String` are more difficult to
use with other variables in scope since `String`s are likely to be found within these other variables as well.

Even with these restrictions, the ability to convert `ref` and `mut` to `imm` and `uniq`
enables us write more functions with fewer requirements on the arguments they are called with (since they would
now accept references which may be mutably aliased, including `shared mut` types). Consider the following function:

```ante
type Context = names: HashMap String NameData

type NameData = uses: U32

Context.use_name (context: mut Context) (name: imm String) =
    // Strings are contained within `Context`, but the `Distinct Context String` requirement is one-way.
    // Standard borrowing rules will prevent callers from calling this method with a `name` borrowed from `context`
    if context.names.get_uniq name is Some data then
        data.uses += 1
```

Because the `HashMap.get_uniq` method requires a `uniq HashMap a b`, we would normally be required to have a
`uniq Context` as well. Since there are no possible aliases to the context in scope however, we
can locally treat it as `uniq` and get a `uniq NameData` anyway. Users of `Context.use_name` are
now less constrained in how they use their `Context` since they may pass in an owned or shared object.

### Shared Types

Shared types are a way to opt-out of
ownership rules for a type by automatically wrapping it in a copy-able wrapper.
These types can be declared via `shared type` and also do not require explicit boxing (they are always boxed):

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
meant to be used when efficiency is less of a concern over code clarity. For example when
gradually transitioning new users to use ownership rules it can be helpful if they have to worry
about it for fewer types - even if they still need to handle it for built-in types like `Vec a`.
These are also useful in cases when types need to be boxed anyway, such as `Expr` above or
the various shared, immutable container types.

Taking the reference of a field of a `shared` type will always yield a shared reference back
(similar to a `Arc t`) since the shared type may be cloned and shared elsewhere.

```ante
expr = Expr.Int 3

// We can obtain imm references inside shared types since they may not be mutated
my_ref: imm Expr = imm expr
```

#### Shared Mutable Types

In addition to `shared type`, which declares a shared, but immutable type, we can declare a shared, mutable type
via `shared mut type`:

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

    alias1 := Int 0
    assert_eq my_expr (Int 0)
    assert_eq alias2 (Int 0)
```

Unlike normal shared types, shared mutable types allow mutation into their shared contents and are thus not thread-safe.

Since their contents may be mutated while other copies exist, we cannot obtain an `imm` reference to the contents
of a `shared mut` type. We can however, obtain `ref` or `mut` references:

```ante
expr = MutExpr.Int 3

ref1: ref Expr = ref expr
ref2: mut Expr = mut expr
```

Since taking the reference of a tagged-union's field requires a `imm` or `uniq` reference (tagged-unions do
not have stable shapes since they may be mutated to a different union variant), when matching on
`shared mut` types, they are automatically copied:

```ante
eval1 (e: Expr) =
    match ref e  // error: Getting a reference to a union's fields requires an `imm` or `uniq` reference
    | Int x -> x
    ...

eval2 (e: Expr) =
    match e  // Ok (copied)
    | Int x -> x
    ...
```

### Internal Mutability

Since mutating through an immutably borrowed reference `imm t` is otherwise impossible,
Ante provides several types for internal mutability. `RefCell t` will be
a familiar sight to those used to Rust, but using this type entails runtime
checking to uphold the properties of the `imm`/`uniq` references (either a mutable reference
can be made or multiple immutable references, but never both at once).

Since Ante natively supports shared references, it is also possibly to obtain a
shared reference directly through a shared pointer type like an `Rc t`:

```ante
as_mut (rc: uniq Rc t): mut t = ...
```

Note that like most pointer types, we still need an owned reference of the
pointer itself to obtain a reference to the inside. Otherwise,
the value would be able to drop out from under us if another shared reference
to the pointer swapped out the Rc struct itself for another. As a result, mutating
an `Rc t` often requires cloning the outer Rc to ensure it isn't dropped while the
inner references are lent out.

If we wanted to create a shared mutable container where each element is also
mutably shared, we could use a `Vec (Rc t)` with this technique. Note that the
`Vec` itself doesn't need to be boxed since we can hand out shared, mutable references
from owned values already. If want to store the same `Vec` reference in other data types
then we would need an `Rc` or other shared wrapper around the `Vec`. To make using
shared mutable references easier and minimize cloning costs, consider using `shared`
types to do the pointer-wrapping for you.

This is essentially how many higher level languages make shared mutability work: by boxing
each value. When we employ this strategy in Ante however, we don't even need to box every
value. Just boxing container elements and union data is often sufficient.

## Thread Safety

Ante uses the familiar `Send` and `Sync` traits from Rust for safe concurrency. It does
not innovate here but continues with the safe, tried and true model.

---
# Implicits

In addition to normal, explicit parameters, functions can have _implicitly passed parameters_.
Implicit parameters are written with curly braces `{}` surrounding them to distinguish them
from normal parameters, and may have their names omitted if it is not otherwise used.

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
value to `bar`. This can be done using curly brances:

```ante
implicit pi: I32 = 3
implicit zero: I32 = 0

main () =
    bar 0 {pi}
```

Implicits are most commonly used for passing around [trait implementations](#impls).

---
# Traits

While unrestricted generic functions are useful, often we don't want
to abstract over "forall t." but rather abstract over all types that
have certain operations available on them - like adding. In ante, this
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

Traits in Ante are a bit different from other languages in that they are struct types
where each function is a field of that struct. In fact, their only difference from
normal structs is that the functions they define may be generic without the trait type itself
being generic over that type.

Just like types and effects, we can leave out all our traits
and they can still be inferred. When we do want to explicitly
specify them, like above, we use [implicit parameters](#implicits) to automatically
pass around the instances for us. Note that this also means we need to ensure we
import any trait implementations we want into scope first.

Traits can also define relations over multiple types. For example,
we may want to be more general than the `Stringify` cast above and
have a trait to cast to any result type. To do this we can have a
trait that constrains two generic types such that there must be a
cast function that can cast from the first to the second:

```ante
trait Cast a b =
    cast: fn a -> b

// We can cast to a String using
cast 3 : String
```

## Impls

Since traits are types in Ante, trait implementations are simply
instantiations of those types. These instantiations are often
marked `implicit` so that they may be passed around with less boilerplate.
Trait implementations being values does mean we have to name these
values though. Here's an example implementation for `Stringify Bool`:

```ante
impl stringify_bool: Stringify Bool with
    stringify b =
        if b then "true"
        else "false"

// `impl` is roughly equivalent to:
implicit stringify_bool: Stringify Bool = Stringify with
    stringify b =
        if b then "true"
        else "false"
```

Then, when we call a function like `print_to_string` which
requires `Stringify t` we can pass in a `Bool` and the
compiler will automatically find the `stringify_bool` impl
in scope and use that:

```ante
print_to_string true  //=> outputs true
```

### Inferred Implicit Parameters

When inferring a function's type, if that function requires an
implicit that references a parameter type, the implicit will be inferred
to be a parameter of the function itself. That is, the following definitions
of `print_double` are mostly the same:

```ante
// This:
print_double x = print (x + x)

// Is inferred as:
print_double (x: t) {Print t} {Add t}: Unit =
    print (x + x)
```

There is one small difference between the two: implicits inferred to be parameters
cannot be explicitly specified by users at call sites:

```ante
print_double x = print (x + x)

main () =
    // error! `print_double` was not declared with any implicit arguments
    print_double 2 {print_i32} {add_i32}
```

If we want to allow users to do so, we must explicitly specify the signature of `print_double`.

## Named Impls

In contrast to other languages with traits or typeclasses, all impls
are named in ante. This enables impls to be imported or excluded from
scope in the same manner as any other construct: by name.

```ante
import implicit Foo.Impls.eq_foo
```

When an impl is ambiguous, you can just specify the [implicit parameter](#implicits)
explicitly:

```ante
import implicit Foo.Bar.stringify_bool

impl conflicting_impl: Stringify a with
    stringify _ = ""

print_to_string true {stringify_bool}
```

Having multiple conflicting impls anywhere in a codebase is often an error
in other languages, necessitating extensive use of the newtype pattern
for otherwise unnecessary wrapper types and boilerplate. Ante does not
enforce global [coherence](#coherence), instead opting for this name-based
approach to disambiguate where necessary.

Note that the mechanism to specify how to derive impls for custom traits is still experimental.
See more on [the ideas page](/docs/ideas#derive-without-macros).

## Functional Dependencies

Some languages have a concept called [associated types](https://doc.rust-lang.org/1.16.0/book/associated-types.html).
These are often necessary to define some traits properly which
have multiple type parameters but in which we want the type
of some parameters to depend on others. Ante offers a limited
form of functional dependencies for this which is equivalent to
the associated types approach but with a nicer notation.

To illustrate the need for such a construct, lets say we wanted
to abstract over a vector's `get` function:

```ante
get (vector: Vec t) (index: Usz) : Maybe t = ...
```

We want to be able to use this with any container type, but how?
We can start out with a trait similar to our `Cast` trait from
before:

```ante
trait Container c elem =
    get: fn c Usz -> Maybe elem
```

At first glance this looks fine, but there's a problem: we
can implement it with any combination of `c` and `elem`:

```ante
impl conflicting1: Container (Vec I32) I32 with
    get (v: Vec I32) (index: Usz) : Maybe I32 = ...

impl conflicting2: Container (Vec I32) String with
    get (v: Vec I32) (index: Usz) : Maybe String = ...
```

But we already had an impl for `Vec I32`, and defining a
way to get another element type from it makes no sense!
This is what associated types or ante's restricted functional
dependencies solve. We can modify our Container trait to
specify that for any given type `c`, there's only 1 valid
`elem` value. We can do that by adding an `->`:

```ante
trait Container c -> elem =
    get: fn c Usz -> Maybe elem

impl vec_container: Container (Vec a) a with
    get (v: Vec a) (i: Usz) : Maybe a = ...
```

This information is used during type inference
so if we have e.g. `e = get (b: ByteString) 0` and there
is an impl for `Container ByteString U8` in scope then we also
know that `e : U8`.

Note that using a functional dependency in a trait signature
looks a lot like separating the return type from the arguments
of a function. This was intentional; a good
rule of thumb on when to use functional dependencies is if
the type in question only appears as a return type for the
function defined by the trait. For the `Container` example
above, `elem` is indeed only used in the return type of `get`.
The most notable exception to this rule is the `Cast` trait
defined earlier in which it is useful to have two impls
`Cast I32 String` and `Cast I32 F64` to cast integers
to strings and to floats respectively.

## Coherence

Ante has no concept of global coherence for impls,
so it is perfectly valid to define overlapping impls or define
impls for types outside of the modules the type or trait were
declared in. If there are ever conflicts with multiple valid
impls being found, an error is given at the callsite and the
user will have to manually specify which to use either by only
importing one of these impls or by explicitly specifying which
[implicit parameter](#implicits) to use:

```ante
impl add: Combine I32 with (++) = (+)
impl mul: Combine I32 with (++) = (*)

print (2 ++ 3)  // Error, multiple matching impls found! `add` and `mul` are both in scope

print ((++) 2 3 {add})  //=> 5
print ((++) 2 3 {mul})  //=> 6
```

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

To import a value into scope and enable any definitions searching for a `implicit` of the
same type to use it, the value must be imported via `import implicit`. This is most often
used for trait implementations:

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
located at separate filepaths and treated as different packages. So `B` would require `D1`
and `C` would require `D2`. The result would be the following valid package graph, and
types from `D1` would be incompatible with types from `D2` (and vice-versa).

```
  A
 / \
B   C
|   |
D1  D2
```
---
# Platform Independence

Ante code is platform independent in that each Ante program is written against an interface
for its target platform. It may not use functions not in this interface, and programs may not
declare `extern` symbols in an ad-hoc manner like in other languages. Instead, `main` takes the
platform it is targetting as an argument where each platform is an interface of functions available
on that platform:

```ante
main {Linux} =
    // Linux provides access to syscalls such as fork, execve, and utilities such as io_uring

main {Posix} =
    // fork, execve, open, etc.

main {Windows} =
    // CreateThread, CreateProcess, etc
```

More commonly, `main` will take `IO` as an argument which is an abstracted interface implemented
by several common platforms:

```ante
main {IO} = ...
```

Code written using `IO` is expected to be reasonably cross-platform, although code written with
more narrow capabilities will be even more so. For example, a function requiring only the `Print`
capability (a part of the overall `IO` capability) will be easier to use on more exotic platforms
that don't support all of `IO`. For this reason, libraries are encouraged to only require capabilities
they actually need rather than pulling in all of `IO` because it is convenient.

## Linking Dynlibs

Ante has no `extern` equivalent in other languages to ad-hoc pull in symbols expected to be resolved by the linker.
Instead, programs or libraries requiring dynamic libraries must define an interface and program against it
like what is done for platforms above (indeed, it is the same mechanism). These interfaces can be defined
as a type:

```ante
!lib
type Llvm =
    LLVMShutdown: fn Unit -> Unit
    LLVMGetVersion: fn (major: Ptr C.UInt) (minor: Ptr C.UInt) (patch: Ptr C.UInt) -> Unit
    LLVMCreateMessage: fn (message: C.String) -> C.String
    LLVMDisposeMessage: fn (message: C.String) -> Unit

    type ContextRef = Ptr Unit
    LLVMContextCreate: fn Unit -> ContextRef
    ...
```

And given to `main` as an argument, usually to be passed implicitly

```ante
main {IO} {Llvm} = ...
```

From there, the package manager (with direction from the user) is expected to link the appropriate library
to provide values for these symbols. Platforms on which the underlying library is not supported may still
use the interface by implementing it themselves if possible. For example, a library written to require a
particular dynlib may still be usable on a platform without it if that dynlib's interface may be written
in terms of functions that are available. By forcing programming against an interface like this, Ante
code remains platform agnostic.

## Implementing a new platform

Getting code working for a new platform requires a few things:

1. Depending on the platform, a new backend may be necessary. Getting Ante code working on the JVM or BEAM VM
for example would require this. This could be added as a build step after Ante emits LLVM-IR.
2. Any new primitives could be specified in a new interface and defined by the backend.
3. Finally, existing capabilities like `IO` or `Print` could be implemented in terms of the functions
in the new interface. Since `IO` and `Print` are interfaces themselves, this is as easy as implementing any
other interface (although all of `IO` will be large):

```ante
impl print_jvm {Jvm}: Print with
    print bytes = Jvm.writeBytes (bytes.as_ptr ()) 0 (bytes.len ())
```

---
# Effects, Handlers, and Capabilities

Effects are a control-flow abstraction similar to a resumable exception. They are a
useful tool since they can be used to abstract over several kinds of non-local control-flow
(exceptions, generators, async, early-returns, etc). They can serve a similar purpose as
monads, but unlike monads, they compose together more naturally.

Effects can be declared with the `effect` keyword which define a set of functions
in an effect:

```ante
effect GiveInt with
    give_int: fn String -> I32
```

These effects are said to be "performed" when called. In `give_int "foo"` we perform the
`GiveInt` effect. To be able to call an effect, we must have a value of the effect in
scope, e.g:

```ante
call_give_int {GiveInt}: I32 =
    give_int "foo"
```

Similar to traits, effects are most often passed as implicits. This effect value is sometimes
called a "capability" since it gives you the capability to perform a particular effect. The
trait analogy continues a bit further: where traits have meanings given to them by trait impls,
effects have meanings given to them by effect handlers:

```ante
handle_give_int (f: fn GiveInt => a): a =
    handler h for give_int msg ->
        if msg == "zero" then resume 0
        else resume 42
    in f h
```

The `GiveInt` handler above is roughly identical to a trait implementation if `GiveInt` were a trait:

```ante
// GiveInt is not a trait, so this is only to highlight similarities
impl h: GiveInt with
    give_int msg =
        if msg == "zero" then 0
        else 42
```

Where the handler differs is the `resume` function that is in scope of the `give_int` implementation.
`resume` allows us to resume from where the `give_int` call was originally made with the given
value. In this case, since `give_int` returns a `I32`, we must provide a `I32` to resume with.

If we always resumed in a tail position (ie. as the very last thing we did) then there'd be
nothing special about effects - we could have just used a trait or closure instead. The power
of effects often comes when we choose _not_ to call resume, or when we want to perform work
_after_ calling resume (which would run after the entire computation finishes). As a mental model,
you can think of performing an effect as suspending the current call stack, jumping to the handler,
executing it, and jumping back when resume is called. If the handler didn't finish (ie. there is more
work to do after the resume call), it will accumulate extra stack frames to run when the computation
is finished.

This can be a lot to wrap one's head around at first - a good way of learning may be by looking through
some examples.

## Error Handling

Some of the most common effects you'll see are the `Fail` and `Throw e` effects for
error handling. These roughly correspond to the `Maybe t` and `Result t e` types respectively.
Being effects however, these do not need to be manually unpacked at each call site.

```ante
/// The Fail effect represents a generic failure. It is meant to be used when the reason
/// why is obvious and needs no extra information.
effect Fail with
    fail: fn Unit -> Never

/// Throw on the other hand will throw a value to its handler. It can be thought of
/// as an exception.
effect Throw e with
    throw: fn e -> Never

safe_div (a: U32) (b: U32) {Fail}: U32 =
    if b == 0 then fail ()
    a / b

type Name = first: String, last: String
type ParseError = | NoName | NoLastName | ComplexName

parse_name (name: String) {Throw ParseError}: Name =
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
as resumeable exceptions, so if we want normal exceptions all we must do
is not call `resume` in the handler. A function like `try` will instead
return `None` while `try_or` provides a default value on error instead.

```ante
try (f: fn Fail => a): Maybe a =
    handler h for fail () -> None
    Some (f h)

catch (f: fn (Throw e) => a): Result a e =
    handler h for throw e -> Err e
    Ok (f h)

print (safe_div 6 2 ~> try) //=> Some 3
print (safe_div 6 0 ~> try_or 42) //=> 42

print (parse_name "First Last" ~> catch) //=> Ok (Name "First" "Last")
print (parse_name "First" ~> catch) //=> Err NoLastName
print (parse_name "" ~> catch_or (Name "Bob" "Default")) //=> Name "Bob" "Default"
```

Because effects can be naturally composed, functions returning multiple
different errors can also be naturally composed without requiring users
to define their own error unions:

```ante
foo {Throw FileError} {Throw ParseError} {Throw BarError} =
    f = File.open "foo.txt"
    contents = parse (read f)
    bar contents
```

## Applying Handlers

Most handler functions like `try` or `catch` above take a function as an argument to supply
the handler for. Instead of manually wrapping each operation as in `try (fn {fail_handler} -> safe_div 6 2)`,
it is convenient to have alternate ways to apply handlers, similar to how we can apply normal
functions directly: `f x`, or with the pipeline operators: `f <| x`, `x |> f`.

### Applying Handlers with `~>`

Since most effectful functions accept their capabilities as implicit arguments, `~>` works by automatically
creating a closure with an implicit argument such that `try (fn {fail_handler} -> safe_div 6 2)` is equivalent
to `safe_div 6 2 ~> try`.

### Applying Handlers with `<-`

Some handlers are often applied to the entire remainder of a block or function, rather than a short expression.
For these cases it can be helpful to use the backwards `<-` arrow to limit nesting:

```ante
try fn {h} ->
    failable_function1 ()
    failable_function2 ()
    failable_function3 ()

// or with the `<-` arrow:
implicit h <- try
failable_function1 ()
failable_function2 ()
failable_function3 ()
```

### Applying Handlers with Currying

Since the `~>` operator introduces a new implicit, for patterns where you're threading through
many implicits of the same effect (most notably generators), you may get "multiple matching implicits"
errors when using it. For this reason, generators in Ante are designed to return functions
directly instead (essentially manually currying them). This is why you'll see the various stream functions defined as:

```ante
map (s: s) {Stream s a} (f: fn a => b) = fn {Emit b} ->
    ...

// And since these functions already return functions, we can pipeline them easily:
doubled_evens stream = filter stream (_ %% 2) |> map (_ * 2) |> Vec.of
```

## Effect Control-Flow

Effects have a control-flow that is likely novel to many programmers. It is similar
to an exception that may be resumed. We can create a handler to better
show this unique control-flow:

```ante
effect MyEffect with
    my_effect: fn String -> Unit

debug_effect_control_flow (f: MyEffect => a): a =
    handler h for my_effect msg ->
        // Print the message
        print "my_effect '${msg}' called!"
        // Resume the computation & finish it entirely (including other calls to my_effect!)
        r = resume 0
        // And only then print `finished`
        print "resume '${msg}' finished"
        r
    f h

foo () {MyEffect} =
    print "foo called!"
    _ = my_effect "foo a"
    _ = my_effect "foo b"
    print "foo finished"

bar () {MyEffect} =
    print "bar called!"
    _ = my_effect "bar a"
    _ = my_effect "bar b"
    print "bar finished"

example {MyEffect} =
    foo ()
    bar ()
```

Now when we run `debug_effect_control_flow example` we get the following print outs:

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

Note that we do not get any of the "resume ... finished" print outs until the entire
computation `f h` finishes. We are continually pushing stack frames to the handler to
finish later until all resumes finish from the last to the first as the stack frames
are popped.

The novel control-flow of this is all from code after the `resume` call in the handler. If the
handler does not have any code after `resume` (ie. it is tail-resumptive) it can actually
be optimized into a normal function call. When performance is vital and an effect may be
handled in a tail-resumptive way, it is possible to specify when declaring the effect that
all handlers for it must be tail-resumptive. That way a library or application developer
can guarantee certain performance characteristics of the effect no matter its implementation.

### Step-by-Step Evaluation

In case the above example was difficult to understand, we'll walk through an example showing
step-by-step how the function may be evaluated. This will be our example:

```an
effect Foo with
    foo: fn String -> I32

do_math (x: I32) {Foo}: I32 =
    a = foo "zero"
    b = foo "bar"
    5 + a + b

count_foo_calls (f: fn Foo => a): I32 =
    // This handler is in scope for `f h; 0`, so the `resume` call ends right after the `0`
    handler h for foo _ -> 1 + resume 0
    f h
    0

do_math 5 ~> count_foo_calls  //=> 2
```

This example can be confusing at first - how can we always return
an integer representing the number of `foo` calls if our function
says it returns some type `a`? Let's work this out step by step
to see how it expands:

```ante
do_math 5 ~> count_foo_calls

// First we expand and substitute - I've added an explicit `in` clause for the handler
handler h for foo _ -> 1 + resume 0 in
    a = foo "zero"
    b = foo "bar"
    5 + a + b
    0

// Then reduce via our `foo` rule - continuing
// the computation with the value 0 and adding 1 to the result
handler h for foo _ -> 1 + resume 0 in
  1 + (
    a = 0
    b = foo "bar"
    5 + a + b
    0
  )

// Reduce via foo again for b
handler h for foo _ -> 1 + resume 0 in
  1 + (1 + (
    a = 0
    b = 0
    5 + a + b
    0
  ))

// Now we finish evaluating the function and would
// normally get a result of 5 - but it is sequenced immediately after,
// discarding the `5` and returning a `0` instead.
handler h for foo _ -> 1 + resume 0 in
  1 + (1 + (
    5
    0
  ))

// After sequencing:
handler h for foo _ -> 1 + resume 0 in
  1 + (1 + 0)

// The handled expression is now done evaluating, so the `handler` is finished.
1 + (1 + 0)

// Finally, 1 + 1 + 0 evaluates to 2 with no further effects
2
```

## Capabilities

Ante's capabilities (effect objects) differ from other effect systems where effects
are tracked in the function's type itself by instead being part of a function's
parameter list. Ante uses capabilities over a more classical effects system because:

- Being function parameters, capabilities can be passed around normally or via implicits
without requiring a separate mechanism in the language. 
- Since they are not tracked on a row type on the function, there is no restriction that
each capability used must have a unique type. Users are free to use two separate
`State String` effects on the same function, have two separate `Fail` error-channels, etc.
- Issues with type inference can be resolved more easily by explicitly specifying which
capability to use when needed.
- A codebase is free to require certain capabilities (or all of them) to only be explicitly
passed around. They may wish to do this to more strictly handle security or performance for certain effects.
- Many languages with effects convert effects into capability-passing anyway
to compile them more efficiently. Requiring users to write this way in the first place means
the compiler has less work to do and can thus compile programs faster.
- If a trait in Ante wishes to permit effects depending on its implementation, with a classical effect
system, it must abstract over both its environment (to capture other trait impls) and the effects
clause, e.g. `Eq t env eff`. With capabilities, a trait must only abstract over its environment: `Eq t env`.
This `env` parameter is determined by the impl and is hidden to users. Hiding an effect parameter the
same way could have surprising results to users when their function is inferred to have different effects
based on the trait implementation that was chosen. Similarly, generic functions would need to specify the effect
parameters of the traits they use.

The main downside of capabilities compared to effects is that you lose the ability to
specify that a function is completely free of effects - ie. that it is pure. Capabilities in
Ante may be captured as part of a closure's environment, and while you could require a passed-in
function have no environment, this would often be unnecessarily limiting. I will argue, however,
that requiring a function to be completely pure is a similarly limiting design trap.

For example, when we memoize a function, we often want that function to be pure - yet even
with this constraint there are many effects we may still want to allow. One such effect is
the `Allocate` effect. It is often alright for the function to allocate - and although technically
impure, this is not usually what we mean by requiring our memoized function to be pure.
Similarly, interned values may wish to have a `Context` effect so that they can retrieve their
actual data from their context. If a function like `display` required purity, users would no
longer be able to retrieve the contexts to properly display interned values (they would
need to create a wrapper object first). For these reasons, true purity is often a trap.
It is often better to specify what is desired more directly. For thread-safety for example,
instead of requiring purity of the spawned function, Ante requires it to be `Send`/`Sync`,
which effects can implement as long as their captured environment is `Send`/`Sync`.

## Resuming Multiple Times

In other languages with effects and handlers it may be possible to resume
multiple times. This is currently not possible in Ante largely due to
issues with mutability and efficiency, but may be allowed in the future.

Instead, `resume` in Ante is typed as a `FnOnce` which limits it to only
being called once. The plus side of this is that it opens up more opportunities
for implementing effects in an efficient way.

## Useful Effects

Effects are a very broadly useful feature, yet the previous examples
have been rather abstract. Here are some practical usecases for effects.

### Exceptions

See [Error Handling](#error-handling)

### Generators

The `emit` effect provides a way to implement generators.

```ante
effect Emit a with
    emit: fn a -> Unit

/// Stream the contents of `t` into the `Emit a` capability
///
/// Most streams are generator functions, others are containers that supply a
/// function to emit each element.
trait Stream t a with
    stream: fn t (Emit a) -> Unit

/// Emit numbers from 0 to `n`, end-exclusive
iota n = fn {Emit Usz} ->
    for i in 0usz .. n do emit i

/// Applies `f` to each element from the stream, re-emitting each result.
/// 
/// Given `a1, a2, .., aN`, emit `f a1, f a2, .., f aN`
map (s: s) {Stream s a} (f: fn a => b) = fn {e: Emit b} ->
    handler h for emit a ->
        e.emit (f a)
        resume ()
    Stream.stream s h

/// Re-emits only the elements from the original stream for which `f elem` is true
///
/// E.g. `filter (iota 5) (_ > 2)` will emit `3` and `4`.
filter (s: s) {Stream s a} (f: fn (ref a) => Bool) = fn (e: Emit a) ->
    handler h for emit a ->
        if f (ref a) then e.emit a
        resume ()
    Stream.stream s h

/// Infinite stream example
fibonacci {Emit U64}: Unit =
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

See the [Stream module in the stdlib](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an) for more functions on streams.

### Loops and Early-Returns

We can combine generators with a `Loop` effect that lets us `continue` and `break`
out of loops.

```an
effect Loop with
    break_: fn Unit -> Never
    continue_: fn Unit -> Never

/// Consumes the given stream, applying `f` to each element, with
/// an additional Loop handler installed to allow breaking/continuing
/// within the overall loop.
for_ (s: s) {Stream s a} (f: fn a Loop => b): Unit =
    handler emit_handler for emit a ->
        // Scope the Loop handler to `f a loop_handler` only, so `continue_` skips just
        // the current iteration rather than the rest of the emit handler.
        // `break_` returns from the entire emit handler, so `resume ()` is
        // skipped and the stream halts.
        handler loop_handler for
        | break_ () -> return ()
        | continue_ () -> ()
        in
            f a loop_handler
            ()
        resume ()
    Stream.stream s emit_handler

main () =
    // Print `12457`:
    for_ (iota 10) fn i {l} ->
        if i %% 3 then continue_ ()
        if i > 7 then break_ ()
        print i
```

Similarly, there is the `EarlyReturn` effect for early-returning. Since this is
an effect, we can use it even to early return out of potentially multiple closures:

```ante
effect EarlyReturn a with
    early_return: fn a -> Never

with_early_return (f: fn (EarlyReturn t) => t): t =
    handler h for early_return x -> x
    f h

/// Find the index of the given element in the sequence.
/// Fails if there is no matching element.
find_in_seq (seq: Seq t) (target: ref t) {Eq t} {Fail}: Usz =
    _ <- with_early_return
    enumerate seq |> iter fn (i, elem) ->
        if target == elem then
            early_return i

    fail ()

/// If we wanted, we can even refactor `find_in_seq` into multiple functions
find_in_seq2 (seq: Seq t) (target: ref t) {Eq t} {Fail}: Usz =
    _ <- with_early_return
    enumerate seq |> iter (early_return_if_items_match _ target)
    fail ()

early_return_if_items_match (i: Usz, a: ref t) (b: ref t) {Eq t} {EarlyReturn Usz}: Unit =
    if a == b then early_return i
```

### Logging and Mocking

The ability to decide effect handlers at the callsite enables us to swap out the behavior
of side-effectful operations to mock them for testing. This can be done in other languages without
effects, but Ante's use of a handleable effect for even `println` means we can often test code
regardless of whether it was written with limiting side-effects and testing in mind.

```an
effect Print with
    print: fn String -> Unit

effect QueryDatabase with
    querydb: fn String -> Response

database f {IO} =
    db = Database.connect "..."
    result =
        handler h for querydb msg -> resume (db.send msg)
        f h
    close db
    result

ignore_db f =
    handler h for querydb _ -> resume Response.Empty
    f h

business_logic (should_query: Bool) {Print} {QueryDatabase}: Unit =
    if should_query then
        print "querying..."
        response = querydb "SELECT column FROM table"
        ...
        print "done with db"
    else
        print "did not query"

// Print effect handling is builtin, let ante handle it
main {Print} =
    business_logic true ~> database

// Mock our business function. Use a different handler for
// testing instead of the database handler that will actually
// connect to the database.
test {Fail} =
    handler p for print msg ->
        assert (msg == "did not query")
        resume ()
    in
        handler db for querydb _ ->
            error "Tried to query when should_query = false!"

        business_logic false

    logs = business_logic true ~> ignore_db ~> collect_prints
    assert (not is_empty logs)
```

### Interning

> This is more an advantage of Ante's implicits coupled with traits being implemented in terms of
> them, but since other effect languages use a `State` effect for similar behavior, it is worth
> mentioning how to achieve the same in Ante.

Interning values is a common optimization but unfortunately often makes these interned values
more cumbersome to work with. For example, often when implementing traits they require wrapper
objects to be created first to bundle them with the appropriate context first. 

```ante
type Data = bytes: Vec U8

type DataId = id: U32

type Context =
    // Each `DataId` is an index into this map
    map: Vec Data

impl display_data_id {ctx: ref Context}: Display DataId with 
    display (id: DataId) {Emit String} =
        data = ctx.map.get id ~> unwrap
        display data
```

### Others

Other examples include using effects to
implement [asynchronous functions](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/05/asynceffects-msr-tr-2017-21.pdf),
a clean design for [handling animations in games](https://gopiandcode.uk/logs/log-bye-bye-monads-algebraic-effects.html),
random state, or parsers, among others.

---

# Capability-based Security

By requiring capabilities for each effect (and external library) used by a function, Ante has
capability-based security. Libraries that do not require a `Network` effect for example may
not access the network. A pure function in a library one day may not be updated to secretly
log user data in the future without adding a `Network` effect - a breaking change.

There is a caveat here: since most effect capabilities are passed as implicits, if a function
already has an implicit `Network` in scope, a once-innocent function like `innocent`:

```ante
foo (bar: Bar) {Network} =
    innocent bar
    my_network_fn ()

// In another library:
innocent (bar: Bar) = ...
```

May be updated to maliciously use a `Network` effect and `foo` wouldn't require a source update
since an implicit was already available:

```ante
foo (bar: Bar) {Network} =
    innocent bar
    my_network_fn ()

// In another library (updated):
innocent (bar: Bar) {Network} =
    send_user_data_to_private_servers bar
```

This is unfortunate and although it is a problem shared with more traditional effect systems, it
is still weaker than other capability-based security models where everything must be passed explicitly.
To mitigate this:

- The package manager can warn when a library is updated to require additional capabilities
- A particularly cautious programmer can require every capability be passed explicitly in the first place:

```ante
foo (bar: Bar) (net: Network) =
    innocent bar  // error! no implicit of type `Network` found
    my_network_fn () {net}

// In another library:
innocent (bar: Bar) {Network} =
    send_user_data_to_private_servers bar
```

Even with this downside however, Ante remains significantly more secure than existing programming
languages where all effects are untracked.
