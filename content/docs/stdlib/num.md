+++
title = "Std.Num"
categories = ["docs"]
weight = 20
+++

```ante
import Std.Num
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an)

---

# Traits

---

## Add

```ante
trait Add n =
    +: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L2)

---

## Sub

```ante
trait Sub n =
    -: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L16)

---

## Mul

```ante
trait Mul n =
    *: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L30)

---

## Div

```ante
trait Div n =
    /: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L44)

---

## Mod

```ante
trait Mod n =
    %: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L58)

---

## Eq

```ante
trait Eq t (e: effect) =
    ==: fn (ref t) (ref t) -> Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L75)

---

## Not

```ante
trait Not t =
    not: fn t -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L112)

---

## Cmp

```ante
trait Cmp a =
    <: fn (ref a) (ref a) -> Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L121)

---

## Wrapping

```ante
trait Wrapping n =
    wrapping_add: fn n n -> n
    wrapping_sub: fn n n -> n
    wrapping_mul: fn n n -> n
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L289)

---

# Functions

---

## %%

```ante
%% (a: t) (b: t) {_: Mod t} {_: Eq t e} {_: Cast U8 t e} {_: Copy t}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L72)

---

## !=

```ante
(!=: fn (ref t) (ref t) {Eq t e} -> Bool can e) (l: ref t) (r: ref t) {(_: Eq t e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L110)

---

## >

```ante
(>: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(cmp: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L125)

---

## <=

```ante
(<=: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(cmp: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L126)

---

## >=

```ante
(>=: fn (ref t) (ref t) {Cmp t} -> Bool is pure) (a: ref t) (b: ref t) {(cmp: Cmp t)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L127)

---

## max

```ante
max (l: ref 'a t) (r: ref 'a t) {cmp: Cmp t}: ref 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L156)

---

## min

```ante
min (l: ref 'a t) (r: ref 'a t) {cmp: Cmp t}: ref 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L157)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## add_i8

```ante
impl add_i8: Add I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L3)

---

## add_i16

```ante
impl add_i16: Add I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L4)

---

## add_i32

```ante
impl add_i32: Add I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L5)

---

## add_i64

```ante
impl add_i64: Add I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L6)

---

## add_isz

```ante
impl add_isz: Add Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L7)

---

## add_u8

```ante
impl add_u8: Add U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L8)

---

## add_u16

```ante
impl add_u16: Add U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L9)

---

## add_u32

```ante
impl add_u32: Add U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L10)

---

## add_u64

```ante
impl add_u64: Add U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L11)

---

## add_usz

```ante
impl add_usz: Add Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L12)

---

## add_f32

```ante
impl add_f32: Add F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L13)

---

## add_f64

```ante
impl add_f64: Add F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L14)

---

## sub_i8

```ante
impl sub_i8: Sub I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L17)

---

## sub_i16

```ante
impl sub_i16: Sub I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L18)

---

## sub_i32

```ante
impl sub_i32: Sub I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L19)

---

## sub_i64

```ante
impl sub_i64: Sub I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L20)

---

## sub_isz

```ante
impl sub_isz: Sub Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L21)

---

## sub_u8

```ante
impl sub_u8: Sub U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L22)

---

## sub_u16

```ante
impl sub_u16: Sub U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L23)

---

## sub_u32

```ante
impl sub_u32: Sub U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L24)

---

## sub_u64

```ante
impl sub_u64: Sub U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L25)

---

## sub_usz

```ante
impl sub_usz: Sub Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L26)

---

## sub_f32

```ante
impl sub_f32: Sub F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L27)

---

## sub_f64

```ante
impl sub_f64: Sub F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L28)

---

## mul_i8

```ante
impl mul_i8: Mul I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L31)

---

## mul_i16

```ante
impl mul_i16: Mul I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L32)

---

## mul_i32

```ante
impl mul_i32: Mul I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L33)

---

## mul_i64

```ante
impl mul_i64: Mul I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L34)

---

## mul_isz

```ante
impl mul_isz: Mul Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L35)

---

## mul_u8

```ante
impl mul_u8: Mul U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L36)

---

## mul_u16

```ante
impl mul_u16: Mul U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L37)

---

## mul_u32

```ante
impl mul_u32: Mul U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L38)

---

## mul_u64

```ante
impl mul_u64: Mul U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L39)

---

## mul_usz

```ante
impl mul_usz: Mul Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L40)

---

## mul_f32

```ante
impl mul_f32: Mul F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L41)

---

## mul_f64

```ante
impl mul_f64: Mul F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L42)

---

## div_i8

```ante
impl div_i8: Div I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L45)

---

## div_i16

```ante
impl div_i16: Div I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L46)

---

## div_i32

```ante
impl div_i32: Div I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L47)

---

## div_i64

```ante
impl div_i64: Div I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L48)

---

## div_isz

```ante
impl div_isz: Div Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L49)

---

## div_u8

```ante
impl div_u8: Div U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L50)

---

## div_u16

```ante
impl div_u16: Div U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L51)

---

## div_u32

```ante
impl div_u32: Div U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L52)

---

## div_u64

```ante
impl div_u64: Div U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L53)

---

## div_usz

```ante
impl div_usz: Div Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L54)

---

## div_f32

```ante
impl div_f32: Div F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L55)

---

## div_f64

```ante
impl div_f64: Div F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L56)

---

## mod_i8

```ante
impl mod_i8: Mod I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L59)

---

## mod_i16

```ante
impl mod_i16: Mod I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L60)

---

## mod_i32

```ante
impl mod_i32: Mod I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L61)

---

## mod_i64

```ante
impl mod_i64: Mod I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L62)

---

## mod_isz

```ante
impl mod_isz: Mod Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L63)

---

## mod_u8

```ante
impl mod_u8: Mod U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L64)

---

## mod_u16

```ante
impl mod_u16: Mod U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L65)

---

## mod_u32

```ante
impl mod_u32: Mod U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L66)

---

## mod_u64

```ante
impl mod_u64: Mod U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L67)

---

## mod_usz

```ante
impl mod_usz: Mod Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L68)

---

## eq_i8

```ante
impl eq_i8: Eq I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L76)

---

## eq_i16

```ante
impl eq_i16: Eq I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L77)

---

## eq_i32

```ante
impl eq_i32: Eq I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L78)

---

## eq_i64

```ante
impl eq_i64: Eq I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L79)

---

## eq_isz

```ante
impl eq_isz: Eq Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L80)

---

## eq_u8

```ante
impl eq_u8: Eq U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L81)

---

## eq_u16

```ante
impl eq_u16: Eq U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L82)

---

## eq_u32

```ante
impl eq_u32: Eq U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L83)

---

## eq_u64

```ante
impl eq_u64: Eq U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L84)

---

## eq_usz

```ante
impl eq_usz: Eq Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L85)

---

## eq_f32

```ante
impl eq_f32: Eq F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L86)

---

## eq_f64

```ante
impl eq_f64: Eq F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L87)

---

## eq_char

```ante
impl eq_char: Eq Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L89)

---

## eq_bool

```ante
impl eq_bool: Eq Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L90)

---

## eq_ref

```ante
impl eq_ref {_: Eq t e}: Eq (ref t) e
```

References are equal if their elements are equal

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L93)

---

## eq_ptr

```ante
impl eq_ptr: Eq (Ptr t) pure
```

Pointers are equal if their addresses are equal

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L97)

---

## eq_maybe

```ante
impl eq_maybe {_: Eq e2 e}: Eq (Maybe e2) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L100)

---

## eq_pair

```ante
impl eq_pair {_: Eq a e} {_: Eq b e}: Eq (a, b) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L107)

---

## not_bool

```ante
impl not_bool: Not Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L115)

---

## not_i32

```ante
impl not_i32: Not I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L118)

---

## cmp_i8

```ante
impl cmp_i8: Cmp I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L129)

---

## cmp_i16

```ante
impl cmp_i16: Cmp I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L130)

---

## cmp_i32

```ante
impl cmp_i32: Cmp I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L131)

---

## cmp_i64

```ante
impl cmp_i64: Cmp I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L132)

---

## cmp_isz

```ante
impl cmp_isz: Cmp Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L133)

---

## cmp_u8

```ante
impl cmp_u8: Cmp U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L135)

---

## cmp_u16

```ante
impl cmp_u16: Cmp U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L136)

---

## cmp_u32

```ante
impl cmp_u32: Cmp U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L137)

---

## cmp_u64

```ante
impl cmp_u64: Cmp U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L138)

---

## cmp_usz

```ante
impl cmp_usz: Cmp Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L139)

---

## cmp_f32

```ante
impl cmp_f32: Cmp F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L141)

---

## cmp_f64

```ante
impl cmp_f64: Cmp F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L142)

---

## cmp_char

```ante
impl cmp_char: Cmp Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L144)

---

## cmp_pair

```ante
impl cmp_pair {ca: Cmp a} {cb: Cmp b}: Cmp (a, b)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L146)

---

## cmp_reverse

```ante
impl cmp_reverse {cmp: Cmp t}: Cmp t
```

Reverses the ordering of another `Cmp` impl. For example, `cmp_reverse cmp_i8` will
order integers from greatest to least instead of least to greatest.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L153)

---

## num_i8

```ante
impl num_i8: Num I8 add_i8 sub_i8 mul_i8 div_i8 eq_i8 cmp_i8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L169)

---

## num_i16

```ante
impl num_i16: Num I16 add_i16 sub_i16 mul_i16 div_i16 eq_i16 cmp_i16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L179)

---

## num_i32

```ante
impl num_i32: Num I32 add_i32 sub_i32 mul_i32 div_i32 eq_i32 cmp_i32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L189)

---

## num_i64

```ante
impl num_i64: Num I64 add_i64 sub_i64 mul_i64 div_i64 eq_i64 cmp_i64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L199)

---

## num_isz

```ante
impl num_isz: Num Isz add_isz sub_isz mul_isz div_isz eq_isz cmp_isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L209)

---

## num_u8

```ante
impl num_u8: Num U8 add_u8 sub_u8 mul_u8 div_u8 eq_u8 cmp_u8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L219)

---

## num_u16

```ante
impl num_u16: Num U16 add_u16 sub_u16 mul_u16 div_u16 eq_u16 cmp_u16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L229)

---

## num_u32

```ante
impl num_u32: Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L239)

---

## num_u64

```ante
impl num_u64: Num U64 add_u64 sub_u64 mul_u64 div_u64 eq_u64 cmp_u64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L249)

---

## num_usz

```ante
impl num_usz: Num Usz add_usz sub_usz mul_usz div_usz eq_usz cmp_usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L259)

---

## num_f32

```ante
impl num_f32: Num F32 add_f32 sub_f32 mul_f32 div_f32 eq_f32 cmp_f32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L269)

---

## num_f64

```ante
impl num_f64: Num F64 add_f64 sub_f64 mul_f64 div_f64 eq_f64 cmp_f64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L279)

---

## wrapping_i8

```ante
impl wrapping_i8: Wrapping I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L294)

---

## wrapping_i16

```ante
impl wrapping_i16: Wrapping I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L299)

---

## wrapping_i32

```ante
impl wrapping_i32: Wrapping I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L304)

---

## wrapping_i64

```ante
impl wrapping_i64: Wrapping I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L309)

---

## wrapping_isz

```ante
impl wrapping_isz: Wrapping Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L314)

---

## wrapping_u8

```ante
impl wrapping_u8: Wrapping U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L319)

---

## wrapping_u16

```ante
impl wrapping_u16: Wrapping U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L324)

---

## wrapping_u32

```ante
impl wrapping_u32: Wrapping U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L329)

---

## wrapping_u64

```ante
impl wrapping_u64: Wrapping U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L334)

---

## wrapping_usz

```ante
impl wrapping_usz: Wrapping Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Num.an#L339)

</details>

