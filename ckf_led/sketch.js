var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
// var colorScheme = new ColorScheme("dfbbb1-f56476-e43f6f-373f51-008dd5");

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

TLayer.prototype.update = function (args) {
}

TLayer.prototype.draw = function (args) {
  let p = this.p;
  this.update(args);
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
  let t = args.t;
  pg.clear();
  pg.background(0);
  pg.colorMode(p.HSB, 255, 255, 255);
  // pg.fill(p.map(Math.sin(t), -1, 1, 0, 255), 255, 255);
  // let x = p.map(Math.sin(t), -1, 1, 0, pg.width);
  // pg.rect(x, 0, 10, 10);
  for(let i = 0; i < pg.width; i++) {
    // pg.line(i, 0, i, pg.height);
    pg.beginShape(p.LINE_STRIP);
    pg.stroke(p.map((t * 0.25 + i *0.002) % 1.0, 0, 1, 0, 255), 255, 255);
    pg.vertex(i, 0);
    pg.stroke(p.map((t * 0.25 + -i *0.002) % 1.0, 1, 0, 0, 255), 255, 255);
    pg.vertex(i, pg.height);
    pg.endShape();
  }
}

TDot.prototype.constructor = TDot;

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

function S034Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
  this.tDot = new TDot(p, 96, 16);
}

S034Tex.prototype = Object.create(TLayer.prototype);

S034Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tDot.draw({t: t});
}


S034Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.background(0);
  // this.tDot.drawTo(pg);
  pg.noStroke();
  let img = this.tDot.pg.get();
  let r = 8;
  for(let i = 0; i < img.height; i++) {
    for(let j = 0; j < img.width; j++) {
      pg.fill(img.get(j, i));
      pg.ellipse((j + 0.5) * r * 2, (i + 0.5) * r * 2, r, r);
    }
  }
}

S034Tex.prototype.constructor = S034Tex;


var s = function (p) {
  let s034Tex = new S034Tex(p, 96 * 16, 16 * 16);

  p.setup = function () {
    p.createCanvas(96 * 4, 16 * 4);
    // p.createCanvas(96 * 16, 16 * 16);
    p.frameRate(30);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s034Tex.draw({t: t});
    p.image(s034Tex.tDot.pg, 0, 0, p.width+8, p.height);
    // p.image(s034Tex.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p034 = new p5(s);
