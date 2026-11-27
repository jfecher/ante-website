+++
title = "Std.Fail"
categories = ["docs"]
weight = 15
+++

```ante
import Std.Fail
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an)

---

# Effects

---

## Fail

```ante
effect Fail =
    fail: fn Unit -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L3)

---

# Functions

---

## try

```ante
try (f: a can Fail, e): Maybe a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L6)

---

## on_fail

```ante
on_fail (f: a can Fail, e) (default: once fn Unit [env] -> a can e) {_: Drop env e}: a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L10)

---

## assert

```ante
assert (cond: Bool): Unit can Fail
```

Fails if `cond` is false
Note that this is the inverse of `fail_if`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L16)

---

## fail_if

```ante
fail_if (cond: Bool): Unit can Fail
```

Fails if `cond` is true
Note that this is the inverse of `assert`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L21)

---

## panic_on_fail

```ante
panic_on_fail (f: a can Fail, e): a can Panic, e
```

Asserts the operation cannot fail.
Panics at runtime if it does.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L26)

---

## abort_on_fail

```ante
abort_on_fail (f: a can Fail, e): a can e
```

Similar to panic_on_fail but aborts the entire process instead of panicking.
Generally this should be avoided when possible unless you can guarantee a
panic will not occur and cannot have the Panic effect in a function.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L32)

---

## or_panic

```ante
or_panic (f: a can Fail, e) (message: String): a can Panic, e
```

Panics on failure with the given error message

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L39)

---

## ignore_fail

```ante
ignore_fail (f: a can Fail, e) {_: Drop a d}: Unit can e, d
```

Ignores a `Fail` effect, discarding it and returning Unit

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L43)

---

## retry_until_success

```ante
retry_until_success (f: fn Unit [env] -> a can Fail, e) {_: Drop env e}: a can e
```

Retry a function until it succeeds (doesn't call fail).
This should be used with functions using a Fail effect
along with other effects. Otherwise, it will loop forever.

```ante
get_input (): String can IO = ...
parse (s: String): U32 can Fail = ...

number = retry_until_success do
    input = get_input ()
    parse input
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L58)

