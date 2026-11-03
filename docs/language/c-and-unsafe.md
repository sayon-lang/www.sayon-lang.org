# C functions and unsafe code

A `foreign` block declares functions of a C library, which the program can then call:

```sayon
foreign "c"
    function strlen(text: c_string) -> c_size
    function malloc(size: c_size) -> pointer
    function free(address: pointer)
    function sprintf(buffer: pointer, format: c_string, ...) -> c_int

name = c_string("Sayon")
print(unsafe strlen(name))       # 5
```

- `"c"` names the target's C runtime; another name is one of the system's libraries, such as `"kernel32"` or `"m"`, which a compiled program is linked with. A declaration gives each parameter its C type, and `...` after them takes further arguments.
- C functions take integers, floats, `pointer`, `c_string`, and C structures, and give integers, floats, `pointer`, C structures, or nothing (`E_FOREIGN_TYPE`). The integer types include the target's C types `c_char`, `c_short`, `c_ushort`, `c_int`, `c_uint`, `c_long`, `c_ulong`, `c_longlong`, `c_ulonglong`, `c_size`, and `c_ssize`, each the integer type of its size on the target the program is checked for: `c_long` is `integer32` on Windows and WebAssembly and `integer64` elsewhere, and `c_size` and `c_ssize`, like `pointer`, are as wide as an address, 32 bits on WebAssembly. `c_float` and `c_double` are `float32` and `float`.
- Arguments after the parameters of a variadic function go as C passes them: an integer narrower than `c_int` becomes a `c_int`, a `float32` becomes a `float`, and an integer literal is a `c_int`.
- `c_string(text)` copies text into a buffer that ends with a NUL byte, for C to read; it fails with `ValueError` when the text holds a NUL character, which C would take for its end. The C string owns its buffer, and C reads it during a call that takes it. It shows as its text, and cannot be cloned or compared. Text that C gives back is a `pointer`, which `memory.read_text` reads.
- A `pointer` is a raw address. `null_pointer` points nowhere; pointers can be compared, and one shows as `pointer` or `null_pointer`, never as its address.

The compiler cannot check what C code does, so calling a C function is unsafe code: the call needs `unsafe` before it, or an `unsafe` block around it (`E_UNSAFE`). `unsafe` marks the code the program vouches for, and nothing else changes inside it: types, ownership, and every other check still apply.

```sayon
memory = import("standard/memory.sayon")

unsafe
    buffer = malloc(64)
    if buffer == null_pointer
        error("out of memory")
    sprintf(buffer, c_string("%d items"), 3)
    print(memory.read_text(buffer))   # 3 items
    free(buffer)
```

- `unsafe` before an expression covers one operand, like `try`: `unsafe strlen(name) + 1` adds 1 to the result of the call. An `unsafe` block is a block with variables of its own, like the body of an `if`.
- An `unsafe function` is one whose callers vouch for how they call it: its body is unsafe code, and every call of it needs unsafe code. A function that makes its C calls correct for every argument needs no marking, and its callers need no `unsafe`; that is how a library wraps C code safely. An unsafe function is declared at the top level of a file (`E_UNSAFE_POSITION`).
- A function literal written in unsafe code is unsafe code too. A C function or an unsafe function cannot be used as a value (`E_UNSAFE_VALUE`), since a function value can be called anywhere.
- `W_UNUSED_UNSAFE` warns of an `unsafe` that nothing inside needs, or one inside unsafe code already.

`standard/memory.sayon` reads and writes the memory C code shares with the program. `read<T>(address, offset)` and `write(address, value, offset)` read and store a number, a pointer, or a C structure `offset` bytes after an address; `size<T>()` is how many bytes one takes; `read_bytes` and `write_bytes` copy bytes; `read_text` reads the C string at an address; `offset(address, bytes)` is another address; `address(text)` is where a C string's text is. The functions that touch memory are unsafe, and fail with `NullPointerError` at `null_pointer`.

## C structures

`foreign type` declares a structure laid out as C lays it out, which C functions take and give by value and which `standard/memory` reads and writes:

```sayon
memory = import("standard/memory.sayon")

foreign type Point = [x: c_int, y: c_int]
foreign type Rectangle = [left: c_int, top: c_int, right: c_int, bottom: c_int]

foreign "user32"
    function PtInRect(rectangle: pointer, point: Point) -> c_int

unsafe
    area = malloc(c_size(memory.size<Rectangle>()))
    memory.write(area, Rectangle(left = 0, top = 0, right = 10, bottom = 5))
    print(PtInRect(area, Point(x = 3, y = 4)))     # 1
    free(area)
```

- Its fields are numbers, `pointer`, and other `foreign type` structures, in C's order: each at the next multiple of its alignment, and the whole a multiple of the largest (`E_FOREIGN_TYPE` for anything else, and for type parameters). Text is a `pointer` to its bytes, a boolean a `c_int`, and a structure that points to another of its type does so with a `pointer`.
- Otherwise it is an ordinary structure: built, read, changed, compared, and shown as any other, and copied, since every field is.
- A variadic C function takes a structure by its address, as a `pointer`.
- Structures go to C and come back as the target's C convention passes them; compiled programs and the interpreter pass them as Windows x64 and Linux x86-64 do, and as AAPCS64 does on ARM64 with Linux or Windows (on Windows, but to and from variadic functions), compiled programs for WASI as WebAssembly's C convention does and for Android on ARM64 as AAPCS64 does, and compiled programs report `ForeignError` on other targets.

## Functions that C calls back

A parameter of a C function can be a function, which C calls during the call:

```sayon
foreign "c"
    function qsort(base: pointer, count: c_size, size: c_size, compare: function(pointer, pointer) -> c_int)

unsafe
    qsort(numbers, 10, 4, function(a: pointer, b: pointer) -> c_int
        return memory.read<integer32>(a) - memory.read<integer32>(b)
    )
```

- The function takes numbers and `pointer` and gives a number, a `pointer`, or nothing (`E_FOREIGN_TYPE`). Any function value of its type goes: a function literal, with what it captured, or a named function.
- C may call it only during the call it was given to, on the same thread, as `qsort`, `bsearch`, and functions that walk a list with a callback do. A C function that keeps the address to call later would call into nothing; the program stops with a fatal error when that is detected.
- A function that C calls cannot wait (`CallbackError`), since its task cannot leave C in the middle of its call.
- Its failure cannot pass through C. The first one is kept, and C gets 0 (or `null_pointer`) from that call and from every later one, without the function running again; once C returns, the call of the C function fails with the error.
- A function that C calls can call C functions too, which can call back in turn.

Compiled programs call C functions on every target. The interpreter calls them on Windows and Linux, x64 and ARM64, so far, loading each library and finding each function the first time the program calls one; elsewhere it reports `ForeignError`, and a program built with `sayon build` calls them. The interpreter has room for functions for 64 different parameters of C functions.
