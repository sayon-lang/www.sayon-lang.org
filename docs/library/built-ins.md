# Built-in functions

| Function | Description |
|---|---|
| `print(values...)` | Writes the values separated by spaces, then a newline |
| `length(value)` | Characters in a string, elements in an array, entries in a dictionary |
| `bytelength(text)` | Bytes in a string's UTF-8 encoding |
| `typeof(value)` | The name of the value's type, or of the member a union holds |
| `tostring(value)` | Display text for any value |
| `tonumber(text)` | Parses `integer or float`; numbers are returned unchanged |
| `assert(condition, message)` | Raises an `AssertionError` when the condition is false; the message is optional |
| `range(start, end, step)` | A range of integers; see above |
| `push(update array, own value)` | Adds a value to the end of an array |
| `pop(update array)` | Removes and returns the last element, or `nothing` when empty |
| `remove(update array, position)` | Removes and returns the element at a position, moving the later ones down; `BoundsError` outside the array |
| `remove(update dict, key)` | Removes a key's entry and returns its value, or `nothing` when the key is absent; the other entries keep their order |
| `swap(update array, first, second)` | Exchanges two elements |
| `swap(update array, position, update other, other_position)` | Exchanges an element of one array with an element of another array of the same type; the two can't be the same array |
| `share(own value)`, `cell(own value)` | A `Shared<T>` or a `Cell<T>`; see [Shared values](../language/ownership.md#shared-values) |
| `view(items, start, end)`, `mutable_view(update items, start, end)` | A view of elements; see [Views](../language/ownership.md#views) |
| `split_view(update view, count)` | Splits the first `count` elements off a view into a view of their own |
| `haskey(dict, key)` | Whether a dictionary has a key |
| `clone(value)` | An independent copy |
| `move(name)` | Transfers a variable's value explicitly |
| `readfile(path)` | A file's whole content as text |
| `writefile(path, text)` | Replaces a file's content |
| `error(message)` | Raises a `UserError` |
| `raise(problem)` | Raises an existing `Error` |
| `c_string(text)` | A copy of text for C code; see [C functions and unsafe code](../language/c-and-unsafe.md) |
