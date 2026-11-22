+++
title = "Std.Slice"
categories = ["docs"]
weight = 24
+++

```ante
import Std.Slice
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an)

---

# Types

---

## Slice

```ante
type Slice 'a t =
    data: ref 'a t
    len: Usz
```

A contiguous series of elements from 'a.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L9)

---

## MutSlice

```ante
type MutSlice 'a t = Slice mut t
```

A mutable, continguous series of elements from 'a.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L14)

---

# Functions

---

## from_parts

```ante
from_parts (data: Ptr t) (len: Usz): Slice 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L16)

---

## slice_range

```ante
slice_range (s: Slice 'a t) (start: Usz) (end: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L19)

---

## slice_from

```ante
slice_from (s: Slice 'a t) (start: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L25)

---

## slice_until

```ante
slice_until (s: Slice 'a t) (end: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L28)

---

## len

```ante
len (s: Slice 'a t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L71)

---

## get

```ante
get (s: Slice 'a t) (i: Usz): ref 'a t can Fail
```

A reference to the element at the given 0-based index.
Fails if the index is out of bounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L75)

---

## get_unchecked

```ante
get_unchecked (s: Slice 'a t) (i: Usz): ref 'a t
```

A reference to the element at the given 0-based index.
Unsafe: Does not perform any bounds checking!

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L82)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_slice

```ante
impl copy_slice: Copy (Slice 'a t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L31)

---

## extract_slice

```ante
impl extract_slice: Extract (Slice 'a t) Usz (ref 'a t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L34)

---

## extract_ref_slice

```ante
impl extract_ref_slice: Extract (ref 'r Slice 'a t) Usz (ref 'a t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L40)

---

## insert_slice

```ante
impl insert_slice {_: Drop t e}: Insert (MutSlice 'a t) Usz t Panic & Mutate 'a & e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L43)

---

## stream_slice

```ante
impl stream_slice: Stream (Slice 'a t) (ref 'a t) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L48)

---

## print_slice

```ante
impl print_slice {_: Display t e}: Display (Slice 'a t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L53)

---

## cmp_slice

```ante
impl cmp_slice {_: Cmp t}: Cmp (Slice 'a t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L61)

</details>

