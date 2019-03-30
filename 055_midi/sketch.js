var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");

var soundOn = false//||true;

function Tween () {
}

Tween.prototype.init = function (args) {
  this.startTime = args.startTime;
  this.duration = args.duration;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.inited = true;
}

Tween.prototype.get = function (t) {
  if(this.inited == false) return 0;
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

function S055(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.timeStep = 1.0;
  this.objs = [];
  this.circles = [];
  for(let i = 0; i < 10; i++) {
    for(let j = 0; j < 10; j++) {
      this.circles.push({
        x: p.map(j, 0, 9, -w*0.4, w*0.4),
        y: p.map(i, 0, 9, -h*0.4, h*0.4),
        i: i,
        j: j,
        index: Math.floor(p.random(5))
      });
    }
  }

  for(let i = 0; i < 5; i++) {
    this.objs[i] = new Tween();
  }

}

S055.prototype = Object.create(TLayer.prototype);
S055.prototype.constructor = S055;

S055.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  let mel = [60, 62, 64, 0, 60, 62, 61, 0];
  if(Math.floor(t*4) - Math.floor(this.lastT*4) > 0) {
    this.tBase = t;
    let index = Math.floor(t*4) % mel.length;//Math.floor(p.random(3));
    if(p.random(1)>0.9) index = Math.floor(p.random(mel.length))
    // this.obj0 = new Tween({
    //   startTime: t, duration: 0.25,
    //   channel: 1, note: mel[index] + 12*1, velocity: 127,
    //   soundDelay: 0.125, p: p, delay: index==4?0.125:0});
  }

  if(Math.floor(t/4) - Math.floor(this.lastT/4) > 0) {
    // this.obj1 = new Tween({
    //   startTime: t, duration: 0.5,
    //   channel: 0, note: p.random([46, 48, 50]), velocity: 127,
    //   soundDelay: 0.25, p: p, delay: 0.25});

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
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 100);

  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.noStroke();

  // let bar = this.obj2 == undefined ? 0 : this.obj2.get(t);
  // pg.rect(-250, -300, 500 * (1-bar), 50);

  for(let i = 0; i < this.circles.length; i++) {
    let c = this.circles[i];
    let o = this.objs[c.index];
    for(let j = 0; j < 4; j++) {
      let tween;
      tween = o == undefined ? 0 : o.get(t + 0.02 * j);
      if(Math.floor(c.j * 0.5) != Math.floor(t*0.5) % 5) tween = 0;
      c0 = c.index;
      let note = o == undefined ? 0 : o.note;
      pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 51*(j+1));
      let x = c.x + (note > 0 ? note - 2 : 0) * 40 * EasingFunctions.easeInOutCubic(tween);
      let y = c.y + (note < 0 ? note + 2 : 0) * 40 * EasingFunctions.easeInOutCubic(tween);
      pg.ellipse(x, y, 40, 40);
    }
  }
  pg.pop();
}

////////

var s = function (p) {
  let s055 = new S055(p, 1080, 1080);

  p.setup = function () {
    p.createCanvas(1080, 1080);
    p.frameRate(60);
    p.updateDelayMillis = 5;
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

    if(Math.floor(t) - Math.floor(lastT) > 0) {
      print(t)
    }

    for(let i = 0; i < 5; i++) {
      if(Math.floor(t*(i+1) * 0.5) - Math.floor(lastT*(i+1) * 0.5) > 0) {
        // print(t)
        // p.midiBus.sendNoteOn(1, p.random([84,82]), 127);

        s055.objs[i].init({
          startTime: t, duration: 0.25,
          channel: 1, note: p.random([-3, -1, 1, 3]), velocity: 127,
          soundDelay: 0.125, p: p, delay: 0});
      }
    }

    lastT = t;
  }
};

var p055 = new p5(s);
