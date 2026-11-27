+++
title = "Std.Sync.Condvar"
categories = ["docs"]
weight = 30
+++

```ante
import Std.Sync.Condvar
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an)

---

# Types

---

## Condvar

```ante
type Condvar =
    raw: VoidPtr
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L17)

---

# Functions

---

## new

```ante
new (): Condvar
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L19)

---

## wait

```ante
wait (c: ref Condvar) (m: ref Mutex t): Unit
```

Atomically release `m`'s lock and block until signalled, then re-acquire it. Must be
called while holding `m`'s lock (i.e. from within a `Mutex.with_lock` body that also
captured `m`).
TODO: Add MutexGuard and require that instead of a Mutex

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L28)

---

## signal

```ante
signal (c: ref Condvar): Unit
```

Unblock one thread waiting on this condvar

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L33)

---

## broadcast

```ante
broadcast (c: ref Condvar): Unit
```

Unblock all threads waiting on this condvar

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L38)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_condvar

```ante
impl drop_condvar: Drop Condvar pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Condvar.an#L42)

</details>

