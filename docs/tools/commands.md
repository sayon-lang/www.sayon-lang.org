# Commands

Everything Sayon does is a word after `sayon`: `sayon run`, `sayon test`, `sayon publish`. `sayon help` lists them all, and `sayon version` prints the version.

Without a file, `run`, `build`, `check`, `lint`, and `test` use the project in the current folder, or in the nearest folder above it with a `sayon.toml`: the file that `entry` names, and for `test` every source file of the project.

## Running and building

| Command | What it does |
|---|---|
| `sayon run [file] [-- arguments]` | Checks a program and runs it in the interpreter. The words after `--` are the program's, which `os.arguments()` gives it |
| `sayon run --native [file]` | Compiles the program to a native executable, and runs that |
| `sayon build [file]` | Compiles a native executable: for a project, to `build/debug/<name>`, or `build/release/<name>` with `--release`; for a file alone, beside it, named after it |

| Option | For | What it does |
|---|---|---|
| `--release` | `build`, `run --native` | Optimizes the native code |
| `-o`, `--output <path>` | `build` | Writes the executable there |
| `--target <target>` | `build`, `check`, `lint` | Builds or checks for a target, such as `linux-x64`, `web`, or `all`; `build` and `check` take more than one |
| `--emit-llvm` | `build` | Writes LLVM IR instead of an executable |
| `--executable` | `build` for Android | Builds a program to run from `adb shell` instead of an app |

[Targets](targets.md) lists every target, and what building for each needs.

## Checking and tidying

| Command | What it does |
|---|---|
| `sayon check [file]` | Reports the program's problems, without running anything |
| `sayon lint [file]` | Reports them too, and warns about likely mistakes and names that break the conventions; `--deny warnings` fails on a warning |
| `sayon fmt [paths...]` | Formats source files, those of the project without paths; `--check` only reports the files it would change |
| `sayon explain <code>` | Explains an error code, such as `E_MOVED_VALUE` |

[Formatting and linting](formatting.md) says what each changes and warns about, and [the error codes](../reference/error-codes.md) are all listed.

## Tests

| Command | What it does |
|---|---|
| `sayon test [files...]` | Runs the `test` blocks of the files, or of the whole project, and says how each went |

[Tests](testing.md) is about writing them.

## Projects and packages

| Command | What it does |
|---|---|
| `sayon init [name]` | Makes a project in a new folder, or makes the current folder one when no name is given |
| `sayon install` | Fetches the project's dependencies and writes `sayon.lock`; `--locked` fails instead of changing it, and `--offline` uses only what was fetched before |
| `sayon search <words>` | Finds packages in the registry; `--limit <count>` shows that many, 50 at most |
| `sayon info <package>` | Shows a package's versions and dependencies |
| `sayon publish` | Publishes the project's package; `--dry-run` shows what it would send, and sends nothing |
| `sayon login` | Signs this computer in to the registry, in the browser; `--no-browser` shows the page's address instead of opening it, and `--token` reads a token from the input |
| `sayon logout` | Revokes this computer's token, and forgets it |
| `sayon clean` | Removes the project's build output |

`search`, `info`, `publish`, `login`, and `logout` take `--registry <address>` for another registry than the one `SAYON_REGISTRY` names, or than Sayon's own. [Projects and packages](projects.md) has the whole story.

## The installation

| Command | What it does |
|---|---|
| `sayon doctor` | Checks the installation and the native toolchain, and says what is missing |
| `sayon target list` | Lists the targets, and what each provides |
| `sayon target setup <target>` | Says what building for a target needs on this computer |
| `sayon target manifest` | Prints the capability manifest, as JSON |
| `sayon lsp` | Serves an editor in the language server protocol, as the [editors](editors.md) start it |

## For every command

| Option | What it does |
|---|---|
| `--color <auto\|always\|never>` | Colors diagnostics, or not; `auto`, the default, colors them in a terminal |
| `-q`, `--quiet` | Prints only errors |

## Exit statuses

| Status | When |
|---|---|
| 0 | Everything worked; a program's own status from `main` is passed on as it is |
| 1 | A program raised an error nothing caught, or a test failed |
| 2 | The source has errors, so nothing ran |
| 3 | A program stopped without cleaning up, such as after recursion without end |
| 4 | A native build could not run: the toolchain is missing, or linking failed |
| 64 | The command line was not right |
| 66 | A file to read could not be read |

## Environment

| Variable | What it names |
|---|---|
| `SAYON_REGISTRY` | The registry, by the address of its index |
| `SAYON_TOKEN` | A token for `sayon publish`, instead of the one `sayon login` keeps |
| `SAYON_CREDENTIALS` | The file to keep tokens in, where the system has no credential store, or instead of it |
| `SAYON_CACHE` | The folder for fetched dependencies |
| `SAYON_CLANG` | The clang executable for native builds |
| `SAYON_RUNTIME_LIB` | The runtime library native programs link |
| `SAYON_STDLIB` | The standard library's folder |
