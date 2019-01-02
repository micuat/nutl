function TLayer (p, w, h) {
  this.p = p;
  this.width = w;
  this.height = h;
  if(this.numPatterns == undefined) {
    this.numPatterns = 1;
  }
  this.pgs = [];
  for(let i = 0; i < this.numPatterns; i++) {
    this.pgs.push(p.createGraphics(this.width, this.height, p.P3D));
  }
  this.pg = this.pgs[0];
}

TLayer.prototype.draw = function (args) {
  let p = this.p;
  for(let i in this.pgs) {
    this.pgs[i].beginDraw();
    this.drawLayer(this.pgs[i], i, args);
    this.pgs[i].endDraw();
  }
}

TLayer.prototype.drawTo = function (pg, i) {
  if(i == undefined) {
    pg.image(this.pg, 0, 0);
  }
  else {
    pg.image(this.pgs[i], 0, 0);
  }
}

////////

function TDot (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDot.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, i, args) {
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
    value: function (pg, i, args) {
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

function TBox (p, w, h, args) {
  this.numPatterns = 2;
  TLayer.call(this, p, w, h);

  this.tLast = 0.0;
  this.curRx = 0.0;
  this.curRy = 0.0;
  this.targetRx = 0.0;
  this.targetRy = 0.0;

  this.pg.smooth(5);
  this.shape = p.createShape();
  this.shape.disableStyle();
  this.shape.beginShape(p.QUADS);
  Polygons.Cube(this.shape, -150, -150, -150, 150, 150, 150, 0, 0, 1, 1);
  this.shape.endShape();

  this.x = args.x;
  this.y = args.y;
}

TBox.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, i, args) {
      let p = this.p;
      let t = args.t;
      // if(i == 0) {
        if(Math.floor(t) - Math.floor(this.tLast) > 0) {
          this.targetRx = p.random(0, Math.PI * 2);
          this.targetRy = p.random(0, Math.PI * 2);
        }
        this.tLast = t;
      
        this.curRx = p.lerp(this.curRx, this.targetRx, 0.05);
        this.curRy = p.lerp(this.curRy, this.targetRy, 0.05);
      // }
    
      pg.clear();
      pg.pushMatrix();
      pg.pushStyle();
      if(i == 0) {
        pg.lights();
      }
      pg.translate(this.x, this.y);
      pg.rotateX(this.curRx);
      pg.rotateY(this.curRy);
      if(i == 0) {
        pg.fill(255);
        pg.stroke(0);
        pg.strokeWeight(5);
      }
      else if(i == 1) {
        // mask
        pg.fill(255);
        pg.stroke(255);
        pg.strokeWeight(5);
      }
      pg.shape(this.shape);
      pg.popStyle();
      pg.popMatrix();
    }
  }
});

TBox.prototype.constructor = TBox;

////////

function TLayerBlend (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.blendMode = args.mode;
  this.bottomLayer = args.bottom;
  this.topLayer = args.top;
  this.maskLayer = args.mask;
}

TLayerBlend.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, i, args) {
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
  }
});

TLayerBlend.prototype.constructor = TLayerBlend;

////////

function S027Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tCenterLine = new TCenterLine(p, this.width, this.height);
  this.tCenterLine.draw();

  this.tBox = new TBox(p, this.width, this.height, {
    x: this.width / 2,
    y: this.height / 2
  });

  this.tDotOnBox = new TLayerBlend(p, this.width, this.height, {
    top: this.tDot.pg,
    bottom: this.tBox.pgs[0],
    mask: this.tBox.pgs[1],
    mode: p.MULTIPLY
  });
}

S027Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  this.tBox.draw({t: t});
  this.tDotOnBox.draw();

  pg.beginDraw();
  pg.background(0);
  this.tCenterLine.drawTo(pg);
  this.tDotOnBox.drawTo(pg);
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
