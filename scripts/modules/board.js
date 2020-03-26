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

export { board };
