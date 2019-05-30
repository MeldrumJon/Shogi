import Position from "./position.js";
import * as ai from "./ai.js";
import * as bits from "./bits.js";
import * as sound from "./sound.js";
import * as positionBook from "./positionBook.js";


const VIEW_INFO = {
	spacing: 58,
	start_x: 16,
	start_y: 16
}


const LABEL_TABLE = {
	0b0001: "飛車",
	0b0010: "角行",
	0b0011: "金将",
	0b0100: "銀将",
	0b0101: "桂馬",
	0b0110: "香車",
	0b0111: "歩兵",
	0b1000: "玉将",
	0b1001: "竜王",
	0b1010: "竜馬",
	0b1100: "成銀",
	0b1101: "成桂",
	0b1110: "成香",
	0b1111: "と金",
};

const SRC_TABLE = {
	"飛車": "res/rook.svg",
	"角行": "res/bishop.svg",
	"金将": "res/goldgen.svg",
	"銀将": "res/silvergen.svg",
	"桂馬": "res/knight.svg",
	"香車": "res/lance.svg",
	"歩兵": "res/pawn.svg",
	"玉将": "res/king.svg",
	"竜王": "res/p_rook.svg",
	"竜馬": "res/p_bishop.svg",
	"成銀": "res/p_silvergen.svg",
	"成桂": "res/p_knight.svg",
	"成香": "res/p_lance.svg",
	"と金": "res/p_pawn.svg"
}

var position = new Position();


// Vue.filter('position', function (piece) {
// 	var x = piece.x,
// 	y = piece.y,
// 	angle = piece.black ? 0 : 180;

//   return `translate(${x}, ${y}) rotate(${angle})`;
// });

export default class App {
	constructor(container, bContainer, wContainer) {
		this.container = container;
		this.bContainer = bContainer;
		this.wContainer = wContainer;

		this.pieces = [];
		this.selectedPiece = null;
		this.lastMoveIndex = 0;
		this.gameMode = null;
		this.gameResult = null;
		this.promotionSelect = {
			show: false,
			x: 0,
			y: 0,
			fromIdx: 0,
			toIdx: 0,
			unpromotedPiece: {
				label: "歩兵",
				x: -31,
				y: 31,
				black: true,
				promoted: false,
			},
			promotedPiece: {
				label: "と金",
				x: 31,
				y: 31,
				black: true,
				promoted: true,
			},
		};
		this.aiParameter = {
			time: 300,
			searchDepth: 5,
			randomness: 5,
		};
		this.soundAvailable = sound.AVAILABLE;
		this.sound = true;
		this.enableDebug = false;
		this.debugInfo = {
			hash: null,
			check: null,
			count: null,
			thinkTime: null,
			thinkTimeTotal: 0,
			thinkTimeSampleCount: 0,
			thinkScore: null,
			expectedMoves: null,
			allMovesCount: null,
			positionList: positionBook.list,
		};
	}
	init() {
		this.gameMode = null;
		this.gameResult = null;
	}
	matta() {
		if (this.gameMode === null || this.gameResult !== null || position.count < 2)
			return;

		this.selectedPiece = null;
		position.undoMove();
		position.undoMove();
		this.promotionSelect.show = false;
		this.draw();
	}
	undo() {
		if (position.count === 0)
			return;

		this.gameResult = null;
		this.selectedPiece = null;
		position.undoMove();
		this.promotionSelect.show = false;
		this.draw();
	}
	reset() {
		this.gameMode = this.gameResult = null;
		this.sound && sound.move();
	}
	_drawPiece(piece) {
		const img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.top = VIEW_INFO.start_y + VIEW_INFO.spacing*piece.y + 'px';
		img.style.left = VIEW_INFO.start_x + VIEW_INFO.spacing*piece.x + 'px';
		img.style.width = VIEW_INFO.spacing + 'px';
		img.style.height = VIEW_INFO.spacing + 'px';
		img.style.transform= piece.black ? "rotate(0deg)" : "rotate(180deg)";
		img.width = VIEW_INFO.spacing;
		img.height = VIEW_INFO.spacing;
		img.src = SRC_TABLE[piece.label];

		img.piece = piece;

		img.innerHTML = piece.label;
		let this_ = this;
		img.onclick = function () {
			this_.selectPiece(null, piece);
		}
		this.container.append(img);
	}
	_drawBPiece(piece) {
		const img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.top = (372 - 22 - piece.y * 40) + 'px';
		img.style.left = (496 + 4 * piece.x_offset + 48 * piece.x) + 'px';
		img.style.width = VIEW_INFO.spacing + 'px';
		img.style.height = VIEW_INFO.spacing + 'px';
		img.style.transform= piece.black ? "rotate(0deg)" : "rotate(180deg)";
		img.width = VIEW_INFO.spacing;
		img.height = VIEW_INFO.spacing;
		img.src = SRC_TABLE[piece.label];

		img.piece = piece;

		img.innerHTML = piece.label;
		let this_ = this;
		img.onclick = function () {
			this_.selectPiece(null, piece);
		}
		this.bContainer.append(img);
	}
	_drawWPiece(piece) {
		const img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.top = (22 + piece.y * 40) + 'px';
		img.style.left = (20 + 4 * piece.x_offset + 48 * piece.x) + 'px';
		img.style.width = VIEW_INFO.spacing + 'px';
		img.style.height = VIEW_INFO.spacing + 'px';
		img.style.transform= piece.black ? "rotate(0deg)" : "rotate(180deg)";
		img.width = VIEW_INFO.spacing;
		img.height = VIEW_INFO.spacing;
		img.src = SRC_TABLE[piece.label];

		img.piece = piece;

		img.innerHTML = piece.label;
		let this_ = this;
		img.onclick = function () {
			this_.selectPiece(null, piece);
		}
		this.wContainer.append(img);
	}
	_drawSquare(x, y) {
		const img = document.createElement('span');
		img.style.position = 'absolute';
		img.style.top = VIEW_INFO.spacing*y + 'px';
		img.style.left = VIEW_INFO.spacing*x + 'px';
		img.style.width = VIEW_INFO.spacing + 'px';
		img.style.height = VIEW_INFO.spacing + 'px';

		img.innerHTML = ' ';
		let this_ = this;
		img.onclick = function () {
			this_.selectSquare(null, x, y);
		}
		this.container.append(img);
	}
	draw() {
		this.container.innerHTML = '';

		var newPieces = [];
		for (let i = 0; i < position.board.length; ++i) {
			let sq = position.board[i],
			label = LABEL_TABLE[sq & 0b1111];

			let x = ((i - 11) % 10);
			let y = ((i - 11) / 10 | 0);

			if (label) {
				let piece = {
					label: label,
					black: !!(sq & 0b010000),
					x: x,
					y: y,
					index: i,
					promoted: !!((sq & 0b1111) !== 0b1000 && sq & 0b1000),
					_uid: (i << 8) + sq,
				};
				newPieces.push(piece);
				this._drawPiece(piece);
			}
			else if (sq !== 0b1000000) { // DNE square
				this._drawSquare(x, y);
			}
		}
		for (let i = 0; i < position.bPieces.length; ++i) {
			for (let j = 0; j < position.bPieces[i]; ++j) {
				let piece = {
					label: LABEL_TABLE[i + 1],
					black: true,
					x: (i % 2),
					y: (i / 2 | 0),
					x_offset: j,
					index: i,
					promoted: false,
					_uid: (1 << 16) + (i << 8) + j,
				}
				newPieces.push(piece);
				this._drawBPiece(piece);
			}
		}
		for (let i = 0; i < position.wPieces.length; ++i) {
			for (let j = 0; j < position.wPieces[i]; ++j) {
				let piece = {
					label: LABEL_TABLE[i + 1],
					black: false,
					x: (i % 2),
					y: (i / 2 | 0),
					x_offset: j,
					index: i,
					promoted: false,
					_uid: (2 << 16) + (i << 8) + j,
				};
				newPieces.push(piece);
				this._drawWPiece(piece);
			}
		}
		this.pieces = newPieces;

		this.lastMoveIndex = position.count > 0 ? position.history[position.count - 1].toIdx : 0;

		this.debugInfo.hash = bits.print54(position.hash);
		this.debugInfo.check = position.check;
		this.debugInfo.count = position.count;
	}
	move(fromIdx, toIdx) {
		if (fromIdx === toIdx) {
			this.selectedPiece = null;
			return;
		}
		switch (position.canMove(fromIdx, toIdx)) {
		case 1:
			this.move_(fromIdx, toIdx, false);
			break;
		case 2:
			this.move_(fromIdx, toIdx, true);
			break;
		case 3:
			this.promotionSelect.unpromotedPiece.label = LABEL_TABLE[position.board[fromIdx] & 0b111];
			this.promotionSelect.unpromotedPiece.black = position.player === 0b010000,
			this.promotionSelect.promotedPiece.label   = LABEL_TABLE[position.board[fromIdx] & 0b111 | 0b1000];
			this.promotionSelect.promotedPiece.black   = position.player === 0b010000,
			this.promotionSelect.show = true;
			this.promotionSelect.fromIdx = fromIdx;
			this.promotionSelect.toIdx = toIdx;
			this.promotionSelect.x = 102 + 41 * ((toIdx - 11) % 10) + 20;
			this.promotionSelect.y = 2 + 41 * ((toIdx - 11) / 10 | 0);
			break;
		}
	}
	move_(fromIdx, toIdx, promote) {
		if (fromIdx & 0b1111000) {
			let from = position.board[fromIdx];
			position.doMove({
				fromIdx,
				toIdx,
				from: from,
				to: promote ? from | 0b1000 : from,
				capture: position.board[toIdx],
			});
		} else {
			position.doMove({
				fromIdx,
				toIdx,
				from: 0,
				to: fromIdx + 1 | position.player,
				capture: 0,
			});
		}

		this.draw();
		this.selectedPiece = null;

		var judgeResult = position.judge();
		if (judgeResult) {
			this.gameEnd(judgeResult.winner, judgeResult.reason || "");
			return;
		}

		this.sound && sound[position.check ? "check" : "move"]();

		if ((this.gameMode === "sente" | this.gameMode === "gote") && position.player === 0b100000)
			window.setTimeout(() => this.moveByAI(), 100);
	}
	moveByAI(after) {
		if (this.gameMode === null)
			return;

		var startTime = new Date().getTime();
		var move = ai.think(position, +this.aiParameter.searchDepth, +this.aiParameter.randomness, +this.aiParameter.time);
		var time = new Date().getTime() - startTime;
		this.debugInfo.thinkTime = time;
		this.debugInfo.thinkTimeTotal += time;
		this.debugInfo.thinkTimeSampleCount += 1;
		this.debugInfo.thinkScore = move.score;
		this.debugInfo.expectedMoves = ai.getExpectedMoves(position);
		this.debugInfo.allMovesCount = ai.getAllMovesCount();
		if (move.depth)
			this.aiParameter.searchDepth = move.depth;

		if (move === null) {
			this.gameResult = ["あなたの勝ちです?"];
			return;
		}
		position.doMove(move);
		ai.settle(position);

		this.promotionSelect.show = false;
		this.draw();

		var judgeResult = position.judge();
		if (judgeResult) {
			this.gameEnd(judgeResult.winner, judgeResult.reason || "");
			return;
		}

		this.sound && sound[position.check ? "check" : "move"]();

		if (after instanceof Function)
			after();
	}
	gameEnd(winner, message) {
		var reason = message ? "[" + message + "]" : "";
		if (winner === null) {
			this.gameResult = ["引き分けです", reason];
		} else {
			switch (this.gameMode) {
			case "sente":
			case "gote":
				this.gameResult = [winner === "black" ? "あなたの勝ちです" : "あなたの負けです", reason];
			break;
			case "free":
				this.gameResult = [winner === "black" ? "先手の勝ちです" : "後手の勝ちです", reason];
				break;
			}
		}
		this.sound && sound.gameEnd();
	}
	gameStart(mode) {
		if (["sente", "gote", "free"].indexOf(mode) === -1)
			return;

		this.gameMode = mode;
		this.selectedPiece = null;
		position = new Position();
		this.promotionSelect.show = false;
		this.gameResult = null;
		this.draw();
		this.sound && sound.gameStart();

		if (this.gameMode === "gote") {
			position.player ^= 0b110000;
			window.setTimeout(() => this.moveByAI(), 300);
		}
	}
	selectPiece(event, piece) {
		if (this.gameMode === null)
			return;

		if (this.selectedPiece === piece) {
			this.selectedPiece = null;
		} else if (this.selectedPiece &&
							 this.selectedPiece.index & 0b1111000 &&
							 piece.index & 0b1111000) {
			this.move(this.selectedPiece.index, piece.index);
		} else if (piece.black === !!(position.player & 0b010000)) {
			this.selectedPiece = piece;
		}
	}
	selectSquare(event, x, y) {
		if (this.gameMode === null)
			return;

		if (this.selectedPiece !== null)
			this.move(this.selectedPiece.index, 11 + 10 * y + x);
	}
	selectPromote() {
		this.move_(this.promotionSelect.fromIdx, this.promotionSelect.toIdx, true);
		this.promotionSelect.show = false;
	}
	selectUnpromote() {
		this.move_(this.promotionSelect.fromIdx, this.promotionSelect.toIdx, false);
		this.promotionSelect.show = false;
	}
	initPosition(id) {
		position = positionBook.getPosition(id);

		this.gameMode = "free";
		this.promotionSelect.show = false;
		this.gameResult = null;
		this.draw();
		this.sound && sound.gameStart();
	}
	printBoard() {
		console.log(position.toString());
	}
	selfMatch() {
		this.gameMove = "free";
		var f = () => setTimeout(this.moveByAI.bind(this, f), 500);
		setTimeout(f, 100);
	}
	hoge() {
		console.dir(ai.think1(position, +this.aiParameter.searchDepth).sort((x, y)=>x[2] === y[2] ? 0 : (x[2] < y[2] ? 1 : -1)));
	}
}