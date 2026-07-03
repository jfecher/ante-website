+++
title = "Roadmap"
date = "2022-06-25"
categories = ["docs"]
+++

> Ante's compiler has recently finished a complete rewrite and is now incremental,
> concurrent, and fault-tolerant - although general performance still has much room for improvement.

This page is for an in-depth roadmap of ante to show which features are currently implemented
in the compiler.

All designs in the [ideas](/docs/ideas) page are not implemented as their design is still non-final and may
not be selected at all.

Key:
- [x] Implemented
- [~] Partially implemented
- [ ] Not implemented

Note that since the compiler is still immature, a feature marked as implemented may not be completely
bug-free or may have some unimplemented corner cases. These are not expected however, and users encountering
any bugs with these features should create an issue on github.

---
# Literals

- [x] Polymorphic integers (defaulting to `I32`)
- [x] Polymorphic floats (defaulting to `F64`)
- [x] Unit literal `()`
- [x] Bool literals `true` and `false`
- [x] Strings
- [~] `Char` - implemented but is 1 byte rather than 4. There is an open design question of
whether ante should use Rust's model for chars (4 bytes), Swift's model (variable bytes), or something else.
These also use a temporary `c"_"` syntax currently.
- [x] Array literals
- [ ] Slices

---

# Operators

- [x] Basic arithmetic, `+`, `-`, `*`, `/`, comparisons, etc.
- [x] Pipeline operators `|>` and `<|`
- [x] Assignment `:=`
- [x] Compound assignment operators `+=`, `-=`, `*=`, `/=`, `%=`
- [x] `.` Field access
- [x] `.` Method calls - these may change in the future due to the conflict with struct field access
- [x] `is` operator for pattern matching without `match`

---
# Functions and Control Flow

- [x] Free functions
- [x] Closures
- [x] Explicit currying via `_`
- [x] if
- [x] `match` and pattern matching
  - [x] Variable/match-all patterns
  - [x] Constructor patterns
  - [x] Integer literal patterns
  - [x] Completeness & Redundancy checking
  - [x] 'Or' clause in pattern matching, combining patterns via `|`
  - [x] Alias patterns ('name @ pattern')
  - [ ] Pattern guards: `| pattern if expr -> ...`
  - [x] `is` keyword for matching within expressions
- [x] `loop` sugar
- [x] `for` loops
- [x] `while` loops
- [x] `break`/`continue`

---
# Types

- [x] Global type inference (HM)
- [x] Product and sum (struct and enum) type definitions
- [ ] Type aliases
- [x] Type annotations
- [x] Kind inference
- [x] Implicits
  - [x] `implicit` local variables
  - [x] `implicit` parameters
  - [x] Querying implicit values required for a function call
  - [x] Calling implicit functions in scope for their return value (implicits like `eq_maybe` are functions since they require other implicits as parameters)
    - [ ] Check to ensure only pure implicit functions can be called
      - This was the original design but has been made more difficult by the move to capabilities
- [x] Trait sugar to create a dictionary type of the required functions
- [x] Trait impl sugar for implicit values which is an instantiation of the trait type
- [ ] Row polymorphic struct types

---
# Modules

- [x] Basic module hierarchy
- [x] `import` one or more symbols from a module
- [x] `export` only a subset of symbols from a module
- [ ] Renaming imports
- [ ] Re-exports
- [ ] `import implicit` for introducing implicit values. Currently these use a normal `import` statement.

---
# Stdlib

All APIs are non-final.

- [x] `Prelude` module auto-imported into each file
  - [ ] Opt out of importing prelude into a given file or project
- [x] `C` module in stdlib for C interop
- [x] `Vec`: Mutable, growable vectors
- [x] `HashMap`
- [x] `Seq`: Persistent vector with O(1) pop, get, and clone, and amortized O(1) push.
- [x] `Rc`
- [~] `String`: Methods lack any kind of UTF-8 verification
- [~] `IO`: Existing module is extremely bare bones.
- [x] `Stream`: The `Emit` effect and `Stream` trait for push-based streams.
- [x] `Fail`: Effects for generic failure & throwing a specific value
- [ ] Others: Help wanted! Designing which modules the stdlib should include

---
# Compiler-specific

- [x] LLVM backend (optional but preferred)
- [x] C backend
- [ ] Cranelift backend
- [ ] Existentialization option for lowering generics in debug mode (making monomorphization optional)
- [ ] Compiler option to write inferred types into the file
- [ ] Formatter
- [ ] Platforms
  - [ ] Interfaces for common platforms defined
  - [ ] `IO` interface defined
    - The compiler uses `extern` declarations currently not in its design and relies on Posix symbols
  - [ ] Linker provides values for platform parameters to `main`.
  - [ ] Linker provides values for dynamic library parameters to `main`.
- [x] Language server.
  - [x] Display errors in file
  - [x] Hover
  - [x] Display documentation on hover
  - [x] Go to definition
  - [ ] Go to type
  - [ ] Rename
  - [x] Import symbol
  - [x] Import implicit
  - [ ] Fill in match arms
  - [x] Vim plugin
  - [x] VSCode plugin
- [x] Recoverable on error
- [x] Compiler only rechecks changed code in incremental mode
  - Disabled by default since it requires storing metadata for the project, enabled for the language server
- [x] Concurrent

---
# Ownership & Mutation

- [x] `var` for local mutable variables
- [x] Mutating owned values and mutable references to values.
- [x] Move tracking
- [ ] `Drop` called after a variable's last non-move use
  - [ ] `Drop`-unwinding for uncalled `resume`s when handling effects.
- [x] `Copy` exempting variables from moves
- [ ] Borrowing
  - [x] `ref`, `mut`, `imm`, and `uniq` references exist
  - [ ] `imm` and `uniq` cannot coexist with `ref` and `mut` to the same value
  - [ ] `uniq` cannot coexist with any other reference to the same value
  - [ ] Moves are prevented while any reference to the same value is alive
  - [ ] Lifetimes are checked
- [~] `shared` modifier on types
  - [x] Automatic heap allocation
  - [ ] Shared mut types allow mutation

---
# Abilities

- [x] Type checking
- [~] `implicit foo = bar` definitions
  - Implemented but they can cause infinite loops in the type checker at top-level when used with mutual recursion.
  - The old `impl foo: Bar with ..` form is still included with some hacks to resolve the above loops and will be removed eventually.
- [x] Hidden `env` parameter
  - Abilities are structs of closures which may capture values in their environment unboxed.
  - This is implemented but the representation will change in the future.
- [x] Runtime
  - [x] Effect Handlers
  - [x] `resume`
    - [x] Single resumptions
    - [x] 0 resumptions
    - [x] Tail-resume optimization
    - [~] 0-resume optimization
      - A form of this is implemented but its design is broken since it will skip drops in the future once drops are auto-inserted by the compiler.
  - [x] Capabilities
    - [ ] Capability-based Security
      - No `IO` effect yet. Other effects are handled as normal but users can escape these restraints by defining `extern` symbols which link to library code performing arbitrary effects.
