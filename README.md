<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">www.sayon-lang.org</h1>

<p align="center">Programming made easy. Safety made automatic.</p>

Sayon's website, and the only one: what [Sayon](https://github.com/sayon-lang/sayon) is, its guides, its package registry, and the accounts people publish packages with, served by one Sayon program. It will be published at `www.sayon-lang.org`. Until then it runs on your own computer, where `sayon` finds its registry by default.

## On this computer

With Sayon, and nothing else, from this folder:

```bash
sayon run -- --port 4100
```

It serves the website at `http://127.0.0.1:4100`:

| Address | What |
| --- | --- |
| `/` | What Sayon is, a first program, and how to get started |
| `/docs` | The guides, from the Markdown of [`docs`](docs) |
| `/packages` | Every package, a search, and a page for each |
| `/account` | Your dashboard; `/account/tokens` and `/account/settings` your tokens and settings |
| `/users/<name>` | A person's profile, with their packages |
| `/sign-up`, `/sign-in`, `/forgot` | Making an account, signing in, and a forgotten password |
| `/api/v1`, `/index` | The registry's API and index, which `sayon` uses ([PROTOCOL.md](PROTOCOL.md)) |

`sayon login` opens the website's page for the sign-in in your browser; approve it there, signed in or making an account on that page, and `sayon publish` publishes as you. The website keeps accounts, owners, and archives in the folder `data`, and the index in `data/index`, and prints one line of JSON with its addresses as it starts. Other options:

- `--data <folder>` keeps the data elsewhere, and `--index <folder>` the index. Given a clone of [packages-index](https://github.com/sayon-lang/packages-index), each publication becomes a commit there, with the operator's own Git identity.
- `--port 0` takes a free port, as the tests of `sayon` do; `SAYON_REGISTRY` then tells `sayon` where the index is.
- `--account <name>` makes an account without a password, or takes away an existing one's tokens, and gives it a new token, which the first line shows: for tests and scripts.
- `--reset <name>`, instead of serving, prints a link that chooses an account's password, once, within an hour. The website serving that data folder at that port answers it.
- `SAYON_REGISTRY_ADMIN_TOKEN` is the operator's token, for making accounts with `POST /api/v1/users`.
- `SAYON_MAIL_HOST`, with `SAYON_MAIL_PORT`, `SAYON_MAIL_USER`, `SAYON_MAIL_PASSWORD`, and `SAYON_MAIL_FROM`, name the SMTP server the website mails through: links that verify an address and choose a new password. Without one it keeps each mail in `data/mail`, and says so in its log, so that everything works on your own computer.

## How it is made

`src/main.sayon` reads the options and the guides and starts `src/server.sayon`, which answers one request at a time, so that publications never interleave:

- `src/pages`: the first page, and the guides, made HTML once as the website starts;
- `src/packages`: the registry's API and index, checking archives and manifests as `sayon` does, and its pages;
- `src/accounts`: accounts with passwords kept by `crypto.hash_password`, tokens kept as their SHA-256, browsers signed in, the sign-ins `sayon login` starts, and the pages for all of them;
- `src/web`: HTTP with cookies and forms, Markdown, Sayon's highlighting, and the frame every page shares, in the look of `static/style.css` and `static/site.js`.

## Tests

```bash
sayon test
```

The tests check versions, archives, manifests, the index, accounts, sessions, sign-ins, Markdown, and highlighting, and run the server: to publish, refuse, serve the index and archives, the first page, the guides, and the packages; and to make accounts, sign in and out, refuse forms from other sites, and approve and deny `sayon login`'s sign-ins. The tests of [sayon-lang/sayon](https://github.com/sayon-lang/sayon) also run `sayon` itself against this website, `sayon login` in a browser's place among them, when this repository is checked out beside it, as `../www.sayon-lang.org`.

## Writing the guides

The guides describe Sayon as it is implemented: a change to the language goes with a change to them. They are Markdown in [`docs`](docs), which GitHub shows as it is, and which the website reads when it starts.

## The logo

`static/images/logo.svg` is Sayon's logo, vermilion `#DB5735`; `favicon.ico` and `images/icon-256.png` are made from it. Keep its square and its margin, and don't crop, stretch, or recolor it; [sayon-lang/sayon's assets](https://github.com/sayon-lang/sayon/tree/main/assets) hold every version of it.

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
