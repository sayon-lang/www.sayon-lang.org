# JSON

`json.parse(text)` reads JSON into a `Json` value, an enum with the variants `null`, `flag(value: boolean)`, `number(digits: string)`, `text(value: string)`, `list(items: Array<Json>)`, and `object(fields: Dict<string, Json>)`. `json.encode(value)` writes compact JSON and `json.pretty(value)` indents it by two spaces per level.

```sayon run
json = import("standard/json.sayon")

value = json.parse("{{\"name\": \"Ada\", \"born\": 1815}}")
match value
    case json.Json.object(fields)
        print(length(fields))                            # 2
    case _
        print("not an object")
born = json.field(value, "born")                         # Json or nothing
if born != nothing
    print(json.number_value(born))                       # 1815
```

- A number keeps the exact text it was written with, so integers of any size and decimals come back unchanged from `encode`; `number_value` reads it as `integer or float`.
- An object keeps its fields in the order they were written, and `encode` writes them in that order.
- `parse` raises a `ParseError` naming the line and column for text that is not JSON, including anything but whitespace after the value, a field name repeated in one object, an unpaired surrogate escape, a raw control character in a string, and nesting deeper than 512 levels.
- Build values with the variants, written through the module: `json.Json.text("hi")`, `json.Json.list([...])`, or `json.from_integer(3)`.
- Braces in a Sayon string start interpolation, so JSON written as a literal doubles them: `"{{\"a\": 1}}"`.

`json.decode(text)` reads JSON straight into a value of the type it is used as, and `json.encode_value(value)` writes one; `json.from_json` and `json.to_json` do the same between typed values and `Json`.

```sayon
type Point = [x: float, y: float]
type Shape = [name: string, points: Array<Point>, note: string or nothing]

shape: Shape = json.decode("{{\"name\": \"line\", \"points\": [{{\"x\": 0, \"y\": 1.5}}]}}")
print(shape.points[0].y)             # 1.5
print(json.encode_value(shape))      # {"name":"line","points":[{"x":0.0,"y":1.5}],"note":null}
points = json.decode<Array<Point>>("[]")
```

| Type | JSON |
|---|---|
| numbers, `boolean`, `string`, `nothing` | a number, `true` or `false`, text, `null` |
| `Array<T>` | a list |
| `Dict<string, T>`, structures | an object; a structure's field missing from the object is `nothing` when its type allows it, and other members are ignored |
| enums | a variant without fields is its name, `"dot"`; one with fields is an object with one member named after the variant, `{"circle": {"radius": 2.0}}` |
| unions | whichever member reads that kind of value; a number written as an integer reads as the integer member and another as the float member |
| `Json` | any value, unchanged |

- An integer must be written without a fraction or exponent and fit its type; all 64 bits of `unsigned` and `integer` are kept exactly.
- JSON that does not fit raises `DecodeError`, starting with the path to the place: `$.points[0].y: expected float, found text`.
- Types JSON cannot hold, such as function values or dictionaries with integer keys, are compile errors, and so are unions where two members read the same kind of JSON value, such as `Point or Line` (both objects). A generic function that decodes its type parameter passes this requirement on to its callers.

Files too large to read at once are read and written a value at a time. `json.items(file)` reads the items of the array a file holds as a `for` loop goes through them, and `json.lines(file)` the values of a file of JSON Lines, one value on each line; a `ParseError` names the item or the line. `json.write_items(file)` gives an `ItemWriter`, whose `add(value)` and `add_value(value)` write an item each and whose `finish()` ends the array.

```sayon
json = import("standard/json.sayon")
io = import("standard/io.sayon")

file = io.open("orders.json")
total = 0
for order in json.items(file)
    total += 1
file.close()
```
- Writing a float that is infinite or not a number raises `ValueError`, since JSON has no number for it.
