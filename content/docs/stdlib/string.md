+++
title = "Std.String"
categories = ["docs"]
weight = 26
+++

```ante
import Std.String
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an)

---

# Types

---

## String

```ante
type String =
    data: Ptr Char
    refcount: Ptr U32
    length: U32
    offset: U32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L17)

---

# Functions

---

## from_parts

```ante
from_parts (pointer: Ptr Char) (length: U32): String
```

Construct a fresh, unaliased string from an owned pointer to characters and a length.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L25)

---

## is_valid_utf8_bytes

```ante
is_valid_utf8_bytes (data: Ptr U8) (len: Usz): Bool
```

A UTF-8 checker for the bytes of a string.

This is based on the https://bjoern.hoehrmann.de/utf-8/decoder/dfa algorithm

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L58)

---

## is_valid_utf8

```ante
is_valid_utf8 (s: String): Bool
```

A UTF-8 checker for a string.

This is based on the https://bjoern.hoehrmann.de/utf-8/decoder/dfa algorithm

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L93)

---

## reverse

```ante
reverse (var s: String): String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L103)

---

## split

```ante
(split: fn String Char -> (fn Unit [String, Char] -> _ can (error) String) is pure) (s: String) (c: Char)
```

Split a string at the given character. Emits substrings
separated by the given character.

For example `split "foo bar  baz "` will emit all of:
["foo", "bar", "", "baz", ""]

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L129)

---

## split_str

```ante
(split_str: fn String String -> (fn Unit [String, String] -> _ can (error) String) is pure) (s: String) (separator: String)
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L141)

---

## lines

```ante
(lines: fn String -> (fn Unit [String, Char] -> _ can (error) String) is pure) (s: String)
```

Emit each line of a string. Excludes the newline character.
Empty lines are emitted as empty strings.

Shorthand for `s.split '\n'`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L161)

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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L170)

---

## string_of

```ante
string_of (stream: s) {_: Stream s Char e}: String can Panic, Fail, e
```

Collect each character from the given stream into a String

This fails if all bytes are not valid UTF-8

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L183)

---

## join

```ante
join (stream: s) {_: Stream s String e}: String can e
```

Join each string from the stream into one string.

If a separator is desired between each string, use this
in combination with `intersperse`, e.g. `join <| intersperse my_stream (fn () -> "")`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L197)

---

## bytes

```ante
(bytes: fn String -> (fn Unit [String] -> Unit can (error) U8) is pure) (s: String)
```

Emits each byte in this string

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L201)

---

## chars

```ante
(chars: fn String -> _ is pure) (s: String)
```

Emits each character in this string

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L209)

---

## starts_with

```ante
starts_with (s: ref String) (prefix: ref String): Bool
```

True if `s` begins with `prefix`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L213)

---

## ends_with

```ante
ends_with (s: ref String) (suffix: ref String): Bool
```

True if `s` ends with `suffix`.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L218)

---

## contains

```ante
contains (s: ref String) (needle: ref String): Bool
```

True if `needle` appears anywhere in `s`. O(n*m) naive scan.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L225)

---

## trim_start

```ante
trim_start (s: String): String
```

Return a substring with leading ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L236)

---

## trim_end

```ante
trim_end (s: String): String
```

Return a substring with trailing ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L245)

---

## trim

```ante
trim (s: String): String
```

Return a substring with both leading and trailing ASCII whitespace removed.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L256)

---

## parse_i8

```ante
parse_i8 (s: String): I8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L259)

---

## parse_i16

```ante
parse_i16 (s: String): I16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L262)

---

## parse_i32

```ante
parse_i32 (s: String): I32 can Fail
```

Parse a base-10 I32 from a string.

Fails for empty strings, sign-only strings, non-digits, or overflow.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L268)

---

## parse_i64

```ante
parse_i64 (s: String): I64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L271)

---

## parse_isz

```ante
parse_isz (s: String): Isz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L274)

---

## parse_u8

```ante
parse_u8 (s: String): U8 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L277)

---

## parse_u16

```ante
parse_u16 (s: String): U16 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L280)

---

## parse_u32

```ante
parse_u32 (s: String): U32 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L283)

---

## parse_u64

```ante
parse_u64 (s: String): U64 can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L286)

---

## parse_usz

```ante
parse_usz (s: String): Usz can Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L289)

---

## parse_signed_int

```ante
parse_signed_int (s: String) {n: Num t} {_: CheckedNum t} {_: Cast I32 t e} {_: Copy t}: t can Fail, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L292)

---

## parse_unsigned_int

```ante
parse_unsigned_int (s: String) {n: Num t} {_: CheckedNum t} {_: Cast U8 t e} {_: Copy t}: t can Fail, e
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L327)

---

## from_c_string

```ante
from_c_string (cstr: C.String): String can Fail
```

Copy a null-terminated C string into a new string.

Fails if the C string contains invalid UTF-8.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L386)

---

## to_ascii_lowercase

```ante
to_ascii_lowercase (s: ref String): String
```

Returns the given string with each ASCII letter converted to lowercase.
The original string is never mutated.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L397)

---

## to_ascii_uppercase

```ante
to_ascii_uppercase (s: ref String): String
```

Returns the given string with each ASCII letter converted to uppercase.
The original string is never mutated.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L407)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## eq_string

```ante
impl eq_string: Eq String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L98)

---

## try_cast_string_i8

```ante
impl try_cast_string_i8: TryCast String I8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L353)

---

## try_cast_string_i16

```ante
impl try_cast_string_i16: TryCast String I16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L356)

---

## try_cast_string_i32

```ante
impl try_cast_string_i32: TryCast String I32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L359)

---

## try_cast_string_i64

```ante
impl try_cast_string_i64: TryCast String I64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L362)

---

## try_cast_string_isz

```ante
impl try_cast_string_isz: TryCast String Isz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L365)

---

## try_cast_string_u8

```ante
impl try_cast_string_u8: TryCast String U8 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L368)

---

## try_cast_string_u16

```ante
impl try_cast_string_u16: TryCast String U16 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L371)

---

## try_cast_string_u32

```ante
impl try_cast_string_u32: TryCast String U32 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L374)

---

## try_cast_string_u64

```ante
impl try_cast_string_u64: TryCast String U64 pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L377)

---

## try_cast_string_usz

```ante
impl try_cast_string_usz: TryCast String Usz pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L380)

---

## cmp_string

```ante
impl cmp_string: Cmp String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L414)

---

## append_string

```ante
impl append_string: Append String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L421)

---

## clone_string

```ante
impl clone_string: Clone String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L436)

---

## drop_string

```ante
impl drop_string: Drop String pure
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/String.an#L442)

</details>

