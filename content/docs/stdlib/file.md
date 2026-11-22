+++
title = "Std.IO.File"
categories = ["docs"]
weight = 16
+++

```ante
import Std.IO.File
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an)

---

# Types

---

## File

```ante
type File =
    c_file: C.File
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L8)

---

# Functions

---

## open

```ante
open (path: String) (mode: String): File can Fs, Fail
```

Open the file at `path` with the given `fopen` mode.
Fails if it cannot be opened.

This function is temporary, mode will eventually become a union, and `path` a proper path type.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L14)

---

## close

```ante
close (file: File): Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L23)

---

## eof

```ante
eof (f: ref File): Bool can Fs
```

Convenience function for using feof with better types

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L31)

---

## write

```ante
write (f: mut File) (text: String): Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L34)

---

## print_to_file

```ante
print_to_file (file: ref File) (f: a can Print, e): a can Fs, e
```

Handles `Print` by writing everything printed to `file`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L39)

---

## next_char

```ante
next_char (f: ref File): Char can Fs, Fail
```

Read the next character.
Fails if at the end of the file or on a read error.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L44)

---

## next_line

```ante
next_line (f: mut File): String can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L49)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_file

```ante
impl drop_file: Drop File Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L26)

---

## stream_file

```ante
impl stream_file: Stream (mut File) String Fs
```

Streaming a File emits each line

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO/File.an#L75)

</details>

