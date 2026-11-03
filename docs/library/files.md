# Files

`io.open(path, mode, encoding)` opens a file to read a part at a time (mode `"r"`, the default), to write from the start (`"w"`, which creates the file or empties it), or to write at its end (`"a"`). Reading and writing go through a buffer. Its text is UTF-8 unless an encoding of `strings.encode` is given, as in `io.open("notes.txt", "r", "utf-16")`; such a file reads and writes text as usual, has no positions to `seek` to, and fails with `EncodingError` for text not in its encoding.

```sayon
io = import("standard/io.sayon")

log = io.open("log.txt", "w")
log.write_line("started")
log.close()

file = io.open("large.txt")
for line in file.lines()
    print(line)
file.close()
```

- `read_line` and `lines` give lines without their endings, accepting LF and CRLF; the last line need not end with one. A line longer than the file's `line_limit` (`io.LINE_LIMIT`, 1 MiB, unless changed with `file.line_limit = ...`) raises `IOError`, and the rest of that line stays unread, so a hostile file cannot fill memory.
- `read` gives the rest of the file as text; `read_bytes(count)` and `write_bytes(bytes)` work with `Array<byte>`, keeping any bytes as they are. `position()` and `seek(position)` count bytes from the start.
- `close()` writes what is still buffered and closes the file, raising `IOError` if writing fails; the file cannot be used afterwards. A file that is not closed is closed when it is no longer used, but without a report, and before the program ends every open file's buffer is written. `flush()` passes buffered output to the system; it does not wait for the disk.
- While a loop over `file.lines()` runs, the file is borrowed: closing it, or reading or writing it another way, is `E_BORROW_CONFLICT`.
- A file has one owner, so `clone(file)` is an error, as is cloning anything holding a file; a generic function that clones values of its type parameter cannot be given one. Lines kept from `file.lines()` after the file is closed raise `IOError`.
- `io.copy(source, target)` copies the rest of one file to another 64 KiB at a time and returns the number of bytes.
- `io.input()` is standard input as a file, read with the same methods and sharing what is read with `io.read_line()`; it cannot `seek`.
