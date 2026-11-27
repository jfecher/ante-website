+++
title = "Std.Throw"
categories = ["docs"]
weight = 33
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

## catch_or_else

```ante
catch_or_else (f: a can Throw e) (default: once fn e [env] -> a) {_: Drop env d}: a can d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L12)

---

## on_err

```ante
on_err (f: a can Throw e) (on_err: once fn e [env] -> Unit) {_: Drop a d} {_: Drop env d}: Unit can d
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L16)

---

## map_err

```ante
map_err (f: t can Throw e1) (f2: once fn e1 [env] -> e2) {_: Drop env d}: t can Throw e2, d
```

Apply the given function to the thrown value and re-throw it

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Throw.an#L22)

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

