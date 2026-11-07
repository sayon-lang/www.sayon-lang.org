<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">www.sayon-lang.org</h1>

<p align="center">Programming made easy. Safety made automatic.</p>

Sayon's website, and the only one: what [Sayon](https://github.com/sayon-lang/sayon) is, its guides, its package registry, its community's forum, and the accounts people publish and post with, served by one Sayon program. It will be published at `www.sayon-lang.org`. Until then it runs on your own computer, where `sayon` finds its registry by default.

## On this computer

With Sayon, and nothing else, from this folder (a Sayon whose `standard/graphics` reads JPEG images and draws them scaled, as sayon-lang/sayon's main branch does):

```bash
sayon run -- --port 4100
```

It serves the website at `http://127.0.0.1:4100`:

| Address | What |
| --- | --- |
| `/` | What Sayon is, a first program, and how to get started |
| `/docs` | The guides, from the Markdown of [`docs`](docs), in five categories: Get started, The language, Standard library, Tools, and Reference; `/docs/<category>` lists one's guides |
| `/search` | A search of the guides' sections, the packages, and the forum's threads |
| `/play` | The playground: write a program, run it in Sayon's sandbox, format it, and share it at `/play/<id>`; `/play?example=<name>` opens an example of [`playground`](playground) |
| `/packages` | Every package, a search, and a page for each |
| `/community` | The forum: the latest threads, each category's, and each thread; `/community/new` starts one |
| `/account` | Your dashboard; `/account/tokens` and `/account/settings` your tokens and settings |
| `/users/<name>` | A person's profile, with their picture, packages, and threads |
| `/sign-up`, `/sign-in`, `/forgot` | Making an account, signing in, and a forgotten password |
| `/api/v1`, `/index` | The registry's API and index, which `sayon` uses ([PROTOCOL.md](PROTOCOL.md)) |

`sayon login` opens the website's page for the sign-in in your browser; approve it there, signed in or making an account on that page, and `sayon publish` publishes as you. The website keeps accounts, owners, and archives in the folder `data`, and the index in `data/index`, and prints one line of JSON with its addresses as it starts. Other options:

- `--data <folder>` keeps the data elsewhere, and `--index <folder>` the index. Given a clone of [packages-index](https://github.com/sayon-lang/packages-index), each publication becomes a commit there, with the operator's own Git identity.
- `--port 0` takes a free port, as the tests of `sayon` do; `SAYON_REGISTRY` then tells `sayon` where the index is.
- `--account <name>` makes an account without a password, or takes away an existing one's tokens, and gives it a new token, which the first line shows: for tests and scripts.
- `--admin <name>` makes an account an admin of the website, as it stays: admins start threads in Announcements, moderate the forum, and make accounts moderators on their profiles.
- `--reset <name>`, instead of serving, prints a link that chooses an account's password, once, within an hour. The website serving that data folder at that port answers it.
- `SAYON_REGISTRY_ADMIN_TOKEN` is the operator's token, for making accounts with `POST /api/v1/users`.
- `SAYON_MAIL_HOST`, with `SAYON_MAIL_PORT`, `SAYON_MAIL_USER`, `SAYON_MAIL_PASSWORD`, and `SAYON_MAIL_FROM`, name the SMTP server the website mails through: links that verify an address and choose a new password, and news of replies. Without one it keeps each mail in `data/mail`, and says so in its log, so that everything works on your own computer.
- `SAYON_PLAYGROUND` names the `sayon` the playground runs programs with, which must have `sayon run --sandbox`; without it, the one the system finds.

## The playground

Each program sent to `/play` is written as `main.sayon` in an empty folder of its own under `data/playground/runs`, run with `sayon run --sandbox`, and taken away with its folder. The sandbox gives it only the console, tasks, clocks, random numbers, and the library's pure parts, imports for it only the standard library, and stops it after 5 seconds of processor time or 10 in all, or past 256 MiB of memory or 64 KiB of output ([the sandbox](docs/tools/targets.md#the-sandbox)). The website runs two programs at a time, and lets a computer run 30 in ten minutes and share 10 in an hour. A shared program is kept in `data/playground/shared` by the start of its digest, so the same program has the same address.

A website open to anyone should still run as an account that may do nothing else, in a container or a machine of its own, as any server that runs strangers' code should: the sandbox keeps a program from the computer, and those keep a mistake in the sandbox, should there be one, from the rest.

## How it is made

`src/main.sayon` reads the options and the guides and starts `src/server.sayon`, which answers each connection in a task of its own, so that a slow one holds up no one, and tells a computer that makes too many accounts, sign-ins, mails, or posts to wait (429, by `server.rule`). Passwords are hashed on threads of their own, publications take turns since each runs Git, and the pages link the stylesheet with its version in the address, so that browsers keep it until it changes. No script runs on the website, and its pages forbid them: forms do what scripts would, the theme's switch among them, whose choice the website keeps in a cookie and puts on each page it sends. The parts:

- `src/pages`: the first page; the guides, made HTML once as the website starts, in the categories and order of their map; the search, which goes through the guides' sections, the packages, and the forum's threads; and the playground;
- `src/packages`: the registry's API and index, checking archives and manifests as `sayon` does, and its pages;
- `src/accounts`: accounts with passwords kept by `crypto.hash_password`, tokens kept as their SHA-256, browsers signed in, the sign-ins `sayon login` starts, pictures (a PNG or JPEG image sent by a plain form, as multipart/form-data, decoded and turned as a photo's orientation says, its middle square made 256 pixels a side on a thread of its own, and kept in `data/pictures` as its pixels alone), and the pages for all of them;
- `src/community`: the forum, with its threads in `data/community`: categories, posts in Markdown shown safely (HTML as text, links only to the web, marked as the poster's), solved questions in Help, reports, and the moderators' tools; a new account posts ten times a day in its first week, and a verified email posts;
- `src/web`: HTTP with cookies and forms, Markdown, Sayon's highlighting, and the frame every page shares, in the look of `static/style.css`.

## Tests

```bash
sayon test
```

The tests check versions, archives, manifests, the index, accounts, sessions, sign-ins, Markdown, and highlighting, and run the server: to publish, refuse, serve the index and archives, the first page, the guides (in their map's categories and order, with every link between them leading somewhere, and the language's references the same as it has them), the search, and the packages; and to make accounts, sign in and out, refuse forms from other sites, and approve and deny `sayon login`'s sign-ins, and to keep, show, refuse, and remove pictures; and to answer others while one computer is slow, answer HEAD, let browsers keep the stylesheet, send no script, keep the theme a browser chose, and count tries and accounts sent at once; and in the forum, to ask, answer, and mark a question solved, keep HTML and other links out of posts, keep who may not post from posting, and moderate. The tests of [sayon-lang/sayon](https://github.com/sayon-lang/sayon) also run `sayon` itself against this website, `sayon login` in a browser's place among them, when this repository is checked out beside it, as `../www.sayon-lang.org`.

## Writing the guides

The guides describe Sayon as it is implemented: a change to the language goes with a change to them. They are Markdown in [`docs`](docs), which GitHub shows as it is, and which the website reads when it starts. `src/web/markdown.sayon` makes them HTML: headings with the ids GitHub gives them, paragraphs, lists, tables, code (Sayon's highlighted), and in text `code`, **strong**, *emphasis*, and links.

[`docs/README.md`](docs/README.md) is their map: a heading for each category, with a sentence about it, and its guides as `- [Title](path.md): summary`. The website builds from it the docs' first page, each category's page, the sidebar, the order of Previous and Next, and each guide's description, and each category's guides are in a folder of its own, its address: `docs/language/ownership.md` is `/docs/language/ownership`. A new guide is a file there and a line in the map. A guide outside `docs`, such as [PROTOCOL.md](PROTOCOL.md), is at its category's address, by its name. Write links as GitHub reads them, from the guide's own folder (`../tools/targets.md#wasi`): on the website, a link to a guide goes to its page, and one to another file to GitHub. The tests check that every link between the guides leads to a page and a section that exist. A block of Sayon written ```` ```sayon run ```` is a whole program, which GitHub shows as any other: the website puts a button under it that runs it in the playground, and the tests run each one in the sandbox, so that the guides' programs keep working.

Three of them are copies: `docs/reference/api.md`, `error-codes.md`, and `features.md`, the standard library's API, the error codes, and the feature ledger, change with the compiler, so they are written beside its code, in sayon-lang/sayon's `docs` (as `api.md`, `errors.md`, and `features.md`). Change them there, then copy them here with the language's checkout beside this one, as `../sayon`, or named:

```bash
sayon run scripts/language_docs.sayon
sayon run scripts/language_docs.sayon -- --check ../sayon
```

With the language beside it, `sayon test` fails while a copy is not the language's text.

## The logo

`static/images/logo.svg` is Sayon's logo, vermilion `#DB5735`; `favicon.ico` and `images/icon-256.png` are made from it. Keep its square and its margin, and don't crop, stretch, or recolor it; [sayon-lang/sayon's assets](https://github.com/sayon-lang/sayon/tree/main/assets) hold every version of it.

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
