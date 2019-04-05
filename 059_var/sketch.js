var colorScheme = new ColorScheme("6699cc-fff275-ff8c42-ff3c38-a23e48");

var soundOn = false//||true;

function Tween () {
  this.inited = false;
  this.note = 0;
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
  if(tt == undefined) return 0;

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

objs = [];
for(let i = 0; i < 5; i++) {
  objs[i] = new Tween();
}

////////

function S059A(p, w, h) {
  TLayer.call(this, p, w, h);
  this.oindex = 0;
  this.params = {
    fill: 0
  };
}

S059A.prototype = Object.create(TLayer.prototype);
S059A.prototype.constructor = S059A;

S059A.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

S059A.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;
  let tw = objs[this.oindex].get(t);

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();
  pg.noStroke();
  let c0 = this.params.fill;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  let n = 8;
  for(let i = 0; i < n; i++) {
    pg.push();
    pg.rotate(i / n * 2 * Math.PI + t);
    pg.translate(tw * this.width * 0.3, 0);
    pg.ellipse(0, 0, 100, 100);
    pg.pop();
  }
  pg.pop();
}

////////

function S059B(p, w, h) {
  TLayer.call(this, p, w, h);
  this.oindex = 0;
}

S059B.prototype = Object.create(TLayer.prototype);
S059B.prototype.constructor = S059B;

S059B.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

S059B.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;
  let tw = objs[this.oindex].get(t);

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();
  pg.noStroke();
  let n = 8;
  for(let i = 0; i < n; i++) {
    pg.push();
    pg.rotate(i / n * 2 * Math.PI);
    pg.translate(tw * this.width * 0.3, 0);
    pg.ellipse(0, 0, 10, 10);
    pg.pop();
  }
  pg.pop();}

////////

function S059C(p, w, h) {
  TLayer.call(this, p, w, h);
  this.oindex = 0;
}

S059C.prototype = Object.create(TLayer.prototype);
S059C.prototype.constructor = S059C;

S059C.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

S059C.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.pop();
}

////////

function S059D(p, w, h) {
  TLayer.call(this, p, w, h);
  this.oindex = 0;
}

S059D.prototype = Object.create(TLayer.prototype);
S059D.prototype.constructor = S059D;

S059D.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

S059D.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.pop();
}

////////

function S059E(p, w, h) {
  TLayer.call(this, p, w, h);
  this.oindex = 0;
}

S059E.prototype = Object.create(TLayer.prototype);
S059E.prototype.constructor = S059E;

S059E.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

S059E.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();

  pg.pop();
}

////////


function S059(p, w, h) {
  TLayer.call(this, p, w, h);
  this.ss = [];
  let Ss = [S059A, S059B, S059C, S059D, S059E];
  for(let i in Ss) {
    this.ss[i] = new (Ss[i])(p, w, h);
    this.ss[i].oindex = i;
  }
}

S059.prototype = Object.create(TLayer.prototype);
S059.prototype.constructor = S059;

S059.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
  for(let i in this.ss) {
    this.ss[i].draw({t: t});
  }
}

S059.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();
  let c0 = 0;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  for(let i in this.ss) {
    pg.image(this.ss[i].pg, 0, 0);
  }
  pg.translate(this.width / 2, this.height / 2);

  pg.push();


  pg.pop();
}

////////

var s = function (p) {
  let s059 = new S059(p, 800, 800);

  let timings = [
    [0,3,0,4,0,0,1,2],
    [0,4,0,1,0,2,0,3],
    [0,0,0,4,0,0,4,4],
    [0,0,3,2,0,3,0,2],
    [0,0,0,0,0,0,0,3]
  ];

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s059.draw({t: t});
    p.image(s059.pg, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;

    if(Math.floor(t) - Math.floor(lastT) > 0) {
      print(t, p.frameRate())
    }

    if(Math.floor(t*0.5) - Math.floor(lastT*0.5) > 0) {
      for(let i = 0; i < 5; i++) {
        if(Math.random() < 0.25) continue;
        let j0 = Math.floor(p.random(timings[i].length));
        let j1 = Math.floor(p.random(timings[i].length));
        let tmp = timings[i][j0];
        timings[i][j0] = timings[i][j1];
        timings[i][j1] = tmp;
      }
    }
    for(let i = 0; i < 5; i++) {
      let index = Math.floor(t*4) % timings[i].length;
      if(Math.floor(t*4+i) - Math.floor(lastT*4+i) > 0 && timings[i][index] != "0") {
        objs[i].init({
          startTime: t, duration: 0.25,
          channel: 1, note: parseInt(timings[i][index]), velocity: 127,
          soundDelay: 0.125, p: p, delay: 0});
      }
    }

    lastT = t;
  }
};

var p059 = new p5(s);
