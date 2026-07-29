# inspecturl

A CLI tool that inspects a URL and reports DNS resolution, TCP connectivity, HTTP response and SSL certificate validity.

Built while learning TypeScript. The goal was a small, complete tool
with real network I/O — several independent checks that each fail in
their own way, and error handling that reports which stage broke
rather than just failing.
