function S014 (p) {
  SRendererShadow.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("a30b37-bd6b73-bbb6df-c6c8ee-fcfcff");
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

S014.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      // pg.textureMode(p.NORMAL);
      // pg.texture(this.texture);

      pg.fill(0x41, 0xbb, 0xd9);
      for(let i = -20; i <= 20; i++) {
        pg.beginShape(p.TRIANGLE_STRIP);
        for(let j = -20; j <= 20; j++) {
          let x = j * 20;
          let y, z;
          y = 20 + 30 * p.noise((i+1) * 0.6, j * 0.6 + p.millis() * 0.002);
          z = (i + 1) * 20;
          pg.vertex(x, y, z);
          y = 20 + 30 * p.noise(i * 0.6, j * 0.6 + p.millis() * 0.002);
          z = i * 20;
          pg.vertex(x, y, z);
        }
        pg.endShape();
      }

      pg.shape(this.shape, 0, 0);
      pg.popMatrix();

      pg.fill(150);
      pg.pushMatrix();
      pg.translate(0, 40 + 40, 0);
      pg.box(1000, 40, 1000);
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(100, -130, 100);
      // this.lightPos = this.cameraPosition;
      this.lightDirection = this.lightPos;//p.createVector(0, 1, 1);
      Object.getPrototypeOf(S014.prototype).draw.call(this);
    }
  }
});

S014.prototype.constructor = S014;

var s = function (p) {
  let s014 = new S014(p);

  p.setup = function () {
    p.createCanvas(800, 800);
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
