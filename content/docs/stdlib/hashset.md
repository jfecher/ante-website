+++
title = "Std.Collections.HashSet"
categories = ["docs"]
weight = 8
+++

```ante
import Std.Collections.HashSet
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an)

---

# Functions

---

## len

```ante
len (set: ref HashSet v): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L15)

---

## is_empty

```ante
is_empty (set: ref HashSet k): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L17)

---

## empty

```ante
empty () {_: Hash k h}: HashSet k h
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L20)

---

## of

```ante
of (stream: s) {_: Stream s k e} {_: Hash k h} {_: Eq k e} {_: Drop k d}: HashSet k h can Panic, e, d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L22)

---

## clear

```ante
clear (set: mut HashSet k) {_: Drop k d}: Unit can d, Mutate 'set
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L27)

---

## contains

```ante
contains (set: ref HashSet k) (key: ref k) {_: Eq k e}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L30)

---

## insert

```ante
insert (set: mut HashSet k) (key: k) {_: Eq k e} {_: Drop k d}: Bool can Panic, e, d, Mutate 'set
```

Insert a new element into the HashSet
Returns True if the key is newly inserted
Returns False if the key already existed

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L36)

---

## remove

```ante
remove (set: mut HashSet k) (key: ref k) {_: Eq k e} {_: Drop k d}: Bool can e, d, Mutate 'set
```

Remove an element from the HashSet
Returns True if the key existed and was removed
Return False if the key was not present in the HashSet

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L42)

---

## extend

```ante
extend (set: mut HashSet k) (stream: s) {_: Stream s k e} {_: Eq k e} {_: Drop k d}: Unit can Panic, e, d, Mutate 'set
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L45)

---

## retain

```ante
retain (set: mut HashSet k) (predicate: fn (ref k) [env] -> Bool) {_: Drop k d} {_: Drop env d}: Unit can d, Mutate 'set
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L49)

---

## merge

```ante
merge (dst: mut HashSet k h) (src: HashSet k h) {_: Eq k e} {_: Drop k d}: Unit can Panic, e, d, Mutate 'dst
```

Insert every key of `src` into `dst`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L53)

---

## keys

```ante
(keys: fn (ref ((error) k)) -> (fn Unit [(ref ((error) _ _))] -> Unit can (error) (ref _)) is pure) (set: ref ((error) k))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L56)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## stream_set

```ante
impl stream_set: Stream (HashSet k) k pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L59)

---

## stream_ref_hashset

```ante
impl stream_ref_hashset: Stream (ref 'm HashSet k) (ref 'm k) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L62)

---

## clone_hashset

```ante
impl clone_hashset {_: Clone k}: Clone (HashSet k)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L70)

---

## print_hashset

```ante
impl print_hashset {_: Display k e}: Display (HashSet k) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L73)

---

## drop_hashset

```ante
impl drop_hashset {_: Drop k d}: Drop (HashSet k h) d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashSet.an#L87)

</details>

