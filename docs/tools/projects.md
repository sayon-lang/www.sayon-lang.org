# Projects and packages

A single file runs on its own, with imports relative to its directory. A project groups files under a root directory that holds a `sayon.toml` manifest:

```toml
[package]
name = "hello"                 # lowercase letters, digits, and underscores
version = "0.1.0"              # major.minor.patch, and maybe a pre-release: "1.0.0-beta.1"
entry = "src/main.sayon"       # optional; this is the default
authors = ["Ada"]              # optional
description = "Says hello"     # optional
```

`sayon init hello` creates a project in a new folder `hello`, with a manifest, a program, a module with a test, and ignore rules. `sayon init` alone makes the current folder a project, named after the folder (`My Game` becomes `my_game`); it refuses a folder that already has a `sayon.toml`, and keeps any of those files the folder already has. Inside a project (in its root or any directory below it), `sayon run`, `check`, `build`, and `test` need no file name: they use the manifest's entry file. Imports in a project's files resolve from the project root, also when a file is named on the command line. `sayon build` writes `build/debug/<name>` (`build/release/<name>` with `--release`), and `sayon clean` removes the `build` directory. Without file names, `sayon test` runs the tests in `src` and `tests`.

Unknown or misspelled manifest keys are errors. A `[compiler]` table names the project's [targets](targets.md).

## Dependencies

A project can use other Sayon packages: folders with their own `sayon.toml`. Each dependency has an alias, and comes from the package registry by version, from a local folder, or from one exact commit of a Git repository:

```toml
[dependencies]
json = "1.2"                                   # from the registry: 1.2.0 or later, before 2.0.0
http = { version = "0.4", package = "web_http" }   # the registry's `web_http`, imported as `http`
mirror = { version = "2", registry = "https://registry.example.com" }
utilities = { path = "../utilities" }
codec = { git = "https://example.com/team/codec.git", revision = "<full commit id>" }

[dev_dependencies]
checks = { path = "../checks" }    # only for this project's tests
```

A module imports a dependency's files through its alias, with paths inside the dependency's folder:

```sayon
utilities = import("dependencies/utilities/src/library.sayon")
```

- `sayon install` reads the manifests of the project and of every dependency, chooses a version of each registry package, fetches Git and registry sources into a cache, and writes `sayon.lock`, which records each package's source, version, and dependencies, and a digest of each fetched source's files. Commit `sayon.lock` with the project.
- `run`, `check`, `build`, `test`, and `lint` read `sayon.lock`. They never fetch anything or change the lock: when the manifests and the lock disagree, or a cached source no longer matches its digest, they stop and ask for `sayon install`.
- `sayon install --locked` fails instead of changing the lock, for automated builds; `sayon install --offline` uses only sources already in the cache, and the versions the lock chose.
- A dependency's own imports resolve inside its folder, and its `dependencies/...` imports through its own manifest. Packages cannot depend on each other in a cycle. Warnings about a dependency's code are not shown, and `sayon lint` does not lint it.
- A local folder is used as it is, so changes to it take effect at once. A Git dependency names a full commit (`git rev-parse HEAD` prints one); branches and tags would let the code change under the lock.
- Fetched sources are kept in `SAYON_CACHE`, or the user's cache folder (`%LOCALAPPDATA%\Sayon\cache` on Windows). Git must be installed to fetch Git sources.

## Versions from the registry

A version is three numbers, `major.minor.patch`, and may name a pre-release after a `-`, as `1.0.0-beta.1`, which comes before `1.0.0`. A dependency's version is a range of versions it accepts:

| Range | Accepts |
| --- | --- |
| `"1.2.3"` or `"^1.2.3"` | 1.2.3 and later, before 2.0.0 |
| `"1.2"`, `"1"` | 1.2.0 and later, before 2.0.0; 1.0.0 and later, before 2.0.0 |
| `"0.4"`, `"0.4.1"` | 0.4.0 and later, before 0.5.0; 0.4.1 and later, before 0.5.0 |
| `"0.0.3"` | 0.0.3 only |
| `"~1.2.3"`, `"~1.2"` | 1.2.3 and later, before 1.3.0; 1.2.0 and later, before 1.3.0 |
| `"=1.2.3"` | exactly 1.2.3 |
| `">=1.2, <1.5"` | every version both parts accept: `>`, `>=`, `<`, `<=`, `=`, `^`, and `~`, separated by commas |
| `"*"` | every release |

A range accepts a pre-release only when one of its parts names a pre-release of the same three numbers, so `"^1.0"` never picks `1.1.0-beta`.

- A project's graph has one version of each registry package: the latest that every range asking for it accepts. When none is, `sayon install` stops and names the ranges and who asks for each.
- Once `sayon.lock` has a version, `sayon install` keeps it while the ranges still accept it, so installing again changes nothing; to move to a later version, delete `sayon.lock` (or change the range) and install again.
- A registry is named by the address of its index: `SAYON_REGISTRY` names one, or else, until Sayon's registry is operated, it is the one on this computer, whose index is at `http://127.0.0.1:4100/index`; `sayon run -- --port 4100` in [www.sayon-lang.org](https://github.com/sayon-lang/www.sayon-lang.org), Sayon's website, starts it. A dependency without `registry` comes from that registry, and a registry package's own dependencies without `registry` come from its registry. `package` names the package when it differs from the alias.
- Each version's files are checked against the digest the registry published for it when they arrive, and against `sayon.lock` from then on.
- Sayon reaches registries over HTTPS, or over HTTP on this computer, and refuses what no registry should send, such as an archive with a path outside its folder, or an index that names a dependency by something that is not a package name or sends installing to a registry over plain HTTP.

`sayon search json` finds packages by part of their names or descriptions, and `sayon info json` shows a package's versions and dependencies, as its index has them. Both, like every registry command, take `--registry <address>`.

Sayon's first packages are [math_core](https://github.com/sayon-lang/math_core), with whole numbers, exact fractions, complex numbers, matrices, and statistics; [json_parser](https://github.com/sayon-lang/json_parser), with JSON that has comments, JSON Pointer, and JSON Patch; and [http_client](https://github.com/sayon-lang/http_client), a client for HTTP APIs that depends on json_parser. Their repositories show how a package lays out its modules, tests, and examples.

## Publishing

`sayon publish` sends the project's package to the registry: every file in the project's folder but hidden ones (any name starting with `.`), and `build`, `target`, and `sayon.lock` at its top, 10 MiB at most. `sayon publish --dry-run` lists those files, their size, and the digest, and sends nothing.

- Publishing needs an account, which you make on Sayon's website with your email address, and verify by the link it mails. `sayon login` opens the registry's page for the sign-in in your browser, showing the same code as your terminal; approve it there, signed in, or making an account on that page. `sayon login` then keeps the account's new token for this computer: in the Windows Credential Manager, or elsewhere in `~/.config/sayon/credentials`, which only you can read. `--no-browser` shows the page's address without opening it, for a computer without one. `sayon logout` revokes the token and forgets it. For automated publishing, make a token on your account's page, and give it to `sayon login --token`, or set `SAYON_TOKEN`.
- A package's name belongs to the account that published it first. A version never changes once published, so fixing one means publishing the next.
- Everything a published package depends on must come from a registry; `dev_dependencies` may be local, since only the package's own tests use them.
- The registry is part of Sayon's website, [www.sayon-lang.org](https://github.com/sayon-lang/www.sayon-lang.org), whose repository has its protocol and how to run it; Sayon's index is [packages-index](https://github.com/sayon-lang/packages-index).

`sayon doctor` reports the Unicode version the toolchain follows and where the standard library, the runtime library, and clang were found. `sayon explain CODE` explains a diagnostic or runtime error code, and [the error codes](../reference/error-codes.md) are all listed with what they mean.
