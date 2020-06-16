var SimpleMultiPeer = require("../lib/index");

var Peers = new SimpleMultiPeer({
  server: "wss://live-code-gv.herokuapp.com/", // Your signaller URL.
  room: "foobar", // Which 'room' you'll be using to communicate with your peers
});

// Send data over a dataChannel to all peers
Peers.on("hello", (data) => {
  console.log(data);
  Peers.emit("hey","hahaha")
});

document.querySelector("#say1").addEventListener("click", () => {
  Peers.emit("hello", "data")
  Peers.emit("haha", "data");
})

Peers.on("hey", (data) => {
  console.log(data);
});