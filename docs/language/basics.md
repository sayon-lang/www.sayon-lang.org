# Basics

How a program runs, how its text is laid out, and how names hold values.

## Programs

A file with top-level statements is a script: they run in order. A file with only definitions runs its `main` function, which takes no parameters and returns `nothing` or an `integer`. The integer becomes the exit status. Portable statuses are 0 to 255; other values exit with 255 after a warning.

```sayon
function main() -> integer
    print("done")
    return 0
```

## Source files

- Source files use the `.sayon` extension and must be valid UTF-8. A leading byte order mark is accepted.
- Lines end with LF or CRLF. A carriage return on its own is an error.
- Indentation defines blocks. Four spaces per level is the convention. Tabs are accepted and count as four columns, but one file must not mix tabs and spaces for indentation.
- Blank lines and comment-only lines do not affect indentation.
- A statement ends at the end of its line, except inside parentheses or brackets, where line breaks are ignored.

```sayon
total = add(1,
            2)
if total > 2
    print("big")
```

### Comments

`#` starts a comment that runs to the end of the line. A line containing only `##` opens a block comment, and the next such line closes it. Block comments do not nest.

```sayon
# A line comment
##
A block comment
##
```

### Names and keywords

Names start with an ASCII letter or underscore and continue with letters, digits, or underscores. By convention, variables and functions use `snake_case`, types use `PascalCase`, and constants use `UPPER_SNAKE_CASE`.

Keywords are always single words, such as `elseif` (never `else if`). Reserved words: `and`, `async`, `await`, `break`, `case`, `catch`, `constant`, `continue`, `else`, `elseif`, `enum`, `false`, `finally`, `for`, `foreign`, `function`, `if`, `import`, `in`, `is`, `match`, `not`, `nothing`, `or`, `own`, `private`, `public`, `return`, `true`, `try`, `type`, `unsafe`, `update`, `variable`, `while`.

## Bindings and scope

```sayon
count = 0                  # introduces count, or updates an existing count
variable total = 0         # always introduces total in this block
constant LIMIT = 10        # cannot be reassigned or changed
ratio: float = 0.5         # introduces ratio with a fixed type
```

- `name = value` updates the nearest visible binding with that name, or introduces a new one in the current block when none exists.
- `variable` and annotated declarations always introduce a new binding. Declaring the same name twice in one block is an error.
- Every binding is initialized where it is declared, and becomes visible after its initializer.
- Blocks (`if`, `while`, `for`, `try`, and so on) have their own scope.
- `constant` at the top level of a file declares a module constant, which every function can read. Module constants are initialized before the program starts, in dependency order. A constant cannot depend on itself.
- Other top-level bindings belong to the script and are not visible inside functions; pass them as arguments.

Compound assignment (`+=`, `-=`, `*=`, `/=`, `%=`) evaluates its target once. In an assignment to an element or field, the value is computed before the place it is stored in.
