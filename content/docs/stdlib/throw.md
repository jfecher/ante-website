+++
title = "Std.Throw"
categories = ["docs"]
weight = 32
+++

```ante
import Std.Throw
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an)

---

# Effects

---

## Throw

```ante
effect Throw t =
    throw: fn t -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L1)

---

# Functions

---

## catch

```ante
catch (f: a can Throw e): Result a e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L4)

---

## catch_or

```ante
catch_or (f: a can Throw e) (default: a) {_: Drop a d} {_: Drop e d}: a can d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L8)

---

## unwrap_err

```ante
unwrap_err (f: t can Throw e) {_: Drop t d}: e can Fail, d
```

Returns the error when thrown or fails if the operation finishes without throwing.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L28)

---

## exit_on_throw

```ante
exit_on_throw (f: a can Throw t, e) {_: Display t e2}: a can Fs, e, e2
```

If an error is thrown when running `f`, print it to stderr and exit 1

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L35)

