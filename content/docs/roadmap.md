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
- [~] `Char` - implemented but is 1 byte rather than 4. There is an open design question of
whether ante should use rust's model for chars (4 bytes), Swift's model (variable bytes), or something else.
These also use a temporary `c"_"` syntax currently.
- [ ] Array literals

---

# Operators

- [x] Basic arithmetic, `+`, `-`, `*`, `/`, comparisons, etc.
- [x] Pipeline operators `|>` and `<|`
- [x] Assignment `:=`
- [x] Compound assignment operators `+=`, `-=`, `*=`, `/=`, `%=`
- [x] `.` Field access
- [x] `.` Method calls
- [x] `~>` Applying effect handlers
- [ ] `using` Keyword for applying an effect handler to a block
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
  - [ ] 'Or' clause in pattern matching, combining patterns via `|`
  - [ ] Pattern guards: `| pattern if expr -> ...`
  - [ ] `is` keyword for matching within expressions
- [x] `loop` sugar
- [x] `for` loops
- [x] `while` loops
- [x] `break`/`continue`
- [x] `extern`

---
# Types

- [x] Global type inference (HM)
- [x] Product and sum (struct and enum) type definitions
- [ ] Type aliases
- [x] Type annotations
- [x] Implicits
  - [x] `implicit` local variables
  - [x] `implicit` parameters
  - [x] Querying implicit values required for a function call
  - [x] Calling implicit functions in scope for their return value (required for traits)
    - [ ] Check to ensure only `pure` implicit functions can be called
- [x] Trait sugar to create a dictionary type of the required functions
- [x] Trait impl sugar for implicit values which is an instantiation of the trait type
- [ ] Row polymorphic struct types

---
# Modules

- [x] Basic module hierarchy
- [x] `import` one or more symbols from a module
- [x] `export` only a subset of symbols from a module
- [ ] Renaming imports
- [ ] `import implicit` for introducing implicit values. Currently these use a normal `import` statement.

---
# Stdlib

All APIs are non-final.

- [x] `Prelude` module auto-imported into each file
  - [ ] Opt out of importing prelude into a given file or project
- [x] `C` module in stdlib for C interop
- [x] `Vec`: mutable, growable vectors
- [x] `HashMap`
- [x] `Seq`: persistent vector with O(1) pop, get, and clone, and amortized O(1) push.
- [x] `Rc`
- [~] `IO`: existing module is extremely bare bones.
- [x] `Stream`: The `Emit` effect and `Stream` trait for push-based streams.
- [ ] Others: Help wanted! Designing which modules the stdlib should include

---
# Compiler-specific

- [x] LLVM backend
- [ ] Cranelift backend
- [ ] Compiler option to write inferred types into the file
- [ ] Formatter
- [x] Language server.
  - [x] Display errors in file
  - [x] Hover
  - [x] Go to definition
  - [ ] Go to type
  - [ ] Rename
  - [ ] Import symbol
  - [ ] Fill in match arms
  - [x] Vim plugin
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
- [ ] `shared` modifier on types

---
# Algebraic Effects

- [x] Type checking
- [x] Runtime
  - [x] Handlers
    - [x] Handlers for a single effect
    - [x] Handlers for multiple effects
    - [ ] Handlers for multiple instances of the same effect (e.g. `Emit a, Emit b`)
    - [ ] `return _ -> e` clause
      - This is unimplemented but can be emulated by sequencing the handled expression with `e`
  - [x] `resume`
    - [x] Single resumptions
    - [x] 0 resumptions
