+++
title = "Std.Collections.Vec"
categories = ["docs"]
weight = 12
+++

```ante
import Std.Collections.Vec
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an)

---

# Types

---

## Vec

```ante
type Vec t =
    data: Ptr t
    len: Usz
    cap: Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L11)

---

# Functions

---

## empty

```ante
(empty: fn Unit -> Vec _ is pure) ()
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L16)

---

## is_empty

```ante
(is_empty: fn (ref 'v (Vec a)) -> Bool is pure) (v: ref 'v (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L18)

---

## len

```ante
(len: fn (ref 'v (Vec a)) -> Usz is pure) (v: ref 'v (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L20)

---

## capacity

```ante
(capacity: fn (ref 'v (Vec a)) -> Usz is pure) (v: ref 'v (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L22)

---

## of

```ante
of (stream: s) {_: Stream s t e}: Vec t can Panic, e
```

Create a new Vec with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L25)

---

## extend

```ante
extend (vec: mut Vec t) (stream: s) {_: Stream s t e}: Unit can Panic, e, Mutate 'vec
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L30)

---

## reserve

```ante
reserve (v: mut Vec t) (numElems: Usz): Unit can Panic, Mutate 'v
```

Reserve space for `numElems` more elements in `v`. The new slots are uninitialized.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L34)

---

## push

```ante
push (v: mut Vec t) (elem: t): Unit can Panic, Mutate 'v
```

Push an element onto the end of the vector.
Resizes if necessary.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L47)

---

## pop

```ante
pop (v: mut Vec t): Maybe t can Mutate 'v
```

Removes the last element of this vector and returns it.
Returns None if the vector is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L56)

---

## get

```ante
get (v: ref Vec t) (i: Usz): ref! t can Fail
```

Retrieves a reference to the element at the given 0-based index.
Fails if the index is out of bounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L64)

---

## get_unchecked

```ante
get_unchecked (v: ref Vec t) (i: Usz): ref! t
```

An unsafe function to retrieve an element at the given index
without checking if the index is inbounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L71)

---

## remove_index

```ante
remove_index (v: mut Vec t) (idx: Usz): t can Fail, Mutate 'v
```

Remove the element at the given index and return it.
will Fail if the index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L77)

---

## remove_first

```ante
remove_first (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Maybe Usz can Panic, e, Mutate 'v
```

Removes the first instance of the given element from the vector,
returning the index it was found at. Returns `None` if the element was not found.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L90)

---

## remove_indices

```ante
remove_indices (v: mut Vec t) (idxs: Vec Usz): Unit can Fail, Mutate 'v
```

Remove the given indices from the vector
Expects the indices to be in sorted order.
Will Fail if any index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L100)

---

## remove_all

```ante
remove_all (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Usz can Panic, e, Mutate 'v
```

Remove all matching elements from the vector and
return the number of elements removed.
Uses = to determine element equality.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L124)

---

## swap_last

```ante
swap_last (v: mut Vec t) (idx: Usz): Bool can Mutate 'v
```

Remove an element by swapping it with the last element in O(1) time.
Returns true if a swap was performed or false otherwise.
Will not swap if the given index is the index of the last element.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L139)

---

## reverse

```ante
reverse (v: mut Vec t): Unit can Mutate 'v!
```

Reverse the elements of this vector in place.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L147)

---

## swap

```ante
swap (v: mut Vec t) (i: Usz) (j: Usz): Unit can Fail, Mutate 'v!
```

Swap the elements at indices `i` and `j`. Fails if either index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L157)

---

## insert

```ante
insert (v: mut Vec t) (idx: Usz) (elem: t): Unit can Fail, Panic, Mutate 'v
```

Insert `elem` at `idx`, shifting elements at `[idx, len)` one position right.
Fails if `idx > len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L166)

---

## dedup

```ante
dedup (v: mut Vec t) {_: Eq t e} {_: Copy t}: Unit can e, Mutate 'v
```

Remove consecutive runs of equal elements, keeping only the first of each run.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L178)

---

## truncate

```ante
truncate (v: mut Vec t) (new_len: Usz) {_: Drop t e}: Unit can e, Mutate 'v
```

Shrink the vector to at most `new_len` elements, dropping any tail.
Does nothing if `new_len >= v.len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L190)

---

## clear

```ante
clear (v: mut Vec t) {_: Drop t e}: Unit can e, Mutate 'v
```

Remove and drop every element.
After being cleared, a Vec's length will be zero, but its capacity will be unchanged.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L199)

---

## sort_by

```ante
sort_by (v: mut Vec t) (cmp: fn (ref t) (ref t) [env] -> Bool) {_: Drop env pure}: Unit can Mutate 'v!
```

Sort the vector in place using `cmp` to compare elements.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L260)

---

## sort

```ante
sort (v: mut Vec t) {_: Cmp t}: Unit can Mutate 'v!
```

Sort the vector in place using the `Cmp` ordering.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L264)

---

## slice

```ante
slice (v: ref 'v Vec t): Slice 'v! t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L267)

---

## slice_range

```ante
slice_range (v: ref 'v Vec t) (start: Usz) (end: Usz): Slice 'v! t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L270)

---

## slice_from

```ante
slice_from (v: ref 'v Vec t) (start: Usz): Slice 'v! t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L273)

---

## slice_until

```ante
slice_until (v: ref 'v Vec t) (end: Usz): Slice 'v! t can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L276)

---

## windows

```ante
(windows: fn (ref 'v (Vec t)) Usz -> (fn Unit [(ref 'v (Vec t)), Usz] -> Unit can Emit (Slice 'v! t)) is pure) (v: ref 'v (Vec t)) (n: Usz)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L279)

---

## chunks

```ante
(chunks: fn (ref 'v (Vec t)) Usz -> (fn Unit [(ref 'v (Vec t)), Usz] -> Unit can Emit (Slice 'v! t)) is pure) (v: ref 'v (Vec t)) (n: Usz)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L284)

---

## permutations

```ante
(permutations: fn (ref 'v (Vec t)) -> (fn Unit [ref 'v (Vec t)] -> Unit can Emit (Slice 'v! t)) is pure) (v: ref 'v (Vec t))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L292)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_vec

```ante
impl print_vec {p: Display t e}: Display (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L318)

---

## extract_vec

```ante
impl extract_vec: Extract (ref 'v Vec t) Usz (ref 'v! t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L328)

---

## insert_vec

```ante
impl insert_vec {_: Drop t e}: Insert (mut 'v Vec t) Usz t Panic & Mutate 'v! & e
```

Note that this impl is different from `insert`.
insert will insert into a slot, moving the previous element and each
element after to the right. This `Insert` implementation will instead
directly mutate the element at the given index to the new element.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L338)

---

## stream_vec

```ante
impl stream_vec: Stream (Vec a) a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L343)

---

## stream_ref_vec

```ante
impl stream_ref_vec: Stream (ref Vec a) (ref a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L353)

---

## clone_vec

```ante
impl clone_vec {_: Clone t}: Clone (Vec t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L358)

---

## drop_vec

```ante
impl drop_vec {_: Drop t e}: Drop (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L368)

---

## eq_vec

```ante
impl eq_vec {_: Eq t e}: Eq (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L376)

---

## cmp_vec

```ante
impl cmp_vec {_: Cmp t}: Cmp (Vec t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L388)

</details>

