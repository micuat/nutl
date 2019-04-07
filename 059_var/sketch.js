var colorScheme = new ColorScheme("390099-9e0059-ff0054-ff5400-ffbd00");

var soundOn = false//||true;

function Tween () {
  this.inited = false;
  this.note = 0;
  this.lastNote = 0;
}

Tween.prototype.init = function (args) {
  this.startTime = args.startTime;
  this.duration = args.duration;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.lastNote = this.note;
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.inited = true;
}

Tween.prototype.get = function (t, noReturn) {
  if(this.inited == false) return 0;
  let tt = t - this.startTime - this.delay;
  if(tt == undefined) return 0;

  if(this.ringed == false && tt >= this.soundDelay) {
    if(soundOn)
      this.p.midiBus.sendNoteOn(this.channel, this.note, this.velocity);
    this.ringed = true;
  }

  if(noReturn == true) {
    return Math.min(Math.max(tt / this.duration, 0), 1);
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
  this.patterns = ["default", "lines"];
  TLayer.call(this, p, w, h);
  this.pgs.default.smooth(0);
  this.pgs.lines.smooth(0);

  this.params = {
    fill: {type: "fixed", min: 0, max: 5, value: 0},
    radius: {type: "fixed", min: 1, max: 5, value: 0},
    oindex: {type: "fixed", min: 0, max: 5, value: 0},
    angle: {type: "fixed", min: 0, max: 4, value: 0},
    numCircles: {type: "fixed", min: 2, max: 8, value: 0},
    angleImpulse: {type: "fixed", min: -1, max: 2, value: 0},
    noise: {type: "fixed", min: -8, max: 8, value: 0},
    noiseAmp: {type: "fixed", min: 50, max: 200, value: 0}
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
  let tw = EasingFunctions.easeInOutCubic(objs[this.params.oindex.value].get(t, true));

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);
  // pg.translate(this.params.noiseAmp.value*(p.noise(t*2.0, this.params.noise.value)-0.5),
  // this.params.noiseAmp.value*(p.noise(t*1.7, this.params.noise.value)-0.5));

  pg.push();
  let c0 = this.params.fill.value;
  if(key == "default") {
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
    pg.noStroke();
  }
  if(key == "lines") {
    pg.stroke(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
    pg.strokeWeight(3);
    pg.noFill();
  }
  let n = this.params.numCircles.value;
  let r = this.params.radius.value * 10 + 10;
  // pg.rotate(EasingFunctions.easeInOutCubic(tw) * this.params.angleImpulse.value * 0.5 * Math.PI
  //   + this.params.angle.value / n * 0.5 * Math.PI);
  for(let i = 0; i < n; i++) {
    pg.push();
    pg.rotate(i / n * 2 * Math.PI);
    let l = p.lerp(objs[this.params.oindex.value].lastNote, objs[this.params.oindex.value].note, tw) * this.width * 0.1;
    pg.translate(l, 0);
    pg.ellipse(0, 0, r, r);
    pg.pop();
  }
  pg.pop();
}

////////

function S059B(p, w, h) {
  TLayer.call(this, p, w, h);
  this.params = {
    fill: {type: "fixed", min: 0, max: 5, value: 0},
    center: {type: "fixed", min: -5, max: 6, value: 0},
    oindex: {type: "fixed", min: 0, max: 5, value: 0},
  };
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
  let tw = objs[this.params.oindex.value].get(t);

  pg.clear();
  pg.translate(this.width / 2, this.height / 2);

  pg.push();
  pg.noStroke();
  let c0 = this.params.fill.value;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  let w = 50;
  let h = 50 + 300 * tw;
  pg.rect(-w/2 + this.params.center.value * 50, -h/2, w, h);
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
  // let Ss = [S059B, S059B, S059B, S059B, S059B];
  // let Ss = [S059A, S059A, S059A, S059A, S059A];
  // let Ss = [S059A, S059B, S059C, S059D, S059E];
  for(let i = 0; i < 5; i++) {
    let SS = S059A;//p.random([S059A, S059B]);
    this.ss[i] = new SS(p, w, h);
    for(key in this.ss[i].params) {
      let param = this.ss[i].params[key];
      param.value = Math.floor(p.random(param.min, param.max));
    }
    this.ss[i].params.fill.value = i;
    this.ss[i].params.oindex.value = i;
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
  let c0 = 3;
  pg.background(colorScheme.get(c0).r+200, colorScheme.get(c0).g+200, colorScheme.get(c0).b+200);

  for(let i in this.ss) {
    if(Math.floor(t) % 5 == i) {
      pg.push();
      pg.image(this.ss[i].pgs.default, 0, 0);
      pg.translate(this.width / 2, this.height / 2);
      pg.rotate(Math.PI * 0.1);
      pg.translate(-this.width / 2, -this.height / 2);
      // pg.image(this.ss[i].pgs.default, 0, 0);
      pg.pop();
    }
    else
      pg.image(this.ss[i].pgs.default, 0, 0);
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
    for(let i in timings) {
      let index = Math.floor(t*4) % timings[i].length;
      if(Math.floor(t*4) - Math.floor(lastT*4) > 0){//} && timings[i][index] != "0") {
        objs[i].init({
          startTime: t, duration: 0.3,
          channel: 1, note: parseInt(timings[i][index]), velocity: 127,
          soundDelay: 0.125, p: p, delay: 0});
      }
    }

    lastT = t;
  }
};

var p059 = new p5(s);
