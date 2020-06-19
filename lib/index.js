const io = require('socket.io-client');
const SimplePeer = require('simple-peer');
const extend = require('extend');
const EventEmitter = require("events");

const em = new EventEmitter();

var SimpleMultiPeer = function(options) {
  this.signaller = io(options.server);

  this._peerOptions = options.peerOptions || {};
  this._room = options.room;
  this._logs = options.logs || false;

  this.callbacks = options.callbacks || {};
  ['Connect', 'Disconnect', 'Signal', 'Peers'].forEach(function(event) {
    var callback = this['onSignaller' + event].bind(this);
    this.signaller.on(event.toLowerCase(), callback);
  }, this);

  this.peers = {};
};

/*
 * Public API
 */

SimpleMultiPeer.prototype.registerPeerEvents = function(peer, id) {
  ['Connect', 'Signal', 'Data', 'Close'].forEach(function(event) {
    peer.on(event.toLowerCase(), this['onPeer' + event].bind(this, id));
  }, this);
};

SimpleMultiPeer.prototype.send = function(data) {
  Object.keys(this.peers).forEach(function(id) {
    this.peers[id].send(data);
  }, this);
};

SimpleMultiPeer.prototype.emit = function(evt, data) {
  let datafork = data;
  data = !data ? evt : data;
  evt = !datafork ? "message" : evt;
  Object.keys(this.peers).forEach(function(id) {
  this.peers[id].send(JSON.stringify({ event: evt, message: data }));
  }, this) 
}

SimpleMultiPeer.prototype.apply = function(func, args) {
  Object.keys(this.peers).forEach(function(id) {
    this.peers[id][func].apply(this.peers[id], args);
  }, this);
};

/*
 * Signaller Events
 */

SimpleMultiPeer.prototype.onSignallerConnect = function() {
  this.signaller.emit('join', this._room);
};

SimpleMultiPeer.prototype.onSignallerSignal = function(data) {
  if (!this.peers[data.id]) {
    var options = extend({}, this._peerOptions);
    this.peers[data.id] = new SimplePeer(options);
    this.registerPeerEvents(this.peers[data.id], data.id);
  }
  this.peers[data.id].signal(data.signal);
};

SimpleMultiPeer.prototype.onSignallerPeers = function(peers) {
  peers.forEach(function(id) {
    var options = extend({initiator: true}, this._peerOptions);
    this.peers[id] = new SimplePeer(options);
    this.registerPeerEvents(this.peers[id], id);
  }, this);
};

SimpleMultiPeer.prototype.onSignallerDisconnect = function() {
};

/*
 * Peer Events
 */

SimpleMultiPeer.prototype.onPeerConnect = function(id) {
  if (this._logs) console.log('connected to ' + id);
  this.callbacks.connect && this.callbacks.connect.call(this, id);
  em.emit("connect", this.signaller.id ,id);
};

SimpleMultiPeer.prototype.onPeerSignal = function(id, signal) {
  this.signaller.emit('signal', {
    id: id,
    signal: signal,
  });
};

SimpleMultiPeer.prototype.onPeerData = function(id, data) {
  if (this._logs) console.log('received ' + data + ' from ' + id);
  em.emit("data", data, id);
  this.callbacks.data && this.callbacks.data.call(this, id, data);
};

SimpleMultiPeer.prototype.onPeerClose = function(id) {
  delete this.peers[id];
  if (this._logs) console.log('closed to ' + id);
  this.callbacks.close && this.callbacks.close.call(this, id);
  em.emit("closed", id);
};

SimpleMultiPeer.prototype.on = function(evt, cb) {
  const eventBlackList = ["connect","closed"]
  em.on("data", function (data, id) {    
    if (isJson(data)) {
      data = JSON.parse(data);
    }
    data.event = data.event ? data.event : "message"
    data.message = data.message ? data.message : data;
    let dataObject = {from: id, data}
    
    if (evt == data.event && !eventBlackList.includes(evt)) return cb(dataObject);
  });
  em.on("connect", (me ,host) => {
    if (evt == "connect") return cb(me, host);
  })
  em.on("closed", id => {
    if (evt == "closed") return cb(id);
  })
};

// HELPERS

function isJson(data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = SimpleMultiPeer;
