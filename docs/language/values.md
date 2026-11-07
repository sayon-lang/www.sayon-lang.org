# Values and operators

The values a program writes down, numbers, text, arrays, and dictionaries, and the operators that work on them.

## Literals

| Literal | Examples | Type |
|---|---|---|
| Integer | `42`, `1_000_000`, `0xFF`, `0b1010`, `0o755` | `integer` unless the context needs another integer type |
| Unsigned | `255u` | `unsigned` unless the context needs another unsigned type |
| Float | `3.14`, `2.5e-2`, `1e3` | `float` unless the context needs `float32` |
| Boolean | `true`, `false` | `boolean` |
| Nothing | `nothing` | `nothing` |
| String | `"text"` | `string` |
| Array | `[1, 2, 3]`, `[]` | `Array<T>` |
| Dictionary | `["name" = "Ada", "city" = "London"]`, `[1 = "one"]` | `Dict<K, V>` with the keys' and values' types |

Underscores in numbers must sit between digits. Number prefixes are lowercase. An integer literal never becomes a float: `x: float = 1` is an error; write `1.0`.

A literal's value must fit its type, so `small: integer8 = 200` and `positive: unsigned = -1` are compile errors.

### Strings

Strings are immutable UTF-8 text in double quotes and must close on the same line. Escapes: `\"`, `\\`, `\n`, `\r`, `\t`, `\0`, and `\u{HEX}` with one to six hexadecimal digits naming a Unicode scalar value.

Braces interpolate an expression. Doubled braces are literal braces.

```sayon run
name = "Sayon"
print("Hello, {name}!")          # Hello, Sayon!
print("Sum: {100 + 20}")         # Sum: 120
print("Braces: {{{name}}}")      # Braces: {Sayon}
```

Positions in a string count Unicode characters (scalar values), as `length` does; `bytelength` counts UTF-8 bytes. `text[i]` is the character at position `i` as a one-character string, and `for character in text` visits each character in order. A position outside the string raises `BoundsError`. Strings cannot be changed in place (`E_IMMUTABLE_STRING`); build a new one with `+`, interpolation, or the `standard/strings.sayon` functions such as `slice`.

```sayon run
word = "héllo"
print(word[1], length(word), bytelength(word))   # é 5 6
for character in word
    print(character)
```

Indexing a string walks it from the start, so `text[i]` takes time proportional to `i`; a `for` loop visits every character in one pass.

Text has three kinds of units, and each operation names the one it counts:

| Unit | Is | Counted by | Taken apart by |
|---|---|---|---|
| byte | one byte of the UTF-8 encoding | `bytelength` | `strings.bytes` (a copy), `strings.byte_view` (no copy) |
| character | a Unicode scalar value, such as `e` or the combining accent U+0301 | `length` | `text[i]`, `for`, `strings.characters` |
| grapheme | what a reader sees as one character: a letter with its accents, a whole emoji sequence, a flag | `strings.grapheme_count` | `strings.graphemes` |

```sayon run
strings = import("standard/strings.sayon")

word = "e\u{301}t\u{e9}"                       # "été", the first é written as e and an accent
print(bytelength(word), length(word), strings.grapheme_count(word))   # 6 4 3
```

Graphemes follow the extended grapheme clusters of Unicode 17.0 (Unicode Standard Annex #29). Casing and the other operations do not depend on the locale.

### Arrays and dictionaries

An array literal whose elements have different types gets the union of those types:

```sayon
mixed = [1, "text", true]        # Array<integer or boolean or string>
```

An empty literal `[]` takes its type from an annotation or from later use, such as a `push`. Dictionaries keep insertion order. Replacing a key's value keeps the key's position.

Dictionary keys are compared by value. A key can be an integer, a boolean, a string, `nothing`, or a structure, enum, or union made only of those; floats, collections, function values, and errors cannot be keys (`E_KEY_TYPE`), since a key must stay equal to itself. A key is copied into the dictionary.

```sayon run
type Point = [x: integer, y: integer]

squares = [1 = 1, 2 = 4]
grid: Dict<Point, string> = []
grid[Point(x = 0, y = 0)] = "origin"
print(squares[2], grid)       # 4 [Point(x = 0, y = 0) = "origin"]
```

In `[name = value]` a bare name is a structure field, unless a dictionary is expected there: then the name is evaluated as a key, so `directions: Dict<Direction, integer> = [north = 0, south = 180]` uses the variants `north` and `south`.

## Operators

From highest to lowest precedence:

| Operators | Notes |
|---|---|
| calls `f(x)`, indexing `a[i]`, members `x.field` | |
| `-x`, `not x` | |
| `*`, `/`, `%` | |
| `+`, `-` | `+` also joins strings |
| `<`, `>`, `<=`, `>=` | numbers and strings |
| `==`, `!=` | |
| `and` | short-circuits |
| `or` | short-circuits |

Comparisons cannot be chained: write `a < b and b < c`. Both operands of an arithmetic or comparison operator must have the same type; Sayon never converts numbers implicitly.

Integer arithmetic is checked: a result outside the type's range raises an `OverflowError`, and division by zero raises a `DivisionByZeroError`. Integer division truncates toward zero, and `%` takes the sign of the dividend. Float arithmetic follows IEEE rules, so `1.0 / 0.0` is `inf`.

### Conversions

Each numeric type name converts a number to that type, with checks:

```sayon
integer(3.99)      # 3, truncated toward zero
float(7)           # 7.0
integer8(300)      # ConversionError: 300 does not fit in integer8
```

The C types, such as `c_int` and `c_size`, convert the same way. Converting a float to an integer rejects infinity and NaN. Converting a float to `float32` rejects finite values too large for it. `tonumber(text)` parses text to `integer or float`, and `tostring(value)` produces display text.
