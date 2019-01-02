function TLayer (p, w, h) {
  this.p = p;
  this.width = w;
  this.height = h;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
}

TLayer.prototype.draw = function(that, args) {
  if(that == undefined) that = this;
  let p = that.p;
  that.pg.beginDraw();
  that.drawLayer(that.pg, args);
  that.pg.endDraw();
}

TLayer.prototype.drawTo = function(pg) {
  pg.image(this.pg, 0, 0);
}

////////

function TDot (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDot.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, args) {
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
  }
});

TDot.prototype.constructor = TDot;

////////

function TCenterLine (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TCenterLine.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, args) {
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
  }
});

TCenterLine.prototype.constructor = TCenterLine;

////////

function S027Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.tLast = 0.0;
  this.curRx = 0.0;
  this.curRy = 0.0;
  this.targetRx = 0.0;
  this.targetRy = 0.0;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tCenterLine = new TCenterLine(p, this.width, this.height);
  this.tCenterLine.draw();

  this.objectPg = p.createGraphics(this.width, this.height, p.P3D);

  this.shape = p.createShape();
  this.shape.beginShape(p.QUADS);
  this.shape.fill(255);
  this.shape.noStroke();
  this.shape.stroke(0);
  this.shape.strokeWeight(3);
  Polygons.Cube(this.shape, -150, -150, -150, 150, 150, 150, 0, 0, 1, 1);
  this.shape.endShape();
}

S027Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  if(Math.floor(t) - Math.floor(this.tLast) > 0) {
    this.targetRx = p.random(0, Math.PI * 2);
    this.targetRy = p.random(0, Math.PI * 2);
  }
  this.tLast = t;

  this.curRx = p.lerp(this.curRx, this.targetRx, 0.1);
  this.curRy = p.lerp(this.curRy, this.targetRy, 0.1);

  this.tDot.draw();

  this.objectPg.beginDraw();
  this.objectPg.clear();
  this.objectPg.background(0);
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
  pg.background(0);
  this.tCenterLine.drawTo(pg);
  pg.blendMode(p.ADD);
  pg.image(this.objectPg, 0, 0);
  // pg.blendMode(p.MULTIPLY);
  // this.tDot.drawTo(pg);
  pg.blendMode(p.BLEND);
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
