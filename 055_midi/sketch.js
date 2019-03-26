function S055(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.timeStep = 2.0;
}

S055.prototype = Object.create(TLayer.prototype);
S055.prototype.constructor = S055;

S055.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    p.midiBus.sendNoteOn(1, 64, 127);
  }
  this.lastT = t;
}

S055.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  pg.clear();
  pg.background(128);

  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.pop();
}

////////

var s = function (p) {
  let s055 = new S055(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s055.draw({t: t});
    p.background(0);
    p.image(s055.pg, 0, 0);
  }
};

var p055 = new p5(s);
