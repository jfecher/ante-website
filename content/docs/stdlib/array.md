+++
title = "Std.Array"
categories = ["docs"]
weight = 1
+++

```ante
import Std.Array
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an)

---

# Functions

---

## array_len

```ante
array_len (_array: ref Array n t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L4)

---

## array_get_unchecked

```ante
array_get_unchecked (array: ref Array n t) (i: Usz): ref t
```

Unsafe get without bounds-checking

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L10)

---

## array_set_unchecked

```ante
array_set_unchecked (array: mut Array n t) (i: Usz) (v: t): Unit can Mutate 'array
```

Unsafe set without bounds-checking

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L15)

---

## array_get

```ante
array_get (array: ref Array n t) (index: Usz): ref t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L19)

---

## array_set

```ante
array_set (array: mut Array n t) (index: Usz) elem: Unit can Panic, Mutate 'array
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L24)

---

## slice

```ante
slice (array: ref 'a Array n t): Slice 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L29)

---

## slice_range

```ante
slice_range (array: ref 'a Array n t) (start: Usz) (end: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L32)

---

## slice_from

```ante
slice_from (array: ref 'a Array n t) (start: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L35)

---

## slice_until

```ante
slice_until (array: ref 'a Array n t) (end: Usz): Slice 'a t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L38)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## extract_array

```ante
impl extract_array: Extract (ref 'a Array n t) Usz (ref 'a t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L41)

---

## insert_array

```ante
impl insert_array: Insert (mut 'a Array n t) Usz t Panic & Mutate 'a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L44)

---

## copy_array

```ante
impl copy_array {_: Copy t}: Copy (Array n t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L47)

---

## drop_array

```ante
impl drop_array {_: Drop t e}: Drop (Array n t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L50)

---

## cmp_array

```ante
impl cmp_array {_: Cmp t}: Cmp (Array n t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L55)

---

## print_array

```ante
impl print_array {_: Display t e}: Display (Array n t) Panic & e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Array.an#L64)

</details>

