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
    this.previous = args.origin;
    args.origin.next = this;
    args.origin.done = true;
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
  }
  else {
    this.y = this.desty;
    if(this.next != undefined && this.next.done == false)
      z = 0.1 * p050.lerp(0, 1, EasingFunctions.easeInOutCubic(1 - Math.abs(t*2 - 1)))
    t = 1;
  }
  pg.push();
  pg.translate(this.x, this.y, 0);
  pg.scale(1 + z, 1 + z);
  // pg.translate(0, 0, z);
  pg.fill(0, 150*t)
  let d = 10;
  pg.rect(d/8, d/8,90+d/2,90+d/2);
  // pg.rect(5,5,90,90);
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
  this.lastBlobs = [new Blob({x: 0, y: 0})];
  this.blobs = [this.lastBlobs[0]];
  this.lastT = 0;
  this.tBase = 0;
  this.scale = 4;
  this.scaleDest = 4;

  this.availableDirections = [
    p.createVector(-1,  0),
    p.createVector( 0,  1),
    p.createVector( 1,  0),
    p.createVector( 0, -1)
  ];
  this.currentDirectionCount = 0;
  this.currentDirectionIndex = 0;
  this.currentIteration = -1;
}

S050.prototype = Object.create(TLayer.prototype);

S050.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.currentDirectionCount++;
    let numSpawn = 1;
    if(this.currentDirectionCount % 5 == 0) {
      numSpawn = 2;
    }
    let direction = this.availableDirections[0];
    if(false) {
      if(this.currentDirectionCount > this.currentIteration / 2) {
        this.currentDirectionIndex++;
        if(this.currentDirectionIndex >= this.availableDirections.length) {
          this.currentDirectionIndex = 0;
        }
        this.currentDirectionCount = 0;
        this.currentIteration++;
      }
      else if(this.currentDirectionCount + 1 > this.currentIteration / 2) {
        if(this.currentDirectionIndex == 3) {
          numSpawn = 2;
        }
      }
      direction = this.availableDirections[this.currentDirectionIndex];
    }
    this.tBase = t;
    let origins = this.lastBlobs;
    this.lastBlobs = [];
    for(let i in origins) {
      for(let j = numSpawn - 1; j >= 0; j--) {
        let b = new Blob({
          // x: origins[i].destx + direction.x * 100 * (j + 1),
          // y: origins[i].desty + direction.y * 100 * (j + 1),
          x: origins[i].destx + direction.x * 100,
          y: origins[i].desty + direction.y * 100 + j * 100,
          origin: origins[i]
        });
        this.lastBlobs.push(b);
        this.blobs.push(b);
      }
    }

    this.scale = this.scaleDest;
    this.scaleDest = 1 / (Math.max(this.currentIteration, 2) + 10) * 80;
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
  // let scale = p.map(EasingFunctions.easeInOutCubic(t % 1), 0, 1, this.scale, this.scaleDest);
  let scale = 1;
  pg.scale(scale, scale);
  this.blobs[this.blobs.length - 1].target(pg);
  for(let i = this.blobs.length - 1; i >= 0; i--) {
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
