+++
title = "Std.Vec"
categories = ["docs"]
weight = 20
+++

```ante
import Std.Vec
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an)

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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L10)

---

### Vec.empty

```ante
(Vec.empty: fn Unit -> Vec _ is pure) ()
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L15)

---

### Vec.is_empty

```ante
(Vec.is_empty: fn (ref (Vec a)) -> Bool is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L17)

---

### Vec.len

```ante
(Vec.len: fn (ref (Vec a)) -> Usz is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L19)

---

### Vec.capacity

```ante
(Vec.capacity: fn (ref (Vec a)) -> Usz is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L21)

---

### Vec.of

```ante
Vec.of (s: s) {_: Stream s t e}: Vec t can Panic, e
```

Create a new Vec with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L24)

---

### Vec.extend

```ante
Vec.extend (vec: mut Vec t) (s: s) {_: Stream s t e}: Unit can Panic, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L29)

---

### Vec.reserve

```ante
Vec.reserve (v: mut Vec t) (numElems: Usz): Unit can Panic
```

Reserve space for `numElems` more elements in `v`. The new slots are uninitialized.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L33)

---

### Vec.push

```ante
Vec.push (v: mut Vec t) (elem: t): Unit can Panic
```

Push an element onto the end of the vector.
Resizes if necessary.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L46)

---

### Vec.pop

```ante
Vec.pop (v: mut Vec t): Maybe t can Fs
```

Removes the last element of this vector and returns it.
Returns None if the vector is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L55)

---

### Vec.get

```ante
Vec.get (v: imm Vec t) (i: Usz): imm t can Fail
```

Retrieves the element at the given 0-based index.
Fails if the index is out of bounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L63)

---

### Vec.get_mut

```ante
Vec.get_mut (v: uniq Vec t) (i: Usz): uniq t can Fail
```

Retrieves a mutable reference to the element at the given 0-based index.
Fails if the index is out of bounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L70)

---

### Vec.get_unchecked

```ante
Vec.get_unchecked (v: imm Vec t) (i: Usz): imm t
```

An unsafe function to retrieve an element at the given index
without checking if the index is inbounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L77)

---

### Vec.get_mut_unchecked

```ante
Vec.get_mut_unchecked (v: uniq Vec t) (i: Usz): uniq t
```

An unsafe function to retrieve a mutable element at the given index
without checking if the index is inbounds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L83)

---

### Vec.remove_index

```ante
Vec.remove_index (v: mut Vec t) (idx: Usz): t can Fail
```

Remove the element at the given index and return it.
will Fail if the index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L89)

---

### Vec.remove_first

```ante
Vec.remove_first (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Maybe Usz can Panic, e
```

Removes the first instance of the given element from the vector,
returning the index it was found at. Returns `None` if the element was not found.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L102)

---

### Vec.remove_indices

```ante
Vec.remove_indices (v: mut Vec t) (idxs: Vec Usz): Unit can Fail
```

Remove the given indices from the vector
Expects the indices to be in sorted order.
Will Fail if any index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L112)

---

### Vec.remove_all

```ante
Vec.remove_all (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Usz can Panic, e
```

Remove all matching elements from the vector and
return the number of elements removed.
Uses = to determine element equality.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L136)

---

### Vec.swap_last

```ante
Vec.swap_last (v: mut Vec t) (idx: Usz): Bool can Fs
```

Remove an element by swapping it with the last element in O(1) time.
Returns true if a swap was performed or false otherwise.
Will not swap if the given index is the index of the last element.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L150)

---

### Vec.reverse

```ante
Vec.reverse (v: mut Vec t): Unit can Fs
```

Reverse the elements of this vector in place.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L158)

---

### Vec.swap

```ante
Vec.swap (v: mut Vec t) (i: Usz) (j: Usz): Unit can Fail, Fs
```

Swap the elements at indices `i` and `j`. Fails if either index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L168)

---

### Vec.insert

```ante
Vec.insert (v: mut Vec t) (idx: Usz) (elem: t): Unit can Fail, Panic
```

Insert `elem` at `idx`, shifting elements at `[idx, len)` one position right.
Fails if `idx > len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L177)

---

### Vec.dedup

```ante
Vec.dedup (v: mut Vec t) {_: Eq t e} {_: Copy t}: Unit can Fs, e
```

Remove consecutive runs of equal elements, keeping only the first of each run.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L189)

---

### Vec.truncate

```ante
Vec.truncate (v: mut Vec t) (new_len: Usz) {_: Drop t e}: Unit can e
```

Shrink the vector to at most `new_len` elements, dropping any tail.
Does nothing if `new_len >= v.len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L201)

---

### Vec.clear

```ante
Vec.clear (v: mut Vec t) {_: Drop t e}: Unit can e
```

Remove and drop every element.
After being cleared, a Vec's length will be zero, but its capacity will be unchanged.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L210)

---

### Vec.sort_by

```ante
Vec.sort_by (v: mut Vec t) (cmp: fn (ref t) (ref t) [_] -> Bool): Unit
```

Sort the vector in place using `cmp` to compare elements.
Insertion sort: stable, O(n^2) worst case. Good enough for small vectors.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L215)

---

### Vec.sort

```ante
Vec.sort (v: mut Vec t) {_: Cmp t}: Unit can Fs
```

Sort the vector in place using the `Cmp` ordering.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L228)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_vec

```ante
impl print_vec {p: Display t e}: Display (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L232)

---

## extract_vec_move

```ante
impl extract_vec_move: Extract (Vec t) Usz t Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L243)

---

## extract_vec

```ante
impl extract_vec: Extract (ref Vec t) Usz (ref t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L249)

---

## insert_vec

```ante
impl insert_vec: Insert (mut Vec t) Usz t Panic
```

Note that this impl is different from `Vec.insert`.
Vec.insert will insert into a slot, moving the previous element and each
element after to the right. This `Insert` implementation will instead
directly mutate the element at the given index to the new element.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L259)

---

## stream_vec

```ante
impl stream_vec: Stream (Vec a) a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L265)

---

## stream_imm_vec

```ante
impl stream_imm_vec: Stream (imm Vec a) (imm a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L270)

---

## drop_vec

```ante
impl drop_vec {_: Drop t e}: Drop (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L275)

---

## eq_vec

```ante
impl eq_vec {_: Eq t e}: Eq (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Vec.an#L283)

</details>

