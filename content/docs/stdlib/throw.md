+++
title = "Std.Throw"
categories = ["docs"]
weight = 18
+++

```ante
import Std.Throw
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an)

---

# Types

---

## Result

```ante
type Result t e =
    | Ok t
    | Err e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L6)

---

# Effects

---

## Throw

```ante
effect Throw t =
    throw: fn t -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L3)

---

# Functions

---

## catch

```ante
catch (f: a can Throw e): Result a e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L10)

---

## catch_or

```ante
catch_or (f: a can Throw e) (default: a): a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L14)

---

## catch_or_else

```ante
catch_or_else (f: a can Throw e) (default: fn e [_] -> a): a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L18)

---

## on_err

```ante
on_err (f: a can Throw e) (on_err: fn e [_] -> Unit): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L22)

---

## map_err

```ante
map_err (f: t can Throw e1) (f2: fn e1 [_] -> e2): t can Throw e2
```

Apply the given function to the thrown value and re-throw it

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L29)

---

## unwrap_err

```ante
unwrap_err (f: t can Throw e): e can Fail
```

Returns the error when thrown or fails if the operation finishes without throwing.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L35)

---

## exit_on_throw

```ante
exit_on_throw (f: a can Throw t, e) {_: Display t e2}: a can Fs, e, e2
```

If an error is thrown when running `f`, print it to stderr and exit 1

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L42)

