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
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

////////

function S069 (p) {
  SRendererShadow.call(this, p);
  this.colorScheme = colorSchemes[0];

  this.image = p.loadImage(p.folderName + "/map.png");
  this.matrix = [];
  this.current = null;
  this.calcDone = false;
  let self = this;

  let Thread = Java.type('java.lang.Thread');
  new Thread(function () {
    function getB(j, i) {
      return p.brightness(self.image.get(j/100*self.image.width, i/100*self.image.height)) / 255;
    }
    for(let i = 0; i < 50; i++) {
      self.matrix[i] = [];
      for(let j = 0; j < 50; j++) {
        self.matrix[i][j] = {
          b: getB(j, i),
          i: i,
          j: j
        };
      }
    }
    self.current = self.matrix[Math.floor(Math.random()*self.matrix.length)][Math.floor(Math.random()*self.matrix[0].length)];
    self.calcDone = true;
  }).start();
}

S069.prototype = Object.create(SRendererShadow.prototype);

S069.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  let t = this.t;
  pg.pushMatrix();

  if(isShadow == false) {
    pg.background(0);
  }
  let w = 7;
  let W = 6;
  let H = 2;
  pg.translate(0, -100 - 24.5*w, -24.5*w);

  for(let i = 0; i < this.matrix.length; i++) {
    for(let j = 0; j < this.matrix[i].length; j++) {
      let el = this.matrix[i][j];
      pg.push();
      pg.translate(0, (j) * w, (i) * w);
      // if(el == this.current)
      {
        let x = el.b*10*objs.rhythm0.lerpedNote(t, EasingFunctions.easeInOutQuad, 0);
        pg.translate(x, 0, 0);
      }
      setColor(pg, "fill", Math.floor(el.b * 4));
      pg.box(H*(el.b*10+1), W, W);
      pg.pop();
    }
  }
  pg.popMatrix();

  pg.pushMatrix();
  pg.fill(250, 250, 250);
  pg.translate(0, 100, 0);
  pg.box(6600, 5, 6600);
  pg.popMatrix();
}
S069.prototype.draw = function () {
  if(this.calcDone == false) return;
  let p = this.p;

  var camAngle = 0.002;
  var lightAngle = Math.PI / -4;
  this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
  this.lightDirection = p.createVector(0, 0, 1);
  this.cameraPosition.set(400 * Math.cos(camAngle), 100 * Math.sin(1 * 0.01) - 100, 400 * Math.sin(camAngle));
  this.cameraTarget.set(0, -100, 0);
  SRendererShadow.prototype.draw.call(this);
}

S069.prototype.constructor = S069;

var s = function (p) {
  let s069 = new S069(p);
  let postProcess0 = new PostProcess(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s069.setup();
    postProcess0.setup();
  }

  p.draw = function () {
    s069.t = p.millis() * 0.001;
    s069.draw();

    // postProcess0.draw("bloom", s069.pg, {delta: 0.002, num: 2});

    p.image(s069.pg, 0, 0);
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

var p069 = new p5(s);