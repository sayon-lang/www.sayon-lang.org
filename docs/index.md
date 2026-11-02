# Sayon's documentation

Programming made easy. Safety made automatic.

The guides to [Sayon](https://github.com/sayon-lang/sayon):

- [Installing](installing.md): installers for each device, what they change, and uninstalling
- [The language](language.md): a reference for everything implemented so far, from values and ownership to projects, packages, and targets
- [Standard library](api.md): every export of the standard library, its declaration and what it does, written from the library's own declarations
- [Error codes](errors.md): what each diagnostic and runtime error code means, also shown by `sayon explain CODE`

The last two change with the compiler, so they are written beside its code, in [sayon-lang/sayon](https://github.com/sayon-lang/sayon/tree/main/docs), and copied here. The other references written there stay there:

- [Feature ledger](https://github.com/sayon-lang/sayon/blob/main/docs/features.md): what exists, what is planned, and for which milestone
- [Implementation records](https://github.com/sayon-lang/sayon/blob/main/docs/implementation.md): grammar, ownership rules, cleanup order, data layouts, and the error ABI
- [Licenses](https://github.com/sayon-lang/sayon/blob/main/docs/licenses.md): what is not Sayon's own in its files and in the programs it builds

How `sayon` and the package registry talk is in [the registry protocol](https://github.com/sayon-lang/www.sayon-lang.org/blob/main/PROTOCOL.md).

## Writing here

These pages describe Sayon as it is implemented: a change to the language goes with a change here. Each is a Markdown file in the `docs` folder of [www.sayon-lang.org](https://github.com/sayon-lang/www.sayon-lang.org), which GitHub shows as it is, and which the website reads when it starts and serves under `/docs`. `src/web/markdown.sayon` makes them HTML: headings with the ids GitHub gives them, paragraphs, lists, tables, code (Sayon's highlighted), and in text `code`, **strong**, *emphasis*, and links, those to another guide made links to its page.

`api.md` and `errors.md` are copies: change them in sayon-lang/sayon, where `scripts/api_inventory.sayon` writes `api.md` from the library's declarations, then copy them here with `sayon run scripts/language_docs.sayon`, which takes the language's checkout beside this one, `../sayon`, or the one it is given. With the language beside it, `sayon test` fails while a copy is not the language's text.
