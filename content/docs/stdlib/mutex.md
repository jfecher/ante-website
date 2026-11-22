+++
title = "Std.Sync.Mutex"
categories = ["docs"]
weight = 30
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

