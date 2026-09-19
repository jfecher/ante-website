+++
title = "Std.Time"
categories = ["docs"]
weight = 19
+++

```ante
import Std.Time
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an)

---

# Types

---

## Duration

```ante
type Duration =
    nanos: I64
```

A duration in nanoseconds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L4)

---

### Duration.from_secs

```ante
Duration.from_secs (s: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L6)

---

### Duration.from_millis

```ante
Duration.from_millis (ms: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L7)

---

### Duration.from_micros

```ante
Duration.from_micros (us: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L8)

---

### Duration.from_nanos

```ante
Duration.from_nanos (ns: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L9)

---

### Duration.as_secs

```ante
Duration.as_secs (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L11)

---

### Duration.as_millis

```ante
Duration.as_millis (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L12)

---

### Duration.as_micros

```ante
Duration.as_micros (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L13)

---

### Duration.as_nanos

```ante
Duration.as_nanos (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L14)

---

## Instant

```ante
type Instant =
    nanos: I64
```

A monotonic time point in nanoseconds since an arbitrary epoch.
Only meaningful relative to another `Instant`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L18)

---

### Instant.now

```ante
Instant.now (): Instant can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L21)

---

### Instant.elapsed

```ante
Instant.elapsed (start: Instant): Duration can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L26)

---

# Functions

---

## sleep

```ante
sleep (d: Duration): Unit can Fs
```

Block the current thread for the specified duration.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time.an#L30)

