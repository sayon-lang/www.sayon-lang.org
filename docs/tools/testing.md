# Tests

A `test` block at the top level of a file describes a check:

```sayon
function add(a, b)
    return a + b

test "adds integers"
    assert(add(2, 3) == 5)
```

`sayon test file.sayon` runs the file's test blocks; with no files, it runs every `.sayon` file under `tests/`. Each test runs with freshly initialized constants. A test passes when it finishes and fails when an error escapes it; a failing test's printed output is shown with the error. The exit status is 1 when a test fails and 2 when a file does not compile.

`sayon run` and `sayon check` check test blocks but do not run them, and test blocks in imported modules are ignored. Outside a test block, `test` is an ordinary name.
