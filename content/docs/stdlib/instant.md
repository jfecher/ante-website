+++
title = "Std.Time.Instant"
categories = ["docs"]
weight = 34
+++

```ante
import Std.Time.Instant
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Instant.an)

---

# Types

---

## Instant

```ante
type Instant =
    nanos: I64
```

A monotonic time point in nanoseconds since an arbitrary epoch.
Only meaningful relative to another `Instant`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Instant.an#L7)

---

# Functions

---

## now

```ante
now (): Instant can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Instant.an#L12)

---

## elapsed

```ante
elapsed (start: Instant): Duration can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Instant.an#L17)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_instant

```ante
impl copy_instant: Copy Instant
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Time/Instant.an#L9)

</details>

