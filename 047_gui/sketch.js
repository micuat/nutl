var PolygonHelpers = {
  Quad: function (args) {
    let t0 = args.vignette ? 0 : 0.5;
    let t1 = args.vignette ? 1 : 0.5;
    args.pg.vertex(args.x0, args.y0, t0, t0);
    args.pg.vertex(args.x1, args.y1, t1, t0);
    args.pg.vertex(args.x2, args.y2, t1, t1);
    args.pg.vertex(args.x0, args.y0, t0, t0);
    args.pg.vertex(args.x2, args.y2, t1, t1);
    args.pg.vertex(args.x3, args.y3, t0, t1);
  },
  Rect: function (args) {
    let w = args.width / 2;
    let h = args.height / 2;
    let x = args.x == undefined ? 0 : args.x;
    let y = args.y == undefined ? 0 : args.y;
    PolygonHelpers.Quad({
      pg: args.pg, vignette: args.vignette,
      x0: -w+x, y0: -h+y, x1: w+x, y1: -h+y, x2: w+x, y2: h+y, x3: -w+x, y3: h+y
    });
  },
  Square: function (args) {
    let l = args.size / 2;
    let x = args.x == undefined ? 0 : args.x;
    let y = args.y == undefined ? 0 : args.y;
    PolygonHelpers.Quad({
      pg: args.pg, vignette: args.vignette,
      x0: -l+x, y0: -l+y, x1: l+x, y1: -l+y, x2: l+x, y2: l+y, x3: -l+x, y3: l+y
    });
  }

}

var TriStripData = {}

var TriStrip = {
  begin: function (pg) {
    TriStripData.pg = pg;
    TriStripData.vertices = [];
  },
  fill: function (r, g, b, a) {
    if(a == undefined) a = 255;
    TriStripData.curColor = {r: r, g: g, b: b, a: a};
  },
  vertex: function (x, y, tx, ty) {
    if(tx == undefined) {
      tx = ty = 0.5;
    }
    if(TriStripData.curColor != undefined) {
      let c = TriStripData.curColor;
      TriStripData.vertices.push({x: x, y: y, tx: tx, ty: ty, r: c.r, g: c.g, b: c.b, a: c.a});
    }
    else {
      TriStripData.vertices.push({x: x, y: y, tx: tx, ty: ty});
    }
  },
  end: function() {
    for(let i = 0; i < TriStripData.vertices.length - 2; i+=2) {
      let v0 = TriStripData.vertices[i];
      let v1 = TriStripData.vertices[i+1];
      let v2 = TriStripData.vertices[i+2];
      let v3 = TriStripData.vertices[i+3];
      let v = v0;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);
      v = v1;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);
      v = v2;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);

      v = v2;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);
      v = v1;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);
      v = v3;
      if(v.r != undefined) {
        TriStripData.pg.fill(v.r, v.g, v.b, v.a);
      }
      TriStripData.pg.vertex(v.x, v.y, v.tx, v.ty);
    }
    TriStripData = {};
  }
}

var Atoms = {
  Solid: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let L = args.L;
    pg.fill(col.r, col.g, col.b, 255);
    PolygonHelpers.Square({pg: pg, size: L, vignette: false});
  },
  Doorway: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    let L = args.L;
    let l = EasingFunctions.easeInOutCubic(p.constrain(tween*2,0,1)) * L;

    pg.fill(col.r, col.g, col.b, 255);
    PolygonHelpers.Rect({pg: pg, width: l, height: L, vignette: true, x: args.x, y: args.y, vignette: args.vignette});
  },
  Ring: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    let r0 = args.r0;
    let r1 = args.r1;
    let a = EasingFunctions.easeInOutQuint(tween);
    if(a > 1) a = 2 - a;
    let rate = a;
    pg.fill(col.r, col.g, col.b, 255);

    let n = 20;
    TriStrip.begin(pg);
    for(let i = 0; i <= n; i++) {
      let theta0, theta1, x, y;
      theta0 = i / n * Math.PI * 2.0 * rate + rate * Math.PI;
      x = r1 * Math.sin(theta0);
      y = r1 * -Math.cos(theta0);
      TriStrip.vertex(x, y, 1, 0.5);

      x = r0 * Math.sin(theta0);
      y = r0 * -Math.cos(theta0);
      TriStrip.vertex(x, y, 0.5, 0.5);
    }
    TriStrip.end();
  },
  Bowtie: function (args) {
    let p = args.p;
    let pg = args.pg;
    let col = args.col;
    let tween = args.tween;
    let L = args.L;
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

var Tiles = {};
Tiles.Base = function (args) {
  this.p = args.p;
  this.size = args.size;
  this.colors = args.colorScheme;
  this.colorIndices = args.colorIndices;
  // cooking
  this.shape = this.p.createShape();
  this.draw({pg: this.shape, tween: 1, colors: this.colors});
}

Tiles.Base.prototype.draw = function (args) {
  if(args.cookedShape) {
    return this.shape;
  }
  else {
    args.pg.beginShape(this.p.TRIANGLES);
    args.pg.noStroke();
    this.drawShape(args);
    args.pg.endShape();
  }
}

Tiles.Ring = function (args) {
  Tiles.Base.call(this, args);
}

Tiles.Ring.prototype = Object.create(Tiles.Base.prototype);
Tiles.Ring.prototype.constructor = Tiles.Ring;

Tiles.Ring.prototype.drawShape = function (args) {
  // Atoms.Solid({p: this.p, pg: args.pg, L: this.size, col: {r: 70, g: 70, b: 70}});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size, col: this.colors.get(this.colorIndices[1]), vignette: true, tween: args.tween});
  Atoms.Ring({p: this.p, pg: args.pg, r1: this.size/2, r0: this.size/2*7/9, col: this.colors.get(this.colorIndices[0]), tween: args.tween});
}

Tiles.Ichimatsu = function (args) {
  Tiles.Base.call(this, args);
}

Tiles.Ichimatsu.prototype = Object.create(Tiles.Base.prototype);
Tiles.Ichimatsu.prototype.constructor = Tiles.Ichimatsu;

Tiles.Ichimatsu.prototype.drawShape = function (args) {
  // Atoms.Solid({p: this.p, pg: args.pg, L: this.size, col: {r: 70, g: 70, b: 70}});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size, col: this.colors.get(this.colorIndices[0]), vignette: true, tween: args.tween});
  Atoms.Bowtie({p: this.p, pg: args.pg, L: this.size, col: this.colors.get(this.colorIndices[1]), tween: args.tween});
}

Tiles.Grid = function (args) {
  Tiles.Base.call(this, args);
}

Tiles.Grid.prototype = Object.create(Tiles.Base.prototype);
Tiles.Grid.prototype.constructor = Tiles.Grid;

Tiles.Grid.prototype.drawShape = function (args) {
  // Atoms.Solid({p: this.p, pg: args.pg, L: this.size, col: {r: 70, g: 70, b: 70}});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size, col: this.colors.get(this.colorIndices[0]), vignette: true, tween: args.tween});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size/2, col: this.colors.get(this.colorIndices[1]), x: -this.size/4, y: -this.size/4, tween: args.tween});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size/2, col: this.colors.get(this.colorIndices[1]), x: this.size/4, y: this.size/4, tween: args.tween});
}


Tiles.Sine = function (args) {
  Tiles.Base.call(this, args);
}

Tiles.Sine.prototype = Object.create(Tiles.Base.prototype);
Tiles.Sine.prototype.constructor = Tiles.Sine;

Tiles.Sine.prototype.drawShape = function (args) {
  // Atoms.Solid({p: this.p, pg: args.pg, L: this.size, col: {r: 70, g: 70, b: 70}});
  Atoms.Doorway({p: this.p, pg: args.pg, L: this.size, col: this.colors.get(this.colorIndices[0]), vignette: true, tween: args.tween});
  let pg = args.pg;
  let n = 32;
  let tween = EasingFunctions.easeInOutQuint(args.tween);
  let c = this.colors.get(this.colorIndices[1]);
  pg.fill(c.r, c.g, c.b);
  TriStrip.begin(pg);
  for(let i = -n; i <= n; i++) {
    let env = Math.cos(i / n * Math.PI / 2);
    TriStrip.vertex(i / n * this.size * 0.5, Math.sin(i / n * 4 * Math.PI + tween * Math.PI * 4) * this.size * 0.5 * tween * env);
    TriStrip.vertex(i / n * this.size * 0.5, 0);
  }
  TriStrip.end();
}

var Wefts = {};
Wefts.Base = function (args) {
  this.p = args.p;
  this.colorScheme = args.colorScheme;
  this.globalPattern = args.globalPattern;
  this.gridTick = args.gridTick;
  this.tileAssets = Object.keys(Tiles);
  this.tileAssets.splice(this.tileAssets.indexOf("Base"), 1);
  this.tiles = [null, null, null, null];
  for(let i in this.tiles) {
    let color0 = Math.floor(this.p.random(4));
    let color1 = (color0 + 1) % 5;
    let args = {
      p: this.p,
      colorScheme: this.colorScheme,
      colorIndices: [color0, color1],
      size: this.gridTick * 0.9
    };
    this.tiles[i] = new Tiles[this.tileAssets[Math.floor(Math.random() * this.tileAssets.length)]](args);
  }
}

Wefts.Base.prototype.getTile = function (j, i, id) {
  let N = this.tiles.length;
  return this.tiles[(this.globalPattern(j, i) + id + N) % N];
}

Wefts.Checkered = function (args) {
  Wefts.Base.call(this, args);
}

Wefts.Checkered.prototype = Object.create(Wefts.Base.prototype);
Wefts.Checkered.prototype.constructor = Wefts.Checkered;

Wefts.Checkered.prototype.draw = function (args) {
  let j = args.j;
  let i = args.i;
  let n = 1;//this.patternParams.nAlternate;
  if((j%(n*2)<n && i%(n*2)<n) || (j%(n*2)>=n && i%(n*2)>=n)) {
    return this.getTile(j, i, 0).draw(args);
  }
  else {
    return this.getTile(j, i, 1).draw(args);
  }
}

Wefts.Stripe = function (args) {
  Wefts.Base.call(this, args);
}

Wefts.Stripe.prototype = Object.create(Wefts.Base.prototype);
Wefts.Stripe.prototype.constructor = Wefts.Stripe;

Wefts.Stripe.prototype.draw = function (args) {
  let j = args.j;
  let i = args.i;
  let n = 1;//this.patternParams.nAlternate;
  if(j % (n * 2) < n) {
    return this.getTile(j, i, 0).draw(args);
  }
  else {
    return this.getTile(j, i, 1).draw(args);
  }
}

Wefts.Uniform = function (args) {
  Wefts.Base.call(this, args);
}

Wefts.Uniform.prototype = Object.create(Wefts.Base.prototype);
Wefts.Uniform.prototype.constructor = Wefts.Uniform;

Wefts.Uniform.prototype.draw = function (args) {
  let j = args.j;
  let i = args.i;
  return this.getTile(j, i, 0).draw(args);
}

function S047(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.moveStep = 8; // how many squares for each step (row/col)
  this.numWefts = 5; // number of bundled rows
  this.weftLength = 4; // length compared to the width (which is moveStep)
  this.timeStep = 0.5;
  this.gridTick = 100;
  this.colorSchemes = [
    new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1"),
    new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e")
  ];

  this.shaderVignette = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");
  this.weftAssets = Object.keys(Wefts);
  this.weftAssets.splice(this.weftAssets.indexOf("Base"), 1);

  this.init();
}

S047.prototype = Object.create(TLayer.prototype);
S047.prototype.constructor = S047;

S047.prototype.init = function() {
  let p = this.p;

  this.finishing = 0;
  this.pos = p.createVector(this.moveStep/2-1, this.moveStep/2);
  this.direction = p.createVector(0, 1);
  this.availableDirections = [
    p.createVector(-1,  0),
    p.createVector( 1,  0),
    p.createVector( 0, -1),
    p.createVector( 0,  1)
  ]
  this.moveCount = 0; // counts every move
  this.scale = 4;
  this.scaleDest = 4;

  this.matrix = [];
  for(let i = 0; i < this.moveStep * (this.weftLength + 1); i++) {
    this.matrix[i] = [];
    for(let j = 0; j < this.moveStep * this.numWefts; j++) {
      this.matrix[i][j] = {state: "wait", time: 0};
    }
  }

  // let globalPattern = function (i, j) {
  //   return (i % 2 + j % 2) % 2;
  // }
  let globalPattern = function (i, j) {
    // return Math.abs(Math.floor(i/2) - Math.floor(j/2));
    let n = 8;
    let I = i % (n*2);
    let J = j % (n*2);
    if(I >= n) I = n * 2 - I;
    if(J >= n) J = n * 2 - J;

    // return I + J >= n ? 0 : 2;

    let ij = I + J;
    let off = 0;
    if(ij >= n) {off=1;ij = n * 2 - ij;}

    if(ij <= 2) return 0+off;
    if(ij <= 5) return 2+off;
    return 0+off;
  }
  this.wefts = [];
  let args = {p: this.p, globalPattern: globalPattern, colorScheme: p.random(this.colorSchemes), gridTick: this.gridTick};
  for(let i = 0; i < this.numWefts; i++) {
    this.wefts[i] = new (Wefts[p.random(this.weftAssets)])(args);
    // this.wefts[i] = new Wefts.Uniform(args);
  }

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
    let cycle = (this.weftLength + 1) * 2;
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

S047.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  pg.shader(this.shaderVignette);
  pg.clear();

  pg.background(128);

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
        pg.shape(this.wefts[Math.floor(j / this.moveStep)].draw({
          j: j, i: i, cookedShape: true
        }), j * this.gridTick, i * this.gridTick);
      }
    }
  }
  pg.pop();
  pg.translate(- cx, - cy);

  for(let ii = -this.moveStep; ii <= this.moveStep; ii++) {
    for(let jj = -this.moveStep; jj <= this.moveStep; jj++) {
      // real position
      let rx = cx - jj * this.gridTick;
      let ry = cy - ii * this.gridTick;

      // real id
      let j = Math.floor(rx / this.gridTick);
      let i = Math.floor(ry / this.gridTick);

      pg.pushMatrix();
      pg.translate(jj * this.gridTick, ii * this.gridTick);

      if(this.matrix[i] != undefined && this.matrix[i][j] != undefined) {
        let tween = 0;

        if(this.matrix[i][j].state == "wait") tween = 0;
        else if(this.matrix[i][j].state == "tweening") {
          tween = p.map(t - this.matrix[i][j].time, 0, 0.5, 0, 1);
          this.wefts[Math.floor(j / this.moveStep)].draw({
            j: j, i: i, pg: pg, tween: tween, cookedShape: false
          });
        }
        else {
          // already drawn
        }
      }
      // pg.text(ix + " " + iy, 0, 0);

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
