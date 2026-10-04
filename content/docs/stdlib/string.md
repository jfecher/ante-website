+++
title = "Std.String"
categories = ["docs"]
weight = 16
+++

```ante
import Std.String
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an)

---

# Functions

---

## reverse

```ante
reverse (var s: String): String can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L19)

---

## split

```ante
(split: fn String Char -> (fn Unit [String, Char] -> Unit can Emit String, Fs) is pure) (s: String) (c: Char)
```

Split a string at the given character. Emits substrings
separated by the given character.

For example `split "foo bar  baz "` will emit all of:
["foo", "bar", "", "baz", ""]

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L45)

---

## substr

```ante
substr (var s: String) (begin: Usz) (end: Usz): String
```

Returns a substring into the given string. The given
`begin..end` range represents an end-exclusive byte range
of the substring to create.

This function does not allocate - the resulting substring
increments the reference count of the original string.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L63)

---

## string_of

```ante
string_of (s: s) {_: Stream s Char e}: String can Panic, e
```

Collect each character from the given stream into a String

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L72)

---

## join

```ante
join (s: s) {_: Stream s String e}: String can e
```

Join each string from the stream into one string.

If a separator is desired between each string, use this
in combination with `intersperse`, e.g. `join <| intersperse my_stream (fn () -> "")`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L83)

---

## bytes

```ante
(bytes: fn String -> (fn Unit [String] -> Unit can Emit U8) is pure) (s: String)
```

Emits each byte in this string

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L87)

---

## chars

```ante
(chars: fn String -> (fn Unit [(fn Unit [fn Unit [String] -> Unit can Emit U8] -> Unit can Emit U8), (Stream (fn Unit [fn Unit [String] -> Unit can Emit U8] -> Unit can Emit U8) U8 pure), (fn U8 -> Char is pure)] -> Unit can Emit Char) is pure) (s: String)
```

Emits each character in this string

TODO: No utf-8 checking is done and this currently just emits each byte

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L97)

---

## starts_with

```ante
starts_with (s: ref String) (prefix: ref String): Bool
```

True if `s` begins with `prefix`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L101)

---

## ends_with

```ante
ends_with (s: ref String) (suffix: ref String): Bool
```

True if `s` ends with `suffix`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L106)

---

## contains

```ante
contains (s: ref String) (needle: ref String): Bool
```

True if `needle` appears anywhere in `s`. O(n*m) naive scan.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L113)

---

## trim_start

```ante
trim_start (s: String): String can Fs
```

Return a substring with leading ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L124)

---

## trim_end

```ante
trim_end (s: String): String can Fs
```

Return a substring with trailing ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L133)

---

## trim

```ante
trim (s: String): String can Fs
```

Return a substring with both leading and trailing ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L144)

---

## parse_i32

```ante
parse_i32 (s: String): I32 can Fail, Fs
```

Parse a base-10 I32 from a string.

Fails for empty strings, sign-only strings, non-digits, or overflow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L150)

---

## parse_i8

```ante
parse_i8 (s: String): I8 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L153)

---

## parse_i16

```ante
parse_i16 (s: String): I16 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L156)

---

## parse_i64

```ante
parse_i64 (s: String): I64 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L159)

---

## parse_isz

```ante
parse_isz (s: String): Isz can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L162)

---

## parse_u8

```ante
parse_u8 (s: String): U8 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L165)

---

## parse_u16

```ante
parse_u16 (s: String): U16 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L168)

---

## parse_u32

```ante
parse_u32 (s: String): U32 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L171)

---

## parse_u64

```ante
parse_u64 (s: String): U64 can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L174)

---

## parse_usz

```ante
parse_usz (s: String): Usz can Fail, Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L177)

---

## parse_signed_int

```ante
parse_signed_int (s: String) {n: Num t} {_: CheckedNum t} {_: Cast I32 t e} {_: Copy t}: t can Fail, Fs, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L180)

---

## parse_unsigned_int

```ante
parse_unsigned_int (s: String) {n: Num t} {_: CheckedNum t} {_: Cast U8 t e} {_: Copy t}: t can Fail, Fs, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L215)

---

## from_c_string

```ante
from_c_string (cstr: C.String): String
```

Copy a null-terminated C string into a new string.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L272)

---

## to_ascii_lowercase

```ante
to_ascii_lowercase (s: ref String): String
```

Returns the given string with each ASCII letter converted to lowercase.
The original string is never mutated.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L281)

---

## to_ascii_uppercase

```ante
to_ascii_uppercase (s: ref String): String
```

Returns the given string with each ASCII letter converted to uppercase.
The original string is never mutated.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L291)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## eq_string

```ante
impl eq_string: Eq String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L14)

---

## try_cast_string_i8

```ante
impl try_cast_string_i8: TryCast String I8 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L241)

---

## try_cast_string_i16

```ante
impl try_cast_string_i16: TryCast String I16 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L244)

---

## try_cast_string_i32

```ante
impl try_cast_string_i32: TryCast String I32 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L247)

---

## try_cast_string_i64

```ante
impl try_cast_string_i64: TryCast String I64 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L250)

---

## try_cast_string_isz

```ante
impl try_cast_string_isz: TryCast String Isz Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L253)

---

## try_cast_string_u8

```ante
impl try_cast_string_u8: TryCast String U8 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L256)

---

## try_cast_string_u16

```ante
impl try_cast_string_u16: TryCast String U16 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L259)

---

## try_cast_string_u32

```ante
impl try_cast_string_u32: TryCast String U32 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L262)

---

## try_cast_string_u64

```ante
impl try_cast_string_u64: TryCast String U64 Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L265)

---

## try_cast_string_usz

```ante
impl try_cast_string_usz: TryCast String Usz Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L268)

</details>

