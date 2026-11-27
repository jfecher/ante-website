+++
title = "Std.Print"
categories = ["docs"]
weight = 23
+++

```ante
import Std.Print
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an)

---

# Traits

---

## Display

```ante
trait Display t (e: effect) =
    print: fn (ref t) -> Unit can Print, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L43)

---

# Effects

---

## Print

```ante
effect Print =
    write: fn (ref String) -> Unit
    write_char: fn Char -> Unit
    write_u64: fn U64 -> Unit
    write_i64: fn I64 -> Unit
    write_f64: fn F64 -> Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L4)

---

# Functions

---

## print_to_sink

```ante
print_to_sink (sink: fn (Ptr Char) Usz [env] -> Unit can Fs) {_: Drop env e} (f: a can Print, e): a can Fs, e
```

Forwards each printed string to the given function expecting a string pointer
and the length in bytes of that string pointer.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L16)

---

## print_to_stdout

```ante
print_to_stdout (f: a can Print, e): a can Fs, e
```

Handles `Print` by piping to stdout

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L26)

---

## print_to_stderr

```ante
print_to_stderr (f: a can Print, e): a can Fs, e
```

Handles `Print` by piping to stderr

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L30)

---

## dbg

```ante
dbg (s: String): Unit
```

Display the given String to stderr without using any effects.

This function is intended for debugging purposes. Because it
appears pure to the compiler, there is no guarantee it won't be
optimized out of the program.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L38)

---

## println

```ante
(println: fn (ref 'x t) {Display t e} -> Unit can Print, e) (x: ref 'x t) {(_: Display t e)}
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L46)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## print_i8

```ante
impl print_i8: Display I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L50)

---

## print_i16

```ante
impl print_i16: Display I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L52)

---

## print_i32

```ante
impl print_i32: Display I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L54)

---

## print_i64

```ante
impl print_i64: Display I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L56)

---

## print_u8

```ante
impl print_u8: Display U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L59)

---

## print_u16

```ante
impl print_u16: Display U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L61)

---

## print_u32

```ante
impl print_u32: Display U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L63)

---

## print_u64

```ante
impl print_u64: Display U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L65)

---

## print_usz

```ante
impl print_usz: Display Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L67)

---

## print_isz

```ante
impl print_isz: Display Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L71)

---

## print_char

```ante
impl print_char: Display Char pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L74)

---

## print_f64

```ante
impl print_f64: Display F64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L77)

---

## print_f32

```ante
impl print_f32: Display F32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L79)

---

## print_pair

```ante
impl print_pair {_: Display a e} {_: Display b e}: Display (a, b) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L82)

---

## print_string

```ante
impl print_string: Display String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L89)

---

## print_maybe

```ante
impl print_maybe {_: Display a e}: Display (Maybe a) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L92)

---

## print_bool

```ante
impl print_bool: Display Bool pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L101)

---

## print_ref

```ante
impl print_ref {_: Display a e}: Display (ref a) e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Print.an#L106)

</details>

