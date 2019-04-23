var colorSchemes = [
  new ColorScheme("e6c229-f17105-d11149-6610f2-1a8fe3"),
  new ColorScheme("c33149-a8c256-f3d9b1-c29979-a22522"),
  new ColorScheme("390099-9e0062-ff0054-ff5400-ffbd00"),
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
    rhythm0: {notes: [0,3,0,4], mult: 1.0*2, doMutate: true, duration: 0.25/2, offset: 0.0},
    rhythm1: {notes: [0,3,0,4], mult: 1.0*2, doMutate: true, duration: 0.5, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function S062(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.01;
  this.uRoughness = 0.5;
  this.uSpecular = 0.01;
  this.uExposure = 5.0;
  this.uVignette = 0.0;
  this.uLightRadius = 1600.0;
  this.setup();
  this.pg.perspective(30.0 / 180 * Math.PI, this.pg.width / this.pg.height, 10, 5000);
  this.shadowMap.ortho(-400, 400, -400, 400, -400, 1000); // Setup orthogonal view matrix for the directional light
  // this.shadowMap.ortho(-200, 200, -400, 400, -200, 1000); // Setup orthogonal view matrix for the directional light

  this.cameraPosition.set(0, 0, 800);
  this.lightPos.set(270, -270, 400);

  this.boxWidth = 10;
  this.boxHeight = 10;
  this.count = 0;
  this.maxCount = 11;
}

S062.prototype = Object.create(SRendererShadow.prototype);
S062.prototype.constructor = S062;

S062.prototype.drawScene = function (pg, isShadow) {
  let t = this.t;
  let p = this.p;

  if(objs.rhythm0.isRefreshed()) {
    this.count++;
    if(this.count > this.maxCount) this.count = 0;
  }

  let tw0 = objs.rhythm0.get(t, true);
  let tw1 = EasingFunctions.easeInQuint(objs.rhythm1.get(t, true));

  pg.clear();
  pg.push();
  pg.fill(255);
  pg.box(1000, 1000, 100);
  pg.translate(0, 0, 10);

  let sizes = [this.boxHeight, this.boxHeight];
  pg.translate(0, this.boxHeight/2, 0);
  for(let i = 0; i <= this.count && i < this.maxCount; i++) {
    if(sizes[i] == undefined) {
      sizes[i] = sizes[i-1] + sizes[i-2];
    }
    let c0 = colorSchemes[0].get(i % 5);
    pg.fill(c0.r, c0.g, c0.b);
    let w = sizes[i];
    if(i == this.count)
    {
      w *= tw0;
    }
    pg.translate(w/2, w/2, 0);
    pg.push();
    if(this.count == this.maxCount) {
      pg.translate(tw1 * (250+sizes[i]), tw1 * 00, 0);
      pg.rotate(-tw1 * Math.PI * 0.5);
    }
    pg.box(w, w, 100+i*10);
    pg.pop();
    pg.translate(w/2, w/2, 0);
    pg.rotate(-Math.PI / 2);
  }
  pg.pop();
}

////////

var s = function (p) {
  let s062 = new S062(p, 800, 800);
  let lastPos = {x: 100, y: -100, z: 100};
  let targetPos = {x: 100, y: -100, z: 100};

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    // if(objs.camera.isRefreshed()) {
    //   lastPos.x = targetPos.x;
    //   lastPos.y = targetPos.y;
    //   lastPos.z = targetPos.z;
    //   targetPos.x = p.random(-350, 350);
    //   targetPos.y = p.random(-350, 350);
    //   targetPos.z = p.random(500, 800);
    // }

    // s062.t = t;
    // let tw = EasingFunctions.easeInOutQuad(objs.camera.get(t, true));
    // let x = p.lerp(lastPos.x, targetPos.x, tw);
    // let y = p.lerp(lastPos.y, targetPos.y, tw);
    // let z = p.lerp(lastPos.z, targetPos.z, tw);
    // s062.cameraPosition.set(x, y, z);

    // s062.cameraTarget.set(200.0*(p.noise(t*0.47)-0.5), -100 + 200.0*(p.noise(t*0.37)-0.5), 200.0*(p.noise(t*0.57)-0.5));
    // s062.lightPos.set(x, y, z);
    // s062.lightDirection = s062.lightPos;
    // s062.uLightRadius = s062.lightPos.mag() * 1.3;

    s062.t = t;
    s062.draw();
  
    p.background(0);
    p.image(s062.pg, 0, 0);
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

var p062 = new p5(s);
