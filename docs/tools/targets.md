# Targets

A program is checked and built for a target: a platform and a processor. `sayon run`, `sayon test`, and `sayon build` without `--target` use this computer's own; `--target` names others, and can be given more than once:

```text
sayon check --target web          # check the program as a web page would run it
sayon check --target all          # the project's targets, or windows-x64 and linux-x64
sayon build --target wasi         # a WebAssembly program, on any computer
sayon build --target android-x64  # an Android app, with the Android SDK
sayon target list                 # every target, how far it has come, and what it lacks
sayon target setup wasi           # what building for one needs
sayon target manifest             # the capability manifest, as JSON
```

| Target | Platform | Processor | State |
|---|---|---|---|
| `windows-x64` | `windows` | `x64` | built and run |
| `linux-x64` | `linux` | `x64` | built and run |
| `wasi` | `wasi` | `wasm32` | built on any computer, run under wasmtime |
| `web` | `web` | `wasm32` | built on any computer, run in Edge, Chrome, Firefox, and Node |
| `android-x64` | `android` | `x64` | built on any computer with the Android SDK, run on Android's emulator |
| `android-arm64` | `android` | `arm64` | built on any computer with the Android SDK, run on the emulator through Android's translation of ARM code |
| `linux-arm64` | `linux` | `arm64` | built and run on ARM64 Linux, and built on Linux x64 with the ARM64 C library |
| `windows-arm64` | `windows` | `arm64` | built and run on Windows ARM64, and built on Windows x64 with Visual Studio's ARM64 libraries |
| `macos-arm64`, `macos-x64` | `macos` | `arm64`, `x64` | checked; built from M7 on |
| `ios-arm64`, `ios-simulator-arm64` | `ios` | `arm64` | checked; built from M7 on |

`native` is this computer's target, and the short names `windows`, `linux`, `android`, `macos`, and `ios` are `windows-x64`, `linux-x64`, `android-arm64`, `macos-arm64`, and `ios-arm64`, for good: a later release never moves them to another processor. Each target's LLVM triple, such as `x86_64-unknown-linux-gnu`, names it too. A native program is built on the system it is for, and a Linux or Windows program on its system with either processor, given the libraries of the program's processor (see [Installing](../get-started/installing.md#programs-for-arm64-linux) for Linux, and [for Windows](../get-started/installing.md#programs-for-windows-on-arm64)); for another native target, `sayon build` checks the program but stops before building it. A WebAssembly program is the same wherever it is built, so `wasi` and `web` build on any computer, and so do Android's programs, wherever the Android SDK is. `sayon build` writes a program for a target other than this computer's under `build/debug/<target>/`, or next to a standalone file as `<name>-<target>`, such as `hello-wasi.wasm`.

## WASI

A program built for `wasi` is a WebAssembly module for WASI preview 1 (`wasm32-wasip1`). It runs under a WASI host, which gives it only the folders it is told to:

```text
sayon build --target wasi hello.sayon      # hello-wasi.wasm
wasmtime run --dir . hello-wasi.wasm       # the current folder, as .
```

Building needs the same clang as native builds, with its WebAssembly linker (`wasm-ld`, part of LLVM), and Sayon's runtime for WASI with WASI's C library, which an installation keeps in `lib/wasm32-wasip1`. Programs behave as in the interpreter: Sayon's tests run each example under wasmtime 50 and compare. Tasks and channels work as everywhere and take turns in the same order: WebAssembly has no separate stacks for them, so the compiler turns each function that can wait into one that can stop and continue later, which costs a little more on each call of such a function. WASI has no sockets, threads, or other programs.

## Web pages

A program built for `web` is a WebAssembly module for browsers (`wasm32-unknown-unknown`), with two files the compiler writes beside it: the glue that runs it (`.js`) and a page that shows its output (`.html`):

```text
sayon build --target web hello.sayon       # hello-web.wasm, hello-web.js, hello-web.html
python -m http.server                      # any server: browsers load modules only over HTTP
```

Opening `hello-web.html` from the server runs the program and shows what it prints, its errors in red. A page of your own runs it through the glue, an ES module that works in browsers and in Node:

```js
import { run } from "./hello-web.js";
const status = await run({ write: (stream, text) => show(stream, text) });
```

`run` loads the module from beside the glue, starts the program, and gives its exit status when it ends; `write` receives what the program writes to its output (1) and errors (2), by default the console a line at a time. The page is never blocked: while every task sleeps or waits for a response, the program returns to the browser, which wakes it with a timer or when the response arrives. Ending the program, with `os.exit` or a fault, stops only the program, not the page.

The module imports nothing but the glue's small set of host functions (output, clocks, random numbers, fetching, and ending); a page has no files, standard input, environment, sockets, threads, other programs, or C functions. Its HTTP requests are the browser's: `network.get`, `post`, and `request` work as elsewhere through `fetch` (see [Networking](../library/networking.md)). Sayon's tests run each example in Edge, Chrome, and Firefox, headless, from a server on the same computer, and in Node 24, and compare each with the interpreter.

## Android

A program built for Android is an app: its package (`.apk`) holds the program, compiled for the phone's processor, and Android's own `NativeActivity` starts it, so the app has no Java code.

```text
sayon build --target android-x64 hello.sayon   # hello-android-x64.apk
adb install hello-android-x64.apk
adb shell am start -n sayon.app.hello/android.app.NativeActivity
adb logcat -s sayon sayon-app                  # what it prints
```

`android-arm64` is for phones and `android-x64` for the emulator on a PC. The program runs on a thread of its own when the app starts, so the app keeps answering. What it prints goes to Android's log under the tag `sayon` (its errors at the error level), a line at a time, and when it ends the log says with which status and the app closes. The package is named `sayon.app.` and the program's name, and asks for the internet permission when the program uses the network. Packages run on Android 8.0 (API 26) and newer, are made for Android 16 (API 36), keep the program aligned for phones with 16 KiB pages, and are signed with the debug key Android's tools share, in `.android` in your home folder; a debug build is debuggable. Release signing and store packages come later.

Building needs the Android SDK (`ANDROID_HOME`, or where Android Studio puts it) with its NDK, build tools, and platform `android-36`, and a JDK, 17 or newer, for signing (`JAVA_HOME`); `sayon target setup android-x64` says what is missing. `--executable` builds a program to run from `adb shell` instead, with the shell's own output and errors and an exit status, as Sayon's tests run each example; that shows the runtime works, not that an app does, which is why the tests run some examples as apps too.

An app has the network, threads, C functions, and files of its own: a program starts in the app's private directory, so the files it names by relative paths are the app's. It has no standard input, environment, or other programs. TLS, and so `https://`, is Android's own, which comes from its Java libraries: an app has it, and a program run from `adb shell` does not. Time zones are the phone's, its own zone the local one.

## Platform branches

```sayon
if platform == "web"
    show_in_page(text)
elseif platform == "android"
    show_on_phone(text)
else
    print(text)
```

`platform` is the target's platform: `"windows"`, `"linux"`, `"macos"`, `"android"`, `"ios"`, `"web"`, or `"wasi"`. `processor` is `"x64"`, `"arm64"`, or `"wasm32"`. `supports("name")` is whether the target has a [capability](#capabilities).

An `if` whose condition is made only of these, compared with written names and joined by `and`, `or`, and `not`, is decided by the compiler: only the branch the target selects is checked and compiled. So a branch can call what exists only on its platform, and the others need not even be defined for this target; every branch must still be valid syntax. Checking with `--target` checks the branch of that target, and `--target all` each one. A written name that is no platform, processor, or capability is an error, since its branch would silently never apply.

Anywhere else, `platform` and `processor` are strings and `supports(...)` is a boolean, all fixed when the program is compiled. A variable, function, or import of the program's own with one of these names hides it and is an ordinary value, so `if platform == "web"` after `platform = "web"` is an ordinary condition.

## Capabilities

Each target provides capabilities: what its programs can ask of the system.

| Capability | What it covers | Targets without it |
|---|---|---|
| `console` | `print` and standard output and errors | none |
| `input` | reading standard input | web, Android, iOS |
| `files` | files and directories | web |
| `environment` | environment variables, the current directory, program arguments | web, Android, iOS |
| `processes` | `os.run`, `os.start` | web, WASI, Android, iOS |
| `network` | TCP and UDP sockets, resolving names | web, WASI |
| `http` | the HTTP client | WASI |
| `tls` | `network.connect_secure`, `connection.secure`, `https://` | web, WASI |
| `graphics` | `graphics.open`: windows and the screen (drawing on a canvas needs none) | WASI |
| `tasks` | tasks, channels, `sleep`, `select` | none |
| `threads` | `threads.spawn_parallel` | web, WASI |
| `foreign` | C functions and `standard/memory` | web |
| `time_zones` | IANA time zones | web, WASI |
| `clock`, `random`, `json`, `math`, `text`, `collections` | the rest of the standard library | none |

A program needs a capability when it can reach an operation that uses it: the compiler follows every function the program calls or uses as a value, from its entry through the standard library and its dependencies. Checking or building for a target that lacks one is an error (`E_CAPABILITY`) at the program's own code that leads to the operation. Code in a branch the target does not select needs nothing, so `if supports("files")` keeps file access to the targets with files. A program never meets a capability's absence while it runs.

A project can name its targets and the capabilities it cannot do without:

```toml
[compiler]
targets = ["native", "web"]                    # what --target all means
required_capabilities = ["console", "files"]   # every target must have these
capability_manifest = 1                        # the manifest the project was written for
```

Before checking, `check` and `build` stop for any target that lacks a required capability.

The capabilities, and which targets provide which, are the capability manifest, which has a version: it goes up whenever a capability is added, removed, or renamed, or a target provides others, and not when a target only comes further along. `sayon target list` says which version this compiler has, and `sayon target manifest` prints the whole of it as JSON: each capability with what it lets a program do, and each target with its platform, processor, state, and capabilities. A project that names `capability_manifest` is refused by a compiler of another version, which would check its capabilities by other rules.

## The sandbox

`sayon run --sandbox main.sayon` runs a program from anyone, as the website's playground does, kept from the computer it runs on. It is checked for this computer with only the `console`, `tasks`, `clock`, `random`, `json`, `math`, `text`, and `collections` capabilities, so reaching anything else is `E_CAPABILITY`, as for any target without it, and `supports` is false for the rest. Platform branches are decided for this computer, the one it runs on, so no branch that was not checked runs. While it runs, the interpreter refuses those operations again (`SandboxError`), in case the checker let one through.

The program is one file: it imports only modules of the standard library (`E_SANDBOX_IMPORT` otherwise), and the compiler reads nothing else for it, not even a project around it.

The sandbox stops a program after 5 seconds of processor time or 10 seconds in all, or when it uses more than 256 MiB of memory or writes more than 64 KiB of output; the checking counts too. It ends with status 3, after a line saying which limit it went past:

```text
$ sayon run --sandbox loop.sayon
the sandbox stopped the program: it used 5 seconds of processor time
```

The operating system backs these limits, a little past them: on Windows a job object, which also lets the program start no other process, and on Linux a limit on processor time.
