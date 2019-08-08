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
  this.params = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    rz: 0
  };
  this.paramsTarget = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    rz: 0
  };
  this.paramsLast = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    rz: 0
  };
  this.size = args.size;
  this.delay = args.delay;
  this.stroke = args.stroke;

  this.tBase = 0;
  this.mode = "none";
  this.pointMode = this.p.POINTS;
  // this.pg.smooth(5);
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = (args.t + this.delay);// * 0.5;

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  pg.strokeWeight(5);
  pg.stroke(this.stroke);
  pg.noFill();

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    this.mode = p.random(["none", "noise", "sine"]);
    this.pointMode = p.random([p.POINTS, p.LINE_STRIP]);
    for(let key in this.params) {
      this.params[key] = this.paramsTarget[key];
      this.paramsLast[key] = this.paramsTarget[key];
    }

    let key = p.random(Object.keys(this.paramsTarget));
    if(key == "w" || key == "h" || key == "d") {
      this.paramsTarget[key] = Math.floor(p.random(5));
    }
    else if(key == "rx" || key == "rz") {
      this.paramsTarget[key] = Math.floor(p.random(-2, 2));
    }
    else {
      this.paramsTarget[key] = Math.floor(p.random(-4, 5));
    }
  }
  this.lastT = t;
  let tPhase = t - this.tBase;

  for(let key in this.params) {
    this.params[key] = p.lerp(this.paramsLast[key], this.paramsTarget[key], EasingFunctions.easeInOutCubic(tPhase));
  }

  pg.translate(this.width / 2, this.height / 2);
  pg.translate(this.params.x * this.size / 2, this.params.y * this.size / 2);
  pg.rotateZ(this.params.rz * Math.PI / 2);
  pg.rectMode(p.CENTER);
  this.drawRect({
    pg: pg,
    cx: 0, cy: 0, w: this.size * (this.params.w), h: this.size * (this.params.h),
    // cx: 0, cy: 0, w: 0,h:0,
    tPhase: tPhase,
    mode: this.mode, pointMode: this.pointMode
  });
  pg.popStyle();
  pg.popMatrix();
}

TBox.prototype.drawRect = function (args) {
  // args.pg.beginShape();
  // args.pg.vertex(args.cx - args.w / 2, args.cy - args.h / 2);
  // args.pg.vertex(args.cx + args.w / 2, args.cy - args.h / 2);
  // args.pg.vertex(args.cx + args.w / 2, args.cy + args.h / 2);
  // args.pg.vertex(args.cx - args.w / 2, args.cy + args.h / 2);
  // args.pg.endShape(this.p.CLOSE);
  this.drawLine(args, args.cx - args.w / 2, args.cy - args.h / 2, args.cx + args.w / 2, args.cy - args.h / 2);
  this.drawLine(args, args.cx + args.w / 2, args.cy - args.h / 2, args.cx + args.w / 2, args.cy + args.h / 2);
  this.drawLine(args, args.cx + args.w / 2, args.cy + args.h / 2, args.cx - args.w / 2, args.cy + args.h / 2);
  this.drawLine(args, args.cx - args.w / 2, args.cy + args.h / 2, args.cx - args.w / 2, args.cy - args.h / 2);
}

TBox.prototype.drawLine = function (args, x0, y0, x1, y1) {
  let sc = this.p.dist(x0, y0, x1, y1);
  args.pg.strokeWeight(10);
  args.pg.point(x0, y0);
  args.pg.point(x1, y1);
  args.pg.pushMatrix();
  args.pg.translate(x0, y0)
  args.pg.rotate(Math.atan2(y1 - y0, x1 - x0))
  args.pg.strokeWeight(5);
  args.pg.beginShape(args.pointMode);
  let n = sc;
  if(sc == 0) {
  }
  else {
    for(let i = 0; i <= n; i++) {
      let env = (0.5 - Math.abs(args.tPhase-0.5)) * Math.sin(this.p.map(i, 0, n, 0, Math.PI));
      let sig = 0;
      if(args.mode == "noise") {
        sig = this.p.random(-1, 1);
      }
      else if(args.mode == "sine") {
        sig = Math.sin(this.p.map(i + args.tPhase * 200, 0, 100, 0, Math.PI * 8));
      }
      args.pg.vertex(i / n * sc, sig * env * 50);
    }
  }
  args.pg.endShape();
  args.pg.popMatrix();
  // args.pg.line(x0, y0, x1, y1)
}

TBox.prototype.constructor = TBox;

////////

function TGridBase (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.agents = [];
  let n = 20;
  let d = this.pg.width / n;
  for(let i = 0; i <= 20; i++) {
    for(let j = 0; j <= 20; j++) {
      this.agents.push({
        j: j,
        i: i,
        x: (j-n/2) * d,
        y: (i-n/2) * d
      })
    }
  }
}

TGridBase.prototype = Object.create(TLayer.prototype);

TGridBase.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.clear();
  let idx = 1;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  idx = 2;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.noStroke();
  pg.translate(pg.width/2, pg.height/2);
  for(let i in this.agents) {
    let a = this.agents[i];
    let r = 10;
    pg.ellipse(a.x, a.y, r, r);
  }
}

TGridBase.prototype.constructor = TDot;

////////

function S034Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.tGridBase = new TGridBase(p, this.width, this.height);
  let idx = 2;
  this.tBox = new TBox(p, this.width, this.height, {
    x: p.random(this.width),
    y: p.random(this.height),
    size: this.width / 10,
    delay: 0.0,
    stroke: p.color(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b)
  });

}

S034Tex.prototype = Object.create(TLayer.prototype);

S034Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tGridBase.draw({t: t});
  this.tBox.draw({t: t});
}


S034Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.background(255);
  this.tGridBase.drawTo(pg);
  this.tBox.drawTo(pg);
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
