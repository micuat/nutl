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

function TBox (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  // this.size = args.size;
  // this.delay = args.delay;
  // this.stroke = args.stroke;

  this.tBase = 0;
  // this.pg.smooth(5);
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = (args.t + this.delay);// * 0.5;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
  let tPhase = t - this.tBase;

  pg.fill(255);
  pg.translate(pg.width/2, pg.height/2);
  pg.textSize(128);
  pg.textAlign(p.CENTER, p.CENTER);
  pg.text("text", 0, 0);
}

TBox.prototype.constructor = TBox;

////////

function TLedAnimation (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.layer = args.layer;
}

TLedAnimation.prototype = Object.create(TLayer.prototype);

TLedAnimation.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  pg.clear();
  pg.image(this.layer, 0, 0, 400, 400);
}

TLedAnimation.prototype.constructor = TLedAnimation;

////////

function S034Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.tBox = new TBox(p, this.width, this.height, {
    x: p.random(this.width),
    y: p.random(this.height),
    size: this.width / 10,
    delay: 0.0,
  });
  this.tAnimation = new TLedAnimation(p, this.width, this.height, {
    layer: this.tBox.pg
  });

}

S034Tex.prototype = Object.create(TLayer.prototype);

S034Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tBox.draw({t: t});
  this.tAnimation.draw({t: t});
}


S034Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.background(0);
  this.tAnimation.drawTo(pg);
}

S034Tex.prototype.constructor = S034Tex;


var s = function (p) {
  let s034Tex = new S034Tex(p, 800, 800);

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
    s034Tex.draw({t: t});
    p.image(s034Tex.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p034 = new p5(s);
