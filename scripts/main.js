import { board } from "./modules/board.js";
import { game, updateGame, drawGame } from "./modules/game.js";

board.set();
var drawInterval = undefined;
var updateInterval = undefined;

game.set(5);
board.resize(1200, 520);
clearInterval(drawInterval);
clearInterval(updateInterval);
drawInterval = setInterval(drawGame, 10)
updateInterval = setInterval(updateGame, 1);
