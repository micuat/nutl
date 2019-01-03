function S013 (p) {
  SRendererShadow.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("ccd7c5-d1495b-efd2cb-c7a27c-ee9480");
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 3.0;

  this.shape = p.createShape();
  
  // Cube(this.shape, -100, -100, -100, 100, 100, 100, 0, 0, 1, 1);
  for(let i = 0; i < 500; i++) {
    let v = p5.Vector.random2D();
    let idx = Math.floor(p.random(0, 5));
    let radius = Math.pow(2, (idx + p.random(1)) + 5);
    v.mult(radius);
    let w = Math.pow(2, idx + 2);
    let x = Math.floor(v.x / w) * w;
    // let y = Math.floor(v.y / w) * w;
    let y = -w / 2 + 20 + 40;
    let z = (Math.floor(v.y / w) + (Math.floor(v.x / w) % 2 == 0 ? 0.5 : 0)) * w;
    this.shape.beginShape(this.p.TRIANGLES);
    // this.shape.beginShape(this.p.QUADS);
    this.shape.noStroke();
    this.shape.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    // Polygons.Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    Polygons.Hexagon(this.shape, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, 4 - idx + 3));
    this.shape.endShape(this.p.CLOSE);
  }

  for(let i = 0; i < 200; i++) {
    let v = p5.Vector.random2D();
    let idx = Math.floor(4);
    let radius = p.random(800);
    v.mult(radius);
    let w = Math.pow(2, idx + 2);
    let x = Math.floor(v.x / w) * w;
    // let y = Math.floor(v.y / w) * w;
    let y = -w / 2 + 20 + 40;
    let z = (Math.floor(v.y / w) + (Math.floor(v.x / w) % 2 == 0 ? 0.5 : 0)) * w;
    this.shape.beginShape(this.p.TRIANGLES);
    // this.shape.beginShape(this.p.QUADS);
    this.shape.noStroke();
    this.shape.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    // Polygons.Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    Polygons.Hexagon(this.shape, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, 4 - idx + 3));
    this.shape.endShape(this.p.CLOSE);
  }

  this.cubeW = 20;
  this.cubeprop = {
    x: {cur: 0, target: 0, start: 0, min: -8, max: 8},
    z: {cur: 0, target: 0, start: 0, min: -8, max: 8},
    // rotX: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    rotY: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    // rotZ: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    sx: {cur: 1, target: 1, start: 1, min: 1, max: 12},
    // sy: {cur: 1, target: 1, start: 1, min: 1, max: 6}
  }
}

S013.prototype = Object.create(SRendererShadow.prototype);

S013.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();
  pg.pushMatrix();
  // pg.textureMode(p.NORMAL);
  // pg.texture(this.texture);

  pg.shape(this.shape, 0, 0);


  // if(isShadow) {
  //   pg.fill(0xed, 0xae, 0x49);
  //   pg.noStroke();
  //   pg.translate(this.cubeW * this.cubeprop.x.cur, 0, this.cubeW * this.cubeprop.z.cur);
  //   // pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
  //   pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
  //   // pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
  //   pg.box(this.cubeW * this.cubeprop.sx.cur, this.cubeW * 1, this.cubeW);
  // }
  pg.popMatrix();

  pg.fill(150);
  pg.pushMatrix();
  pg.translate(0, 40 + 40, 0);
  pg.box(1000, 40, 1000);
  pg.popMatrix();
}

S013.prototype.draw = function (t) {
  let p = this.p;
  this.lightPos.set(100, -130, 100);
  // this.lightPos = this.cameraPosition;
  this.lightDirection = this.lightPos;//p.createVector(0, 1, 1);
  Object.getPrototypeOf(S013.prototype).draw.call(this);
}

S013.prototype.constructor = S013;

function S013Wire (p) {
  SRenderer.call(this, p, 800, 800);
}

S013Wire.prototype = Object.create(SRenderer.prototype);

S013Wire.prototype.draw = function (t) {
  let p = this.p;
  let pg = this.pg;
  pg.beginDraw();
  pg.clear();
  pg.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);

  pg.noFill();
  pg.stroke(255);
  pg.strokeWeight(2);
  pg.translate(this.cubeW * this.cubeprop.x.cur, 0, this.cubeW * this.cubeprop.z.cur);
  // pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
  pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
  // pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
  pg.box(this.cubeW * this.cubeprop.sx.cur, this.cubeW * 1, this.cubeW);
  pg.endDraw();
}

S013Wire.prototype.constructor = S013Wire;

var s = function (p) {
  let s013 = new S013(p);
  let s013Wire = new S013Wire(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s013.setup();
    s013Wire.cubeW = s013.cubeW;
    s013Wire.cubeprop = s013.cubeprop;
    s013Wire.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s013.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s013.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    if(p.frameCount % 30 == 0) {
      for(let key in s013.cubeprop) {
        s013.cubeprop[key].start = s013.cubeprop[key].target;
      }
      let key = p.random(Object.keys(s013.cubeprop));
      s013.cubeprop[key].target = Math.floor(p.random(s013.cubeprop[key].min, s013.cubeprop[key].max));
    }
    let ease = EasingFunctions.easeInOutQuad((p.frameCount % 30) / 30.0);
    for(let key in s013.cubeprop) {
      s013.cubeprop[key].cur = p.lerp(s013.cubeprop[key].start, s013.cubeprop[key].target, ease);
    }

    s013Wire.cameraPosition = s013.cameraPosition.copy();
    s013Wire.cameraTarget = s013.cameraTarget.copy();

    p.background(0);
    s013.draw(t);
    // s013Wire.draw(t);

    p.image(s013.pg, 0, 0);
    // p.image(s013Wire.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p013 = new p5(s);
