+++
title = "Std.Cast"
categories = ["docs"]
weight = 4
+++

```ante
import Std.Cast
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an)

---

# Traits

---

## Cast

```ante
trait Cast a b (e: effect) =
    cast: fn a -> b can e
```

A type conversion from a to b

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L17)

---

## TryCast

```ante
trait TryCast a b (e: effect) =
    try_cast: fn a -> b can Fail, e
```

Represents a failable type cast from a to b

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L227)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## cast_same

```ante
impl cast_same: Cast a a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L20)

---

## cast_ptr_usz

```ante
impl cast_ptr_usz: Cast (Ptr a) Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L23)

---

## cast_usz_ptr

```ante
impl cast_usz_ptr: Cast Usz (Ptr a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L26)

---

## cast_u8_u16

```ante
impl cast_u8_u16: Cast U8 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L31)

---

## cast_u8_u32

```ante
impl cast_u8_u32: Cast U8 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L32)

---

## cast_u8_u64

```ante
impl cast_u8_u64: Cast U8 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L33)

---

## cast_u8_usz

```ante
impl cast_u8_usz: Cast U8 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L34)

---

## cast_u16_u8

```ante
impl cast_u16_u8: Cast U16 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L36)

---

## cast_u16_u32

```ante
impl cast_u16_u32: Cast U16 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L37)

---

## cast_u16_u64

```ante
impl cast_u16_u64: Cast U16 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L38)

---

## cast_u16_usz

```ante
impl cast_u16_usz: Cast U16 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L39)

---

## cast_u32_u8

```ante
impl cast_u32_u8: Cast U32 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L41)

---

## cast_u32_u16

```ante
impl cast_u32_u16: Cast U32 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L42)

---

## cast_u32_u64

```ante
impl cast_u32_u64: Cast U32 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L43)

---

## cast_u32_usz

```ante
impl cast_u32_usz: Cast U32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L44)

---

## cast_u64_u8

```ante
impl cast_u64_u8: Cast U64 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L46)

---

## cast_u64_u16

```ante
impl cast_u64_u16: Cast U64 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L47)

---

## cast_u64_u32

```ante
impl cast_u64_u32: Cast U64 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L48)

---

## cast_u64_usz

```ante
impl cast_u64_usz: Cast U64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L49)

---

## cast_usz_u8

```ante
impl cast_usz_u8: Cast Usz U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L51)

---

## cast_usz_u16

```ante
impl cast_usz_u16: Cast Usz U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L52)

---

## cast_usz_u32

```ante
impl cast_usz_u32: Cast Usz U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L53)

---

## cast_usz_u64

```ante
impl cast_usz_u64: Cast Usz U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L54)

---

## cast_u8_i32

```ante
impl cast_u8_i32: Cast U8 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L56)

---

## cast_i8_i16

```ante
impl cast_i8_i16: Cast I8 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L59)

---

## cast_i8_i32

```ante
impl cast_i8_i32: Cast I8 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L60)

---

## cast_i8_i64

```ante
impl cast_i8_i64: Cast I8 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L61)

---

## cast_i8_isz

```ante
impl cast_i8_isz: Cast I8 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L62)

---

## cast_i16_i8

```ante
impl cast_i16_i8: Cast I16 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L64)

---

## cast_i16_i32

```ante
impl cast_i16_i32: Cast I16 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L65)

---

## cast_i16_i64

```ante
impl cast_i16_i64: Cast I16 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L66)

---

## cast_i16_isz

```ante
impl cast_i16_isz: Cast I16 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L67)

---

## cast_i32_i8

```ante
impl cast_i32_i8: Cast I32 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L69)

---

## cast_i32_i16

```ante
impl cast_i32_i16: Cast I32 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L70)

---

## cast_i32_i64

```ante
impl cast_i32_i64: Cast I32 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L71)

---

## cast_i32_isz

```ante
impl cast_i32_isz: Cast I32 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L72)

---

## cast_i64_i8

```ante
impl cast_i64_i8: Cast I64 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L74)

---

## cast_i64_i16

```ante
impl cast_i64_i16: Cast I64 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L75)

---

## cast_i64_i32

```ante
impl cast_i64_i32: Cast I64 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L76)

---

## cast_i64_isz

```ante
impl cast_i64_isz: Cast I64 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L77)

---

## cast_isz_i8

```ante
impl cast_isz_i8: Cast Isz I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L79)

---

## cast_isz_i16

```ante
impl cast_isz_i16: Cast Isz I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L80)

---

## cast_isz_i32

```ante
impl cast_isz_i32: Cast Isz I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L81)

---

## cast_isz_i64

```ante
impl cast_isz_i64: Cast Isz I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L82)

---

## cast_i8_f32

```ante
impl cast_i8_f32: Cast I8 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L85)

---

## cast_i16_f32

```ante
impl cast_i16_f32: Cast I16 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L86)

---

## cast_i32_f32

```ante
impl cast_i32_f32: Cast I32 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L87)

---

## cast_i64_f32

```ante
impl cast_i64_f32: Cast I64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L88)

---

## cast_isz_f32

```ante
impl cast_isz_f32: Cast Isz F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L89)

---

## cast_i8_f64

```ante
impl cast_i8_f64: Cast I8 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L90)

---

## cast_i16_f64

```ante
impl cast_i16_f64: Cast I16 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L91)

---

## cast_i32_f64

```ante
impl cast_i32_f64: Cast I32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L92)

---

## cast_i64_f64

```ante
impl cast_i64_f64: Cast I64 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L93)

---

## cast_isz_f64

```ante
impl cast_isz_f64: Cast Isz F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L94)

---

## cast_u8_f32

```ante
impl cast_u8_f32: Cast U8 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L96)

---

## cast_u16_f32

```ante
impl cast_u16_f32: Cast U16 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L97)

---

## cast_u32_f32

```ante
impl cast_u32_f32: Cast U32 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L98)

---

## cast_u64_f32

```ante
impl cast_u64_f32: Cast U64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L99)

---

## cast_usz_f32

```ante
impl cast_usz_f32: Cast Usz F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L100)

---

## cast_u8_f64

```ante
impl cast_u8_f64: Cast U8 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L101)

---

## cast_u16_f64

```ante
impl cast_u16_f64: Cast U16 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L102)

---

## cast_u32_f64

```ante
impl cast_u32_f64: Cast U32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L103)

---

## cast_u64_f64

```ante
impl cast_u64_f64: Cast U64 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L104)

---

## cast_usz_f64

```ante
impl cast_usz_f64: Cast Usz F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L105)

---

## cast_f32_i8

```ante
impl cast_f32_i8: Cast F32 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L107)

---

## cast_f32_i16

```ante
impl cast_f32_i16: Cast F32 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L108)

---

## cast_f32_i32

```ante
impl cast_f32_i32: Cast F32 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L109)

---

## cast_f32_i64

```ante
impl cast_f32_i64: Cast F32 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L110)

---

## cast_f32_isz

```ante
impl cast_f32_isz: Cast F32 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L111)

---

## cast_f64_i8

```ante
impl cast_f64_i8: Cast F64 I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L112)

---

## cast_f64_i16

```ante
impl cast_f64_i16: Cast F64 I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L113)

---

## cast_f64_i32

```ante
impl cast_f64_i32: Cast F64 I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L114)

---

## cast_f64_i64

```ante
impl cast_f64_i64: Cast F64 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L115)

---

## cast_f64_isz

```ante
impl cast_f64_isz: Cast F64 Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L116)

---

## cast_f32_u8

```ante
impl cast_f32_u8: Cast F32 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L118)

---

## cast_f32_u16

```ante
impl cast_f32_u16: Cast F32 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L119)

---

## cast_f32_u32

```ante
impl cast_f32_u32: Cast F32 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L120)

---

## cast_f32_u64

```ante
impl cast_f32_u64: Cast F32 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L121)

---

## cast_f32_usz

```ante
impl cast_f32_usz: Cast F32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L122)

---

## cast_f64_u8

```ante
impl cast_f64_u8: Cast F64 U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L123)

---

## cast_f64_u16

```ante
impl cast_f64_u16: Cast F64 U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L124)

---

## cast_f64_u32

```ante
impl cast_f64_u32: Cast F64 U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L125)

---

## cast_f64_u64

```ante
impl cast_f64_u64: Cast F64 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L126)

---

## cast_f64_usz

```ante
impl cast_f64_usz: Cast F64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L127)

---

## cast_f64_f32

```ante
impl cast_f64_f32: Cast F64 F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L129)

---

## cast_f32_f64

```ante
impl cast_f32_f64: Cast F32 F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L130)

---

## cast_i8_char

```ante
impl cast_i8_char: Cast I8 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L133)

---

## cast_i16_char

```ante
impl cast_i16_char: Cast I16 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L134)

---

## cast_i32_char

```ante
impl cast_i32_char: Cast I32 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L135)

---

## cast_i64_char

```ante
impl cast_i64_char: Cast I64 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L136)

---

## cast_isz_char

```ante
impl cast_isz_char: Cast Isz Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L137)

---

## cast_u8_char

```ante
impl cast_u8_char: Cast U8 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L139)

---

## cast_u16_char

```ante
impl cast_u16_char: Cast U16 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L140)

---

## cast_u32_char

```ante
impl cast_u32_char: Cast U32 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L141)

---

## cast_u64_char

```ante
impl cast_u64_char: Cast U64 Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L142)

---

## cast_usz_char

```ante
impl cast_usz_char: Cast Usz Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L143)

---

## cast_i32_usz

```ante
impl cast_i32_usz: Cast I32 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L146)

---

## cast_usz_i64

```ante
impl cast_usz_i64: Cast Usz I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L151)

---

## cast_i64_usz

```ante
impl cast_i64_usz: Cast I64 Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L152)

---

## cast_char_u8

```ante
impl cast_char_u8: Cast Char U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L155)

---

## cast_char_i32

```ante
impl cast_char_i32: Cast Char I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L156)

---

## cast_char_u64

```ante
impl cast_char_u64: Cast Char U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L157)

---

## cast_bool_i32

```ante
impl cast_bool_i32: Cast Bool I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L159)

---

## cast_u8_string

```ante
impl cast_u8_string: Cast U8 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L192)

---

## cast_u16_string

```ante
impl cast_u16_string: Cast U16 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L193)

---

## cast_u32_string

```ante
impl cast_u32_string: Cast U32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L194)

---

## cast_u64_string

```ante
impl cast_u64_string: Cast U64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L195)

---

## cast_usz_string

```ante
impl cast_usz_string: Cast Usz String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L196)

---

## cast_i8_string

```ante
impl cast_i8_string: Cast I8 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L197)

---

## cast_i16_string

```ante
impl cast_i16_string: Cast I16 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L198)

---

## cast_i32_string

```ante
impl cast_i32_string: Cast I32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L199)

---

## cast_i64_string

```ante
impl cast_i64_string: Cast I64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L200)

---

## cast_isz_string

```ante
impl cast_isz_string: Cast Isz String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L201)

---

## cast_char_string

```ante
impl cast_char_string: Cast Char String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L203)

---

## cast_bool_string

```ante
impl cast_bool_string: Cast Bool String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L209)

---

## cast_f32_string

```ante
impl cast_f32_string: Cast F32 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L220)

---

## cast_f64_string

```ante
impl cast_f64_string: Cast F64 String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L223)

---

## try_cast_from_cast

```ante
impl try_cast_from_cast {_: Cast a b e}: TryCast a b e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L230)

---

## try_cast_i64_u64

```ante
impl try_cast_i64_u64: TryCast I64 U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L233)

---

## try_cast_u64

```ante
impl try_cast_u64: TryCast U64 I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Cast.an#L238)

</details>

