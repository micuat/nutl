var colorSchemes = [
  new ColorScheme("20bf55-01baef-0b4f6c-a682ff-715aff"),
  new ColorScheme("ff99c9-c1bddb-a2c7e5-58fcec-f3e9dc"),
  new ColorScheme("390099-9e0059-ff0054-ff5400-ffbd00"),
  new ColorScheme("1446a0-db3069-f5d547-ebebd3-3c3c3b")
]

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  let idx = 0;
  parent[func](colorSchemes[idx].get(index).r, colorSchemes[idx].get(index).g, colorSchemes[idx].get(index).b, alpha);
}

var numRandomNotes = 30;
var maxRandomNote = 8;
var soundOn = false;

function Tween (args) {
  this.notes = args.notes;
  this.mult = args.mult;
  this.doMutate = args.doMutate;
  this.duration = Math.min(args.duration / args.mult, 1);
  this.inited = false;
  this.note = 0;
  this.lastNote = 0;
  this.randomNotes = new Array(this.notes.length);
  for(let i = 0; i < this.randomNotes.length; i++) {
    this.randomNotes[i] = [];
    for(let j = 0; j < numRandomNotes; j++) {
      this.randomNotes[i][j] = Math.floor(Math.random() * maxRandomNote);
    }
  }
  this.index = this.lastIndex = 0;
  this.offset = args.offset == undefined ? 0 : args.offset;
  this.stopgo = args.stopgo;
  this.randomStopgo = args.randomStopgo == undefined ? 0 : args.randomStopgo;
  this.stopgos = new Array(this.notes.length);
  for(let i = 0; i < this.randomNotes.length; i++) {
    this.stopgos[i] = [];
    for(let j = 1; j < numRandomNotes; j++) {
      let sg = Math.random() < this.randomStopgo * 0.5 ? 1 : 0;
      if(sg)
        this.randomNotes[i][j] = this.randomNotes[i][j-1];
    }
  }
  this.lastRandomNote = new Array(numRandomNotes);
  for(let j = 0; j < numRandomNotes; j++) {
    this.lastRandomNote[j] = this.randomNotes[0][j];
  }
  this.refreshed = false;
  this.cycled = false;
}

{
Tween.prototype.init = function (args) {
  if(this.stopgo != undefined) {
    if(this.stopgo[args.index] == 0) {
      return;
    }
  }
  this.lastIndex = this.index;
  this.index = args.index;
  this.startTime = args.startTime;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.lastNote = this.note;
  for(let j = 0; j < numRandomNotes; j++) {
    this.lastRandomNote[j] = this.randomNotes[this.lastIndex][j];
  }
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.inited = true;
  this.refreshed = true;
  if(args.index == 0) {
    this.cycled = true;
    if(this.doMutate) {
      this.mutate();
    }  
  }
  else {
    this.cycled = false;
  }
}

Tween.prototype.isRefreshed = function () {
  let r = this.refreshed;
  this.refreshed = false;
  return r;
}

Tween.prototype.isCycled = function () {
  let r = this.cycled;
  this.cycled = false;
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
  // if(this.doMutate == false || Math.random() < 0.25) return;
  let j0 = Math.floor(Math.random() * (this.notes.length));
  let j1 = Math.floor(Math.random() * (this.notes.length));
  let tmp = this.notes[j0];
  this.notes[j0] = this.notes[j1];
  this.notes[j1] = tmp;

  tmp = this.randomNotes[j0];
  this.randomNotes[j0] = this.randomNotes[j1];
  this.randomNotes[j1] = tmp;
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
  return (1 - tween) * this.lastRandomNote[i] + (tween) * this.randomNotes[this.index][i];
}
}

objs = {};
{
  let timings = {
    rhythm0: {
      notes : [1,2,3,4,1,2,3,4],
      mult: 1.0, doMutate: true, duration: 1.0, offset: 0.0},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////
var colorScheme = colorSchemes[0]
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function SYair(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  p.noiseSeed(0);

  this.pos = {x: 0, y: 0};
  this.points = [];

  this.commands = [{x: 0, y: 0}, {x: 0, y: 200}];
  this.lastCommand = {x: 0, y: 0};
  this.command = {x: 0, y: 100};
  this.offset = {x: 0, y: -200};
}

SYair.prototype = Object.create(TLayer.prototype);

SYair.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(objs.rhythm0.isCycled()) {
    this.offset.y *= -1;
  }

  if(objs.rhythm0.isRefreshed()) {
    this.lastCommand.x = this.command.x;
    this.lastCommand.y = this.command.y;
    this.command.x = p.random(-100, 100);
    this.command.y = p.random(-100, 100);
  }

  let tw = objs.rhythm0.get(t, true);
  this.pos.x = p.lerp(this.lastCommand.x, this.command.x, tw) + this.offset.x;
  this.pos.y = p.lerp(this.lastCommand.y, this.command.y, tw) + this.offset.y;
  // if(this.pos.y > 400) {
  //   this.pos.y = -400;
  //   this.points = [];
  // }
  if(this.points.length > 1000) this.points.shift();
}

SYair.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  setColor(pg, "background", 0)

  pg.translate(this.width / 2, this.height / 2);
  setColor(pg, "stroke", 4)
  pg.strokeWeight(2);
  for(let i in this.points) {
    pg.point(this.points[i].x, this.points[i].y);
  }

  pg.translate(0,0,0.01);

  setColor(pg, "fill", 2)
  pg.noStroke();

  pg.rectMode(p.CENTER);
  pg.rect(-125, this.pos.y, 10, 50);
  pg.rect( 125, this.pos.y, 10, 50);
  pg.rect(0, this.pos.y, 250, 10);
  setColor(pg, "fill", 3)
  pg.ellipse(this.pos.x, this.pos.y, 10, 10);

  this.points.push({
    x: this.pos.x,
    y: this.pos.y
  })

}

SYair.prototype.constructor = SYair;

////////

var s = function (p) {
  let sYair = new SYair(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    sYair.draw({t: t});
    p.image(sYair.pg, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;

    if(Math.floor(t/4) - Math.floor(lastT/4) > 0) {
      print(t, p.frameRate())
    }

    for(let key in objs) {
      objs[key].update({p: p, t: t, lastT: lastT});
    }

    lastT = t;
  }
};

var pYair = new p5(s);
