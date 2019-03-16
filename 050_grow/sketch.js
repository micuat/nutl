var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

var Blob = function (args) {
  this.destx = args.x;
  this.desty = args.y;
  this.done = false;
  if(args.origin == undefined) {
    this.x = 0;
    this.y = 0;
    this.orgx = 0;
    this.orgy = 0;
  }
  else {
    this.x = args.origin.x;
    this.y = args.origin.y;
    this.orgx = args.origin.x;
    this.orgy = args.origin.y;
  }
}

Blob.prototype.draw = function (args) {
  let t = args.tween;
  let pg = args.pg;
  let z = 0;
  if(this.done == false) {
    this.x = p050.lerp(this.orgx, this.destx, EasingFunctions.easeInOutQuart(t))
    this.y = p050.lerp(this.orgy, this.desty, EasingFunctions.easeInOutQuart(t))
    z = 50 * p050.lerp(0, 1, EasingFunctions.easeInOutCubic(1-Math.abs(t*2-1)))
  }
  else {
    this.y = this.desty;
    t = 1;
  }
  pg.push();
  pg.translate(this.x, this.y, 0);
  pg.fill(0, 150*t)
  pg.rect(5,5,90,90);
  pg.translate(0, 0, z);
  let c0 = 4;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.rect(0, 0, 90,90);
  pg.pop();
}

Blob.prototype.target = function (pg) {
  pg.translate(-this.x, -this.y);
}

function S050(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  this.lastBlob = new Blob({x: 0, y: 0});
  this.blobs = [this.lastBlob];
  this.lastT = 0;
  this.tBase = 0;

  this.availableDirections = [
    // p.createVector(-1,  0),
    p.createVector( 1,  0),
    p.createVector( 0, -1),
    p.createVector( 0,  1)
  ]
}

S050.prototype = Object.create(TLayer.prototype);

S050.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    this.lastBlob.done = true;
    let direction = p.random(this.availableDirections);
    this.lastBlob = new Blob({
      x: this.lastBlob.destx + direction.x * 100,
      y: this.lastBlob.desty + direction.y * 100,
      origin: this.lastBlob
    });
    this.blobs.push(this.lastBlob);
  }
  this.lastT = t;
}

S050.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  let c0 = 0;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  pg.translate(this.width / 2, this.height / 2);
  pg.rectMode(p.CENTER);
  pg.noStroke();

  tReturn = function () {
    return 1 - Math.abs(t % 2 - 1);
  }
  pg.scale(4, 4);
  this.lastBlob.target(pg);
  for(let i in this.blobs) {
    let bl = this.blobs[i];
    pg.pushMatrix();
    // pg.translate(0, EasingFunctions.easeInOutQuint(tReturn()) * 400)
    bl.draw({pg: pg, tween: t % 1});
    pg.popMatrix();
  }
}

S050.prototype.constructor = S050;

////////

var s = function (p) {
  let s050 = new S050(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s050.draw({t: t});
    p.image(s050.pg, 0, 0);
  }
};

var p050 = new p5(s);
