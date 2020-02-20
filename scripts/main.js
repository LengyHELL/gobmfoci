var board = {
  canvas : document.getElementById("cv1"),
  mousePos : { x : 1, y : 0, but : 0 },
  clickLock : true,
  set : function() {
    this.context = this.canvas.getContext("2d");
    this.clickLock = true;
    this.canvas.addEventListener("mousemove", getMousePos, false);
    this.canvas.addEventListener("mousedown", clickStart, false);
    this.canvas.addEventListener("mouseup", clickEnd, false);
    this.canvas.addEventListener("mousedown", function(evt) { evt.preventDefault(); }, false);
    this.canvas.addEventListener("contextmenu", function(evt) { evt.preventDefault(); }, false);
  },
  resize : function(w, h) {
    this.canvas.width = Number(w);
    this.canvas.height = Number(h);
  }
};

board.set();

var game = {
  ballPos : { x : 50.0, y : 50.0 },
  ballForce : { x : 0.0, y : 0.0},
  ballPic : new Image(0, 0),
  set : function() {
    this.ballPic.src = "/gombfoci/scripts/ball.png?" + new Date().getTime();
    this.frames = 0;
  }
};

var interval = undefined;

function start() {
  game.set();
  board.resize(640, 480);
  clearInterval(interval);
  interval = setInterval(update, 1000 / 50);
}

function end() {
  clearInterval(interval);
}

function update() {
  resist = 0.95;
  power = 0.1;

  if (board.mousePos.but == 0) { board.clickLock = false; }
  else if ((board.mousePos.but > 0) && !board.clickLock) {
    board.clickLock = true;

    if (board.mousePos.but == 1) {
      game.ballForce.x += (board.mousePos.x - game.ballPos.x) * power;
      game.ballForce.y += (board.mousePos.y - game.ballPos.y) * power;
    }
  }

  if ((game.ballPos.x + (31 / 2)) > board.canvas.width) {
    if (game.ballForce.x > 0) { game.ballForce.x *= -1; }
  }
  if ((game.ballPos.x - (31 / 2)) < 0) {
    if (game.ballForce.x < 0) { game.ballForce.x *= -1; }
  }

  if ((game.ballPos.y + (31 / 2)) > board.canvas.height) {
    if (game.ballForce.y > 0) { game.ballForce.y *= -1; }
  }
  if ((game.ballPos.y - (31 / 2)) < 0) {
    if (game.ballForce.y < 0) { game.ballForce.y *= -1; }
  }

  game.ballPos.x += game.ballForce.x;
  game.ballPos.y += game.ballForce.y;
  game.ballForce.x *= resist;
  game.ballForce.y *= resist;

  draw();
}

function draw() {
  board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
  ctx = board.context;
  ctx.drawImage(game.ballPic, game.ballPos.x - (31 / 2), game.ballPos.y - (31 / 2), 31, 31);
}

function getMousePos(evt) {
  var rect = board.canvas.getBoundingClientRect();
  board.mousePos.x = Math.floor(evt.clientX - rect.left);
  board.mousePos.y = Math.floor(evt.clientY - rect.top);
}

function clickStart(evt) {
  board.mousePos.but = evt.buttons;
}

function clickEnd(evt) {
  board.mousePos.but = 0;
}
