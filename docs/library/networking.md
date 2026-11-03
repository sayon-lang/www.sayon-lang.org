# Networking

`standard/network.sayon` makes TCP connections, listens for them, sends and receives UDP datagrams, and makes HTTP requests.

```sayon
network = import("standard/network.sayon")
threads = import("standard/threads.sayon")

listener = network.listen("127.0.0.1", 0)       # 0: any free port
port = listener.address().port
server = threads.spawn(function()
    connection = listener.accept()
    connection.write_line("hello, {connection.read_line()}")
    connection.close()
)

client = network.connect("127.0.0.1", port)
client.write_line("world")
print(client.read_line())                       # hello, world
client.close()
threads.join(server)
```

- A `Connection` reads and writes like a file: `read_line`, `lines`, `read` (everything until the other side finishes), `read_bytes` (as many bytes as have arrived, up to a count), `read_exactly` (a count of bytes, waiting until they have all arrived), `write`, `write_line`, `write_bytes`, `flush`, `close`. `finish_sending()` ends what this side sends while it can still read, and `local_address()` and `peer_address()` give `Address` values with a `host` and a `port`.
- `network.listen(host, port)` gives a `Listener`, whose `accept()` waits for the next connection; `network.bind(host, port)` gives a `DatagramSocket`, which `send`s datagrams to a host and `receive`s them as a `Datagram` of `bytes` and its `sender`. `network.resolve(host)` gives a host's numeric addresses.
- `network.connect_secure(host, port)` connects and starts TLS, and `connection.secure(name)` starts it on a connection made already, for protocols that begin in plain text. The system's TLS checks the server's certificate against the certificates it trusts, and that it is for the name given, which also goes to the server; a failure is a `TlsError` that says what was wrong, such as an expired certificate or one for another name. What the connection reads and writes after that is encrypted, with every operation the same. TLS comes from the system: SChannel on Windows, OpenSSL's `libssl` on Linux, and in an Android app the platform's own, which trusts what the phone and its user trust; where there is none, as in a program run from `adb shell`, it fails with `TlsError`.
- A host with several addresses is connected on the first that answers: attempts start a quarter of a second apart, between IPv6 and IPv4 by turns, so that a kind of address that does not work on a network costs little.
- Waiting for the network lets other tasks run, so one program can be both a server and its client. `connect` takes a `timeout` (30 seconds unless given), and `set_timeout(duration)` gives a connection, listener, or datagram socket one for each of its operations; an operation that waits longer fails with `TimeoutError`. Other failures are `ConnectionError`, `AddressError`, `TlsError`, and `NetworkError`.
- What a connection writes goes out as the other side takes it; a write waits only when a megabyte is still waiting to go, and `flush` and `close` wait until all of it has gone.

`network.get(url)`, `network.post(url, text)`, and `network.request(method, url, headers, body, timeout, redirects, limit)` make HTTP/1.1 requests and give a `Response`: its `status` and `reason`, its `headers` with lowercase names, its `body` as bytes, and the `url` that answered. `response.text()` reads the body as text, `response.header(name)` finds a header in any letter case, and `response.succeeded()` tells a status from 200 to 299. Requests follow up to 10 redirects and accept bodies up to 16 MiB unless told otherwise; a failing status such as 404 is a response, not an error, while an answer that is not HTTP fails with `HttpError`. Both `http://` and `https://` URLs work, and a redirect may lead from one to the other; an `https://` request goes through TLS.

In a web page the browser makes each request, with its `fetch`, and the other tasks run while one waits for its response. The response is the same, with a few differences that come from the browser:

- The browser follows redirects itself, up to its own limit, so `redirects` only tells whether to follow any; `timeout` is how long the wait for the response, and then for each part of its body, may last.
- A page reads another site's responses only when that site allows it (CORS), and sees only the headers it exposes. The browser sets some headers itself, such as `user-agent`, and leaves out those the program sets for them.
- A URL can be relative to the page. A request the browser could not make fails with `NetworkError`, with only as much of why as the browser tells: it keeps from the page whether the connection was refused or the site does not allow it.
