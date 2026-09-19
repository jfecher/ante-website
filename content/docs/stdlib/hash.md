+++
title = "Std.Hash"
categories = ["docs"]
weight = 6
+++

```ante
import Std.Hash
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an)

---

# Traits

---

## Hash

```ante
trait Hash t =
    hash: fn t -> U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L4)

---

# Functions

---

## hash_combine

```ante
hash_combine (h1: U64) (h2: U64): U64
```

Combine two hashes to form a new one. This is order-sensitive so (a, b) and
(b, a) hash differently. Uses a mixing constant of 2^64 / phi.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L58)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## hash_string

```ante
impl hash_string: Hash String
```

FNV-1a 64-bit with an offset basis of 14695981039346656037 (0xcbf29ce484222325),
and prime of 1099511628211 (0x100000001b3).

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L9)

---

## hash_u64

```ante
impl hash_u64: Hash U64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L14)

---

## hash_u8

```ante
impl hash_u8: Hash U8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L17)

---

## hash_u16

```ante
impl hash_u16: Hash U16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L20)

---

## hash_u32

```ante
impl hash_u32: Hash U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L23)

---

## hash_usz

```ante
impl hash_usz: Hash Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L26)

---

## hash_i8

```ante
impl hash_i8: Hash I8
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L29)

---

## hash_i16

```ante
impl hash_i16: Hash I16
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L32)

---

## hash_i32

```ante
impl hash_i32: Hash I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L35)

---

## hash_i64

```ante
impl hash_i64: Hash I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L38)

---

## hash_isz

```ante
impl hash_isz: Hash Isz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L41)

---

## hash_f32

```ante
impl hash_f32: Hash F32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L44)

---

## hash_f64

```ante
impl hash_f64: Hash F64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L47)

---

## hash_bool

```ante
impl hash_bool: Hash Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L50)

---

## hash_char

```ante
impl hash_char: Hash Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L53)

---

## hash_pair

```ante
impl hash_pair {_: Hash a} {_: Hash b}: Hash (a, b)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L62)

---

## hash_maybe

```ante
impl hash_maybe {_: Hash a}: Hash (Maybe a)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L65)

---

## hash_result

```ante
impl hash_result {_: Hash a} {_: Hash e}: Hash (Result a e)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Hash.an#L71)

</details>

