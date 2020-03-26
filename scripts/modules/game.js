import { Vector, magn, proj, unit, deg } from "./vector.js";
import { Ball, Rect, ballToBall, ballToRect } from "./objects.js";
import { board } from "./board.js";

var game = {
  balls : [],
  rects : [],
  selected : -1,
  powerPrec : 50,
  powerPrecMin : 1,
  powerMax : 15000,
  resist : 0.01,
  //ballPic : new Image(0, 0),
  set : function(p) {
    //this.ballPic.src = "/gombfoci/scripts/ball.png?" + new Date().getTime();
    this.frames = 0;
    this.balls.push(new Ball(600, 250, 10, 4, 0));
    this.balls.push(new Ball(400, 250, 15, 6, 1));
    this.balls.push(new Ball(800, 250, 15, 6, 2));

    this.rects.push(new Rect(105, 0, 990, 5));
    this.rects.push(new Rect(100, 0, 5, 150));
    this.rects.push(new Rect(100, 350, 5, 150));
    this.rects.push(new Rect(0, 150, 5, 200));
    this.rects.push(new Rect(0, 145, 100, 5));
    this.rects.push(new Rect(0, 350, 100, 5));

    this.rects.push(new Rect(105, 495, 990, 5));
    this.rects.push(new Rect(1095, 0, 5, 150));
    this.rects.push(new Rect(1095, 350, 5, 150));
    this.rects.push(new Rect(1195, 150, 5, 200));
    this.rects.push(new Rect(1100, 145, 100, 5));
    this.rects.push(new Rect(1100, 350, 100, 5));
  },
};

function isMoving() {
  let temp = 0;
  let limit = 0.5;
  for (let i = 0; i < game.balls.length; i++) {
    temp += magn(game.balls[i].force);
  }
  if (temp > limit) { return true; }
  else { return false; }
}

function updateGame() {
  game.powerPrec += board.mousePos.whl * 1;
  if (game.powerPrec < game.powerPrecMin) { game.powerPrec = game.powerPrecMin; }
  if (game.powerPrec > 100) { game.powerPrec = 100; }
  board.mousePos.whl = 0;

  if (board.mousePos.but == 0) { board.clickLock = false; }
  else if ((board.mousePos.but > 0) && !board.clickLock && !isMoving()) {
    board.clickLock = true;

    if ((board.mousePos.but == 1) && (game.selected >= 0)) {
      let dir = new Vector(board.mousePos.x - game.balls[game.selected].pos.x, board.mousePos.y - game.balls[game.selected].pos.y)
      let m = magn(dir);
      dir.x /= m;
      dir.y /= m;

      let tempPwr = (game.powerMax / 100) * game.powerPrec;
      game.balls[game.selected].force.x += dir.x * tempPwr;
      game.balls[game.selected].force.y += dir.y * tempPwr;
      game.selected = -1;
    }
    if (board.mousePos.but == 2) {
      let sel = false;
      for (let i = 0; (i < game.balls.length) && !sel; i++) {
        let dv = new Vector(game.balls[i].pos.x - board.mousePos.x, game.balls[i].pos.y - board.mousePos.y);
        if ((magn(dv) < (game.balls[i].radius)) && (game.balls[i].type != 0)) {
          sel = true;
          game.selected = i;
        }
        else {
          game.selected = -1;
        }
      }
    }
  }

  for (let i = 0; i < game.balls.length; i++) {



    for (let j = 0; j < game.rects.length; j++) {
      let temp = ballToRect(game.balls[i], game.rects[j]);
      if ((Math.abs(temp.x) + Math.abs(temp.y)) > 0) {
        let tforce = proj(game.balls[i].force, temp);
        game.balls[i].force.x -= tforce.x * 2;
        game.balls[i].force.y -= tforce.y * 2;
        game.balls[i].pos.x += temp.x;
        game.balls[i].pos.y += temp.y;
      }
    }

    for (let j = 0; j < game.balls.length; j++) {
      if (j != i) {
        if (ballToBall(game.balls[i], game.balls[j])) {//vegp - kezdop
          let to = new Vector(game.balls[j].pos.x - game.balls[i].pos.x, game.balls[j].pos.y - game.balls[i].pos.y);

          if (deg(to, game.balls[i].force) <= 90) {
            let tforce = proj(game.balls[i].force, to);
            let tmass = game.balls[i].mass + game.balls[j].mass;
            game.balls[i].force.x -= ((tforce.x * 2) / tmass) * game.balls[j].mass;
            game.balls[i].force.y -= ((tforce.y * 2) / tmass) * game.balls[j].mass;
            game.balls[j].force.x += ((tforce.x * 2) / tmass) * game.balls[i].mass;
            game.balls[j].force.y += ((tforce.y * 2) / tmass) * game.balls[i].mass;
          }
        }
      }
    }

    game.balls[i].pos.x += game.balls[i].force.x / 1000;
    game.balls[i].pos.y += game.balls[i].force.y / 1000;
    game.balls[i].force.x -= game.balls[i].force.x * game.resist;
    game.balls[i].force.y -= game.balls[i].force.y * game.resist;
  }
}

function drawGame() {
  board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
  let ctx = board.context;

  ctx.beginPath();
  ctx.rect(0, 0, 1200, 520);
  ctx.strokeStyle = "#5fc333";
  ctx.fillStyle = "#5fc333";
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < game.rects.length; i++) {
    ctx.beginPath();
    ctx.rect(game.rects[i].pos.x, game.rects[i].pos.y, game.rects[i].width, game.rects[i].height);
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
  }

  for (let i = 0; i < game.balls.length; i++) {
    ctx.beginPath();
    ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius, 0, 2 * Math.PI);
    let lw = ctx.lineWidth;
    ctx.lineWidth = 2;

    if (game.balls[i].type == 1) {
      ctx.fillStyle = "#dc4242";
    }
    else if (game.balls[i].type == 2) {
      ctx.fillStyle = "#424ddc";
    }
    else {
      ctx.fillStyle = "#aaaaaa";
    }
    ctx.strokeStyle = "#5a5a5a";

    ctx.fill();
    ctx.stroke();

    if (i == game.selected) {
      ctx.beginPath();
      ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius + 10, 0, 2 * Math.PI);

      ctx.moveTo(game.balls[i].pos.x, game.balls[i].pos.y);
      ctx.lineTo(board.mousePos.x, board.mousePos.y);

      ctx.strokeStyle = "#5a5a5a";
      ctx.stroke();
    }
    ctx.lineWidth = lw;
    //ctx.drawImage(game.ballPic, game.balls[i].pos.x - (31 / 2), game.balls[i].pos.y - (31 / 2), 31, 31);
  }

  //---------hud---------
  ctx.beginPath();
  ctx.rect(100, 505, 1000, 10);
  ctx.fillStyle = "gray";
  ctx.strokeStyle = "gray";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(100, 505, (1000 / 100) * game.powerPrec, 10);
  ctx.fillStyle = "orange";
  ctx.strokeStyle = "orange";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(100, 505, 1000, 10);
  ctx.strokeStyle = "black";
  ctx.stroke();
}

export { game, updateGame, drawGame };
