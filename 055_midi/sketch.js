var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");

function S055(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.timeStep = 1.0;
}

S055.prototype = Object.create(TLayer.prototype);
S055.prototype.constructor = S055;

var soundOn = false//||true;

function Tween (args) {
  this.startTime = args.startTime;
  this.duration = args.duration;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.get = function (t) {
    let tt = t - this.startTime - this.delay;

    if(this.ringed == false && tt >= this.soundDelay) {
      if(soundOn)
        this.p.midiBus.sendNoteOn(this.channel, this.note, this.velocity);
      this.ringed = true;
    }

    if(tt > this.duration || tt < 0) return 0;
    tt = tt / this.duration;
    if(tt < 0.5) return tt * 2;
    else return 2 - tt * 2;
  }
}

S055.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  let mel = [60, 62, 64, 0, 60, 62, 61, 0];
  if(Math.floor(t*4) - Math.floor(this.lastT*4) > 0) {
    this.tBase = t;
    let index = Math.floor(t*4) % mel.length;//Math.floor(p.random(3));
    if(p.random(1)>0.9) index = Math.floor(p.random(mel.length))
    this.obj0 = new Tween({
      startTime: t, duration: 0.25,
      channel: 1, note: mel[index] + 12*1, velocity: 127,
      soundDelay: 0.125, p: p, delay: index==4?0.125:0});
  }

  if(Math.floor(t/4) - Math.floor(this.lastT/4) > 0) {
    this.obj1 = new Tween({
      startTime: t, duration: 0.5,
      channel: 0, note: p.random([46, 48, 50]), velocity: 127,
      soundDelay: 0.25, p: p, delay: 0.25});

    this.obj2 = new Tween({
      startTime: t, duration: 4,
      channel: 100, note: 0, velocity: 0,
      soundDelay: 0, p: p, delay: 0});
  }
  this.lastT = t;
}

S055.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  pg.clear();
  let c0 = 0;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.noStroke();

  let bar = this.obj2 == undefined ? 0 : this.obj2.get(t);
  pg.rect(-250, -300, 500 * (1-bar), 50);

  let tween;
  tween = this.obj0 == undefined ? 0 : this.obj0.get(t);
  c0 = 3;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.ellipse(0, 100 * EasingFunctions.easeInOutCubic(tween), 100, 100);

  tween = this.obj1 == undefined ? 0 : this.obj1.get(t);
  c0 = 4;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.ellipse(200, 100 * EasingFunctions.easeInOutCubic(tween), 100, 100);

  pg.pop();
}

////////

var s = function (p) {
  let s055 = new S055(p, 1080, 1080);

  p.setup = function () {
    p.createCanvas(1080, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    s055.draw({t: t});
    p.background(0);
    p.image(s055.pg, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;
    if(Math.floor(t*2) - Math.floor(lastT*2) > 0) {
      print(t)
      p.midiBus.sendNoteOn(1, p.random([84,82]), 127);
      // print(p.frameRate())
    }
    if(Math.floor(t*0.5 + 0.5) - Math.floor(lastT*0.5 + 0.5) > 0) {
      p.midiBus.sendNoteOn(0, 40, 127);
    }
    lastT = t;
  }
};

var p055 = new p5(s);
