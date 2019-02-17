var colorScheme = new ColorScheme("4d9de0-e15554-e1bc29-3bb273-7768ae");

function S043(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
}

S043.prototype = Object.create(TLayer.prototype);

S043.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
  // let tPhase = t - this.tBase;
}

S043.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  function tReturn(tMult, tOffset) {
    if(tOffset == undefined) tOffset = 0;
    let tt = (t * tMult - tOffset) % 2;
    if(tt > 1) tt = 2 - tt;
    return tt;
  }

  function drawBar(i, offset) {
    pg.noStroke();
    pg.fill(70);
    let L = 90;
    pg.rect(-L/2, -L/2, L, L);
    let l = L * EasingFunctions.easeInOutQuint(tReturn(1, offset));
    let c0 = (i + 5) % 5;
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 150);
    pg.rect(-l/2, -l/2, l, l);
  }

  function drawRing(r0, r1, rate) {
    let n = 100;
    pg.beginShape(p.QUADS);
    for(let i = 0; i < n; i++) {
      let theta0, theta1, x, y;
      theta0 = i / n * Math.PI * 2.0 * rate;
      theta1 = (i+1) / n * Math.PI * 2.0 * rate;
      x = r0 * Math.sin(theta0);
      y = r0 * -Math.cos(theta0);
      pg.vertex(x, y);

      x = r0 * Math.sin(theta1);
      y = r0 * -Math.cos(theta1);
      pg.vertex(x, y);

      x = r1 * Math.sin(theta1);
      y = r1 * -Math.cos(theta1);
      pg.vertex(x, y);

      x = r1 * Math.sin(theta0);
      y = r1 * -Math.cos(theta0);
      pg.vertex(x, y);
    }
    pg.endShape();
  }
  function drawCircle(i, offset) {
    let r0 = 45;
    let r1 = 35;
    pg.noStroke();
    pg.fill(100);
    drawRing(r0, r1, 1);
    let c0 = (i + 5) % 5;
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
    let rate = EasingFunctions.easeInOutQuint(tReturn(1, offset));
    drawRing(r0, r1, rate);
  }

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.pushMatrix();
  // pg.translate(150, 0);
  for(let i = -4; i <= 4; i++) {
    for(let j = -4; j <= 4; j++) {
      pg.pushMatrix();
      pg.translate(j * 100, i * 100);
      drawBar(i, -p.osnoise.eval(j*0.1, i*0.1));
      drawCircle(i, p.osnoise.eval(j*0.1, i*0.1));
      pg.popMatrix();
    }
  }
pg.popMatrix();
}

S043.prototype.constructor = S043;

////////

var s = function (p) {
  let s043 = new S043(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s043.draw({t: t});
    p.background(0);
    p.image(s043.pg, 0, 0);
  }
};

var p043 = new p5(s);
