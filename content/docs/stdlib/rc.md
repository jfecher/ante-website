+++
title = "Std.Rc"
categories = ["docs"]
weight = 23
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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L8)

---

# Functions

---

## of

```ante
of (value: t): Rc t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L11)

---

## ref_count

```ante
ref_count (rc: ref Rc t): U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L21)

---

## inc_ref_count

```ante
inc_ref_count (rc: mut Rc t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L25)

---

## dec_ref_count

```ante
dec_ref_count (rc: mut Rc t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L29)

---

## try_unwrap

```ante
try_unwrap (rc: Rc t): Result t (Rc t)
```

If the reference count is 1, unwraps the Rc returning the value directly.
Otherwise, returns `Error rc` with the original Rc value.

If you always need to extract the inner value from the Rc, consider
using `unwrap_or_clone` which will clone the inner value in the shared case
instead of returning an error.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L39)

---

## unwrap_or_clone

```ante
unwrap_or_clone (rc: Rc t) {_: Clone t} {_: Drop t e}: t can e
```

If the reference count is 1, unwraps the Rc returning the value directly.
Otherwise, clones the inner value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L50)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## clone_rc

```ante
impl clone_rc: Clone (Rc t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L55)

---

## drop_rc

```ante
impl drop_rc {_: Drop t e}: Drop (Rc t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Rc.an#L61)

</details>

