# Collections

Beside arrays and dictionaries, `standard/collections` has a `Set`, which holds each value once; a `Queue`, which gives values back in the order they came, and a `Stack`, in the opposite order; a `List`; and a `Map`. A collection owns its values: adding one moves it in, and taking one out gives it back, while `get`, `peek`, and `values` give copies.

A `Map` keeps its keys in order, smallest first, where a dictionary keeps the order they were added in. Its keys are numbers or strings, floats too, but not NaN. Looking a key up, adding one, removing one, and finding the keys around a key take time proportional to log n for n keys. A `List` keeps values in a sequence where adding or taking out a value anywhere takes constant time: each value added gets a `Position`, which names it until it is taken out, however the list changes around it. Using a position whose value was taken out is a `ValueError`.

```sayon run
collections = import("standard/collections.sayon")

prices = collections.new_map()
prices.set(1.5, "tea")
prices.set(0.75, "water")
prices.set(3.0, "cake")
print(prices.keys())                 # [0.75, 1.5, 3.0]
print(prices.after(1.5))             # 3.0
print(prices.between(0.5, 2.0))      # [0.75, 1.5]

line = collections.new_list()
first = line.add_last("ada")
line.add_last("cy")
line.add_after(first, "bo")          # ada, bo, cy
line.take(first)
print(line.values())                 # ["bo", "cy"]
```

`==` compares two sets by their values, in any order, and two stacks by their values in order. How a queue, a list, or a map is kept depends on the order of its changes, so `==` can find two of the same values different: compare their `values()`, and a map's `keys()`, instead.
