# Tasks and threads

Tasks let a program do several things at once, and channels carry values between them.

## Tasks and channels

`standard/threads.sayon` runs tasks together. A task is a fiber: the tasks take turns on one thread, and one runs until it waits, for a message, for room in a channel, for another task, for time to pass, or in `threads.pause()`. A spawned task starts when the task that spawned it first waits.

```sayon
threads = import("standard/threads.sayon")

handle = threads.spawn(function() -> integer
    return 42
)
print(threads.join(handle))           # 42

channel: Channel<string> = threads.new_channel()
sender = threads.spawn(function()
    threads.send(channel, "message")
)
print(threads.receive(channel))       # message
threads.join(sender)
```

- `spawn(function)` gives a `Task<T>`, and `join(task)` waits for its result, or fails with the task's error. A task owns what its function captured, as any closure does; `Shared` values and channels are handles, so tasks that capture them share them.
- `new_channel(capacity)` makes a `Channel<T>` holding up to `capacity` messages (64 unless given); `send` waits while it is full, and a capacity of 0 makes each `send` wait until its message is received. `receive` waits while it is empty. Messages keep the order they were sent in, and sending transfers a message's ownership. `new_unbounded_channel()` makes a channel whose `send` never waits, at the cost of memory for every message nobody has received yet.
- `close(channel)` stops sends, which then fail with `ChannelClosedError` and destroy their message; receivers get the messages already sent and then `ChannelClosedError`. `receive_result` gives `message(value)` or `closed` instead, and `recoverable_send` gives `sent`, or `unsent(message, problem)` with the message back when the channel is closed.
- `select(channels, handler)` waits until one of the channels has a message or is closed and empty, receives from it, and calls `handler(message, position)`. When several are ready, the choice goes round, starting after the last one the task chose.
- `time.sleep` lets other tasks run while it waits. Waiting when no task could ever go on raises `DeadlockError`.
- `after(delay, message)` is a timer: a channel that receives `message` once `delay` has passed. Selecting it with other channels waits for their messages or for too long, as with `select([events, threads.after(time.seconds(5), timeout)], handler)` for an enum `Event` with a `timeout` variant.
- When the main task finishes, the tasks still running are cancelled: each stops where it waits, running its `finally` blocks and cleanup, which `catch` and `try` do not stop. A task whose handle is dropped without a `join` is cancelled the same way (`W_UNUSED_TASK` warns of a handle dropped at once), and one that has not started never runs; `detach(task)` lets a task run on until the main task ends. A task that fails without being joined is reported and makes the program fail. `os.exit` in any task ends the whole program in order.

Tasks started with `spawn` run on one thread, so values they share through `Shared` and `Cell` never change under them in the middle of an operation. Compiled programs can run tasks on Windows and on Linux x86-64 so far.

## Tasks on threads of their own

`threads.spawn_parallel(function)` starts a task on a thread of its own, which runs at the same time as the program's other tasks, on another processor when there is one. Its handle is a `Task<T>` like any other, which `join` and `detach` take. Tasks on different threads share data through a `Mutex<T>`:

```sayon
threads = import("standard/threads.sayon")

total = mutex(0)
first = threads.spawn_parallel(function()
    total.change(function(update value: integer) value += 1)
)
second = threads.spawn_parallel(function()
    total.change(function(update value: integer) value += 2)
)
threads.join(first)
threads.join(second)
print(total.get())                    # 3
```

- What the function captures moves to the new thread, and the task's result moves back, so both must be *sendable*: they share nothing with the thread they left. Numbers, strings, arrays, dictionaries, structures, enums, errors, cells, channels, and mutexes are sendable when what they hold is; `Shared` and `Weak` values, tasks, views, and function values are not, since their handles are counted without the cost of making that safe across threads (`E_UNSUPPORTED_OPERATION`). The function is written at the call or named, so that its captures can be checked (`E_PARALLEL_FUNCTION`).
- Channels work between threads as they do between the tasks of one thread: a task on any thread can send, receive, `select`, and close, and a rendezvous `send` waits for a receive on another thread. Messages move as they always do, so a channel between threads carries sendable messages, such as a channel to answer on.
- While tasks run on other threads, a task that waits for a channel they may hold waits for them instead of raising `DeadlockError`. A channel counts as one they may hold once a task on another thread was started, or a value went into a mutex or through such a channel, while the channel existed; waiting for a channel made after that, or after the tasks on other threads have finished, is detected as before. Tasks on different threads that wait for each other wait forever.
- `mutex(value)` makes a `Mutex<T>`, a handle like a `Shared` value: copies of it refer to the same mutex, whose value lives until the last handle goes. Its value is used only under its lock, which one task holds at a time: `m.get()` copies the value out, `m.set(value)` replaces it, `m.replace(value)` replaces it and gives what it held, and `m.change(function)` calls the function with the value to change in place, holding the lock until it returns. A task that wants the lock while a task on another thread holds it waits for it; the lock is freed also when the function fails. A mutex's value must be sendable, and a constant cannot hold a mutex (`E_SHARED_CONSTANT`).
- A task cannot wait for anything while it holds a lock: inside `change`, sending, receiving, joining, sleeping, `pause`, and taking the same mutex's lock again fail with `LockError`, and the value is put back as it was left. Keep the work under a lock short, and take the locks of several mutexes in the same order everywhere: two tasks that each hold one lock and want the other's wait forever.
- A task on another thread runs the tasks it spawns on its own thread, and they end with it. When the main task finishes, the tasks on other threads are cancelled where they wait, like any other, and the program waits for their threads to finish; a task that fails there without being joined makes the program fail. `os.exit` in any task, on any thread, ends the whole program.
- `print` and the other output functions write whole lines, so the lines of tasks on different threads do not mix, but their order depends on how the threads run.
