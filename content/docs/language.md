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
sane defaults where possible.
Compared to other low-level languages, ante is safe like rust but tries
to be easier in general, for example by allowing shared mutability by
default and avoiding the need for lifetime annotations.

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

Strings in ante are utf-8 by default and are represented via a pointer and
length pair. For efficient sub-string operations, strings are not null-terminated.
If desired, C-style null-terminated strings can be obtained by calling the `c_string` function.

```ante
print "Hello, World!"

// The String type is equivalent to the following struct:
type String =
    data: Ptr Char
    len: Usz

// C-interop often requires using the `c_string` function:
c_string (s: String) : CString = ...

extern puts : CString -> I32
puts (c_string "Hello, C!")
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

A variable can be made mutable by adding the `mut` keyword when defining the variable:

```ante
// Mutable variables can be created with `mut`:
pet_name = mut "Ember"
print pet_name  //=> Ember

// And can be mutated with `:=`
pet_name := "Cinder"
print pet_name  //=> Cinder
```

Here's another example showing a function that can mutate the passed in parameter:

```ante
count_evens array counter =
    for array fn elem ->
        if even elem then
            counter += 1

counter = mut 0
count_evens [4, 5, 6] (&mut counter)

print counter  //=> 2
```

If you have a mutable struct, you can also transfer this mutability to its
fields to mutate them directly. This can be done via the `.&` operator to retrieve
a reference to a field:

```ante
my_pair = mut (1, 2)
my_pair.&first := 3

field_ref = my_pair.&second
field_ref := 4

print my_pair  //=> 3, 4

// The following two lines give an error because we never declared `bad` to be mutable
bad = 1, 2
bad.&first := 3
```

# Functions

Functions in ante are also defined via `=` and are just syntactic
sugar for assigning a lambda for a variable. That is, `foo1` and `foo2`
below are exactly equivalent except for their name.

```ante
foo1 a b =
    print (a + b)

foo2 = fn a b ->
    print (a + b)
```

```ante
// We can specify parameter types and the
// function return type via `:`
bar (a: U32) (b: U32) : Unit =
    print a
    print b
    print (a + b)
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
    next: it -> Maybe (it, elem)

first_equals_two it =
    match next it
    | Some (2, _) -> true
    | _ -> false
```
We never gave any type for `first_equals_two` yet ante infers its type for us as
`a -> Bool given Iterator a I32` - that is a function that returns a `Bool` and takes
a generic parameter of type `a` which must be an iterator producing elements of type `I32`.

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
than python and particularly when working the [pipeline operators](#pipeline-operators) we would end up with a long
chain of lines ending with `\`:

```ante
// x |> f = f x in older versions of ante
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
trait Add a with
    (+): a -> a -> a

trait Sub a with
    (-): a -> a -> a

trait Mul a with
    (*): a -> a -> a

trait Div a with
    (/): a -> a -> a

// % is modulus, not remainder. So -3 % 5 == 2
trait Mod a with
    (%): a -> a -> a
```

```ante
// Comparison operators are implemented in terms of the `Cmp` trait
trait Cmp a with
    compare: a -> a -> Ordering

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
is spelled `a#i` in ante. The more common `a[i]` syntax would be
ambiguous with a function call to a function `a` taking a single
argument that is a collection with 1 element `i`.

`#` has a higher precedence than all other binary operators. The following
example shows how to average the first and second elements in an array for
example:

```ante
average_first_two array =
    (array#0 + array#1) / 2
```

## No Dereference Operator

Dereferencing pointers in ante is somewhat uncommon, so ante provides no pointer
dereference operator. Instead, you can use the `deref` function in the standard library.
If you need to access a struct field, `struct.field` in will work as expected regardless
of whether `struct` is a struct or a pointer to a struct.

## Pipeline Operators

The pipeline operators `.` and `$` are sugar for function application and
serve to pipe the results from one function to the input of another.

`x.f y` is equivalent to `f x y` and functions similar to method syntax
`x.f(y)` in object-oriented languages. It is left-associative so `x .f y .g z`
desugars to `g (f x y) z`. This operator is particularly useful for chaining
iterator functions:

```ante
// Parse a csv's data into a matrix of integers
parse_csv (text: String) : Vec (Vec I32) =
    lines text
        .skip 1  // Skip the column labels line
        .split ","
        .map parse
        .collect
```

In contrast to `.`, `$` is right associative and applies a function on its
left to an argument on its right. Where `.`
is used mostly to spread operations across multiple lines, `$` is often
used for getting rid of parenthesis on one line.

```ante
print (sqrt (3 + 1))

// Could also be written as:
print $ sqrt $ 3 + 1
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
in memory (the exact same if you discount allignment differences).

4. More composable: having the right-associative `,` operator means we can
easily combine pairs or add an element if needed. For example, if we had a function
`unzip : List (a, b) -> List a, List b`, we could use `unzip` even on a `List (a, b, c)`
to extract a `List a, List (b, c)` for us. This means if we wanted, we may implement
`unzip3` using `unzip` (though this would likely be inefficient):

```ante
// given we have unzip : List (a, b) -> List a, List b
unzip3 (list: List (a, b, c)) : List a, List b, List c =
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
harder by having a helper trait so we can specialize the impl for pairs:

```ante
trait ToStringHelper t with
    to_string_helper (x: t) -> String = cast x

cast_pair_string = impl
    Cast (Pair a b) String via
        cast pair = "(${to_string_helper pair})"

    // Specialize the impl for pairs so we can recurse on the rhs
    ToStringHelper (Pair a b) via
        to_string_helper (a, b) = "$a, ${to_string_helper b}"
```

And these two functions will cover all possible lengths of nested pairs.

---
# Lambdas

Lambdas in ante have the following syntax:
`fn arg1 arg2 ... argN -> body`. Additionally a function definition
`foo a b c = body` is sugar for a variable assigned to
a lambda: `foo = fn a b c -> body`. Lambdas can also capture part of
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

Ante does not include traditional for or while loops since these constructs usually require mutability to be useful. Instead, ante favors recursive functions like map, fold_left, and for (which iterates over an iterable type, much like foreach loops in most languages):

```ante
// The type of for is:
// for : a -> (elem -> Unit) -> Unit given Iterator a elem

for (0..10) print   // prints 0-9 inclusive

for (enumerate array) fn (index, elem) ->
    // do something more complex...
    print result
```

You may notice that there is no way to break or continue out of the `for` function. Moreover if you need a more complex loop that a while loop may traditionally provide in other languages, there likely isn’t an already existing iterate function that would suit your need. Other functional languages usually use helper functions with recursion to address this problem:

```ante
sum numbers =
    go numbers total =
        match numbers
        | Nil -> total
        | Cons x xs -> go xs (total + x)

    go numbers 0
```

This can be cumbersome when you just want a quick loop in the middle of a function though. It is for this reason that ante provides the loop and recur keywords which are sugar for an immediately invoked helper function. The following definition of sum is exactly equivalent to the previous:

```ante
sum numbers =
    loop numbers (total = 0) ->
        match numbers
        | Nil -> total
        | Cons x xs -> recur xs (total + x)
```

After the loop keyword comes a list of variables/patterns which are translated into the parameters of the helper function. If these variables are already defined like numbers is above, then the value of that variable is used for the initial invocation of the helper function. Otherwise, if the variable/pattern isn’t already in scope then it must be supplied an initial value via =, as is the case with total in the above example. The body of the loop becomes the body of the recursive function, with recur standing in for the name of the function.

Since loop/recur uses recursion internally it is even more general than loops, and can be used to translate otherwise complex while loops into ante. Take for example this while loop which builds up a list of the number’s digits, mutating the number as it goes:

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

## `is` keyword

The `is` keyword can be used to pattern match within arbitrary expressions.
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
    if x is Some x2 and y is Some y2 and x * y > 1000 then
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
# Types

Ante is a strongly, statically typed language with global type inference.
Types are used to restrict the set of values as best as possible such that
only valid values are representable. For example, since references in ante
cannot be null we can instead represent possibly null references with
`Maybe &t` which makes it explicit whether a function can accept or
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

## Type Annotations

Even with global type inference, there are still situations where
types need to be manually specified. For these cases, the `x : t`
type annotation syntax can be used. This is valid anywhere an expression
or irrefutable pattern is expected. It is often used in practice
for annotatiing parameter types and for deciding an unbounded generic
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

Function types in Ante are of the form `arg1 - arg2 - .. - argN -> return_type`.
Note that functions in Ante always have at least one argument. Zero-argument functions
are usually encoded as functions accepting a single unit value as an argument, e.g. `Unit -> I32`.

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
//   { prefix: String, debug: a } -> Unit given Print a
print_debug x =
    prefix = x.prefix ++ ": "
    print prefix
    print x.debug
```
---
# Move Semantics

Similar to Rust, values in Ante are affine by default (may be used 0 or 1 time
before they are dropped and deallocated). These values are called
"owned" values, in contrast with references which are "borrowed" and may be
used any amount of times. The only exception to owned values being used
at most once are types which implement the `Copy` trait. This trait signals
the type may be trivially copied each time it is referred to:

```ante
s: String = "my string"
x: I32 = 42

// We've moved `s` into `foo`, trying to access it afterwards would give a compile-time error
foo s x

// Since I32 is a primitive type, we can still refer to `x` after it was passed into `foo`
bar x
```

## Borrowing

Like Rust, if a value needs to be used multiple times, we can borrow references
to it so that we can refer to the value as many times as we need.

```ante
s = "my string"

// References can be used as many times as needed
baz &s
baz &s
```

Mutable references can be borrowed from mutable values using `&mut`:

```ante
s = mut "my string"

// This function call may modify our string
qux (&mut s)

print s  //=> "???"
```

### Restrictions on References

Compared to references in Rust, Ante's references are also bound by lifetimes, although
this lifetime cannot be explicitly referred to by a lifetime variable. This is a tradeoff
which simplifies the language somewhat but means that the expressivity of references is
also more restricted compared to Rust. Generally, references are meant to mostly be used
as a parameter-passing method rather than stored deeply within types.

When used in a parameter position, each variable of a function is assumed to have a
possibly different lifetime:

```ante
concat_foo (foo: &Foo) : String =
    foo.first ++ foo.second
```

Taking a reference prevents moving the underlying value before the reference is dropped:

```ante
bad (foo: Foo) =
    // Error: Cannot move `foo` while the borrowed reference `&foo` is still alive
    bar &foo foo
```

#### Returning References

The next most common use of references is writing functions to lend references
to avoid cloning the inner value unnecessarily. Other languages with
references approach this differently. In Hylo for example, references may only
be returned in special "subscript" functions, which are in turn only able to be
called within another function call, e.g. `foo(my_subscript(bar, baz), qux)`.

Ante recognizes this common case and tries to be more flexible in comparison.
Functions returning references are allowed:

```ante
get_ref (foo: &Foo) (_bar: &Bar) : &Baz =
    foo.&baz
```

If a reference is returned from a function, none of the referenced inputs
can be moved until the returned reference is dropped.

```ante
example2 (foo: Foo) (bar: Bar) =
    ref = get_ref &foo &bar
    // Error: Cannot move `foo` while `ref` is still alive
    drop foo
    print ref
```

Since Ante has no lifetime annotations it does not know from which
variable the return result is borrowed from. To solve this, Ante conservatively
ties the lifetime of the return result to the lifetime of all of the reference
parameters to the function. In addition to not being able to move any of these
parameters afterward, this can also have implications for whether each reference
must be `shared` or not (see [shared mutability](#shared-mutability)). Consider the following code:

```ante
example2 (foo: Foo) (bar: &mut Bar) =
    ref = get_ref &foo bar
    print bar
    print ref
    ()
```

We get an error that `bar` must be a `shared` reference because the compiler sees
`ref` as a reference potentially aliased to `bar`, which would make it mutably
aliased since `bar: &mut Bar`. This is despite us being able to peek into `get_ref`
to see it actually only ever returns a reference inside of `foo`.

#### Lifetime-bound Types

Types which capture references must themselves be bound by the same lifetime as those
references. This is indicated using the `ref` keyword. For example, if we had a struct:

```ante
type Context =
    global_context: &GlobalContext
```

We would have to refer to this struct elsewhere as `ref Context`, which will restrict
the lifetime of the `Context` to that of the reference it contains internally. This is
similar to using a lifetime variable in Rust: `Context<'a>`.

If a type captures multiple references, the lifetime used by `Context` is the shortest
of all the captured lifetimes.

`ref` is also often seen when using closures which capture references:

```ante
x = Bar
foo () = x

// Type of foo is:  ref Fn Unit => &Bar
```

---

### Shared Mutability

Another difference from Rust is that Ante allows shared (aliasable) mutability.
In addition to whether a reference is `mut`able or not, a reference can also
be tagged whether it is `own`ed or `shared`. Additionally, if there is a mutable
reference borrwed from a value with at least 1 other borrowed reference to the same
value, all references are inferred to be mutably `shared`.

The `own` and `shared` tags are used to prevent operations that would be unsafe
on a shared mutable reference. A common theme of these operations is that they hand
out references inside of a type with an unstable shape. For example, handing out
a reference to a `Vec` element would be unsafe in a shared context since the `Vec`
may be reallocated by another reference. To prevent this, `Vec.get` requires
an owned reference:

```ante
// Raises Fail if the index is out of bounds
get (v: &own Vec t) (index: Usz) : &own t can Fail
```

Other Vec functions like `push` or `pop` would still be safe to call on `shared`
references to Vecs since they do not hand out references to elements. If we did
need a Vec element when all we have is a `&shared Vec t`, we can still retrieve
an element through `Vec.get_cloned`:

```ante
// Raises Fail if the index is out of bounds
get_cloned (v: &Vec t) (index: Usz) : &t can Fail given Clone t
```

As a result, if you know you're going to be working with mutably shared Vecs
or other container types, you may want to wrap each element in a pointer type
to reduce the cost of cloning: `Vec (Rc t)`.

### Reference Polymorphism

If the `own` and `shared` modifiers are omitted from the reference type, the
reference is considered to be polymorphic over both. Since most code will
not care if a reference is shared or not, this gives us some much needed
polymorphism while reducing notational burden. `Vec.get_cloned` above
is one example of a function taking references polymorphic in whether they are owned or shared.

Note that a polymorphic reference will have the capabilities of the lowest
common denominator - a `shared` reference. If an owned value is needed a
type error will be issued signalling the function will need to require an owned
reference instead.

### Internal Mutability

Since mutating through an immutably borrowed reference `&t` is otherwise impossible,
Ante provides several types for "internal mutability." `RefCell t` will be
a familiar sight to those used to Rust, but using this type entails runtime
checking to uphold the properties of an owned reference (either a mutable reference
can be made or multiple immutable references, but never both at once).

Since Ante natively supports shared references, it is also possibly to obtain a
shared reference directly through a shared pointer type like an `Rc t`:

```ante
as_mut (rc: &own mut Rc t) : &shared mut t = ...
```

Note that like most pointer types, we still need an owned reference of the
pointer itself to obtain a reference to the inside. This is because otherwise,
the value would be able to drop out from under us if another shared reference
to the pointer swapped out the Rc struct itself for another. As a result, mutating
an `Rc t` often requires cloning the outer Rc to ensure it isn't dropped while the
inner references are lent out.

If we wanted to create a shared mutable container where each element is also
mutably shared, we could use a `Vec (Rc t)` with this technique. Note that the
`Vec` itself doesn't need to be boxed since we can hand out `&shared mut` references
from owned values already. If want to store the same `Vec` reference in other data types
then we would need an `Rc` or other shared wrapper around the `Vec`.

This is essentially how many higher level languages make shared mutability work: by boxing
each value. When we employ this strategy in Ante however, we don't even need to box every
value. Just boxing container elements and union data is often sufficient.

If an owned reference `&own t` or `&own mut t` is ever required however,
a different type such as `RefCell t` would still need to be used to provide
the runtime tracking required to enforce this constraint.

---
# Traits

While unrestricted generic functions are useful, often we don't want
to abstract over "forall t." but rather abstract over all types that
have certain operations available on them - like adding. In ante, this
is done via traits. You can define a trait as follows:

```ante
trait Stringify t with
    stringify: t -> String
```

Here we say `stringify` is a function that takes a value of type `t` and returns a
`String`. With this, we can write another function that abstracts over all `t`'s that
can be converted to strings:

```ante
stringify_print (x: t) : Unit given Stringify t =
    print (stringify x)
```

Just like types and algebraic effects, we can leave out all our traits
in the `given` clauses and they can still be inferred.

Traits can also define relations over multiple types. For example,
we may want to be more general than the `Stringify` cast above -
that is we may want to have a trait that can cast to any result
type. To do this we can have a trait that constrains two generic types
such that there must be a cast function that can cast from the
first to the second:

```ante
trait Cast a b with
    cast: a -> b

// We can cast to a String using
cast 3 : String
```

## Impls

To use functions like `stringify` or `stringify_print` above,
we'll have to `impl`ement the trait for the types we want
to use it with. This can be done with `impl` blocks:

```ante
stringify_bool = impl Stringify Bool via
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

## Named Impls

In contrast to other languages with traits or typeclasses, all impls
are named in ante. This enables impls to be imported or hidden from
scope in the same manner as any other construct: by name.

```ante
import Foo.hash_bar, std_impls hiding eq_foo
```

This also enables the ability to specify which impl to use via the `via`
keyword if there are ever multiple conflicting impls in scope.

```ante
empty = impl Stringify a via stringify _ = ""

print_to_string true via stringify_bool
```

Having multiple conflicting impls anywhere in a codebase is often an error
in other languages, necessitating extensive use of the newtype pattern
for otherwise unnecessary wrapper types and boilerplate. Ante does not
enforce global [coherence](#coherence), instead opting for this name-based
approach to disambiguate where necessary.

As a final example, note that names don't have to be given to individual impls,
we can also group impls together to reduce the notational burden of needing to
name each individual impl. Note that becaues impls are disambiguated by name,
we should avoid including multiple impls for the same trait in the same named group
so that we can disambiguate between them if needed.

```ante
type Foo = first: Bar, second: Baz

foo_impls = impl
    // We can impl multiple traits via the same method:
    (Hash, Eq, Cmp) Foo via derive

    // We can also forward to a subset of fields:
    Print Foo via forward second

    // And we can use manual impls
    Combine Foo via
        (++) a b = Foo a.first (qux a b)
```

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
trait Container c elem with
    get: c -> Usz -> Maybe elem
```

At first glance this looks fine, but there's a problem: we
can implement it with any combination of `c` and `elem`:

```ante
conflicting_impls = impl
    Container (Vec I32) I32 via
        get (v: Vec I32) (index: Usz) : Maybe I32 = ...

    Container (Vec I32) String via
        get (v: Vec I32) (index: Usz) : Maybe String = ...
```

But we already had an impl for `Vec I32`, and defining a
way to get another element type from it makes no sense!
This is what associated types or ante's restricted functional
dependencies solve. We can modify our Container trait to
specify that for any given type `c`, there's only 1 valid
`elem` value. We can do that by adding an `->`:

```ante
trait Container c -> elem with
    get: c -> Usz -> Maybe elem

vec_container = impl Container (Vec a) a via
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
importing one of these impls or with an explicit `via` clause
at the callsite:

```ante
add = impl Combine I32 via (++) = (+)
mul = impl Combine I32 via (++) = (*)

print (2 ++ 3)  // Error, multiple matching impls found! `add` and `mul` are both in scope

print (2 ++ 3) via add  //=> 5
print (2 ++ 3) via mul  //=> 6
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
done with an `import` expression. Lets say
we were using the module hierarchy given in the
[section above](#modules). In our `Baz.Nested` file we
have:

```ante
nested_baz = 0

print_baz () =
    print "baz"

get_baz () = "baz"
```

To use these definitions from `Foo` we can import them:

```ante
import Baz.Nested.*

baz = get_baz ()
print "baz: $baz, nested_baz = $nested_baz"
```

We can also import only some symbols into scope:

```ante
// This syntax was chosen so that when adding new imports
// you only need to edit the end of the line rather than
// needing to add a '{' or similar token before print_baz as well.
import Baz.Nested.print_baz, get_baz

print (get_baz ())
print_baz ()
```

Now, lets say we are in module Bar and want to import `Baz.Nested`
but we already have a function named `get_baz` in scope. We cannot
do `import Baz.Nested.*` since there would be conflicting names in scope.
We could import only the functions we need but if we require many functions
from `Baz.Nested` then this may take some time. For this reason, when using
wildcard imports, you can also specify definitions to exclude, via the `hiding` clause:

```ante
import Baz.Nested.* hiding get_baz

// No error here
get_baz () = my_local_baz
```

Alternatively, you can also rename imports via `as`:

```ante
import Baz.Nested.* hiding get_baz

// If we want to import everything from Baz.Nested while renaming
// some of the items we need to list them separately since `as`
// doesn't work with * imports:
import Baz.Nested.get_baz as other_get_baz

import Foo.a as foo_a, b, c, d as foo_d

// No error here
get_baz () = my_local_baz
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
  B
 / \
A   D
 \ /
  C
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
  B - D1
 /
A
 \
  C - D2
```
---
# Extern

Ante's C FFI is currently limited to `extern` functions.
Without `extern`, all definitions must be initialized
with a value and any names used may be mangled in the
compiled output.

You can use extern by declaring a value and giving it
a type. Make sure the type is accurate as the compiler
cannot check these signatures for correctness:

```ante
extern puts: C.String -> C.Int
```

You can also use extern with a block of declarations:

```ante
extern
    exit: C.Int -> never_returns
    malloc: Usz -> Ptr a
    printf: C.String -> ... -> C.Int
```

Note that you can also use varargs (`...`) in these declarations
and it will work as expected. There is currently no equivalent
to an untagged C union in ante so using any FFI that requires
passing in unions will require putting them behind pointers
in ante.

---
# Algebraic Effects

Algebraic effects are a more complex topic described more in detail by
research languages like [Eff](https://www.eff-lang.org/) and [Koka](https://koka-lang.github.io/koka/doc/index.html).

In short, algebraic effects are similar to a resumable exception, and they
allow for non-local control flow that makes some programming styles more natural.
Algebraic effects also serve as an alternative to monads for purely functional
programming. Compared to monads, algebraic effects compose naturally but are
slightly more restrictive.

Algebraic effects can be used first by declaring the effect with the `effect` keyword,
then by performing the effect within a function. Once this happens,
the computation will suspend, and the program will call the most recent
statically-known effect handler.
From there, the effect handler can stop the computation and return a value as
with exceptions, or it can resume the computation and continue by calling `resume`
with the value to resume with. The type of value needed to resume depends on
the return type of the effect. For example, if our effect is:

```an
effect GiveInt with
    give_int: String -> I32
```

Then we will have to call `resume` with an `I32` to continue the original computation.

In an effect handler, we can match on any effects performed within the matched
expression. For example, if we want to write a handler for the `GiveInt` effect above,
we may write a function like:

```an
handle_give_int (f: Unit -> a can GiveInt) : a =
    handle f ()
    | give_int str ->
        if str == "zero"
        then resume 0
        else resume 123
```

Finally, if we have a function `do_math` which uses the `GiveInt` effect, here's
how we'd pass it to `handle_give_int` to properly handle the effect:

```an
do_math (x: I32) : I32 can GiveInt =
    a = give_int "zero"
    b = give_int "foo"
    x + a + b

handle_give_int (fn () -> do_math 3)  //=> 126
```

## Effect Control-Flow

Algebraic Effects have a control-flow that is likely novel to many programmers. It is similar
to an exception that may be resumed. We can create a new effect handler for `GiveInt` to better
show this unique control-flow:

```ante
debug_give_int (f: Unit -> a can GiveInt): a =
    handle f ()
    | give_int msg ->
        print "give_int '${msg}' called!"
        r = resume 0
        print "resume '${msg}' finished"
        r

foo () =
    print "foo called!"
    _ = give_int "foo a"
    _ = give_int "foo b"
    print "foo finished"

bar () =
    print "bar called!"
    _ = give_int "bar a"
    _ = give_int "bar b"
    print "bar finished"

example () =
    foo ()
    bar ()
```

Now when we run `debug_give_int example` we get the following print outs:

```
foo called!
give_int 'foo a' called!
give_int 'foo b' called!
foo finished
bar called!
give_int 'bar a' called!
give_int 'bar b' called!
bar finished
resume 'bar b' finished
resume 'bar a' finished
resume 'foo b' finished
resume 'foo a' finished
```

The novel control-flow is all from code after the `resume` call in the handler. If the
handler does not have any code after `resume` (ie. it is tail-resumptive) it can actually
be optimized into a normal function call. When performance is vital and an effect may be
handled in a tail-resumptive way, it is possible to specify when declaring the effect that
all handlers for it must be tail-resumptive. That way a library or application developer
can guarantee certain performance characteristics of the effect no matter its implementation.

If the above print outs are still indecipherable, see the example in
[Matching on the Returned Value](#matching-on-the-returned-value) for the step-by-step evaluation
of an effect.

## Sugar for applying handlers

You'll notice `handle_give_int` expects a function, so we have to wrap `do_math 3` in a
lambda before we pass it into our handler. Since this operation is so common, ante provides
the `with` operator which will wrap its left argument in a lambda and pass it to the function
on its right. Here is the definition of `with` in pseudocode:

```ante
a with b
    = b (fn () -> a)
```

With this we can rewrite the last line as:

```ante
do_math 3 with handle_give_int
```

There are also times when we want to use a handler to handle an entire block. For this,
we can use the `using` keyword:

```ante
// try: (Unit -> a can Fail) -> Maybe a
using try

foo = failable_operation ()
bar = failable_operation ()
foo + bar * 2
```

Which desugars to:

```ante
try fn () ->
    foo = failable_operation ()
    bar = failable_operation ()
    foo + bar * 2
```

This is often useful for error handling or early returns across function boundaries.

## Effects in Function Types

Function types like `a -> b` can always have an optional effects clause as in
`a -> b can Fail`. This effects clause controls which effects that function is
allowed to perform. For example, a function declared with the type `a -> b can Print`
may print out values but may never interact with the file system.

You can explicitly state that a function may not perform any (unhandled) effects
by appending `pure` after the function type, e.g. `a -> b pure`. Note that this
function may still perform effects internally, but any effects it performs must be
handled by the function itself. Since they must be handled without performing any
additional effects, there would be no way for the function to interact with the
file system or perform any other side-effects (since they could not do so without
using another unhandled effect).

A function declared without an effects clause is usually pure, however
it may also be effect-polymorphic. Effect polymorphic functions have a type variable
in their effects clause, e.g. `a -> b can e`. This is usually used so that these functions
can call other functions which may perform effects not relevant to the original function.
For example, consider the `map` function on arrays. It has the signature:

```ante
map (array: Array a) (f: a => b can e): Array b can e = ...
```

This signature states that `map` accepts an array and a closure of type `a => b can e`
which may perform effects `e` when called, and returns an `Array b` while performing
the effects `e`. Note that the only way for `map` to perform the effects `e` would be
if it calls the argument `f` that it was given. This allows us to call `map` with
functions that `can Print` values or that `can Fail`, or `can Async`, etc., all without
us needing to write different variants of `map` for each.

Because effect polymorphism is almost always the desired behavior, Ante will default
to being effect polymorphic if a function's effect clause is not specified. Specifically,
if the function takes another function as a parameter, the outer function will automatically
be made effect polymorphic over the parameter function's effects as long as the parameter
function's effects were not explicitly specified. So we can rewrite `map`'s signature as:

```ante
map (array: Array a) (f: a => b): Array b = ...
```

And it would be equivalent. Note that this effect-polymorphism by default isn't always desired.
In these cases, the function parameter's effects can be explicitly specified. This
may be the case when spawning threads for example:

```ante
spawn_thread (thread: Unit => Unit pure): Unit can IO, Fail = ...
```

The above function's signature states that `spawn_thread` may `Fail` and perform some IO (presumably
in the form of spawning an OS thread), while `thread` may not perform any effects itself.

Another case is when a function parameter has effects that the outer function does not. Consider:

```ante
example1 (inner1: Unit -> Unit can Fail): Unit = ...

example2 (inner2: Unit -> Unit can e): Unit = ...
```

In the case of `example1`, this type signature is similar to an effect handler which will call
`inner1` and handle the `Fail` effect internally. Usually these functions also want to allow effect
polymorphism, so if this was the intent we should also add a `can e` to both `example1` and `inner1`
since Ante will only automatically default to effect polymorphism if `inner1`'s effects weren't
explicitly specified.

In the case of `example2` we know `inner2` may perform some effect(s) `e` but don't know which effects
exactly. Additionally, since `example2` itself doesn't perform `e` and can't handle effects unless
they're known, we know `example2` can not actually call `inner2` at all. It may only pass it to other
functions which also do not call it, or drop the value without using it.

## More on Handlers

### Multiple Handlers

Unlike traits where impl search is automatic, effect handlers are
manually inserted by the programmer. This allows for multiple handlers
to be defined for any effect. As an example, lets define another handler
for `GiveInt` in addition to `handle_give_int`:

```an
the_int (int: I32) (f: Unit -> a can GiveInt) : a =
    handle f ()
    | give_int _ -> resume int

do_math 1 with the_int 5  //=> 11
```

### Matching on the Returned Value

Handle expressions can also match on the return value
of the handled expression

```an
count_giveint_calls (f: Unit -> a can GiveInt) : I32 =
    handle f ()
    | return x -> 0
    | give_int _ -> 1 + resume 0


do_math 5 with count_giveint_calls  //=> 2
```

This example can be confusing at first - how can we always return
an integer representing the number of GiveInt calls if our function
says it returns some type `a`? Let's work this out step by step
to see how it expands:

```ante
do_math 5 with count_giveint_calls

// First we expand and substitute
handle
    a = give_int "zero"
    b = give_int "foo"
    5 + a + b
| return x -> 0
| give_int _ -> 1 + resume 0

// Then reduce via our give_int rule - continuing
// the computation with the value 0 and adding 1 to the result
1 + 
  handle (a = 0; b = give_int "foo"; 5 + a + b)
  | return x -> 0
  | give_int _ -> 1 + resume 0

// Reduce via give_int again for b
1 + (1 +
       handle (a = 0; b = 0; 5 + a + b)
       | return x -> 0
       | give_int _ -> 1 + resume 0)

// Now we finish evaluating the function and would
// normally get a result of 5
1 + (1 +
       handle (return 5)
       | return x -> 0
       | give_int _ -> 1 + resume 0

// Since our handler matches on this return value,
// we use that rule next to map it to 0. The handled
// expression is now done evaluating, so the `handle` is finished.
1 + (1 + 0)

// Finally, 1 + 1 + 0 evaluates to 2 with no further effects
2
```

### Resuming Multiple Times

`resume` is a first-class function like any other, so we
can call it multiple times, or pass it to higher-order functions
like `map` and `flatmap`:

```an
these_ints (f: Unit -> a can GiveInt) (ints: Vec I32) : Vec a =
    handle f ()
    | return x -> [x]
    | give_int _ -> flatmap ints resume


do_math 2
    with these_ints [1, 3]  //=> [4, 6, 6, 8]
```

This handler is similar to the list monad in that it will keep
resuming from the given function with all combinations of the given
values, returning a Vec of all the return values when finished.

### Resuming Zero Times

Handlers may also choose not to resume at all, simply by
not calling `resume`:

```an
interpret (default_value: a) (f: Unit -> a can GiveInt) : a =
    import Random.random
    handle f ()
    | give_int "zero" -> resume 0
    | give_int "random" -> resume $ random ()
    // Do not resume, return the default value instead
    | give_int _ -> default_value

do_math 7 with interpret 42  //=> 42
```

## Error Handling

Ante primarily uses the `Fail` and `Throw e` effects for error handling.
These roughly correspond to `Maybe t` and `Result t e` respectively.
Being effects however, these are automatically propagated up the callstack:

```ante
add_even_numbers (a: String) (b: String) : U64 can Fail =
    n1 = parse a
    n2 = parse b // parse: String -> U64 can Fail

    if n1 % 2 == 0 and n2 % 2 == 0
    then n1 + n2
    else fail ()
```

Handling these effects can be done via manual `handle` expressions, or
via the `try` and `catch` helper functions
which convert Fails to Maybe, and Throws to Results:

```ante
try (f: Unit -> a can Fail) : Maybe a =
    handle f ()
    | return x -> Some x
    | fail () -> None

catch (f: Unit -> a can Throw e) : Result a e =
    handle f ()
    | return x -> Ok x
    | throw e -> Error e

print (add_even_numbers "2" "4" with try) //=> Some 6
print (add_even_numbers "2" "5" with try) //=> None
```

Because effects can be naturally composed, functions returning multiple
different errors can also be naturally composed without requiring users
to define their own error unions:

```ante
foo () can Throw FileError, Throw ParseError, Throw BarError =
    f = File.open "foo.txt"
    contents = parse (read f)
    bar contents
```

## Useful Effects

Effects are a very broadly useful feature, yet the previous examples
have been rather abstract. Here are some practical usecases for effects.

### State

Algebraic Effects can be used to emulate mutable state - automatically
threading stateful values through multiple functions.

```ante
effect Use a with
    get: Unit -> a
    put: a -> Unit

state (mut current_state: s) (f: Unit -> a can Use s) : a =
    handle f ()
    | get () -> resume current_state
    | put new_state ->
        current_state := new_state
        resume ()


type Expr =
   | Int I32
   | Var String
   | Add Expr Expr
   | Let String (rhs: Expr) (body: Expr)

Eval = Use (Map String I32)

lookup (name: String) : Maybe I32 can Eval =
    map = get ()
    map.get name

define (name: String) (value: I32) : Unit can Eval =
    map = get ()
    put (map.insert name value)

eval (expr: Expr) : I32 can Eval =
    match expr
    | Int x -> x
    | Var s -> lookup s .or_error "$s not defined"
    | Add lhs rhs -> eval lhs + eval rhs
    | Let name rhs body ->
        define name (eval rhs)
        eval body

main () =
    e = Let "foo" (Int 1) (Add (Var "foo") (Int 2))
    eval e with state Map.empty  //=> 3
```

Note that compared to the monadic approach, we do not
need to explicitly bind between effectful operations,
so we are free to write an expression like `define name (eval rhs)`
or `eval lhs + eval rhs` without needing to bind intermediate values to a name
or use a combinator function like `liftM2`.

The imperative programmer may also note that nowhere do we have to
explicitly thread through our map of names to values. This same
technique can be used to obviate the need to explicitly pass around
context parameters to functions in larger codebases. Moreover, since
whether a function requires such a context or not can be inferred,
removing a context from a function no longer requires manually removing
function arguments from every call site of that function. We gain all
this while still keeping the use of a context explicit in the function's
signature. We know any function marked `can Eval` will
make use of this context and potentially modify it. If we wanted to
separate these two notions, we could split `Get` and `Put` into different
effects instead of including them both in a `Use` effect

This example also highlights we can use type aliases for effect types.

### Imperative Programming

Combining `State`, IO effects, and a `Loop` effect for loops that can `Break`
or `Continue` lets us program in a very imperative style,
while remaining purely functional behind the scenes.

```an
effect Loop with
    break: Unit -> a
    continue: Unit -> a

for (iter: i) (f: e -> Unit can Loop) : Unit can Iterate i e =
    match next iter
    | None -> ()
    | Some (rest, elem) ->
        handle f elem
        | break () -> ()
        | continue () -> for rest f
        // If the body returns normally, we also want to continue the loop
        | return _ -> for rest f

while (cond: a -> Bool) (body: a -> Unit) : Unit can State a =
    if cond (get ()) then
        body (get ())
        while cond body

do_while (body: a -> Bool) : Unit can State a =
    if body (get ()) then do_while body

// Loop until we eventually find a prime number through sheer luck
loop_examples (vec: Vec I32) : Unit can Print, State I32 =
    for vec fn elem ->
        largest = get ()
        if largest > 100 then
            print "oops, too big!"
            break ()
        else if largest < elem then
            put elem

    // While our current integer State value is_even, loop
    while is_even fn x ->
        put $ x + random_in (1..10)

    do_while fn x ->
        print "looping..."
        put (x + 2)
        not is_prime (x + 2)

find_random_prime (vec: Vec I32) : I32 can Print =
    loop_examples vec with final_state 0
```

### Generators

The yield effect provides a way to implement generators.

```ante
effect Yield a with
    yield: Unit -> a

traverse (xs: List Int) : Unit can Yield Int =
    match xs
    | Cons x xs -> yield x; traverse xs
    | None -> ()

filter (k: Unit -> a can Yield b) (f: b -> Bool) : a can Yield b =
    handle k ()
    | yield x ->
        if f x then yield x
        resume ()

iter (k: Unit -> a can Yield b) (f: b -> Unit) : a =
    handle k ()
    | yield x -> resume (f x)

yield_to_list (k: Unit -> a can Yield b) : List b =
    handle k ()
    | return _ -> []
    | yield x -> Cons x (resume ())

main () =
    odds = traverse [1, 2, 3]
        with filter is_odd
        with yield_to_list

    // Above we see a benefit of the with operator over a different
    // lambda sugar like {foo} for (fn () -> foo). With the later
    // syntax, nesting is unavoidable:
    // odds = {{traverse [1, 2, 3]}
    //     .filter is_odd}
    //     .yield_to_list

    traverse [1, 2, 3] with filter is_odd with iter fn i ->
        print "yielded $i"
```

### Logging and Mocking

The ability to decide effect handlers at the callsite enables
us to swap out the behavior of side-effectful operations to
mock them for testing.

```an
effect Print with
    print: String -> Unit

effect QueryDatabase with
    querydb: String -> Response

database f =
    db = Database.connect "..."
    result = handle f ()
        | querydb msg -> resume (send db msg)
    close db
    result

ignore_db f =
    handle f ()
    | querydb _ -> resume Response.Empty

business_logic (should_query: Bool) : Unit can Print, QueryDatabase =
    if should_query then
        print "querying..."
        response = querydb "SELECT column FROM table"
        ...
        print "done with db"
    else
        print "did not query"

// Print effect handling is builtin, let ante handle it
main () can Print =
    business_logic true with database

// Mock our business function. Use a different handler for
// testing instead of the database handler that will actually
// connect to the database.
test () =
    handle business_logic false
    | print msg -> assert (msg == "did not query")
    | querydb _ ->
        error "Tried to query when should_query = false!"

    logs = business_logic true with ignore_db with collect_prints
    assert (not is_empty logs)
```

### Others

Other examples include using effects to
implement [asynchronous functions](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/05/asynceffects-msr-tr-2017-21.pdf), implementing
a clean design for [handling animations in games](https://gopiandcode.uk/logs/log-bye-bye-monads-algebraic-effects.html),
and generally using effects to emulate any monad except
for the continuation monad.

---
