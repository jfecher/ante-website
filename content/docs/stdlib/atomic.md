+++
title = "Std.Sync.Atomic"
categories = ["docs"]
weight = 29
+++

```ante
import Std.Sync.Atomic
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an)

---

# Types

---

## Atomic

```ante
type Atomic t =
    value: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L15)

---

# Functions

---

## of

```ante
of (value: t): Atomic t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L17)

---

## load

```ante
load (a: ref Atomic t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L23)

---

## store

```ante
store (a: ref Atomic t) (value: t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L26)

---

## swap

```ante
swap (a: ref Atomic t) (value: t): t
```

Replace the value, returning the previous one.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L30)

---

## compare_and_swap

```ante
compare_and_swap (a: ref Atomic t) (current: t) (desired: t): t
```

If the current value equals `current`, replace it with `desired`.
Returns the previous value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L35)

---

## fetch_add

```ante
fetch_add (a: ref Atomic t) (delta: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L38)

---

## fetch_sub

```ante
fetch_sub (a: ref Atomic t) (delta: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L39)

---

## fetch_and

```ante
fetch_and (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L40)

---

## fetch_or

```ante
fetch_or (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L41)

---

## fetch_xor

```ante
fetch_xor (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L42)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_atomic

```ante
impl drop_atomic {_: Drop t e}: Drop (Atomic t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Atomic.an#L20)

</details>

