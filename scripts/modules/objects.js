import { Vector, magn, proj, unit, deg } from "./vector.js";

function Ball(x, y, r, m, t) {
  this.pos = new Vector(x, y);
  this.force = new Vector(0, 0);
  this.radius = r;
  this.mass = m;
  this.type = t;
}

function Rect(x, y, w, h) {
  this.pos = new Vector(x, y);
  this.width = w;
  this.height = h;
}

function overlap(s1, e1, s2, e2) {
  if ((s1 <= e2) && (s2 <= e1)) {
    let max = s1;
    if (s2 > s1) { max = s2; }

    let min = e1;
    if (e2 < e1) { min = e2; }

    return Math.abs(min - max);
  }
  else { return 0; }
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

function ballToRect(ball, rect) {
  let p = [];
  p.push(new Vector(rect.pos.x, rect.pos.y));
  p.push(new Vector(rect.pos.x, rect.pos.y + rect.height));
  p.push(new Vector(rect.pos.x + rect.width, rect.pos.y));
  p.push(new Vector(rect.pos.x + rect.width, rect.pos.y + rect.height));

  let axes = [];
  for (let i = 0; i < p.length; i++) {
    axes.push(new Vector(ball.pos.x - p[i].x, ball.pos.y - p[i].y));
  }

  let dir = undefined;

  let axis = axes[0];
  let min = magn(axes[0]);
  let near = p[0];
  for (let i = 1; i < axes.length; i++) {
    if (magn(axes[i]) < min) {
      min = magn(axes[i]);
      axis = axes[i];
      near = p[i];
    }
  }

  let xaxis = new Vector(ball.pos.x - near.x, 0);
  let yaxis = new Vector(0, ball.pos.y - near.y);

  let bval = magn(proj(ball.pos, axis));
  if (deg(ball.pos, axis) > 90) { bval *= -1; }

  let pr = [];
  for (let i = 0; i < p.length; i++) {
    let tp = magn(proj(p[i], axis));
    if (deg(p[i], axis) > 90) { tp *= -1; }
    pr.push(tp);
  }

  let rmin = pr[0];
  let rmax = pr[0];

  for (let i = 1; i < pr.length; i++) {
    if (pr[i] < rmin) { rmin = pr[i]; }
    if (pr[i] > rmax) { rmax = pr[i]; }
  }

  let ol = [];

  ol.push(overlap(bval - ball.radius, bval + ball.radius, rmin, rmax));
  ol.push(overlap(rect.pos.y, rect.pos.y + rect.height, ball.pos.y - ball.radius, ball.pos.y + ball.radius));
  ol.push(overlap(rect.pos.x, rect.pos.x + rect.width, ball.pos.x - ball.radius, ball.pos.x + ball.radius));

  if ((ol[0] > 0) && (ol[1] > 0) && (ol[2] > 0)) {
    let sh = 0;
    for (let i = 1; i < ol.length; i++) {
      if (ol[i] < ol[sh]) { sh = i; }
    }
    let ret = undefined;
    let corr = 1.001;
    if (sh == 0) { ret = unit(axis); }
    if (sh == 1) { ret = unit(yaxis); }
    if (sh == 2) { ret = unit(xaxis); }
    return new Vector(ret.x * ol[sh] * corr, ret.y * ol[sh] * corr);
  }
  else { return new Vector(0, 0); }
}

export { Ball, Rect, ballToBall, ballToRect };
