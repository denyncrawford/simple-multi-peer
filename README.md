# Multi P2P

This is a [simple-multi-peer](https://github.com/nihey/simple-multi-peer/) fork but with a reinforced event-based API (just like socket.io) currently under development.

WebRTC multi-peer communication made simple (using [simple-peer](https://github.com/feross/simple-peer))

# Installation
```
$ npm install --save multi-p2p
```

# Usage

As a signalling server it is recommended to use [peer-hub](https://github.com/nihey/node-peer-hub).

```javascript
var MultiP2P = require('multi-p2p');

var Peers = new MultiP2P({
  server: 'ws://localhost:3000', // Your signaller URL.
  room: 'foobar',                // Which 'room' you'll be using to communicate with your peers
                                 // (all peers in the same room will be signalled to each other).
  callbacks: {                   // Connection related callbacks
    connect: function() {},      // -> 2 peers are connected
    close: function() {},        // -> a connection is closed
    data: function() {},         // -> any data is received
  }
});

// Send data over a subDataChannel to all peers with custom events and easy to read data.

Peers.emit("pizza", "Your pizza is ready!")

Peers.on("pizza", (data) => {
  Peers.emit("Thanks", {tips:"10$",stars:5});
})

```

# Changes

  - Now logs are silent
  - Event based API

# To DO

  - Broadcasting methods
  - Complete Rewrite
  - State management plugin.
  - FIX: Pending data accumulator/trigger for emitted events if no peers are connected (001).
  - FIX: WevRTC Polyfill for node environment.

# Known Bugs

- If there is no peer connected and data is being sent, there will be an error since it is unable to communicate with anything (ERROR-REF=001).
- Node is not supported (ERROR-REF=002).

# License

This code is released under
[CC0](http://creativecommons.org/publicdomain/zero/1.0/) (Public Domain)
