+++
authors = ["Jake Fecher"]
title = "Achieving Safe, Aliasable Mutability with Unboxed Types"
date = "2024-01-29"
categories = ["mutability", "thread safety", "memory management"]
banner = "img/banners/antelope_bird.jpg"
+++

This is part of Ante's goal to loosen restrictions on low-level programming while remaining
fast, memory-safe, and thread-safe.

---

# Background

---

When writing low-level, memory-safe, and thread-safe programs, a nice feature that lets us
achieve all of these is an ownership model. Ownership models have been used by quite a few languages,
but the language which popularized them was Rust. In Rust, the compiler will check our
code to ensure we have no dangling references and cannot access already-freed memory (among other errors). For
example, the next snippet is a compile-time error in rust:

```rust
let mut vec = vec![1, 2, 3];
let first_element = &vec[0];

// Uh-oh, this may reallocate the Vec, making `first_element` a dangling reference!
// Luckily, we get a compile-time error:
// error[E0502]: cannot borrow `vec` as mutable because it is also borrowed as immutable
vec.push(4);

println!("{first_element}");
```

This is great. Those familiar with Rust however, will note that this error is actually caused
by a related feature to ownership: Rust's borrowing rules. It turns out that moving every object
into and out of each function is not very convenient, so Rust also lets us create borrowed
references to values. These references can be mutable or immutable, and their lifetimes are tied
to that of the owned value. This particular error is prevented by Rust's "Aliasibility XOR Mutability"
rule, which I'll call AxM for short. AxM in Rust states that you can have aliasable borrowed
references, or you can have mutability, but not both. So in the example above, since `Vec::push`
requires a mutable `&mut Vec<i32>` reference, we got a compile-time error trying to call it since
we also had the immutably borrowed reference `first_elem: &i32` in scope. Had we not printed
`first_element` out afterward, it could be dropped earlier and the code would work, but as-is
we rightfully get an error.

This is a great thing to prevent, but it is unfortunate that AxM errors like the one above are some of the most common
errors in Rust. These make the language more difficult to learn when they are run into so often. As
someone who has been writing Rust roughly since 1.0, I think it's fair to say even experienced users
run into AxM errors every now and then. Fixing these often requires laboriously reworking an algorithm
or - unfortunately - giving up and resorting to inserting excessive calls to `clone` in the program.

Moreover, the issue with AxM is that aliasable mutability isn't actually always dangerous.
Consider the following program:

```rust
let mut my_tuple = (1, 2);
let first_elem = &my_tuple.0;

// error[E0506]: cannot assign to `my_tuple` because it is borrowed
my_tuple = (3, 4);

println!("{first_elem}");
```

We'd get a similar error if `my_tuple` was a `&mut (i32, i32)` or if `first_elem` was a mutable reference, etc.
Why is this? The program is actually perfectly safe. No matter how `my_tuple` is mutated, its shape
stays stable, and any inner references will not be invalidated. Another thread
mutating the data out from under us in a non-atomic way (a la Java) is also not possible since 
`&mut` references are not `Send`-able across threads. This is the kind of code new users often try to write in Rust
and are quickly met with their first experiences with the borrow checker. Needless to say, new users encountering
such an error message with such unfamiliar concepts can easily have their patience chipped away at. At
worst, they could even decide to stop learning the language entirely.

The enforcement of AxM also rules out certain design patterns entirely. For example, graphs and the observer pattern
somewhat inherently require sharing. We can try to work around this by implementing graphs with a central
vector of nodes and handing out indices from this vector instead of pointers. There are reasons why we may want
to do this as well (often better cache locality), but there are also reasons why we may want to have a traditional
graph of pointers (lending out mutable references to nodes, no longer need to go through a context to operate
on a node, etc).

All this seems like a big risk for a language when plenty of other languages get by with aliasable mutability
just fine. For example, [Pony](https://www.ponylang.io/) is an example of a thread-safe and memory-safe
language with aliasable mutability. The key difference with these languages is that - unlike Rust - they
force all values to be boxed and often have a garbage collector. This means a function like `Vec::get` which
returns an offset inside of the vector's storage simply isn't possible to write in those languages. It is as
if each vector were a `Vec<Rc<T>>` and instead of `&Rc<T>`, their get function returns a cloned `Rc<T>`. In
reality, Pony uses a tracing garbage collector so there is no cloning going on, but I think this helps to
illustrate the point that each element inside a Vector would itself be an owned pointer. This is why these
languages don't encounter the same issue Rust has with returning a reference to an element in a aliasable
mutable context.

So other languages like Pony allow aliasable mutability but require us to box all values. Rust
lets us unbox most values and obtain references inside objects, but has the AxM restriction.
Can we do better?

In the next section, I'm going to explain my approach with Ante in allowing safe, aliasable mutability
in a language similar to Rust. That is, Ante is thread-safe, memory-safe, and uses unboxed values
with move semantics. As a bonus, this scheme is also completely zero-cost.

--- 
# A New Approach for a New Age

Ante's system for ensuring memory & thread safety uses Rust as a foundation. Anywhere a non-reference
value is seen, it is an owned value. Similarly, anytime `&t` or `&mut t` are seen, these are borrowed
references.

The most important change from Rust's system is that in addition to being tagged with whether they
are `mut`able or not, references are also tagged with whether they are `own`ed, or whether they
are `shared` (able to be mutably aliased). For example, when we take multiple mutable references
to the same value, they are all inferred to be shared:
```ante
my_tuple = mut (1, 2)
elem1 = &mut my_tuple.0
also_elem1 = &mut my_tuple.0

print elem1  // Outputs 1
print also_elem1  // Outputs 1
```
The type of `elem1` and `also_elem1` here is `&shared mut I32`.

We can also mutate through these shared references:
```ante
my_tuple = mut (1, 2)
elem1 = &mut my_tuple.0
also_elem1 = &mut my_tuple.0

also_elem1 := 3

print elem1  // Outputs 3
```

This is because unadorned references (`&` and `&mut`) are polymorphic in whether they are `own`ed
or `shared`. These polymorphic references have the capabilities of `shared` references since anywhere
a `shared` reference is valid, an `own`ed reference would be as well.
This polymorphism comes in handy when returning a reference. If you passed in an
owned reference, you'll get an owned one back. This would not be the case if Ante were designed to use
reference subtyping here instead. Most importantly, this polymorphism allows most code with references 
to be written in a familiar style, ignoring the fact that `shared` or `own` exist:

```ante
log_foo (foo: &Foo) (context: &mut Context) : Unit =
    if context.logging_enabled then
        log "Found foo: ${foo}"
        context.logs += 1
```

It is also important to note that any `shared` references (or polymorphic/unadorned references which
may be shared) do not implement `Send` to be able to be sent across other threads. Since they inherently
allow for shared mutability, this would not be safe to allow.

How then, does Ante prevent holding onto references of things that may change out from under themselves,
such as vector elements or union fields?

---

## Preventing Borrows When a Type's Shape Is Not Stable

These cases are simply marked as requiring owning references:
```ante
get (v: &own Vec t) (index: Usz) : &own t can Fail = ...
```

(`Fail` is an [Algebraic Effect](/docs/language/#algebraic-effects). In this example, it is used
to signal to the caller if the index was out of bounds)

This function signature states that in order to return a reference to a vector's elements,
it needs an owned, though immutable, reference to the Vec. Note that "owned" here still allows
multiple immutable references. A type is only considered to be shared when there is a mutable
reference to it and at least one other reference to it of any kind.
When we try to call `get` with a shared vector, we'll get an error:

```ante
v = mut Vec.of [1, 2, 3]

v_ref1 = &mut v
v_ref2 = &v

// error: Expected an owned reference, but `v_ref1` is shared with `v_ref2`
v_elem = get v_ref1 3

print v_ref1
print v_ref2
```

Similarly, if we try to explicitly grab an owned reference for `v_ref1`, we'll move the error
up to when `v_ref2` is borrowed:

```ante
v = mut Vec.of [1, 2, 3]

// note: Owning reference to `v` created here
v_ref1 = &own mut v

// error: Cannot borrow `v`, there is already an owning reference to it
v_ref2 = &v

v_elem = get v_ref2 3

print v_ref1
print v_ref2
```

Taking the reference of a tagged union's fields also requires an owned reference, although this
must be built into the language.

Another operation that would be unsafe with shared mutable references would be obtaining a reference
through a pointer boundary:

```ante
type Foo =
    ptr: Box Bar

// If we had the following function, we could create a dangling reference:
as_ref (box: &Box t) : &t

foo = mut Foo (Box.new my_bar)

foo_mut_ref = &mut foo

bar_ref = as_ref (foo.&ptr)

// Reassign `ptr`, causing the old value to be dropped
foo_mut_ref.&ptr := Box.new other_bar

// Now bar_ref refers to a dropped value!
print bar_ref
```

For this reason, to obtain a reference past a pointer boundary like this, we need an owned reference:

```ante
as_ref (box: &own Box t) : &own t
```

This can seem like a fairly serious limitation but it is helpful to take a step back and consider
when `Box<T>` and similar pointer types are typically used in today's Rust programs. In my
experience, these are most often used to wrap recursive data types when using an enumeration.
When using shared mutability in Ante, these cases would already likely use an `Rc t`
or similar around each element to reduce the cloning costs of enumerations (more on this later). Through
`as_mut: &own mut Rc t -> &shared mut t`, shared mutability is preserved but we would occasionally
need to clone the reference-counted pointer to obtain the owned reference. If the cost of
incrementing reference counts is a deal breaker (and if there is no other suitable pointer type)
then an application can always decide to go back to `Box t` and owned mutability instead.

---

## Making Shared Useful

Hold on, this is great and all, but how usable are shared references really if we can't do something
as common as holding onto a vector's elements with them? Does this mean we can't use a shared vector
at all?

No! It turns out that even on a shape-unstable type like `Vec t`, most of its functions are still
perfectly fine to use in a shared, mutable context. As long as we don't give out references to elements
we are fine:

```ante
// Reference-polymorphic, great!
len (v: &Vec t) : Usz = ...

// Also great!
push (v: &mut Vec t) (elem: t) : Unit = ...

// Fantastic!
pop (v: &mut Vec t) : t can Fail = ...
```

Alright, alright but that still never solved the issue of actually accessing the elements without
removing them from the Vec. It turns out however, we can do that too:

```ante
get_cloned (v: &Vec t) (index: Usz) : t can Fail given Clone t = ...
```

(`given Clone t` is Ante's way of writing trait constraints)

As long as we don't return a reference to an element, the API itself is safe.
Note that since this requires cloning each value, this will be fine for small,
primitive types, but will be expensive for vectors with more complex element types. 
To work around this, we can instead have a vector of pointer types to reduce the
cost of cloning: `Vec (Rc MyStruct)`.

Eagle-eyed Rust users will note that `&shared mut t` is fairly similar to `Cell<T>` 
in Rust (although a more direct comparison would be `Mut t` in the next section). 
Most of the key differences come in ergonomics and usability. `&shared t` and its 
mutable variant are built-into the language and thus able to be projected to struct
fields and provide better interop with other reference types. This reduces the required
number of conversions, enables tailored compiler errors, and importantly allows arbitrary
owned values to use shared mutation without requiring converting back and forth between
a `Cell<T>` and `T`. This last point is an important distinction I think. Instead of
having the ability to opt out of AxM, AxM can be opted into instead.

---

## Shared Interior Mutability

Since Ante includes shared mutability as a builtin, certain types which can only yield
immutable references in Rust can be accessed mutably in Ante. For example, `Rc t`:

```ante
as_mut (rc: &own mut Rc t) : &shared mut t = ...
```

Note that like the `Box t` example earlier, this still requires an owned reference to
project inside the Rc. In practice this means to use this to mutate inside an Rc you'll
often need to clone it first. Otherwise another shared reference to the Rc could swap
out the `Rc` for another, potentially dropping the original while we held a reference to it.

Compared to `Rc<RefCell<T>>` in Rust, a `Rc t` in Ante can lend out shared references directly
without a wrapper type. The runtime cost is also different: `Rc<RefCell<T>>` performs reference
counting for the outer `Rc` and the inner `Ref`s handed out by the `RefCell`. An `Rc t` in Ante
only needs to perform the out `Rc`. Any `&shared mut t` that are handed out can
be copied/aliased freely. Moreover, `RefCell<T>` introduces a possible panic to the code if
a `RefMut` is ever aliased at runtime, this is not possible with `&shared mut` in Ante.

If we ever do need interior mutability to lend out owned references without cloning, then we'd
still need to resort to a `RefCell t` or similar interior mutability type inherited from Rust.

---
## Custom Clones Are Unsafe

One additional change we need from Rust to enable this scheme is the ability to clone shared
references. If we're working with a shared ref to a tagged union for example, we'll need to
be able to Clone it to access its fields:

```ante
type Shape =
   | Triangle (width: U32) (height: U32)
   | Square (height: U32)

height (s: &Shape) : U32 =
    match clone s
    | Triangle _ height -> height
    | Square height -> height
```

But how can we implement `Clone Shape` if we can't access a tagged union's fields without cloning it first?

```ante
impl Clone Shape with
    clone (s: &Shape) =
        match s  // Error here
        | Triangle w h -> Triangle @w @h
        | Square h -> Square @h
```

Having a rule such as "an impl for `Clone` can only be created via `derive`" would be too limiting.
Even if we banned custom `Clone` impls for shape-unstable types like unions and certain container types
only, users would still be able to write a `Clone` impl that would violate soundness:

```ante
type Foo =
    vec: Rc (Vec Foo)

impl Clone Foo with
    clone foo =
        vec = mut clone foo.&vec
        mut_vec: &shared mut Vec Foo = as_mut &vec

        // If this clone impl was invoked from `Clone (Vec Foo)`
        // with the outer Vec being obtained from a reference into
        // the same Rc shared by `Foo`, then we've just dropped
        // each element inside the Vec, including the one currently
        // being cloned
        clear mut_vec

        Foo vec
```

Unfortunately, writing a custom impl for `Clone` is inherently unsafe. For this reason, these impls
now require the `unsafe` keyword.

```ante
unsafe impl Clone Foo with
    clone foo = Foo (clone foo.&vec)
```

Thankfully, writing custom `Clone` impls is uncommon and code like this which goes out of its
way to break it is even more rare.
Nevertheless, it would still be nice if this case could be prevented more cleanly and made safe.

---

## New User Experience

Finally, it is also important to consider the perspective of a new user to Ante or Rust. This user may be
familiar with other programming languages but crucially is not yet aware of ownership or borrowing
which are somewhat unique to these languages.

In Rust, trying to mutably borrow an already borrowed reference is one of the more memorable errors
for new users to make due to how easy it is to encounter and how difficult it can be to understand at first.
A new user experimenting with the language for the first time will often have a hard time avoiding
these errors until learning about borrowing. As a result, new users tend to insert excessive calls to 
`clone` and tutorials need to introduce borrowing and AxM somewhat early on.

In Ante, new users also have the option of simply using shape-stable types. When defining their types
they can define their vectors to be vectors of pointer types and their unions to have pointers for
each variant's data. This will avoid any AxM errors for the rest of their program - unless they accidentally
call `get` over `get_cloned` or similar. In that case, they will be given a type error and (hopefully)
a helpful message suggesting to use `get_cloned` as an alternative. Tutorials for Ante can encourage this approach
as well by using pointer types more often at first, until introducing owning references later on as
a method of reducing boxing. Compared to the Rust approach, this requires a one-time change
in data types (if not done already / copied from a tutorial), and in return new users are much less likely
to encounter AxM related errors. Comparing the runtime costs of the two work arounds, excessive cloning has the
potential to degrade performance considerably when using larger types, but extra boxing in collection types
and tagged unions won't generally have as drastic a performance impact.

---

# Closing Notes

This was my first blog post for Ante and I'm quite excited to share it with anyone reading.
This scheme will be the first step in making a language with safe, aliasable mutability and
unboxed types more easily usable. If you found this at all interesting, please
consider checking out the [github page](https://github.com/jfecher/ante) and/or joining
[Ante's discord](https://discord.gg/NPJncGBAws) to discuss the language. The compiler is always
open to contributions but I love just discussing the language with anyone who wants to as well.
Thanks for reading and have a fantastic day!
