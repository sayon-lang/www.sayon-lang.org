# Ownership

Each string, array, dictionary, and error, and each structure or enum value that holds one, has exactly one owner, and is destroyed when its owner's scope ends. Sayon checks ownership while compiling; there is no garbage collector, and nothing is copied unless you ask.

- Assigning or passing an owned value to an `own` parameter transfers it. The previous owner can no longer use it, until it is assigned a new value.
- `clone(value)` makes an independent copy. `move(value)` makes a transfer explicit.
- Reading a value through a read parameter, in an expression, or in a `for` loop borrows it temporarily.
- A collection cannot change while a `for` loop over it is running.
- A loop variable over a collection of owned values borrows each element: copy it with `clone` to keep it.
- Elements of a collection cannot be moved out; use `clone(...)` or `pop(...)`.
- An owned field cannot be moved out of a structure held by a variable, which would leave it incomplete: clone the field, or move the whole structure. A field of a computed value, such as `make_person().name`, can be taken, unless the structure has a [finally function](#finally-functions).
- Module constants cannot be moved or changed.
- A closure takes the owned values it captures, and the variables it changes (see [Function values and closures](functions.md#function-values-and-closures)).

```sayon
numbers = [1, 2, 3]
other = numbers
print(numbers)     # error[E_MOVED_VALUE]: `numbers` was transferred to `other`
```

## Views

A view borrows a run of an array's elements without copying them. `view(items, start, end)` shows the elements from `start` up to, but not including, `end`, and `view(items)` all of them; `mutable_view(update items, start, end)` can also change them. The types are `View<T>` and `MutableView<T>`, and a view can be made of another view.

```sayon run
function total(values: View<integer>) -> integer
    sum = 0
    for value in values
        sum += value
    return sum

numbers = [5, 3, 8, 1, 9]
print(total(view(numbers, 1, 4)))     # 12

function double(update values: MutableView<integer>)
    for index in range(length(values))
        values[index] = values[index] * 2

double(mutable_view(numbers, 0, 2))
print(numbers)                         # [10, 6, 8, 1, 9]
```

- `length`, `v[i]`, `for` loops, `print`, and `tostring` work on views as on arrays; `v[i] = value` works on a mutable view. Bounds outside the array raise `BoundsError`.
- While a view is still used later in its block, the array it borrows cannot be changed, moved, or replaced, and while a mutable view is, the array cannot be used at all except through the view. After the view's last use, the array is free again. A view made of another view borrows that view in the same way.
- `split_view(update rest, count)` splits the first `count` elements off a view: it returns them as a view of their own and leaves the others in `rest`. The two parts never overlap, so both can be used, and changed, at the same time, while both still borrow the array. Asking for more elements than the view has raises `BoundsError` and leaves the view as it was.

```sayon run
function add_into(update target: MutableView<integer>, source: MutableView<integer>)
    for index in range(length(target))
        target[index] += source[index]

pairs = [1, 2, 3, 10, 20, 30]
rest = mutable_view(pairs)
front = split_view(rest, 3)      # front shows 1, 2, 3; rest shows 10, 20, 30
add_into(rest, front)
print(pairs)                     # [1, 2, 3, 11, 22, 33]
```

- `strings.byte_view(text, start, end)` is a `View<byte>` of a string's UTF-8 bytes, without copying them; it borrows the string as a view borrows an array, so the variable holding the string cannot be replaced while the view is used.
- A view lives in variables and parameters. It cannot be stored in a collection, structure, enum, or union, captured by a closure, or held by a constant (`E_VIEW_ESCAPE`), and it must borrow a variable, not a temporary array (`E_VIEW_TEMPORARY`).
- A function can return a view of one of its parameters; the caller's argument then stays borrowed for as long as the result is used. Returning a view of the function's own variable is an error (`E_VIEW_RETURN`).
- `View<T>` values are copied like numbers; a `MutableView<T>` is moved, so only one exists at a time. `clone(view)` makes an array of copies of the elements.

## Shared values

Most values have one owner. When several parts of a program need the same value, `share(value)` makes a `Shared<T>`: a handle to one value that every copy of the handle refers to. `shared.value` reads it in place.

```sayon run
type Settings = [name: string, sizes: Array<integer>]

settings = share(Settings(name = "main", sizes = [1, 2, 3]))
other = settings                     # a second handle; both stay usable
print(other.value.name, length(settings.value.sizes))    # main 3
```

- Assigning a handle, passing it, storing it, or capturing it in a closure makes another handle to the same value, so the original stays usable; `move(handle)` hands it over instead. The value is destroyed when its last handle is, so the cost is counting the handles.
- A shared value cannot change (`E_SHARED_IMMUTABLE`), and nothing can be taken out of it; `clone(shared.value)` copies it. A structure holding a handle is still moved like any structure.
- What changes goes in a `Cell<T>`: `cell(value)` makes one, `c.get()` copies its value out, `c.set(value)` replaces it, and `c.replace(value)` replaces it and returns what it held. A cell changes even through a read-only path, so `Shared<Cell<T>>` is state that every handle sees change. Nothing inside a cell can be borrowed, which is what makes this safe; work on a cell's array with `replace` and `set`.
- `shared.weak()` makes a `Weak<T>`, a handle that does not keep the value alive; `weak.upgrade()` gives a `Shared<T>`, or `nothing` once the last `Shared` handle is gone.
- Handles that refer to each other in a circle keep each other alive forever. Point back up a tree, or to anything that owns you, with a `Weak` handle:

```sayon
type Node = [label: string, parent: Cell<Weak<Node> or nothing>, children: Cell<Array<Shared<Node>>>]

function attach(parent: Shared<Node>, child: Shared<Node>)
    child.value.parent.set(parent.weak())
    children = parent.value.children.replace([])
    push(children, child)
    parent.value.children.set(children)
```

- Handles cannot be compared, and a constant cannot hold one or a cell (`E_SHARED_CONSTANT`). They are for one thread; tasks on different threads share a `Mutex` instead (see [Tasks on threads of their own](../library/tasks.md#tasks-on-threads-of-their-own)).

## Finally functions

A structure that owns something outside the program, such as C memory or a handle of the system, releases it in a `finally function`, which runs when a value of the structure is destroyed:

```sayon
type Buffer = [address: pointer, size: integer]

finally function release(update buffer: Buffer)
    unsafe free(buffer.address)

function scratch()
    buffer = Buffer(address = unsafe malloc(64), size = 64)
    # ...
    # Here `buffer` is destroyed, and `release` frees its memory.
```

- It runs wherever a value is destroyed: at the end of its owner's scope, when a variable or an element is given another value, inside collections, unions, enums, closures, and channels, when the last handle of a `Shared` value or a mutex goes, and for module constants at the end of the program. A value that moves is not destroyed; its new owner destroys it once.
- It takes the value as `update`, and runs before the value's fields are destroyed, so it can still use them. It is declared beside its structure, in the same module, and the structure has no type parameters and is not a `foreign type` (`E_FINALLY_FUNCTION`). Each structure has at most one.
- The program never calls it: a call of it, or its use as a value, is `E_FINALLY_FUNCTION`. To destroy a value early, move it into a function that does nothing with it.
- A value of such a structure is never copied: it is not Copy, cannot be cloned (so `mutex.get()` and `cell.get()` do not take one), and its fields cannot be moved out, not even of a computed value (`E_MOVE_OUT_OF_FIELD`). A `match` lends the fields to its names.
- It cannot wait (`FinallyError`), and cannot fail: when an error escapes it, the program stops at once with a fatal error, which names the function, and status 3. Handle the errors it can meet with `try` inside it.
