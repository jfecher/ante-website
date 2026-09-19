+++
title = "Std.Env"
categories = ["docs"]
weight = 4
+++

```ante
import Std.Env
```


[Source](https://github.com/jfecher/ante/blob/master/stdlib/src/Env.an)

---

# Functions

---

## args

```ante
args (): Unit can Emit String, Fs
```

Stream the CLI arguments the program was invoked with, including
the program name as the first element. Note:
- The program name as argument 0 is only a convention, it is not guaranteed
- It is possible for external code to mutate these CLI arguments

[source](https://github.com/jfecher/ante/blob/master/stdlib/src/Env.an#L14)

