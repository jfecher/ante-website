+++
title = "Std.Collections.SeqMap"
categories = ["docs"]
weight = 11
+++

```ante
import Std.Collections.SeqMap
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an)

---

# Types

---

## SeqMap

```ante
type SeqMap k v (h = _) =
    hasher: Hash k h
    log_len: U32
    count: U32
    data: Ptr (Data k v)
```

A persistent hash map based on Seq.
Performance is meant to be comparable to a mutable HashMap.

Common operations:
- insert, remove, get: O(1) amortized but can be O(N) with worst-case sharing patterns.
- clone: O(1)

Internally, a SeqMap is a Seq-like append-only log of entries. Inserts and removes
are each recorded by adding an event to the end of the log.

Each SeqMap remembers how much of the log it can see, which lets many SeqMaps share the
same log. Each SeqMap never reads past its own length, so a newer SeqMap can keep adding
to the shared log without disturbing any older ones. An older SeqMap simply skips any
versions of a key which were added after it.

A write only needs to copy when the log is out of room, or when the SeqMap being written
to would overwrite later entries already used by other SeqMaps. In the second case
its entries are compacted into a new log of its own.

This can be exploited to force an O(N) copy on every write by cloning at every step and
writing to both the original and the clone:
```ante
var map = empty ()
while true do
    other = clone map      // map and other now share the same log
    map := insert map 0 0  // add to the end of the shared log
    insert other 0 1       // other is now behind the end of the log, forcing a copy
```
This scenario should be rare. A more common usage would be for each clone to be a snapshot
of the map at a point in time, in which case writes to the original remain O(1) amortized.
If you need a persistent map type, SeqMap should still be a good default, but always
benchmark if performance is important.

Note that SeqMap is not thread-safe

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L45)

---

# Functions

---

## len

```ante
len (map: ref SeqMap k v): Usz
```

The number of entries in the map

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L184)

---

## is_empty

```ante
is_empty (map: ref SeqMap k v): Bool
```

True if there are no entries in this map

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L187)

---

## empty

```ante
empty () {hasher: Hash k h}: SeqMap k v h
```

Return a fresh, empty SeqMap

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L190)

---

## of

```ante
of (stream: s) {_: Stream s (k, v) e} {_: Hash k h} {_: Eq k e} {_: Drop k d} {_: Drop v d}: SeqMap k v h can e, d
```

Create a SeqMap with the element of the given stream.
Any repeated keys in the stream will overwrite their previous values.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L195)

---

## insert

```ante
insert (map: SeqMap k v h) (key: k) (value: v) {_: Eq k e} {_: Drop k d} {_: Drop v d}: SeqMap k v h can e, d
```

Insert a new key, value pair in the map. This will drop the previous entry of the
same key only if no other shared map is still holding onto it.

Runs in roughly O(1) amortized time, though can be O(N) over the shared chain with
worst-case sharing patterns.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L371)

---

## remove

```ante
remove (map: SeqMap k v h) (key: ref k) {_: Eq k e} {_: Drop k d} {_: Drop v d}: SeqMap k v h can e, d
```

Removes the entry with the given key from the map, if it exists. This will drop the
removed entry only if no other shared map is still holding onto it.

Runs in roughly O(1) amortized time, though can be O(N) over the shared chain with
worst-case sharing patterns.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L400)

---

## get

```ante
get (map: read SeqMap k v h) (key: ref k) {_: Eq k e}: Maybe (read 'map! v) can e
```

Retrieves the entry with the given key from the map, if it exists.

Runs in roughly O(1) time, though can be O(N) over the shared chain with
worst-case sharing patterns.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L427)

---

## contains

```ante
contains (map: ref SeqMap k v h) (key: ref k) {_: Eq k e}: Bool can e
```

True if the map contains the given key

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L453)

---

## keys

```ante
(keys: fn (ref 'm (SeqMap k v)) -> (once fn Unit [(once fn Unit [(once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((Drop (ref 'm! (Entry k v)) pure Unit), ((fn (ref '#name-not-in-context (ref 'm! (Entry k v))) [ref 'm (SeqMap k v)] -> Bool is pure), (Drop (ref 'm (SeqMap k v)) pure Unit))))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((Drop (ref 'm! (Entry k v)) pure Unit), ((fn (ref '#name-not-in-context (ref 'm! (Entry k v))) [ref 'm (SeqMap k v)] -> Bool is pure), (Drop (ref 'm (SeqMap k v)) pure Unit))))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((fn (ref 'm! (Entry k v)) -> ref 'm!.key k is pure), (Drop NoClosureEnv pure Unit)))] -> Unit can Emit (ref 'm!.key k)) is pure) (m: ref 'm (SeqMap k v))
```

Stream references to the keys of this map

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L464)

---

## values

```ante
(values: fn (ref 'm (SeqMap k v)) -> (once fn Unit [(once fn Unit [(once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((Drop (ref 'm! (Entry k v)) pure Unit), ((fn (ref '#name-not-in-context (ref 'm! (Entry k v))) [ref 'm (SeqMap k v)] -> Bool is pure), (Drop (ref 'm (SeqMap k v)) pure Unit))))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))), ((Stream (once fn Unit [(Range U32), ((Stream (Range U32) U32 pure (stream_range (Num U32 add_u32 sub_u32 mul_u32 div_u32 eq_u32 cmp_u32 num_u32) (Copy U32 copy_u32))), ((fn U32 [ref 'm (SeqMap k v)] -> ref 'm! (Entry k v) is pure), (Drop (ref 'm (SeqMap k v)) pure Unit)))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((Drop (ref 'm! (Entry k v)) pure Unit), ((fn (ref '#name-not-in-context (ref 'm! (Entry k v))) [ref 'm (SeqMap k v)] -> Bool is pure), (Drop (ref 'm (SeqMap k v)) pure Unit))))] -> Unit can Emit (ref 'm! (Entry k v))) (ref 'm! (Entry k v)) pure stream_once_fn), ((fn (ref 'm! (Entry k v)) -> ref 'm!.value v is pure), (Drop NoClosureEnv pure Unit)))] -> Unit can Emit (ref 'm!.value v)) is pure) (m: ref 'm (SeqMap k v))
```

Stream references to the values of this map

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L468)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## extract_seqmap

```ante
impl extract_seqmap {_: Eq k e}: Extract (ref 'm SeqMap k v) (ref k) (ref (read 'm!) v) Panic & e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L446)

---

## stream_seqmap

```ante
impl stream_seqmap: Stream (ref 'm SeqMap k v) (ref 'm! k, ref 'm! v) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L471)

---

## print_seqmap

```ante
impl print_seqmap {_: Display k e} {_: Display v e}: Display (SeqMap k v) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L478)

---

## eq_seqmap

```ante
impl eq_seqmap {_: Eq k e} {_: Eq v e}: Eq (SeqMap k v) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L488)

---

## clone_seqmap

```ante
impl clone_seqmap: Clone (SeqMap k v)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L493)

---

## drop_seqmap

```ante
impl drop_seqmap {_: Drop k e} {_: Drop v e}: Drop (SeqMap k v h) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/SeqMap.an#L501)

</details>

