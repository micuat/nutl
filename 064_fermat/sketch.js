var colorSchemes = [
  new ColorScheme("e6c229-f17105-d11149-6610f2-1a8fe3"),
  new ColorScheme("c33149-a8c256-f3d9b1-c29979-a22522"),
  new ColorScheme("390099-9e0064-ff0054-ff5400-ffbd00"),
]

var soundOn = false//||true;

var numRandomNotes = 8;
var maxRandomNote = 8;

function Tween (args) {
  this.notes = args.notes;
  this.mult = args.mult;
  this.doMutate = args.doMutate;
  this.duration = args.duration;
  this.inited = false;
  this.note = 0;
  this.lastNote = 0;
  this.randomNotes = new Array(this.notes.length);
  for(let i = 0; i < this.randomNotes.length; i++) {
    this.randomNotes[i] = [];
    for(let j = 0; j < maxRandomNote; j++) {
      this.randomNotes[i][j] = Math.floor(Math.random() * maxRandomNote);
    }
  }
  this.index = this.lastIndex = 0;
  this.offset = args.offset == undefined ? 0 : args.offset;
}

Tween.prototype.init = function (args) {
  this.lastIndex = this.index;
  this.index = args.index;
  this.startTime = args.startTime;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.lastNote = this.note;
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.inited = true;
  this.refreshed = true;
}

Tween.prototype.isRefreshed = function () {
  let r = this.refreshed;
  this.refreshed = false;
  return r;
}

Tween.prototype.update = function (args) {
  let t = args.t - this.offset;
  let lastT = args.lastT - this.offset;
  let mult = this.mult;
  let index = Math.floor(t*mult) % this.notes.length;
  if(Math.floor(t * mult) - Math.floor(lastT * mult) > 0){
    this.init({
      startTime: t, index: index,
      channel: 1, note: parseInt(this.notes[index]), velocity: 127,
      soundDelay: 0.125, p: args.p, delay: 0});
  }
}

Tween.prototype.mutate = function () {
  if(this.doMutate == false || Math.random() < 0.25) return;
  // let j0 = Math.floor(Math.random() * this.notes.length);
  // let j1 = Math.floor(Math.random() * this.notes.length);
  // let tmp = this.notes[j0];
  // this.notes[j0] = this.notes[j1];
  // this.notes[j1] = tmp;

  // tmp = this.randomNotes[j0];
  // this.randomNotes[j0] = this.randomNotes[j1];
  // this.randomNotes[j1] = tmp;
}

Tween.prototype.get = function (t, noReturn) {
  if(this.inited == false) return 0;
  let tt = (t - this.offset) - this.startTime - this.delay;
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

Tween.prototype.lerpedNote = function (t, func) {
  let tween = this.get(t, true);
  if(func != undefined) {
    tween = func(tween);
  }
  return (1 - tween) * this.lastNote + (tween) * this.note;
}

Tween.prototype.lerpedRandomNote = function (t, func, i) {
  let tween = this.get(t, true);
  if(func != undefined) {
    tween = func(tween);
  }
  return (1 - tween) * this.randomNotes[this.lastIndex][i] + (tween) * this.randomNotes[this.index][i];
}

objs = {};
{
  let timings = {
    rhythm0: {notes: [1,2,3,4], mult: 1.0, doMutate: true, duration: 0.7, offset: 0.0},
    rhythm1: {notes: [0,3,0,4], mult: 1.0*4, doMutate: true, duration: 0.5, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function S064(p, w, h) {
  TLayer.call(this, p, w, h);
  this.nume = 17.0;
  this.deno = 55.0;
}

S064.prototype = Object.create(TLayer.prototype);
S064.prototype.constructor = S064;

S064.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S064.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();
  let c0 = 2;
  let cs = colorSchemes[1];
  pg.background(cs.get(c0).r, cs.get(c0).g, cs.get(c0).b);

  if(objs.rhythm0.isRefreshed() && objs.rhythm0.note == 1) {
    this.nume = Math.floor(p.random(20.0, 40.0));
    this.deno = Math.floor(p.random(this.nume, 60.0));
  }

  let tw0 = objs.rhythm0.get(t, true);

  pg.translate(this.width / 2, this.height / 2);
  pg.noStroke();
  let rp = 5;

  pg.fill(0, 100);
  for(let i = 0; i < 1000; i++) {
    c0 = 3;
    pg.fill(cs.get(c0).r, cs.get(c0).g, cs.get(c0).b);
    let angle = 2 * Math.PI * i * (this.nume-4) / this.deno;
    let r = Math.sqrt(i) * 12;
    let x = r * Math.cos(angle);
    let y = r * Math.sin(angle);
    pg.ellipse(x, y, rp, rp);
  }

  for(let i = 0; i < 1000; i++) {
    c0 = 0;
    pg.fill(cs.get(c0).r, cs.get(c0).g, cs.get(c0).b);
    let angle = 2 * Math.PI * i * (this.nume - objs.rhythm0.lerpedNote(t, EasingFunctions.easeInOutCubic)) / this.deno;
    let r = Math.sqrt(i) * 12;
    let x = r * Math.cos(angle);
    let y = r * Math.sin(angle);
    pg.ellipse(x, y, rp, rp);
  }
}

////////

var s = function (p) {
  let s064 = new S064(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s064.draw({t: t});
  
    p.background(0);
    p.image(s064.pg, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;

    if(Math.floor(t/4) - Math.floor(lastT/4) > 0) {
      print(t, p.frameRate())
    }

    if(Math.floor(t*0.5) - Math.floor(lastT*0.5) > 0) {
      for(let key in objs) {
        objs[key].mutate();
      }
    }
    for(let key in objs) {
      objs[key].update({p: p, t: t, lastT: lastT});
    }

    lastT = t;
  }
};

var p064 = new p5(s);
