# Errors

`error(message)` raises an error; `raise(problem)` raises an existing `Error` value. An error travels up through calls until a `try` catches it. Every local value is destroyed on the way.

```sayon
try
    value = divide(10, 0)
catch problem
    print("Error: {problem}")         # the message
    print(problem.code)               # UserError
finally
    print("Operation finished")
```

`finally` runs once whichever way the `try` ends: normally, by `return`, `break`, or `continue`, or by an error. A `finally` block cannot itself leave with `return`, `break`, or `continue`. An error that nothing catches ends the program with exit status 1 and a message naming the error and where it happened.

## Capturing errors

`try` before an expression captures an error raised while the expression is evaluated, instead of letting it travel up. The result is an `Outcome<T>`, either `success(value)` or `failure(problem)`:

```sayon
io = import("standard/io.sayon")

result = try io.read_file("data.txt")
if result is error
    print("Read failed: {result.message}")
else
    print(result)
```

- `value is error` is true when an `Outcome` holds a failure (or a union holds an `Error`). Like the union tests, it narrows the variable: where it is true the variable is the `Error`, and where it is false it is the successful value.
- An `Outcome` must be tested before its contents are used. It can also be matched: `case success(value)` and `case failure(problem)`.
- A `try` whose result is thrown away, such as the statement `try save(notes)`, is reported as a warning, since an error would go unnoticed.
- `try` applies to the expression that follows it, as `not` does: `try parse(text)` captures errors from the call and from evaluating its arguments, and an arithmetic expression needs parentheses, as in `try (total / count)`.
- Errors that are not recoverable, such as running out of stack, are not captured.

Error codes raised by the language and its built-in functions:

| Code | Raised by |
|---|---|
| `UserError` | `error(message)` |
| `OverflowError` | integer arithmetic outside the type's range |
| `DivisionByZeroError` | integer `/` or `%` by zero |
| `BoundsError` | an array index outside the array |
| `KeyError` | reading a dictionary key that is not present |
| `ConversionError` | a numeric conversion that does not fit |
| `ParseError` | `tonumber` on text that is not a number |
| `RangeError` | `range` with a step of zero |
| `AssertionError` | a failed `assert` |
| `IOError`, `EncodingError` | file and output failures, and files that are not UTF-8 |
