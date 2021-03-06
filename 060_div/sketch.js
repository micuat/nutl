var colorSchemes = [
  new ColorScheme("ff99c9-c1bddb-a2c7e5-58fcec-f3e9dc"),
  new ColorScheme("390099-9e0060-ff0054-ff5400-ffbd00"),
  new ColorScheme("1446a0-db3069-f5d547-ebebd3-3c3c3b")
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
    rhythm0: {notes: [0,3,0,4], mult: 0.25, doMutate: true, duration: 3.5, offset: 0.0},
    rhythm1: {notes: [0,3,0,4], mult: 1.0, doMutate: true, duration: 0.8, offset: 0.0},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function S060(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.01;
  this.uRoughness = 0.5;
  this.uSpecular = 0.01;
  this.uExposure = 5.0;
  this.uVignette = 0.0;
  this.uLightRadius = 1600.0;
  this.setup();
  this.pg.perspective(30.0 / 180 * Math.PI, this.pg.width / this.pg.height, 10, 5000);
  this.shadowMap.ortho(-200, 200, -400, 400, -200, 1000); // Setup orthogonal view matrix for the directional light

  this.cameraPosition.set(0, 0, 800);
  // this.cameraTarget.set(0, 0, 0);
  this.lightPos.set(270, -270, 400);
  // this.lightDirection.set(50, 10, 400);
  // this.uLightRadius = this.lightPos.mag() * 1.3;
}

S060.prototype = Object.create(SRendererShadow.prototype);
S060.prototype.constructor = S060;

S060.prototype.drawScene = function (pg, isShadow) {
  let t = this.t;
  let p = this.p;

  pg.clear();
  pg.push();
  pg.fill(255);
  pg.box(1000, 1000, 100);
  pg.pop();
  let count = 0;
  for(let i = -0.5; i <= 1; i++)
  {
    for(let j = -0.5; j <= 1; j++)
    {
      pg.push();
      pg.translate(j * 160, i * 160, 0);
      let nume = 49 + Math.floor(objs.rhythm0.lerpedRandomNote(t, EasingFunctions.easeInOutCubic, 0+count) * 10);
      let deno = 30 + Math.floor(objs.rhythm1.lerpedRandomNote(t, EasingFunctions.easeInOutCubic, 1+count) * 10);
      pg.translate(nume / 2 - (49+40)/2, deno / 2 - (49+40)/2, 0);
      boxes(pg, nume, deno, 0);
      pg.pop();
      count++;
    }
  }
}

function boxes(pg, nume, deno, level) {
  let reso = Math.floor(nume / deno);
  let modu = nume % deno;
  pg.translate(-nume / 2, 0, 0);
  {
    let c0 = colorSchemes[2].get(level % 5);
    pg.fill(c0.r, c0.g, c0.b);
    let x = reso * deno;
    let y = deno;
    pg.translate(x / 2, 0, 0);
    if(reso > 0)
    pg.box(x-1, y-1, 200);
    pg.translate(x / 2, 0, 0);
  }
  {
    let x = modu;
    pg.translate(x / 2, 0, 0);
    pg.rotateZ(Math.PI / 2);
    if(level < 7 && modu > 0) {
      pg.translate(0, 0, 30);
      boxes(pg, deno, modu, level + 1);
    }
  }
}
////////

var s = function (p) {
  let s060 = new S060(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s060.t = t;
    s060.draw();
  
    p.background(0);
    p.image(s060.pg, 0, 0);
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

var p060 = new p5(s);
