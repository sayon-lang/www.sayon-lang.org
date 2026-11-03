# Sayon's documentation

Guides to Sayon as it is implemented today: installing it, writing programs, its standard library, its tools, and references to look things up.

## Get started

Install Sayon, then write and run a first program.

- [Installing](get-started/installing.md): the installer for each device, what it changes, and building it yourself
- [Your first program](get-started/first-program.md): a script, a project, checking, testing, and formatting, step by step

## The language

How Sayon programs are written. What is planned for later is in the [feature ledger](reference/features.md); using it is an `E_UNAVAILABLE` error that names its milestone.

- [Basics](language/basics.md): programs, source files, comments, names, and bindings
- [Values and operators](language/values.md): numbers, strings, arrays, dictionaries, and what works on them
- [Types](language/types.md): inference, unions and narrowing, structures, and enums
- [Control flow](language/control-flow.md): conditions, loops, and matching
- [Functions](language/functions.md): parameter modes, methods, and closures
- [Ownership](language/ownership.md): who owns each value, views, shared values, and cleanup
- [Errors](language/errors.md): raising errors, and capturing them as values
- [Modules](language/modules.md): importing other files, and what a file keeps to itself
- [C functions and unsafe code](language/c-and-unsafe.md): calling C, its structures, and functions that C calls back

## Standard library

The modules any program can import, and the functions every program has.

- [Overview](library/overview.md): the modules, input and output, the environment, random numbers, and other programs
- [Built-in functions](library/built-ins.md): what every program has without an import
- [Collections](library/collections.md): sorting, sets, queues, stacks, lists, and maps
- [Files](library/files.md): files, directories, and paths
- [JSON](library/json.md): reading and writing JSON, typed or not
- [Time](library/time.md): durations, clocks, dates, and time zones
- [Tasks and threads](library/tasks.md): doing several things at once, with channels between them
- [Networking](library/networking.md): TCP, UDP, TLS, and HTTP
- [Graphics](library/graphics.md): drawing, images, and windows

## Tools

The `sayon` command, and what it does with a project.

- [Commands](tools/commands.md): every command and its options
- [Projects and packages](tools/projects.md): `sayon.toml`, dependencies, versions from the registry, and publishing
- [Targets](tools/targets.md): building for other systems, WASI, web pages, Android, and capabilities
- [Tests](tools/testing.md): writing tests and running them
- [Formatting and linting](tools/formatting.md): one layout for all code, and warnings about likely mistakes
- [Editors](tools/editors.md): the language server and the VS Code extension

## Reference

Lists to look things up in.

- [Standard library API](reference/api.md): every export of the standard library, with its declaration
- [Error codes](reference/error-codes.md): what each diagnostic and runtime error code means
- [Feature ledger](reference/features.md): what exists, what is planned, and for which milestone
- [Registry protocol](../PROTOCOL.md): how `sayon` and the package registry talk
