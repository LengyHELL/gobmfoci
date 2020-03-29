import { board } from "./modules/board.js";
import { game, updateGame, drawGame } from "./modules/game.js";
import { menu, updateMenu, drawMenu } from "./modules/menu.js";

board.set();
board.resize(1200, 520);

menu.setMain();
board.updateInterval = setInterval(updateMenu, 1);
board.drawInterval = setInterval(drawMenu, 10);
