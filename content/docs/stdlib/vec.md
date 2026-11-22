+++
title = "Std.Collections.Vec"
categories = ["docs"]
weight = 11
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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L12)

---

# Functions

---

## empty

```ante
(empty: fn Unit -> Vec _ is pure) ()
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L17)

---

## is_empty

```ante
(is_empty: fn (ref (Vec a)) -> _ is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L19)

---

## len

```ante
(len: fn (ref (Vec a)) -> Usz is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L21)

---

## capacity

```ante
(capacity: fn (ref (Vec a)) -> Usz is pure) (v: ref (Vec a))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L23)

---

## of

```ante
of (stream: s) {_: Stream s t e}: Vec t can Panic, e
```

Create a new Vec with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L26)

---

## extend

```ante
extend (vec: mut Vec t) (stream: s) {_: Stream s t e}: Unit can Panic, e, Mutate 'vec
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L31)

---

## reserve

```ante
reserve (v: mut Vec t) (numElems: Usz): Unit can Panic, Mutate 'v
```

Reserve space for `numElems` more elements in `v`. The new slots are uninitialized.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L35)

---

## push

```ante
push (v: mut Vec t) (elem: t): Unit can Panic, Mutate 'v
```

Push an element onto the end of the vector.
Resizes if necessary.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L48)

---

## pop

```ante
pop (v: mut Vec t): Maybe t can Mutate 'v
```

Removes the last element of this vector and returns it.
Returns None if the vector is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L57)

---

## remove_index

```ante
remove_index (v: mut Vec t) (idx: Usz): t can Fail, Mutate 'v
```

Remove the element at the given index and return it.
will Fail if the index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L78)

---

## remove_first

```ante
remove_first (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Maybe Usz can Panic, e, Mutate 'v
```

Removes the first instance of the given element from the vector,
returning the index it was found at. Returns `None` if the element was not found.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L91)

---

## remove_indices

```ante
remove_indices (v: mut Vec t) (idxs: Vec Usz): Unit can Fail, Mutate 'v
```

Remove the given indices from the vector
Expects the indices to be in sorted order.
Will Fail if any index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L101)

---

## remove_all

```ante
remove_all (v: mut Vec t) (elem: t) {_: Eq t e} {_: Copy t}: Usz can Panic, e, Mutate 'v
```

Remove all matching elements from the vector and
return the number of elements removed.
Uses = to determine element equality.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L125)

---

## swap_last

```ante
swap_last (v: mut Vec t) (idx: Usz): Bool can Mutate 'v
```

Remove an element by swapping it with the last element in O(1) time.
Returns true if a swap was performed or false otherwise.
Will not swap if the given index is the index of the last element.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L140)

---

## insert

```ante
insert (v: mut Vec t) (idx: Usz) (elem: t): Unit can Fail, Panic, Mutate 'v
```

Insert `elem` at `idx`, shifting elements at `[idx, len)` one position right.
Fails if `idx > len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L167)

---

## dedup

```ante
dedup (v: mut Vec t) {_: Eq t e} {_: Copy t}: Unit can e, Mutate 'v
```

Remove consecutive runs of equal elements, keeping only the first of each run.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L179)

---

## truncate

```ante
truncate (v: mut Vec t) (new_len: Usz) {_: Drop t e}: Unit can e, Mutate 'v
```

Shrink the vector to at most `new_len` elements, dropping any tail.
Does nothing if `new_len >= v.len`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L191)

---

## clear

```ante
clear (v: mut Vec t) {_: Drop t e}: Unit can e, Mutate 'v
```

Remove and drop every element.
After being cleared, a Vec's length will be zero, but its capacity will be unchanged.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L200)

---

## windows

```ante
(windows: fn (ref 'v (Vec t)) Usz -> _ is pure) (v: ref 'v (Vec t)) (n: Usz)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L280)

---

## chunks

```ante
(chunks: fn (ref 'v (Vec t)) Usz -> _ is pure) (v: ref 'v (Vec t)) (n: Usz)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L285)

---

## permutations

```ante
(permutations: fn (ref 'v (Vec t)) -> _ is pure) (v: ref 'v (Vec t))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L293)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_vec

```ante
impl print_vec {p: Display t e}: Display (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L319)

---

## stream_vec

```ante
impl stream_vec: Stream (Vec a) a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L344)

---

## stream_ref_vec

```ante
impl stream_ref_vec: Stream (ref Vec a) (ref a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L354)

---

## clone_vec

```ante
impl clone_vec {_: Clone t}: Clone (Vec t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L359)

---

## drop_vec

```ante
impl drop_vec {_: Drop t e}: Drop (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L369)

---

## eq_vec

```ante
impl eq_vec {_: Eq t e}: Eq (Vec t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L377)

---

## cmp_vec

```ante
impl cmp_vec {_: Cmp t}: Cmp (Vec t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Vec.an#L389)

</details>

