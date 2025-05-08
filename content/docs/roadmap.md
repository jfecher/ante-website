+++
title = "Roadmap"
date = "2022-06-25"
categories = ["docs"]
+++

This page is for an in-depth roadmap of ante to show what is currently implemented
in the compiler. Note that the basic compiler passes from lexing, parsing, etc through
(llvm) codegen have been implemented for quite some time so readers can assume the basic
inner workings of the compiler are working.

All designs in the [ideas](/docs/ideas) page are not implemented as their design is still non-final and may
not be selected at all.

Key:
- [x] Implemented
- [~] Partially implemented
- [ ] Not implemented

---
# Literals

All literals are implemented except for:

- [~] `Char` - implemented but is 1 byte rather than 4. There is an open design question of
whether ante should use rust's model for chars (4 bytes), Swift's model (variable bytes), or something else.

---

# Operators

- [x] Basic arithmetic, `+`, `-`, `*`, `/`, comparisons, etc.
- [x] Pipeline operators `|>` and `<|`
- [x] Assignment `:=`
- [x] `.` Field access
- [ ] `+=`, `-=`, `*=` and friends
- [ ] `is` operator for pattern matching without `match`
- [ ] `Bits` module - There are `bnot`, `band`, `bor`, and `bxor` functions in the prelude however.

---
# Functions and Control Flow

- [x] Functions + lambdas
- [x] Explicit currying
- [x] if
- [~] `match` and pattern matching
  - [x] Variable/match-all patterns
  - [x] Constructor patterns
  - [x] Integer literal patterns
  - [x] Completeness & Redundancy checking
  - [ ] 'Or' clause in pattern matching, combining patterns via `|`
  - [ ] Pattern guards: `| pattern if expr -> ...`
  - [ ] `is` keyword for matching within expressions
- [x] `loop` sugar
- [x] `Iterator` trait in prelude
- [x] `extern`
- [ ] `C` module in stdlib to move extern C functions and types to, they are currently in the prelude.

---
# Types

- [x] Global type inference (HM)
- [x] Product and sum (struct and enum) type definitions
- [ ] Type aliases
- [x] Type annotations
- [x] Traits
  - [x] Restricted Functional Dependency clause (`->`). Equivalent to associated types.
- [x] Polymorphic `Int` and `Float` types for polymorphic integer and float literals
  - [x] Defaulting to `I32` and `F64`
- [~] Row polymorphic struct types. Implemented internally, except for:
  - [ ] Allow users to specify these in type annotations. They are currently only inferred.
- [~] Trait impls
  - [x] Given clause
  - [ ] Named impls
  - [x] Impl search
  - [x] Static dispatch of traits

---
# Modules

- [x] Basic module hierarchy
- [x] Relative roots. This refers to the ability to refer to `Vec.push` defined in `stdlib/Vec.an`
even though there is no `Vec` module strictly in the directory you're in.
  - [ ] Adding arbitrary new relative roots to refer to imported libraries used within a project. This will
likely need to wait until a package manager is ironed out.
- [~] Import all visible symbols from a file. This uses the syntax `import Vec` instead of `import Vec.*` currently
but is otherwise implemented.
- [~] Importing only select symbols from a module. This uses `import Vec.foo bar` currently instead of `import Vec.foo, bar`
- [ ] Renaming imports
- [ ] Hiding imports
- [ ] Exports
  - All top-level values are publically exported currently

---
# Compiler-specific

- [x] LLVM backend
- [x] Cranelift backend
- [ ] Compiler option to write inferred types into the file
- [~] Language server.
  - [x] Display errors in file
  - [x] Hover
  - [ ] Go to definition
  - [ ] Go to type
  - [ ] Rename
- [x] Unused variable warning message
- [ ] Parser recoverable on error
- [x] Name resolution recoverable on error
- [x] Type system recoverable on error

---
# Ownership

Ante's ownership and borrowing rules have been completely redesigned recently. They
will take some time to implement.

- [x] Mutating owned values and mutable references to values.
- [ ] Tracking moves and issuing errors when a moved value is used
- [~] Borrowing
  - [x] Basic immutable and mutable borrowing
  - [ ] Preventing moving owned values while the borrowed reference is alive
  - [ ] `shared` and `owned` modifiers
  - [ ] `ref` qualifier for types which store references
---
# Other

- [~] Algebraic effects
  - [x] Type checking
    - Type checking for effects is considered implemented but there are bugs particularly when inferring effects.
  - [~] Runtime
    - [~] Handlers
      - [x] Handlers for a single effect
      - [ ] Handlers for multiple effects
      - [ ] Matching on return values
        - The `return _ -> e` clause is still unimplemented but can be reasonably emulated by adding `; e` to the end of the expression being handled.
    - [x] `resume`
      - [x] Single resumptions
      - [x] 0 resumptions
