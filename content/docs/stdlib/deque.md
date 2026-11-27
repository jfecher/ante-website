+++
title = "Std.Collections.Deque"
categories = ["docs"]
weight = 6
+++

```ante
import Std.Collections.Deque
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an)

---

# Types

---

## Deque

```ante
type Deque t =
    data: Ptr t
    head: Usz
    len: Usz
    cap: Usz
```

A double-ended queue implemented as a growable ring buffer.
Pushing and popping from either end is O(1) amortized.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L11)

---

# Functions

---

## empty

```ante
(empty: fn Unit -> Deque _ is pure) ()
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L17)

---

## with_capacity

```ante
with_capacity (cap: Usz): Deque t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L19)

---

## of

```ante
of (stream: s) {_: Stream s t e}: Deque t can Panic, e
```

Create a new Deque with the elements from the given stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L28)

---

## extend

```ante
extend (deque: mut Deque t) (stream: s) {_: Stream s t e}: Unit can Panic, Mutate 'deque, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L33)

---

## is_empty

```ante
(is_empty: fn (ref 'd (Deque t)) -> Bool is pure) (d: ref 'd (Deque t))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L36)

---

## len

```ante
(len: fn (ref 'd (Deque t)) -> Usz is pure) (d: ref 'd (Deque t))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L38)

---

## capacity

```ante
(capacity: fn (ref 'd (Deque t)) -> Usz is pure) (d: ref 'd (Deque t))
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L40)

---

## reserve

```ante
reserve (d: mut Deque t) (additional: Usz): Unit can Panic, Mutate 'd
```

Reserve space for at least `additional` more elements, moving the
elements to the front of a new buffer if it must grow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L52)

---

## push_back

```ante
push_back (d: mut Deque t) (elem: t): Unit can Panic, Mutate 'd
```

Push an element onto the back of the deque

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L76)

---

## push_front

```ante
push_front (d: mut Deque t) (elem: t): Unit can Panic, Mutate 'd
```

Push an element onto the front of the deque

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L83)

---

## pop_back

```ante
pop_back (d: mut Deque t): Maybe t can Mutate 'd
```

Remove and return the last element, returning None if the deque was empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L91)

---

## pop_front

```ante
pop_front (d: mut Deque t): Maybe t can Mutate 'd
```

Remove and return the first element, returning None if the deque was empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L98)

---

## get

```ante
get (d: ref Deque t) (i: Usz): ref! t can Fail
```

Retrieves a reference to the element at the given 0-based index from the front.
Fails if the index is out of bounds.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L108)

---

## front

```ante
front (d: ref Deque t): ref! t can Fail
```

A reference to the first element. Fails if the deque is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L113)

---

## back

```ante
back (d: ref Deque t): ref! t can Fail
```

A reference to the last element. Fails if the deque is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L116)

---

## clear

```ante
clear (d: mut Deque t) {_: Drop t e}: Unit can e, Mutate 'd
```

Remove and drop every element. The capacity is unchanged.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L122)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_deque

```ante
impl print_deque {_: Display t e}: Display (Deque t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L128)

---

## extract_deque

```ante
impl extract_deque: Extract (ref 'd Deque t) Usz (ref 'd! t) Panic
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L137)

---

## insert_deque

```ante
impl insert_deque {_: Drop t e}: Insert (mut 'd Deque t) Usz t Panic & Mutate 'd! & e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L143)

---

## stream_deque

```ante
impl stream_deque: Stream (Deque a) a pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L148)

---

## stream_ref_deque

```ante
impl stream_ref_deque: Stream (ref Deque a) (ref a) pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L158)

---

## eq_deque

```ante
impl eq_deque {_: Eq t e}: Eq (Deque t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L163)

---

## clone_deque

```ante
impl clone_deque {_: Clone t}: Clone (Deque t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L174)

---

## drop_deque

```ante
impl drop_deque {_: Drop t e}: Drop (Deque t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Collections/Deque.an#L183)

</details>

