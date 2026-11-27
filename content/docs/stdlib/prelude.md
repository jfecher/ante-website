+++
title = "Std.Prelude"
categories = ["docs"]
weight = 22
+++

The prelude is imported automatically into every Ante file

[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an)

---

# Types

---

## Maybe

```ante
type Maybe t =
    | None
    | Some t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L77)

---

## Range

```ante
type Range t =
    start: t
    end: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L81)

---

## IO

```ante
effect IO = Fs, Net
```

A convenience alias for the set of all primitive effects.
This may expand over time.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L114)

---

## Result

```ante
type Result t e =
    | Ok t
    | Error e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L120)

---

## ,

```ante
type , a b =
    first: a
    second: b
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L124)

---

# Traits

---

## Append

```ante
trait Append a =
    ++: fn a a -> a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L132)

---

## Extract

```ante
trait Extract collection index elem (e: effect) =
    .[]: fn collection index -> elem can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L139)

---

## Copy

```ante
trait Copy t =
    .*: fn (ref t) -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L155)

---

## Clone

```ante
trait Clone t =
    clone: fn (ref t) -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L160)

---

## Drop

```ante
trait Drop t (e: effect) =
    drop: fn t -> Unit can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L163)

---

## Insert

```ante
trait Insert collection index elem (e: effect) =
    .[]:=: fn collection index elem -> Unit can e
```

Insert an element into a collection.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L248)

---

# Effects

---

## Fs

```ante
effect Fs =
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L105)

---

## Net

```ante
effect Net =
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L110)

---

## Mutate

```ante
effect Mutate 'p =
```

Mutating a place `'p`, which invalidates any reference to an unstable place within it like `'p!`.
This is performed by assigning through a `mut 'p` reference and cannot be handled.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L118)

---

## Panic

```ante
effect Panic =
    panic: fn String -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L254)

---

# Functions

---

## ..

```ante
.. (start: t) (end: t): Range t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L85)

---

## iff

```ante
iff (condition: Bool) (then_: once fn Unit [env] -> a) {_: Drop env e}: Maybe a can e
```

If `condition` is true, returns `Some (then_ ())`,
otherwise returns `None`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L89)

---

## unwrap

```ante
unwrap (m: Maybe t): t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L92)

---

## unwrap_or_else

```ante
unwrap_or_else (m: Maybe t) (f: once fn Unit [env] -> t) {_: Drop env e}: t can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L97)

---

## first

```ante
(first: fn (_, b) {Drop b e} -> _ can e) ((,: fn _ b -> _, b is pure) (a: _) (_: b)) {(_: Drop b e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L126)

---

## second

```ante
(second: fn (a, _) {Drop a e} -> _ can e) ((,: fn a _ -> a, _ is pure) (_: a) (b: _)) {(_: Drop a e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L127)

---

## third

```ante
(third: fn (a, (b, _)) {Drop a e} {Drop b e} -> _ can e) ((,: fn a (b, _) -> a, (b, _) is pure) (_: a)  ((,: fn b _ -> b, _ is pure) (_: b) (c: _))) {(_: Drop a e)} {(_: Drop b e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L128)

---

## fourth

```ante
(fourth: fn (a, (b, (c, _))) {Drop a e} {Drop b e} {Drop c e} -> _ can e) ((,: fn a (b, (c, _)) -> a, (b, (c, _)) is pure) (_: a)  ((,: fn b (c, _) -> b, (c, _) is pure) (_: b)  ((,: fn c _ -> c, _ is pure) (_: c) (d: _)))) {(_: Drop a e)} {(_: Drop b e)} {(_: Drop c e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L129)

---

## fifth

```ante
(fifth: fn (a, (b, (c, (d, _)))) {Drop a eff} {Drop b eff} {Drop c eff} {Drop d eff} -> _ can eff) ((,: fn a (b, (c, (d, _))) -> a, (b, (c, (d, _))) is pure) (_: a)  ((,: fn b (c, (d, _)) -> b, (c, (d, _)) is pure) (_: b)  ((,: fn c (d, _) -> c, (d, _) is pure) (_: c)  ((,: fn d _ -> d, _ is pure) (_: d) (e: _))))) {(_: Drop a eff)} {(_: Drop b eff)} {(_: Drop c eff)} {(_: Drop d eff)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L130)

---

## ;

```ante
(;: fn a b {Drop a e} -> b can e) (_: a) (second: b) {(_: Drop a e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L135)

---

## |>

```ante
(|>: fn _ (once fn _ [_] -> _ can _) -> _ can _) (x: _) (f: once fn _ [_] -> _ can _)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L136)

---

## <|

```ante
(<|: fn (once fn _ [_] -> _ can _) _ -> _ can _) (f: once fn _ [_] -> _ can _) (x: _)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L137)

---

## deref

```ante
deref (x: ref t): t
```

Dereference without a Copy constraint. This is unsafe to use directly

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L152)

---

## copy

```ante
(copy: fn (ref _) {Copy _} -> _ is pure) (p1: ref _) {(p2: Copy _)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L158)

---

## abort_on_panic

```ante
abort_on_panic (f: a can Panic, e): a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L257)

---

## ignore

```ante
ignore (_x: a) {_: Drop a e}: Unit can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L265)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_range

```ante
impl copy_range {_: Copy t}: Copy (Range t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L83)

---

## extract_ptr_usz

```ante
impl extract_ptr_usz: Extract (ref 'p Ptr t) Usz (ref 'p! t) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L142)

---

## extract_string

```ante
impl extract_string: Extract (ref 's String) Usz (ref 's! Char) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L145)

---

## copy_i8

```ante
impl copy_i8: Copy I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L166)

---

## copy_i16

```ante
impl copy_i16: Copy I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L167)

---

## copy_i32

```ante
impl copy_i32: Copy I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L168)

---

## copy_i64

```ante
impl copy_i64: Copy I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L169)

---

## copy_isz

```ante
impl copy_isz: Copy Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L170)

---

## copy_u8

```ante
impl copy_u8: Copy U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L171)

---

## copy_u16

```ante
impl copy_u16: Copy U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L172)

---

## copy_u32

```ante
impl copy_u32: Copy U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L173)

---

## copy_u64

```ante
impl copy_u64: Copy U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L174)

---

## copy_usz

```ante
impl copy_usz: Copy Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L175)

---

## copy_f32

```ante
impl copy_f32: Copy F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L177)

---

## copy_f64

```ante
impl copy_f64: Copy F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L178)

---

## copy_unit

```ante
impl copy_unit: Copy Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L180)

---

## copy_bool

```ante
impl copy_bool: Copy Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L181)

---

## copy_char

```ante
impl copy_char: Copy Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L182)

---

## copy_ptr

```ante
impl copy_ptr: Copy (Ptr t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L184)

---

## copy_ref

```ante
impl copy_ref: Copy (ref t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L185)

---

## copy_pair

```ante
impl copy_pair {_: Copy a} {_: Copy b}: Copy (a, b)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L187)

---

## copy_maybe

```ante
impl copy_maybe {_: Copy a}: Copy (Maybe a)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L190)

---

## clone_i8

```ante
impl clone_i8: Clone I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L195)

---

## clone_i16

```ante
impl clone_i16: Clone I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L196)

---

## clone_i32

```ante
impl clone_i32: Clone I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L197)

---

## clone_i64

```ante
impl clone_i64: Clone I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L198)

---

## clone_isz

```ante
impl clone_isz: Clone Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L199)

---

## clone_u8

```ante
impl clone_u8: Clone U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L200)

---

## clone_u16

```ante
impl clone_u16: Clone U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L201)

---

## clone_u32

```ante
impl clone_u32: Clone U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L202)

---

## clone_u64

```ante
impl clone_u64: Clone U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L203)

---

## clone_usz

```ante
impl clone_usz: Clone Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L204)

---

## clone_f32

```ante
impl clone_f32: Clone F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L205)

---

## clone_f64

```ante
impl clone_f64: Clone F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L206)

---

## clone_unit

```ante
impl clone_unit: Clone Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L207)

---

## clone_bool

```ante
impl clone_bool: Clone Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L208)

---

## clone_char

```ante
impl clone_char: Clone Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L209)

---

## clone_ptr

```ante
impl clone_ptr: Clone (Ptr t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L210)

---

## clone_ref

```ante
impl clone_ref: Clone (ref t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L211)

---

## clone_pair

```ante
impl clone_pair {_: Clone a} {_: Clone b}: Clone (a, b)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L213)

---

## clone_maybe

```ante
impl clone_maybe {_: Clone a}: Clone (Maybe a)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L216)

---

## drop_i8

```ante
impl drop_i8: Drop I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L221)

---

## drop_i16

```ante
impl drop_i16: Drop I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L222)

---

## drop_i32

```ante
impl drop_i32: Drop I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L223)

---

## drop_i64

```ante
impl drop_i64: Drop I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L224)

---

## drop_isz

```ante
impl drop_isz: Drop Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L225)

---

## drop_u8

```ante
impl drop_u8: Drop U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L226)

---

## drop_u16

```ante
impl drop_u16: Drop U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L227)

---

## drop_u32

```ante
impl drop_u32: Drop U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L228)

---

## drop_u64

```ante
impl drop_u64: Drop U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L229)

---

## drop_usz

```ante
impl drop_usz: Drop Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L230)

---

## drop_f32

```ante
impl drop_f32: Drop F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L231)

---

## drop_f64

```ante
impl drop_f64: Drop F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L232)

---

## drop_unit

```ante
impl drop_unit: Drop Unit pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L233)

---

## drop_bool

```ante
impl drop_bool: Drop Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L234)

---

## drop_char

```ante
impl drop_char: Drop Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L235)

---

## drop_ptr

```ante
impl drop_ptr: Drop (Ptr t) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L236)

---

## drop_pair

```ante
impl drop_pair {_: Drop a e} {_: Drop b e}: Drop (a, b) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L238)

---

## drop_maybe

```ante
impl drop_maybe {_: Drop t e}: Drop (Maybe t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L241)

---

## drop_result

```ante
impl drop_result {_: Drop t e} {_: Drop error e}: Drop (Result t error) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L244)

---

## insert_ptr_usz

```ante
impl insert_ptr_usz: Insert (mut 'p Ptr t) Usz t (Mutate 'p!)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Prelude.an#L251)

</details>

