+++
title = "Std.Stream"
categories = ["docs"]
weight = 15
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
    break_: fn Unit -> Never
    continue_: fn Unit -> Never
```

Common control-flow effects for looping
- break_: ends the loop early
- continue_: ends the current iteration of the loop early

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L11)

---

# Functions

---

## iter

```ante
iter (s: s) {_: Stream s a e} (f: fn a [_] -> b can e2): Unit can e, e2
```

Consumes the given stream, applying `f` to each element

E.g. `iter (iota 5) print` will print `01234`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L34)

---

## for_

```ante
for_ (s: s) {_: Stream s a e} (f: fn a [_] -> b can Loop, e): Unit can e
```

Consumes the given stream, applying `f` to each element, with
an additional Loop handler installed to allow breaking/continuing
within the overall loop.

E.g. The following will print 012
```ante
for_ (iota 5) fn i ->
    if i > 2 then break_ ()
    print i
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L50)

---

## map

```ante
(map: fn s {Stream s a e} (fn a [_] -> b can $effect) -> (fn Unit [s, (Stream s a e), (fn a [_] -> b can $effect)] -> Unit can Emit b, e, $effect) is pure) (s: s) {(_: Stream s a e)} (f: fn a [_] -> b can $effect)
```

Applies `f` to each element from the stream, re-emitting each result.

Given `a1, a2, .., aN`, emit `f a1, f a2, .., f aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L62)

---

## filter

```ante
(filter: fn s {Stream s a e} (fn (ref 'a a) [_] -> Bool can $effect) -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [_] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (s: s) {(_: Stream s a e)} (f: fn (ref 'a a) [_] -> Bool can $effect)
```

Re-emits only the elements from the original stream for which `f elem` is true

E.g. `filter (iota 5) (_ > 2)` will emit `3` and `4`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L71)

---

## filter_map

```ante
(filter_map: fn s {Stream s a e} (fn a [_] -> Maybe b can $effect) -> (fn Unit [s, (Stream s a e), (fn a [_] -> Maybe b can $effect)] -> Unit can Emit b, e, $effect) is pure) (s: s) {(_: Stream s a e)} (f: fn a [_] -> Maybe b can $effect)
```

Performs a combined map and filter opereration, applying `f` to each element in
the stream, filtering out any elements for which `None` is returned, leaving only
the `Some` elements.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L80)

---

## enumerate

```ante
(enumerate: fn s {Stream s a e} -> (fn Unit [s, (Stream s a e)] -> Unit can Emit (Usz, a), e) is pure) (s: s) {(_: Stream s a e)}
```

Given `a1, a2, .., aN`, emit `(0, a1), (1, a2), .., (N-1, aN)`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L89)

---

## foldl

```ante
foldl (s: s) {_: Stream s b e} (initial: a) (f: fn a b [_] -> a): a can e
```

Given `a1, a2, .., aN` and an initial value `initial`, return `(f (.. (f (f initial a1) a2) ..) aN)`

Unlike `foldr`, `foldl` is tail-resumptive and thus more efficient. If `f` is commutative, prefer
`foldl` over `foldr`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L101)

---

## foldr

```ante
foldr (s: s) {_: Stream s a e} (initial: b) (f: fn a b [_] -> b): b can e
```

Given `a1, a2, .., aN` and an initial value `initial`, return `f a1 (f a2 (.. (f aN initial)))`

Unlike `foldl`, `foldr` is not tail-resumptive (the initial `f a1 _` call does not finish
until the rest of the stream has been consumed) which limits performance. Prefer `foldl`
when `f` is commutative.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L116)

---

## reduce

```ante
reduce (s: s) {_: Stream s a e} (f: fn a a [_] -> a): a can Fail, e
```

Similar to `foldl` but uses the first element as the initial value.

Given `a1, a2, a3, .., aN`, return `f (.. (f (f a1 a2) a3) ..) aN`

This function is tail-resumptive. Fails if the stream is empty.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L127)

---

## map2

```ante
(map2: fn s1 s2 {Stream s1 a e1} {Stream s2 b e2} {Copy a} {Copy b} (fn a b [_] -> c can $effect) -> (fn Unit [s1, s2, (Stream s1 a e1), (Stream s2 b e2), (Copy a), (Copy b), (fn a b [_] -> c can $effect)] -> Unit can Emit c, Panic, e1, e2, $effect) is pure) (s1: s1) (s2: s2) {(_: Stream s1 a e1)} {(_: Stream s2 b e2)} {(_: Copy a)} {(_: Copy b)} (f: fn a b [_] -> c can $effect)
```

Given `a1, a2, .., aN` and `b1, b2, .., bN`, emit `f a1 b1, f a2 b2, .., f aN bN`.
If the two input streams are not the same length, the length of the resulting stream
will be the shorter of the two.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L145)

---

## iota

```ante
(iota: fn Usz -> (fn Unit [Usz] -> Unit can Emit Usz) is pure) (n: Usz)
```

Emit numbers from 0 to `n`, end-exclusive

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L156)

---

## zip

```ante
(zip: fn sa sb {Stream sa a ea} {Stream sb b eb} {Copy a} {Copy b} -> (fn Unit [sa, sb, (Stream sa a ea), (Stream sb b eb), (Copy a), (Copy b), (fn a b [fn a b -> a, b is pure] -> a, b is pure)] -> Unit can Emit (a, b), Panic, ea, eb) is pure) (a: sa) (b: sb) {(sa: Stream sa a ea)} {(sb: Stream sb b eb)} {(_: Copy a)} {(_: Copy b)}
```

Zip the two streams together, emitting `x, y` for each
`x` returned by the first stream and each `y` returned by the second.
The length of the resulting stream will be the length of the shorter
of the two streams given.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L163)

---

## all

```ante
all (s: s) {_: Stream s a e} (f: fn a [_] -> Bool): Bool can e
```

Apply the function `f` to all elements of the given stream,
returning `true` if `f e` was true for all elements `e`. If the
stream is empty, this will be vacuously true.

If `false` is returned for any element, the stream will not
be pulled any further and `false` will be returned early.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L172)

---

## any

```ante
any (s: s) {_: Stream s a e} (f: fn a [_] -> Bool): Bool can e
```

Apply the function `f` to all elements of the given stream,
returning `true` if `f e` was true for any element `e`. If the
stream is empty, this will be vacuously false.

If `true` is returned for any element, the stream will not
be pulled any further and `true` will be returned early.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L184)

---

## first

```ante
first (s: s) {_: Stream s a e}: Maybe a can e
```

Returns the first element of the stream or `None` if it is empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L191)

---

## last

```ante
last (s: s) {_: Stream s a e}: Maybe a can e
```

Returns the final element of the stream or `None` if it is empty

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L200)

---

## intersperse

```ante
(intersperse: fn s {Stream s a e} a {Clone a} -> (fn Unit [s, (Stream s a e), a, (Clone a)] -> Unit can Emit a, e) is pure) (s: s) {(_: Stream s a e)} (item: a) {(_: Clone a)}
```

Intersperse an item in between each element of the stream.

Given `a1, a2, .., aN` and `item`, emit `a1, item, a2, item, .., item, aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L211)

---

## intersperse_with

```ante
(intersperse_with: fn s {Stream s a e} (fn Unit [_] -> a can $effect) -> (fn Unit [s, (Stream s a e), (fn Unit [_] -> a can $effect)] -> Unit can Emit a, e, $effect) is pure) (s: s) {(_: Stream s a e)} (item: fn Unit [_] -> a can $effect)
```

Intersperse an item from the given function in between each element of the stream.

Given `a1, a2, .., aN` and `item`, emit `a1, item, a2, item, .., item, aN`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L223)

---

## chain

```ante
(chain: fn s1 {Stream s1 a e1} s2 {Stream s2 a e2} -> (fn Unit [s1, (Stream s1 a e1), s2, (Stream s2 a e2)] -> Unit can Emit a, e1, e2) is pure) (s1: s1) {(_: Stream s1 a e1)} (s2: s2) {(_: Stream s2 a e2)}
```

Emits all elements from the first stream followed by all elements from the second stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L233)

---

## count

```ante
count (s: s) {_: Stream s a e}: U32 can e
```

Consume the stream, returning the total number of elements in it

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L238)

---

## find

```ante
find (s: s) {_: Stream s a e} (predicate: fn (ref a) [_] -> Bool): a can Fail, e
```

Find an element in the stream for which `predicate` returns true.
Fails if there is no such element

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L243)

---

## find_map

```ante
find_map (s: s) {_: Stream s a e} (predicate: fn a [_] -> Maybe b): b can Fail, e
```

Find an element in the stream for which `predicate` returns `Some b`, and return that `b`.
Fails if there is no such element

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L253)

---

## take

```ante
(take: fn s {Stream s a e} U32 -> (fn Unit [s, (Stream s a e), U32] -> Unit can Emit a, e) is pure) (s: s) {(_: Stream s a e)} (initial_n: U32)
```

Re-emit only the first `n` items from the stream

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L264)

---

## take_while

```ante
(take_while: fn s {Stream s a e} (fn (ref 'a a) [_] -> Bool can $effect) -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [_] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (s: s) {(_: Stream s a e)} (predicate: fn (ref 'a a) [_] -> Bool can $effect)
```

Re-emit items from the stream only while `predicate` keeps returning true.
When the predicate first returns false, the stream will stop.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L275)

---

## skip

```ante
(skip: fn s {Stream s a e} U32 -> (fn Unit [s, (Stream s a e), U32] -> Unit can Emit a, e) is pure) (s: s) {(_: Stream s a e)} (initial_n: U32)
```

Skips the first `n` items from the stream, emitting the rest as normal.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L283)

---

## skip_while

```ante
(skip_while: fn s {Stream s a e} (fn (ref 'a a) [_] -> Bool can $effect) -> (fn Unit [s, (Stream s a e), (fn (ref 'a a) [_] -> Bool can $effect)] -> Unit can Emit a, e, $effect) is pure) (s: s) {(_: Stream s a e)} (predicate: fn (ref 'a a) [_] -> Bool can $effect)
```

Skips elements while `predicate elem` is true. After the first `false`,
no more elements will be skipped (including the element itself).

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L295)

---

## sum

```ante
sum (s: s) {_: Stream s a e} (initial: a) {_: Add a}: a can e
```

Return the sum of all elements in the stream from the given initial value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L308)

---

## product

```ante
product (s: s) {_: Stream s a e} (initial: a) {_: Mul a}: a can e
```

Return the product of all elements in the stream from the given initial value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L317)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## stream_fn

```ante
impl stream_fn: Stream (fn Unit [env] -> Unit can Emit a, e) a e
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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Stream.an#L26)

</details>

