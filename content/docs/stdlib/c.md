+++
title = "Std.C"
categories = ["docs"]
weight = 1
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

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L9)

---

### String.new

```ante
String.new (s: Std.Prelude.String): String
```

Copy a prelude string, append a '\0', and return it as a new C.String

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L14)

---

## VoidPtr

```ante
type VoidPtr = Ptr U8
```

A convenience type for translating C APIs

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L18)

---

## File

```ante
type File =
    f: Ptr Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L57)

---

## FilePos

```ante
type FilePos =
    f: Ptr Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L58)

---

## Clock

```ante
type Clock =
    sec: I64
    nsec: I64
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L83)

---

# Functions

---

## puts

```ante
puts: fn String -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L22)

---

## putchar

```ante
putchar: fn Char -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L23)

---

## getchar

```ante
getchar: fn Unit -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L24)

---

## exit

```ante
exit: fn I32 -> Never
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L25)

---

## system

```ante
system: fn String -> I32 can IO
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L26)

---

## strlen

```ante
strlen: fn String -> Usz
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L27)

---

## malloc

```ante
malloc (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L38)

---

## calloc

```ante
calloc (items: Usz) (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L41)

---

## realloc

```ante
realloc (ptr: Ptr a) (size: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L44)

---

## free

```ante
free (ptr: Ptr a): Unit
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L47)

---

## memcpy

```ante
memcpy (dest: Ptr a) (src: Ptr b) (count: Usz): Ptr a
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L50)

---

## memcmp

```ante
memcmp (lhs: Ptr a) (rhs: Ptr b) (size: Usz): I32
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L53)

---

## fopen

```ante
fopen: fn String String -> File can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L63)

---

## fclose

```ante
fclose: fn File -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L64)

---

## fputs

```ante
fputs: fn String File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L66)

---

## fputc

```ante
fputc: fn I32 File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L67)

---

## fwrite

```ante
fwrite: fn VoidPtr Usz Usz File -> Usz can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L68)

---

## fgetc

```ante
fgetc: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L70)

---

## fgets

```ante
fgets: fn String I32 File -> String can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L71)

---

## ungetc

```ante
ungetc: fn I32 File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L72)

---

## fgetpos

```ante
fgetpos: fn File FilePos -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L74)

---

## ftell

```ante
ftell: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L75)

---

## fsetpos

```ante
fsetpos: fn File FilePos -> Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L76)

---

## fseek

```ante
fseek: fn File I32 I32 -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L77)

---

## feof

```ante
feof: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L79)

---

## ferror

```ante
ferror: fn File -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L80)

---

## clock_gettime

```ante
clock_gettime: fn I32 (Ptr Clock) -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L88)

---

## nanosleep

```ante
nanosleep: fn (Ptr Clock) (Ptr Clock) -> I32 can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L89)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## copy_cstring

```ante
impl copy_cstring: Copy String
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L10)

---

## copy_file

```ante
impl copy_file: Copy File
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/C.an#L60)

</details>

