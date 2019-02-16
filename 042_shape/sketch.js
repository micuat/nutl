var colorScheme = new ColorScheme("4d9de0-e15554-e1bc29-3bb273-7768ae");

function S042(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.1;
  this.uRoughness = 0.4;
  this.uSpecular = 0.1;
  this.uExposure = 3.0;
  this.uVignette = 0.81;
  this.uLightRadius = 500.0;
  this.uUseTexture = 0;
  this.mode = 0;
}

S042.prototype = Object.create(SRendererShadow.prototype);

S042.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();

  pg.pushMatrix();
  let c0 = 0;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  for(let i = -6; i <= 6; i++) {
    for(let j = -6; j <= 6; j++) {
      pg.pushMatrix();
      pg.translate(i * 40.0, 0, j * 40.0);
      pg.scale(0.05, 1.0, 0.05);
      pg.translate(0, 100 * (Math.sin(i*0.5 + j*0.5 + this.t)*0.5 + 0.5), 0);
      pg.box(200);
      pg.popMatrix();
    }
  }

  c0 = 3;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  pg.pushMatrix();
  pg.scale(20, 1, 20);
  pg.translate(0, 100, 0);
  pg.box(100);
  pg.popMatrix();

  pg.popMatrix();

}
S042.prototype.draw = function(t) {
  this.t = t;
  let p = this.p;
  let angle = t * 0.1;
  let r = 300.0;
  this.cameraPosition = p.createVector(r * Math.cos(angle), -50.0, r * Math.sin(angle));
  angle = this.mode * Math.PI * 2.0 / 3.0 + 0.1;
  r = 150.0;
  this.lightPos = p.createVector(r * Math.cos(angle), -300.0, r * Math.sin(angle));
  // this.lightPos = p.createVector(50.0, -100.0, -100.0);
  this.cameraTarget = p.createVector(0.0, 50.0*p.osnoise.eval(t * 0.5, 0.1), 0.0);

  // this.lightPos.set(-400, -200, 400);
  this.lightDirection = this.lightPos;
  Object.getPrototypeOf(S042.prototype).draw.call(this);
}

S042.prototype.constructor = S042;

var s = function (p) {
  let s042 = new S042(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    s042.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }


    p.background(0);
    p.tint(255, 100);
    s042.mode = 0;
    s042.draw(t);
    p.image(s042.pg, 0, 0);

    p.tint(255, 100);
    s042.mode = 1;
    s042.draw(t);
    p.image(s042.pg, 0, 0);

    p.tint(255, 55);
    s042.mode = 2;
    s042.draw(t);
    p.image(s042.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p042 = new p5(s);
