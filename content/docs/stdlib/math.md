+++
title = "Std.Math"
categories = ["docs"]
weight = 10
+++

```ante
import Std.Math
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an)

---

# Traits

---

## CheckedNum

```ante
trait CheckedNum t =
    checked_add: fn t t -> t can Fail
    checked_sub: fn t t -> t can Fail
    checked_mul: fn t t -> t can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L302)

---

# Functions

---

## sqrt

```ante
sqrt: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L18)

---

## sqrtf

```ante
sqrtf: fn F32 -> F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L19)

---

## cbrt

```ante
cbrt: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L20)

---

## pow

```ante
pow: fn F64 F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L22)

---

## powf

```ante
powf: fn F32 F32 -> F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L23)

---

## exp

```ante
exp: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L25)

---

## log

```ante
log: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L26)

---

## log2

```ante
log2: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L27)

---

## log10

```ante
log10: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L28)

---

## sin

```ante
sin: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L30)

---

## cos

```ante
cos: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L31)

---

## tan

```ante
tan: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L32)

---

## asin

```ante
asin: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L33)

---

## acos

```ante
acos: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L34)

---

## atan

```ante
atan: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L35)

---

## atan2

```ante
atan2: fn F64 F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L36)

---

## floor

```ante
floor: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L38)

---

## ceil

```ante
ceil: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L39)

---

## round

```ante
round: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L40)

---

## trunc

```ante
trunc: fn F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L41)

---

## fmod

```ante
fmod: fn F64 F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L42)

---

## hypot

```ante
hypot: fn F64 F64 -> F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L43)

---

## pi

```ante
pi: F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L45)

---

## tau

```ante
tau: F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L46)

---

## e

```ante
e: F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L47)

---

## abs

```ante
abs (x: t) {n: Num t} {_: Copy t}: t
```

Returns the absolute value of this integer
Note that `abs MIN` will return `MIN` since there is no corresponding positive integer that fits in the same bit size.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L51)

---

## checked_add_i8

```ante
checked_add_i8 (x: I8) (y: I8): I8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L56)

---

## checked_add_i16

```ante
checked_add_i16 (x: I16) (y: I16): I16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L61)

---

## checked_add_i32

```ante
checked_add_i32 (x: I32) (y: I32): I32 can Fail
```

Add two I32 values, failing on overflow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L67)

---

## checked_add_i64

```ante
checked_add_i64 (x: I64) (y: I64): I64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L72)

---

## checked_add_isz

```ante
checked_add_isz (x: Isz) (y: Isz): Isz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L77)

---

## checked_add_u8

```ante
checked_add_u8 (x: U8) (y: U8): U8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L82)

---

## checked_add_u16

```ante
checked_add_u16 (x: U16) (y: U16): U16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L87)

---

## checked_add_u32

```ante
checked_add_u32 (x: U32) (y: U32): U32 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L92)

---

## checked_add_u64

```ante
checked_add_u64 (x: U64) (y: U64): U64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L97)

---

## checked_add_usz

```ante
checked_add_usz (x: Usz) (y: Usz): Usz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L102)

---

## checked_sub_i8

```ante
checked_sub_i8 (x: I8) (y: I8): I8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L107)

---

## checked_sub_i16

```ante
checked_sub_i16 (x: I16) (y: I16): I16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L112)

---

## checked_sub_i32

```ante
checked_sub_i32 (x: I32) (y: I32): I32 can Fail
```

Subtract two I32 values, failing on overflow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L118)

---

## checked_sub_i64

```ante
checked_sub_i64 (x: I64) (y: I64): I64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L123)

---

## checked_sub_isz

```ante
checked_sub_isz (x: Isz) (y: Isz): Isz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L128)

---

## checked_sub_u8

```ante
checked_sub_u8 (x: U8) (y: U8): U8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L133)

---

## checked_sub_u16

```ante
checked_sub_u16 (x: U16) (y: U16): U16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L138)

---

## checked_sub_u32

```ante
checked_sub_u32 (x: U32) (y: U32): U32 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L143)

---

## checked_sub_u64

```ante
checked_sub_u64 (x: U64) (y: U64): U64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L148)

---

## checked_sub_usz

```ante
checked_sub_usz (x: Usz) (y: Usz): Usz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L153)

---

## checked_mul_i8

```ante
checked_mul_i8 (x: I8) (y: I8): I8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L158)

---

## checked_mul_i16

```ante
checked_mul_i16 (x: I16) (y: I16): I16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L163)

---

## checked_mul_i32

```ante
checked_mul_i32 (x: I32) (y: I32): I32 can Fail
```

Multiply two I32 values, failing on overflow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L169)

---

## checked_mul_i64

```ante
checked_mul_i64 (x: I64) (y: I64): I64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L174)

---

## checked_mul_isz

```ante
checked_mul_isz (x: Isz) (y: Isz): Isz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L179)

---

## checked_mul_u8

```ante
checked_mul_u8 (x: U8) (y: U8): U8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L184)

---

## checked_mul_u16

```ante
checked_mul_u16 (x: U16) (y: U16): U16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L189)

---

## checked_mul_u32

```ante
checked_mul_u32 (x: U32) (y: U32): U32 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L194)

---

## checked_mul_u64

```ante
checked_mul_u64 (x: U64) (y: U64): U64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L199)

---

## checked_mul_usz

```ante
checked_mul_usz (x: Usz) (y: Usz): Usz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L204)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## checked_num_i8

```ante
impl checked_num_i8: CheckedNum I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L307)

---

## checked_num_i16

```ante
impl checked_num_i16: CheckedNum I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L312)

---

## checked_num_i32

```ante
impl checked_num_i32: CheckedNum I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L317)

---

## checked_num_i64

```ante
impl checked_num_i64: CheckedNum I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L322)

---

## checked_num_isz

```ante
impl checked_num_isz: CheckedNum Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L327)

---

## checked_num_u8

```ante
impl checked_num_u8: CheckedNum U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L332)

---

## checked_num_u16

```ante
impl checked_num_u16: CheckedNum U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L337)

---

## checked_num_u32

```ante
impl checked_num_u32: CheckedNum U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L342)

---

## checked_num_u64

```ante
impl checked_num_u64: CheckedNum U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L347)

---

## checked_num_usz

```ante
impl checked_num_usz: CheckedNum Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Math.an#L352)

</details>

