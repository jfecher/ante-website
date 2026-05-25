+++
title = "FAQ"
date = "2026-05-25"
categories = ["docs"]
+++

---

# FAQ
--- 
## Why use Ante?

- **Safe, shared mutability with unboxed types**. It is common to hear that shared mutability should be avoided, and while
  generally a good rule to design around, shared mutability is extremely important for enabling other aspects of the language:
  - Safe, shared mutability enables Ante to model higher-level code from garbage-collected languages like Java or C#.
  - Combined with Ante's core of ownership + borrowing, this means Ante code can be both high-level or lower-level closer to Rust.
    This is very important for both efficiency and ergonomics since both high-level and low-level code work better together.
    Today, when a language has both ordinary business logic and important fast loops it must either:
    - Split their build & complicate hiring by having developers work in multiple languages or split the team by language
    - Commit to only a single high-level or low-level language where:
      - Using only a low-level language sacrifices the brevity and development speed of the business logic
      - Using only a high-level language sacrifices the optimization potential of the fast loops.
  - Ante enables using the same language for both, making business logic faster and easier to write compared to other low level
    languages so that developers have more time to spend on optimizations and bug fixes.

- Inheriting Rust's model, Ante is one of the few languages with **stronger thread safety**.
- **Abilities** in Ante solve the function coloring problem by enabling higher-order functions like `map` to work with async,
  exceptions, generators, etc. with no code duplication.
  - Abilities being a single language concept combining traits/interfaces and effects mean there are fewer questions on how
    something should be modeled.
- **Capabilities** increase the security of applications. If a pure library function is updated to secretly record user data,
  it must accept a `Network` object as an argument, likely creating a new error at its call site.
- **A focus on clean code**: Ante is designed with a strong focus on code being enjoyable to write and easy to read. Ante code
  is often free of excess punctuation and clutter. More terse code makes it easier to find bugs by reducing the number of places
  they can hide. Implicits in Ante strike a balance between abilities being always passed implicitly like traits/implicits are
  in other languages, and being able to be passed explicitly when desired.
- **Flexibility**: Ante acknowledges there are practical tradeoffs between different paradigms. For example, being a low-level
  language, mutation is a given, but at the same time Ante provides alternatives for most scenareos so that while unsafe tools
  are available, the safe alternative is often just as easy or moreso to use.

---
## Is Ante production ready?

**No**. The project is still very immature and businesses should avoid it. That said, any hobbyists curious to try out the language
are encouraged to do so. Feel free to post any libraries or applications you make in [Ante's discord](https://discord.gg/NPJncGBAws)
and create issues [on github](https://github.com/jfecher/ante) for any bugs, confusing error messages, or other issues encountered.

---
## Have you considered an ML-like module system?

I have - although I currently don't see them providing enough value to merit their inclusion. This could change in the future
if I hear a strong enough argument for them over the status quo. Ante's abilities can already enable similar
code since Ante does support existential types already, though types being unboxed makes type erasure when ascribing to
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

---
## Isn't reasoning about pure functions the entire point of an effect system?

This is a question you may ask after reading the [comparison to other effect systems](/docs/language/#comparison-to-other-effect-systems)
portion of Ante's documentation. It is a very reasonable question to ask - losing the ability to _easily_ reason
that a function is completely pure through the absence of effects in its type is the main downside to Ante's system
where effects are passed through parameters instead. I say "easily" because all is not lost. The compiler can
define abilities such as `Send`/`Sync` for reasoning about similar concepts like thread-safety. In general, abilities
can still be used to restrict inputs in most cases. For example, a memoization function may wish to accept only pure functions.
Since the types of each effect are still on the functions themselves (or captured in their environment), it would still be
possible to define a `Pure` ability which is only implemented for functions not using any effects. So although we lose
one clean way of expressing this, there is still a decent workaround, and Ante keeps the other advantages its parameter-based
effect system has mentioned in the link above.
