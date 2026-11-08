# Your first program

Sayon can run a single file on its own, or a project made of many files. This page walks through one of each, then checks, tests, and formats the project. You'll need Sayon installed first (see [Installing](installing.md)).

## A script

A script is a file of statements, which run in order. Save this as `hello.sayon`:

```sayon run
print("Hello, world!")
```

Then run it:

```text
$ sayon run hello.sayon
Hello, world!
```

`sayon run` checks the whole program before any of it runs, then runs it in the interpreter. `sayon run --native hello.sayon` compiles it to a native program first and runs that, and `sayon build hello.sayon` only writes the program, to run later.

## A project

A project is a folder whose `sayon.toml` names the file it starts from. `sayon init` makes one, with an example to start from:

```text
$ sayon init greeter
Created greeter/ with sayon.toml, src/main.sayon, src/greetings.sayon, .gitignore, and README.md
```

`sayon.toml` says what the project is, and where it starts:

```toml
[package]
name = "greeter"
version = "0.1.0"
entry = "src/main.sayon"
```

`src/main.sayon` imports the other file, by its path from the project's folder, and calls its function:

```sayon
# The program starts here. Run it with `sayon run`.
greetings = import("src/greetings.sayon")

print(greetings.greeting("world"))
```

`src/greetings.sayon` defines the function, with a test beside it:

```sayon
# Greetings, used by main.sayon. Run the tests with `sayon test`.

function greeting(name: string) -> string
    return "Hello, {name}!"

test "greets by name"
    assert(greeting("Sayon") == "Hello, Sayon!")
```

In the project's folder, `sayon run` needs no file: it runs the one `sayon.toml` names.

```text
$ cd greeter
$ sayon run
Hello, world!
```

## Tests

A `test` block runs only under `sayon test`, which runs each test of the project and says how it went:

```text
$ sayon test
src/greetings.sayon
  ok      greets by name
1 test: 1 passed, 0 failed
```

[Tests](../tools/testing.md) says more about writing them.

## When something is wrong

Each value has one owner, and giving it to another variable moves it there. Change `src/main.sayon` to use a list of names after giving it away:

```sayon
greetings = import("src/greetings.sayon")

names = ["Ada", "Grace"]
team = names
print(length(names))
```

`sayon check` finds every problem without running anything, and says how to fix each one:

```text
$ sayon check
error[E_MOVED_VALUE]: `names` was transferred to `team`
  --> src/main.sayon:5:14
   |
 4 | team = names
   |        ----- ownership transferred here
 5 | print(length(names))
   |              ^^^^^ `names` no longer owns the array
   |
   = help: use `team` here, or write `team = clone(names)` when you need two independent copies

1 error found; nothing was run
run `sayon explain E_MOVED_VALUE` to learn more about an error
```

`sayon run` and `sayon test` check the same way first, and run nothing while there are errors. `sayon explain E_MOVED_VALUE` says more about the error, as [the error codes](../reference/error-codes.md#e_moved_value) do for each code. Here, `clone` makes a second list for `team`, and the program runs:

```sayon
greetings = import("src/greetings.sayon")

names = ["Ada", "Grace"]
team = clone(names)
for name in team
    print(greetings.greeting(name))
print(length(names))
```

```text
$ sayon run
Hello, Ada!
Hello, Grace!
2
```

[Ownership](../language/ownership.md) explains who owns what, and when the compiler borrows a value instead of moving it.

## Formatting and linting

`sayon fmt` lays out every source file of the project the one way Sayon is written, and `sayon fmt --check` only says which files it would change. Written carelessly, as

```text
function  shout(text:string)->string
  return text+"!"
```

the function becomes:

```sayon
function shout(text: string) -> string
    return text + "!"
```

`sayon lint` checks as `sayon check` does, and also warns about code that works but is likely not what was meant, such as a value no one reads:

```sayon
greetings = import("src/greetings.sayon")

function welcome(name: string) -> string
    greeting = greetings.greeting(name)
    return "Welcome, {name}."

print(welcome("Ada"))
```

```text
$ sayon lint
warning[W_UNUSED_VARIABLE]: `greeting` is given a value that is never read
  --> src/main.sayon:4:5
   |
 4 |     greeting = greetings.greeting(name)
   |     ^^^^^^^^
   |
   = help: remove it, or name it `_greeting` if it is meant to be unused

1 warning found
```

## An editor

The [Sayon extension for VS Code](https://github.com/sayon-lang/sayon-vscode) shows these errors as you type, completes names, and more; [Editors](../tools/editors.md) has the rest.

## Next

- [Basics](../language/basics.md) starts the guide to the language: how programs run, and how they are written.
- [The standard library](../library/overview.md) lists what programs can import.
- [Commands](../tools/commands.md) lists everything `sayon` does.
