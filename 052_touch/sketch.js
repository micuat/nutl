var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

var hexMode = true;
var Tile = function (args) {
  this.idx = args.idx;
  this.idy = args.idy;
  this.dx = args.dx == undefined ? 0 : args.dx;
  this.dy = args.dy == undefined ? 0 : args.dy;
  this.direction = args.direction == undefined ? new p5.Vector(0, 0) : args.direction;
  this.tick = args.tick;
  this.size = this.tick * 0.7;
  this.connectorSize = this.tick - this.size;
  this.startTime = args.startTime;
  this.colorIndex = args.colorIndex;
  this.ichimatsu = args.ichimatsu;
}

Tile.prototype.draw = function (args) {
  let tween = Math.min(1, args.t - this.startTime);
  let pg = args.pg;
  pg.push();
  let px = this.idx * this.tick * (hexMode ? 1 / 2 * Math.sqrt(3) : 1);
  let py = this.idy * this.tick + ((hexMode && this.idx % 2 == 1) ? -this.tick / 2 : 0)
  pg.translate(px, py, 0);
  let c0 = (this.colorIndex + args.colorShift) % 5;
  let tw0 = EasingFunctions.easeInOutCubic(Math.min(1, tween * 2));
  let tw1 = EasingFunctions.easeInOutCubic(Math.max(0, tween * 2 - 1));
  let sw = this.size;
  let sh = this.size;
  if(this.dx != 0) {
    sw *= tw1;
    sh *= tw1 * 0.5 + 0.5;
  }
  else {
    sw *= tw1 * 0.5 + 0.5;
    sh *= tw1;
  }
  pg.push();
  pg.fill(255);
  if(hexMode) {
    if(this.dx != 0) {
      if(this.idx % 2 == 1) {
        pg.rotate(-Math.PI/6);
      }
      if(this.idx % 2 == 0) {
        pg.rotate(Math.PI/6);
      }
    }
  }
  pg.translate(this.connectorSize * (1 - tw0) * -this.dx, this.connectorSize * (1 - tw0) * -this.dy);
  pg.translate(this.tick * -this.dx / 2, this.tick * -this.dy / 2, -0.001);
  pg.rect(0, 0, this.connectorSize, this.connectorSize);
  pg.pop();

  pg.translate(this.size * (1 - tw1) * 0.5 * -this.dx, this.size * (1 - tw1) * 0.5 * -this.dy);
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  if(hexMode) {
    let n = 6;
    pg.beginShape();
    for(let i = 0; i < n; i++) {
      let r = this.size / 0.7 * 0.5;
      let x = r * Math.cos((i+0.5) / n * 2 * Math.PI);
      let y = r * Math.sin((i+0.5) / n * 2 * Math.PI);
      pg.vertex(x, y);
    }
    pg.endShape();
  }
  else {
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
    if(this.ichimatsu) {
      pg.triangle(this.size/2, -this.size/2, 0, 0, this.size/2, this.size/2);
    }
  }

  // pg.stroke(255);
  // pg.line(0, 0, this.direction.x, this.direction.y);

  pg.pop();
}

Tile.prototype.trigger = function (args) {
  let correctx = args.x;// + this.unitSize * x;
  let correcty = args.y;// + this.unitSize * y;

  let px = this.idx * this.tick * (hexMode ? 1 / 2 * Math.sqrt(3) : 1);
  let py = this.idy * this.tick + ((hexMode && this.idx % 2 == 1) ? -this.tick / 2 : 0)

  if(Math.abs(px - correctx) > this.size / 2 || Math.abs(py - correcty) > this.size / 2) {
    return;
  }

  let centricx = correctx - px;
  let centricy = correcty - py;

  let tiles = args.tiles;
  let dx = 0;
  let dy = 0;
  let direction = new p5.Vector(centricx, centricy);
  let angle = direction.heading();
  angle = ((Math.floor(angle * 6 / (Math.PI*2))) / 6 * 2 * Math.PI);
  direction.set(this.size * Math.cos(angle), this.size * Math.sin(angle));
  let colorIndex = 0;
  if(Math.abs(centricx) > Math.abs(centricy)) {
    dx = centricx > 0 ? 1 : -1;
    colorIndex = centricx > 0 ? 1 : 0;
  }
  else {
    dy = centricy > 0 ? 1 : -1;
    colorIndex = centricx > 0 ? 3 : 2;
  }

  if(Math.abs(centricx) < this.tick * 0.25 && Math.abs(centricy) < this.tick * 0.25) {
    colorIndex = 4;
  }

  if(tiles[this.idy + dy] != undefined && tiles[this.idy + dy][this.idx + dx] == undefined) {
    tiles[this.idy + dy][this.idx + dx] = new Tile({
      idx: this.idx + dx,
      idy: this.idy + dy,
      dx: dx,
      dy: dy,
      direction: direction,
      tick: this.tick,
      startTime: args.t,
      colorIndex: colorIndex,
      ichimatsu: colorIndex == 4
    });
  }
}

function S052(p, w, h) {
  TLayer.call(this, p, w, h);
  this.tiles = []; // [y][x]
  this.tick = 200;
  this.unitSize = 1200;
  for(let i = 0; i < h / this.tick; i++) {
    this.tiles[i] = [];
    // for(let j = 0; j < w / this.tick; j++) {
    // }
  }
  let idx = Math.floor(w / this.tick / 2);
  let idy = Math.floor(h / this.tick / 2);
  this.tiles[idy][idx] = new Tile({
    idx: idx,
    idy: idy,
    tick: this.tick,
    startTime: 0,
    colorIndex: 4,
    ichimatsu: true
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

  pg.translate(this.width / 2, this.height / 2);
  if(t % 8 > 4) {
    let s = p.map(EasingFunctions.easeInOutQuint(Math.abs(t % 8 - 4 - 2) * 0.5), 1, 0, 1, 0.25);
    pg.scale(s, s);
  }
  pg.translate(-this.width / 2, -this.height / 2);
  pg.fill(0, 150);
  // pg.rect(this.tick * 5, this.tick * 5, this.tick, this.tick);
  for(let y = -3; y <= 3; y++) {
    for(let x = -3; x <= 3; x++) {
      pg.push();
      let shift = hexMode ? 2 / Math.sqrt(3) : 1;
      pg.translate(x * this.unitSize * shift, y * this.unitSize);
      let colorShift = 0;
      if(this.tiles[5][5] != undefined) {
        colorShift = x % 2;
      }
      for(let i in this.tiles) {
        for(let j in this.tiles[i]) {
          this.tiles[i][j].draw({pg: pg, t: t, colorShift: colorShift});
        }
      }
      pg.pop();
    }
  }
}

S052.prototype.touched = function(args) {
  let p = this.p;
  let n = 0;
  for(let y = -n; y <= n; y++) {
    for(let x = -n; x <= n; x++) {
      for(let i in this.tiles) {
        for(let j in this.tiles[i]) {
          this.tiles[i][j].trigger({x: args.x, y: args.y, t: args.t, globalx: x, globaly: y, tiles: this.tiles});
        }
      }
    }
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
    s052.touched({x: p.mouseX, y: p.mouseY, t: p.millis() * 0.001});
  }
};

var p052 = new p5(s);
