+++
title = "Std.HashSet"
categories = ["docs"]
weight = 8
+++

```ante
import Std.HashSet
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an)

---

# Types

---

## HashSet

```ante
type HashSet k =
    inner: HashMap k Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L12)

---

### HashSet.len

```ante
HashSet.len (set: ref HashSet v): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L15)

---

### HashSet.is_empty

```ante
HashSet.is_empty (set: ref HashSet k): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L17)

---

### HashSet.empty

```ante
HashSet.empty (): HashSet k
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L20)

---

### HashSet.of

```ante
HashSet.of (s: s) {_: Stream s k e} {_: Hash k} {_: Eq k e}: HashSet k can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L22)

---

### HashSet.clear

```ante
HashSet.clear (set: mut HashSet k): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L27)

---

### HashSet.contains

```ante
HashSet.contains (set: ref HashSet k) (key: ref k) {_: Hash k} {_: Eq k e}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L30)

---

### HashSet.insert

```ante
HashSet.insert (set: mut HashSet k) (key: k) {_: Hash k} {_: Eq k e}: Bool can Panic, e
```

Insert a new element into the HashSet
Returns True if the key is newly inserted
Returns False if the key already existed

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L36)

---

### HashSet.remove

```ante
HashSet.remove (set: mut HashSet k) (key: ref k) {_: Hash k} {_: Eq k e}: Bool can e
```

Remove an element from the HashSet
Returns True if the key existed and was removed
Return False if the key was not present in the HashSet

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L42)

---

### HashSet.extend

```ante
HashSet.extend (set: mut HashSet k) (s: s) {_: Stream s k e} {_: Hash k} {_: Eq k e}: Unit can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L45)

---

### HashSet.retain

```ante
HashSet.retain (set: mut HashSet k) (predicate: fn k [_] -> Bool) {_: Copy k}: Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L49)

---

### HashSet.merge

```ante
HashSet.merge (dst: mut HashSet k) (src: HashSet k) {_: Hash k} {_: Eq k e}: Unit can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L57)

---

### HashSet.keys

```ante
(HashSet.keys: fn (ref (HashSet k)) -> (fn Unit [(ref (HashMap k Unit))] -> Unit can Emit k) is pure) (set: ref (HashSet k))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L60)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## stream_set

```ante
implicit stream_set: Stream (HashSet k) k pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L63)

---

## stream_ref_hashset

```ante
implicit stream_ref_hashset: Stream (ref HashSet k) k pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L70)

---

## print_hashset

```ante
impl print_hashset {_: Display k e}: Display (HashSet k) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashSet.an#L75)

</details>

