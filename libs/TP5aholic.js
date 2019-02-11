function Particle(p, args) {
  this.x, this.y;
  this.strokeColor;
  this.hue;

  this.x = p.random(-200, p.width + 200);
  this.y = p.random(-200, p.height + 200);
  this.speed = 0.5;
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
    this.strokeColor = {h: this.hue, s: sat, b: 100, a: 3};
  }

  this.addVertex = function () {
    // args.pg.stroke(this.strokeColor);
    args.pg.stroke(this.strokeColor.h, this.strokeColor.s, this.strokeColor.b, this.strokeColor.a);
    // args.pg.stroke(55, 100, 50);
    args.pg.vertex(this.x, this.y);
  }
}

function TP5aholic1 (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.pg.smooth(5);
  this.lastT = 0;

  this.shape = p.createShape(p.GROUP);

  this.numParticles = 5000;
  this.mode = 2;
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
  if(false&&Math.floor(t) - Math.floor(this.lastT) > 0) {
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
