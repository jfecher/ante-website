+++
title = "Roadmap"
date = "2022-06-25"
categories = ["docs"]
+++

Most features on the tour page are currently implemented to varying degrees. Below is a rough
list of features being worked on.

# Near Future

- Large rework of the design of the four reference types
- Existentialization as an alternative to monomorphization for faster debug builds
- Inserting `drop` automatically after a variable's last use
- Default handlers for `Panic`, `Print`, and some other effects in `main`
- Renaming of the `Fs`, `Net` primitive effects
- Compiler option to write inferred types into the file
- Formatter
- Language Server: Better support for struct members and methods
- Possible new sugar `<pattern> do <expr> === fn <pattern> -> <expr>` and `<pattern> in <expr1> do <expr2> === <expr1> fn <pattern> -> <expr2>`.
Intended to be used in looping functions: `each i do ...` and `for i in vec do ...`
  - Problem: this conflicts with `do <expr>` being sugar for `fn () -> <expr>`.

# Futurer

The following features are unimplemented but are not my top priority to implement in the near future.

- Design & impl of a `comptime` system enough to write your own `derive`s but also cached by the compiler's incremental metadata
- `Char` is 1 byte rather than 4 currently. There is an open design question of
whether Ante should use Rust's model for chars (4 bytes), Swift's model (variable bytes), or something else.
- Bit shift functions
- Pattern guards such as `| pattern if expr -> ...`
- Performance guarantees on `for_` to be as fast as the native `for` loop
- A check to ensure only pure implicit functions can be called implicitly
- Row polymorphic struct types
- Cranelift backend
- Language Server: Fill in match arms action
- Proper unwinding when `resume` is dropped
- Modules: `as name`, re-exports, `import implicit`
- Marker type on each `trait impl`
- Rework of closure types
- Rework of effect ergonomics. `~>` works but is awkward. `Stream` defines its own returning-a-function pattern which generally works well.
