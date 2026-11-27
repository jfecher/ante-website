+++
title = "Std.IO"
categories = ["docs"]
weight = 18
+++

```ante
import Std.IO
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an)

---

# Functions

---

## read_line

```ante
read_line (): String can Fs
```

Read a line from stdin, ending with (and not including) a terminating '\n'

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L10)

---

## read_file_bytes

```ante
read_file_bytes (path: String): Vec U8 can Fs, Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L28)

---

## read_file

```ante
read_file (path: String): String can Fs, Fail
```

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L45)

---

## create_dir

```ante
create_dir (path: String): Unit can Fs, Fail
```

Create the directory at `path`.
Fails if it cannot be created, unless a directory already exists there.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L58)

---

## create_dir_all

```ante
create_dir_all (path: String): Unit can Fs, Fail
```

Create each directory in `path` along with any missing parent directories.
Fails if any of them cannot be created.

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/IO.an#L66)

