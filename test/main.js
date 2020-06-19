import SimpleMultiPeer from '../lib/index';

var Peers = new SimpleMultiPeer({
  server: process.env.SIGNALLING_SERVER || "ws://localhost:3000", // Your signaller URL.
  room: "test", // Which 'room' you'll be using to communicate with your peers
});

Peers.on("connect", (id, host) => {
  console.log(id+" connected to "+ host);
})

Peers.on("connection", (id) => {
  console.log("I am " + id);
});

document.querySelector("#send").addEventListener("click",send);

Peers.on("message", res => {
  console.log(res);
  
  let li = document.createElement("li");
  li.innerHTML = res.data.message;
  document.querySelector("#messages").prepend(li);
})

function send(e) {
  let value = document.querySelector("#message").value;
  let li = document.createElement("li");
  li.innerHTML = value;
  document.querySelector("#messages").prepend(li);
  document.querySelector("#message").value = "";
  Peers.emit("message", value);
}