+++
title = "Std.Char"
categories = ["docs"]
weight = 2
+++

```ante
import Std.Char
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an)

---

# Functions

---

## is_ascii

```ante
is_ascii (c: Char): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L4)

---

## is_digit

```ante
is_digit (c: Char): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L6)

---

## is_alpha

```ante
is_alpha (c: Char): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L9)

---

## is_alphanumeric

```ante
is_alphanumeric (c: Char): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L12)

---

## is_whitespace

```ante
is_whitespace (c: Char): Bool
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L15)

---

## to_ascii_lower

```ante
to_ascii_lower (c: Char): Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L18)

---

## to_ascii_upper

```ante
to_ascii_upper (c: Char): Char
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L23)

---

## to_digit

```ante
to_digit (c: Char): Maybe U8
```

If this char is a digit in base 10, return the digit as an integer.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Char.an#L29)

