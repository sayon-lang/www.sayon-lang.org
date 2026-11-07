# Types

| Type | Meaning |
|---|---|
| `integer` (`integer64`) | Signed 64-bit integer |
| `integer8`, `integer16`, `integer32` | Smaller signed integers |
| `unsigned` (`unsigned64`) | Unsigned 64-bit integer |
| `unsigned8` (`byte`), `unsigned16`, `unsigned32` | Smaller unsigned integers |
| `float` (`float64`), `float32` | IEEE floating point |
| `boolean` | `true` or `false`; nothing else is treated as true or false |
| `string` | Immutable UTF-8 text |
| `nothing` | The absence of a value |
| `Array<T>` | A growable sequence |
| `Dict<K, V>` | An insertion-ordered dictionary from keys of type `K` to values of type `V` |
| `View<T>`, `MutableView<T>` | A borrowed run of an array's elements; see [Views](ownership.md#views) |
| `A or B` | A value of one of the member types |
| `Range` | The result of `range(...)` |
| `Error` | A recoverable error value |
| `pointer`, `c_string` | A raw address, and an owned copy of text, for C code; see [C functions and unsafe code](c-and-unsafe.md) |
| `Outcome<T>` | The result of a `try` expression: `success(value)` or `failure(problem)` |
| `function(A, B) -> R` | A function value taking `A` and `B` and returning `R`; parameters may be marked `own` or `update` |
| structures | Declared with `type`: named fields |
| enums | Declared with `enum`: one of several variants, each with its own fields |

## Type inference

Annotations are optional. The type of every binding and the parameter and result types of every function are inferred from how they are used. Functions are generic when their code works for more than one type:

```sayon run
function identity(x)
    return x

function add(a, b)
    return a + b

print(identity(42), identity("text"))   # 42 text
print(add(1, 2), add("con", "cat"))     # 3 concat
```

Generic functions can also be written explicitly. Values of an explicit type parameter can be moved, borrowed, cloned, compared with `==` and `<`, and converted to and from JSON. Cloning, comparing, or converting one makes it a requirement of the parameter, so a call with a type that cannot do it, such as an open file to clone or a structure to order with `<`, is an error where it is written. Other operations, such as `+`, need an inferred parameter instead.

```sayon run
function wrap<T>(own value: T) -> Array<T>
    return [value]

function largest<T>(items: Array<T>) -> T or nothing
    variable best: T or nothing = nothing
    for item in items
        if best == nothing or best < item
            best = clone(item)
    return best

numbers = wrap<integer>(42)
print(largest([3, 8, 5]), largest(["fig", "apple"]))   # 8 fig
```

Generic functions with written types can call each other, each with type arguments of its own, as `count_leaves<T>(tree: Tree<T>)` and `count_all<T>(trees: Array<Tree<T>>)` can for a tree. A generic function that calls itself through other functions needs the types of its parameters and its result written (`E_GENERIC_RECURSION`), and what one function of such a cycle requires of its type parameter, the functions calling it with theirs require too. Each set of type arguments makes a version of the function, so one that calls itself with a type argument that grows each time, as `nest([value])` inside `nest<T>(own value: T)` would, is an error (`E_SPECIALIZATION_LIMIT`).

Type arguments may be given in a call, as `wrap<integer>(42)`. A union directly inside them, as in `f<integer or string>(x)`, reads as a comparison, so write such a type deeper inside, as in `f<Array<integer or string>>(x)`, or give it through an annotation: `value: integer or string = f(x)`.

When a value's type cannot be determined, for example an empty `[]` that is never used, the compiler asks for an annotation.

## Unions and narrowing

A union holds one value of one of its member types. Unions are flattened and normalized, so `(integer or nothing) or nothing` is `integer or nothing`. To use a union value as one of its members, test it first; inside the test the value has the narrower type:

```sayon run
function find(id: integer) -> string or nothing
    if id == 1
        return "ada"
    return nothing

name = find(1)
if name != nothing
    print(length(name))

value: integer or string = 5
if typeof(value) == "integer"
    print(value + 10)
else
    print(value + "text")
```

The recognized tests are `value == nothing`, `value != nothing`, `typeof(value) == "type name"`, `typeof(value) != "type name"`, and `value is error` (see [Capturing errors](errors.md#capturing-errors)), combined with `not`, `and`, and `or`. A test followed by a block that always leaves (`return`, `break`, `continue`, or an error) narrows the rest of the enclosing block. Assigning to the variable ends its narrowing.

A union compared with one of its members is equal when it holds that member with an equal value.

## Structures

A structure type has named fields. Build a value by naming every field, either with the type's name or, where the type is known, with a field list:

```sayon run
type Point = [
    x: float,
    y: float
]

origin: Point = [x = 0.0, y = 0.0]
corner = Point(x = 3.0, y = 4.0)
corner.x = 5.0
print(corner.x + origin.y)        # 5.0
```

- Every field must be given exactly once; missing, repeated, and unknown fields are errors. Fields are evaluated in the order written.
- A field list without a known type builds the one structure of the module with exactly those fields.
- Fields are read with `value.field` and changed with `value.field = ...` or `value.field += ...`, through a variable, an element, or an `update` parameter.
- A function can use a field of a parameter with no annotation; the parameter's type is the one structure of the module with that field.
- Structures are generic when they declare type parameters: `type Pair<T> = [first: T, second: T]`. The arguments are inferred, as in `Pair(first = 1, second = 2)`, or written: `Pair<string>(first = "a", second = "b")`.
- A structure cannot contain itself directly; store nested values in a collection, such as `children: Array<Node>`.
- Types are declared at the top level of a file and are exported unless marked `private`. Another module names them with its import alias: `geometry.Point`.

Two structures are equal when their fields are equal.

## Enums

An enum value is one of several variants. A variant can carry fields:

```sayon
enum Shape
    circle(radius: float)
    rectangle(width: float, height: float)
    point

shapes = [circle(1.0), Shape.rectangle(2.0, 3.0), point]
```

- A variant is built by passing its fields in order, or named alone when it has none.
- A variant can be written without its enum's name when the expected type is that enum, or when only one enum of the module has a variant of that name. `Shape.circle(...)` always works.
- A variant of the expected enum takes precedence over a built-in function of the same name, so `enum Result<T>` may have a variant `error(message: string)` and a function returning `Result<integer>` can `return error("...")`.
- Enums can be generic and may contain themselves through a collection.

Two enum values are equal when they are the same variant with equal fields.
