+++
title = "Std.Slice"
categories = ["docs"]
weight = 14
+++

```ante
import Std.Slice
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an)

---

# Types

---

## Slice

```ante
type Slice 'a t =
    data: ref 'a t
    len: Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L3)

---

# Functions

---

## slice

```ante
slice (array: ref 'a Array n t): Slice 'a t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Slice.an#L7)

