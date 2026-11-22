+++
title = "Roadmap"
date = "2022-06-25"
categories = ["docs"]
+++

Most features on the tour page are currently implemented to varying degrees. Below is a rough
list of features being worked on.

# Near Future

- Proper unwinding when `resume` is dropped
- Default handlers for `Panic`, `Print`, and some other effects in `main`
- Renaming of the `Fs`, `Net` primitive effects
- Compiler option to write inferred types into the file
- Formatter
- Rework or removal of `~>` operator for effect handling
- Rework of closure types

# Futurer

The following features are unimplemented but are not my top priority to implement in the near future.

- Design & impl of a `comptime` system enough to write your own `derive`s but also cached by the compiler's incremental metadata
- `Char` is 1 byte rather than 4 currently. There is an open design question of
whether Ante should use Rust's model for chars (4 bytes), Swift's model (variable bytes), or something else.
- Pattern guards such as `| pattern if expr -> ...`
- A check to ensure only pure implicit functions can be called implicitly
- Row-polymorphic struct types
- Cranelift backend
- Language Server: Fill in match arms action
- Modules: `as name`, `import implicit`
