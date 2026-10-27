<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">www.sayon-lang.org</h1>

<p align="center">Programming made easy. Safety made automatic.</p>

The website of [Sayon](https://github.com/sayon-lang/sayon): what Sayon is, a first program, and how to get started, with links to the [documentation](https://github.com/sayon-lang/docs.sayon-lang.org), the [package registry](https://github.com/sayon-lang/packages.sayon-lang.org), and the [VS Code extension](https://github.com/sayon-lang/sayon-vscode). It will be published at `www.sayon-lang.org`; until then its links go to the repositories.

## Written in Sayon

The site is made by a Sayon program. `src/page.sayon` holds what the page says, as Sayon data, and writes its HTML; `src/highlight.sayon` colors the code it shows, reading Sayon as Sayon's own lexer does; `src/html.sayon` escapes text. `sayon run` writes the page into `site/`, with the files of `static/` (the stylesheet and the logo) beside it:

```bash
sayon run
sayon test
```

`sayon test` runs the tests of the highlighter and the HTML, and checks that `site/` holds the page as the program writes it, so a change to the program goes with the page it writes.

`site/` is the whole website, plain HTML and CSS with no scripts, so any static host serves it as it is. It follows the reader's light or dark preference and fits a phone's width. To see it:

```bash
python -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.

## The logo

`static/images/logo.svg` is Sayon's logo, vermilion `#DB5735`; `favicon.ico` and `images/icon-256.png` are made from it. Keep its square and its margin, and don't crop, stretch, or recolor it; [sayon-lang/sayon's assets](https://github.com/sayon-lang/sayon/tree/main/assets) hold every version of it.

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
