+++
title = "Std.Sync"
categories = ["docs"]
weight = 17
+++

```ante
import Std.Sync
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an)

---

# Types

---

## Atomic

```ante
type Atomic t =
    value: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L47)

---

### Atomic.load

```ante
Atomic.load (a: ref Atomic t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L52)

---

### Atomic.store

```ante
Atomic.store (a: ref Atomic t) (value: t): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L55)

---

### Atomic.swap

```ante
Atomic.swap (a: ref Atomic t) (value: t): t
```

Replace the value, returning the previous one.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L59)

---

### Atomic.compare_and_swap

```ante
Atomic.compare_and_swap (a: ref Atomic t) (current: t) (desired: t): t
```

If the current value equals `current`, replace it with `desired`.
Returns the previous value.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L64)

---

### Atomic.fetch_add

```ante
Atomic.fetch_add (a: ref Atomic t) (delta: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L67)

---

### Atomic.fetch_sub

```ante
Atomic.fetch_sub (a: ref Atomic t) (delta: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L68)

---

### Atomic.fetch_and

```ante
Atomic.fetch_and (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L69)

---

### Atomic.fetch_or

```ante
Atomic.fetch_or (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L70)

---

### Atomic.fetch_xor

```ante
Atomic.fetch_xor (a: ref Atomic t) (mask: t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L71)

---

## Mutex

```ante
type Mutex t =
    raw: VoidPtr
    value: t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L76)

---

### Mutex.with_lock

```ante
Mutex.with_lock (m: ref Mutex t) (f: fn (mut t) [_] -> r): r
```

Acquires the lock, blocking until it can be acquired, then runs `f`, then releases the
lock, returning the result of `f`.

This may deadlock 

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L90)

---

## Condvar

```ante
type Condvar =
    raw: VoidPtr
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L109)

---

### Condvar.wait

```ante
Condvar.wait (c: ref Condvar) (m: ref Mutex t): Unit
```

Atomically release `m`'s lock and block until signalled, then re-acquire it. Must be
called while holding `m`'s lock (i.e. from within a `Mutex.with_lock` body that also
captured `m`).
TODO: Add MutexGuard and require that instead of a Mutex

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L120)

---

### Condvar.signal

```ante
Condvar.signal (c: ref Condvar): Unit
```

Unblock one thread waiting on this condvar

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L125)

---

### Condvar.broadcast

```ante
Condvar.broadcast (c: ref Condvar): Unit
```

Unblock all threads waiting on this condvar

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L130)

---

## Thread

```ante
type Thread a =
    raw: VoidPtr
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L142)

---

### Thread.spawn

```ante
Thread.spawn (f: fn Unit [e] -> a is pure): Thread a
```

Spawn a new OS thread running `f`. The returned thread must be joined or detached.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L145)

---

### Thread.join

```ante
Thread.join (t: Thread a): a
```

Block until the thread finishes and return its result.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L167)

---

### Thread.detach

```ante
Thread.detach (t: Thread a): Unit
```

Detach the thread so its resources are reclaimed automatically on exit.
The result value is leaked; use `join` if you need it.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L180)

---

## Arc

```ante
type Arc t =
    ptr: Ptr (ArcInner t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L192)

---

### Arc.as_ref

```ante
Arc.as_ref (a: imm Arc t): imm t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L200)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_mutex

```ante
impl drop_mutex {_: Drop t e}: Drop (Mutex t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L100)

---

## clone_arc

```ante
impl clone_arc: Clone (Arc t)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L205)

---

## drop_arc

```ante
impl drop_arc {_: Drop t e}: Drop (Arc t) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync.an#L211)

</details>

