# Functions

```sayon
function greet(name, greeting = "Hello")
    print("{greeting}, {name}!")

function append_score(update scores: Array<integer>, score: integer)
    push(scores, score)

function keep(own items: Array<string>) -> Array<string>
    return items
```

- Parameters without defaults come first. Defaults are evaluated on each call that omits them, and may use earlier parameters.
- A function without a result annotation returns `nothing` when it reaches its end. A function that returns a value must return one on every path.
- Functions may call each other in any order, including recursively.

## Parameter modes

How a function uses a parameter decides what the call does with the argument:

| Mode | Written | The function may | The caller's value |
|---|---|---|---|
| read | (default) | read it | stays with the caller |
| update | `update name` | change it in place | stays with the caller, changed |
| own | `own name` | keep, return, or store it | is transferred to the function |

Values of Copy types (numbers, booleans, `nothing`, ranges, structures and enums whose fields are all Copy, and unions of these) are passed to read and own parameters as copies; a function may change its copy without affecting the caller. An `update` parameter always receives the caller's variable, so `function translate(update p: Point)` moves the caller's point.

An annotated parameter defaults to read; changing or keeping it requires `update` or `own`. An unannotated parameter's mode is inferred from the function's body: the least mode it needs. A parameter whose type holds a function value has its mode inferred even when annotated, because calling a function value borrows it for changes (see below).

## Methods

`value.name(arguments)` calls a function with `value` as its first argument. The function is found beside the value's type: in the module that declares the type, a function named `type_name` (`point_move` for `Point`), or else one named `name`, whose first parameter is declared with the type.

```sayon
type Point = [x: float, y: float]

function length_squared(point: Point) -> float
    return point.x * point.x + point.y * point.y

function point_move(update point: Point, dx: float, dy: float)
    point.x += dx
    point.y += dy

p = Point(x = 3.0, y = 4.0)
p.move(1.0, 1.0)
print(p.length_squared())      # 41.0
```

- A method is an ordinary function, also callable as `length_squared(p)`. Its first parameter's mode applies to the value: `point.move(...)` changes `point`, and a method taking `own` transfers it.
- The `type_` prefix lets one module give several types methods of the same name, as `standard/collections` does with `set_add` and `queue_add`.
- A structure field holding a function value is called as before; a field comes before a method of the same name.
- The value's type must be known where the method is called; a parameter used this way needs an annotation (`E_UNKNOWN_METHOD`).
- A private method can be called only inside its module.

## Function values and closures

A named function is a value, and `function(...)` in an expression makes a closure: a function that captures the variables it uses from where it is written.

```sayon
function apply(func, x, y)
    return func(x, y)

function add(a, b)
    return a + b

print(apply(add, 10, 20))                          # 30
print(apply(function(a, b) return a * b, 6, 7))    # 42

function make_counter()
    count = 0
    return function()
        count = count + 1
        return count

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

- A function literal's body is an indented block, or a single `return` or expression on the header's line: `function(x) return x * 2`.
- A function value is called with every argument; defaults apply only to direct calls of a named function. A literal cannot have defaults or type parameters; its types are inferred where it is used, or written as annotations.
- A literal's parameters are read borrows unless they are marked `own` or `update`, or the function type expected where it is written says otherwise. A named function used as a value must declare `own` or `update` on parameters it takes over or changes (`E_PARAMETER_MODE`).
- Function types are written `function(integer, own string) -> boolean`; `-> R` may be left out when the function returns nothing. Inside a union, parenthesize them: `(function(string) -> nothing) or nothing`.
- Function values can be stored in variables, collections, structure fields, and unions, passed, returned, and copied with `clone`. They cannot be compared.

What a closure captures:

- A Copy value the closure only reads is copied when the closure is made.
- An owned value moves into the closure. The enclosing code can no longer use it, as after any other transfer; give the closure a copy with `clone` to keep one.
- A variable the closure changes belongs to the closure from then on, even when its value is Copy, so `make_counter`'s calls keep counting. The enclosing code can no longer use it.
- A closure cannot move a captured value out of itself (`E_MOVE_CAPTURED`), because it can be called again: return `clone(value)` instead.
- A closure made in a loop captures that iteration's value.
- Calling a function value borrows it for changes, since the call may change what it captured. A read-only parameter holding a function value cannot be called; an unannotated one is inferred to be `update`. A `constant` can hold named functions and closures that only read what they capture, and those can be called.

A function declared inside another function is a closure bound to a variable of that name, so it can use the variables declared before it, as a literal would:

```sayon
function summary(values: Array<integer>) -> string
    scale = 10
    function scaled(value: integer) -> integer
        return value * scale
    total = 0
    for value in values
        total += scaled(value)
    return "total {total}"
```

It cannot call itself, since its name is defined only after its body, and it cannot declare type parameters; a function that needs either belongs at the top level of the module.
