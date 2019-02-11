function TRitoco01 (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.tBase = 0;
  this.angle = 0;
  this.pg.noSmooth();
  this.idx0 = 0;
  this.idx1 = 1;
  this.ratio = 0.5;
  this.angleDelta = 0.04;
}

TRitoco01.prototype = Object.create(TLayer.prototype);

TRitoco01.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t * 0.125;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    pg.clear();
    this.idx0 = Math.floor(p.random(5));
    this.idx1 = Math.floor(p.random(5));
    this.ratio = p.random(0.2, 2);
    this.angleDelta = p.random(0.01, 0.1);
  }
  this.lastT = t;
  let tPhase = t - this.tBase;
  // pg.clear();
  // pg.background(0);

  let y = Math.sin(t * 8 * Math.PI) * 200 + 200;
  pg.noStroke();
  pg.translate(pg.width/2, pg.height/2);
  pg.rotate(this.angle);
  // pg.fill(100);
  pg.fill(colorScheme.get(this.idx0).r, colorScheme.get(this.idx0).g, colorScheme.get(this.idx0).b, 255);
  pg.ellipse(y, 0, 50, y*this.ratio);
  // pg.fill(255);
  pg.fill(colorScheme.get(this.idx1).r, colorScheme.get(this.idx1).g, colorScheme.get(this.idx1).b, 255);
  pg.ellipse(y, 0, 20, y*this.ratio);
  this.angle += this.angleDelta;
}

TRitoco01.prototype.constructor = TRitoco01;
