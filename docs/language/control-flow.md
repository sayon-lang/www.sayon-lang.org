# Control flow

```sayon
if n < 0
    print("negative")
elseif n == 0
    print("zero")
else
    print("positive")

while count < 3
    count += 1

for i in range(5)             # 0, 1, 2, 3, 4
    print(i)
for i in range(10, 0, -3)     # 10, 7, 4, 1
    print(i)
for name in ["ada", "grace"]
    print(name)
for key, value in ["a" = 1]
    print("{key}: {value}")
for character in "abc"
    print(character)
```

`range(end)`, `range(start, end)`, and `range(start, end, step)` count from `start` (default 0) up to, but not including, `end`. A zero step is an error. A loop over a dictionary visits keys in insertion order, either keys alone (`for key in dict`) or keys with values (`for key, value in dict`). `break` and `continue` apply to the innermost loop.

A loop also goes through an iterator: a value whose type has a `next` [method](functions.md#methods) that returns the next value, or `nothing` at the end. The loop calls `next` before each iteration, and each value belongs to the loop variable, which may keep it.

```sayon
type Countdown = [from: integer]

function next(update countdown: Countdown) -> integer or nothing
    if countdown.from == 0
        return nothing
    countdown.from -= 1
    return countdown.from + 1

for value in Countdown(from = 3)     # 3, 2, 1
    print(value)
```

`next` declares its result as `T or nothing`. A loop over an iterator in a variable changes that variable, and the variable cannot be changed or transferred inside the loop; neither can a variable the iterator was made from with `update`, such as the file of `file.lines()`.

## Matching

`match` runs the first `case` whose pattern matches the value, and whose guard, if it has one, is true:

```sayon
function area(shape: Shape) -> float
    match shape
        case circle(radius)
            return 3.0 * radius * radius
        case rectangle(width, height) if width == height
            return width * width
        case rectangle(width, height)
            return width * height
        case point
            return 0.0
```

| Pattern | Matches |
|---|---|
| `_` | anything |
| a name | anything, binding it to the name (unless it names a variant without fields) |
| a literal: `0`, `-1`, `2.5`, `"text"`, `true`, `nothing` | an equal value |
| `variant(pattern, ...)` | that variant, with each field matching its pattern |
| `Structure(pattern, ...)` | a structure whose fields, in declaration order, match the patterns |
| `Name(field = pattern, ...)` | a variant or structure whose named fields match; fields left out match anything |
| `Enum.variant(...)`, `module.Enum.variant(...)`, `module.Structure(...)` | the same, naming where the variant or structure comes from; `Shape.point` alone is a variant without fields |
| `pattern or pattern` | a value either alternative matches |

Patterns nest: `case some(circle(r))`. On a union, a literal or variant pattern selects the member it belongs to, and a name after cases that handled some members holds only the remaining ones:

```sayon
function describe(value: integer or string or nothing) -> string
    match value
        case nothing
            return "nothing"
        case 0
            return "zero"
        case other
            return "something: {other}"     # other is integer or string
```

Alternatives share one body. Every alternative must bind the same names with the same types, and when a guard fails the next alternative is tried:

```sayon
type Point = [x: float, y: float]

function where(p: Point) -> string
    match p
        case Point(x = 0.0, y = 0.0)
            return "origin"
        case Point(x = 0.0, y = y) or Point(x = y, y = 0.0)
            return "on an axis at {y}"
        case _
            return "elsewhere"

function size(shape: Shape) -> float
    match shape
        case circle(s) or square(s)
            return s
        case _
            return 0.0
```

- A `match` must handle every possible value; the error lists what is missing. End with `case _` to handle everything else. Cases with a guard do not count toward this, since the guard can fail.
- A case that can never run, because the cases above it match everything it would, is reported as a warning, as is an alternative that the cases and alternatives before it already cover.
- Matching a variable borrows its value, and names bound by a case borrow its parts: copy them with `clone`, and do not change the variable while such a case runs. Matching `move(variable)` or a computed value gives the match ownership, so the names bound by cases without a guard own their parts.
