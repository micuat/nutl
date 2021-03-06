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
  pg.background(255);
  pg.fill(0);
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

function TDotSimple (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDotSimple.prototype = Object.create(TLayer.prototype);

TDotSimple.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.clear();
  pg.background(255);
  pg.fill(0);
  pg.noStroke();
  pg.translate(this.width / 2, this.height / 2);
  pg.rotate(-Math.PI / 4);
  for(let i = -40; i < 40; i++) {
    for(let j = -40; j < 40; j++) {
      let x = (j + 0.5) * 20;
      let y = (i + 0.5) * 20;
      let r = 7;
      pg.ellipse(x, y, r, r);
    }
  }
}

TDotSimple.prototype.constructor = TDotSimple;

////////

function TVoronoi (p, w, h) {
  this.patterns = ["default", "mask0", "mask1", "mask2", "p0", "p1", "p2"];
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.sites = [];
  let poly = new Packages.toxi.geom.Rect(0, 0, this.width, this.height);
  this.clip = new Packages.toxi.geom.ConvexPolygonClipper(poly.toPolygon2D());
}

TVoronoi.prototype = Object.create(TLayer.prototype);

TVoronoi.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  if(key == "default") {
    this.voronoi = new Packages.toxi.geom.mesh2d.Voronoi();
    for(let i in this.sites) {
      this.voronoi.addPoint(new Packages.toxi.geom.Vec2D(this.sites[i].x, this.sites[i].y));
    }
  }

  pg.clear();

  let indices = [];
  pg.fill(255);
  pg.strokeWeight(3);
  if(key == "mask0") {
    pg.background(0);
    indices = [0];//this.voronoi.getRegions();
    pg.stroke(255);
  }
  else if(key == "mask1") {
    pg.background(0);
    indices = [1];//this.voronoi.getRegions();
    pg.stroke(255);
  }
  else if(key == "mask2") {
    pg.background(0);
    indices = [2];//this.voronoi.getRegions();
    pg.stroke(255);
  }
  else if(key == "p0") {
    indices = [0];
    pg.stroke(0);
  }
  else if(key == "p1") {
    indices = [1];
    pg.stroke(0);
  }
  else if(key == "p2") {
    indices = [2];
    pg.stroke(0);
  }
  for(let ii in indices) {
    let i = indices[ii];
    let poly = this.clip.clipPolygon(this.voronoi.getRegions()[i]);
    let vc = poly.getCentroid();
    pg.beginShape();
    for(let j in poly.vertices) {
      let v = poly.vertices[j];
      let vd = vc.copy();
      vd.subSelf(v);
      vd.scaleSelf(0.05);
      vd.addSelf(v);
      pg.vertex(vd.x, vd.y);
    }
    pg.endShape(p.CLOSE);
  }
}

TVoronoi.prototype.constructor = TVoronoi;

////////

function TBackBoxes (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TBackBoxes.prototype = Object.create(TLayer.prototype);

TBackBoxes.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.background(255);
  pg.stroke(0);
  pg.strokeWeight(3);
  pg.fill(255);
  pg.translate(pg.width / 2, pg.height / 2);
  for(let i = 0; i < 200; i++) {
    let v = p5.Vector.random3D();
    v.mult(p.random(0, 400));
    let w = 20;
    v.x = Math.floor(v.x/w) * w;
    v.y = Math.floor(v.y/w) * w;
    v.z = Math.floor(v.z/w) * w;
    pg.pushMatrix();
    pg.translate(v.x, v.y, v.z);
    pg.box(w);
    pg.popMatrix();
  }
}

TBackBoxes.prototype.constructor = TBackBoxes;

////////

function TCenterLine (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TCenterLine.prototype = Object.create(TLayer.prototype);

TCenterLine.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.background(255);
  pg.stroke(0);
  pg.translate(pg.width / 2, pg.height / 2);
  for(let i = 0; i < 300; i++) {
    pg.strokeWeight(p.random(1, 3));
    let angle = p.random(0, Math.PI * 2);
    let r0 = p.random(150, 300);
    let r1 = p.random(400, 500);
    let x0 = r0 * Math.cos(angle);
    let y0 = r0 * Math.sin(angle);
    let x1 = r1 * Math.cos(angle);
    let y1 = r1 * Math.sin(angle);
    pg.line(x0, y0, x1, y1);
  }
}

TCenterLine.prototype.constructor = TCenterLine;

////////

function TStripe (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TStripe.prototype = Object.create(TLayer.prototype);

TStripe.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.background(255);
  pg.stroke(0);
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

function TBlurb (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
  this.x = args.x;
  this.y = args.y;
}

TBlurb.prototype = Object.create(TLayer.prototype);

TBlurb.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.pushMatrix();
  pg.pushStyle();
  pg.stroke(0);
  pg.strokeWeight(3);
  pg.fill(255);
  pg.translate(this.x, this.y);

  let pointAngle = 0 / 100.0 * p.TWO_PI;
  let pointX = 50 * Math.cos(pointAngle) * 1.5;
  let pointY = 150 * Math.sin(pointAngle) * 1.5;

  pg.translate(-pointX, -pointY);

  pg.beginShape();
  pg.vertex(pointX, pointY);

  for(let i = 2; i < 100 - 2; i++) {
    let angle = i / 100.0 * p.TWO_PI;
    let x = 50 * Math.cos(angle);
    let y = 150 * Math.sin(angle);
    pg.vertex(x, y);
  }
  pg.endShape(p.CLOSE);
  pg.popStyle();
  pg.popMatrix();
}

TBlurb.prototype.constructor = TBlurb;

////////

function TBox (p, w, h, args) {
  this.patterns = ["default", "mask"];
  TLayer.call(this, p, w, h);

  this.tLast = 0.0;
  this.curRx = 0.0;
  this.curRy = 0.0;
  this.targetRx = 0.0;
  this.targetRy = 0.0;

  this.x = args.x;
  this.y = args.y;
  this.size = args.size;

  this.pg.smooth(5);
  this.shape = p.createShape();
  this.shape.disableStyle();
  this.shape.beginShape(p.QUADS);
  let size = this.size;
  Polygons.Cube(this.shape, -size, -size, -size, size, size, size, 0, 0, 1, 1);
  this.shape.endShape();

  this.v = p5.Vector.random2D();
  this.v.mult(5);
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t;
  if(key == "default") {
    this.x = (this.x + this.v.x + this.width) % this.width;
    this.y = (this.y + this.v.y + this.height) % this.height;
    if(Math.floor(t) - Math.floor(this.tLast) > 0) {
      this.targetRx = p.random(0, Math.PI * 2);
      this.targetRy = p.random(0, Math.PI * 2);
    }
    this.tLast = t;
  
    this.curRx = p.lerp(this.curRx, this.targetRx, 0.05);
    this.curRy = p.lerp(this.curRy, this.targetRy, 0.05);
  }

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  if(key == "default") {
    pg.lights();
  }
  pg.translate(this.x, this.y);
  pg.rotateX(this.curRx);
  pg.rotateY(this.curRy);
  if(key == "default") {
    pg.fill(255);
    pg.stroke(0);
    pg.strokeWeight(5);
  }
  else if(key == "mask") {
    pg.fill(255);
    pg.stroke(255);
    pg.strokeWeight(5);
  }
  pg.shape(this.shape);
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

function S027Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tDotSimple = new TDotSimple(p, this.width, this.height);
  this.tDotSimple.draw();

  this.tVoronoi = new TVoronoi(p, this.width, this.height);

  this.tCenterLine = new TCenterLine(p, this.width, this.height);
  this.tCenterLine.draw();

  this.tBackBoxes = new TBackBoxes(p, this.width, this.height);
  this.tBackBoxes.draw();

  this.tStripe = new TStripe(p, this.width, this.height);
  this.tStripe.draw();

  this.tObjects = [];
  for(let i = 0; i < 3; i++) {
    let tBox = new TBox(p, this.width, this.height, {
      x: p.random(this.width),
      y: p.random(this.height),
      size: 75
    });
    let layeredBox = new TLayerBlend(p, this.width, this.height, {
      top: [this.tDot.pg, this.tStripe.pg][i % 2],
      bottom: tBox.pgs.default,
      mask: tBox.pgs.mask,
      mode: p.MULTIPLY
    });
    let layeredVoro = new TLayerBlend(p, this.width, this.height, {
      top: [this.tCenterLine.pg, this.tDotSimple.pg, this.tBackBoxes.pg][i % 3],
      bottom: this.tVoronoi.pgs["p" + i],
      mask: this.tVoronoi.pgs["mask" + i],
      mode: p.MULTIPLY
    });
        
    this.tObjects.push({
      tBox: tBox,
      layeredBox: layeredBox,
      layeredVoro: layeredVoro
    })
    this.tVoronoi.sites.push({x: tBox.x, y: tBox.y});
  }

  this.tBlurb = new TBlurb(p, this.width, this.height, {
    x: this.width / 2, y: this.height / 2
  });
  this.tBlurb.draw();
}

S027Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  for(let i in this.tObjects) {
    this.tObjects[i].tBox.draw({t: t});
    this.tObjects[i].layeredBox.draw({t: t});
    this.tVoronoi.sites[i] = {x: this.tObjects[i].tBox.x, y: this.tObjects[i].tBox.y};
  }
  this.tVoronoi.draw();
  for(let i in this.tObjects) {
    this.tObjects[i].layeredVoro.draw();
  }

  pg.beginDraw();
  pg.background(255);
  // this.tDotSimple.drawTo(pg);
  for(let i in this.tObjects) {
    this.tObjects[i].layeredVoro.drawTo(pg);
  }
  for(let i in this.tObjects) {
    this.tObjects[i].layeredBox.drawTo(pg);
  }
  let idx = this.tObjects.length - 1;
  pg.translate(this.tObjects[idx].tBox.x - 70, this.tObjects[idx].tBox.y);
  pg.translate(-this.width / 2, -this.height / 2);
  this.tBlurb.drawTo(pg);

  pg.endDraw();
}

var s = function (p) {
  let s027Tex = new S027Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s027Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s027Tex.draw(t);
    p.image(s027Tex.pg, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p027 = new p5(s);
