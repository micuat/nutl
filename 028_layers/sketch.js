var colorScheme = new ColorScheme("373f51-008dd5-dfbbb1-f56476-e43f6f");

function TLayer (p, w, h) {
  this.p = p;
  this.width = w;
  this.height = h;
  if(this.patterns == undefined) {
    this.patterns = ["default"];
  }
  this.pgs = {};
  for(let i in this.patterns) {
    let key = this.patterns[i];
    this.pgs[key] = p.createGraphics(this.width, this.height, p.P3D);
  }
  this.pg = this.pgs.default;
}

TLayer.prototype.draw = function (args) {
  let p = this.p;
  for(let key in this.pgs) {
    this.pgs[key].beginDraw();
    this.drawLayer(this.pgs[key], key, args);
    this.pgs[key].endDraw();
  }
}

TLayer.prototype.drawTo = function (pg, key) {
  if(key == undefined) {
    pg.image(this.pg, 0, 0);
  }
  else {
    pg.image(this.pgs[key], 0, 0);
  }
}

////////

function TDot (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDot.prototype = Object.create(TLayer.prototype);

TDot.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.clear();
  let idx = 1;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  idx = 2;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.noStroke();
  for(let i = 0; i < 40; i++) {
    for(let j = 0; j < 40; j++) {
      let x = (j + 0.5) * 20;
      let y = (i + 0.5) * 20;
      let r = (40 - i) * 0.75;
      pg.ellipse(x, y, r, r);
    }
  }
}

TDot.prototype.constructor = TDot;

////////

function TBackBoxes (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TBackBoxes.prototype = Object.create(TLayer.prototype);

TBackBoxes.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let idx = 1;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.noStroke();
  pg.fill(255);
  pg.lights();
  pg.translate(pg.width / 2, pg.height / 2);
  for(let i = 0; i < 400; i++) {
    let v = p5.Vector.random3D();
    v.mult(p.random(0, 400));
    let w = 20 * Math.floor(p.random(0, 5));
    v.x = Math.floor(v.x/w) * w;
    v.y = Math.floor(v.y/w) * w;
    v.z = Math.floor(v.z/w) * w;
    idx = Math.floor(p.random(1, 5));
    pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
    pg.pushMatrix();
    pg.translate(v.x, v.y, v.z);
    // pg.box(w);
    pg.sphere(w/2);
    pg.popMatrix();
  }
}

TBackBoxes.prototype.constructor = TBackBoxes;

////////

function TStripe (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TStripe.prototype = Object.create(TLayer.prototype);

TStripe.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let idx = 3;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  idx = 4;
  pg.stroke(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.translate(this.width / 2, this.height / 2);
  pg.rotate(-Math.PI / 4);
  pg.strokeWeight(10);
  for(let i = -40; i < 40; i++) {
    let x0 = -this.width;
    let y0 = i * 20;
    let x1 = this.width;
    let y1 = i * 20;
    pg.line(x0, y0, x1, y1);
  }
}

TStripe.prototype.constructor = TStripe;

////////

function TRibbons (p, w, h, args) {
  this.patterns = ["default", "mask"];
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.curR = p.random(0, Math.PI * 2);
  this.targetR = 0;
  this.v = p.random(0.5, 1.5);
  this.x = args.x;
  this.y = args.y;
  this.size = args.size;

  // this.pg.smooth(5);
}

TRibbons.prototype = Object.create(TLayer.prototype);

TRibbons.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t * 0.5 + 0.25;

  if(key == "default") {
    if(Math.floor(t) - Math.floor(this.lastT) > 0) {
      this.targetR = Math.floor(p.random(-1, 1) * Math.PI);
    }
    this.lastT = t;
    this.curR = p.lerp(this.curR, this.targetR, 0.05);
  }

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  if(key == "default") {
    pg.lights();
  }
  pg.translate(this.width / 2, this.height / 2);
  pg.rotate(this.curR);
  pg.translate(0, ((t * this.v) % 1) * 80);
  pg.noStroke();
  pg.fill(255);
  pg.rectMode(p.CENTER);
  for(let i = -10; i <= 10; i++) {
    pg.rect(0, i * 80, this.width * 2, 20);
  }
  pg.popStyle();
  pg.popMatrix();
}

TRibbons.prototype.constructor = TRibbons;

////////

function TBox (p, w, h, args) {
  this.patterns = ["default", "mask"];
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.params = {
    x: 0,
    y: 0,
    z: 0,
    w: 1,
    h: 1,
    d: 1,
    rz: 0,
    rx: 0
  };
  this.paramsTarget = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    d: 0,
    rz: 0,
    rx: 0
  };
  this.size = args.size;

  // this.pg.smooth(5);
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t;

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  pg.noStroke();
  if(key == "default") {
    if(Math.floor(t) - Math.floor(this.lastT) > 0) {
      let key = p.random(Object.keys(this.paramsTarget));
      this.paramsTarget[key] = Math.floor(p.random(-4, 5));
      if(key == "w" || key == "h" || key == "d") {
        this.paramsTarget[key] = Math.abs(this.paramsTarget[key]);
        if(this.paramsTarget[key] == 0) this.paramsTarget[key] = 1;
      }
    }
    this.lastT = t;

    for(let key in this.params) {
      this.params[key] = p.lerp(this.params[key], this.paramsTarget[key], 0.1);
    }
    // pg.lights();
  }
  pg.translate(this.width / 2, this.height / 2);
  pg.translate(this.params.x * this.size, this.params.y * this.size, this.params.z * this.size);
  pg.rotateZ(this.params.rz * Math.PI / 2);
  pg.rotateX(this.params.rx * Math.PI / 2);
  pg.box(this.size * (this.params.w + 1),
  this.size * (this.params.h + 1),
  this.size * (this.params.d + 1));
  pg.popStyle();
  pg.popMatrix();
}

TBox.prototype.constructor = TBox;

////////

function TLayerBlend (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.blendMode = args.mode;
  this.bottomLayer = args.bottom;
  this.topLayer = args.top;
  this.maskLayer = args.mask;
}

TLayerBlend.prototype = Object.create(TLayer.prototype);

TLayerBlend.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  pg.clear();
  pg.blendMode(p.BLEND);
  pg.image(this.bottomLayer, 0, 0);
  pg.blendMode(this.blendMode);
  pg.image(this.topLayer, 0, 0);
  if(this.maskLayer != undefined) {
    pg.mask(this.maskLayer);
  }
}

TLayerBlend.prototype.constructor = TLayerBlend;

////////

function S028Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tBackBoxes = new TBackBoxes(p, this.width, this.height);
  this.tBackBoxes.draw();

  this.tStripe = new TStripe(p, this.width, this.height);
  this.tStripe.draw();

  this.tObjects = [];
  for(let i = 0; i < 6; i++) {
    let TObj;
    if(i == 3) TObj = TRibbons;
    else TObj = TBox;
    let tBox = new TObj(p, this.width, this.height, {
      x: p.random(this.width),
      y: p.random(this.height),
      size: 75
    });
    let layeredBox = new TLayerBlend(p, this.width, this.height, {
      top: [this.tDot.pg, this.tStripe.pg, this.tBackBoxes.pg][i % 3],
      bottom: tBox.pgs.default,
      mask: tBox.pgs.mask,
      mode: p.MULTIPLY
    });
        
    this.tObjects.push({
      tBox: tBox,
      layeredBox: layeredBox,
    })
  }
}

S028Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  for(let i in this.tObjects) {
    this.tObjects[i].tBox.draw({t: t});
    this.tObjects[i].layeredBox.draw({t: t});
  }

  pg.beginDraw();
  pg.background(255);

  this.tBackBoxes.drawTo(pg);
  for(let i in this.tObjects) {
    this.tObjects[i].layeredBox.drawTo(pg);
  }

  pg.endDraw();
}

var s = function (p) {
  let s028Tex = new S028Tex(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s028Tex.draw(t);
    p.image(s028Tex.pg, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p028 = new p5(s);
