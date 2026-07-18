+++
title = "FAQ"
date = "2026-05-25"
categories = ["docs"]
+++

---
# FAQ
---
## Is it any good?

Yes.

--- 
## Why use Ante?

- **Safe, shared mutability with unboxed types**. It is common to hear that shared mutability should be avoided, and while
  generally a good rule to design around, shared mutability is extremely important for enabling other aspects of the language:
  - Safe, shared mutability enables Ante to model higher-level code from garbage-collected languages like Java or C#.
  - Combined with Ante's core of ownership + borrowing, this means Ante code can be both high-level or lower-level closer to Rust.
    This is very important for both efficiency and ergonomics since both high-level and low-level code work better together.
    Today, when a language has both ordinary business logic and hard performance constraints it must either:
    - Split their build & complicate hiring by having developers work in multiple languages or split the team by language
    - Commit to only a single high-level or low-level language where:
      - Using only a low-level language sacrifices the brevity and development speed of the business logic
      - Using only a high-level language often sacrifices the level of control necessary to write optimizations to meet the performance constraints.
  - Ante enables using the same language for both, making business logic faster and easier to write compared to other low-level
    languages so that developers have more time to spend on optimizations and bug fixes.

- Inheriting Rust's model, Ante is one of the few languages with **stronger thread safety**.
- **Effects** in Ante solve the function coloring problem by enabling higher-order functions like `map` to work with async,
  exceptions, generators, etc. with no code duplication.
  - Effects are part of a function's type, documenting the side-effects that function may perform.
  - Effects perform a similar role to monads but are much easier to use in practice, requiring no special combinators to use multiple of them,
    nor do they require wrapping values in wrapper types or learning what `>>=`/bind is.
  - Effects increase the security of applications. If a pure library function is updated to secretly record user data,
    it must declare a `Net` or `IO` effect, making this change more difficult to hide.
- **A focus on clean code**: Ante is designed with a strong focus on code being enjoyable to write and easy to read. Ante code
  is often free of excess punctuation and clutter. More terse code makes it easier to find bugs by reducing the number of places
  they can hide. Implicits in Ante strike a balance between traits being always passed implicitly like traits/implicits are
  in other languages, and being able to be passed explicitly when desired.
- **Flexibility**: Ante acknowledges there are practical tradeoffs between different paradigms. For example, being a low-level
  language, mutation is a given, but at the same time Ante provides alternatives for most scenarios so that while unsafe tools
  are available, the safe alternative is often just as easy or more so to use.

---
## Is Ante production ready?

**No**. The project is still very immature and businesses should avoid it. That said, any hobbyists curious to try out the language
are encouraged to do so. Feel free to post any libraries or applications you make in [Ante's discord](https://discord.gg/NPJncGBAws)
and create issues [on github](https://github.com/jfecher/ante) for any bugs, confusing error messages, or other issues encountered.

---
## Have you considered an ML-like module system?

I have - although I currently don't see it providing enough value to merit its inclusion. This could change in the future
if I hear a strong enough argument for it over the status quo. Ante's traits can already enable similar
code since Ante does support existential types already, though values being unboxed makes type erasure when ascribing to
a module type more difficult.

---
## How can a language be both high and low level, and what is meant by this?

The status quo of programming languages is that most tend to be high-level with many abstractions and a focus on ease of
use or low-level with a focus on systems programming and control of details such as data representation and allocations.
Being high-level then also implies accepting some good defaults from the language itself and/or its stdlib since if the code
cared about every little detail it would actually be low-level code.

This also implies that as long as a low-level language is flexible enough, it can choose these "good defaults" and greatly
resemble high-level code as well. Most low-level languages today however provide no means of opting out, forcing users
to specify low-level details nearly all of the time. If a language could allow a user to opt-out they could theoretically
get through less critical portions of their program more quickly and cleanly, allowing them to focus a greater portion
of their time on sections of the program in which the low-level details are actually important to specify, such as
tight loops requiring many specialized optimizations in data layouts, allocations, etc. Moreover, this allows a development
team to be split more cleanly with a smoother on-boarding process. New developers are not thrown into the low-level pits
immediately, they can start with high-level code and slowly work their ways down the stairs from there if they wish.
This is what Ante provides with its `shared` types to opt-out of ownership semantics.

Read more about this in the post [A Vision for Future Low-level Languages](/blog/vision)
