// var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
var colorScheme = new ColorScheme("e0acd5-3993dd-f4ebe8-29e7cd-6a3e37");

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

    let sat = 100 - args.updateCount * 0.4;
    this.strokeColor = {h: this.hue, s: sat, b: 255, a: 10};
  }

  this.addVertex = function () {
    args.pg.stroke(this.strokeColor.h, this.strokeColor.s, this.strokeColor.b, this.strokeColor.a);
    args.pg.vertex(this.x, this.y);
  }
}

function TP5aNoise (p, w, h, args) {
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
  this.pg.background(0, 0, 5);
  this.pg.endDraw();

  // this.sh = p.loadShader(p.folderName + "/morph/frag.glsl", p.folderName + "/morph/vert.glsl");
}

TP5aNoise.prototype = Object.create(TLayer.prototype);

TP5aNoise.prototype.drawLayer = function (pg, key, args) {
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

  pg.blendMode(p.BLEND);

  pg.fill(0, 0, 5, 2);
  pg.rect(0, 0, this.width, this.height);


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

TP5aNoise.prototype.initPoints = function () {
  this.particles = [];
  for (let i = 0; i < this.numParticles; i++) {
    this.particles.push(new Particle(this.p, this.args));
  }
}

TP5aNoise.prototype.constructor = TP5aNoise;

////////

function S039Tex(p, w, h) {
  TLayer.call(this, p, w, h*2);
  this.pg.smooth(5);

  this.tP5a = new TP5aNoise(p, this.width, this.height/2, {});

  this.hydra0 = new Hydra();
  this.hydra1 = new Hydra();
  let ci0 = colorScheme.get(0);
  let ci3 = colorScheme.get(1);
  this.hydra0.voronoi(3).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
  this.tHydra = new THydra(p, this.width, this.height/2, this.hydra0);
  this.lastT = 0;
  this.tBase = 0;
}

S039Tex.prototype = Object.create(TLayer.prototype);

S039Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
  this.tP5a.draw({t: t});
  this.tHydra.draw({t: t});
}

S039Tex.prototype.drawLayer = function(pg, key, args) {
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

  pg.blendMode(p.BLEND);
  pg.clear();
  this.tHydra.drawTo(pg);
  pg.translate(0, this.height/2);
  pg.fill(255, 0, 0);
  pg.rect(0, 0, this.width, this.height/2);
  pg.tint(100);
  this.tP5a.drawTo(pg);
  pg.tint(255);
}

S039Tex.prototype.constructor = S039Tex;

////////

function S039(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.4;
  this.uRoughness = 0.1;
  this.uSpecular = 0.5;
  this.uExposure = 2.0;
  this.uVignette = 0.9;
  this.uUseTexture = 1;
  this.tex = new S039Tex(p, w, h);
  this.texture = this.tex.pg;

  this.shape = p.createShape();
  this.shape.beginShape(p.TRIANGLES);
  // this.shape.beginShape(p.QUADS);
  let d = 50;
  this.shape.noStroke();
  this.shape.texture(this.texture);
  this.shape.textureMode(p.NORMAL)
  // Polygons.Cube(this.shape, -d, -d, -d, d, d, d, 0, 0, 1, 1);
  Polygons.Hexagon(this.shape, d, 0, 0, d * 0.5, d*2);
  this.shape.endShape(p.CLOSE);
  // this.shape = p.createShape(p.GROUP);
  // let n = 64;
  // let r = 100;
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

S039.prototype = Object.create(SRendererShadow.prototype);

S039.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();
  pg.pushMatrix();

  pg.pushMatrix();
  pg.fill(255);
  pg.rotateY(this.t * 0.25);
  pg.rotateX(0.2);
  for(let i = -2; i <= 2; i++) {
    pg.pushMatrix();
    pg.translate(i * 50, 0.0);
    pg.rotateX(EasingFunctions.easeInOutQuint((this.t * 0.125 + i * 0.25 * Math.PI) % 1) * Math.PI * 2);
    pg.shape(this.shape);
    pg.popMatrix();
  }
  pg.popMatrix();

  pg.popMatrix();
}
S039.prototype.draw = function(t) {
  this.t = t;
  let p = this.p;
  this.tex.draw({t: t});
  angle = 0.0;
  this.cameraPosition = p.createVector(300.0 * Math.cos(angle), -0.0, 300.0 * Math.sin(angle));
  this.lightPos = p.createVector(300.0 * Math.cos(angle), -100.0, 300.0 * Math.sin(angle));
  angle = 0.1 * t;
  this.cameraTarget = p.createVector(90.0*(p.noise(angle*2.0)-0.5), 90.0*(p.noise(angle*1.7)-0.5), 0.0);

  // this.lightPos.set(-400, -200, 400);
  this.lightDirection = this.lightPos;
  Object.getPrototypeOf(S039.prototype).draw.call(this);
}

S039.prototype.constructor = S039;

var s = function (p) {
  let s039 = new S039(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    s039.setup();

    this.hydra0 = new Hydra();
    this.hydra1 = new Hydra();
    let ci0 = colorScheme.get(3);
    let ci3 = colorScheme.get(1);
    this.hydra0.osc(20).rotate(0.25*3.1415, 0).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
    .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
    this.tHydra = new THydra(p, this.width, this.height, this.hydra0);  
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    this.tHydra.draw({t: t});
    s039.draw(t);

    p.background(0);
    this.tHydra.drawTo(p.g);
    p.image(s039.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p039 = new p5(s);
