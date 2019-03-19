var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

var Tile = function (args) {
  this.x = args.x;
  this.y = args.y;
  this.dx = args.dx == undefined ? 0 : args.dx;
  this.dy = args.dy == undefined ? 0 : args.dy;
  this.tick = args.tick;
  this.size = this.tick * 0.8;
  this.connectorSize = this.tick - this.size;
  this.startTime = args.startTime;
  this.colorIndex = args.colorIndex;
}

Tile.prototype.draw = function (args) {
  let tween = Math.min(1, args.t - this.startTime);
  let pg = args.pg;
  pg.push();
  pg.translate(this.x * this.tick, this.y * this.tick, 0);
  let c0 = this.colorIndex;
  let tw0 = EasingFunctions.easeInOutCubic(Math.min(1, tween * 2));
  let tw1 = EasingFunctions.easeInOutCubic(Math.max(0, tween * 2 - 1));
  let sw = this.size;
  let sh = this.size;
  if(this.dx != 0) {
    sw *= tw1;
  }
  else {
    sh *= tw1;
  }
  pg.push();
  pg.fill(255);
  pg.translate(this.connectorSize * (1 - tw0) * -this.dx, this.connectorSize * (1 - tw0) * -this.dy);
  pg.translate(this.tick * -this.dx / 2, this.tick * -this.dy / 2, -0.001);
  pg.rect(0, 0, this.connectorSize, this.connectorSize);
  pg.pop();
  // pg.fill(0, 50);
  // pg.rect(this.size * (1 - tw1) * 0.5 * -this.dx, this.size * (1 - tw1) * 0.5 * -this.dy, sw+8, sh+8);
  pg.translate(this.size * (1 - tw1) * 0.5 * -this.dx, this.size * (1 - tw1) * 0.5 * -this.dy);
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.rect(0, 0, sw, sh);
  c0 = (c0 + 1) % 5;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  if(this.dx == -1) {
    pg.rotate(Math.PI);
  }
  if(this.dy == -1) {
    pg.rotate(-Math.PI / 2);
  }
  if(this.dy == 1) {
    pg.rotate(Math.PI / 2);
  }
  pg.scale(tw1, tw1);
  pg.triangle(-this.size/2, -this.size/2, 0, 0, -this.size/2, this.size/2);
  pg.pop();
}

Tile.prototype.trigger = function (args) {
  let tiles = args.tiles;
  // let dx = 0;
  let dx = 0;
  let dy = 0;
  let colorIndex = 0;
  if(Math.abs(args.sx) > Math.abs(args.sy)) {
    dx = args.sx > 0 ? 1 : -1;
    colorIndex = args.sx > 0 ? 1 : 0;
  }
  else {
    dy = args.sy > 0 ? 1 : -1;
    colorIndex = args.sx > 0 ? 3 : 2;
  }

  if(Math.abs(args.sx) < this.tick * 0.25 && Math.abs(args.sy) < this.tick * 0.25) {
    colorIndex = 4;
  }

  if(tiles[this.y + dy][this.x + dx] == undefined) {
    tiles[this.y + dy][this.x + dx] = new Tile({
      x: this.x + dx,
      y: this.y + dy,
      dx: dx,
      dy: dy,
      tick: this.tick,
      startTime: args.t,
      colorIndex: colorIndex
    });
  }
}

function S052(p, w, h) {
  TLayer.call(this, p, w, h);
  this.tiles = []; // [y][x]
  this.tick = 200;
  for(let i = 0; i < h / this.tick; i++) {
    this.tiles[i] = [];
    // for(let j = 0; j < w / this.tick; j++) {
    // }
  }
  let x = Math.floor(w / this.tick / 2);
  let y = Math.floor(h / this.tick / 2);
  this.tiles[y][x] = new Tile({
    x: x,
    y: y,
    tick: this.tick,
    startTime: 0,
    colorIndex: 4
  });
}

S052.prototype = Object.create(TLayer.prototype);

S052.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
}

S052.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  let c0 = 0;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 150);

  // pg.translate(this.width / 2, this.height / 2);
  pg.rectMode(p.CENTER);
  pg.noStroke();

  tReturn = function () {
    return 1 - Math.abs(t % 2 - 1);
  }

  for(let i in this.tiles) {
    for(let j in this.tiles[i]) {
      this.tiles[i][j].draw({pg: pg, t: t});
    }
  }
}

S052.prototype.touch = function(args) {
  let p = this.p;

  let x = args.x;
  let y = args.y;
  x = Math.floor(x / this.tick + 0.5);
  y = Math.floor(y / this.tick + 0.5);
  let sx = args.x - x * this.tick;
  let sy = args.y - y * this.tick;
  if(this.tiles[y][x] != undefined) {
    this.tiles[y][x].trigger({x: args.x, y: args.y, sx: sx, sy: sy, tiles: this.tiles, t: args.t});
  } 
}

S052.prototype.constructor = S052;

////////

var s = function (p) {
  let s052 = new S052(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s052.draw({t: t});
    p.image(s052.pg, 0, 0);
  }

  p.mousePressed = function () {
    s052.touch({x: p.mouseX, y: p.mouseY, t: p.millis() * 0.001});
  }
};

var p052 = new p5(s);
