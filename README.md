<p align="center">
  <img src="static/images/logo.svg" alt="Sayon logo" width="120">
</p>

<h1 align="center">Sayon's documentation</h1>

<p align="center">Programming made easy. Safety made automatic.</p>

The guides to [Sayon](https://github.com/sayon-lang/sayon), which will be published at `docs.sayon-lang.org`:

- [Installing](installing.md): installers for each device, what they change, and uninstalling
- [The language](language.md): a reference for everything implemented so far, from values and ownership to projects, packages, and targets

The references that change with the compiler stay beside its code, in [sayon-lang/sayon](https://github.com/sayon-lang/sayon/tree/main/docs):

- [Feature ledger](https://github.com/sayon-lang/sayon/blob/main/docs/features.md): what exists, what is planned, and for which milestone
- [Error codes](https://github.com/sayon-lang/sayon/blob/main/docs/errors.md): what each diagnostic and runtime error code means, also shown by `sayon explain CODE`
- [Standard library API](https://github.com/sayon-lang/sayon/blob/main/docs/api.md): every export of the standard library, its declaration and what it does, written from the library's own declarations
- [Implementation records](https://github.com/sayon-lang/sayon/blob/main/docs/implementation.md): grammar, ownership rules, cleanup order, data layouts, and the error ABI
- [Licenses](https://github.com/sayon-lang/sayon/blob/main/docs/licenses.md): what is not Sayon's own in its files and in the programs it builds

The package registry's protocol is in [packages.sayon-lang.org](https://github.com/sayon-lang/packages.sayon-lang.org).

## Writing here

These pages describe Sayon as it is implemented: a change to the language goes with a change here. Each page is Markdown that GitHub shows as it is, and a Sayon program makes the site from the same files:

```bash
sayon run
sayon test
```

`sayon run` writes `site/`: each guide's page, in the layout of `src/layout.sayon` within the frame of Sayon's websites, `src/frame.sayon`, with the files of `static/` (the stylesheet, the script, and the logo) beside them. `src/frame.sayon`, `static/style.css`, and `static/site.js` are the look that www.sayon-lang.org, docs.sayon-lang.org, and packages.sayon-lang.org share, each with a copy, so a change to one goes to all three. `src/markdown.sayon` reads Markdown as these pages write it: headings with the ids GitHub gives them, paragraphs, lists, tables, code (Sayon's highlighted by `src/highlight.sayon`), and in text `code`, **strong**, *emphasis*, and links, those to another guide made links to its page. `sayon test` runs its tests, and checks that `site/` holds what the program makes, so a change to a page goes with its HTML. `site/` is plain HTML and CSS that any static host serves. To see it, Sayon serves it too, with `src/serve.sayon`, at `http://localhost:8000`:

```bash
sayon run -- serve
```

## License

[Apache License, Version 2.0, with LLVM's exception](LICENSE), as Sayon.
