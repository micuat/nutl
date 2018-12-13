function S012 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("edae49-d1495b-00798c-30638e-003d5b");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.1;
  this.aperture = 0.05;

  function Cube (shape, x0, y0, z0, x1, y1, z1, tx0, ty0, tx1, ty1) {
    // +Z "front" face
    shape.normal( 0,  0,  1);
    shape.vertex(x0, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z1, tx1, ty0);
    shape.vertex(x1, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z1, tx0, ty1);

    // -Z "back" face
    shape.normal( 0,  0, -1);
    shape.vertex(x1, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z0, tx1, ty0);
    shape.vertex(x0, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z0, tx0, ty1);

    // +Y "bottom" face
    shape.normal( 0,  1,  0);
    shape.vertex(x0, y1, z1, tx0, ty0);
    shape.vertex(x1, y1, z1, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);

    // -Y "top" face
    shape.normal( 0, -1,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y0, z1, tx1, ty1);
    shape.vertex(x0, y0, z1, tx0, ty1);

    // +X "right" face
    shape.normal( 1,  0,  0);
    shape.vertex(x1, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z1, tx0, ty1);

    // -X "left" face
    shape.normal(-1,  0,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z1, tx1, ty0);
    shape.vertex(x0, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);
  }
  this.shape = p.createShape();
  this.wire = p.createShape();
  
  // Cube(this.shape, -100, -100, -100, 100, 100, 100, 0, 0, 1, 1);
  for(let i = 0; i < 500; i++) {
    let v = p5.Vector.random3D();
    let radius = p.random(200, 400);
    v.mult(radius);
    let idx = Math.floor(p.map(radius, 200, 400, 0, 5));
    let w = Math.pow(2, idx + 2);
    let x = Math.floor(v.x / w) * w;
    let y = Math.floor(v.y / w) * w;
    let z = Math.floor(v.z / w) * w;
    this.shape.beginShape(this.p.QUADS);
    this.shape.noStroke();
    this.shape.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    this.shape.endShape();

    this.wire.beginShape(this.p.QUADS);
    this.wire.noFill();
    this.wire.stroke(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    Cube(this.wire, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    this.wire.endShape();
  }

  this.cubeprop = {
    x: {cur: 0, target: 0, start: 0, min: -4, max: 4},
    z: {cur: 0, target: 0, start: 0, min: -4, max: 4},
    rotX: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    rotY: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    rotZ: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    sx: {cur: 1, target: 1, start: 1, min: 1, max: 6},
    sy: {cur: 1, target: 1, start: 1, min: 1, max: 6}
  }
}

S012.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.clear();

      pg.pushMatrix();

      // pg.rotateY(args.t * 0.2);
      pg.shape(this.shape, 0, 0);

      pg.noStroke();
      let idx = 0;
      pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      pg.translate(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur);
      pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
      pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
      pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
      pg.box(40 * this.cubeprop.sx.cur, 40 * this.cubeprop.sy.cur, 40);

      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let v = this.cameraPosition.copy();
      v.sub(p.createVector(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur));
      let mid = v.mag() - 20;
      this.minDepth = mid - 300.0;
      this.maxDepth = mid + 300.0;

      Object.getPrototypeOf(S012.prototype).draw(this, {t: t});
    }
  }
});

S012.prototype.constructor = S012;

function S012Wire (p) {
  SRenderer.call(this, p, 800, 800);
}

S012Wire.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      let pg = this.pg;
      pg.beginDraw();
      pg.clear();
      pg.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);

      pg.shape(this.wire, 0, 0);

      // pg.fill(0xed, 0xae, 0x49, 100);
      pg.noFill();
      pg.stroke(255);
      pg.translate(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur);
      pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
      pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
      pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
      pg.box(40 * this.cubeprop.sx.cur, 40 * this.cubeprop.sy.cur, 40);
      pg.endDraw();
    }
  }
});

S012Wire.prototype.constructor = S012Wire;

function S012PBR (p) {
  SRendererShadow.call(this, p);
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.6;
  this.uRoughness = 0.2;
  this.uSpecular = 0.99;
  this.uExposure = 3.0;
}

S012PBR.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      // pg.textureMode(p.NORMAL);
      // pg.texture(this.texture);

      pg.shape(this.shape, 0, 0);

      pg.fill(0xed, 0xae, 0x49);
      pg.noStroke();
      pg.translate(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur);
      pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
      pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
      pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
      pg.box(40 * this.cubeprop.sx.cur, 40 * this.cubeprop.sy.cur, 40);
      pg.popMatrix();

      let W = 750;
      pg.fill(200);
      pg.pushMatrix();
      pg.translate(W, 0, 0);
      pg.box(W);
      pg.popMatrix();
      pg.pushMatrix();
      pg.translate(-W, 0, 0);
      pg.box(W);
      pg.popMatrix();
      pg.pushMatrix();
      pg.translate(0, 0, W);
      pg.box(W);
      pg.popMatrix();
      pg.pushMatrix();
      pg.translate(0, 0, -W);
      pg.box(W);
      pg.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      var lightAngle = Math.PI / -4;
      this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      this.lightDirection = p.createVector(0, 1, 1);
      Object.getPrototypeOf(S012PBR.prototype).draw(this);
    }
  }
});

S012PBR.prototype.constructor = S012PBR;

var s = function (p) {
  let s012 = new S012(p);
  let s012PBR = new S012PBR(p);
  let s012Wire = new S012Wire(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s012.setup();
    s012Wire.cubeprop = s012.cubeprop;
    s012Wire.wire = s012.wire;
    s012Wire.setup();
    s012PBR.cubeprop = s012.cubeprop;
    s012PBR.shape = s012.shape;
    s012PBR.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s012.cameraPosition = p.createVector(300.0 * Math.cos(angle), 0.0, 300.0 * Math.sin(angle));
    s012.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    if(p.frameCount % 30 == 0) {
      for(let key in s012.cubeprop) {
        s012.cubeprop[key].start = s012.cubeprop[key].target;
      }
      let key = p.random(Object.keys(s012.cubeprop));
      s012.cubeprop[key].target = Math.floor(p.random(s012.cubeprop[key].min, s012.cubeprop[key].max));
    }
    let ease = EasingFunctions.easeInOutQuad((p.frameCount % 30) / 30.0);
    for(let key in s012.cubeprop) {
      s012.cubeprop[key].cur = p.lerp(s012.cubeprop[key].start, s012.cubeprop[key].target, ease);
    }
    s012Wire.cameraPosition = s012.cameraPosition.copy();
    s012Wire.cameraTarget = s012.cameraTarget.copy();
    s012PBR.cameraPosition = s012.cameraPosition.copy();
    s012PBR.cameraTarget = s012.cameraTarget.copy();

    p.background(0);
    s012Wire.draw(t);

    let solid = s012;
    if((t * 0.25 * 0.25) % 1 < 0.5) {
      solid = s012PBR;
    }
    solid.draw(t);

    let fader = p.map(Math.cos(t * Math.PI * 0.25), -1, 1, 0, 1);
    fader = 255 * EasingFunctions.easeInOutCubic(fader);
    p.tint(255, fader);
    p.image(s012Wire.pg, 0, 0);
    p.tint(255, 255 - fader);
    p.image(solid.pg, 0, 0);
    // p.image(s012Wire.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p012 = new p5(s);
