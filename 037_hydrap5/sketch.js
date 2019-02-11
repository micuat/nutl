var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
// var colorScheme = new ColorScheme("8fbfe0-7c77b9-1d8a99-0bc9cd-14fff7");

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

function S037Tex(p, w, h) {
  TLayer.call(this, p, w, h*2);
  this.pg.smooth(5);

  // this.tRito = new TRitoco01(p, this.width, this.height, {});
  this.tP5a = new TP5aholic1(p, this.width, this.height/2, {});

  this.hydra0 = new Hydra();
  this.hydra1 = new Hydra();
  let ci0 = colorScheme.get(1);
  let ci3 = colorScheme.get(2);
  this.hydra0.osc(20).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
  this.tBox = new THydra(p, this.width, this.height/2, this.hydra0);
  // this.tBox = new TBox(p, this.width, this.height, {
  //   x: p.random(this.width),
  //   y: p.random(this.height),
  //   size: this.width / 10,
  //   delay: 0.0,
  // });
  // this.tAnimation = new TLedAnimation(p, this.width, this.height, {
  //   layer: this.tBox.pg,
  //   type: "strip",
  //   timeScale: 0.125,
  //   n: 8
  // });
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

S037Tex.prototype = Object.create(TLayer.prototype);

S037Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tP5a.draw({t: t});
  this.tBox.draw({t: t});
  // this.tRito.draw({t: t});
  // this.tAnimation.draw({t: t, scratch: p.noise(t * 1) * 0.4});
  // this.tAnimation2.draw({t: t, scratch: 0.0});
  // this.postProcess0.draw("kaleid", this.tP5a.pg, {});
}

S037Tex.prototype.drawLayer = function(pg, key, args) {
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

  // pg.blendMode(p.ADD);

  pg.blendMode(p.BLEND);
  pg.clear();
  // this.tRito.drawTo(pg);
  this.tBox.drawTo(pg);
  pg.translate(0, this.height/2);
  pg.fill(255, 0, 0);
  pg.rect(0, 0, this.width, this.height/2);
  pg.tint(100)
  this.tP5a.drawTo(pg);
  pg.tint(255)
  // this.tAnimation2.drawTo(pg);
  // pg.image(this.postProcess0.pg, 0, 0);
}

S037Tex.prototype.constructor = S037Tex;

////////

function S037(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.4;
  this.uRoughness = 0.1;
  this.uSpecular = 0.5;
  this.uExposure = 2.0;
  this.uVignette = 0.9;
  this.uUseTexture = 1;
  this.tex = new S037Tex(p, w, h);
  this.texture = this.tex.pg;

  this.shape = p.createShape();
  this.shape.beginShape(p.QUADS);
  let d = 120;
  this.shape.noStroke();
  this.shape.texture(this.texture);
  this.shape.textureMode(p.NORMAL)
  Polygons.Cube(this.shape, -d, -d, -d, d, d, d, 0, 0, 1, 1);
  this.shape.endShape(p.CLOSE);
  // this.shape = p.createShape(p.GROUP);
  // let n = 64;
  // let r = 150;
  // for(let i = -n; i < n; i++) {
  //   let s = p.createShape();
  //   s.beginShape(this.p.TRIANGLE_STRIP);
  //   s.texture(this.texture);
  //   s.textureMode(p.NORMAL);
  //   s.noStroke();
  //   s.fill(255);
  //   for(let j = -n; j <= n; j++) {
  //     for(let ii = 1; ii >= 0; ii--) {
  //       let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
  //       let phi = p.map(j, -n, n, 0, Math.PI);
  //       let x0 = r * Math.sin(phi) * Math.cos(theta);
  //       let z0 = r * Math.sin(phi) * Math.sin(theta);
  //       let y0 = r * Math.cos(phi);
  //       s.normal(x0, y0, z0);
  //       s.vertex(x0, y0, z0, (theta / Math.PI) * 0.5 + 0.5, phi / Math.PI);
  //     }
  //   }
  //   s.endShape(this.p.CLOSE);
  //   this.shape.addChild(s);
  // }
}

S037.prototype = Object.create(SRendererShadow.prototype);

S037.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();
  pg.pushMatrix();

  pg.pushMatrix();
  pg.fill(255);
  pg.shape(this.shape);
  pg.popMatrix();

  pg.popMatrix();
}
S037.prototype.draw = function(t) {
  let p = this.p;
  this.tex.draw({t: t});
  angle = Math.PI/2;
  this.cameraPosition = p.createVector(300.0 * Math.cos(angle), -0.0, 300.0 * Math.sin(angle));
  angle = t * 0.1;
  this.lightPos = p.createVector(300.0 * Math.cos(angle), -100.0, 300.0 * Math.sin(angle));
  this.cameraTarget = p.createVector(50.0*(p.noise(angle*2.0)-0.5), 50.0*(p.noise(angle*1.7)-0.5), 0.0);

  // this.lightPos.set(-400, -200, 400);
  this.lightDirection = this.lightPos;
  Object.getPrototypeOf(S037.prototype).draw.call(this);
}

S037.prototype.constructor = S037;

var s = function (p) {
  let s037 = new S037(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    s037.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s037.draw(t);
    p.image(s037.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p037 = new p5(s);
