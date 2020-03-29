import { Vector, magn, proj, unit, deg } from "./vector.js";
import { board } from "./board.js";
import { game, updateGame, drawGame } from "./game.js";

var menu = {
  pos : new Vector(0, 0),
  margt : 50,//margin at top, ...
  margb : 10,//...bottom, ...
  margw : 10,//...sides
  margl : 5,//space between lines
  textSize : 30,
  maxWidth : 250,
  title : "",
  options : [],
  mouseOn : -1,
  selected : -1,
  drawRect : true,
  check : undefined,
  setMain : function() {
    this.selected = -1;
    this.pos.x = 20;
    this.pos.y = 20;

    this.drawRect = false;
    this.title = "Main menu";
    this.options = [];
    this.options.push("Start game");

    this.check = function() {
      if (this.selected == 0) {
        menu.setStart();
      }
    }
  },
  setStart : function() {
    this.selected = -1;
    this.pos.x = 20;
    this.pos.y = 20;

    this.drawRect = false;
    this.title = "Start game";
    this.options = [];
    this.options.push("3 players");
    this.options.push("4 players");
    this.options.push("5 players");

    this.check = function() {
      if (this.selected >= 0) {
        clearInterval(board.updateInterval);
        clearInterval(board.drawInterval);
        game.set(this.selected + 3);
        board.updateInterval = setInterval(updateGame, 1);
        board.drawInterval = setInterval(drawGame, 10);
      }
    }
  },
  setPause : function() {
    this.selected = -1;
    this.pos.x = 465;
    this.pos.y = 150;

    this.drawRect = true;
    this.title = "Game paused";
    this.options = [];
    this.options.push("Resume");
    this.options.push("Restart");
    this.options.push("Exit to main menu");

    this.check = function() {
      if (this.selected == 0) {
        clearInterval(board.updateInterval);
        clearInterval(board.drawInterval);
        board.updateInterval = setInterval(updateGame, 1);
        board.drawInterval = setInterval(drawGame, 10);
      }
      else if (this.selected == 1) {
        clearInterval(board.updateInterval);
        clearInterval(board.drawInterval);
        game.reset();
        game.set(game.players);
        board.updateInterval = setInterval(updateGame, 1);
        board.drawInterval = setInterval(drawGame, 10);
      }
      else if (this.selected == 2) {
        menu.setMain();
      }
    }
  },
  setGameOver : function() {
    this.selected = -1;
    this.pos.x = 465;
    this.pos.y = 150;

    this.drawRect = true;
    if (game.winner == 0) {
      this.title = "Red team won!";
    }
    else {
      this.title = "Blue team won!";
    }
    this.options = [];
    this.options.push("Restart");
    this.options.push("Exit to main menu");

    this.check = function() {
      if (this.selected == 0) {
        clearInterval(board.updateInterval);
        clearInterval(board.drawInterval);
        game.reset();
        game.set(game.players);
        board.updateInterval = setInterval(updateGame, 1);
        board.drawInterval = setInterval(drawGame, 10);
      }
      else if (this.selected == 1) {
        menu.setMain();
      }
    }
  }
};

function updateMenu() {
  let mon = -1;
  for (let i = 0; (i < menu.options.length) && (mon < 0); i++) {
    if (((menu.pos.x + menu.margw) <= board.mousePos.x) && ((menu.pos.x + menu.margw + menu.maxWidth) >= board.mousePos.x)) {
      if (((menu.pos.y + menu.margt + (i * (menu.margl + menu.textSize))) <= board.mousePos.y)
      && ((menu.pos.y + menu.margt + ((i + 1) * menu.textSize) + (i * menu.margl)) >= board.mousePos.y)) {
        mon = i;
      }
    }
  }
  menu.mouseOn = mon;

  if (board.mousePos.but == 0) { board.clickLock = false; }
  else if ((board.mousePos.but > 0) && !board.clickLock) {
    board.clickLock = true;
    if (board.mousePos.but == 1) {
      menu.selected = menu.mouseOn;
    }
  }

  menu.check();
}

function drawMenu() {
  let ctx = board.context;
  ctx.font = String(menu.textSize) + "px Consolas";

  if (menu.drawRect) {
    ctx.beginPath();
    ctx.rect(menu.pos.x, menu.pos.y, (2 * menu.margw) + menu.maxWidth, menu.margt + menu.margb + (menu.options.length * (menu.textSize + menu.margl)) - menu.margl);
    ctx.strokeStyle = "black";
    ctx.fillStyle = "#50b424";
    ctx.fill();
    ctx.stroke();
  }
  else {
    ctx.beginPath();
    ctx.rect(0, 0, board.canvas.width, board.canvas.height);
    ctx.fillStyle = "#50b424";
    ctx.fill();
  }

  if (menu.mouseOn >= 0) {
    ctx.beginPath();
    ctx.rect(menu.pos.x + menu.margw, menu.pos.y + menu.margt + (menu.mouseOn * (menu.textSize + menu.margl)), menu.maxWidth, menu.textSize);
    ctx.strokeStyle = "#5a5a5a";
    ctx.fillStyle = "#dc4242";
    ctx.fill();
    ctx.stroke();
  }

  let corr = menu.textSize * 0.75;
  ctx.strokeStyle = "#5a5a5a";
  ctx.fillStyle = "black";
  ctx.fillText(menu.title, menu.pos.x + menu.margw, menu.pos.y + (menu.margt / 10) + corr, menu.maxWidth);
  ctx.strokeText(menu.title, menu.pos.x + menu.margw, menu.pos.y + (menu.margt / 10) + corr, menu.maxWidth);

  ctx.fillStyle = "#5a5a5a";
  for (let i = 0; i < menu.options.length; i++) {
    ctx.fillText(menu.options[i], menu.pos.x + menu.margw, menu.pos.y + menu.margt + (i * (menu.textSize + menu.margl)) + corr, menu.maxWidth);
  }
}

export { menu, updateMenu, drawMenu };
