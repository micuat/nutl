var colorSchemes = [
  new ColorScheme("ff99c9-c1bddb-a2c7e5-58fcec-f3e9dc"),
  new ColorScheme("390099-9e0059-ff0054-ff5400-ffbd00"),
  new ColorScheme("1446a0-db3069-f5d547-ebebd3-3c3c3b")
]
// var colorSchemes = [
//   new ColorScheme("efd9ce-dec0f1-b79ced-957fef-7161ef"),
//   new ColorScheme("8d3b72-8a7090-89a7a7-72e1d1-b5d8cc"),
//   new ColorScheme("fffbfe-7a7d7d-d0cfcf-565254-ffffff")
// ]

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
    rhythm0: {notes: [0,3,0,4], mult: 2, doMutate: true, duration: 0.4, offset: 0.0},
    rhythm1: {notes: [0,4,0,1], mult: 2, doMutate: true, duration: 0.4, offset: 0.08},
    rhythm2: {notes: [0,0,0,4], mult: 2, doMutate: true, duration: 0.4, offset: 0.16},
    rhythm3: {notes: [0,0,3,2], mult: 2, doMutate: true, duration: 0.4, offset: 0.24},
    rhythm4: {notes: [0,0,0,3], mult: 2, doMutate: true, duration: 0.4, offset: 0.32},
    camera: {notes: [0,1], mult: 0.125, doMutate: false, duration: 0.4},
    // scene: {notes: [2,2], mult: 0.25, doMutate: false, duration: 1.0},
    scene: {notes: [0,1,2,3,4,2], mult: 0.25, doMutate: false, duration: 1.0},
    wireframe: {notes: [0,0,0,0], mult: 0.25, doMutate: false, duration: 0.4},
    // wireframe: {notes: [0,0,0,1], mult: 0.25, doMutate: false, duration: 0.4},
    colors: {notes: [0,1,2,1], mult: 2.0, doMutate: true, duration: 0.25},
    anim: {notes: [0,1,2], mult: 0.5, doMutate: false, duration: 0.4},
    post: {notes: [0,1], mult: 0.5, doMutate: false, duration: 1.5}
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}
////////

function TShape(p) {
  this.p = p;
  this.params = {
    fill: {type: "fixed", min: 0, max: 5, value: 0},
    oindex: {type: "fixed", min: 0, max: 5, value: 0}
  };
}

TShape.prototype.draw = function(pg, args) {
  if(this.drawShape != undefined) {
    let p = this.p;
    let t = args.t;
    this.obj = objs["rhythm" + this.params.oindex.value];
    this.getNote = this.obj.lerpedRandomNote.bind(this.obj, args.t, EasingFunctions.easeInOutCubic);
    let strtw = objs.wireframe.lerpedNote(t, EasingFunctions.easeInOutCubic);
    let c0 = colorSchemes[objs.colors.lastNote].get(this.params.fill.value);
    let c1 = colorSchemes[objs.colors.note].get(this.params.fill.value);
    if(strtw < 0.5) {
      pg.fill(p.lerp(c0.r, c1.r, objs.colors.get(t, true)), p.lerp(c0.g, c1.g, objs.colors.get(t, true)), p.lerp(c0.b, c1.b, objs.colors.get(t, true)));
      pg.noStroke();
    }
    else {
      pg.noFill();
      pg.strokeWeight(2);
      pg.stroke(p.lerp(c0.r, c1.r, objs.colors.get(t, true)), p.lerp(c0.g, c1.g, objs.colors.get(t, true)), p.lerp(c0.b, c1.b, objs.colors.get(t, true)), 255*strtw);
    }
    this.drawShape(pg, args, p, t);
  }
}

////////

function S059A(p, w, h) {
  TShape.call(this, p, w, h);

  this.params.radius = {type: "fixed", min: 10, max: 40, value: 0};
  this.params.angle = {type: "fixed", min: 0, max: 4, value: 0};
  this.params.numCircles = {type: "fixed", min: 2, max: 8, value: 0};
  this.params.doLines = {type: "fixed", min: 0, max: 2, value: 0};
  this.params.angleImpulse = {type: "fixed", min: -1, max: 2, value: 0};
  this.params.noise = {type: "fixed", min: -8, max: 8, value: 0};
  this.params.noiseAmp = {type: "fixed", min: 50, max: 200, value: 0};
}

S059A.prototype = Object.create(TShape.prototype);
S059A.prototype.constructor = S059A;

S059A.prototype.drawShape = function(pg, args, p, t) {
  pg.translate(0, -this.params.radius.value * this.getNote(0) * 0.25, 0);

  pg.push();

  // let n = (this.getNote(1) / 2 + 2);
  let n = this.params.numCircles.value;
  let r = this.params.radius.value;
  for(let i = 0; i < n; i++) {
    pg.push();
    pg.rotateY((i / n * 2) * Math.PI);
    let l = this.obj.lerpedNote(t, EasingFunctions.easeInOutCubic) * pg.width * 0.2;
    pg.translate(l/2, 0);
    pg.box(l, r/8, r/8);
    pg.translate(l/2, 0);
    pg.sphere(r);
    pg.pop();
  }
  pg.pop();

  pg.translate(0, -this.params.radius.value * this.getNote(0) * 0.25, 0);
}

////////

function S059B(p, w, h) {
  TShape.call(this, p, w, h);
  this.params.center = {type: "fixed", min: -5, max: 6, value: 0};
  this.params.rotate = {type: "fixed", min: 0, max: 5, value: 0};
}

S059B.prototype = Object.create(TShape.prototype);
S059B.prototype.constructor = S059B;

S059B.prototype.drawShape = function(pg, args, p, t) {
  // pg.rotateY((this.getNote(0)-4) * Math.PI * 0.25);

  let len = 400;
  let thick = 10;
  let l = 0.1 + this.obj.lerpedNote(t, EasingFunctions.easeInOutCubic);
  pg.push();
  pg.rotateY((l * 0.25) * Math.PI * 0.5);
  pg.box(thick, thick, len);
  pg.translate(0, 0, len/2 * 0.9);
  pg.rotateY(-(l * 0.25) * Math.PI * 0.5 * 2);
  pg.translate(0, -thick * 1.2, len/2 * 0.9);
  pg.box(thick, thick, len);
  pg.pop();

  pg.push();
  pg.translate(0, -thick * 1.2, 0);
  pg.rotateY((-l * 0.25) * Math.PI * 0.5);
  pg.box(thick, thick, len);
  pg.translate(0, 0, len/2 * 0.9);
  pg.rotateY((l * 0.25) * Math.PI * 0.5 * 2);
  pg.translate(0, thick * 1.2, len/2 * 0.9);
  pg.box(thick, thick, len);
  pg.pop();
  pg.translate(0, -50, 0);
}

////////

function S059C(p, w, h) {
  TShape.call(this, p);
  this.params.size = {type: "fixed", min: 50, max: 100, value: 0};
}

S059C.prototype = Object.create(TShape.prototype);
S059C.prototype.constructor = S059C;

S059C.prototype.drawShape = function(pg, args, p, t) {
  let size = this.params.size.value * (1 + this.getNote(1)) / 10;
  pg.translate(0, -this.params.size.value/2, 0);
  let N = this.getNote(3);
  let M = this.getNote(6);
  for(let i = 0; i < N; i++) {
    for(let j = 0; j < M; j++) {
      pg.push();
      let rot = this.obj.lerpedNote(t, EasingFunctions.easeInOutCubic) * Math.PI * 0.125;
      pg.translate((this.getNote(0)-4 + i*2-N/2)*5*(1+this.getNote(7)), 0, (this.getNote(2)-4 + j*2-M/2)*5*(1+this.getNote(7)));
      pg.rotateY(rot * (i+j));
      pg.box(size, size, size);
      pg.pop();
    }
  }
  pg.translate(0, -this.params.size.value/2, 0);
}

////////

function S059D(p, w, h) {
  TShape.call(this, p);
  this.params.size = {type: "fixed", min: 50, max: 100, value: 0};
}

S059D.prototype = Object.create(TShape.prototype);
S059D.prototype.constructor = S059D;

S059D.prototype.drawShape = function(pg, args, p, t) {
  let size = this.params.size.value * (1 + this.getNote(1)) / 10;
  pg.translate(0, -this.params.size.value/2, 0);

  pg.push();
  pg.translate((this.getNote(2) - 4) * 100, 0, (this.getNote(3) - 4) * 100);
  pg.box(size, size, size);
  pg.pop();

  pg.translate(0, -this.params.size.value/2, 0);
}

////////

function S059E(p, w, h) {
  TShape.call(this, p);
  this.params.size = {type: "fixed", min: 50, max: 100, value: 0};
}

S059E.prototype = Object.create(TShape.prototype);
S059E.prototype.constructor = S059E;

S059E.prototype.drawShape = function(pg, args, p, t) {
  let size = (1 + this.getNote(1)) * 10;
  // pg.translate(0, -this.params.size.value/2, 0);

  for(let i = -2; i <= 2; i++) {
    for(let j = -2; j <= 2; j++) {
      pg.push();
      pg.rotateY((this.getNote(2) + i * this.getNote(4) * 0.25) * 0.25 * Math.PI);
      pg.rotateZ((this.getNote(3) + j * this.getNote(4) * 0.25) * 0.25 * Math.PI);
      pg.translate(100 * (1 + this.params.oindex.value), 0, 0);
      // pg.translate((this.getNote(2) - 4) * 100, 0, (this.getNote(3) - 4) * 100);
      pg.box(80, 10, 10);
      pg.pop();
    }
  }

  // pg.translate(0, -this.params.size.value/2, 0);
}

////////

function S059(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.1;
  this.uRoughness = 0.8;
  this.uSpecular = 0.01;
  this.uExposure = 5.0;
  this.uVignette = 0.0;
  this.uLightRadius = 800.0;
  this.setup();
  this.pg.perspective(60.0 / 180 * Math.PI, this.pg.width / this.pg.height, 10, 5000);
  this.shadowMap.ortho(-400, 400, -400, 1000, -200, 2000); // Setup orthogonal view matrix for the directional light
  
  this.ss = [];
  for(let i = 0; i < 5; i++) {
    this.ss.push([]);
    for(let j = 0; j < 5; j++) {
      let SS = [S059A, S059B, S059C, S059D, S059E][i];
      this.ss[i][j] = new SS(p, w, h);
      for(key in this.ss[i][j].params) {
        let param = this.ss[i][j].params[key];
        param.value = Math.floor(p.random(param.min, param.max));
      }
      this.ss[i][j].params.fill.value = j;
      this.ss[i][j].params.oindex.value = j;
    }
  }
}

S059.prototype = Object.create(SRendererShadow.prototype);
S059.prototype.constructor = S059;

S059.prototype.drawScene = function (pg, isShadow) {
  let t = this.t;
  let p = this.p;

  let y = objs.scene.lerpedNote(t, EasingFunctions.easeInOutCubic);

  pg.clear();

  // this.defaultShader.set("uVignette", 0.5);

  for(let j = 0; j < 5; j++) {
    if(y < 0.5 + j) {
      pg.push();
      if(objs.scene.randomNotes[objs.scene.index][0] < 4) {
        pg.translate(y * 2000 - j * 2000, 0, 0);
      }
      else {
        pg.translate(0, y * 2000 - j * 2000, 0);
      }
      for(let i in this.ss[0]) {
        this.ss[j][i].draw(pg, {t: t});
      }
      pg.pop();
      break;
    }
  }
}

////////

var s = function (p) {
  let s059 = new S059(p, 800, 800);

  let lastPos = {x: 100, y: -100, z: 100};
  let targetPos = {x: 100, y: -100, z: 100};

  let postProcess0 = new PostProcess(p);
  postProcess0.setup();
  let postProcess1 = new PostProcess(p);
  postProcess1.setup();

  let accumPg = p.createGraphics(800, 800, p.P3D);
  let tAnimations = [
    new TLedAnimation(p, p.width, p.height, {
      layer: s059.pg,
      type: "stretch",
      timeScale: 0.45,
      n: 4
    }),
    new TLedAnimation(p, p.width, p.height, {
      layer: s059.pg,
      type: "strip",
      timeScale: 0.55,
      n: 4
    })
  ];
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
    // s059.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(objs.camera.isRefreshed()) {
      lastPos.x = targetPos.x;
      lastPos.y = targetPos.y;
      lastPos.z = targetPos.z;
      targetPos.x = p.random(-500, 500);
      targetPos.y = p.random(-700, -100);
      targetPos.z = p.random(-500, 500);
    }

    s059.t = t;
    let tw = EasingFunctions.easeInOutQuint(p.constrain(t/4 % 1, 0, 1));
    let x = p.lerp(lastPos.x, targetPos.x, tw);
    let y = p.lerp(lastPos.y, targetPos.y, tw);
    let z = p.lerp(lastPos.z, targetPos.z, tw);
    s059.cameraPosition.set(x, y, z);
    s059.cameraTarget.set(200.0*(p.noise(t*0.47)-0.5), -100 + 200.0*(p.noise(t*0.37)-0.5), 200.0*(p.noise(t*0.57)-0.5));
    s059.lightPos.set(x, y, z);
    s059.lightDirection = s059.lightPos;
    s059.uLightRadius = s059.lightPos.mag() * 1.3;
    s059.draw({t: t});
  
    if(objs.anim.note < 2)
      tAnimations[objs.anim.note].draw({t: t, scratch: 0.0});

    accumPg.beginDraw();
    if(objs.post.get(t, true) < 1) {
      //accumPg.clear();
      accumPg.push();
      accumPg.fill(0, 5);
      accumPg.noStroke();
      accumPg.rect(0, 0, accumPg.width, accumPg.height);
      accumPg.pop();
    }
    accumPg.push();
    // accumPg.tint(255, 120);
    if(objs.anim.note < 2)
      accumPg.image(tAnimations[objs.anim.note].pg, 0, 0);
    accumPg.pop();
    accumPg.endDraw();

    postProcess0.draw("rgbshift", accumPg, {
      delta: 2 * EasingFunctions.easeInOutQuint(1-objs.post.get(t))
    });
    postProcess1.draw("slide", postProcess0.pg, {
      delta: 0.002 * EasingFunctions.easeInOutQuint(1-objs.post.get(t)),
      time: t
    });

    accumPg.beginDraw();
    accumPg.image(postProcess1.pg, 0, 0);
    accumPg.endDraw();
  
    p.background(0);
    if(objs.anim.note < 2)
      p.image(accumPg, 0, 0);
    p.image(s059.pg, 0, 0);
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

var p059 = new p5(s);
