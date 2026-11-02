<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">Sayon's package registry</h1>

The registry of [Sayon](https://github.com/sayon-lang/sayon) packages, like crates.io for Rust: a website to find packages and to make an account, the API that `sayon publish`, `login`, and `search` use, and the index that `sayon install` reads, served by one Sayon program. [PROTOCOL.md](PROTOCOL.md) is how `sayon` talks to it, and Sayon's index is [packages.sayon-lang.org-index](https://github.com/sayon-lang/packages.sayon-lang.org-index).

Sayon's registry is not operated yet; it will be at `packages.sayon-lang.org`. Until then `sayon` uses the registry on your own computer, whose index is at `http://127.0.0.1:4100/index`, which this repository runs.

## On this computer

With Sayon, and nothing else:

```bash
sayon run -- --port 4100
```

It serves the registry at `http://127.0.0.1:4100`: its pages, its API, and its index at `/index`. It keeps accounts, owners, and archives in the folder `data`, and the index in `data/index`, and prints one line of JSON with its addresses. `sayon` finds it there by default:

```bash
sayon login
sayon publish
```

`sayon login` opens the registry's page for the sign-in in your browser. Approve it there: signed in, or making an account on that page, or before, at `http://127.0.0.1:4100/sign-up`. Other options:

- `--data <folder>` keeps the registry's data elsewhere, and `--index <folder>` its index. Given a clone of packages.sayon-lang.org-index, each publication becomes a commit there, with the operator's own Git identity.
- `--port 0` takes a free port, as the tests of `sayon` do; `SAYON_REGISTRY` then tells `sayon` where the index is.
- `--account <name>` makes an account without a password, or takes away an existing one's tokens, and gives it a new token, which the first line shows: for tests and scripts.
- `--reset <name>`, instead of serving, prints a link that chooses an account's password, once, within an hour: for an account made with `--account`, or a password forgotten, since the registry asks for no email. The registry serving that data folder at that port answers it.
- `SAYON_REGISTRY_ADMIN_TOKEN` is the operator's token, for making accounts later with `POST /api/v1/users`.

## How it is made

`src/main.sayon` reads the options and starts `src/server.sayon`, which answers one request at a time, so that publications never interleave:

- `src/api.sayon`: the API and the index, checking archives (`src/archive.sayon`) and manifests (`src/manifest.sayon`) as `sayon` does;
- `src/index.sayon`: the index's files, a line of JSON for each version, added to and committed;
- `src/accounts.sayon`: accounts, with passwords kept by `crypto.hash_password`, tokens from `standard/crypto` of which only the SHA-256 is kept, and who owns each package;
- `src/sessions.sayon`: browsers signed in, wrong passwords counted, and the operator's links for choosing a password; `src/logins.sayon`: the sign-ins `sayon login` starts;
- `src/site.sayon`: the pages about packages, a list of every package, a search, and a page for each package with its versions and the line that adds it to `sayon.toml`; `src/account.sayon`: the pages for accounts, making one, signing in and out, an account's tokens, packages, and password, and approving a sign-in;
- `src/layout.sayon`: what the pages share, in the frame of Sayon's websites, `src/frame.sayon`, with `static/style.css` and `static/site.js`; www.sayon-lang.org and docs.sayon-lang.org keep the same three files, so a change to one goes to all three;
- `src/http.sayon`: requests and responses, cookies, and forms, over `standard/network`.

## Tests

```bash
sayon test
```

The tests check versions, archives, manifests, the index, accounts, sessions, and sign-ins, and run the server: to publish, refuse, serve the index and archives, and show its pages; and to make accounts, sign in and out, refuse forms from other sites, and approve and deny `sayon login`'s sign-ins. The tests of [sayon-lang/sayon](https://github.com/sayon-lang/sayon) also run `sayon` itself against this registry, `sayon login` in a browser's place among them, when this repository is checked out beside it, as `../packages.sayon-lang.org`.

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
