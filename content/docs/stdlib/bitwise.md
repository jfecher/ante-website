+++
title = "Std.Bitwise"
categories = ["docs"]
weight = 2
+++

```ante
import Std.Bitwise
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an)

---

# Traits

---

## Bitwise

```ante
trait Bitwise t =
    band: fn t t -> t
    bor: fn t t -> t
    bxor: fn t t -> t
    shl: fn t t -> t
    shr: fn t t -> t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L1)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## bitwise_i8

```ante
impl bitwise_i8: Bitwise I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L8)

---

## bitwise_i16

```ante
impl bitwise_i16: Bitwise I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L15)

---

## bitwise_i32

```ante
impl bitwise_i32: Bitwise I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L22)

---

## bitwise_i64

```ante
impl bitwise_i64: Bitwise I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L29)

---

## bitwise_isz

```ante
impl bitwise_isz: Bitwise Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L36)

---

## bitwise_u8

```ante
impl bitwise_u8: Bitwise U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L43)

---

## bitwise_u16

```ante
impl bitwise_u16: Bitwise U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L50)

---

## bitwise_u32

```ante
impl bitwise_u32: Bitwise U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L57)

---

## bitwise_u64

```ante
impl bitwise_u64: Bitwise U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L64)

---

## bitwise_usz

```ante
impl bitwise_usz: Bitwise Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Bitwise.an#L71)

</details>

