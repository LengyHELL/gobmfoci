import { Vector, magn, proj, unit, deg } from "./vector.js";
import { Ball, Rect, ballToBall, ballToRect } from "./objects.js";
import { board } from "./board.js";
import { menu, updateMenu, drawMenu } from "./menu.js";

var game = {
  balls : [],
  hitPos : 0,//hitting position of the play ball
  rects : [],
  moving : false,
  selected : -1,
  powerPrec : 50,
  powerPrecMin : 1,
  powerMax : 15000,
  resist : 0.01,
  players : 0,//num of players
  scores : [0, 0],//red, blue
  wins : [0, 0],//red, blue
  turn : 0,//0-red, 1-blue
  lineup : 0,//0-red_left, 1-blue_left
  state : 0,//0-pause, 1-red_goal, 2-blue_goal, 3-false_goal, 4-red_win, 5-blue_win, 6-game_over
  goalTimer : 1000,
  passChecked : true,
  passDist : 100,
  passDeg : 45,
  forceSelect : false,
  forceSelected : -1,
  shoot : false,
  onPause : false,
  round : 1,
  winner : -1,
  //ballPic : new Image(0, 0),
  reset : function() {
    this.lineup = 0;
    this.scores = [0, 0];
    this.wins = [0, 0];
    this.turn = 0;
    this.round = 1;
    this.winner = -1;
    this.passChecked = true;
  },
  set : function(p) {
    //this.ballPic.src = "/gombfoci/scripts/ball.png?" + new Date().getTime();
    this.balls = [];
    this.rects = [];
    this.players = p;
    this.powerPrec = 50;
    this.forceSelect = false;
    this.shoot = false;
    this.selected = -1;

    this.state = 0;

    this.balls.push(new Ball(600, 250, 10, 4, 0));

    let ls = 1;
    let rs = 2;
    if (this.lineup == 1) {
      ls = 2;
      rs = 1;
    }

    if (p == 3) {
      this.balls.push(new Ball(400, 250, 15, 6, ls));
      this.balls.push(new Ball(200, 150, 15, 6, ls));
      this.balls.push(new Ball(200, 350, 15, 6, ls));

      this.balls.push(new Ball(800, 250, 15, 6, rs));
      this.balls.push(new Ball(1000, 150, 15, 6, rs));
      this.balls.push(new Ball(1000, 350, 15, 6, rs));
    }
    else if (p == 4) {
      this.balls.push(new Ball(400, 250, 15, 6, ls));
      this.balls.push(new Ball(250, 250, 15, 6, ls));
      this.balls.push(new Ball(200, 150, 15, 6, ls));
      this.balls.push(new Ball(200, 350, 15, 6, ls));

      this.balls.push(new Ball(800, 250, 15, 6, rs));
      this.balls.push(new Ball(950, 250, 15, 6, rs));
      this.balls.push(new Ball(1000, 150, 15, 6, rs));
      this.balls.push(new Ball(1000, 350, 15, 6, rs));
    }
    else if (p == 5) {
      this.balls.push(new Ball(400, 200, 15, 6, ls));
      this.balls.push(new Ball(400, 300, 15, 6, ls));
      this.balls.push(new Ball(250, 250, 15, 6, ls));
      this.balls.push(new Ball(200, 150, 15, 6, ls));
      this.balls.push(new Ball(200, 350, 15, 6, ls));

      this.balls.push(new Ball(800, 200, 15, 6, rs));
      this.balls.push(new Ball(800, 300, 15, 6, rs));
      this.balls.push(new Ball(950, 250, 15, 6, rs));
      this.balls.push(new Ball(1000, 150, 15, 6, rs));
      this.balls.push(new Ball(1000, 350, 15, 6, rs));
    }

    this.rects.push(new Rect(105, 0, 990, 5, 0));
    this.rects.push(new Rect(100, 0, 5, 150, 0));
    this.rects.push(new Rect(100, 350, 5, 150, 0));
    this.rects.push(new Rect(0, 150, 5, 200, rs));
    this.rects.push(new Rect(0, 145, 100, 5, rs));
    this.rects.push(new Rect(0, 350, 100, 5, rs));

    this.rects.push(new Rect(105, 495, 990, 5, 0));
    this.rects.push(new Rect(1095, 0, 5, 150, 0));
    this.rects.push(new Rect(1095, 350, 5, 150, 0));
    this.rects.push(new Rect(1195, 150, 5, 200, ls));
    this.rects.push(new Rect(1100, 145, 100, 5, ls));
    this.rects.push(new Rect(1100, 350, 100, 5, ls));
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

function shade() {
  let ctx = board.context;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, board.canvas.width, board.canvas.height);
}

function updateGame() {
  if ((board.mousePos.x >= 1125) && (board.mousePos.x <= 1175)
  && (board.mousePos.y >= 410) && (board.mousePos.y <= 460)) {
    game.onPause = true;
  }
  else { game.onPause = false; }

  game.moving = isMoving();

  game.powerPrec += board.mousePos.whl * 1;
  if (game.powerPrec < game.powerPrecMin) { game.powerPrec = game.powerPrecMin; }
  if (game.powerPrec > 100) { game.powerPrec = 100; }
  board.mousePos.whl = 0;

  let pbidx = -1;
  for (let i = 0; pbidx < 0; i++) {
    if (game.balls[i].type == 0) { pbidx = i; }
  }

  if ((game.balls[pbidx].pos.y > 150) && (game.balls[pbidx].pos.y < 350) && (game.state == 0)) {
    let ls = 1;
    let rs = 2;
    if (game.lineup == 1) {
      ls = 2;
      rs = 1;
    }

    let team = -1;

    if (game.balls[pbidx].pos.x < 100) {
      if (game.hitPos < 400) { team = rs; }
      else { game.state = 3; }
    }
    else if (game.balls[pbidx].pos.x > 1100) {
      if (game.hitPos > 800) { team = ls; }
      else { game.state = 3; }
    }

    if (team >= 0) {
      game.scores[team - 1] += 1;

      if (game.scores[team - 1] >= 3) {
        game.wins[team - 1] += 1;
        game.round += 1;

        if (game.wins[team - 1] >= 2) {
          game.state = 6;
          game.winner = team - 1;
        }
        else {
          game.state = team + 3;
        }
      }
      else {
        game.state = team;
      }
    }
  }

  if (!game.passChecked && !game.moving && (game.state == 0)) {
    game.passChecked = true;
    let pass = false;
    let selidx = -1;
    let min = game.passDist + 1;
    for (let i = 0; i < game.balls.length; i++) {
      if ((game.balls[i].type == (game.turn + 1)) && (i != game.selected) && game.shoot) {
        let dv = new Vector(game.balls[pbidx].pos.x - game.balls[i].pos.x, game.balls[pbidx].pos.y - game.balls[i].pos.y);
        let dvdir = magn(dv);
        if (dvdir <= game.passDist) {
          let ls = 0;
          let rs = 1;
          if (game.lineup == 1) {
            ls = 1;
            rs = 0;
          }
          let sidev = new Vector(0, 0);
          if (game.turn == ls) { sidev.x = 1; }
          else { sidev.x = -1; }

          if (deg(sidev, unit(dv)) <= game.passDeg) {
            if (dvdir < min) {
              min = dvdir;
              selidx = i;
            }
            pass = true;
          }
        }
      }
    }
    if (!pass) {
      game.turn = 1 - game.turn;
      game.forceSelected = -1;
      game.forceSelect = false;
    }
    else {
      game.forceSelected = selidx;
      game.forceSelect = true;
    }
    game.selected = -1;
    game.shoot = false;
  }

  if (board.mousePos.but == 0) { board.clickLock = false; }
  else if ((board.mousePos.but > 0) && !board.clickLock && !game.moving && (game.state == 0)) {
    board.clickLock = true;
    game.hitPos = game.balls[pbidx].pos.x;

    if ((board.mousePos.but == 1) && game.onPause) {
      shade();
      clearInterval(board.updateInterval);
      clearInterval(board.drawInterval);
      menu.setPause();
      board.updateInterval = setInterval(updateMenu, 1);
      board.drawInterval = setInterval(drawMenu, 10);
    }
    else if ((board.mousePos.but == 1) && (game.selected >= 0)) {
      let dir = new Vector(board.mousePos.x - game.balls[game.selected].pos.x, board.mousePos.y - game.balls[game.selected].pos.y)
      let m = magn(dir);
      dir.x /= m;
      dir.y /= m;

      let tempPwr = (game.powerMax / 100) * game.powerPrec;
      game.balls[game.selected].force.x += dir.x * tempPwr;
      game.balls[game.selected].force.y += dir.y * tempPwr;
      game.passChecked = false;
    }
    if (board.mousePos.but == 2) {
      let sel = false;
      for (let i = 0; (i < game.balls.length) && !sel; i++) {
        let dv = new Vector(game.balls[i].pos.x - board.mousePos.x, game.balls[i].pos.y - board.mousePos.y);
        if ((magn(dv) <= (game.balls[i].radius)) && (game.balls[i].type != 0) && (game.turn == (game.balls[i].type - 1))) {
          if (game.forceSelect && (i != game.forceSelected)) {
            game.selected = -1;
          }
          else {
            sel = true;
            game.selected = i;
          }
        }
        else {
          game.selected = -1;
        }
      }
    }
  }

  if (game.state > 0) {
    game.goalTimer -= 1;
    if (game.goalTimer <= 0) {
      game.goalTimer = 1000;
      if (game.state == 6) {
        shade();
        clearInterval(board.updateInterval);
        clearInterval(board.drawInterval);
        menu.setGameOver();
        board.updateInterval = setInterval(updateMenu, 1);
        board.drawInterval = setInterval(drawMenu, 10);
      }
      else if (game.state > 3) {
        game.scores = [0, 0];
        game.lineup = 1 - game.lineup;
        game.turn = 0;
      }
      game.set(game.players);
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
          if (((i == pbidx) && (j == game.selected)) || ((i == game.selected) && (j == pbidx))) {
            game.shoot = true;
          }
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
  ctx.font = "50px Consolas";

  ctx.beginPath();
  ctx.rect(0, 0, 1200, 520);
  ctx.strokeStyle = "#5fc333";
  ctx.fillStyle = "#5fc333";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(25, 410, 50, 50);
  if (game.turn == 0) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "#dc4242";
  }
  else {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "#424ddc";
  }
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(1125, 410, 50, 50);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "#dc4242";
  if (game.onPause && !game.moving) {
    ctx.fill();
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(1140, 425, 5, 20);
  ctx.rect(1155, 425, 5, 20);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(397.5, 5, 5, 490);
  ctx.rect(797.5, 5, 5, 490);
  ctx.rect(100, 150, 5, 200);
  ctx.rect(1095, 150, 5, 200);
  ctx.strokeStyle = "#50b424";
  ctx.fillStyle = "#50b424";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(597.5, 5, 5, 490);
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(600, 250, 100, 0, 2 * Math.PI);

  let lw = ctx.lineWidth;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "white";

  ctx.stroke();

  ctx.beginPath();
  ctx.arc(600, 250, 5, 0, 2 * Math.PI);

  ctx.stroke();
  ctx.lineWidth = lw;

  let ls = 0;
  let rs = 1;
  if (game.lineup == 1) {
    ls = 1;
    rs = 0;
  }

  ctx.fillStyle = "black"
  ctx.fillText(game.scores[ls], 30, 50);
  ctx.fillText(game.wins[ls], 30, 110);
  ctx.fillText(game.scores[rs], 1130, 50);
  ctx.fillText(game.wins[rs], 1130, 110);



  let shx = Math.floor(Math.random() * 5) - 2;
  let shy = Math.floor(Math.random() * 5) - 2;

  for (let i = 0; i < game.rects.length; i++) {
    ctx.beginPath();
    if ((game.state != 0) && (game.state != 3) && ((game.rects[i].type == game.state) || (game.rects[i].type == game.state - 3)
    || ((game.rects[i].type == (game.winner + 1)) && (game.winner >= 0)))) {
      ctx.rect(game.rects[i].pos.x + shx, game.rects[i].pos.y + shy, game.rects[i].width, game.rects[i].height);
    }
    else {
      ctx.rect(game.rects[i].pos.x, game.rects[i].pos.y, game.rects[i].width, game.rects[i].height);
    }
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

    if ((i == game.selected) && !game.moving && (game.state == 0)) {
      ctx.beginPath();
      ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius + 10, 0, 2 * Math.PI);

      ctx.moveTo(game.balls[i].pos.x, game.balls[i].pos.y);
      ctx.lineTo(board.mousePos.x, board.mousePos.y);

      ctx.strokeStyle = "#5a5a5a";
      ctx.stroke();
    }

    if ((i == game.forceSelected) && (game.selected != game.forceSelected) && !game.moving && (game.state == 0)) {
      ctx.beginPath();
      ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius + 10, 0, 2 * Math.PI);
      ctx.strokeStyle = "#81d1ce";
      ctx.stroke();
    }

    if ((game.balls[i].type == (game.turn + 1)) && game.moving && (i != game.selected) && (game.state == 0) && game.shoot){
      let ls = 0;
      let rs = 1;
      if (game.lineup == 1) {
        ls = 1;
        rs = 0;
      }
      let deg1 = 0;
      let deg2 = 0;
      if (game.turn == ls) {
        deg1 = ((360 - game.passDeg) / 180) * Math.PI;
        deg2 = (game.passDeg / 180) * Math.PI;
      }
      else {
        deg1 = ((180 - game.passDeg) / 180) * Math.PI;
        deg2 = ((180 + game.passDeg) / 180) * Math.PI;
      }
      ctx.beginPath();
      ctx.moveTo(game.balls[i].pos.x, game.balls[i].pos.y);
      ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.passDist, deg1, deg2);
      ctx.lineTo(game.balls[i].pos.x, game.balls[i].pos.y);
      ctx.strokeStyle = "#81d1ce";
      ctx.stroke();
    }
    ctx.lineWidth = lw;
    //ctx.drawImage(game.ballPic, game.balls[i].pos.x - (31 / 2), game.balls[i].pos.y - (31 / 2), 31, 31);
  }

  if (game.state == 1) {
    ctx.fillStyle = "#dc4242";
    ctx.fillText("Goal!", 530, 200);
  }
  else if (game.state == 2) {
    ctx.fillStyle = "#424ddc";
    ctx.fillText("Goal!", 530, 200);
  }
  else if (game.state == 3) {
    ctx.fillStyle = "black";
    ctx.fillText("Fault.", 530, 200);
  }
  else if (game.state == 4) {
    ctx.fillStyle = "#dc4242";
    ctx.fillText("Red team won.", 435, 200);
    ctx.fillStyle = "black";
    ctx.fillText("Round " + String(game.round), 530, 250);
  }
  else if (game.state == 5) {
    ctx.fillStyle = "#424ddc";
    ctx.fillText("Blue team won.", 435, 200);
    ctx.fillStyle = "black";
    ctx.fillText("Round " + String(game.round), 530, 250);
  }
  else if (game.state == 6) {
    if (game.winner == 0) {
      ctx.fillStyle = "#dc4242";
      ctx.fillText("Red team won.", 435, 200);
    }
    else {
      ctx.fillStyle = "#424ddc";
      ctx.fillText("Blue team won.", 435, 200);
    }
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
