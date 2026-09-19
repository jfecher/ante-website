+++
title = "Std.Seq"
categories = ["docs"]
weight = 13
+++

```ante
import Std.Seq
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an)

---

# Types

---

## Seq

```ante
type Seq t =
    len: U32
    data: Ptr (Data t)
```

A persistent, contiguous, and growable sequence of elements.
Performance is meant to be comparable to a mutable Vec.

Common operations:
- push: O(1) amortized but can be O(N) with worst-case sharing patterns.
- pop: O(1)
- get: O(1)
- clone: O(1)

Internally, each Seq holds its length as well as a Data object shared by potentially
many Seq objects. Each Data object holds the furthest length it has been pushed to,
its capacity, its reference count, and the inline array of elements. 

Many Seqs can share the same data even after the data is pushed to. When pushing an element,
we can push without forking if:
- The underlying array has capacity for more elements and
- The inner reference count is 1 or
- The index we're pushing to is greater than the largest index previously written to the shared data

The last point is the basis for the Seq data type. As long as each Seq stores its length
individually and does not read past that point, we can safely push past it without reallocating.

If there is not enough capacity in the Seq or the index written to has been written to before
and our reference count is not one, we will need to reallocate (if rc is 1) or fork to a new
array (if rc > 1). When this happens, the reference count becomes one again.

When forking the array, we memcpy each element and store a reference to the previous Seq before the fork,
keeping track of the length at the fork point. The parent's alias RC is also incremented, letting it
know there is one more fork referencing the same data. This removes the need to Clone each element.
Note that when a fork happens, elements are still stored inline, just as a bitwise copy. Links to parent
Seqs are only ever followed on Drop.

We can exploit the above to force push to re-allocate on each push, making it O(N) due to copying.
Since the rc becomes one after each copy, its not enough to reuse a Seq and one clone, we must clone
at every step and push to both the original and the clone to overwrite the same element in both Seqs
at every step, e.g:
```ante
var seq = Seq.empty ()
while true do
    other = clone seq // clone seq forcing both this and seq to be shared
    seq = seq.push 0  // push
    other.push 1      // then immediately overwrite the element, forcing a fork

// Or similarly:
seq = Seq.empty ()
seq_view := clone seq
seq_user := seq.push 0
while true do
    seq_clone = clone seq_view  // clone seq forcing both this and seq to be shared
    seq_clone.push 1            // then immediately overwrite the element, forcing a fork
```
This scenario should be rare but if optimal sharing is required here, a linked-list
can be used instead. A more common usage would be for each clone to be a snapshot of the sequence
at a point in time, or for the clone to be reused - in either of these scenarios, the original
sequence would still be O(1) amortized when pushed to.

Note that Seq is not thread-safe

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L63)

---

### Seq.empty

```ante
Seq.empty (): Seq t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L83)

---

### Seq.of

```ante
Seq.of (s: s) {_: Stream s t e} {_: Drop t e}: Seq t can e
```

Create a Seq holding each item from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L87)

---

### Seq.with_capacity

```ante
Seq.with_capacity (capacity: Usz): Seq t
```

Create a Seq with the given initial capacity

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L92)

---

### Seq.push

```ante
Seq.push (seq: Seq t) (elem: t) {_: Drop t e}: Seq t can e
```

Push an element to this sequence, returning a new sequence.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L109)

---

### Seq.pop

```ante
Seq.pop (var seq: Seq t) {_: Copy t}: Seq t, Maybe t
```

Return a new `Seq t` without the last element.
Returns the popped element if this seq was non-empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L169)

---

### Seq.remove_last

```ante
Seq.remove_last (var seq: Seq t): Seq t
```

Same as `pop` but does not return the last element, and thus
does not require a `Copy` constraint

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L179)

---

### Seq.get_copied

```ante
Seq.get_copied (seq: ref Seq t) (index: U32) {_: Copy t}: Maybe t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L184)

---

### Seq.get

```ante
Seq.get (seq: ref Seq t) (index: U32): Maybe (ref t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L189)

---

### Seq.iter

```ante
Seq.iter (seq: ref Seq t) (f: fn (ref t) [_] -> Unit): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L195)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_seq

```ante
impl print_seq {p: Display t e} {_: Copy t}: Display (Seq t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L206)

---

## clone_seq

```ante
implicit clone_seq: Clone (Seq t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L216)

---

## drop_seq

```ante
impl drop_seq {_: Drop t e}: Drop (Seq t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L224)

---

## stream_seq

```ante
implicit stream_seq: Stream (Seq a) (ref a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Seq.an#L275)

</details>

