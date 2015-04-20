// Shim deprecated functions
hello.subscribe = hello.on;
hello.trigger = hello.emit;
hello.unsubscribe = hello.off;
