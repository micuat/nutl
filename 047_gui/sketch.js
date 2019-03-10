function Atom(args) {
  this.p = args.p;
  this.size = args.size;
  // cooking
  this.shape = this.p.createShape();
  this.draw({p: this.p, pg: this.shape, tween: 1, colorScheme: args.colorScheme});
}

Atom.prototype.draw = function (args) {
  if(args.cookedShape) {
    return this.shape;
  }
  else {
    args.pg.beginShape(args.p.TRIANGLES);
    this.drawShape(args);
    args.pg.endShape();
  }
}

var MotionAtoms = {
  Doorway: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    pg.fill(70, 255);
    let L = 90;
    pg.vertex(-L/2, -L/2, 0.5, 0.5);
    pg.vertex(L/2, -L/2, 0.5, 0.5);
    pg.vertex(L/2, L/2, 0.5, 0.5);
    pg.vertex(-L/2, -L/2, 0.5, 0.5);
    pg.vertex(L/2, L/2, 0.5, 0.5);
    pg.vertex(-L/2, L/2, 0.5, 0.5);

    let l = EasingFunctions.easeInOutCubic(p.constrain(tween*2,0,1)) * L;

    pg.fill(col.r, col.g, col.b, 255);
    pg.vertex(-l/2, -L/2, 0, 0);
    pg.vertex(l/2, -L/2, 1, 0);
    pg.vertex(l/2, L/2, 1, 1);
    pg.vertex(-l/2, -L/2, 0, 0);
    pg.vertex(l/2, L/2, 1, 1);
    pg.vertex(-l/2, L/2, 0, 1);
  },
  Ring: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    let r0 = 45;
    let r1 = 35;
    let a = EasingFunctions.easeInOutQuint(tween);
    if(a > 1) a = 2 - a;
    let rate = a;
    pg.fill(col.r, col.g, col.b, 255);

    let n = 20;
    for(let i = 0; i < n; i++) {
      let theta0, theta1, x, y;
      theta0 = i / n * Math.PI * 2.0 * rate + rate * Math.PI;
      theta1 = (i+1) / n * Math.PI * 2.0 * rate + rate * Math.PI;
      x = r0 * Math.sin(theta0);
      y = r0 * -Math.cos(theta0);
      pg.vertex(x, y, 1, 0.5);

      x = r0 * Math.sin(theta1);
      y = r0 * -Math.cos(theta1);
      pg.vertex(x, y, 1, 0.5);

      x = r1 * Math.sin(theta1);
      y = r1 * -Math.cos(theta1);
      pg.vertex(x, y, 0.5, 0.5);

      x = r0 * Math.sin(theta0);
      y = r0 * -Math.cos(theta0);
      pg.vertex(x, y, 1, 0.5);

      x = r1 * Math.sin(theta1);
      y = r1 * -Math.cos(theta1);
      pg.vertex(x, y, 0.5, 0.5);

      x = r1 * Math.sin(theta0);
      y = r1 * -Math.cos(theta0);
      pg.vertex(x, y, 0.5, 0.5);
    }
  },
  Bowtie: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    let L = 90;
    let l = EasingFunctions.easeInOutCubic(p.constrain(tween*2-1,0,1)) * L;

    pg.fill(col.r, col.g, col.b, 255);
    pg.vertex(-L/2, -L/2, 0.5, 0.5);
    pg.vertex(0, 0, 0.5, 0.5);
    pg.vertex(-L/2, -L/2+l, 0.5, 0.5);
    pg.vertex(L/2, -L/2, 0.5, 0.5);
    pg.vertex(0, 0, 0.5, 0.5);
    pg.vertex(L/2, -L/2+l, 0.5, 0.5);
  }
}

function ARing(args) {
  Atom.call(this, args);
}

ARing.prototype = Object.create(Atom.prototype);
ARing.prototype.constructor = AIchimatsu;

ARing.prototype.drawShape = function (args) {
  let p = args.p;
  let pg = args.pg;
  let tween = args.tween;
  pg.noStroke();
  MotionAtoms.Doorway({p: p, pg: pg, col: args.colorScheme.get(1), tween: tween});
  MotionAtoms.Ring({p: p, pg: pg, col: args.colorScheme.get(0), tween: tween});
}

function AIchimatsu(args) {
  Atom.call(this, args);
}

AIchimatsu.prototype = Object.create(Atom.prototype);
AIchimatsu.prototype.constructor = AIchimatsu;

AIchimatsu.prototype.drawShape = function (args) {
  let p = args.p;
  let pg = args.pg;
  let tween = args.tween;
  pg.noStroke();
  MotionAtoms.Doorway({p: p, pg: pg, col: args.colorScheme.get(0), tween: tween});
  MotionAtoms.Bowtie({p: p, pg: pg, col: args.colorScheme.get(1), tween: tween});
}

function S047(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.moveStep = 4;
  this.timeStep = 1;
  this.gridTick = 100;
  this.colorSchemes = [
    new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1"),
    new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e")
  ];

  this.shaderVignette = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");

  this.init();
}

S047.prototype = Object.create(TLayer.prototype);
S047.prototype.constructor = S047;

S047.prototype.init = function() {
  let p = this.p;
  this.colorScheme = p.random(this.colorSchemes);
  this.colorScheme.shuffle();

  this.finishing = 0;
  this.patternParams = {
    nAlternate: Math.floor(p.random(0, 4) + 1)
  };
  this.pos = p.createVector(this.moveStep/2-1, this.moveStep/2);
  this.direction = p.createVector(0, 1);
  this.availableDirections = [
    p.createVector(-1,  0),
    p.createVector( 1,  0),
    p.createVector( 0, -1),
    p.createVector( 0,  1)
  ]
  this.moveCount = 0;
  this.scale = 4;
  this.scaleDest = 4;

  this.matrix = [];
  for(let i = 0; i < 40; i++) {
    this.matrix[i] = [];
    for(let j = 0; j < 20; j++) {
      this.matrix[i][j] = {state: "wait", time: 0};
    }
  }

  this.tiles = {};
  let args = {p: p, colorScheme: this.colorScheme};
  this.tiles.ichimatsu = new AIchimatsu(args);
  this.tiles.ring = new ARing(args);
}

S047.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    let pd = this.direction.copy();
    pd.mult(this.moveStep);
    this.pos.add(pd);
    print(this.pos)

    this.moveCount++;
    let cycle = (Math.floor(this.matrix[0].length / this.moveStep) + 1) * 2;
    if(this.moveCount % cycle <= cycle / 2 - 1 - 1) {
      this.direction = this.availableDirections[3];
    }
    else if(this.moveCount % cycle == cycle / 2 - 1) {
      this.direction = this.availableDirections[1];
    }
    else if(this.moveCount % cycle <= cycle - 1 - 1) {
      this.direction = this.availableDirections[2];
    }
    else {
      this.direction = this.availableDirections[1];
    }

    let destX = this.pos.x + this.direction.x * this.moveStep;
    this.scale = this.scaleDest;
    this.scaleDest = 1 / (Math.max(destX, 5) / 20);
    
    if(this.finishing > 0) {
      this.scaleDest = this.scale;
      this.direction.set(0, 0);
      this.finishing++;
      if(this.finishing >= 4) {
        // ended
        this.init();
      }
    }
    else {
      if(destX > this.matrix[0].length) {
        this.finishing = 1;
        this.direction.set(-this.matrix[0].length / 2 / this.moveStep, -cycle / 2 / this.moveStep);
      }
    }
  }
  this.lastT = t;
}

S047.prototype.drawPattern = function (pg, ix, iy, tween) {
  let n = this.patternParams.nAlternate;
  let cookedShape = pg == null;
  let args = {p: this.p, pg: pg, tween: tween, colorScheme: this.colorScheme, cookedShape: cookedShape};
  if((ix%(n*2)<n && iy%(n*2)<n) || (ix%(n*2)>=n && iy%(n*2)>=n)) {
    return this.tiles.ring.draw(args);
  }
  else {
    return this.tiles.ichimatsu.draw(args);
  }
}

S047.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  pg.shader(this.shaderVignette);
  pg.clear();

  let c0 = 4;
  pg.background(this.colorScheme.get(c0).r, this.colorScheme.get(c0).g, this.colorScheme.get(c0).b, 150);

  pg.translate(this.width / 2, this.height / 2);

  pg.pushMatrix();

  let scale = p.map(EasingFunctions.easeInOutCubic(t % 1), 0, 1, this.scale, this.scaleDest);

  let absx = this.pos.x * this.gridTick;
  let absy = this.pos.y * this.gridTick;

  let dx = (EasingFunctions.easeInOutCubic(t%1) * this.moveStep * this.direction.x) * this.gridTick;
  let dy = (EasingFunctions.easeInOutCubic(t%1) * this.moveStep * this.direction.y) * this.gridTick;

  // legal position that is closest to the center
  let cx = Math.floor((absx + dx) / this.gridTick) * this.gridTick;
  let cy = Math.floor((absy + dy) / this.gridTick) * this.gridTick;

  pg.scale(scale, scale);
  pg.translate(absx + dx, absy + dy);
  pg.push();
  pg.scale(-1,-1)

  let fakedx = (p.map(t%1, 0.1, 0.9, 0, 1) * this.moveStep * this.direction.x) * this.gridTick;
  let fakedy = (p.map(t%1, 0.1, 0.9, 0, 1) * this.moveStep * this.direction.y) * this.gridTick;
  let fakecx = Math.floor((absx + fakedx) / this.gridTick);
  let fakecy = Math.floor((absy + fakedy) / this.gridTick);
  for(let i = 0; i < this.matrix.length; i++) {
    for(let j = 0; j < this.matrix[0].length; j++) {
      if(Math.abs(i-fakecy) <= this.moveStep/2 && Math.abs(j-fakecx) <= this.moveStep/2) {
        if(this.matrix[i][j].state == "wait") {
          this.matrix[i][j].time = t;
          this.matrix[i][j].state = "tweening";
        }
      }

      if(this.matrix[i][j].state == "tweening") {
        let tween = p.map(t - this.matrix[i][j].time, 0, 0.5, 0, 1);
        if(tween >= 1) {
          this.matrix[i][j].state = "done";
        }
      }

      if(this.matrix[i][j].state == "done") {
        pg.shape(this.drawPattern(null, j, i), j * this.gridTick, i * this.gridTick);
      }
    }
  }
  pg.pop();
  pg.translate(- cx, - cy);

  for(let i = -this.moveStep; i <= this.moveStep; i++) {
    for(let j = -this.moveStep; j <= this.moveStep; j++) {
      // real position
      let rx = cx - j * this.gridTick;
      let ry = cy - i * this.gridTick;

      // real id
      let ix = Math.floor(rx / this.gridTick);
      let iy = Math.floor(ry / this.gridTick);

      pg.pushMatrix();
      pg.translate(j * this.gridTick, i * this.gridTick);
      let sx = pg.screenX(0, 0);
      let sy = pg.screenY(0, 0);

      // if(Math.abs(sx - this.width / 2) < (this.width + this.gridTick) / 2
      // && Math.abs(sy - this.height / 2) < (this.height + this.gridTick) / 2) {
      if(true) {
        if(this.matrix[iy] != undefined && this.matrix[iy][ix] != undefined) {
          let tween = 0;

          if(this.matrix[iy][ix].state == "wait") tween = 0;
          else if(this.matrix[iy][ix].state == "tweening") {
            tween = p.map(t - this.matrix[iy][ix].time, 0, 0.5, 0, 1);
            this.drawPattern(pg, ix, iy, tween);
          }
          else {
            // already drawn
          }
        }
        // pg.text(ix + " " + iy, 0, 0);
      }

      pg.popMatrix();
    }
  }

  pg.popMatrix();
}

////////

var s = function (p) {
  let s047 = new S047(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s047.draw({t: t});
    p.background(0);
    p.image(s047.pg, 0, 0);
  }
};

var p047 = new p5(s);
