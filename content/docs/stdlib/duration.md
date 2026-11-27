+++
title = "Std.Time.Duration"
categories = ["docs"]
weight = 34
+++

```ante
import Std.Time.Duration
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an)

---

# Types

---

## Duration

```ante
type Duration =
    nanos: I64
```

A duration in nanoseconds

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L2)

---

# Functions

---

## from_secs

```ante
from_secs (s: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L6)

---

## from_millis

```ante
from_millis (ms: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L7)

---

## from_micros

```ante
from_micros (us: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L8)

---

## from_nanos

```ante
from_nanos (ns: I64): Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L9)

---

## as_secs

```ante
as_secs (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L11)

---

## as_millis

```ante
as_millis (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L12)

---

## as_micros

```ante
as_micros (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L13)

---

## as_nanos

```ante
as_nanos (d: Duration): I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L14)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_duration

```ante
impl copy_duration: Copy Duration
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Duration.an#L4)

</details>

