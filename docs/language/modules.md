# Modules

Each file is a module. A program imports another file by binding it to a name at the top of a file:

```sayon
geometry = import("modules/geometry.sayon")

print(geometry.area(3, 4))
print(geometry.UNIT)
```

- Import paths are relative to the program's root, the directory of the file you run, whichever file the import appears in. They use forward slashes, name a `.sayon` file, and cannot leave the root (`..` and absolute paths are rejected).
- Spelling must match the file on disk exactly, on every system, so a program behaves the same on Windows and Linux.
- `standard/...` paths name modules of the standard library.
- A module's functions and constants are exported unless marked `private`. Imported modules can only define things: statements that would run on import are rejected.
- Each module is loaded once, however many modules import it. Imports cannot form a cycle.
