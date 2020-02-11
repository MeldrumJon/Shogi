let isConnected = false;
let peerID = null;

// Private data
let _peer = null;
let _conn = null;
let _receiveHandlers = {};
let _sendHandlers = {};

function _isFct(f) {
	return (typeof f === 'function');
}

/**
 * Establishes a connection between two peers.  If a peerID is provided, it 
 * begins a connection with that Peer.  Otherwise, it calls the wait callback 
 * function, passing a connection ID.  The user must send this ID to their 
 * peer so that they can connect.
 * 
 * @param {Object} cbs The callbacks object may contain the following functions:
 * @param {String} pID If given, the peer ID to connect to.
 * {
 * 	wait: function(myID) { ... }
 *   	  // Called if a peer ID was not supplied for connection and we are
 * 	      // waiting for a connection from another peer.
 * 	mst_connected: function() { ... }
 *                 // Called when the two peers are connected in the "host" 
 *                 // browser.
 *  slv_connected: function() { ... }
 *                 // Called when the two peers are connected in the browser 
 *                 // supplied with the peer ID.
 * 	disconnected: function() { ... }
 *                // Called when the two peers are disconnected:
 * }
 */
function init(cbs, pID=null) {
	console.log('Connecting to Peer server.');
	peerID = pID;
	_peer = new Peer();
	_peer.on('open', function gotID(myID) { // Connected to Peer server, received ID.
		console.log('Established connection to Peer server. My ID: ' + myID);
		if (pID !== null) { // Connect to the peer.
			console.log('Connecting to peer at ID: ' + pID);
			_connect(_peer.connect(pID)); // Call connect with the data connection.
		} else { // or Wait for a connection
			console.log('Waiting for connection from peer.')
			if (_isFct(cbs.wait)) {
				cbs.wait(myID);
			}
			_peer.on('connection', _connect); // Call connect with the data connection
		}
	});

	function _connect(conn) {
		if (_conn !== null) {
			return;
		}
		_conn = conn;
		_conn.on('open', _connected);
		_conn.on('close', _disconnected);
	}

	function _connected() {
		console.log('Connected to peer at ID: ' + _conn.peer);
		if (peerID === null) {
			if (_isFct(cbs.mst_connected)) {
				cbs.mst_connected();
			}
		} else {
			if (_isFct(cbs.slv_connected)) {
				cbs.slv_connected();
			}
		}

		_conn.on('data', _received); // Call received when we receive data.
		peerID = _conn.peer;
		isConnected = true;
		_peer.disconnect(); // Don't allow any more connections
	}

	function _disconnected() {
		console.log("Data connection has been closed.");
		isConnected = false
		if (_isFct(cbs.disconnected)) {
			cbs.disconnected();
		}
	}
}

/**
 * Received data from a peer.
 * @param {Object} obj JSON object containing 'type' (type of data) and 'data'
 * (data received)
 */
function _received(obj) {
	let type = obj.type;
	let data = obj.data;

	if (_isFct(_receiveHandlers[type])) {
		_receiveHandlers[type](data);
	}
}

/**
 * When the we receive data from the peer, call a function if it matches
 * the given type.
 * @param {String} type Type of data to handle.
 * @param {Function} fct Function to call when we receive that type of data.  
 * The data is passed to fct as a parameter.
 */
function addReceiveHandler(type, fct) {
	_receiveHandlers[type] = fct;
}

function removeReceiveHandler(type) {
	delete _receiveHandlers[type];
}


/**
 * Send data to peer.
 * @param {String} type String that describes the data.
 * @param {*} data Data to send.
 */
function send(type, data) {
	if (_conn === null) {
		throw "Connection not established!";
	}
	_conn.send({
		'type': type,
		'data': data
	});

	if (_isFct(_sendHandlers[type])) {
		_sendHandlers[type](data);
	}
}

/**
 * When the we send data to the peer, call a function if it matches
 * the given type.
 * @param {String} type Type of data to handle.
 * @param {Function} fct Function to call when we send that type of data.  
 * The data is passed to fct as a parameter.
 */
function addSendHandler(type, fct) {
	_sendHandlers[type] = fct;
}

function removeSendHandler(type) {
	delete _sendHandlers[type];
}

export {
	init,
	send,
	addReceiveHandler,
	removeReceiveHandler,
	addSendHandler,
	removeSendHandler,
	isConnected,
	peerID
};