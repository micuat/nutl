var colorScheme = new ColorScheme("61e294-ff0000-ffff00-bd93d8-b47aea");

////////

function TEmoji (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.tBase = 0;
  this.pg.noSmooth();
  this.seed = args.seed;

  this.images = [];
  this.images.push(p.loadImage(p.folderName + "/images/Emoji Smiley-02.png"))
  this.images.push(p.loadImage(p.folderName + "/images/Emoji Smiley-07.png"))
  this.images.push(p.loadImage(p.folderName + "/images/Emoji Smiley-12.png"))
  this.images.push(p.loadImage(p.folderName + "/images/Emoji Smiley-24.png"))
}

TEmoji.prototype = Object.create(TLayer.prototype);

TEmoji.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = (args.t);// * 0.5;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
  let tPhase = t - this.tBase;

  pg.clear();
  pg.noStroke();
  pg.translate(this.width/2, this.height/2 + 100*Math.sin((t%1)* 2 * Math.PI + this.seed));
  pg.imageMode(p.CENTER);
  for(let i = 0; i < this.images.length; i++) {
    let r = i * 70;
    let theta = (t%1)* 2 * Math.PI + this.seed;
    pg.image(this.images[(i+Math.floor(t+this.seed))%this.images.length],
      r * Math.cos(theta), r * Math.sin(theta), 70, 70);
    r = i * 70 * 1.5;
    theta = (t%1)* 2 * Math.PI * 2 + this.seed;
    pg.image(this.images[(i+Math.floor(t+this.seed))%this.images.length],
      r * Math.cos(theta), r * Math.sin(theta), 70, 70);
  }
}

TEmoji.prototype.constructor = TEmoji;

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

function S038Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.hydra0 = new Hydra();
  this.hydra1 = new Hydra();
  let ci0 = colorScheme.get(1);
  let ci3 = colorScheme.get(2);
  this.hydra0.voronoi(10,1).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
  this.tHydra = new THydra(p, this.width, this.height, this.hydra0);
  this.tEmoji = new TEmoji(p, this.width, this.height, {
    seed: 0.1
  });
  this.tEmoji2 = new TEmoji(p, this.width, this.height, {
    seed: 0.521
  });
  this.tAnimation = new TLedAnimation(p, this.width, this.height, {
    layer: this.tEmoji.pg,
    type: "strip",
    timeScale: 0.125,
    n: 8
  });
  this.postProcess0 = new PostProcess(p);
  this.postProcess0.setup();
  // this.tAnimation2 = new TLedAnimation(p, this.width, this.height, {
  //   layer: this.tP5a.pg,
  //   type: "stretch",
  //   timeScale: 0.5,
  //   n: 32
  // });
  this.lastT = 0;
  this.tBase = 0;
}

S038Tex.prototype = Object.create(TLayer.prototype);

S038Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tHydra.draw({t: t});
  this.tEmoji.draw({t: t});
  this.tEmoji2.draw({t: t});
  // this.tRito.draw({t: t});
  this.tAnimation.draw({t: t, scratch: p.noise(t * 1) * 0.4});
  // this.tAnimation2.draw({t: t, scratch: 0.0});
  // this.postProcess0.draw("kaleid", this.tP5a.pg, {});
}

S038Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * 0.125;
  let p = this.p;

  // if(Math.floor(t) - Math.floor(this.lastT) > 0) {
  //   this.tBase = t;
  //   pg.clear();
  //   let idx = 3;
  //   pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  //   pg.background(0);
  // }
  this.lastT = t;
  let tPhase = t - this.tBase;

  pg.blendMode(p.BLEND);
  pg.clear();
  this.tHydra.drawTo(pg);
  this.tEmoji2.drawTo(pg);
  this.tAnimation.drawTo(pg);
}

S038Tex.prototype.constructor = S038Tex;

////////

var s = function (p) {
  let s038 = new S038Tex(p, 800, 800);

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
    s038.draw({t: t});
    p.image(s038.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p038 = new p5(s);
