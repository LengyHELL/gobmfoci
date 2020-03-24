function Vector(x, y) {
  this.x = x;
  this.y = y;
}

function magn(vec) {
  return Math.sqrt((vec.x**2) + (vec.y**2));
}

function proj(a, b) {//b -re
  let mlt = ((a.x * b.x) + (a.y * b.y)) / magn(b)**2;
  return new Vector(b.x * mlt, b.y * mlt);
}

function getdeg(vec1, vec2) {
  let temp = ((vec1.x * vec2.x + vec1.y * vec2.y) / (magn(vec1)) / magn(vec2));
  return (Math.acos(temp) / Math.PI) * 180;
}



function Ball(x, y, r, m, t) {
  this.pos = new Vector(x, y);
  this.force = new Vector(0, 0);
  this.radius = r;
  this.mass = m;
  this.type = t;
}

function Line(xs, ys, xe, ye) {
  this.start = new Vector(xs, ys);
  this.end = new Vector(xe, ye);
}

function isOverlap(s1, e1, s2, e2) {
  return (s1 >= s2 && s1 <= e2) || (s2 >= s1 && s2 <= e1);
}

function ballToBall(ball1, ball2) {
  let dv = new Vector(ball2.pos.x - ball1.pos.x, ball2.pos.y - ball1.pos.y);
  if (magn(dv) < (ball1.radius + ball2.radius)) {
    return true;
  }
  else {
    return false;
  }
}

function ballToLine(ball, line) {
  let temp = (line.end.y - line.start.y) * ball.pos.x;
  temp -= (line.end.x - line.start.x) * ball.pos.y;
  temp += line.end.x * line.start.y;
  temp -= line.end.y * line.start.x;

  if (temp < 0) {
    temp *= -1;
  }

  let div = Math.sqrt((line.end.y - line.start.y)**2 + (line.end.x - line.start.x)**2);
  let dist = temp / div;
  let coll1 = dist < ball.radius;

  let tempv1 = new Vector(line.end.x - line.start.x, line.end.y - line.start.y);
  let tempv2 = proj(new Vector(ball.pos.x - line.start.x, ball.pos.y - line.start.y), tempv1);
  let coll2 = false;
  if (getdeg(tempv1, tempv2) == 0) {
    if (isOverlap(0, magn(tempv1), magn(tempv2) - ball.radius, magn(tempv2) + ball.radius)) {
      coll2 = true;
    }
  }
  return coll1 && coll2;
}



var board = {
  canvas : document.getElementById("cv1"),
  mousePos : { x : 1, y : 0, but : 0 , whl : 0},
  clickLock : true,
  set : function() {
    this.context = this.canvas.getContext("2d");
    this.clickLock = true;
    this.canvas.addEventListener("mousemove", getMousePos, false);
    this.canvas.addEventListener("mousedown", clickStart, false);
    this.canvas.addEventListener("mouseup", clickEnd, false);
    this.canvas.addEventListener("wheel", onWheel, false);
    this.canvas.addEventListener("mousedown", function(evt) { evt.preventDefault(); }, false);
    this.canvas.addEventListener("contextmenu", function(evt) { evt.preventDefault(); }, false);
  },
  resize : function(w, h) {
    this.canvas.width = Number(w);
    this.canvas.height = Number(h);
  }
};

function getMousePos(evt) {
  let rect = board.canvas.getBoundingClientRect();
  board.mousePos.x = Math.floor(evt.clientX - rect.left);
  board.mousePos.y = Math.floor(evt.clientY - rect.top);
}

function clickStart(evt) {
  board.mousePos.but = evt.buttons;
}

function clickEnd(evt) {
  board.mousePos.but = 0;
}

function onWheel(evt) {
  evt.preventDefault();
  if (evt.deltaY > 0) {
    board.mousePos.whl = -1;
  }
  else if (evt.deltaY < 0) {
    board.mousePos.whl = 1;
  }
}



var game = {
  balls : [],
  lines : [],
  selected : -1,
  power : 1000,
  //ballPic : new Image(0, 0),
  set : function(p) {
    //this.ballPic.src = "/gombfoci/scripts/ball.png?" + new Date().getTime();
    this.frames = 0;
    this.balls.push(new Ball(50, 50, 10, 4, 0));
    this.balls.push(new Ball(100, 100, 15, 6, 1));
    this.balls.push(new Ball(200, 200, 15, 6, 2));
    this.lines.push(new Line(500, 100, 500, 200));
    this.lines.push(new Line(500, 200, 400, 200));
    this.lines.push(new Line(400, 200, 400, 100));
    this.lines.push(new Line(400, 100, 500, 100));
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
  let resist = 0.01;

  game.power += board.mousePos.whl * 1000;
  if (game.power < 0) { game.power = 0; }
  if (game.power > 15000) { game.power = 15000; }
  board.mousePos.whl = 0;
  document.getElementById("power").innerHTML = game.power;

  if (board.mousePos.but == 0) { board.clickLock = false; }
  else if ((board.mousePos.but > 0) && !board.clickLock && !isMoving()) {
    board.clickLock = true;

    if ((board.mousePos.but == 1) && (game.selected >= 0)) {
      let dir = new Vector(board.mousePos.x - game.balls[game.selected].pos.x, board.mousePos.y - game.balls[game.selected].pos.y)
      m = magn(dir);
      dir.x /= m;
      dir.y /= m;
      game.balls[game.selected].force.x += dir.x * game.power;
      game.balls[game.selected].force.y += dir.y * game.power;
      game.selected = -1;
    }
    if (board.mousePos.but == 2) {
      let sel = false;
      for (let i = 0; (i < game.balls.length) && !sel; i++) {
        dv = new Vector(game.balls[i].pos.x - board.mousePos.x, game.balls[i].pos.y - board.mousePos.y);
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

    if ((game.balls[i].pos.x + game.balls[i].radius) > board.canvas.width) {
      if (game.balls[i].force.x > 0) { game.balls[i].force.x *= -1; }
    }
    if ((game.balls[i].pos.x - game.balls[i].radius) < 0) {
      if (game.balls[i].force.x < 0) { game.balls[i].force.x *= -1; }
    }

    if ((game.balls[i].pos.y + game.balls[i].radius) > board.canvas.height) {
      if (game.balls[i].force.y > 0) { game.balls[i].force.y *= -1; }
    }
    if ((game.balls[i].pos.y - game.balls[i].radius) < 0) {
      if (game.balls[i].force.y < 0) { game.balls[i].force.y *= -1; }
    }

    for (let j = 0; j < game.lines.length; j++) {
      if (ballToLine(game.balls[i], game.lines[j])) {
        let to = undefined;
        let svec = new Vector(game.lines[j].start.x - game.balls[i].pos.x, game.lines[j].start.y - game.balls[i].pos.y);
        let evec = new Vector(game.lines[j].end.x - game.balls[i].pos.x, game.lines[j].end.y - game.balls[i].pos.y);

        if ((magn(svec) < game.balls[i].radius) && (getdeg(svec, game.balls[i].force) <= 90)) {
          to = svec;
        }
        else if ((magn(evec) < game.balls[i].radius) && (getdeg(evec, game.balls[i].force) <= 90)) {
          to = evec;
        }
        else {
          to = new Vector(game.lines[j].start.y - game.lines[j].end.y, -1 * (game.lines[j].start.x - game.lines[j].end.x));
        }

        let tforce = proj(game.balls[i].force, to);
        game.balls[i].force.x -= tforce.x * 2;
        game.balls[i].force.y -= tforce.y * 2;
      }
    }

    for (let j = 0; j < game.balls.length; j++) {
      if (j != i) {
        if (ballToBall(game.balls[i], game.balls[j])) {//vegp - kezdop
          let to = new Vector(game.balls[j].pos.x - game.balls[i].pos.x, game.balls[j].pos.y - game.balls[i].pos.y);

          if (getdeg(to, game.balls[i].force) <= 90) {
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
    game.balls[i].force.x -= game.balls[i].force.x * resist;
    game.balls[i].force.y -= game.balls[i].force.y * resist;
  }
}

function drawGame() {
  board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
  let ctx = board.context;

  for (let i = 0; i < game.lines.length; i++) {
    ctx.beginPath();
    ctx.moveTo(game.lines[i].start.x, game.lines[i].start.y);
    ctx.lineTo(game.lines[i].end.x, game.lines[i].end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  for (let i = 0; i < game.balls.length; i++) {
    ctx.beginPath();
    ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius, 0, 2 * Math.PI);

    if (game.balls[i].type == 1) {
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
    }
    else if (game.balls[i].type == 2) {
      ctx.strokeStyle = "blue";
      ctx.fillStyle = "blue";
    }
    else {
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
    }

    ctx.fill();
    ctx.stroke();

    if (i == game.selected) {
      ctx.beginPath();
      ctx.arc(game.balls[i].pos.x, game.balls[i].pos.y, game.balls[i].radius + 10, 0, 2 * Math.PI);
      ctx.strokeStyle = "black";
      ctx.stroke();
    }
    //ctx.drawImage(game.ballPic, game.balls[i].pos.x - (31 / 2), game.balls[i].pos.y - (31 / 2), 31, 31);
  }
}



var menu = {
  title : "",
  options : []
};



board.set();
var interval1 = undefined;
var interval2 = undefined;

function start() {
  game.set();
  board.resize(640, 480);
  clearInterval(interval1);
  clearInterval(interval2);
  interval1 = setInterval(drawGame, 10)
  interval2 = setInterval(updateGame, 1);
}
