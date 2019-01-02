function S026Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.tLast = 0.0;
  this.curRx = 0.0;
  this.curRy = 0.0;
  this.targetRx = 0.0;
  this.targetRy = 0.0;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.objectPg = p.createGraphics(this.width, this.height, p.P3D);

  this.tonePgs = {};
  this.tonePgs.dots = p.createGraphics(this.width, this.height, p.P3D);
  this.tonePgs.dots.smooth(5);
  this.tonePgs.dots.beginDraw();
  this.tonePgs.dots.clear();
  this.tonePgs.dots.fill(0);
  this.tonePgs.dots.noStroke();
  for(let i = 0; i < 20; i++) {
    for(let j = 0; j < 20; j++) {
      let x = (j + 0.5) * 40;
      let y = (i + 0.5) * 40;
      let r = (20 - i) * 2.0;
      this.tonePgs.dots.ellipse(x, y, r, r);
    }
  }

  this.tonePgs.dots.endDraw();

  this.tonePgs.lines = p.createGraphics(this.width, this.height, p.P3D);
  this.tonePgs.lines.smooth(5);
  this.tonePgs.lines.beginDraw();
  this.tonePgs.lines.background(255);
  this.tonePgs.lines.stroke(0);
  this.tonePgs.lines.translate(this.tonePgs.lines.width / 2, this.tonePgs.lines.height / 2);
  for(let i = 0; i < 300; i++) {
    this.tonePgs.lines.strokeWeight(p.random(1, 3));
    let angle = p.random(0, Math.PI * 2);
    let r0 = p.random(150, 300);
    let r1 = p.random(400, 500);
    let x0 = r0 * Math.cos(angle);
    let y0 = r0 * Math.sin(angle);
    let x1 = r1 * Math.cos(angle);
    let y1 = r1 * Math.sin(angle);
    this.tonePgs.lines.line(x0, y0, x1, y1);
  }
  this.tonePgs.lines.endDraw();

  this.texturePg = p.createGraphics(this.width, this.height, p.P3D);
  this.texturePg.beginDraw();
  this.texturePg.background(255);
  this.texturePg.image(this.tonePgs.dots, 0, 0);
  this.texturePg.translate(this.tonePgs.dots.width / 2, this.tonePgs.dots.height / 2);
  this.texturePg.rotate(0.3);
  this.texturePg.translate(-this.tonePgs.dots.width / 2, -this.tonePgs.dots.height / 2);
  this.texturePg.image(this.tonePgs.dots, 0, 0);
  this.texturePg.endDraw();

  this.shape = p.createShape();
  // this.shape.disableStyle();
  this.shape.beginShape(p.QUADS);
  this.shape.texture(this.texturePg);
  this.shape.textureMode(p.NORMAL);
  this.shape.stroke(0);
  this.shape.strokeWeight(3);
  Polygons.Cube(this.shape, -150, -150, -150, 150, 150, 150, 0, 0, 1, 1);
  this.shape.endShape();
}

S026Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  if(Math.floor(t) - Math.floor(this.tLast) > 0) {
    this.targetRx = p.random(0, Math.PI * 2);
    this.targetRy = p.random(0, Math.PI * 2);
  }
  this.tLast = t;

  this.curRx = p.lerp(this.curRx, this.targetRx, 0.1);
  this.curRy = p.lerp(this.curRy, this.targetRy, 0.1);

  this.objectPg.beginDraw();
  this.objectPg.clear();
  this.objectPg.pushMatrix();
  this.objectPg.pushStyle();
  this.objectPg.translate(pg.width / 2, pg.height / 2);
  this.objectPg.rotateX(this.curRx);
  this.objectPg.rotateY(this.curRy);
  this.objectPg.shape(this.shape);
  this.objectPg.popStyle();
  this.objectPg.popMatrix();
  this.objectPg.endDraw();

  pg.beginDraw();
  pg.background(255);
  pg.image(this.tonePgs.lines, 0, 0);
  pg.image(this.objectPg, 0, 0);
  pg.pushMatrix();
  pg.pushStyle();
  pg.stroke(0);
  pg.strokeWeight(3);
  pg.fill(255);
  pg.translate(150, 400);
  pg.beginShape();
  {
    let angle = 0 / 100.0 * p.TWO_PI;
    let x = 50 * Math.cos(angle) * 1.5;
    let y = 150 * Math.sin(angle) * 1.5;
    pg.vertex(x, y);
  }
  for(let i = 2; i < 100 - 2; i++) {
    let angle = i / 100.0 * p.TWO_PI;
    let x = 50 * Math.cos(angle);
    let y = 150 * Math.sin(angle);
    pg.vertex(x, y);
  }
  pg.endShape(p.CLOSE);
  pg.popStyle();
  pg.popMatrix();

  pg.endDraw();
}

var s = function (p) {
  let s026Tex = new S026Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s026Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s026Tex.draw(t);
    p.image(s026Tex.pg, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p026 = new p5(s);
