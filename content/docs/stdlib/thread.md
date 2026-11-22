+++
title = "Std.Sync.Thread"
categories = ["docs"]
weight = 31
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

