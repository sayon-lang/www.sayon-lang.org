# The registry protocol

A registry keeps published Sayon packages: each version's archive, and an index of what every version is and depends on. `sayon install` reads the index and fetches archives, `sayon search` asks the API, and `sayon publish`, `login`, and `logout` use the API with an account, which people make on the registry's pages. [The language reference](docs/language.md#versions-from-the-registry) shows how projects use it; this page is how the two sides talk. The client is in [sayon-lang/sayon](https://github.com/sayon-lang/sayon) (`crates/driver/src/registry.rs` and `crates/cli/src/registry.rs`), the server is this repository, Sayon's website, and Sayon's index is [packages-index](https://github.com/sayon-lang/packages-index).

Protocol 1 is HTTPS, or HTTP to `localhost` for a registry on the same computer. A registry is named by its index's address, which `SAYON_REGISTRY` and `--registry` give; this server serves its index at `<registry>/index`.

## The index

Its files are plain text, read with `GET`; Sayon reads only those it needs.

- `config.json`: `{"protocol": 1, "api": "<address of the API>", "download": "<address of an archive, with {name} and {version}>"}`.
- A file for each package, placed by its name as crates.io-index places them: `1/a`, `2/ab`, `3/a/abc`, and `ab/cd/abcdef` for longer names. A package with no file has no versions (404).
- In it, a line of JSON for each version, oldest first; lines are only ever added:

```json
{"name":"words","version":"1.0.0","digest":"sha256:<64 hex digits>","description":"Words, louder","dependencies":[{"alias":"strings","package":"strings","requirement":"0.2","registry":null}],"published":"2026-10-28T09:30:00Z"}
```

A dependency's `registry` is `null` when it comes from the same registry. The latest version is the greatest release, or before the first release the greatest pre-release.

Sayon reads each line as it reads a manifest, since an index could lie: a version of semantic versioning, a digest of `sha256:` and 64 lowercase hexadecimal digits, and dependencies whose aliases and packages are names, whose requirements are ranges `sayon.toml` could hold, and whose `registry` is reached over HTTPS or on this computer. A file with a line it cannot read gives no versions, and it shows the text a registry sends, such as a description or a refusal, without control characters.

## The API

Under `<api>/api/v1`; answers are JSON, but archives. A request the registry refuses gets a status of 400 or more and `{"error": "<why, in a sentence>"}`, which Sayon shows as it is, but for control characters. Sayon reads an answer of 32 MiB at most.

| Request | Answer |
| --- | --- |
| `GET /api/v1` | `{"protocol": 1}` |
| `GET /api/v1/packages/<name>/<version>/archive` | the version's archive, with its digest in `X-Sayon-Digest`, or 404 |
| `GET /api/v1/search?q=<words>&limit=<1 to 50, 20 by default>` | `{"packages": [{"name", "latest", "description"}]}`: the packages with the words in their names or descriptions, an exact name first |
| `PUT /api/v1/packages/<name>/<version>` with the archive, and `Authorization: Bearer <token>` | 201 and `{"name", "version", "digest"}` |
| `GET /api/v1/me` with a token | `{"name": "<account>"}`, or 401 |
| `POST /api/v1/logins` with `{"machine": "<the computer's name>"}` | 201 and `{"secret": "<64 hexadecimal digits>", "code": "<as WDJB-MJHT>", "interval": <seconds>, "expires": <seconds>}`: a sign-in for `sayon login` (see Accounts) |
| `POST /api/v1/logins/poll` with `{"secret": "<secret>"}` | `{"status": "waiting"}`; once approved, `{"status": "approved", "account": "<name>", "token": "<a new token>"}`, once; once denied, `{"status": "denied"}`; 404 once the sign-in is over |
| `DELETE /api/v1/tokens/current` with a token | `{"revoked": true}`: the token no longer works |
| `POST /api/v1/users` with the operator's token and `{"name": "<account>"}`, and `"replace": true` to take away an existing account's tokens | 201 (200 for an existing account) and `{"name", "token"}` |

## Archives

An archive is the package's files in one sequence of bytes: `sayon-package-digest-1` and a NUL byte, then for each file, in the order of its path (with `/`, compared byte by byte), the length of its path, the path, the length of its contents, and the contents, each length 8 bytes, least significant first. The archive's SHA-256, written `sha256:<hex>`, is the version's digest in the index, and the same digest `sayon.lock` records for the files it unpacks to.

A package holds every file of its folder but those with a part starting with `.`, and `build`, `target`, and `sayon.lock` at its top. Its archive is 10 MiB at most, with 10,000 files at most. Both sides refuse an archive with a path that is absolute, has `..`, `\`, `:`, or a hidden part, comes out of order or twice, or differs from another only in case. Sayon checks an archive's digest against the index before it unpacks the archive, and unpacks it into a temporary folder, renamed into its cache once whole.

## Publishing

A publication's archive must have a `sayon.toml` naming the same package and version as the address, with a version of semantic versioning (`1.2.3`, `1.2.3-beta.1`), and every dependency from a registry, as Sayon reads an index's lines: named by names, with a range, and from this registry or one reached over HTTPS or on this computer. The registry refuses:

- 401 without a token it knows;
- 403 when the name belongs to another account: the account that published a name first owns it;
- 409 when the version is published already, since a version never changes;
- 413 for an archive over 10 MiB, as soon as the request's `Content-Length` says so;
- 400 for an archive it cannot read, and for the rest.

It keeps the archive first, then adds the version's line to the index, so that the index never lists a version without one. It writes each of its files whole, the archive, the package's file of the index, the accounts, their tokens and sessions, and the owners, through a temporary file renamed over it, so that a crash or a power cut never leaves one half written: at worst it leaves an archive the index does not list, which publishing the version again replaces. Names are lowercase letters, digits, and `_`, starting with a letter, 64 characters at most, for packages and accounts alike.

## Accounts

People make their own accounts, on the registry's page `/sign-up`: a name, as packages have, and a password of 12 to 256 characters, which the registry keeps as `crypto.hash_password` makes it, with PBKDF2 and HMAC-SHA256, 600,000 rounds, and a salt of its own. A browser that signs in holds a cookie of 32 random bytes, `HttpOnly`, `SameSite=Lax`, and `Secure` over HTTPS, for 30 days or until it signs out; the registry keeps the cookie's SHA-256. Every form must come from the registry's own pages, as the browser's `Origin` says, and no page may be shown in another site's frame. Ten wrong passwords in a row make an account wait 15 minutes. There is no email: for a forgotten password, the operator's `--reset <account>` prints a link that chooses the account's password, once, within an hour.

An account has a token for each computer `sayon login` signed in on, and those its owner makes on its page, `/account`, for a build server or the like. Each is 32 random bytes from the system's secure source, shown once; the registry keeps only its SHA-256. The account's page lists them with when each was last used, and revokes them; `sayon logout` revokes its own.

`sayon login` signs in so:

1. `POST /api/v1/logins` starts a sign-in for the computer it names, and gives `sayon` a secret and a code.
2. `sayon` shows the code and the sign-in's page, `<api>/login/<code>`, and opens the page in the browser. There, signed in or making an account on the page, the account's owner checks that the page shows the same code, and approves the sign-in or denies it.
3. `sayon` asks `POST /api/v1/logins/poll` with the secret every `interval` seconds until the sign-in is decided, and keeps the account's new token, which the registry gives once. A sign-in no one decides is over after ten minutes.

The code lets the account's owner tell that the page is for their own `sayon login`, and only the secret, which never leaves `sayon`, takes the token. The account's name must be a name, since `sayon` keeps it beside the token and shows it. With `--token`, `sayon login` takes a token from its input instead, and checks it with `GET /api/v1/me`.

The operator makes accounts too, without passwords: with `--account` when the registry starts, or `POST /api/v1/users` with the operator's token. Each is given a token; `"replace": true`, like `--account` for an account that exists, takes away its other tokens.
