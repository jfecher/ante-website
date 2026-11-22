+++
title = "Std.Sync.Arc"
categories = ["docs"]
weight = 27
+++

```ante
import Std.Sync.Arc
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an)

---

# Types

---

## Arc

```ante
type Arc t =
    ptr: Ptr (ArcInner t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an#L12)

---

# Functions

---

## of

```ante
of (value: t): Arc t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an#L14)

---

## as_ref

```ante
as_ref (a: ref 'a Arc t): ref 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an#L20)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## clone_arc

```ante
impl clone_arc: Clone (Arc t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an#L24)

---

## drop_arc

```ante
impl drop_arc {_: Drop t e}: Drop (Arc t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Arc.an#L30)

</details>

