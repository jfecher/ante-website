+++
title = "Std.Prelude"
categories = ["docs"]
weight = 11
+++

The prelude is imported automatically into every Ante file

[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an)

---

# Types

---

## String

```ante
type String =
    data: Ptr Char
    refcount: Ptr U32
    length: U32
    offset: U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L48)

---

### String.from_parts

```ante
String.from_parts (pointer: Ptr Char) (length: U32): String
```

Construct a fresh, unaliased string from an owned pointer to characters and a length.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L56)

---

## Maybe

```ante
type Maybe t =
    | None
    | Some t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L61)

---

### Maybe.unwrap

```ante
Maybe.unwrap (m: Maybe t): t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L70)

---

### Maybe.unwrap_or_else

```ante
Maybe.unwrap_or_else (m: Maybe t) (f: fn Unit [_] -> t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L75)

---

## IO

```ante
effect IO = Fs, Net
```

A convenience alias for the set of all primitive effects.
This may expand over time.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L92)

---

## Result

```ante
type Result t e =
    | Ok t
    | Error e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L94)

---

## ,

```ante
type , a b =
    first: a
    second: b
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L98)

---

## Type

```ante
type Type t =
    | MkType
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L705)

---

## Range

```ante
type Range t =
    start: t
    end: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1011)

---

# Traits

---

## Cast

```ante
trait Cast a b (e: effect) =
    cast: fn a -> b can e
```

A type conversion from a to b

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L107)

---

## TryCast

```ante
trait TryCast a b (e: effect) =
    try_cast: fn a -> b can Fail, e
```

Represents a failable type cast from a to b

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L317)

---

## Add

```ante
trait Add n =
    +: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L325)

---

## Sub

```ante
trait Sub n =
    -: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L339)

---

## Mul

```ante
trait Mul n =
    *: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L353)

---

## Div

```ante
trait Div n =
    /: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L367)

---

## Mod

```ante
trait Mod n =
    %: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L381)

---

## Eq

```ante
trait Eq t (e: effect) =
    ==: fn (ref t) (ref t) -> Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L399)

---

## Not

```ante
trait Not t =
    not: fn t -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L436)

---

## Cmp

```ante
trait Cmp a =
    <: fn (ref a) (ref a) -> Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L445)

---

## Num

```ante
trait Num a =
    add: Add a
    sub: Sub a
    mul: Mul a
    div: Div a
    eq: Eq a pure
    cmp: Cmp a
    zero: a
    one: a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L474)

---

## Append

```ante
trait Append a =
    ++: fn a a -> a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L615)

---

## Extract

```ante
trait Extract collection index elem (e: effect) =
    .[]: fn collection index -> elem can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L637)

---

## Bitwise

```ante
trait Bitwise t =
    band: fn t t -> t
    bor: fn t t -> t
    bxor: fn t t -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L689)

---

## Copy

```ante
trait Copy t =
    .*: fn (ref t) -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L740)

---

## Clone

```ante
trait Clone t =
    clone: fn (ref t) -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L743)

---

## Drop

```ante
trait Drop t (e: effect) =
    drop: fn (mut t) -> Unit can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L746)

---

## Insert

```ante
trait Insert collection index elem (e: effect) =
    .[]:=: fn collection index elem -> Unit can e
```

Insert an element into a collection.
`col.[i] := elem` resolves to `Insert` while `col.[i]` alone resolves to `Extract`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L842)

---

## Display

```ante
trait Display t (e: effect) =
    print: fn (ref t) -> Unit can Print, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L891)

---

## Iterator

```ante
trait Iterator it elem (effects: effect) =
    next: fn it -> Maybe (it, elem) can effects
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1001)

---

# Effects

---

## Fs

```ante
effect Fs =
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L83)

---

## Net

```ante
effect Net =
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L88)

---

## Print

```ante
effect Print =
    write: fn (ref String) -> Unit
    write_char: fn Char -> Unit
    write_u64: fn U64 -> Unit
    write_i64: fn I64 -> Unit
    write_f64: fn F64 -> Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L851)

---

## Panic

```ante
effect Panic =
    panic: fn String -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1030)

---

# Functions

---

## iff

```ante
iff (condition: Bool) (then_: fn Unit [_] -> a): Maybe a
```

If `condition` is true, returns `Some (then_ ())`,
otherwise returns `None`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L67)

---

## first

```ante
(first: fn (_, _) -> _ is pure) ((,: fn _ _ -> _, _ is pure) (a: _) (_: _))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L100)

---

## second

```ante
(second: fn (_, _) -> _ is pure) ((,: fn _ _ -> _, _ is pure) (_: _) (b: _))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L101)

---

## third

```ante
(third: fn (_, (_, _)) -> _ is pure) ((,: fn _ (_, _) -> _, (_, _) is pure) (_: _)  ((,: fn _ _ -> _, _ is pure) (_: _) (c: _)))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L102)

---

## fourth

```ante
(fourth: fn (_, (_, (_, _))) -> _ is pure) ((,: fn _ (_, (_, _)) -> _, (_, (_, _)) is pure) (_: _)  ((,: fn _ (_, _) -> _, (_, _) is pure) (_: _)  ((,: fn _ _ -> _, _ is pure) (_: _) (d: _))))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L103)

---

## fifth

```ante
(fifth: fn (_, (_, (_, (_, _)))) -> _ is pure) ((,: fn _ (_, (_, (_, _))) -> _, (_, (_, (_, _))) is pure) (_: _)  ((,: fn _ (_, (_, _)) -> _, (_, (_, _)) is pure) (_: _)  ((,: fn _ (_, _) -> _, (_, _) is pure) (_: _)  ((,: fn _ _ -> _, _ is pure) (_: _) (e: _)))))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L104)

---

## %%

```ante
%% (a: t) (b: t) {_: Mod t} {_: Eq t e} {_: Cast U8 t e}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L395)

---

## !=

```ante
(!=: fn (ref t) (ref t) {Eq t e} -> Bool can e) (l: ref t) (r: ref t) {(_: Eq t e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L434)

---

## >

```ante
(>: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(_: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L449)

---

## <=

```ante
(<=: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(_: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L450)

---

## >=

```ante
(>=: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(_: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L451)

---

## max

```ante
max (l: ref 'a t) (r: ref 'a t) {_: Cmp t}: ref 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L470)

---

## min

```ante
min (l: ref 'a t) (r: ref 'a t) {_: Cmp t}: ref 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L471)

---

## |>

```ante
(|>: fn _ (fn _ [_] -> _ can _) -> _ can _) (x: _) (f: fn _ [_] -> _ can _)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L634)

---

## <|

```ante
(<|: fn (fn _ [_] -> _ can _) _ -> _ can _) (f: fn _ [_] -> _ can _) (x: _)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L635)

---

## array_len

```ante
array_len (_array: ref Array n t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L647)

---

## array_get_unchecked

```ante
array_get_unchecked (array: ref Array n t) (i: Usz): ref t
```

Unsafe get without bounds-checking

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L653)

---

## array_set_unchecked

```ante
array_set_unchecked (array: mut Array n t) (i: Usz) (v: t): Unit
```

Unsafe set without bounds-checking

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L658)

---

## array_get

```ante
array_get (array: ref Array n t) (index: Usz): ref t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L662)

---

## array_get_mut

```ante
array_get_mut (array: mut Array n t) (index: Usz): mut t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L667)

---

## array_set

```ante
(array_set: fn (mut (Array n t)) Usz t -> Unit can Panic) (array: mut (Array n t)) (index: Usz) (elem: t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L670)

---

## size_of

```ante
size_of (v: Type t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L707)

---

## offset

```ante
offset (ptr: Ptr t) (index: Usz): Ptr t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L709)

---

## offset_bytes

```ante
offset_bytes (ptr: Ptr t) (index: Usz): Ptr t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L714)

---

## deref

```ante
deref (x: ref t): t
```

Dereference without a Copy constraint. This is unsafe to use directly

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L723)

---

## deref_ptr

```ante
deref_ptr (p: Ptr t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L726)

---

## ptr_store

```ante
ptr_store (p: Ptr a) (value: a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L729)

---

## array_insert

```ante
array_insert (p: Ptr a) (index: Usz) (value: a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L733)

---

## ptr_to_mut

```ante
ptr_to_mut: fn (Ptr a) -> mut a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L736)

---

## ptr_to_uniq

```ante
ptr_to_uniq: fn (Ptr a) -> uniq a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L737)

---

## null

```ante
null (): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L835)

---

## transmute

```ante
transmute (x: a): b
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L837)

---

## print_to_sink

```ante
print_to_sink (sink: fn (Ptr Char) Usz [_] -> Unit can Fs) (f: a can Print, e): a can Fs, e
```

Forwards each printed string to the given function expecting a string pointer
and the length in bytes of that string pointer.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L863)

---

## print_to_stdout

```ante
print_to_stdout (f: a can Print, e): a can Fs, e
```

Handles `Print` by piping to stdout

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L874)

---

## print_to_stderr

```ante
print_to_stderr (f: a can Print, e): a can Fs, e
```

Handles `Print` by piping to stderr

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L878)

---

## dbg

```ante
dbg (s: String): Unit
```

Display the given String to stderr without using any effects.

This function is intended for debugging purposes. Because it
appears pure to the compiler, there is no guarantee it won't be
optimized out of the program.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L886)

---

## println

```ante
(println: fn (ref t) {Display t e} -> Unit can Print, e) (x: ref t) {(_: Display t e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L894)

---

## print_float

```ante
print_float (f: F64): Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L934)

---

## iterate

```ante
(iterate: fn it (fn elem [_] -> _ can effects, _) {Iterator it elem effects} -> Unit can effects, _) (iterable: it) (f: fn elem [_] -> _ can effects, _) {(i: Iterator it elem effects)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1004)

---

## iterate_range

```ante
iterate_range (from: Usz) (to: Usz) (f: fn Usz [_] -> Unit): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1021)

---

## repeat

```ante
repeat (count: Usz) (f: fn Usz [_] -> Unit): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1024)

---

## abort_on_panic

```ante
abort_on_panic (f: a can Panic, e): a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1033)

---

## ignore

```ante
(ignore: fn _ -> Unit is pure) (_x: _)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1041)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## cast_same

```ante
impl cast_same: Cast a a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L110)

---

## cast_ptr_usz

```ante
impl cast_ptr_usz: Cast (Ptr a) Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L113)

---

## cast_usz_ptr

```ante
impl cast_usz_ptr: Cast Usz (Ptr a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L116)

---

## cast_u8_u16

```ante
impl cast_u8_u16: Cast U8 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L121)

---

## cast_u8_u32

```ante
impl cast_u8_u32: Cast U8 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L122)

---

## cast_u8_u64

```ante
impl cast_u8_u64: Cast U8 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L123)

---

## cast_u8_usz

```ante
impl cast_u8_usz: Cast U8 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L124)

---

## cast_u16_u8

```ante
impl cast_u16_u8: Cast U16 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L126)

---

## cast_u16_u32

```ante
impl cast_u16_u32: Cast U16 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L127)

---

## cast_u16_u64

```ante
impl cast_u16_u64: Cast U16 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L128)

---

## cast_u16_usz

```ante
impl cast_u16_usz: Cast U16 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L129)

---

## cast_u32_u8

```ante
impl cast_u32_u8: Cast U32 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L131)

---

## cast_u32_u16

```ante
impl cast_u32_u16: Cast U32 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L132)

---

## cast_u32_u64

```ante
impl cast_u32_u64: Cast U32 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L133)

---

## cast_u32_usz

```ante
impl cast_u32_usz: Cast U32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L134)

---

## cast_u64_u8

```ante
impl cast_u64_u8: Cast U64 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L136)

---

## cast_u64_u16

```ante
impl cast_u64_u16: Cast U64 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L137)

---

## cast_u64_u32

```ante
impl cast_u64_u32: Cast U64 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L138)

---

## cast_u64_usz

```ante
impl cast_u64_usz: Cast U64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L139)

---

## cast_usz_u8

```ante
impl cast_usz_u8: Cast Usz U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L141)

---

## cast_usz_u16

```ante
impl cast_usz_u16: Cast Usz U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L142)

---

## cast_usz_u32

```ante
impl cast_usz_u32: Cast Usz U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L143)

---

## cast_usz_u64

```ante
impl cast_usz_u64: Cast Usz U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L144)

---

## cast_u8_i32

```ante
impl cast_u8_i32: Cast U8 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L146)

---

## cast_i8_i16

```ante
impl cast_i8_i16: Cast I8 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L149)

---

## cast_i8_i32

```ante
impl cast_i8_i32: Cast I8 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L150)

---

## cast_i8_i64

```ante
impl cast_i8_i64: Cast I8 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L151)

---

## cast_i8_isz

```ante
impl cast_i8_isz: Cast I8 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L152)

---

## cast_i16_i8

```ante
impl cast_i16_i8: Cast I16 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L154)

---

## cast_i16_i32

```ante
impl cast_i16_i32: Cast I16 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L155)

---

## cast_i16_i64

```ante
impl cast_i16_i64: Cast I16 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L156)

---

## cast_i16_isz

```ante
impl cast_i16_isz: Cast I16 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L157)

---

## cast_i32_i8

```ante
impl cast_i32_i8: Cast I32 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L159)

---

## cast_i32_i16

```ante
impl cast_i32_i16: Cast I32 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L160)

---

## cast_i32_i64

```ante
impl cast_i32_i64: Cast I32 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L161)

---

## cast_i32_isz

```ante
impl cast_i32_isz: Cast I32 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L162)

---

## cast_i64_i8

```ante
impl cast_i64_i8: Cast I64 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L164)

---

## cast_i64_i16

```ante
impl cast_i64_i16: Cast I64 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L165)

---

## cast_i64_i32

```ante
impl cast_i64_i32: Cast I64 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L166)

---

## cast_i64_isz

```ante
impl cast_i64_isz: Cast I64 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L167)

---

## cast_isz_i8

```ante
impl cast_isz_i8: Cast Isz I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L169)

---

## cast_isz_i16

```ante
impl cast_isz_i16: Cast Isz I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L170)

---

## cast_isz_i32

```ante
impl cast_isz_i32: Cast Isz I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L171)

---

## cast_isz_i64

```ante
impl cast_isz_i64: Cast Isz I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L172)

---

## cast_i8_f32

```ante
impl cast_i8_f32: Cast I8 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L175)

---

## cast_i16_f32

```ante
impl cast_i16_f32: Cast I16 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L176)

---

## cast_i32_f32

```ante
impl cast_i32_f32: Cast I32 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L177)

---

## cast_i64_f32

```ante
impl cast_i64_f32: Cast I64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L178)

---

## cast_isz_f32

```ante
impl cast_isz_f32: Cast Isz F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L179)

---

## cast_i8_f64

```ante
impl cast_i8_f64: Cast I8 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L180)

---

## cast_i16_f64

```ante
impl cast_i16_f64: Cast I16 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L181)

---

## cast_i32_f64

```ante
impl cast_i32_f64: Cast I32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L182)

---

## cast_i64_f64

```ante
impl cast_i64_f64: Cast I64 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L183)

---

## cast_isz_f64

```ante
impl cast_isz_f64: Cast Isz F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L184)

---

## cast_u8_f32

```ante
impl cast_u8_f32: Cast U8 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L186)

---

## cast_u16_f64

```ante
impl cast_u16_f64: Cast U16 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L187)

---

## cast_u32_f64

```ante
impl cast_u32_f64: Cast U32 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L188)

---

## cast_u64_f64

```ante
impl cast_u64_f64: Cast U64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L189)

---

## cast_usz_f64

```ante
impl cast_usz_f64: Cast Usz F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L190)

---

## cast_u8_f64

```ante
impl cast_u8_f64: Cast U8 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L191)

---

## cast_u16_f32

```ante
impl cast_u16_f32: Cast U16 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L192)

---

## cast_u32_f32

```ante
impl cast_u32_f32: Cast U32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L193)

---

## cast_u64_f32

```ante
impl cast_u64_f32: Cast U64 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L194)

---

## cast_usz_f32

```ante
impl cast_usz_f32: Cast Usz F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L195)

---

## cast_f32_i8

```ante
impl cast_f32_i8: Cast F32 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L197)

---

## cast_f32_i16

```ante
impl cast_f32_i16: Cast F32 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L198)

---

## cast_f32_i32

```ante
impl cast_f32_i32: Cast F32 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L199)

---

## cast_f32_i64

```ante
impl cast_f32_i64: Cast F32 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L200)

---

## cast_f32_isz

```ante
impl cast_f32_isz: Cast F32 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L201)

---

## cast_f64_i8

```ante
impl cast_f64_i8: Cast F64 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L202)

---

## cast_f64_i16

```ante
impl cast_f64_i16: Cast F64 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L203)

---

## cast_f64_i32

```ante
impl cast_f64_i32: Cast F64 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L204)

---

## cast_f64_i64

```ante
impl cast_f64_i64: Cast F64 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L205)

---

## cast_f64_isz

```ante
impl cast_f64_isz: Cast F64 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L206)

---

## cast_f32_u8

```ante
impl cast_f32_u8: Cast F32 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L208)

---

## cast_f32_u16

```ante
impl cast_f32_u16: Cast F32 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L209)

---

## cast_f32_u32

```ante
impl cast_f32_u32: Cast F32 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L210)

---

## cast_f32_u64

```ante
impl cast_f32_u64: Cast F32 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L211)

---

## cast_f32_usz

```ante
impl cast_f32_usz: Cast F32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L212)

---

## cast_f64_u8

```ante
impl cast_f64_u8: Cast F64 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L213)

---

## cast_f64_u16

```ante
impl cast_f64_u16: Cast F64 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L214)

---

## cast_f64_u32

```ante
impl cast_f64_u32: Cast F64 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L215)

---

## cast_f64_u64

```ante
impl cast_f64_u64: Cast F64 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L216)

---

## cast_f64_usz

```ante
impl cast_f64_usz: Cast F64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L217)

---

## cast_f64_f32

```ante
impl cast_f64_f32: Cast F64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L219)

---

## cast_f32_f64

```ante
impl cast_f32_f64: Cast F32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L220)

---

## cast_i8_char

```ante
impl cast_i8_char: Cast I8 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L223)

---

## cast_i16_char

```ante
impl cast_i16_char: Cast I16 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L224)

---

## cast_i32_char

```ante
impl cast_i32_char: Cast I32 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L225)

---

## cast_i64_char

```ante
impl cast_i64_char: Cast I64 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L226)

---

## cast_isz_char

```ante
impl cast_isz_char: Cast Isz Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L227)

---

## cast_u8_char

```ante
impl cast_u8_char: Cast U8 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L229)

---

## cast_u16_char

```ante
impl cast_u16_char: Cast U16 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L230)

---

## cast_u32_char

```ante
impl cast_u32_char: Cast U32 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L231)

---

## cast_u64_char

```ante
impl cast_u64_char: Cast U64 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L232)

---

## cast_usz_char

```ante
impl cast_usz_char: Cast Usz Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L233)

---

## cast_i32_usz

```ante
impl cast_i32_usz: Cast I32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L236)

---

## cast_usz_i64

```ante
impl cast_usz_i64: Cast Usz I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L241)

---

## cast_i64_usz

```ante
impl cast_i64_usz: Cast I64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L242)

---

## cast_char_u8

```ante
impl cast_char_u8: Cast Char U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L245)

---

## cast_char_i32

```ante
impl cast_char_i32: Cast Char I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L246)

---

## cast_char_u64

```ante
impl cast_char_u64: Cast Char U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L247)

---

## cast_bool_i32

```ante
impl cast_bool_i32: Cast Bool I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L249)

---

## cast_u8_string

```ante
impl cast_u8_string: Cast U8 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L282)

---

## cast_u16_string

```ante
impl cast_u16_string: Cast U16 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L283)

---

## cast_u32_string

```ante
impl cast_u32_string: Cast U32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L284)

---

## cast_u64_string

```ante
impl cast_u64_string: Cast U64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L285)

---

## cast_usz_string

```ante
impl cast_usz_string: Cast Usz String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L286)

---

## cast_i8_string

```ante
impl cast_i8_string: Cast I8 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L287)

---

## cast_i16_string

```ante
impl cast_i16_string: Cast I16 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L288)

---

## cast_i32_string

```ante
impl cast_i32_string: Cast I32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L289)

---

## cast_i64_string

```ante
impl cast_i64_string: Cast I64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L290)

---

## cast_isz_string

```ante
impl cast_isz_string: Cast Isz String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L291)

---

## cast_char_string

```ante
impl cast_char_string: Cast Char String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L293)

---

## cast_bool_string

```ante
impl cast_bool_string: Cast Bool String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L299)

---

## cast_f32_string

```ante
impl cast_f32_string: Cast F32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L310)

---

## cast_f64_string

```ante
impl cast_f64_string: Cast F64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L313)

---

## try_cast_from_cast

```ante
impl try_cast_from_cast {_: Cast a b e}: TryCast a b e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L320)

---

## add_i8

```ante
impl add_i8: Add I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L326)

---

## add_i16

```ante
impl add_i16: Add I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L327)

---

## add_i32

```ante
impl add_i32: Add I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L328)

---

## add_i64

```ante
impl add_i64: Add I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L329)

---

## add_isz

```ante
impl add_isz: Add Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L330)

---

## add_u8

```ante
impl add_u8: Add U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L331)

---

## add_u16

```ante
impl add_u16: Add U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L332)

---

## add_u32

```ante
impl add_u32: Add U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L333)

---

## add_u64

```ante
impl add_u64: Add U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L334)

---

## add_usz

```ante
impl add_usz: Add Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L335)

---

## add_f32

```ante
impl add_f32: Add F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L336)

---

## add_f64

```ante
impl add_f64: Add F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L337)

---

## sub_i8

```ante
impl sub_i8: Sub I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L340)

---

## sub_i16

```ante
impl sub_i16: Sub I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L341)

---

## sub_i32

```ante
impl sub_i32: Sub I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L342)

---

## sub_i64

```ante
impl sub_i64: Sub I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L343)

---

## sub_isz

```ante
impl sub_isz: Sub Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L344)

---

## sub_u8

```ante
impl sub_u8: Sub U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L345)

---

## sub_u16

```ante
impl sub_u16: Sub U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L346)

---

## sub_u32

```ante
impl sub_u32: Sub U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L347)

---

## sub_u64

```ante
impl sub_u64: Sub U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L348)

---

## sub_usz

```ante
impl sub_usz: Sub Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L349)

---

## sub_f32

```ante
impl sub_f32: Sub F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L350)

---

## sub_f64

```ante
impl sub_f64: Sub F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L351)

---

## mul_i8

```ante
impl mul_i8: Mul I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L354)

---

## mul_i16

```ante
impl mul_i16: Mul I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L355)

---

## mul_i32

```ante
impl mul_i32: Mul I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L356)

---

## mul_i64

```ante
impl mul_i64: Mul I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L357)

---

## mul_isz

```ante
impl mul_isz: Mul Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L358)

---

## mul_u8

```ante
impl mul_u8: Mul U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L359)

---

## mul_u16

```ante
impl mul_u16: Mul U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L360)

---

## mul_u32

```ante
impl mul_u32: Mul U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L361)

---

## mul_u64

```ante
impl mul_u64: Mul U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L362)

---

## mul_usz

```ante
impl mul_usz: Mul Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L363)

---

## mul_f32

```ante
impl mul_f32: Mul F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L364)

---

## mul_f64

```ante
impl mul_f64: Mul F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L365)

---

## div_i8

```ante
impl div_i8: Div I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L368)

---

## div_i16

```ante
impl div_i16: Div I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L369)

---

## div_i32

```ante
impl div_i32: Div I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L370)

---

## div_i64

```ante
impl div_i64: Div I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L371)

---

## div_isz

```ante
impl div_isz: Div Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L372)

---

## div_u8

```ante
impl div_u8: Div U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L373)

---

## div_u16

```ante
impl div_u16: Div U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L374)

---

## div_u32

```ante
impl div_u32: Div U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L375)

---

## div_u64

```ante
impl div_u64: Div U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L376)

---

## div_usz

```ante
impl div_usz: Div Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L377)

---

## div_f32

```ante
impl div_f32: Div F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L378)

---

## div_f64

```ante
impl div_f64: Div F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L379)

---

## mod_i8

```ante
impl mod_i8: Mod I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L382)

---

## mod_i16

```ante
impl mod_i16: Mod I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L383)

---

## mod_i32

```ante
impl mod_i32: Mod I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L384)

---

## mod_i64

```ante
impl mod_i64: Mod I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L385)

---

## mod_isz

```ante
impl mod_isz: Mod Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L386)

---

## mod_u8

```ante
impl mod_u8: Mod U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L387)

---

## mod_u16

```ante
impl mod_u16: Mod U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L388)

---

## mod_u32

```ante
impl mod_u32: Mod U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L389)

---

## mod_u64

```ante
impl mod_u64: Mod U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L390)

---

## mod_usz

```ante
impl mod_usz: Mod Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L391)

---

## eq_i8

```ante
impl eq_i8: Eq I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L400)

---

## eq_i16

```ante
impl eq_i16: Eq I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L401)

---

## eq_i32

```ante
impl eq_i32: Eq I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L402)

---

## eq_i64

```ante
impl eq_i64: Eq I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L403)

---

## eq_isz

```ante
impl eq_isz: Eq Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L404)

---

## eq_u8

```ante
impl eq_u8: Eq U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L405)

---

## eq_u16

```ante
impl eq_u16: Eq U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L406)

---

## eq_u32

```ante
impl eq_u32: Eq U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L407)

---

## eq_u64

```ante
impl eq_u64: Eq U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L408)

---

## eq_usz

```ante
impl eq_usz: Eq Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L409)

---

## eq_f32

```ante
impl eq_f32: Eq F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L410)

---

## eq_f64

```ante
impl eq_f64: Eq F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L411)

---

## eq_char

```ante
impl eq_char: Eq Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L413)

---

## eq_bool

```ante
impl eq_bool: Eq Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L414)

---

## eq_ref

```ante
impl eq_ref {_: Eq t e}: Eq (ref t) e
```

References are equal if their elements are equal

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L417)

---

## eq_ptr

```ante
impl eq_ptr: Eq (Ptr t) pure
```

Pointers are equal if their addresses are equal

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L421)

---

## eq_maybe

```ante
impl eq_maybe {_: Eq e2 e}: Eq (Maybe e2) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L424)

---

## eq_pair

```ante
impl eq_pair {_: Eq a e} {_: Eq b e}: Eq (a, b) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L431)

---

## not_bool

```ante
impl not_bool: Not Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L439)

---

## not_i32

```ante
impl not_i32: Not I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L442)

---

## cmp_i8

```ante
impl cmp_i8: Cmp I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L453)

---

## cmp_i16

```ante
impl cmp_i16: Cmp I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L454)

---

## cmp_i32

```ante
impl cmp_i32: Cmp I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L455)

---

## cmp_i64

```ante
impl cmp_i64: Cmp I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L456)

---

## cmp_isz

```ante
impl cmp_isz: Cmp Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L457)

---

## cmp_u8

```ante
impl cmp_u8: Cmp U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L459)

---

## cmp_u16

```ante
impl cmp_u16: Cmp U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L460)

---

## cmp_u32

```ante
impl cmp_u32: Cmp U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L461)

---

## cmp_u64

```ante
impl cmp_u64: Cmp U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L462)

---

## cmp_usz

```ante
impl cmp_usz: Cmp Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L463)

---

## cmp_f32

```ante
impl cmp_f32: Cmp F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L465)

---

## cmp_f64

```ante
impl cmp_f64: Cmp F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L466)

---

## cmp_char

```ante
impl cmp_char: Cmp Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L468)

---

## num_i8

```ante
impl num_i8: Num I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L484)

---

## num_i16

```ante
impl num_i16: Num I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L494)

---

## num_i32

```ante
impl num_i32: Num I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L504)

---

## num_i64

```ante
impl num_i64: Num I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L514)

---

## num_isz

```ante
impl num_isz: Num Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L524)

---

## num_u8

```ante
impl num_u8: Num U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L534)

---

## num_u16

```ante
impl num_u16: Num U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L544)

---

## num_u32

```ante
impl num_u32: Num U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L554)

---

## num_u64

```ante
impl num_u64: Num U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L564)

---

## num_usz

```ante
impl num_usz: Num Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L574)

---

## num_f32

```ante
impl num_f32: Num F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L584)

---

## num_f64

```ante
impl num_f64: Num F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L594)

---

## try_cast_i64_u64

```ante
impl try_cast_i64_u64: TryCast I64 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L605)

---

## try_cast_u64

```ante
impl try_cast_u64: TryCast U64 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L610)

---

## append_string

```ante
impl append_string: Append String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L619)

---

## extract_ptr_usz

```ante
impl extract_ptr_usz: Extract (Ptr t) Usz t pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L641)

---

## extract_string

```ante
impl extract_string: Extract (ref String) Usz Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L644)

---

## extract_array

```ante
impl extract_array: Extract (ref Array n t) Usz (ref t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L675)

---

## extract_array_move

```ante
impl extract_array_move: Extract (Array n t) Usz t Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L678)

---

## extract_array_mut

```ante
impl extract_array_mut: Extract (mut Array n t) Usz (mut t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L681)

---

## bitwise_i32

```ante
implicit bitwise_i32: Bitwise I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L694)

---

## bitwise_u64

```ante
implicit bitwise_u64: Bitwise U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L699)

---

## copy_i8

```ante
impl copy_i8: Copy I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L749)

---

## copy_i16

```ante
impl copy_i16: Copy I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L751)

---

## copy_i32

```ante
impl copy_i32: Copy I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L753)

---

## copy_i64

```ante
impl copy_i64: Copy I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L755)

---

## copy_isz

```ante
impl copy_isz: Copy Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L757)

---

## copy_u8

```ante
impl copy_u8: Copy U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L759)

---

## copy_u16

```ante
impl copy_u16: Copy U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L761)

---

## copy_u32

```ante
impl copy_u32: Copy U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L763)

---

## copy_u64

```ante
impl copy_u64: Copy U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L765)

---

## copy_usz

```ante
impl copy_usz: Copy Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L767)

---

## copy_f32

```ante
impl copy_f32: Copy F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L770)

---

## copy_f64

```ante
impl copy_f64: Copy F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L772)

---

## copy_unit

```ante
impl copy_unit: Copy Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L775)

---

## copy_bool

```ante
impl copy_bool: Copy Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L777)

---

## copy_char

```ante
impl copy_char: Copy Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L779)

---

## copy_ptr

```ante
impl copy_ptr: Copy (Ptr t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L782)

---

## copy_ref

```ante
impl copy_ref: Copy (ref t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L784)

---

## copy_mut

```ante
impl copy_mut: Copy (mut t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L786)

---

## copy_imm

```ante
impl copy_imm: Copy (imm t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L788)

---

## copy_uniq

```ante
impl copy_uniq: Copy (uniq t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L791)

---

## copy_pair

```ante
impl copy_pair {_: Copy a} {_: Copy b}: Copy (a, b)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L794)

---

## copy_maybe

```ante
impl copy_maybe {_: Copy a}: Copy (Maybe a)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L797)

---

## clone_string

```ante
impl clone_string: Clone String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L802)

---

## drop_i8

```ante
impl drop_i8: Drop I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L808)

---

## drop_i16

```ante
impl drop_i16: Drop I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L809)

---

## drop_i32

```ante
impl drop_i32: Drop I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L810)

---

## drop_i64

```ante
impl drop_i64: Drop I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L811)

---

## drop_isz

```ante
impl drop_isz: Drop Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L812)

---

## drop_u8

```ante
impl drop_u8: Drop U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L813)

---

## drop_u16

```ante
impl drop_u16: Drop U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L814)

---

## drop_u32

```ante
impl drop_u32: Drop U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L815)

---

## drop_u64

```ante
impl drop_u64: Drop U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L816)

---

## drop_usz

```ante
impl drop_usz: Drop Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L817)

---

## drop_f32

```ante
impl drop_f32: Drop F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L818)

---

## drop_f64

```ante
impl drop_f64: Drop F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L819)

---

## drop_unit

```ante
impl drop_unit: Drop Unit pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L820)

---

## drop_bool

```ante
impl drop_bool: Drop Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L821)

---

## drop_char

```ante
impl drop_char: Drop Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L822)

---

## drop_ptr

```ante
impl drop_ptr: Drop (Ptr t) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L823)

---

## drop_string

```ante
impl drop_string: Drop String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L825)

---

## insert_ptr_usz

```ante
impl insert_ptr_usz: Insert (mut Ptr t) Usz t pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L845)

---

## insert_array

```ante
impl insert_array: Insert (mut Array n t) Usz t Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L848)

---

## print_u8

```ante
impl print_u8: Display U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L898)

---

## print_u16

```ante
impl print_u16: Display U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L900)

---

## print_u32

```ante
impl print_u32: Display U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L902)

---

## print_u64

```ante
impl print_u64: Display U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L904)

---

## print_usz

```ante
impl print_usz: Display Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L906)

---

## print_i8

```ante
impl print_i8: Display I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L909)

---

## print_i16

```ante
impl print_i16: Display I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L912)

---

## print_i32

```ante
impl print_i32: Display I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L915)

---

## print_i64

```ante
impl print_i64: Display I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L918)

---

## print_isz

```ante
impl print_isz: Display Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L922)

---

## print_char

```ante
impl print_char: Display Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L925)

---

## print_f64

```ante
impl print_f64: Display F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L928)

---

## print_f32

```ante
impl print_f32: Display F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L930)

---

## print_pair

```ante
impl print_pair {_: Display a e} {_: Display b e}: Display (a, b) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L946)

---

## print_string

```ante
impl print_string: Display String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L953)

---

## print_maybe

```ante
impl print_maybe {_: Display a e}: Display (Maybe a) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L956)

---

## print_bool

```ante
impl print_bool: Display Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L983)

---

## print_array

```ante
impl print_array {_: Display t e}: Display (Array n t) Panic & e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L988)

---

## print_ref

```ante
impl print_ref {_: Display a e}: Display (ref a) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L998)

---

## iterator_range

```ante
impl iterator_range: Iterator (Range Usz) Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L1013)

</details>

