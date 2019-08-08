var colorSchemes = [new ColorScheme("4effef-564787-c7b8ea-d8a7ca-dbcbd8")];
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}


var soundOn = false//||true;

var numRandomNotes = 8;
var maxRandomNote = 32;

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
    rhythm0: {notes: [1,2,3,4], mult: 2.0, doMutate: true, duration: 0.5, offset: 0.0},
    rhythm1: {notes: [0,3,0,4,0,0,0,0], mult: 2.5, doMutate: true, duration: 0.5, offset: 0.0},
    rhythm2: {notes: [0,3,0,4,0,0,0,0], mult: 2.5, doMutate: true, duration: 0.5, offset: 0.2},
    rhythmN: {notes: [0,0,0,1], mult: 1.0, doMutate: true, duration: 0.7, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function S068 (p) {
  SRendererShadow.call(this, p);
  this.colorScheme = colorSchemes[0];
}

S068.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      let t = this.t;
      pg.pushMatrix();

      pg.pushMatrix();
      pg.translate(0, 0, 0);

      if(isShadow == false) {
        pg.background(0);
      }

      let count = 0;
      let N = 7;
      for(let i = -N; i <= N; i++) {
        for(let k = -N; k <= N; k++) {
          pg.pushMatrix();
          let m = objs.rhythmN.lerpedRandomNote(t, EasingFunctions.easeInOutCubic, 0);
          pg.rotateY(m * Math.PI / 16);
          // pg.translate(k * 30, 0, i * 30);
          pg.translate(0, -100, 0);
          pg.rotateY(i / N * Math.PI);
          pg.rotateX(k / N * Math.PI);
          for(let j = 0; j <= 2; j++) {
            let idx = Math.floor(p.map(j, 0, 3, 0, 4));
            setColor(pg, "fill", idx);
            // pg.translate(i * 30, 0, j * 30);
            let angle = Math.PI * 0 + j*0.02 * objs.rhythm1.lerpedRandomNote(t, EasingFunctions.easeInOutQuad, count);
            pg.rotateX(angle);
            angle = Math.PI * 0 + j*0.02 * objs.rhythm2.lerpedRandomNote(t, EasingFunctions.easeInOutQuad, count);
            pg.rotateY(angle);
            let y = 2 + objs.rhythm0.lerpedRandomNote(t, EasingFunctions.easeInOutCubic, count);
            y *= 3.5;
            pg.translate(0, -y*0.5, 0);
            let x = 5;
            pg.box(x, y, x);
            pg.translate(0, -y*0.5);
            count = (count + 1) % maxRandomNote;
          }
          pg.popMatrix();
        }
      }
      pg.popMatrix();

      pg.fill(250, 250, 250);
      pg.translate(0, 100, 0);
      pg.box(6600, 5, 6600);
      pg.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      var camAngle = 0.002;
      var lightAngle = Math.PI / -4;
      this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      this.lightDirection = p.createVector(0, 0, 1);
      this.cameraPosition.set(400 * Math.cos(camAngle), 100 * Math.sin(1 * 0.01) - 100, 400 * Math.sin(camAngle));
      this.cameraTarget.set(0, -100, 0);
      SRendererShadow.prototype.draw.call(this);
    }
  }
});

S068.prototype.constructor = S068;

var s = function (p) {
  let s068 = new S068(p);
  let postProcess0 = new PostProcess(p);
  let postProcess1 = new PostProcess(p);
  let postProcess2 = new PostProcess(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s068.setup();
    postProcess0.setup();
    postProcess1.setup();
    postProcess2.setup();
  }

  p.draw = function () {
    s068.t = p.millis() * 0.001;
    s068.draw();

    // postProcess0.draw("bloom", s068.pg, {delta: 0.002, num: 2});
    // postProcess1.draw("rgbshift", postProcess0.pg, {
    //   delta: 300 * p.constrain(-Math.sin(p.millis() * 0.068) * 1 - 0.5, 0, 1)
    // });
    // postProcess2.draw("slide", postProcess1.pg, {
    //   delta: p.constrain(Math.sin(p.millis() * 0.068) * 0.1 - 0.08, 0, 1),
    //   time: p.millis() * 0.068
    // });

    p.image(s068.pg, 0, 0);
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

var p068 = new p5(s);