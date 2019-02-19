// var colorScheme = new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1");
var colorScheme = new ColorScheme("4d9de0-e15554-e1bc29-3bb273-7768ae");

function S044(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
}

S044.prototype = Object.create(TLayer.prototype);

S044.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
  // let tPhase = t - this.tBase;
}

S044.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  function tReturn(tMult, tOffset) {
    if(tOffset == undefined) tOffset = 0;
    let tt = (t * tMult - tOffset) % 2;
    if(tt > 1) tt = 2 - tt;
    return tt;
  }

  function drawBar(i, offset, broken) {
    pg.noStroke();
    pg.fill(70);
    let L = 90;
    pg.rect(-L/2, -L/2, L, L);
    let rate = EasingFunctions.easeInOutQuint(tReturn(0.5, offset));
    if(broken) {
      rate += -Math.sin(t * 40.0) * 0.1;
    }
    let l = L;// * rate;
    let c0 = i % 2 + 2;
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 150*rate);
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
  function drawCircle(i, offset, broken) {
    let r0 = 60;//45;
    let r1 = 0//35;
    pg.noStroke();
    pg.fill(100);
    pg.ellipse(0, 0, r0, r0);
    //drawRing(r0, r1, 1);
    let c0 = i % 2;
    let rate = EasingFunctions.easeInOutQuint(tReturn(0.5, offset));
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 250*rate);
    if(broken) {
      rate += -Math.sin(t * 40.0) * 0.1;
    }
    // drawRing(r0, r1, rate);
    pg.ellipse(0, 0, r0, r0);
  }

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.pushMatrix();
  let y = EasingFunctions.easeInOutCubic(t%1) * 100;
  pg.translate(0, y);

  // pg.translate(150, 0);
  for(let i = -5; i <= 5; i++) {
    for(let j = -5; j <= 5; j++) {
      pg.pushMatrix();
      pg.translate(j * 100, i * 100);
      let noise = p.osnoise.eval(j*0.1, (-i + Math.floor(t))*0.1);
      drawBar((-i + 4 + Math.floor(t)) % 4 + 1, -noise, false);
      drawCircle((-i + 5 + Math.floor(t)) % 4 + 1, noise, false);
      pg.popMatrix();
    }
  }
pg.popMatrix();
}

S044.prototype.constructor = S044;

////////

var s = function (p) {
  let s044 = new S044(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s044.draw({t: t});
    p.background(0);
    p.image(s044.pg, 0, 0);
  }
};

var p044 = new p5(s);
