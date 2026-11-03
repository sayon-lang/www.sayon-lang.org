# Formatting and linting

How `sayon fmt` lays out code the one way, and what `sayon lint` warns about.

## Formatting

`sayon fmt` rewrites files in the canonical style: four-space indentation, single spaces around operators and after commas, no space inside brackets, one blank line at most between statements, LF line endings, and a final newline. Comments, blank-line separation, and the spelling of literals are kept. A statement written across several lines, or with a comment inside it, keeps its own layout and is only re-indented. Files with syntax errors are left unchanged, and the formatter refuses to write a result whose structure differs from the original.

`sayon fmt --check` lists the files that are not formatted and exits with status 1 if there are any. With no paths, both forms cover every `.sayon` file under the current directory.

## Linting

`sayon lint` checks a program like `sayon check` and also warns about code that is valid but probably not meant: unused variables, parameters, imports, and private items; names that do not follow the conventions; variables that hide others; and an assignment that makes a new variable whose name is one letter away from an existing one. The standard library is not linted. Each warning is described among [the error codes](../reference/error-codes.md#lint-warnings).

```sayon
total = 0
for price in prices
    totl = total + price    # warning[W_SUSPICIOUS_DECLARATION]
```

A comment on the warning's line, or the line above, suppresses it by name: `# allow(unused_variable)`. Names that start with `_` are never reported as unused. `sayon lint --deny warnings` fails with status 2 when there are warnings, for use in automated checks.
