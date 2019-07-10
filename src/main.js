import App from './app.js'
import * as comm from './comm.js'

const board = document.getElementById('board');
const bKomadai = document.getElementById('black_komadai');
const wKomadai = document.getElementById('white_komadai');

let game = new App(board, bKomadai, wKomadai);

game.aiParameter.time = 300;
game.aiParameter.searchDepth = 5;
game.aiParameter.randomness = 5;

/**
 * Gets the peer ID we want to connect to from the URL.
 */
function URL2PeerID() {
	let params = new URLSearchParams(window.location.search);
	let peerID = params.get('peerID');
	return peerID;
}

/**
 * Returns a URL containing a peerID parameter.
 * @param {String} id 
 */
function PeerID2URL(id) {
	let url = new URL(window.location.href);
	url.searchParams.append('peerID', id);
	return url;
}

let callbacks = {
	'wait': (id) => {
		// const shareURLEl = document.getElementById('share_url');
		// shareURLEl.innerHTML = PeerID2URL(id).href;
		console.log('Have peer connect to: ' + PeerID2URL(id));
	},
	'mst_connected': () => {
		console.log('Peer connected');
		game.gameStart('sente', true);
	},
	'slv_connected': (metadata) => {
		console.log('Peer connected', metadata);
		game.gameStart('gote', true);
	},
	'disconnected': () => {
		console.log('Peer disconnected')
	}
};
var peerID = URL2PeerID();

if (peerID !== null) {
	comm.init(callbacks, peerID);
} else {
	comm.init(callbacks);
}

comm.addReceiveHandler('move', (data) => {
	console.log("received move", data);
	game.move_(data.fromIdx, data.toIdx, data.promote);
});