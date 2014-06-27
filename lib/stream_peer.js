"use strict";

var net = require('net');

var fs = require('fs');

var Speaker = require('speaker');
var lame = require('lame');

var StreamPeer = function() {
	this.server = null;
	this.serverSocket = null;
	this.clientSocket = null;

	this.speaker = new Speaker();
	this.decoder = new lame.Decoder();
}

StreamPeer.prototype.create = function() {
	var instance = this;
	this.server = net.createServer(function(_socket) { //'connection' listener
	  console.log('StreamPeer | serverSocket connected');
	  instance.serverSocket = _socket;

	  instance.speaker = new Speaker();
		instance.speaker.on('flush', function() {
	    console.log('StreamPeer | speaker flush');
	  });

	  instance.speaker.on('close', function() {
	    console.log('StreamPeer | speaker close');
	    if (instance.messagePeer) {
	    	setTimeout(function() {
	    		instance.messagePeer.askForNextTrack();
	    	}, 5000);
			  
		  }
	  });

	  instance.speaker.on('error', function(error) {
	    console.error(error);
	  });

		instance.serverSocket.pipe(instance.speaker);

		instance.serverSocket.on('end', function() {
	    console.log('StreamPeer | serverSocket end');
	  });

	  instance.serverSocket.on('close', function() {
		  console.log('StreamPeer | serverSocket closed');
		});

		instance.serverSocket.on('error', function(error) {
		  console.log(error);
		});
	});
};

StreamPeer.prototype.listen = function(_port) {
	this.server.listen(_port, function() { //'listening' listener
	  console.log('StreamPeer | serverSocket bound on ' + _port);
	});
};

StreamPeer.prototype.connect = function(_port) {
	var instance = this;
	
	this.clientSocket = net.connect({port: _port});

	this.clientSocket.on('connect', function() {
		console.log('StreamPeer | clientSocket connect');

		var rs = fs.createReadStream("music.mp3");
		rs.on('end', function() {
	  	console.log("StreamPeer | rs end");
	  });
	  rs.on('error', function(error) {
	  	console.log(error);
	  });

	  instance.decoder = new lame.Decoder();
	  instance.decoder.on('end', function() {
	  	console.log("StreamPeer | decoder end");
	  });
	  instance.decoder.on('error', function(error) {
	  	console.log(error);
	  });

	  rs.pipe(instance.decoder);
	  instance.decoder.pipe(instance.clientSocket);
	});

	this.clientSocket.on('end', function() {
	  console.log('StreamPeer | clientSocket end');
	});

	this.clientSocket.on('close', function() {
	  console.log('StreamPeer | clientSocket closed');
	});

	this.clientSocket.on('error', function(error) {
	  console.log(error);
	});
};

module.exports = StreamPeer;
