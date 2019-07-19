import App from './app.js'
import * as comm from './comm.js'
import fsm from './fsm.js'

const board = document.getElementById('board');
const bKomadai = document.getElementById('black_komadai');
const wKomadai = document.getElementById('white_komadai');
const thinking = document.getElementById('loading_area');

let game = new App(board, bKomadai, wKomadai, thinking);

function ai_level(level) {
	game.aiParameter.time = 300*(level+1);
	game.aiParameter.searchDepth = 4+level;
	game.aiParameter.randomness = 5;
	console.log(game.aiParameter);
}
ai_level(0);

/*** Setup DOM ***/

const undoBtn = document.getElementById('undo_button');
undoBtn.onclick = function () {
	game.matta();
}

const levelSelGame = document.getElementById('changeLevelGame');
const levelSel = document.getElementById('selLevel');
// const levelSel = ;
function levelChange() {
	ai_level(parseInt(this.value));
	levelSelGame.value = this.value;
	levelSel.value = this.value;
}
levelSel.onchange = levelChange;
levelSelGame.onchange = levelChange;

const soundChk = document.getElementById('chkSound');
soundChk.onchange = function() {
	game.sound = this.checked;
}

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

// game.gameStart('free', false);

let callbacks = {
	'wait': (id) => {
		const waitingEl = document.getElementById('peer-server-connecting');
		const connectedEl = document.getElementById('peer-id');
		waitingEl.style.display = 'none';
		connectedEl.style.display = 'block';
	
		const shareURLEl = document.getElementById('share_url');
		shareURLEl.innerHTML = PeerID2URL(id).href;
		console.log('Have peer connect to: ' + PeerID2URL(id));
	},
	'mst_connected': () => {
		console.log('Peer connected');
		game.gameStart('sente', true);
		fsm('CONNECTED');
	},
	'slv_connected': (metadata) => {
		console.log('Peer connected', metadata);
		game.gameStart('gote', true);
		fsm('CONNECTED');
	},
	'disconnected': () => {
		console.log('Peer disconnected');
		fsm('DISCONNECTED');
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
	game.move_(data.fromIdx, data.toIdx, data.promote, true);
});

if (peerID !== null) {
	fsm('INIT_PEER');
} else {
	fsm('INIT_HOST');
}

const playOnlineEl = document.getElementById('play_online');
const playComputerEl = document.getElementById('play_computer');
playOnlineEl.onclick = function () {
  fsm('ONLINE');
}
playComputerEl.onclick = function () {
  fsm('COMPUTER');
}

/*** Select and copy share URL ***/
const shareURL = document.getElementById('share_url');
const copyBtn = document.getElementById('copy_btn');
// Select Share URL
shareURL.onclick = function () {
  window.getSelection().selectAllChildren(shareURL);
}
// Copy Share URL
copyBtn.onclick = function () {
  window.getSelection().selectAllChildren(shareURL);
  document.execCommand('copy');
}

const startCompEl = document.getElementById('start_comp');
startCompEl.onclick = function() {
  const firstPlayerEl = document.getElementById('selMoveMode');
  fsm('CONTINUE');
  console.log(firstPlayerEl);
  console.log(firstPlayerEl.selectedIndex)
  if (firstPlayerEl.selectedIndex === 0) {
	game.gameStart('sente', false);
  }
  else {
	game.gameStart('gote', false);
  }
}

/*** Show/Hide Results ***/
const closeResults = document.getElementById('close_result');
closeResults.onclick = function () {
  const body = document.getElementsByTagName("BODY")[0];
  body.classList.remove('results');
}