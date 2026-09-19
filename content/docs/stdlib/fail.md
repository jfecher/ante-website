+++
title = "Std.Fail"
categories = ["docs"]
weight = 5
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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L2)

---

# Functions

---

## try

```ante
try (f: a can Fail, e): Maybe a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L5)

---

## on_fail

```ante
on_fail (f: a can Fail, e) (default: a can e): a can e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L9)

---

## assert

```ante
assert (cond: Bool): Unit can Fail
```

Fails if `cond` is false
Note that this is the inverse of `fail_if`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L15)

---

## fail_if

```ante
fail_if (cond: Bool): Unit can Fail
```

Fails if `cond` is true
Note that this is the inverse of `assert`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L20)

---

## panic_on_fail

```ante
panic_on_fail (f: a can Fail, e): a can Panic, e
```

Asserts the operation cannot fail.
Panics at runtime if it does.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L25)

---

## abort_on_fail

```ante
abort_on_fail (f: a can Fail, e): a can e
```

Similar to panic_on_fail but aborts the entire process instead of panicking.
Generally this should be avoided when possible unless you can guarantee a
panic will not occur and cannot have the Panic effect in a function.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L31)

---

## or_panic

```ante
or_panic (f: a can Fail, e) (message: String): a can Panic, e
```

Panics on failure with the given error message

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L38)

---

## ignore_fail

```ante
ignore_fail (f: a can Fail, e): Unit can e
```

Ignores a `Fail` effect, discarding it and returning Unit

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L42)

---

## retry_until_success

```ante
retry_until_success (f: a can Fail, e): a can e
```

Retry a function until it succeeds (doesn't call fail).
This should be used with functions using a Fail effect
along with other effects. Otherwise, it will loop forever.

```ante
get_input () -> string can IO = ...
parse (s: string) -> u32 can Fail = ...

number = retry_until_success $$
    input = get_input ()
    parse input
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Fail.an#L57)

