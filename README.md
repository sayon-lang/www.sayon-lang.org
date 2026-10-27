<p align="center">
  <img src="images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">www.sayon-lang.org</h1>

<p align="center">Programming made easy. Safety made automatic.</p>

The website of [Sayon](https://github.com/sayon-lang/sayon): what Sayon is, a first program, and how to get started, with links to the [documentation](https://github.com/sayon-lang/docs.sayon-lang.org), the [package registry](https://github.com/sayon-lang/packages.sayon-lang.org), and the [VS Code extension](https://github.com/sayon-lang/sayon-vscode). It will be published at `www.sayon-lang.org`; until then its links go to the repositories.

The site is one static page, `index.html` with `style.css`, in the system's own fonts and with no scripts, so any static host serves it as it is. It follows the reader's light or dark preference and fits a phone's width.

## Seeing it

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## The logo

`images/logo.svg` is Sayon's logo, vermilion `#DB5735`; `favicon.ico` and `images/icon-256.png` are made from it. Keep its square and its margin, and don't crop, stretch, or recolor it; [sayon-lang/sayon's assets](https://github.com/sayon-lang/sayon/tree/main/assets) hold every version of it.

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
