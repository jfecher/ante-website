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
to be easier in general, for example by avoiding the need for ownership
semantics through lifetime inference.

---
# Literals

## Integers

Integer literals can be of any signed integer type (i8, i16,
i32, i64, isz) or any unsigned integer type (u8, u16, u32, u64, usz) but by
default integer literals are [polymorphic](#int-trait). Integers come in
different sizes given by the number in their type that specifies
how many bits they take up. `isz` and `usz` are the signed and unsigned
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
and come in two varieties: `f32` and `f64` for 32-bit floats and 64-bit
floats respectively. Floats have a similar syntax to integers, but with
a `.` separating the decimal digits.

```ante
// Float literals aren't polymorphic - they are of type f64
3.0 + 4.5 / 1.5

// 32-bit floats can be created with the f32 suffix
3.0f32
```

## Booleans

Ante also has boolean literals which are of the `bool` type and can be either
`true` or `false`.

## Characters

Characters in ante are a single, 32-bit [Unicode scalar value](http://www.unicode.org/glossary/#unicode_scalar_value).
Note that since `string`s are UTF-8, multiple characters are packed into strings and if
the string contains only ASCII characters, it's size in memory is 1 byte per character in the string.

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

// The string type is equivalent to the following struct:
type string =
    data: Ptr char
    len: usz

// C-interop often requires using the `c_string` function:
c_string (s: string) -> CString = ...

extern puts : CString -> i32
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
Mutable variables are created via `= mut` and can be mutated
via the assignment operator `:=`. Also note that ante is strongly,
statically typed yet we do not need to specify the types of variables.
This is because ante has global [type inference](#type-inference).

```ante
n = 3 * 4
name = "Alice"

// We can optionally specify a variable's type with `:`
reading_about_variables: bool = true

// Mutable variables are created with `mut` and mutated with `:=`
pet_name = mut "Ember"
print pet_name  //=> Ember

pet_name := "Cinder"
print pet_name  //=> Cinder
```

## A brief note on mutability

Generally, mutability can make larger programs
more difficult to reason about, creating more bugs and increasing the cost
of development. However, there are algorithms that are simpler or more efficient
when written using mutability. Being a systems language, ante takes the position
that mutability should generally be avoided but is sometimes a necessary evil.

## Functions

Functions in ante are also defined via `=` and are just syntactic
sugar for assigning a lambda for a variable. That is, `foo1` and `foo2`
below are exactly equivalent except for their name.

```ante
foo1 a b =
    print (a + b)

foo2 = fn a b ->
    print (a + b)
```

Since ante is impure, combining effects can trivially be done via sequencing
two expressions which can be done by separating the expressions with a newline.
`;` can also be used to sequence two expressions on the same line if needed. 

```ante
// We can specify parameter types via `:`
// and the function's return type via `->`
foo1 (a: u32) (b: u32) -> unit =
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
`a -> bool given Iterator a i32` - that is a function that returns a `bool` and takes
a generic parameter of type `a` which must be an iterator producing elements of type `i32`.

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
|> max!

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
|> max!

// Newer versions of ante use . instead which helps break old habits
// and encourage indenting. It also reads slightly better when used
// for shorter function calls. Compare `vec |> push 4` with `vec.push 4`.
// Here's the fixed, indented version
map data (_ + 2)
    .filter (_ > 5)
    .max!

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
If you need to access a stuct field, `struct.field` in will work as expected regardless 
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
parse_csv (text: string) -> Vec (Vec i32) =
    lines text
        .skip 1  // Skip the column labels line
        .split ","
        .map parse!
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
`1, 2, 3` to construct a value of type `i32, i32, i32`
which in turn is just sugar for `Pair i32 (Pair i32 i32)`.

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
cast_pair_string = impl Cast (Pair a b) string via
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
unzip3 (list: List (a, b, c)) -> List a, List b, List c =
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
iter (enumerate pairs) fn (i, (one, two)) ->
    print "Iteration $i: sum = ${one + two}"

// But since `,` is just a normal operator,
// the following version is equally valid
iter (enumerate pairs) fn (i, one, two) ->
    print "Iteration $i: sum = ${one + two}"
```

Finally, its necessary to mention that the earlier `Cast` example printed nested
pairs as `1, 2, 3` where as the `Show` instances in haskell printed tuples as `(1, 2, 3)`.
If we wanted to surround our nested pairs with parenthesis we have to work a bit
harder by having a helper trait so we can specialize the impl for pairs:

```ante
trait ToStringHelper t with
    to_string_helper (x: t) -> string = cast x

cast_pair_string = impl 
    Cast (Pair a b) string via
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
// Given a matrix of Vec (Vec i32), output a string formatted like a csv file
map matrix to_string
  .map (join _ ",") // join columns with commas
  .join "\n"        // and join rows with newlines.
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

Ante does not include traditional for or while loops since these constructs usually require mutability to be useful. Instead, ante favors recursive functions like map, fold_left, and iter (which iterates over an iterable type, much like foreach loops in most languages):

```ante
// The type of iter is:
// iter : a -> (elem -> unit) -> unit given Iterator a elem

iter (0..10) print   // prints 0-9 inclusive

iter (enumerate array) fn (index, elem) ->
    // do something more complex...
    print result
```

You may notice that there is no way to break or continue out of the iter function. Moreover if you need a more complex loop that a while loop may traditionally provide in other languages, there likely isn’t an already existing iterate function that would suit your need. Other functional languages usually use helper functions with recursion to address this problem:

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
        | Cons x s -> recur xs (total + x)
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
get_digits (x: u32) -> List u32 =
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
   | Int i32
   | String string

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
type Person = name: string, age: u8

type Vec a =
    data: Ptr [a]
    len: usz
    capacity: usz
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
parse_and_print_int (s: string) -> unit =
    x = parse s : i32
    // alternatively we could do
    // x: i32 = parse s
    print x
```

## Refinement Types

Refinement types are an additional boolean constraint on a normal type.
For example, we may have an integer type that must be greater than 5.
This is written as `x: i32 where x > 5`. These refinements can be
written anywhere after a type is expected, and are mostly restricted
to numbers or "uninterpreted functions." This limitation is so we can
infer these refinements like normal types. If we instead allow any value
to be used in refinements we would get fully-dependent types for which
inference and basic type checking (without manual proofs) is undecidable.

Refinement types can be used to ensure indexing into a vector is always valid:

```ante
get (a: Vec t) (index: usz where index < len a) -> t = ...

a = [1, 2, 3]
get a 2  // valid
get a 3  // error: couldn't satisfy 3 < len a

n = random_in (1..10)
get a n  // error: couldn't satisfy n < len a

// The solver is smart enough to know len a > n <=> n < len a
if len a > n then
    get a n  // valid
```

You can also use uninterpreted functions to tag values. The following
example uses this technique to tag vectors returned by the `sort`
function as being sorted, then restricting the input of `binary_search`
to only sorted vectors:

```ante
// You can name a return type for use in refinements
sort (vec: Vec t) -> ret: Vec t where sorted ret = ...

binary_search (vec: Vec t where sorted vec) (elem: t) -> Maybe (index: usz where index < len vec) = ...
```

Type aliases can be used to cut down on the annotations:

```ante
SortedVec t = a: Vec t where sorted a

Index vec = x:usz where x < len vec

sort (vec: Vec t) -> SortedVec t = ...

binary_search (vec: SortedVec t) (elem: t) -> Maybe (Index vec) = ...
```

In contrast to contracts in other languages, these refinements are in
the type system and are thus all checked during compile-time with
the help of a SMT solver.

---
# Traits

While unrestricted generic functions are useful, often we don't want
to abstract over "forall t." but rather abstract over all types that
have certain operations available on them - like adding. In ante, this
is done via traits. You can define a trait as follows:

```ante
trait Stringify t with
    stringify: t -> string
```

Here we say `stringify` is a function that takes a value of type `t` and returns a
`string`. With this, we can write another function that abstracts over all `t`'s that
can be converted to strings:

```ante
stringify_print (x: t) -> unit given Stringify t =
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

// We can cast to a string using
cast 3 : string
```

## Impls

To use functions like `stringify` or `stringify_print` above,
we'll have to `impl`ement the trait for the types we want
to use it with. This can be done with `impl` blocks:

```ante
stringify_bool = impl Stringify bool via
    stringify b =
        if b then "true"
        else "false"
```

Then, when we call a function like `print_to_string` which
requires `Stringify t` we can pass in a `bool` and the
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
get (vector: Vec t) (index: usz) -> Maybe t = ...
```

We want to be able to use this with any container type, but how?
We can start out with a trait similar to our `Cast` trait from
before:

```ante
trait Container c elem with
    get: c -> usz -> Maybe elem
```

At first glance this looks fine, but there's a problem: we
can implement it with any combination of `c` and `elem`:

```ante
conflicting_impls = impl
    Container (Vec i32) i32 via
        get (v: Vec i32) (index: usz) -> Maybe i32 = ...

    Container (Vec i32) string via
        get (v: Vec i32) (index: usz) -> Maybe string = ...
```

But we already had an impl for `Vec i32`, and defining a
way to get another element type from it makes no sense!
This is what associated types or ante's restricted functional
dependencies solve. We can modify our Container trait to
specify that for any given type `c`, there's only 1 valid
`elem` value. We can do that by adding an `->`:

```ante
trait Container c -> elem with
    get: c -> usz -> Maybe elem

vec_container = impl Container (Vec a) a via
    get (v: Vec a) (i: usz) -> Maybe a = ...
```

This information is used during type inference
so if we have e.g. `e = get (b: ByteString) 0` and there
is an impl for `Container ByteString u8` in scope then we also
know that `e : u8`.

Note that using a functional dependency in a trait signature
looks a lot like separating the return type from the arguments
of a function (both use `->`). This was intentional; a good
rule of thumb on when to use functional dependencies is if
the type in question only appears as a return type for the
function defined by the trait. For the `Container` example
above, `elem` is indeed only used in the return type of `get`.
The most notable exception to this rule is the `Cast` trait
defined earlier in which it is useful to have two impls
`Cast i32 string` and `Cast i32 f64` to cast integers
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
add = impl Combine i32 via (++) = (+)
mul = impl Combine i32 via (++) = (*)

print (2 ++ 3)  // Error, multiple matching impls found! `add` and `mul` are both in scope

print (2 ++ 3) via add  //=> 5
print (2 ++ 3) via mul  //=> 6
```

## Int Trait

Ante has quite a few [integer types](#integers) so one question
that gets raised is what is the type of an integer literal?
If we randomly choose a type like `i32` then when using all
other integer types we'd have to constaintly annotate our
operations with the type used which can be annoying. Imagine
`a + 1u64` every few lines.

Instead, integer literals are polymorphic over the `Int` trait:

```ante
trait Int a with
    // no operations, this trait is built into
    // the compiler and is used somewhat like a typetag
```

When we use an integer with no specific type, the integer literal
keeps its generic type. This sometimes pops up in function signatures:

```ante
// This works with any integer type
add1 (x: a) -> a given Int a =
    x + 1
```

If we do use it with a specific type however, then just like with
normal generics, the generic type variable is constrained to be
that concrete type (and the concrete type must satisfy the `Int`
constraint - ie it must be a primitive integer or we get a compile-time error).

```ante
// Fine, we're still generic over a
foo () -> a given Int a =
    0

x: i32 = 1  // also fine, we constrained 1 : i32 now

y = 2u16  // still fine, now we're specifying the type
          // of the integer literal directly
```

## Member Access Traits

If we have multiple types with the same field in scope:

```ante
type A = foo: i32

type B = foo: string
```

Then we are left with the problem of deciding what the type
of the `x.foo` expression should be:

```ante
// Does this work?
// - If so what type do we get?
// - If not, what is the error?
get_foo x = x.foo
```

Ante solves this with member access traits. Whenever ante
sees an expression like `x.foo` it makes a new trait like
the following pseudocode:

```ante
trait .foo struct -> field with
    (.foo) : struct -> field
```

Now we can type `get_foo` as a function which takes
any value of type `a` that has a field named `foo` of type `b`:

```ante
get_foo (x: a) -> b given .foo a b =
    x.foo
```

Since member access traits are just traits generated by the
compiler under the hood, we get all the benefits of traits as
well, including composability of multiple traits and trait inference.
Here's a function that can print anything with `debug` field
that itself is printable and a `prefix` field that must be a string:

```ante
print_debug x =
    prefix = x.prefix ++ ": "
    print prefix
    print x.debug
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

---
# Lifetime Inference

To protect against common mistakes in manual memory management
like double-frees, memory leaks, and use-after-free, ante automatically
infers the lifetime of `ref`s. If you're familiar with rust's
lifetime system, this works in a similar way but is intentionaly
less restrictive since it abandons the ownership rule of only
allowing either a single mutable reference or multiple immutable ones.
Also unlike rust, ante hides the lifetime parameter on references.
Since it is inferred automatically by the compiler there is no need
to manually mess around with them. There is a tradeoff compared to
rust however: to accomplish this hands-off approach ante typically
infers `ref`s to live longer than they need to.

`ref`s can be created with `new : a -> ref a` and the underlying
value can be accessed with `deref : ref a -> a`. Here's a simple
example 

```ante
get_value () -> ref i32 =
    three = 3
    // This 'new' operation will copy and allocate 3
    new three

value = get_value ()

// the ref value is still valid here and
// is deallocated when it goes out of scope.
print value
```

The above program is compiled to the equivalent of destination-passing
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

The above program showcased we can return a `ref` value to extend its
lifetime. Unlike rust for example, we can never have a lifetime error in this
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
restricting inferred lifetimes is still an exciting part of research for ante.

## Details

Internally, lifetime inference of refs uses the original Tofte-Taplin
stack-based algorithm. This algorithm can infer references which
can be optimized to allocate on the stack instead of the heap
even if it needs to be allocated on a prior stack frame. The
tradeoff for this is that, as previously mentioned, the inferred
lifetimes tend to be imprecise. As such, `ref`s in ante are meant
to be used for temporary unowned references like where you'd use
`&` in rust. It is not a complete replacement for smart pointer types
such as `Box` and `Rc` (unless you're fine with using more memory).
The place where `ref`s are typically worst are in implementing container types.
`ref`s are implemented using memory pools on the stack under the
hood so any container that wants to free early or reallocate and
free/resize memory (ie. the vast majority of containers) should use
one of the smart pointer types to hold their elements instead.

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
    malloc: usz -> Ptr a
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
programming. Compared to monads, algebraic effects compose naturally but are very
slightly more restrictive.

Algebraic effects can be used first by declaring the effect with the `effect` keyword,
then by performing the effect within a function. Once this happens,
the computation will suspend, and the program will unwind to the most recent
effect handler (similar to unwinding to the nearest try block for exceptions).
From there, the effect handler can stop the computation and return a value as
with exceptions, or it can resume the computation and continue by calling `resume`
with the value to resume with. The type of value needed to resume depends on
the return type of the effect. For example, if our effect is:

```an
effect GiveInt with
    give_int: string -> i32
```

Then we will have to call `resume` with an `i32` to continue the original computation.

In an effect handler, we can match on any effects performed within the matched
expression. For example, if we want to write a handler for the `GiveInt` effect above,
we may write a function like:

```an
handle_give_int (f: unit -> a can GiveInt) -> a =
    handle f ()
    | give_int str ->
        if str == "zero"
        then resume 0
        else resume 123
```

Finally, if we have a function `do_math` which uses the `GiveInt` effect, here's
how we'd pass it to `handle_give_int` to properly handle the effect:

```an
do_math (x: i32) -> i32 can GiveInt =
    a = give_int "zero"
    b = give_int "foo"
    x + a + b

handle_give_int (fn () -> do_math 3)  //=> 126
```

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
// try: (unit -> a can Fail) -> Maybe a
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

## More on Handlers

### Multiple Handlers

Unlike traits where impl search is automatic, effect handlers are
manually inserted by the programmer. This allows for multiple handlers
to be defined for any effect. As an example, lets define another handler
for `GiveInt` in addition to `handle_give_int`:

```an
the_int (int: i32) (f: unit -> a can GiveInt) -> a =
    handle f ()
    | give_int _ -> resume int

do_math 1 with the_int 5  //=> 11
```

### Matching on the Returned Value

Handle expressions can also match on the return value
of the handled expression

```an
count_giveint_calls (f: unit -> a can GiveInt) -> i32 =
    handle f ()
    | return x -> 0
    | give_int _ -> 1 + resume 0


do_math 5 with count_giveint_calls  //=> 2
```

This example can be confusing at first - how can we always return
an integer representing the number of GiveInt calls if our function
says it returns some type `a`? Lets work this out step by step
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
handle 1 + (a = 0; b = give_int "foo"; 5 + a + b)
| return x -> 0
| give_int _ -> 1 + resume 0

// Reduce via give_int again for b
handle 1 + (1 + (a = 0; b = 0; 5 + a + b))
| return x -> 0
| give_int _ -> 1 + resume 0

// Now we finish evaluating the function and would
// normally get a result of 5
handle 1 + (1 + (return 5))
| return x -> 0
| give_int _ -> 1 + resume 0

// Since our handler matches on this return value,
// we use that rule next to map it to 0
handle 1 + (1 + 0)
| return x -> 0
| give_int _ -> 1 + resume 0

// Finally, 1 + 1 + 0 evaluates to 2 with no further effects
2
```

### Resuming Multiple Times

`resume` is a first-class function like any other, so we
can call it multiple times, or pass it to higher-order functions
like `map` and `flatmap`:

```an
these_ints (f: unit -> a can GiveInt) (ints: Vec i32) -> Vec a =
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
interpret (default_value: a) (f: unit -> a can GiveInt) -> a =
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
add_even_numbers (a: string) (b: string) -> u64 can Fail =
    n1 = parse a
    n2 = parse b // parse: string -> u64 can Fail

    if n1 % 2 == 0 and n2 % 2 == 0
    then n1 + n2
    else fail ()
```

Handling these effects can be done via manual `handle` expressions, or
via the `try` and `catch` helper functions
which convert Fails to Maybe, and Throws to Results:

```ante
try (f: unit -> a can Fail) -> Maybe a =
    handle f ()
    | return x -> Some x
    | fail () -> None

catch (f: unit -> a can Throw e) -> Result a e =
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
    get: unit -> a
    put: a -> unit

state (current_state: s) (f: unit -> a can Use s) -> a =
    handle f ()
    | put new_state -> resume () with state new_state
    | get () -> resume current_state with state current_state


type Expr =
   | Int i32
   | Var string
   | Add Expr Expr
   | Let string (rhs: Expr) (body: Expr)

Eval = Use (Map string i32)

lookup (name: string) -> Maybe i32 can Eval =
    map = get ()
    map.get name

define (name: string) (value: i32) -> unit can Eval =
    map = get ()
    put (map.insert name value)

eval (expr: Expr) -> i32 can Eval =
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
    break: unit -> a
    continue: unit -> a

for (iter: i) (f: e -> unit can Loop) -> unit can Iterate i e =
    match next iter
    | None -> ()
    | Some (rest, elem) ->
        handle f elem
        | break () -> ()
        | continue () -> for rest f
        // If the body returns normally, we also want to continue the loop
        | return _ -> for rest f

while (cond: a -> bool) (body: a -> unit) -> unit can State a =
    if cond (get ()) then
        body (get ())
        while cond body

do_while (body: a -> bool) -> unit can State a =
    if body (get ()) then do_while body

// Loop until we eventually find a prime number through sheer luck
loop_examples (vec: Vec i32) -> unit can Print, State i32 =
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

find_random_prime (vec: Vec i32) -> i32 can Print =
    loop_examples vec with final_state 0
```

### Generators

The yield effect provides a way to implement generators.

```ante
effect Yield a with
    yield: unit -> a

traverse (xs: List Int) -> unit can Yield Int =
    match xs
    | Cons x xs -> yield x; traverse xs
    | None -> ()

filter (k: unit -> a can Yield b) (f: b -> bool) -> a can Yield b =
    handle k ()
    | yield x ->
        if f x then yield x
        resume ()

iter (k: unit -> a can Yield b) (f: b -> unit) -> a =
    handle k ()
    | yield x -> resume (f x)

yield_to_list (k: unit -> a can Yield b) -> List b =
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
    print: string -> unit

effect QueryDatabase with
    querydb: string -> Response

database f =
    db = Database.connect "..."
    result = handle f ()
        | querydb msg -> resume (send db msg)
    close db
    result

ignore_db f =
    handle f ()
    | querydb _ -> Response.empty

business_logic (should_query: bool) -> unit can Print, QueryDatabase =
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

### Expected Value

One of the more niche benefits of algebraic effects is the ability
to compute the expected value of numerical functions which internally
use an effect like `Flip` to decide on branches to take within the function.

```ante
effect Flip with
    flip: unit -> bool

calculation () =
    if flip () then
        unused = flip ()
        if flip () then 0.5
        else 4.0
    else 1.0

expected_value (f: unit -> f64 can Flip) -> f64 =
    handle f ()
    | flip () -> (resume true + resume false) / 2.0

print (expected_value calculation)  //=> 1.625
```

### Parsers

Algebraic effects can also be used to write parser combinators.
This parser is for a language with numbers, addition, multiplication,
and parenthesized expressions. This example was adapted from
[this koka paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf).

```ante
effect Repeat with
    flip: unit -> bool
    fail: unit -> a

effect Parse with
    // The parameter to Satisfy is a function which takes
    // our current input and returns a pair of
    // (result, rest_of_input) on success, or None on failure.
    satisfy: (string -> Maybe (a, string)) -> a

choice p1 p2 =
    if flip () then p1 () else p2 ()

many (p: unit -> a can Repeat) -> List a can Repeat =
    choice (fn () -> many1 p)
           (fn () -> Nil)

many1 p = Cons (p ()) (many p)


// Return all possible solutions from the given computation
solutions (f: unit -> a can Repeat) -> List a =
    handle f ()
    | return x -> [x]
    | fail () -> []
    | flip () -> resume false ++ resume true

// Return the first succeeding computation (taking the false Flip branch first)
eager (f: unit -> a can Repeat) -> Maybe a =
    handle f ()
    | return x -> Some x
    | fail () -> None
    | flip () ->
        match resume false
        | Some x -> Some x
        | None -> resume true

// Handle any Parse effects (letting Repeat effects pass through)
parse (input: string) (f: unit -> a can Parse, Repeat) -> a, string can Repeat =
    handle f ()
    | return x -> x, input
    | satisfy p ->
        match p input
        | None -> fail ()
        | Some (x, rest) -> resume x with parse rest

// These will be our parsing primitives
symbol (c: char) -> char can Parse =
    satisfy fn input ->
        match input
        | Cons x rest if x == c -> Some (c, rest)
        | _ -> None

digit () -> Int can Parse =
    satisfy fn input ->
        match input
        | Cons d rest if is_digit d -> Some (int (d - '0'), rest)
        | _ -> None

number () =
    many1 digit .foldl 0 fn acc d -> 10 * acc + d

// Now our actual parser with begin in proper:
binop sym op f =
    a = f ()
    symbol sym
    b = f ()
    op a b

add () = binop '+' (+) term
mul () = binop '*' (*) factor

expr () = choice add term
term () = choice mul factor

factor () -> Int can Parse, Repeat =
    choice number fn () ->
        symbol '('
        e = expr ()
        symbol ')'
        e

parse expr "1+2*3" with solutions
//=> [(7, ""), (3, "*3"), (1, "+2*3")]

parse expr "1+2*3" with eager
//=> Some (7, "")
```

### Others

Other examples include using effects to
implement [asynchronous functions](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/05/asynceffects-msr-tr-2017-21.pdf), implementing
a clean design for [handling animations in games](https://gopiandcode.uk/logs/log-bye-bye-monads-algebraic-effects.html),
and using effects to emulate any monad except
for the continuation monad (citation needed).

---
