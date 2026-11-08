<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">www.sayon-lang.org</h1>

This is [Sayon](https://github.com/sayon-lang/sayon)'s website. It's a single Sayon program that serves everything: the home page, the guides, a playground for trying code, the package registry, the community forum, and the accounts people use to publish and post. It will live at `www.sayon-lang.org`. Until then it runs on your own computer, which is also where `sayon` looks for its registry by default.

## Running it

All you need is Sayon. From this folder:

```bash
sayon run -- --port 4100
```

Then open `http://127.0.0.1:4100`. (It needs a Sayon recent enough to read JPEG images and draw them scaled, as the main branch does.)

| Address | What's there |
| --- | --- |
| `/` | What Sayon is, a first program, and how to get started |
| `/docs` | The guides, in five categories. `/docs/<category>` lists one category |
| `/search` | Search across the guides, the packages, and the forum |
| `/play` | The playground: write a program, run it, format it, share it at `/play/<id>`. `/play?example=<name>` opens one of the examples in [`playground`](playground) |
| `/packages` | Every package, with search and a page for each |
| `/community` | The forum. `/community/new` starts a thread |
| `/account` | Your dashboard, with your tokens at `/account/tokens` and settings at `/account/settings` |
| `/users/<name>` | Someone's profile, with their picture, packages, and threads |
| `/sign-up`, `/sign-in`, `/forgot` | Making an account, signing in, and resetting a password |
| `/api/v1`, `/index` | The registry's API and index, which `sayon` talks to (see [PROTOCOL.md](PROTOCOL.md)) |

`sayon login` opens a sign-in page here in your browser. Approve it there, signed in or with a new account, and `sayon publish` will publish as you.

The website keeps its data (accounts, package owners, and archives) in the `data` folder, with the index in `data/index`. When it starts, it prints one line of JSON with its addresses.

### Options

- `--data <folder>` and `--index <folder>` keep the data and the index somewhere else. Point `--index` at a clone of [packages-index](https://github.com/sayon-lang/packages-index) and every publication becomes a commit there, made with your own Git identity.
- `--port 0` picks any free port, which is what `sayon`'s tests do. `SAYON_REGISTRY` then tells `sayon` where the index is.
- `--account <name>` makes an account with no password and gives it a fresh token, shown on the first line. If the account exists, its old tokens stop working. It's meant for tests and scripts.
- `--admin <name>` makes an account an admin. Admins post in Announcements, moderate the forum, and can make other accounts moderators.
- `--reset <name>` prints a link for choosing a new password instead of starting the server. The link works once, for an hour, on the website that uses the same data folder and port.
- `SAYON_REGISTRY_ADMIN_TOKEN` is the operator's token, for making accounts through `POST /api/v1/users`.
- `SAYON_MAIL_HOST`, along with `SAYON_MAIL_PORT`, `SAYON_MAIL_USER`, `SAYON_MAIL_PASSWORD`, and `SAYON_MAIL_FROM`, set the SMTP server for the mail the website sends: address verification, password resets, and reply notifications. Without them, each mail lands in `data/mail` and the log says so, so everything still works on your own computer.
- `SAYON_PLAYGROUND` names the `sayon` the playground uses. It needs `sayon run --sandbox`. By default it's whichever `sayon` the system finds.

## The playground

Every program sent to `/play` is written to `main.sayon` in a fresh folder under `data/playground/runs`, run with `sayon run --sandbox`, and deleted along with its folder afterwards.

The sandbox only lets a program use the console, tasks, clocks, random numbers, and the parts of the standard library that don't touch the outside world. It can't import anything but the standard library. It's stopped after 5 seconds of processor time or 10 seconds in all, or when it goes past 256 MiB of memory or 64 KiB of output. [The sandbox](docs/tools/targets.md#the-sandbox) has the details.

The website runs two programs at a time. Each computer can run 30 programs every ten minutes and share 10 an hour. Shared programs are kept in `data/playground/shared`, named after their digest, so the same code always gets the same address.

One warning for anyone hosting this publicly: run it under an account that can't do anything else, inside a container or on its own machine. That's good practice for any server that runs other people's code. The sandbox keeps programs away from the computer, and the container keeps any mistake in the sandbox from reaching further.

## How it's built

`src/main.sayon` reads the options and the guides, then starts `src/server.sayon`. Every connection gets its own task, so one slow visitor doesn't hold up anyone else. Computers that make too many accounts, sign-ins, emails, or posts are asked to wait (429), using `server.rule`. Passwords are hashed on separate threads, and publications run one at a time because each one runs Git.

The website runs no JavaScript at all, and its pages forbid scripts outright. Plain forms do the work instead, including the light and dark theme switch, whose choice lives in a cookie.

- `src/pages`: the home page, the guides (turned into HTML once at startup), search, and the playground.
- `src/packages`: the registry's API and index, which check archives and manifests the same way `sayon` does, and the package pages.
- `src/accounts`: accounts, tokens (stored as their SHA-256), sessions, the sign-ins `sayon login` starts, and profile pictures. A picture can be a PNG or a JPEG. It's turned the right way up, cropped to a square, scaled to 256 pixels on a thread of its own, and stored in `data/pictures`.
- `src/community`: the forum, kept in `data/community`. Posts are Markdown, shown safely: HTML appears as text, and only web links are allowed. Questions in Help can be marked solved. New accounts can post ten times a day in their first week, and posting needs a verified email.
- `src/web`: HTTP with cookies and forms, Markdown, Sayon syntax highlighting, and the frame every page shares. The look is in `static/style.css`.

## Tests

```bash
sayon test
```

The tests cover the registry (versions, archives, manifests, the index, publishing and refusing), accounts, sessions, sign-ins, pictures, Markdown, highlighting, search, the playground, and the forum, and they run the whole server for most of it. They also check that every link between the guides leads to a real page and section, that every runnable example in the guides still runs, and that no page sends a script.

The tests in [sayon-lang/sayon](https://github.com/sayon-lang/sayon) also run `sayon` itself against this website, including `sayon login` in place of a browser, when this repository is checked out next to it as `../www.sayon-lang.org`.

## Writing the guides

The guides describe Sayon as it actually works, so a change to the language comes with a change to them. They're Markdown files in [`docs`](docs), readable on GitHub as they are, and the website reads them at startup.

[`docs/README.md`](docs/README.md) is the map: a heading per category with a sentence about it, then its guides as `- [Title](path.md): summary`. The website builds the docs home page, the category pages, the sidebar, the Previous and Next links, and each guide's description from it. Each category has its own folder, and addresses follow the files, so `docs/language/ownership.md` becomes `/docs/language/ownership`. To add a guide, add a file and a line to the map.

Write links the way GitHub reads them, relative to the guide's own folder, like `../tools/targets.md#wasi`. On the website, links between guides go to their pages and links to other files go to GitHub. A guide outside `docs`, such as [PROTOCOL.md](PROTOCOL.md), gets an address in its category.

A code block marked ```` ```sayon run ```` should be a complete program. GitHub shows it like any other block, the website adds a button that opens it in the playground, and the tests run it in the sandbox so it can't quietly break.

Three guides are copies: `docs/reference/api.md`, `error-codes.md`, and `features.md`. They change along with the compiler, so they're written in sayon-lang/sayon's `docs` (as `api.md`, `errors.md`, and `features.md`). Edit them there, then copy them over with the language checked out next to this repository as `../sayon`, or by naming it:

```bash
sayon run scripts/language_docs.sayon
sayon run scripts/language_docs.sayon -- --check ../sayon
```

With the language next to it, `sayon test` fails if a copy is out of date.

## The logo

`static/images/logo.svg` is Sayon's logo, in vermilion `#DB5735`. `favicon.ico` and `images/icon-256.png` are made from it. Please keep its square shape and margin, and don't crop, stretch, or recolor it. [sayon-lang/sayon's assets](https://github.com/sayon-lang/sayon/tree/main/assets) has every version.

## License

[Apache License 2.0 with LLVM's exception](LICENSE), the same as Sayon.
