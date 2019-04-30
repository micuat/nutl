var colorSchemes = [
  new ColorScheme("ccdbdc-9ad1d4-007ea7-61c9a8-003249"),
  new ColorScheme("c33149-a8c256-f3d9b1-c29979-a22522"),
  new ColorScheme("390099-9e0064-ff0054-ff5400-ffbd00"),
]

var windowWidth = 1920;
var windowHeight = 1080;

var soundOn = false//||true;

var numRandomNotes = 30;
var maxRandomNote = 8;

function Word (args) {
  this.sequence = [];
  this.name = args.name;
  this.position = args.position;
  this.curFrame = 0;
  this.subFrame = 0;
  this.maxSequence = 30;
  this.addFrame = function (frame) {
    if(this.sequence.length < this.maxSequence)
      this.sequence.push(frame);
  }
  this.reset = function () {
    this.sequence = [];
    this.curFrame = 0;
  }
  this.draw = function (pg) {
    pg.push();
    pg.translate(this.position.x, this.position.y);
    pg.fill(0);
    pg.text(this.name, 150, 50);
    if(this.sequence.length < this.maxSequence) {
      pg.noFill();
      pg.rect(40, 40, 100, 40);
      pg.fill(100);
      pg.rect(40, 40, 100 * (this.sequence.length / this.maxSequence), 40);
    }
    else {
      pg.stroke(0);
      let frame = this.sequence[this.curFrame];
      let s = 20;
      let r = 6;
      for(let i in frame) {
        for(let j in frame[i]) {
          let z = frame[i][j];
          pg.line(z.x * s, z.y * s, z.x * s + z.u * r, z.y * s + z.v * r);
        }
      }
    }
    pg.pop();
    this.subFrame++;
    if(this.subFrame >= 4) {
      this.subFrame = 0;
      this.curFrame = (this.curFrame + 1) % (this.maxSequence);
    }
  }
}

var recordedWords = new Array(6);
for(let i = 0; i < recordedWords.length; i++) {
  recordedWords[i] = new Word({name: i + "th", position: {x: (i % 3) * 600, y: Math.floor(i / 3) * 600}});
}

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
      stopgo: [0,1,0,1,0,0,1,1], mult: 2.0, doMutate: true, duration: 1.0, offset: 0.0},
    rhythm1: {
      notes : [0,3,0,4,1,2,3,4],
      stopgo: [1,0,1,0,1,1,0,0],
      randomStopgo: 0.75, mult: 2.0, doMutate: true, duration: 1.0, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function SX001(p, w, h) {
  TLayer.call(this, p, w, h);
}

SX001.prototype = Object.create(TLayer.prototype);
SX001.prototype.constructor = SX001;

SX001.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

SX001.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;
  let ef = EasingFunctions;

  pg.clear();
  // setColor(pg, "background", 2);
  pg.background(255);

  if(objs.rhythm0.isCycled()) {
  }

  let tw0 = objs.rhythm0.get(t, true);

  pg.translate(this.width / 2, this.height / 2);

  let d = this.height / 9;
  setColor(pg, "stroke", 1);
  for(let i = -10; i <= 10; i++) {
    for(let j = -10; j <= 10; j++) {
      pg.line(i * d - 10, j * d, i * d + 10, j * d);
      pg.line(i * d, j * d - 10, i * d, j * d + 10);
    }
  }

  pg.translate(0,0,1);
  pg.noStroke();

  // pg.rectMode(p.CENTER);
  for(let i = 0; i <= 30; i++) {
    let index = i % 5;
    setColor(pg, "fill", index);
    // pg.rect((objs.rhythm0.lerpedRandomNote(t, ef.easeInOutCubic, i)-4) * d,
    //   (objs.rhythm1.lerpedRandomNote(t, ef.easeInOutCubic, i)-4)*d,
    //   d, d);
    let x = (objs.rhythm0.lerpedRandomNote(t, ef.easeInOutCubic, i)-4) * d;
    let y = (objs.rhythm1.lerpedRandomNote(t, ef.easeInOutCubic, i)-4) * d;
    if(index == 1) x += d/2;
    if(index == 2) y += d/2;
    if(index == 3) x += d/2, y+= d/2;
    if(index == 4) {
      pg.push();
      pg.translate(0,0,-1);
      // pg.rect(x, y, d, d);
      pg.pop();
      continue;
    }

    // pg.rect(x, y, d / 2, d / 2);
  }

  pg.translate(-this.width / 2, -this.height / 2);
  setColor(pg, "stroke", 4);

  for(let i in recordedWords)
  {
    recordedWords[i].draw(pg);
  }

}

////////

var s = function (p) {
  let sX001 = new SX001(p, windowWidth, windowHeight);

  p.setup = function () {
    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    sX001.draw({t: t});
  
    p.background(0);
    p.image(sX001.pg, 0, 0);
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

  let curWord = -1;
  p.flowfbEvent = function (m) {
    let frame = [];
    for(let i = 0; i < m.length / 4; i++) {
      let x = parseInt(m[i * 4 + 0]);
      let y = parseInt(m[i * 4 + 1]);
      let u = m[i * 4 + 2];
      let v = m[i * 4 + 3];
      if(frame[y] == undefined) frame[y] = [];
      frame[y][x] = {x: x, y: y, u: u, v: v};
    }
    if(curWord >= 0)
      recordedWords[curWord].addFrame(frame);
  }

  p.keyPressed = function () {
    if(p.key >= '0' && p.key < '6') {
      curWord = p.key - '0';
      recordedWords[curWord].reset();
    }
  }

  p.oscEvent = function (m) {
    if(m.addrPattern() == "/of/flow/fb") {
      // if(curFrame % 2 == 0) {
      //   let frame = recordedZones[curFrame];
      //   for(let i = 0; i < m.typetag().length / 4; i++) {
      //     let x = m.get(i * 4 + 0).intValue();
      //     let y = m.get(i * 4 + 1).intValue();
      //     let u = m.get(i * 4 + 2).floatValue();
      //     let v = m.get(i * 4 + 3).floatValue();
      //     if(frame[y] == undefined) frame[y] = [];
      //     frame[y][x] = {x: x, y: y, u: u, v: v};
      //   }
      // }
      // curFrame = (curFrame + 1) % recordedZones.length;
    }
  }
};

var pX001 = new p5(s);
