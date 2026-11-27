+++
title = "Std.Collections.Heap"
categories = ["docs"]
weight = 9
+++

```ante
import Std.Collections.Heap
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an)

---

# Types

---

## MaxHeap

```ante
type MaxHeap t (cmp = _) =
    cmp: Cmp t cmp
    data: Vec t
```

A priority queue where elements are popped from largest to smallest.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L9)

---

## MinHeap

```ante
type MinHeap t (cmp = _) = MaxHeap t (Std.Num.cmp_reverse (Cmp t cmp))
```

A priority queue where elements are popped from smallest to largest.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L14)

---

# Functions

---

## empty_maxheap

```ante
empty_maxheap {cmp: Cmp t c}: MaxHeap t c
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L16)

---

## empty_minheap

```ante
empty_minheap: fn {_} -> MinHeap _ _
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L18)

---

## maxheap_with_capacity

```ante
maxheap_with_capacity (capacity: Usz) {cmp: Cmp t c}: MaxHeap t c can Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L20)

---

## minheap_with_capacity

```ante
minheap_with_capacity: fn _ {_} -> MinHeap _ _
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L25)

---

## maxheap_of

```ante
maxheap_of (stream: s) {cmp: Cmp t c} {_: Stream s t e}: MaxHeap t c can Panic, e
```

Create a new MaxHeap with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L28)

---

## minheap_of

```ante
minheap_of: fn _ {_} {_} -> MinHeap t c
```

Create a new MinHeap with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L34)

---

## extend

```ante
extend (heap: mut MaxHeap t) (stream: s) {_: Stream s t e}: Unit can Panic, e, Mutate 'heap
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L36)

---

## is_empty

```ante
is_empty (heap: ref MaxHeap t): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L39)

---

## len

```ante
len (heap: ref MaxHeap t): Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L41)

---

## push

```ante
push (heap: mut MaxHeap t) (elem: t): Unit can Panic, Mutate 'heap
```

Push an element onto the heap in O(log n) time

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L81)

---

## pop

```ante
pop (heap: mut MaxHeap t): Maybe t can Mutate 'heap
```

Remove and return the greatest element in O(log n) time.
Returns None if the heap is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L87)

---

## peek

```ante
peek (heap: ref MaxHeap t): ref t can Fail
```

A reference to the greatest element. Fails if the heap is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L96)

---

## clear

```ante
clear (heap: mut MaxHeap t) {_: Drop t e}: Unit can e, Mutate 'heap
```

Remove and drop every element

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L101)

---

## into_vec

```ante
into_vec (heap: MaxHeap t): Vec t
```

The heap's elements in an unspecified order. Does not allocate.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L105)

---

## into_sorted_vec

```ante
into_sorted_vec (heap: MaxHeap t): Vec t
```

The heap's elements sorted in ascending order of the heap's `Cmp` impl

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L108)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_heap

```ante
impl print_heap {_: Display t e}: Display (MaxHeap t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L118)

---

## stream_heap

```ante
impl stream_heap: Stream (MaxHeap a) a pure
```

Streams elements in an unspecified order

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L122)

---

## stream_ref_heap

```ante
impl stream_ref_heap: Stream (ref MaxHeap a) (ref a) pure
```

Streams elements in an unspecified order

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L126)

---

## clone_heap

```ante
impl clone_heap {_: Clone t}: Clone (MaxHeap t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L129)

---

## drop_heap

```ante
impl drop_heap {_: Drop t e}: Drop (MaxHeap t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Heap.an#L132)

</details>

