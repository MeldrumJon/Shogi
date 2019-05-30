import App from './src/app.js'

const cont = document.getElementById('board');
const bCont = document.getElementById('bpieces');
const wCont = document.getElementById('wpieces');

var appVm = new App(cont, bCont, wCont);

appVm.aiParameter.searchDepth = +getUrlParameter("sd", appVm.aiParameter.searchDepth);
appVm.aiParameter.randomness = +getUrlParameter("rn", appVm.aiParameter.randomness);
appVm.enableDebug = !!getUrlParameter("debug", false);
appVm.init();

appVm.gameStart('gote');

appVm.printBoard();

function getUrlParameter(key, def) {
	var str = location.search.split("?");
	if (str.length < 2) {
		return def || "";
	}

	var params = str[1].split("&");
	for (var i = 0; i < params.length; i++) {
		var keyVal = params[i].split("=");
		if (keyVal[0] === key && keyVal.length === 2) {
			return decodeURIComponent(keyVal[1]);
		}
	}
	return def !== undefined ? def : "";
};	