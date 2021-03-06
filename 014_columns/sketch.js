function S014 (p) {
  SRendererShadow.call(this, p, 1500, 1050);
  this.colorScheme = new ColorScheme("006e90-f18f01-41bbd9-adcad6-99c24d");
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 3.0;

  this.shape = p.createShape();
  
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
    // Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    Polygons.Hexagon(this.shape, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, idx + 4));
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
    // Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
    Polygons.Hexagon(this.shape, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, 4 - idx + 3));
    this.shape.endShape(this.p.CLOSE);
  }

  this.cubeW = 4;

  this.cubeprop = {
    x: {cur: 0, target: 0, start: 0, min: -8, max: 8},
    z: {cur: 0, target: 0, start: 0, min: -8, max: 8},
    rotY: {cur: 0, target: 0, start: 0, min: -2, max: 2},
    sx: {cur: 1, target: 1, start: 1, min: 1, max: 3},
  }

  this.cubeprops = [];
  for(let i = 0; i < 10; i++) {
    let y = i * 2;
    this.cubeprops.push({
      x: {cur: 0, target: 0, start: 0, min: -40, max: 40, default: 0},
      y: {cur: y, target: y, start: y, min: y, max: y, default: y},
      z: {cur: 0, target: 0, start: 0, min: -40, max: 40, default: 0},
      rotY: {cur: 0, target: 0, start: 0, min: -2, max: 2, default: 0},
      sx: {cur: 1, target: 1, start: 1, min: 1, max: 3, default: 1},
    })
  }
}

S014.prototype = Object.create(SRendererShadow.prototype)

S014.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();
  pg.pushMatrix();
  // pg.textureMode(p.NORMAL);
  // pg.texture(this.texture);

  pg.shape(this.shape, 0, 0);

  for(let i in this.cubeprops) {
    let cubeprop = this.cubeprops[i];
    pg.pushMatrix();
    pg.fill(0xad, 0xca, 0xd6);
    pg.noStroke();
    pg.translate(this.cubeW * cubeprop.x.cur, -20 - this.cubeW * cubeprop.y.cur, 0);
    pg.rotateY(Math.PI / 3.0);
    pg.translate(this.cubeW * cubeprop.z.cur, 0, 0);
    pg.rotateY(-Math.PI / 3.0);

    pg.rotateY(Math.PI / 3.0 * cubeprop.rotY.cur);

    pg.beginShape(p.TRIANGLES);
    Polygons.Hexagon(pg, 0, 0, 0, this.cubeW * cubeprop.sx.cur, this.cubeW);
    pg.endShape();
    pg.popMatrix();
  }

  pg.popMatrix();

  pg.fill(150);
  pg.pushMatrix();
  pg.translate(0, 40 + 40, 0);
  pg.box(1000, 40, 1000);
  pg.popMatrix();
}

S014.prototype.draw = function (t) {
  let p = this.p;
  this.lightPos.set(100, -130, 100);
  // this.lightPos = this.cameraPosition;
  this.lightDirection = this.lightPos;//p.createVector(0, 1, 1);
  Object.getPrototypeOf(S014.prototype).draw.call(this);
}

S014.prototype.constructor = S014;

var s = function (p) {
  let s014 = new S014(p);

  p.setup = function () {
    p.createCanvas(1500, 1050);
    p.frameRate(30);

    s014.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s014.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s014.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    for(let i in s014.cubeprops) {
      let cubeprop = s014.cubeprops[i];
      if(p.frameCount % 30 == 0) {
        for(let key in cubeprop) {
          cubeprop[key].start = cubeprop[key].target;
        }
        let key = p.random(Object.keys(cubeprop));
        cubeprop[key].target = Math.floor(p.random(cubeprop[key].min, cubeprop[key].max));
      }

      if(p.frameCount % 150 == 0) {
        for(let key in cubeprop) {
          cubeprop[key].target = cubeprop[key].default;
        }
      }
      let ease = EasingFunctions.easeInOutQuad((p.frameCount % 30) / 30.0);
      for(let key in cubeprop) {
        cubeprop[key].cur = p.lerp(cubeprop[key].start, cubeprop[key].target, ease);
      }
    }

    p.background(0);
    s014.draw(t);
    p.image(s014.pg, 0, 0);
  }

  p.mousePressed = function () {
    p.saveFrame();
  }

  p.oscEvent = function(m) {
  }
};

var p014 = new p5(s);
