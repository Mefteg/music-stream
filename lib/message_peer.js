"use strict";

var net = require('net');

var MessagePeer = function() {
	this.server = null;
	this.serverSocket = null;
	this.clientSocket = null;
}

MessagePeer.prototype.create = function() {
	var instance = this;
	this.server = net.createServer(function(_socket) { //'connection' listener
	  console.log('MessagePeer | serverSocket connected');
	  instance.serverSocket = _socket;

	  instance.serverSocket.on('data', function(data) {
			instance.processData(data);
		});

		instance.serverSocket.on('end', function() {
	    console.log('MessagePeer | serverSocket end');
	  });

	  instance.serverSocket.on('close', function() {
		  console.log('MessagePeer | serverSocket closed');
		});

		instance.serverSocket.on('error', function(error) {
		  console.error(error);
		});
	});
};

MessagePeer.prototype.listen = function(_port) {
	this.server.listen(_port, function() { //'listening' listener
	  console.log('MessagePeer | serverSocket bound on ' + _port);
	});
};

MessagePeer.prototype.connect = function(_port) {
	var instance = this;
	if (this.clientSocket == null) {
		this.clientSocket = net.connect({port: _port});
	}

	this.clientSocket.on('connect', function() {
		console.log("MessagePeer | clientSocket connect")
	});

	this.clientSocket.on('data', function(data) {
		instance.processData(data);
	});

	this.clientSocket.on('end', function() {
	  console.log('MessagePeer | clientSocket end');
	});

	this.clientSocket.on('close', function() {
	  console.log('MessagePeer | clientSocket closed');
	});

	this.clientSocket.on('error', function(error) {
	  console.error(error);
	});
};

MessagePeer.prototype.askForNextTrack = function() {
	var message = {
		action: "askForNextTrack"
	};
	if (this.serverSocket) {
		this.serverSocket.write(JSON.stringify(message));
	} else {
		console.warn("MessagePeer | no server socket");
	}
};

MessagePeer.prototype.processData = function(_data) {
	var decoded = _data.toString();
	console.log("MessagePeer | " + decoded);

	var json = JSON.parse(decoded);

	switch(json.action) {
		case "askForNextTrack":
			if (this.streamPeer) {
				this.streamPeer.connect(1989);
			} else {
				console.warn("MessagePeer | no stream peer");
			}
			break;
		default:
			console.warn("MessagePeer | action " + json.action + " doesn't match");
	}
};

module.exports = MessagePeer;
