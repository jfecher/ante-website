+++
title = "Std.IO"
categories = ["docs"]
weight = 9
+++

```ante
import Std.IO
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an)

---

# Types

---

## File

```ante
type File =
    c_file: C.File
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L10)

---

### File.open

```ante
File.open (path: String) (mode: String): File can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L12)

---

### File.close

```ante
File.close (file: File): Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L15)

---

### File.eof

```ante
File.eof (f: ref File): Bool can Fs
```

Convenience function for using feof with better types

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L23)

---

### File.write

```ante
File.write (f: mut File) (text: String): Unit can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L26)

---

### File.next_char

```ante
File.next_char (f: ref File): Char can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L34)

---

### File.next_line

```ante
File.next_line (f: mut File): String can Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L37)

---

# Functions

---

## print_to_file

```ante
print_to_file (file: ref File) (f: a can Print, e): a can Fs, e
```

Handles `Print` by writing everything printed to `file`

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L31)

---

## read_line

```ante
read_line (): String can Fs
```

Read a line from stdin, ending with (and not including) a terminating '\n'

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L69)

---

## create_dir

```ante
create_dir (path: String): Unit can Fs, Fail
```

Create the directory at `path`.
Fails if it cannot be created, unless a directory already exists there.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L91)

---

## create_dir_all

```ante
create_dir_all (path: String): Unit can Fs, Fail
```

Create each directory in `path` along with any missing parent directories.
Fails if any of them cannot be created.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L96)

---

# Implicits

---

<details>
<summary>Show Implicits</summary>

## drop_file

```ante
impl drop_file: Drop File Fs
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L18)

---

## iterator_file

```ante
impl iterator_file: Iterator (mut File) String Fs
```

Iterating through a File iterates through each line

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L63)

</details>

