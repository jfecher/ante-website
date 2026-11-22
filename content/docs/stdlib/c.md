+++
title = "Std.C"
categories = ["docs"]
weight = 3
+++

```ante
import Std.C
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an)

---

# Types

---

## String

```ante
type String =
    ptr: Ptr Char
```

A C string is a pointer to a null-terminated character array.
This is meant to be used qualified as `C.String`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L10)

---

## VoidPtr

```ante
type VoidPtr = Ptr U8
```

A convenience type for translating C APIs

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L23)

---

## File

```ante
type File =
    f: Ptr Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L62)

---

## FilePos

```ante
type FilePos =
    f: Ptr Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L63)

---

## Clock

```ante
type Clock =
    sec: I64
    nsec: I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L89)

---

# Functions

---

## from_string

```ante
from_string (s: Std.Prelude.String): String
```

Copy a prelude string, append a '\0', and return it as a new C.String

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L15)

---

## puts

```ante
puts: fn String -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L27)

---

## putchar

```ante
putchar: fn Char -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L28)

---

## getchar

```ante
getchar: fn Unit -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L29)

---

## exit

```ante
exit: fn I32 -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L30)

---

## system

```ante
system: fn String -> I32 can IO
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L31)

---

## strlen

```ante
strlen: fn String -> Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L32)

---

## malloc

```ante
malloc (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L43)

---

## calloc

```ante
calloc (items: Usz) (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L46)

---

## realloc

```ante
realloc (ptr: Ptr a) (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L49)

---

## free

```ante
free (ptr: Ptr a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L52)

---

## memcpy

```ante
memcpy (dest: Ptr a) (src: Ptr b) (count: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L55)

---

## memcmp

```ante
memcmp (lhs: Ptr a) (rhs: Ptr b) (size: Usz): I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L58)

---

## fopen

```ante
fopen: fn String String -> File can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L68)

---

## fclose

```ante
fclose: fn File -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L69)

---

## fputs

```ante
fputs: fn String File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L71)

---

## fputc

```ante
fputc: fn I32 File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L72)

---

## fwrite

```ante
fwrite: fn VoidPtr Usz Usz File -> Usz can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L73)

---

## fgetc

```ante
fgetc: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L75)

---

## fgets

```ante
fgets: fn String I32 File -> String can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L76)

---

## fread

```ante
fread: fn VoidPtr Usz Usz File -> Usz can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L77)

---

## ungetc

```ante
ungetc: fn I32 File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L78)

---

## fgetpos

```ante
fgetpos: fn File FilePos -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L80)

---

## ftell

```ante
ftell: fn File -> I64 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L81)

---

## fsetpos

```ante
fsetpos: fn File FilePos -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L82)

---

## fseek

```ante
fseek: fn File I64 I32 -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L83)

---

## feof

```ante
feof: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L85)

---

## ferror

```ante
ferror: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L86)

---

## clock_gettime

```ante
clock_gettime: fn I32 (Ptr Clock) -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L96)

---

## nanosleep

```ante
nanosleep: fn (Ptr Clock) (Ptr Clock) -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L97)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_cstring

```ante
impl copy_cstring: Copy String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L11)

---

## copy_file

```ante
impl copy_file: Copy File
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L65)

---

## copy_clock

```ante
impl copy_clock: Copy Clock
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L93)

</details>

