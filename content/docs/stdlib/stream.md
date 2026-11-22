+++
title = "Std.Stream"
categories = ["docs"]
weight = 25
+++

```ante
import Std.Stream
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an)

---

# Traits

---

## Stream

```ante
trait Stream t a (e: effect) =
    stream: fn t -> Unit can Emit a, e
```

Stream the contents of `t`, emitting each element via the `Emit a` effect

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L16)

---

# Effects

---

## Emit

```ante
effect Emit a =
    emit: fn a -> Unit
```

Emit a single item of type `a`. Another name for this is `Yield`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L5)

---

## Loop

```ante
effect Loop =
```

Common control-flow effects for looping
- break: ends the loop early
- continue: ends the current iteration of the loop early

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L11)

---

# Functions

---

## iter

```ante
iter (stream: s) {_: Stream s a e} (f: fn a [env] -> Unit can e2) {_: Drop env e2}: Unit can e, e2
```

Consumes the given stream, applying `f` to each element

E.g. `iter (iota 5) print` will print `01234`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L49)

---

## map

```ante
(map: fn s {Stream s a e} (fn a [env] -> b can e2) {Drop env e2} -> (fn Unit [s, (Stream s a e), (fn a [env] -> b can e2)] -> Unit can Emit b, e, e2) is pure) (stream: s) {(_: Stream s a e)} (f: fn a [env] -> b can e2) {(_: Drop env e2)}
```

Applies `f` to each element from the stream, re-emitting each result.

Given `a1, a2, .., aN`, emit `f a1, f a2, .., f aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L88)

---

## filter

```ante
(filter: fn s {Stream s a e} {Drop a d} (fn (ref 'a a) [env] -> Bool can $effect) {Drop env d} -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [env] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (stream: s) {(_: Stream s a e)} {(_: Drop a d)} (f: fn (ref 'a a) [env] -> Bool can $effect) {(_: Drop env d)}
```

Re-emits only the elements from the original stream for which `f elem` is true

E.g. `filter (iota 5) (_ > 2)` will emit `3` and `4`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L97)

---

## filter_map

```ante
(filter_map: fn s {Stream s a e} (fn a [env] -> Maybe b can e2) {Drop env e2} -> (fn Unit [s, (Stream s a e), (fn a [env] -> Maybe b can e2)] -> Unit can Emit b, e, e2) is pure) (stream: s) {(_: Stream s a e)} (f: fn a [env] -> Maybe b can e2) {(_: Drop env e2)}
```

Performs a combined map and filter opereration, applying `f` to each element in
the stream, filtering out any elements for which `None` is returned, leaving only
the `Some` elements.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L106)

---

## enumerate

```ante
(enumerate: fn s {Stream s a e} -> (fn Unit [s, (Stream s a e)] -> Unit can Emit (Usz, a), e) is pure) (stream: s) {(_: Stream s a e)}
```

Given `a1, a2, .., aN`, emit `(0, a1), (1, a2), .., (N-1, aN)`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L115)

---

## foldl

```ante
foldl (stream: s) {_: Stream s b e} (initial: a) (f: fn a b [env] -> a can e) {_: Drop env e}: a can e
```

Given `a1, a2, .., aN` and an initial value `initial`, return `(f (.. (f (f initial a1) a2) ..) aN)`

Unlike `foldr`, `foldl` is tail-resumptive and thus more efficient. If `f` is commutative, prefer
`foldl` over `foldr`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L127)

---

## foldr

```ante
foldr (stream: s) {_: Stream s a e} (initial: b) (f: fn a b [env] -> b can e) {_: Drop env e}: b can e
```

Given `a1, a2, .., aN` and an initial value `initial`, return `f a1 (f a2 (.. (f aN initial)))`

Unlike `foldl`, `foldr` is not tail-resumptive (the initial `f a1 _` call does not finish
until the rest of the stream has been consumed) which limits performance. Prefer `foldl`
when `f` is commutative.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L142)

---

## reduce

```ante
reduce (stream: s) {_: Stream s a e} (f: fn a a [env] -> a can e) {_: Drop env e}: a can Fail, e
```

Similar to `foldl` but uses the first element as the initial value.

Given `a1, a2, a3, .., aN`, return `f (.. (f (f a1 a2) a3) ..) aN`

This function is tail-resumptive. Fails if the stream is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L153)

---

## map2

```ante
(map2: fn s1 s2 {Stream s1 a e1} {Stream s2 b e2} {Copy a} {Copy b} (fn a b [env] -> c can e3) {Drop env e3} -> (fn Unit [s1, s2, (Copy a), (Copy b), (fn a b [env] -> c can e3)] -> Unit can Emit c, Panic, e3) is pure) (stream1: s1) (stream2: s2) {(_: Stream s1 a e1)} {(_: Stream s2 b e2)} {(_: Copy a)} {(_: Copy b)} (f: fn a b [env] -> c can e3) {(_: Drop env e3)}
```

Given `a1, a2, .., aN` and `b1, b2, .., bN`, emit `f a1 b1, f a2 b2, .., f aN bN`.
If the two input streams are not the same length, the length of the resulting stream
will be the shorter of the two.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L171)

---

## iota

```ante
(iota: fn Usz -> (fn Unit [Usz] -> Unit can Emit Usz) is pure) (n: Usz)
```

Emit numbers from 0 to `n`, end-exclusive

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L182)

---

## zip

```ante
(zip: fn s1 s2 {Stream s1 a e1} {Stream s2 b e2} {Copy a} {Copy b} -> (fn Unit [s1, s2, (Copy a), (Copy b), (fn a b [fn a b -> a, b is pure] -> a, b is pure)] -> Unit can Emit (a, b), Panic) is pure) (stream1: s1) (stream2: s2) {(sa: Stream s1 a e1)} {(sb: Stream s2 b e2)} {(_: Copy a)} {(_: Copy b)}
```

Zip the two streams together, emitting `x, y` for each
`x` returned by the first stream and each `y` returned by the second.
The length of the resulting stream will be the length of the shorter
of the two streams given.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L189)

---

## all

```ante
all (stream: s) {_: Stream s a e} (f: fn a [env] -> Bool can e) {_: Drop env e}: Bool can e
```

Apply the function `f` to all elements of the given stream,
returning `true` if `f e` was true for all elements `e`. If the
stream is empty, this will be vacuously true.

If `false` is returned for any element, the stream will not
be pulled any further and `false` will be returned early.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L198)

---

## any

```ante
any (stream: s) {_: Stream s a e} (f: fn a [env] -> Bool can e) {_: Drop env e}: Bool can e
```

Apply the function `f` to all elements of the given stream,
returning `true` if `f e` was true for any element `e`. If the
stream is empty, this will be vacuously false.

If `true` is returned for any element, the stream will not
be pulled any further and `true` will be returned early.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L210)

---

## first

```ante
first (stream: s) {_: Stream s a e}: a can Fail, e
```

Returns the first element of the stream. Fails if the stream is empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L217)

---

## last

```ante
last (stream: s) {_: Stream s a e} {_: Drop a d}: a can Fail, e, d
```

Returns the final element of the stream. Fails if the stream is empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L222)

---

## nth

```ante
nth (stream: s) {_: Stream s a e} {_: Drop a d} (n: Usz): a can Fail, e, d
```

Returns the nth element of the stream (indexed starting from 0). Fails if the stream's length is `< n`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L233)

---

## intersperse

```ante
(intersperse: fn s {Stream s a e} a {Clone a} {Drop a d} -> (fn Unit [s, (Stream s a e), a, (Clone a)] -> Unit can Emit a, e) is pure) (stream: s) {(_: Stream s a e)} (item: a) {(_: Clone a)} {(_: Drop a d)}
```

Intersperse an item in between each element of the stream.

Given `a1, a2, .., aN` and `item`, emit `a1, item, a2, item, .., item, aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L243)

---

## intersperse_with

```ante
(intersperse_with: fn s {Stream s a e} (fn Unit [env] -> a can e2) {Drop env e2} -> (fn Unit [s, (Stream s a e), (fn Unit [env] -> a can e2)] -> Unit can Emit a, e, e2) is pure) (stream: s) {(_: Stream s a e)} (item: fn Unit [env] -> a can e2) {(_: Drop env e2)}
```

Intersperse an item from the given function in between each element of the stream.

Given `a1, a2, .., aN` and `item`, emit `a1, item, a2, item, .., item, aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L255)

---

## chain

```ante
(chain: fn s1 {Stream s1 a e1} s2 {Stream s2 a e2} -> (fn Unit [s1, (Stream s1 a e1), s2, (Stream s2 a e2)] -> Unit can Emit a, e1, e2) is pure) (stream1: s1) {(_: Stream s1 a e1)} (stream2: s2) {(_: Stream s2 a e2)}
```

Emits all elements from the first stream followed by all elements from the second stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L265)

---

## count

```ante
count (stream: s) {_: Stream s a e} {_: Drop a d}: U32 can e, d
```

Consume the stream, returning the total number of elements in it

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L270)

---

## find

```ante
find (stream: s) {_: Stream s a e} {_: Drop a d} (predicate: fn (ref a) [env] -> Bool can e) {_: Drop env d}: a can Fail, e, d
```

Find an element in the stream for which `predicate` returns true.
Fails if there is no such element

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L277)

---

## find_map

```ante
find_map (stream: s) {_: Stream s a e} (predicate: fn a [env] -> Maybe b can e) {_: Drop env e}: b can Fail, e
```

Find an element in the stream for which `predicate` returns `Some b`, and return that `b`.
Fails if there is no such element

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L287)

---

## take

```ante
(take: fn s {Stream s a e} {Drop a d} U32 -> (fn Unit [s, (Stream s a e), U32] -> Unit can Emit a, e) is pure) (stream: s) {(_: Stream s a e)} {(_: Drop a d)} (initial_n: U32)
```

Re-emit only the first `n` items from the stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L298)

---

## take_while

```ante
(take_while: fn s {Stream s a e} {Drop a d} (fn (ref 'a a) [env] -> Bool can $effect) {Drop env d} -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [env] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (stream: s) {(_: Stream s a e)} {(_: Drop a d)} (predicate: fn (ref 'a a) [env] -> Bool can $effect) {(_: Drop env d)}
```

Re-emit items from the stream only while `predicate` keeps returning true.
When the predicate first returns false, the stream will stop.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L309)

---

## skip

```ante
(skip: fn s {Stream s a e} {Drop a d} U32 -> (fn Unit [s, (Stream s a e), U32] -> Unit can Emit a, e) is pure) (stream: s) {(_: Stream s a e)} {(_: Drop a d)} (initial_n: U32)
```

Skips the first `n` items from the stream, emitting the rest as normal.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L317)

---

## skip_while

```ante
(skip_while: fn s {Stream s a e} {Drop a d} (fn (ref 'a a) [env] -> Bool can $effect) {Drop env d} -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [env] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (stream: s) {(_: Stream s a e)} {(_: Drop a d)} (predicate: fn (ref 'a a) [env] -> Bool can $effect) {(_: Drop env d)}
```

Skips elements while `predicate elem` is true. After the first `false`,
no more elements will be skipped (including the element itself).

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L329)

---

## sum

```ante
sum (stream: s) {_: Stream s a e} (initial: a) {_: Add a}: a can e
```

Return the sum of all elements in the stream from the given initial value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L342)

---

## product

```ante
product (stream: s) {_: Stream s a e} (initial: a) {_: Mul a}: a can e
```

Return the product of all elements in the stream from the given initial value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L351)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## stream_fn

```ante
impl stream_fn {_: Drop env e}: Stream (fn Unit [env] -> Unit can Emit a, e) a e
```

This is the most common stream impl. Most streams will just be thunks
that emit. This impl is most common in the middle of stream chains since
functions like `map` and `filter` return such thunks.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L22)

---

## stream_array

```ante
impl stream_array: Stream (Array n t) t pure
```

Emits each element in the array

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L29)

---

## stream_range

```ante
impl stream_range {n: Num t} {_: Copy t}: Stream (Range t) t pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L36)

</details>

