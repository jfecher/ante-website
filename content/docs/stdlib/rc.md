+++
title = "Std.Rc"
categories = ["docs"]
weight = 12
+++

```ante
import Std.Rc
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an)

---

# Types

---

## Rc

```ante
type Rc t =
    ptr: Ptr (U32, t)
```

A non-threadsafe reference-counted pointer.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L7)

---

### Rc.of

```ante
Rc.of (value: t): Rc t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L10)

---

### Rc.as_ref

```ante
Rc.as_ref (rc: imm Rc t): ref t
```

Returns a shared reference into the inner element. Since other Rc clones of
the same value may exist and may mutate the element via [Rc.as_mut], this
can only be a shared `ref` reference instead of a fully immutable `imm`
reference. Similarly, requiring a `uniq Rc t` ensures this Rc is not dropped
while the returned reference is still alive.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L21)

---

### Rc.as_mut

```ante
Rc.as_mut (rc: uniq Rc t): mut t
```

Returns a shared, mutable reference into the inner element. Since other Rc
clones of the same value may exist and may mutate the element through this
function, this can only give a shared `mut` reference instead of a `uniq`
reference. Similarly, requiring a `uniq Rc t` ensures this Rc is not dropped
while the returned reference is still alive.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L30)

---

### Rc.try_unwrap

```ante
Rc.try_unwrap (var rc: Rc t): Result t (Rc t)
```

If the reference count is 1, unwraps the Rc returning the value directly.
Otherwise, returns `Error rc` with the original Rc value.

If you always need to extract the inner value from the Rc, consider
using `Rc.unwrap_or_clone` which will clone the inner value in the shared case
instead of returning an error.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L52)

---

### Rc.unwrap_or_clone

```ante
Rc.unwrap_or_clone (rc: Rc t) {_: Clone t}: t
```

If the reference count is 1, unwraps the Rc returning the value directly.
Otherwise, clones the inner value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L66)

---

# Functions

---

## ref_count

```ante
ref_count (rc: ref Rc t): U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L34)

---

## inc_ref_count

```ante
inc_ref_count (rc: mut Rc t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L38)

---

## dec_ref_count

```ante
dec_ref_count (rc: mut Rc t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L42)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## clone_rc

```ante
impl clone_rc: Clone (Rc t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L71)

---

## drop_rc

```ante
impl drop_rc {_: Drop t e}: Drop (Rc t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L77)

</details>

