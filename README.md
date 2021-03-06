# Shogi

Online Shogi game, based on [Carrot Shogi](https://github.com/carrotflakes/carrot-shogi). Translated into English. Aesthetic improvements. Added the ability to play against human players across the internet using [PeerJS](https://peerjs.com/).

## Testing Locally

1. Install [Node's](https://nodejs.org/en/) http-server package:
```
sudo npm install http-server -g
```
2. Run `http-server -c-1 [path]` where path points to this folder.
3. Open localhost:8080 in the browser.

## Aesthetics

Shogi piece images based on Hari Sheldon's work on [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:SVG_traditional_shogi_pieces) and are licensed CC-BY-SA-3.0. Piece borders and lighter color kanji layers were removed. The pieces were resized based on their value.

Computer "thinking" gif created with [ajaxload.info](http://www.ajaxload.info/).

Wood texture based on [JCW's Wood texture at OpenGameArt.com](https://opengameart.org/content/wood-texture-tiles).

## License

This project's source code is licensed under the [MIT license](./LICENSE). Images in the `res` directory are licensed [CC-BY-SA-3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en). PeerJS is licensed under the [MIT license](https://tldrlegal.com/license/mit-license), and its source code is available [here](https://github.com/peers/peerjs).
