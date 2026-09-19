+++
title = "Std.EarlyReturn"
categories = ["docs"]
weight = 3
+++

```ante
import Std.EarlyReturn
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/EarlyReturn.an)

---

# Effects

---

## EarlyReturn

```ante
effect EarlyReturn t =
    early_return: fn t -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/EarlyReturn.an#L1)

---

# Functions

---

## with_early_return

```ante
with_early_return (f: t can EarlyReturn t): t
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/EarlyReturn.an#L4)

