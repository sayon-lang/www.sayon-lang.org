# Graphics

`standard/graphics.sayon` draws on canvases and shows them in windows.

```sayon
graphics = import("standard/graphics.sayon")

window = graphics.open("Hello", 320, 200)
canvas = graphics.canvas(window.width(), window.height())
while window.is_open()
    for event in window.events()
        match event
            case resized(width, height)
                canvas = graphics.canvas(width, height)
            case key_down(key)
                print("pressed", key)
            case _
                continue
    canvas.clear(graphics.BLACK)
    canvas.fill_circle(160, 100, 40, graphics.rgb(255, 160, 0))
    canvas.text("Hello", 20, 20, 16, graphics.WHITE)
    window.present(canvas)
```

- A `Canvas` is pixels to draw on: `graphics.canvas(width, height)` starts transparent, and `graphics.image(width, height, bytes)` takes red, green, blue, and alpha bytes for each pixel, row by row from the top, as `canvas.bytes()` gives them. Drawing gives the same pixels on every system, in the interpreter and compiled, and needs no window, so a program can draw where there is no screen, as under WASI.
- `clear` sets every pixel; `fill_rectangle`, `stroke_rectangle`, `fill_circle`, `fill_polygon`, and `line` (with a `thickness`) blend a `Color` over what is there, as `draw` does another canvas. Coordinates count pixels from the top left corner, rightward and downward. Shapes cover the pixels whose centers they hold; a polygon's points are pixel corners, so a square polygon covers what the rectangle of its size does, and a line runs between the centers of the pixels it names. Colors are `rgb(red, green, blue)` and `rgba(..., alpha)`, each part 0 to 255.
- On a canvas whose `smooth` is true (`canvas.smooth = true`; a canvas starts with it false), `fill_circle`, `fill_polygon`, and `line` are smooth instead: each pixel takes as much of the color as the shape covers of its area, so that edges are anti-aliased. A smooth line is the band as wide as its thickness, at least a pixel, its ends cut square at the centers. Smooth shapes give the same pixels everywhere too.
- `text(text, x, y, size, color)` draws in a built-in font of 8 by 8 pixels, scaled so that each character takes a square cell of `size` pixels; a line break starts a line below, and `text_width` and `text_height` measure text. The font is font8x8, in the public domain, and covers ASCII, the Latin-1 supplement, Greek, box drawing, and block elements; another character shows as a box.
- `write(font, text, x, y, size, color)` draws text in a `Font`, the top left corner of its first line at `x`, `y`, at `size` pixels per em, as a web page sizes text; a line break starts a line `font.line_height(size)` below. `graphics.decode_font(bytes)` and `graphics.load_font(path)` read a TrueType font (a `.ttf` file, or the first font of a `.ttc`), which the runtime draws itself, smooth, so that text in it is the same everywhere; there is no hinting or kerning yet, and fonts of PostScript outlines (most `.otf` files) fail with `FontError`. `graphics.system_font(name)` finds one of the system's fonts by its family's name, such as `"Arial"`, or its full name, such as `"Arial Bold"`; `"sans-serif"` (the default), `"serif"`, and `"monospace"` give the system's usual one of each kind. It looks in the system's font directories: on Windows its `Fonts` and the user's, on Linux `~/.local/share/fonts`, `~/.fonts`, and the `fonts` of `XDG_DATA_DIRS`, on Android `/system/fonts`. In a web page the fonts are the browser's, and the browser draws them, so their pixels are the browser's own. A font's `ascent`, `descent`, and `line_height` at a size, and the `width` and `height` of text in it, are in whole pixels. A character a font lacks shows as the font's glyph for those.
- `graphics.decode_image(bytes)` and `graphics.load_image(path)` read a PNG image into a canvas: any of PNG's kinds of color and depths, palettes, transparency, and interlacing, colors of 16 bits cut to 8. `canvas.png()` gives the canvas as a PNG image of 8-bit red, green, blue, and alpha, and `canvas.save_png(path)` writes it to a file. What is not a PNG image, or is damaged, fails with `ImageError`.
- `graphics.open(title, width, height)` opens a window: on a desktop a window of its own, in a web page a canvas added to the page, and in an Android app the app's screen, whatever its size. `width` and `height` are the system's points, and the window's own `width()` and `height()` are its pixels, which `scale()` relates, such as 2 on a screen of twice the usual density; a canvas of the window's size fills it a pixel for a pixel. `present(canvas)` shows a canvas, over black, its top left corner at the window's, and waits until the next frame is due, about a sixtieth of a second after the last, letting other tasks run.
- `events()` gives what happened since it was last asked: `closed` (the user asked to close it; `is_open()` is then false, and the program decides when to `close()`), `resized(width, height)`, which comes first with the window's size, `key_down(key)` and `key_up(key)`, `pointer_down(x, y, button)`, `pointer_up(...)`, and `pointer_moved(x, y)` for a mouse or a finger (button 1 for the primary or a touch, 2 the secondary, 3 the middle), `focused(focused)`, and `paused` and `resumed` when it is minimized or goes to the background. Keys are named as web pages name them: `"a"` to `"z"` and `"0"` to `"9"` by where the key is, `" "`, `"Enter"`, `"Escape"`, `"ArrowLeft"`, and so on.
- Opening a window where there is no screen fails with `GraphicsError`: under WASI, in Node, from `adb shell`, and on Linux without an X display. A window is used on the thread that opened it.
- With the host option `SAYON_CLOSE_WINDOWS` set, each window asks to close, as its close button does, once it has shown 120 frames: so a check can run a program that runs until its window closes. The option is an environment variable, a page's option (`run({ options: { SAYON_CLOSE_WINDOWS: 1 } })`), or for an Android app a boolean extra of the intent that starts it (`am start ... --ez SAYON_CLOSE_WINDOWS true`), as `SAYON_DEBUG_ALLOC` is.

## Display

`print` and `tostring` display values as follows. Floats always show a decimal point or an exponent (`3.0`, `0.1`, `1e20`, `inf`, `nan`), and integers never do. Strings appear as text at the top level and quoted inside collections, so collections look like the literals that build them: `[1, "text", true]` and `["name" = "Ada"]`. Structures and enum values look like the calls that build them: `Point(x = 1.0, y = 2.0)`, `circle(5.0)`, `point`. `typeof` names a structure or enum by its type name, such as `Point`.
