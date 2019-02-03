// var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
var colorScheme = new ColorScheme("c2f970-44344f-564d80-98a6d4-d3fcd5");

////////

function ShaderHelper (p) {
  this.p = p;
}

ShaderHelper.prototype.load = function (path) {
  let fragSourceRaw = this.p.loadStrings(path);
  let fragSource = [];
  for (let i in fragSourceRaw) {
    if (fragSourceRaw[i].match(/^#pragma include "(.*)"$/)) {
      let name = fragSourceRaw[i].replace(/^#pragma include "(.*)"$/, '$1');
      let includeSource = this.p.loadStrings("shaders/hydra/" + name);
      for (let j in includeSource) {
        fragSource.push(includeSource[j]);
      }
    }
    else {
      fragSource.push(fragSourceRaw[i]);
    }
  }
  let vertSource = this.p.loadStrings("libs/textureVert.glsl");
  return new Packages.processing.opengl.PShader(this.p.that, vertSource, fragSource);
}

////////

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
  this.pg.noSmooth();
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = (args.t);// * 0.5;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
  let tPhase = t - this.tBase;

  pg.clear();
  let idx;
  pg.noStroke();
  pg.translate(pg.width/2, pg.height/2);
  pg.rotate(t)
  pg.beginShape();
  idx = 0;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.vertex(-200, -200, 0);
  idx = 2;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.vertex(200, -200, 0);
  idx = 2;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.vertex(200, 200, 0);
  idx = 0;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.vertex(-200, 200, 0);
  pg.endShape();
  // pg.fill(255)
  // pg.textSize(256);
  // pg.textAlign(p.CENTER, p.CENTER);
  // pg.text("PCD\nTOKYO", 0, -50);
}

TBox.prototype.constructor = TBox;

////////

function TLedAnimation (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.layer = args.layer;
  this.splitN = args.n;
  this.layerMod = p.createGraphics(w, h, p.P3D);
  this.mode_dir = "up";
  this.type = args.type;
  this.lastT = -100;
  this.timeScale = args.timeScale;
}

TLedAnimation.prototype = Object.create(TLayer.prototype);

TLedAnimation.prototype.update = function (args) {
  let t = args.t * this.timeScale;        
  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.mode_dir = this.p.random(["left", "right", "up", "down"]);
  }
  this.lastT = t;
  let mode_dir = this.mode_dir;
  this.layerMod.beginDraw();
  this.layerMod.clear();
  if(mode_dir == "up" || mode_dir == "down") {
    this.layerMod.translate(this.layerMod.width / 2, this.layerMod.height / 2);
    this.layerMod.rotate(Math.PI / 2);
    this.layerMod.translate(-this.layerMod.width / 2, -this.layerMod.height / 2);
  }
  this.layerMod.image(this.layer, 0, 0);
  this.layerMod.endDraw();
}

TLedAnimation.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  let t = args.t * this.timeScale + args.scratch;    
  pg.clear();
  pg.noStroke();

  let mode_dir = this.mode_dir;
  if(t % 2 < 1) {
    mode_inout = "in";
  }
  else if(t % 2 >= 1) {
    mode_inout= "out";
  }

  pg.translate(pg.width/2, pg.height/2);
  if(mode_dir == "up" || mode_dir == "down") {
    pg.rotate(Math.PI / -2);
  }
  pg.translate(-pg.width/2, -pg.height/2);

  if(mode_dir == "right" || mode_dir == "up") {
    pg.translate(pg.width/2, pg.height/2);
    pg.scale(-1, 1);
    pg.translate(-pg.width/2, -pg.height/2);
  }

  let n = this.splitN;
  let h = pg.height;
  let tPhase = t % 1;
  pg.textureMode(p.NORMAL);
  if(this.type == "stretch") {
    let w = 0;
    let ti = tPhase;
    if (mode_inout == "in") {
      w = p.lerp(1, 0, ti) * this.pg.width;
    }
    else if (mode_inout == "out") {
      w = p.lerp(0, 1, ti) * this.pg.width;
    }
    let x = 0;
    let y = 0;
    let W = pg.width;
    let tx0 = 0;
    let tx1 = w / W;
    if(mode_dir == "right" || mode_dir == "up") {
      tx0 = 1 - tx0;
      tx1 = 1 - tx1;
    }
    let ty0 = 0;
    let ty1 = 1;
    pg.beginShape(p.QUADS);
    pg.texture(this.layerMod);
    pg.vertex(x, y, tx0, ty0);
    pg.vertex(x + w, y, tx1, ty0);
    pg.vertex(x + w, y + h, tx1, ty1);
    pg.vertex(x, y + h, tx0, ty1);
    pg.endShape();

    pg.beginShape(p.QUADS);
    pg.texture(this.layerMod);
    pg.vertex(w, y, tx1, ty0);
    pg.vertex(W, y, tx1, ty0);
    pg.vertex(W, y + h, tx1, ty1);
    pg.vertex(w, y + h, tx1, ty1);
    pg.endShape();
  }
  else if(this.type == "strip") {
    let w = pg.width / n;
    for(let i = 0; i < n; i++) {
      let off = p.map(0.5-Math.abs(i/n-0.5), 0, 0.5, 0, 1);
      off = Math.sqrt(off) * 0.4;
      let ti = p.constrain(p.map(tPhase, i / n, (i+1) / n, 0+off, 1-off), 0, 1);
      let x;
      if (mode_inout == "in") {
        x = p.lerp(1, i / n, ti) * this.pg.width;
      }
      else if (mode_inout == "out") {
        x = p.lerp(i / n, -1 / n, ti) * this.pg.width;
      }
      let y = 0;
      let tx0 = i / n;
      let tx1 = (i + 1) / n;
      if(mode_dir == "right" || mode_dir == "up") {
        tx0 = 1 - tx0;
        tx1 = 1 - tx1;
      }
      let ty0 = 0;
      let ty1 = 1;
      pg.beginShape(p.QUADS);
      pg.texture(this.layerMod);
      pg.vertex(x, y, tx0, ty0);
      pg.vertex(x + w, y, tx1, ty0);
      pg.vertex(x + w, y + h, tx1, ty1);
      pg.vertex(x, y + h, tx0, ty1);
      pg.endShape();
    }
  }
}

TLedAnimation.prototype.constructor = TLedAnimation;

////////

function THydra (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.shaderHelper = new ShaderHelper(p);
  this.shader = this.shaderHelper.load(p.folderName + "/frag.glsl");
}

THydra.prototype = Object.create(TLayer.prototype);

THydra.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;

  if (p.frameCount % 60 == 0) {
    this.shader = this.shaderHelper.load(p.folderName + "/frag.glsl");
  }

  p.background(0);
  this.shader.set("time", args.t);
  let idx = 0;
  this.shader.set("color0", colorScheme.get(idx).r/255, colorScheme.get(idx).g/255, colorScheme.get(idx).b/255);
  idx = 3;
  this.shader.set("color1", colorScheme.get(idx).r/255, colorScheme.get(idx).g/255, colorScheme.get(idx).b/255);
  pg.filter(this.shader);
}

THydra.prototype.constructor = THydra;

////////

function S037Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.tBox = new THydra(p, this.width, this.height, {});
  // this.tBox = new TBox(p, this.width, this.height, {
  //   x: p.random(this.width),
  //   y: p.random(this.height),
  //   size: this.width / 10,
  //   delay: 0.0,
  // });
  // this.tAnimation = new TLedAnimation(p, this.width, this.height, {
  //   layer: this.tBox.pg,
  //   type: "strip",
  //   timeScale: 0.5,
  //   n: 8
  // });
  // this.postProcess0 = new PostProcess(p);
  // this.postProcess0.setup();
  // this.tAnimation2 = new TLedAnimation(p, this.width, this.height, {
  //   layer: this.tAnimation.pg,
  //   type: "stretch",
  //   timeScale: 0.25,
  //   n: 32
  // });
}

S037Tex.prototype = Object.create(TLayer.prototype);

S037Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tBox.draw({t: t});
  // this.tAnimation.draw({t: t, scratch: p.noise(t * 10) * 0.4});
  // this.tAnimation2.draw({t: t, scratch: 0.0});
}


S037Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  let idx = 3;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  this.tBox.drawTo(pg);
}

S037Tex.prototype.constructor = S037Tex;


var s = function (p) {
  let s037Tex = new S037Tex(p, 800, 800);

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
    s037Tex.draw({t: t});
    p.image(s037Tex.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p037 = new p5(s);
