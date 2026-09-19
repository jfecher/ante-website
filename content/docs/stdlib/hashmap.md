+++
title = "Std.HashMap"
categories = ["docs"]
weight = 7
+++

```ante
import Std.HashMap
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an)

---

# Types

---

## HashMap

```ante
type HashMap k v =
    len: Usz
    capacity: Usz
    entries: Ptr (Entry k v)
```

A linear-scan mutable HashMap using a resize factor of 2.0

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L12)

---

### HashMap.len

```ante
HashMap.len (m: ref HashMap k v): Usz
```

Returns the length of this HashMap

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L24)

---

### HashMap.is_empty

```ante
HashMap.is_empty (m: ref HashMap k v): Bool
```

Returns true if this HashMap is empty. Equivalent to `map.len () == 0`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L27)

---

### HashMap.empty

```ante
(HashMap.empty: fn Unit -> HashMap _ _ is pure) ()
```

Create a new, empty HashMap
This will not allocate until the first entry is inserted.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L31)

---

### HashMap.of

```ante
HashMap.of (s: s) {_: Stream s (k, v) e} {_: Hash k} {_: Eq k e}: HashMap k v can Panic, e
```

Create a HashMap containing each `k, v` pair from the given stream.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L34)

---

### HashMap.extend

```ante
HashMap.extend (map: mut HashMap k v) (s: s) {_: Stream s (k, v) e} {_: Hash k} {_: Eq k e}: Unit can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L39)

---

### HashMap.clear

```ante
HashMap.clear (map: mut HashMap k v): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L42)

---

### HashMap.resize

```ante
HashMap.resize (map: mut HashMap k v) (new_capacity: Usz) {_: Hash k} {_: Eq k e}: Unit can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L50)

---

### HashMap.should_resize

```ante
HashMap.should_resize (map: ref HashMap k v): Bool
```

Should we resize this map when pushing another element?

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L68)

---

### HashMap.insert

```ante
HashMap.insert (map: mut HashMap k v) (key: k) (value: v) {_: Hash k} {_: Eq k e}: Maybe v can Panic, e
```

Inserts a key-value pair into the map, removing any item that may previously
have been associated with the same key and returning the removed value if there was one.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L74)

---

### HashMap.get_entry

```ante
HashMap.get_entry (map: ref 'm HashMap k v) (key: ref k) {_: Hash k} {eq: Eq k e}: Maybe (ref 'm Entry k v) can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L126)

---

### HashMap.get

```ante
HashMap.get (map: ref 'm HashMap k v) (key: ref k) {_: Hash k} {_: Eq k e}: ref 'm v can Fail, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L159)

---

### HashMap.contains

```ante
HashMap.contains (map: ref HashMap k v) (key: ref k) {_: Hash k} {_: Eq k e}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L164)

---

### HashMap.remove

```ante
HashMap.remove (map: mut HashMap k v) (key: ref k) {_: Hash k} {_: Eq k e}: Maybe v can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L167)

---

### HashMap.keys

```ante
(HashMap.keys: fn (ref (HashMap k v)) -> (fn Unit [(ref (HashMap k v))] -> Unit can Emit k) is pure) (m: ref (HashMap k v))
```

Emit each key. Bit-copies the key; safe for `Copy` keys.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L201)

---

### HashMap.values

```ante
(HashMap.values: fn (ref (HashMap k v)) -> (fn Unit [(ref (HashMap k v))] -> Unit can Emit v) is pure) (m: ref (HashMap k v))
```

Emit each value. Bit-copies the value; safe for `Copy` values.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L207)

---

### HashMap.get_or_insert

```ante
HashMap.get_or_insert (m: mut HashMap k v) (key: k) (default: v) {_: Hash k} {_: Eq k e} {_: Copy k}: ref v can Panic, e
```

Return the existing value at `key`, or insert `default` and return it.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L213)

---

### HashMap.get_or_insert_with

```ante
HashMap.get_or_insert_with (m: mut HashMap k v) (key: k) (mk: fn Unit [_] -> v) {_: Hash k} {_: Eq k e} {_: Copy k}: ref v can Panic, e
```

Same as `get_or_insert` but builds the default lazily.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L219)

---

### HashMap.retain

```ante
HashMap.retain (m: mut HashMap k v) (pred: fn k v [_] -> Bool) {_: Copy k} {_: Copy v}: Unit
```

Remove every entry for which `pred key value` returns false.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L225)

---

### HashMap.merge

```ante
HashMap.merge (dst: mut HashMap k v) (src: HashMap k v) {_: Hash k} {_: Eq k e}: Unit can Panic, e
```

Insert every entry from `src` into `dst`, overwriting on conflict.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L236)

---

## Entry

```ante
type Entry k v =
    key: k
    value: v
    occupied: Bool
    tombstone: Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L17)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_hashmap

```ante
impl print_hashmap {_: Display k e} {_: Display v e}: Display (HashMap k v) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L176)

---

## stream_map

```ante
implicit stream_map: Stream (HashMap k v) (k, v) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/HashMap.an#L193)

</details>

