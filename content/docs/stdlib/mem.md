+++
title = "Std.Mem"
categories = ["docs"]
weight = 19
+++

```ante
import Std.Mem
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an)

---

# Types

---

## Type

```ante
type Type t =
    | MkType
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L1)

---

# Functions

---

## size_of

```ante
size_of (v: Type t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L5)

---

## offset

```ante
offset (ptr: Ptr t) (index: Usz): Ptr t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L7)

---

## offset_bytes

```ante
offset_bytes (ptr: Ptr t) (index: Usz): Ptr t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L12)

---

## offset_negative

```ante
offset_negative (ptr: Ptr t) (index: Usz): Ptr t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L16)

---

## deref_ptr

```ante
deref_ptr (p: Ptr t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L20)

---

## ptr_store

```ante
ptr_store (p: Ptr a) (value: a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L23)

---

## array_insert

```ante
array_insert (p: Ptr a) (index: Usz) (value: a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L26)

---

## ptr_to_ref

```ante
ptr_to_ref: fn (Ptr a) -> ref a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L29)

---

## ref_to_ptr

```ante
ref_to_ptr: fn (ref a) -> Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L30)

---

## null

```ante
null (): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L32)

---

## forget

```ante
forget (x: a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L34)

---

## transmute

```ante
transmute (x: a): b
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L37)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_type

```ante
impl copy_type: Copy (Type t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Mem.an#L3)

</details>

