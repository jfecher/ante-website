+++
title = "Std.Sync.Thread"
categories = ["docs"]
weight = 32
+++

```ante
import Std.Sync.Thread
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Thread.an)

---

# Types

---

## Thread

```ante
type Thread a =
    raw: VoidPtr
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Thread.an#L14)

---

# Functions

---

## spawn

```ante
spawn (f: once fn Unit [e] -> a is pure): Thread a
```

Spawn a new OS thread running `f`. The returned thread must be joined or detached.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Thread.an#L17)

---

## join

```ante
join (t: Thread a): a
```

Block until the thread finishes and return its result.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Thread.an#L39)

---

## detach

```ante
detach (t: Thread a): Unit
```

Detach the thread so its resources are reclaimed automatically on exit.
The result value is leaked; use `join` if you need it.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Sync/Thread.an#L53)

