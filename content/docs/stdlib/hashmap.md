+++
title = "Std.Collections.HashMap"
categories = ["docs"]
weight = 7
+++

```ante
import Std.Collections.HashMap
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an)

---

# Types

---

## Entry

```ante
type Entry k v =
    key: k
    value: v
    occupied: Bool
    tombstone: Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L20)

---

# Functions

---

## len

```ante
len (m: ref HashMap k v): Usz
```

Returns the length of this HashMap

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L27)

---

## is_empty

```ante
is_empty (m: ref HashMap k v): Bool
```

Returns true if this HashMap is empty. Equivalent to `map.len () == 0`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L30)

---

## empty

```ante
empty () {hasher: Hash k h}: HashMap k v h
```

Create a new, empty HashMap
This will not allocate until the first entry is inserted.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L34)

---

## of

```ante
of (stream: s) {_: Stream s (k, v) e} {_: Hash k h} {_: Eq k e} {_: Drop k d} {_: Drop v d}: HashMap k v h can Panic, e, d
```

Create a HashMap containing each `k, v` pair from the given stream.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L37)

---

## extend

```ante
extend (map: mut HashMap k v) (stream: s) {_: Stream s (k, v) e} {_: Eq k e} {_: Drop k d} {_: Drop v d}: Unit can Panic, e, d, Mutate 'map
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L42)

---

## clear

```ante
clear (map: mut HashMap k v) {_: Drop k d} {_: Drop v d}: Unit can d, Mutate 'map
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L45)

---

## resize

```ante
resize (map: mut HashMap k v) (new_capacity: Usz) {_: Eq k e}: Unit can Panic, e, Mutate 'map
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L56)

---

## should_resize

```ante
should_resize (map: ref HashMap k v): Bool
```

Should we resize this map when pushing another element?

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L81)

---

## insert

```ante
insert (map: mut HashMap k v) (key: k) (value: v) {_: Eq k e} {_: Drop k d}: Maybe v can Panic, e, d, Mutate 'map
```

Inserts a key-value pair into the map, removing any item that may previously
have been associated with the same key and returning the removed value if there was one.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L119)

---

## contains

```ante
contains (map: ref HashMap k v) (key: ref k) {_: Eq k e}: Bool can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L158)

---

## remove

```ante
remove (map: mut HashMap k v) (key: ref k) {_: Eq k e} {_: Drop k d}: Maybe v can e, d, Mutate 'map
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L161)

---

## keys

```ante
(keys: fn (ref 'm ((error) k v)) -> (fn Unit [(ref 'm ((error) k v))] -> Unit can (error) (ref 'm k)) is pure) (m: ref 'm ((error) k v))
```

Emit a reference to each key

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L213)

---

## values

```ante
(values: fn (ref 'm ((error) k v)) -> (fn Unit [(ref 'm ((error) k v))] -> Unit can (error) (ref 'm v)) is pure) (m: ref 'm ((error) k v))
```

Emit a reference to each value

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L221)

---

## retain

```ante
retain (m: mut HashMap k v) (pred: fn (ref k) (mut v) [env] -> Bool) {_: Drop k d} {_: Drop v d} {_: Drop env d}: Unit can d, Mutate 'm
```

Remove every entry for which `pred key value` returns false.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L247)

---

## merge

```ante
merge (dst: mut HashMap k v h) (src: HashMap k v h) {_: Eq k e} {_: Drop k d} {_: Drop v d}: Unit can Panic, Mutate 'dst, e, d
```

Insert every entry from `src` into `dst`, overwriting on conflict.
Both maps must hash their keys with the same `Hash` impl.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L260)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_hashmap

```ante
impl print_hashmap {_: Display k e} {_: Display v e}: Display (HashMap k v) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L173)

---

## stream_map

```ante
impl stream_map: Stream (HashMap k v) (k, v) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L190)

---

## stream_ref_map

```ante
impl stream_ref_map: Stream (ref 'm HashMap k v) (ref 'm k, ref 'm v) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L203)

---

## insert_hashmap

```ante
impl insert_hashmap {_: Eq k e} {_: Drop k d} {_: Drop v d}: Insert (mut 'm HashMap k v) k v Panic & Mutate 'm & e & d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L266)

---

## clone_hashmap

```ante
impl clone_hashmap {_: Clone k} {_: Clone v}: Clone (HashMap k v)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L271)

---

## drop_entry

```ante
impl drop_entry {_: Drop k d} {_: Drop v d}: Drop (Entry k v) d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L285)

---

## drop_hashmap

```ante
impl drop_hashmap {_: Drop k d} {_: Drop v d}: Drop (HashMap k v h) d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L288)

---

## eq_hashmap

```ante
impl eq_hashmap {_: Eq k e} {_: Eq v e}: Eq (HashMap k v) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/HashMap.an#L298)

</details>

