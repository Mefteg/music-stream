"use strict";

var MessagePeer = require('../lib/message_peer');
var StreamPeer = require('../lib/stream_peer');

var port = 1988;
if (process.argv[2]) {
	port = parseInt(process.argv[2]);
}

var messagePeer = new MessagePeer();
messagePeer.create();
messagePeer.listen(port);

var streamPeer = new StreamPeer();

streamPeer.create();
streamPeer.listen(port + 1);

messagePeer.streamPeer = streamPeer;
streamPeer.messagePeer = messagePeer;

// if this peer wants to join another peer
if (process.argv[3] == "cli") {
	// get other peer's port
	var otherPeerPort = parseInt(process.argv[4]);

	// connect this peer to the other
	messagePeer.connect(otherPeerPort);
	streamPeer.connect(otherPeerPort + 1);
}

