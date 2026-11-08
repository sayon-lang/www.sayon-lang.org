# The standard library

Standard modules are imported like any module, with a `standard/` path. Each module's source in `stdlib/` documents every function.

| Module | Functions |
|---|---|
| `standard/io.sayon` | `read_file`, `write_file`, `append_file`, `read_lines`, `read_file_bytes`, `write_file_bytes`, `read_line` (standard input; `nothing` at the end), `write` (no newline), `write_error`; `open` for a `File`, and `input`, `output`, and `errors` for the standard streams as ones, with the methods `read_line`, `lines`, `read`, `read_bytes`, `read_text` (a part of the text, never cutting a character), `write`, `write_line`, `write_bytes`, `flush`, `position`, `seek`, `close`; `copy` |
| `standard/os.sayon` | `arguments` (the words after `--` with `sayon run`), `environment`, `platform`, `current_directory`, `exit`, `run` (a `Completed` with `status`, `output`, `errors`, and `usage`), `start` (a `Process` with the files `input`, `output`, and `errors`, and the methods `finish_input`, `wait`, `usage`, `stop`, `id`), `Usage` (`peak_memory` in bytes and `processor_time`) |
| `standard/filesystem.sayon` | `exists`, `is_file`, `is_directory`, `is_link`, `list` (sorted names), `walk` (everything below a directory), `size`, `create_directory`, `remove`, `rename`, `copy`, `join`, `name`, `parent`, `extension`, `normalize` (`.` and `..` resolved in the text), `absolute`, `canonical` (the system's name for a path, links followed) |
| `standard/strings.sayon` | `split`, `lines`, `join`, `trim`, `trim_start`, `trim_end`, `pad_start`, `pad_end`, `parse_integer` (in a base from 2 to 36), `decimal` (a float with a number of decimal places), `upper`, `lower`, `replace`, `starts_with`, `ends_with`, `contains`, `find` (`integer or nothing`), `repeat`, `slice`, `characters`, `code` (a character's Unicode code), `character` (the character with a code), `graphemes`, `grapheme_count`, `bytes`, `byte_view`, `from_bytes` (strict UTF-8), `from_bytes_lossy`; other encodings: `encode`, `decode`, `decode_lossy` for UTF-16 (`"utf-16"`, `"utf-16le"`, `"utf-16be"`), Latin-1, ASCII, and Windows-1252 |
| `standard/json.sayon` | the `Json` enum, `parse`, `encode`, `pretty`, `number_value`, `text_value`, `flag_value`, `field`, `item`, `from_integer`; typed values: `decode`, `encode_value`, `from_json`, `to_json`; streams: `items`, `lines`, `write_items` (an `ItemWriter` with `add`, `add_value`, `finish`) |
| `standard/threads.sayon` | `spawn`, `join`, `detach`, `pause`, `new_channel`, `new_unbounded_channel`, `after`, `send`, `recoverable_send` (a `SendResult<T>`), `receive`, `receive_result` (a `ReceiveResult<T>`), `close`, `select`; see [Tasks and channels](tasks.md#tasks-and-channels) |
| `standard/network.sayon` | `connect` for a `Connection` (`read_line`, `lines`, `read`, `read_bytes`, `read_exactly`, `write`, `write_line`, `write_bytes`, `flush`, `finish_sending`, `set_timeout`, `local_address`, `peer_address`, `close`), `listen` for a `Listener` (`accept`, `address`, `set_timeout`, `close`), `bind` for a `DatagramSocket` (`send`, `receive`, `address`, `set_timeout`, `close`), `resolve`, `address_text`; HTTP: `get`, `post`, `request`, and `Response` (`text`, `header`, `succeeded`); see [Networking](networking.md) |
| `standard/graphics.sayon` | `canvas`, `image`, `decode_image`, and `load_image` for a `Canvas` (`smooth`, `clear`, `fill_rectangle`, `stroke_rectangle`, `fill_circle`, `fill_polygon`, `line`, `draw`, `text`, `write`, `pixel`, `bytes`, `png`, `save_png`), `text_width`, `text_height`, `decode_font`, `load_font`, and `system_font` for a `Font` (`name`, `ascent`, `descent`, `line_height`, `width`, `height`), colors (`Color`, `rgb`, `rgba`, `BLACK`, `WHITE`, `RED`, `GREEN`, `BLUE`, `TRANSPARENT`), `Point`; `open` for a `Window` (`events`, `present`, `width`, `height`, `scale`, `is_open`, `close`) and its `Event`s; see [Graphics](graphics.md) |
| `standard/time.sayon` | `Duration` (`nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `add`, `subtract`, `scale`, `in_seconds`, `in_milliseconds`, `describe`), the monotonic clock (`start`, `elapsed`, `between`, `sleep`), `deadline` for a `Deadline` (`remaining`, `passed`, `wait`), `ticker` for a `Ticker` (`wait`), and UTC dates (`DateTime`, `now`, `unix_seconds`, `from_unix`, `to_unix`, `shift`, `difference`, `weekday`, `is_leap_year`, `days_in_month`, `format` and `parse` for ISO 8601), time zones (`zone` for a `Zone` with `at`, `moment`, `offset`; `ZonedTime` with `format`, `moment`; `local_zone`, `zones_version`) |
| `standard/collections.sayon` | `sort` and `sort_by` (stable), `reverse`; `Set<T>` with `new_set`, `set_add`, `set_contains`, `set_remove`, `set_size`, `set_values` (as methods: `set.add(value)`); `Queue<T>` with `new_queue` and `add`, `take`, `peek`, `size`, `values`; `Stack<T>` with `new_stack` and `push`, `pop`, `peek`, `size`, `values`; `List<T>` with `new_list` and `add_first`, `add_last`, `add_before`, `add_after`, `take`, `take_first`, `take_last`, `get`, `set`, `first`, `last`, `after`, `before`, `find`, `size`, `values`; `Map<K, V>` with `new_map` and `set`, `get`, `contains`, `remove`, `size`, `keys`, `values`, `first`, `last`, `before`, `after`, `between`; see [Collections](collections.md) |
| `standard/memory.sayon` | `read`, `write`, `size`, `read_bytes`, `write_bytes`, `read_text`, `offset`, `address`; see [C functions and unsafe code](../language/c-and-unsafe.md) |
| `standard/math.sayon` | `PI`, `E`, `TAU`, `sqrt`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `exp`, `log`, `log10`, `log2`, `pow`, `floor`, `ceil`, `round`, `trunc`, `abs`, `min`, `max`, `clamp`, `random`; `new_generator(seed)` for a `Generator` (`float`, `integer`, `shuffle`) |
| `standard/crypto.sayon` | `sha256` (32 bytes), `random_bytes` (from the system's secure source, 1 MiB at most at a time), `hex`, `same` (compares every byte, for secrets) |

```sayon
io = import("standard/io.sayon")
strings = import("standard/strings.sayon")

while true
    line = io.read_line()
    if line == nothing
        break
    print(strings.upper(line))
```

String positions count Unicode characters. A file or directory operation that fails raises `IOError`, and text that isn't UTF-8 raises `EncodingError`. Don't use `math.random()` for anything secret: `crypto.random_bytes` is the one for keys and tokens. `crypto.hash_password` turns a password into something safe to store (slowly, on purpose), and `crypto.check_password` tells you whether a password matches it. [The standard library's API](../reference/api.md) lists every export with its declaration.

When you need the same random numbers again, `math.new_generator(seed)` gives you a `Generator`. Two generators with the same seed produce the same numbers in the same order, on every system, interpreted or compiled. That's handy for tests, simulations, and games with replays. `float()` gives a number from 0 up to 1, `integer(low, high)` one from `low` up to but not including `high`, all equally likely, and `shuffle(items)` puts an array in random order:

```sayon run
math = import("standard/math.sayon")

dice = math.new_generator(42)
print(dice.integer(1, 7), dice.integer(1, 7))   # the same two rolls every time
cards = ["ace", "king", "queen"]
dice.shuffle(cards)
```

`os.run(program, arguments, directory, input, environment, inherit_environment)` runs another program and waits for it, returning its exit status and what it wrote to standard output and error. The arguments are passed exactly as given, with no shell in between, so no character in them has a special meaning. The program reads `input` (nothing unless given), and has this program's environment variables with those of `environment` added, or with `inherit_environment = false` only those. Running something through a shell is explicit, as with `os.run("sh", ["-c", "ls | wc -l"])`. A program that cannot be started raises `IOError`.

Once a program has finished, its `usage` says what it used: `peak_memory`, the most memory it held at once in bytes, and `processor_time`, a `time.Duration` adding up the time its threads ran and the system's time on its behalf. Sayon's [benchmarks](https://github.com/sayon-lang/sayon/tree/main/benchmarks) measure programs this way:

```sayon
os = import("standard/os.sayon")

result = os.run("sayon", ["version"])
print("{result.usage.peak_memory / 1024} KiB, {result.usage.processor_time.nanoseconds / 1000000} ms")
```

`os.start` starts a program without waiting for it, and gives a `Process` whose `input`, `output`, and `errors` are files: write to its input, `finish_input()` when it is done, read its output as it comes, and `wait()` for its exit status, then ask for its `usage()`, or `stop()` it. Waiting for a program, or for what it writes, lets other tasks run. `io.output()` and `io.errors()` give standard output and error as files, for code that takes a file; what they write comes in order with `print`.

```sayon
os = import("standard/os.sayon")

sorting = os.start("sort", [])
for word in ["pear", "apple"]
    sorting.input.write_line(word)
sorting.finish_input()
print(sorting.output.read())     # apple, then pear
sorting.wait()
```

`os.exit(status)` ends the program with a status from 0 to 255 (another status raises `ValueError`). It ends it in order: `finally` blocks run and values are cleaned up on the way out, so open files are written, but `catch` and `try` do not stop it. In a test, it fails the test.

`filesystem.walk(path)` lists every file and directory below `path`, as paths relative to it joined with `/`. Each directory comes just before what it holds, and each directory's entries are sorted by name. A symbolic link is listed but not followed, so a walk always ends; `filesystem.is_link(path)` tells whether a path is one.
