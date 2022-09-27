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

- [ ] `f32`.
- [~] `f64` - implemented but named `float` currently.
- [~] `char` - implemented but is 1 byte rather than 4. There is an open design question of
whether ante should continue using rust's model or Swift's model for chars.

- [x] String interpolation

---

# Operators

- [x] Basic arithmetic, `+`, `-`, `*`, `/`, comparisons, etc.
- [x] Pipeline operators `|>` and `<|`
- [x] Assignment `:=`
- [ ] `+=`, `-=`, `*=` and friends
- [ ] `Bits` module - There are `bnot`, `band`, `bor`, and `bxor` functions in the prelude however.
- [~] `.`
  - [x] Field access
  - [ ] Method calls

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
- [ ] Refinement types
  - [ ] Named types (`foo:Foo` in type position, arbitrarily nested)
  - [ ] Refinement inference
  - [ ] Rectifying interactions between refinement types and numeric traits
  - [ ] Sum-type refinements
- [x] Traits
  - [x] Restricted Functional Dependency clause (`->`). Equivalent to associated types.
- [~] Trait impls
  - [x] Given clause
  - [ ] Named impls
  - [x] Int trait for polymorphic integer literals
    - [x] Defaulting to `i32`
  - [~] Member access traits. These were fully implemented but have been replaced with row-polymorphic struct types for better error messages.
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

---
# Compiler-specific

- [x] LLVM backend
- [x] Cranelift backend
- [ ] Compiler option to write inferred types into the file
- [~] Language server. There is a skeleton for a LSP client [here](https://github.com/jfecher/ante-lsp) but it is more of an experiment than
anything vaguely practical.
- [x] Unused variable warning message
- [ ] Parser recoverable on error
- [x] Name resolution recoverable on error
- [x] Type system recoverable on error

---
# Other

- [~] Mutability. Conflated with the `ref` type currently. Needs redesign, [issue on github](https://github.com/jfecher/ante/issues/101).
due to the lack of lifetime inference it is also easy currently to allocate a mutable cell on the stack and return the dangling reference.
- [ ] Lifetime inference
  - [ ] Initial static inference (likely start with basic Tofte-Taplin)
  - [ ] Non-stack based, more complex static inference.
  - [ ] Runtime checks to further restrict lifetimes (e.g. move between regions)
    - [ ] Compiler option(s) to toggle/configure runtime checks
- [ ] Algebraic effects
  - [x] Type checking
  - [ ] Runtime
    - [ ] Handlers
      - [ ] Matching on effects
      - [ ] Matching on return values
    - [ ] `resume`
      - [ ] Single resumptions
      - [ ] Multiple resumptions
      - [ ] 0 resumptions

