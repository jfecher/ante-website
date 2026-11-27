+++
title = "Std.Sync.Mutex"
categories = ["docs"]
weight = 31
+++

```ante
import Std.Sync.Mutex
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Mutex.an)

---

# Types

---

## Mutex

```ante
type Mutex t =
    raw: VoidPtr
    value: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Mutex.an#L15)

---

# Functions

---

## of

```ante
of (value: t): Mutex t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Mutex.an#L20)

---

## with_lock

```ante
with_lock (m: ref Mutex t) (f: once fn (mut t) [_] -> r): r
```

Acquires the lock, blocking until it can be acquired, then runs `f`, then releases the
lock, returning the result of `f`.

This may deadlock 

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Mutex.an#L29)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_mutex

```ante
impl drop_mutex {_: Drop t e}: Drop (Mutex t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Mutex.an#L39)

</details>

