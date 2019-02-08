// var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
var colorScheme = new ColorScheme("8fbfe0-7c77b9-1d8a99-0bc9cd-14fff7");

////////

function ShaderHelper (p) {
  this.p = p;
}

ShaderHelper.prototype.load = function (path, fragString) {
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
    else if (fragSourceRaw[i].match(/^#pragma insert fragColor$/)) {
      fragSource.push(fragString);
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

function Hydra() {
  this.queue = [];
  this.layerQueue = [];
}
Hydra.prototype.parse = function(default_args, input_args) {
  let post = "";
  for(let i = 0; i < default_args.length; i++) {
    if(input_args[i] == undefined) {
      post = post + ", " + default_args[i];
    }
    else if (input_args[i] instanceof Hydra) {
      post = post + ", " + input_args[i].generate();
    }
    else {
      post = post + ", " + input_args[i];
    }
  }
  return post;
}
Hydra.prototype.noise = function () {
  let post = this.parse([10.0, 0.1], arguments);
  this.queue.push({pre: "noise(", post: post + ")"});
  return this;
}
Hydra.prototype.voronoi = function () {
  let post = this.parse([10.0, 0.25, 0.01], arguments);
  this.queue.push({pre: "voronoi(", post: post + ")"});
  return this;
}
Hydra.prototype.rotate = function () {
  let post = this.parse([0.3], arguments);
  this.queue.push({pre: "rotate(", post: post + ")"});
  return this;
}
Hydra.prototype.modulate = function () {
  let post = this.parse([null, 0.5], arguments);
  this.queue.push({pre: "modulate(", post: post + ")"});
  return this;
}
Hydra.prototype.add = function () {
  let post = this.parse([null], arguments);
  this.layerQueue.push({pre: "add(", post: post + ")"});
  return this;
}
Hydra.prototype.color = function () {
  let post = this.parse([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], arguments);
  this.layerQueue.push({pre: "color(", post: post + ")"});
  return this;
}
Hydra.prototype.generate = function () {
  let str = "fragCoord.st";
  for(let i = this.queue.length - 1; i >= 0; i--) {
    let q = this.queue[i];
    str = q.pre + str + q.post;
  }
  this.queue = [];

  for(let i = 0; i < this.layerQueue.length; i++) {
    let q = this.layerQueue[i];
    str = q.pre + str + q.post;
  }
  this.layerQueue = [];
  return str;
}

function THydra (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.shaderHelper = new ShaderHelper(p);
  let str = "gl_FragColor = ";
  this.hydra0 = new Hydra();
  this.hydra1 = new Hydra();
  let ci0 = colorScheme.get(0);
  let ci3 = colorScheme.get(3);
  this.hydra0.noise(20).rotate(0.1).modulate(this.hydra1.noise(3.0).rotate(-0.1))
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 0.0);
  str += this.hydra0.generate() + ";";
  print(str)
  this.shader = this.shaderHelper.load(p.folderName + "/frag.glsl", str);

  this.idx0 = 0;
  this.idx1 = 1;
  this.lastT = 0;
}

THydra.prototype = Object.create(TLayer.prototype);

THydra.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;

  let t = args.t / 4;
  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    let str = "gl_FragColor = ";
    this.idx0 = Math.floor(p.random(5));
    this.idx1 = Math.floor(p.random(5));
    let ci0 = colorScheme.get(this.idx0);
    let ci3 = colorScheme.get(this.idx1);
    this.hydra0.voronoi(10).rotate(0.1).modulate(this.hydra1.noise(3.0).rotate(-0.1))
    .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 0.0);
    str += this.hydra0.generate() + ";";
    print(str)
    this.shader = this.shaderHelper.load(p.folderName + "/frag.glsl", str);
  }
  this.lastT = t;
  if (p.frameCount % 60 == 0) {
  }

  // p.background(0);
  this.shader.set("time", args.t);
  let idx = this.idx0;
  this.shader.set("color0", colorScheme.get(idx).r/255, colorScheme.get(idx).g/255, colorScheme.get(idx).b/255);
  idx = this.idx1;
  this.shader.set("color1", colorScheme.get(idx).r/255, colorScheme.get(idx).g/255, colorScheme.get(idx).b/255);
  pg.filter(this.shader);
}

THydra.prototype.constructor = THydra;

////////

function TRitoco01 (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.tBase = 0;
  this.angle = 0;
  this.pg.noSmooth();
  this.idx0 = 0;
  this.idx1 = 1;
  this.ratio = 0.5;
  this.angleDelta = 0.04;
}

TRitoco01.prototype = Object.create(TLayer.prototype);

TRitoco01.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t * 0.125;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    pg.clear();
    this.idx0 = Math.floor(p.random(5));
    this.idx1 = Math.floor(p.random(5));
    this.ratio = p.random(0.2, 2);
    this.angleDelta = p.random(0.01, 0.1);
  }
  this.lastT = t;
  let tPhase = t - this.tBase;
  // pg.clear();
  // pg.background(0);

  let y = Math.sin(t * 8 * Math.PI) * 200 + 200;
  pg.noStroke();
  pg.translate(pg.width/2, pg.height/2);
  pg.rotate(this.angle);
  // pg.fill(100);
  pg.fill(colorScheme.get(this.idx0).r, colorScheme.get(this.idx0).g, colorScheme.get(this.idx0).b, 255);
  pg.ellipse(y, 0, 50, y*this.ratio);
  // pg.fill(255);
  pg.fill(colorScheme.get(this.idx1).r, colorScheme.get(this.idx1).g, colorScheme.get(this.idx1).b, 255);
  pg.ellipse(y, 0, 20, y*this.ratio);
  this.angle += this.angleDelta;
}

TRitoco01.prototype.constructor = TRitoco01;

////////

function Particle(p, args) {
  this.x, this.y;
  this.strokeColor;
  this.hue;

  this.x = p.random(-200, p.width + 200);
  this.y = p.random(-200, p.height + 200);
  this.speed = 1.0;
  this.hue = args.palette[Math.floor(p.random(args.palette.length))];

  this.update = function () {
    let n = p.noise(this.x * args.noiseScale, this.y * args.noiseScale);

    n = Math.pow(n, 3);

    if (args.mode == 2) {
      m = 6.0;
      n = Math.ceil(n * m) / m;
    }
   
    let angle = args.startAngle + args.angleAmplitude * n;
    let vx = this.speed * Math.cos(angle);
    let vy = this.speed * Math.sin(angle);
    this.x += vx;
    this.y += vy;

    let sat = 100 - args.updateCount * 0.4; // 彩度を徐々に100から0に
    // this.strokeColor = p.color(this.hue, sat, 100, 80);
    this.strokeColor = {h: this.hue, s: sat, b: 100, a: 8};
  }

  this.addVertex = function () {
    // args.pg.stroke(this.strokeColor);
    // args.pg.stroke(this.strokeColor.h, this.strokeColor.s, this.strokeColor.b, this.strokeColor.a);
    args.pg.stroke(255, 255, 255);
    args.pg.vertex(this.x, this.y);
  }
}

function TP5aholic1 (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.pg.smooth();
  this.lastT = 0;

  this.shape = p.createShape(p.GROUP);

  this.numParticles = 10000;
  this.mode = 1;
  this.particles = [];
  this.updateCount = 0;

  let seed = Math.floor(p.random(10000));
  p.noiseSeed(seed);

  this.noiseScale = 0.01;
  this.angleAmplitude = p.random(3, 12);
  this.startAngle = p.random(p.TWO_PI);

  this.palette = [];
  for (let i = 0; i < 3; i++) {
    this.palette[i] = Math.floor(p.random(360));
  }
  this.args = {
    pg: this.pg,
    mode: this.mode,
    noiseScale: this.noiseScale,
    palette: this.palette,
    updateCount: this.updateCount,
    startAngle: this.startAngle,
    angleAmplitude: this.angleAmplitude}

  
  this.initPoints();

  this.pg.beginDraw();
  // this.pg.colorMode(p.HSB, 360, 100, 100, 100);
  this.pg.background(0, 0, 5);
  this.pg.endDraw();

  // this.sh = p.loadShader(p.folderName + "/morph/frag.glsl", p.folderName + "/morph/vert.glsl");
}

TP5aholic1.prototype = Object.create(TLayer.prototype);

TP5aholic1.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;

  let t = args.t / 4;
  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    pg.clear();
    pg.background(0);
    let seed = Math.floor(p.random(10000));
    p.noiseSeed(seed);
    this.initPoints();
    this.args.angleAmplitude = p.random(3, 12);
    this.args.startAngle = p.random(p.TWO_PI);
    this.args.mode = p.random([1, 2]);
  }
  this.lastT = t;

  // pg.background(255);
  pg.blendMode(p.BLEND);
  t = t - Math.floor(t);
  // pg.shader(this.sh);
  // if(t > 0.5) t = 1.0 - t;
  // this.sh.set("tween", t * 2 * 2);
  // pg.shape(this.shape);

  pg.strokeWeight(1);
  pg.beginShape(p.POINTS);
  for (let i in this.particles) {
    let particle = this.particles[i];
    particle.update();
    particle.addVertex();
  }
  pg.endShape();

  this.updateCount++;
  args.updateCount = this.updateCount;
}

TP5aholic1.prototype.initPoints = function () {
  this.particles = [];
  for (let i = 0; i < this.numParticles; i++) {
    this.particles.push(new Particle(this.p, this.args));
  }
}

TP5aholic1.prototype.constructor = TP5aholic1;

////////

function TP5aholic2 (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.tBase = 0;
  this.pg.noSmooth();

  this.minSize = 5;
  this.maxSize = w;
  this.numPalette = 3;
  this.palette = [];

  this.shape = p.createShape(p.GROUP);

  let pg = this.pg;
  this.changeColor();
  this.branch(pg.width / 2 - this.maxSize / 2, pg.height / 2, this.maxSize);
  this.branch(pg.width / 2 + this.maxSize / 2, pg.height / 2, this.maxSize);

  this.sh = p.loadShader(p.folderName + "/morph/frag.glsl", p.folderName + "/morph/vert.glsl");
}

TP5aholic2.prototype = Object.create(TLayer.prototype);

TP5aholic2.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.background(255);
  pg.blendMode(p.BLEND);
  pg.ortho();
  pg.translate(pg.width / 2, pg.height / 2);
  let t = args.t / 8;
  t = t - Math.floor(t);
  // pg.rotateY(EasingFunctions.easeInOutCubic(t) * Math.PI * 2)
  pg.translate(-pg.width / 2, -pg.height / 2);
  // pg.colorMode(p.HSB, 360, 100, 100, 100);
  // pg.rectMode(p.CENTER);
  // pg.background(this.getRandomPalette(), 5, 95);
  pg.shader(this.sh);
  if(t > 0.5) t = 1.0 - t;
  this.sh.set("tween", t * 2 * 2);
  pg.shape(this.shape);
}

TP5aholic2.prototype.changeColor = function () {
  for (let i = 0; i < this.numPalette; i++) {
    this.palette[i] = Math.floor(this.p.random(360));
  }
}

TP5aholic2.prototype.getRandomPalette = function () {
  return this.p.random(this.palette);
}

TP5aholic2.prototype.branch = function (cx, cy, size) {
  let p = this.p;
  this.pg.strokeWeight(1);
  this.pg.stroke(0, 0, 0, 5);
  if (p.random(1) < 0.9) {
    this.drawGradationRect(cx, cy, size);
  }
  else {
    this.drawRect(cx, cy, size);
  }

  size *= 0.5;
  if(size < this.minSize) {
    return;
  }

  let P = p.map(size, this.minSize, this.maxSize, 0.4, 1);

  if(p.random(1) < P) {
    this.branch(cx - size / 2, cy - size / 2, size);
  }
  if(p.random(1) < P) {
    this.branch(cx + size / 2, cy - size / 2, size);
  }
  if(p.random(1) < P) {
    this.branch(cx + size / 2, cy + size / 2, size);
  }
  if(p.random(1) < P) {
    this.branch(cx - size / 2, cy + size / 2, size);
  }
}

TP5aholic2.prototype.drawRect = function (cx, cy, size) {
  let p = this.p;
  let pg = this.pg;
  let s = p.createShape();
  //pg.pushMatrix();
  s.beginShape();
  s.colorMode(p.HSB, 360, 100, 100, 100);
  s.fill(this.getRandomPalette(), 100, 100,20);
  s.translate(cx, cy);

  s.strokeWeight(1);
  s.stroke(0, 0, 0, 5);
  let z = 0.0;//Math.abs(this.maxSize / size * 2);
  let w = 0;
  let h = size;
  if(p.random(1)>0.7) {
    w = 0; h = -size;
  }
  else if(p.random(1)>0.7) {
    w = size; h = 0;
  }
  else if(p.random(1)>0.7) {
    w = -size; h = 0;
  }
  let id = p.random(1);
  z = id;
  // s.attrib("id", id);
  s.attrib("tweened", cx-size/2+w, cy-size/2+h, z);
  s.vertex(-size/2, -size/2, z);
  // s.attrib("id", id);
  s.attrib("tweened", cx+size/2+w, cy-size/2+h, z);
  s.vertex(+size/2, -size/2, z);
  // s.attrib("id", id);
  s.attrib("tweened", cx+size/2+w, cy+size/2+h, z);
  s.vertex(+size/2, +size/2, z);
  // s.attrib("id", id);
  s.attrib("tweened", cx-size/2+w, cy+size/2+h, z);
  s.vertex(-size/2, +size/2, z);
  s.endShape(p.CLOSE);
  this.shape.addChild(s);
  //pg.popMatrix();
}

TP5aholic2.prototype.drawGradationRect = function (cx, cy, size) {
  let p = this.p;
  let pg = this.pg;
  let s = p.createShape();
  //pg.pushMatrix();
  s.beginShape();
  s.colorMode(p.HSB, 360, 100, 100, 100);
  s.translate(cx, cy);
  let r = Math.floor(p.random(4));
  //s.rotate(r * p.HALF_PI);

  let alpha = 20;
  s.strokeWeight(1);
  s.stroke(0, 0, 0, 5);
  let z = 0.0;//Math.abs(this.maxSize / size * 10);
  let w = 0;
  let h = size;
  if(p.random(1)>0.7) {
    w = 0; h = -size;
  }
  else if(p.random(1)>0.7) {
    w = size; h = 0;
  }
  else if(p.random(1)>0.7) {
    w = -size; h = 0;
  }
  s.fill(this.palette[0], 100, 100, alpha);
  let id = p.random(1);
  z = id;
  // s.attrib("id", id);
  s.attrib("tweened", cx-size/2+w, cy-size/2+h, z);
  s.vertex(-size/2, -size/2, z);
  // s.attrib("id", id);
  s.attrib("tweened", cx+size/2+w, cy-size/2+h, z);
  s.vertex(+size/2, -size/2, z);
  s.fill(this.palette[1], 100, 100, alpha);
  // s.attrib("id", id);
  s.attrib("tweened", cx+size/2+w, cy+size/2+h, z);
  s.vertex(+size/2, +size/2, z);
  // s.attrib("id", id);
  s.attrib("tweened", cx-size/2+w, cy+size/2+h, z);
  s.vertex(-size/2, +size/2, z);
  s.endShape(p.CLOSE);
  this.shape.addChild(s);
  //pg.popMatrix();
}

TP5aholic2.prototype.constructor = TP5aholic2;

////////

function S037Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.tRito = new TRitoco01(p, this.width, this.height, {});
  this.tP5a = new TP5aholic1(p, this.width, this.height, {});

  this.tBox = new THydra(p, this.width, this.height, {});
  // this.tBox = new TBox(p, this.width, this.height, {
  //   x: p.random(this.width),
  //   y: p.random(this.height),
  //   size: this.width / 10,
  //   delay: 0.0,
  // });
  this.tAnimation = new TLedAnimation(p, this.width, this.height, {
    layer: this.tBox.pg,
    type: "strip",
    timeScale: 0.125,
    n: 8
  });
  this.postProcess0 = new PostProcess(p);
  this.postProcess0.setup();
  this.tAnimation2 = new TLedAnimation(p, this.width, this.height, {
    layer: this.tP5a.pg,
    type: "stretch",
    timeScale: 0.5,
    n: 32
  });
  this.lastT = 0;
  this.tBase = 0;
}

S037Tex.prototype = Object.create(TLayer.prototype);

S037Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tP5a.draw({t: t});
  this.tBox.draw({t: t});
  this.tRito.draw({t: t});
  this.tAnimation.draw({t: t, scratch: p.noise(t * 1) * 0.4});
  this.tAnimation2.draw({t: t, scratch: 0.0});
  this.postProcess0.draw("kaleid", this.tAnimation2.pg, {});
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
  // this.tP5a.drawTo(pg);
  // this.tAnimation2.drawTo(pg);
  pg.image(this.postProcess0.pg, 0, 0);
  pg.blendMode(p.MULTIPLY);
  this.tBox.drawTo(pg);
}

S037Tex.prototype.constructor = S037Tex;


var s = function (p) {
  let s037Tex = new S037Tex(p, 800, 800);
  let shape = p.createShape(p.GROUP);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    let n = 64;
    let r = 250;
    for(let i = -n; i < n; i++) {
      let s = p.createShape();
      s.beginShape(p.TRIANGLE_STRIP);
      s.texture(s037Tex.pg);
      s.textureMode(p.NORMAL);
      s.noStroke();
      s.fill(255);
      for(let j = -n; j <= n; j++) {
        for(let ii = 1; ii >= 0; ii--) {
          let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
          let phi = p.map(j, -n, n, 0, Math.PI);
          let x0 = r * Math.sin(phi) * Math.cos(theta);
          let z0 = r * Math.sin(phi) * Math.sin(theta);
          let y0 = r * Math.cos(phi);
          s.normal(x0, y0, z0);
          s.vertex(x0, y0, z0, (theta / Math.PI) * 0.5 + 0.5, phi / Math.PI);
        }
      }
      s.endShape(p.CLOSE);
      shape.addChild(s);
    }
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s037Tex.draw({t: t});
    p.image(s037Tex.pg, 0, 0);
    // p.image(s037Tex.tBox.pg, 0, 0);
    // p.translate(p.width/2, p.height/2);
    // p.pushMatrix();
    // p.fill(255);
    // p.rotateY(t*0.1);
    // p.shape(shape);
    // p.popMatrix();
  }

  p.oscEvent = function(m) {
  }
};

var p037 = new p5(s);
