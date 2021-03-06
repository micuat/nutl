var windowWidth = 1280;
var windowHeight = 800;

// print(JSON.stringify(recordedWords[0].sequence))
// print(recordedWords[0].draw)
objs = {};
{
  let timings = {
    rhythm0: {
      notes : [1,2,3,4,1,2,3,4],
      stopgo: [0,1,0,1,0,0,1,1], mult: 2.0, doMutate: true, duration: 1.0, offset: 0.0},
    rhythm1: {
      notes : [0,3,0,4,1,2,3,4],
      // stopgo: [1,0,1,0,1,1,0,0],
      // randomStopgo: 0.75,
      mult: 2.0, doMutate: true, duration: 1.0, offset: 0.0},
    words: {
      notes : [0,1], mult: 0.5, doMutate: false, duration: 1.0, offset: 0.0},
    wordsIn: {
      notes : [0,1], mult: 0.5, doMutate: false, duration: 1.0, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

if(recordedWords == undefined)
{
  let rows = 3;
  let cols = 2;
  var recordedWords = new Array(rows * cols);
  for(let i = 0; i < recordedWords.length; i++) {
    recordedWords[i] = new Word({name: i + "th", position: {x: (i % rows) * 300, y: Math.floor(i / rows) * 200}});
  }
}

recordedWords[0].draw = function (pg) {
  pg.push();
  pg.fill(0);
  if(this.sequence.length >= this.maxSequence) {
    let tw = EasingFunctions.easeInOutQuint(objs.wordsIn.get(pX001.millis()*0.001, true));
    pg.stroke(0);
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.noStroke();
    for(let i in frame) {
      pg.push();
      let z = frame[i];
      let m = z.mag*100;
      pg.translate(z.x * s, z.y * s);
      pg.fill(z.r, z.g, z.b);
      pg.rect(0, 0, r, r);
      setColor(pg, "fill", Math.floor((objs.rhythm1.lerpedRandomNote(pX001.millis()*0.001, EasingFunctions.easeInOutCubic, 0)+m*0.01) % 5));
      pg.fill(z.r, z.g, z.b);
      pg.box(Math.abs(z.u) * r*0.5, Math.abs(z.v) * r*0.5, m*tw);
      pg.pop();
    }
  }
  pg.pop();
}
recordedWords[1].draw = function (pg) {
  pg.push();
  pg.fill(0);
  if(this.sequence.length >= this.maxSequence) {
    let tw = EasingFunctions.easeInOutQuint(objs.wordsIn.get(pX001.millis()*0.001, true));
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.beginShape(pX001.TRIANGLE_STRIP)
    setColor(pg, "fill", Math.floor(objs.rhythm1.lerpedRandomNote(pX001.millis()*0.001, EasingFunctions.easeInOutCubic, 0) % 5));
    let x = 0;
    for(let i in frame) {
      let z = frame[i];
      if(z.x < x) {
        pg.endShape();
        pg.beginShape(pX001.TRIANGLE_STRIP)
        setColor(pg, "fill", Math.floor((objs.rhythm1.lerpedRandomNote(pX001.millis()*0.001, EasingFunctions.easeInOutCubic, 0)+i/5) % 5));
      }
      x = z.x;
      let m = z.mag;
      pg.fill(z.r, z.g, z.b);
      pg.vertex(z.x * s + z.u * r, z.y * s + z.v * r, 100*m+30*tw);
      pg.vertex(z.x * s + z.u * r, z.y * s + z.v * r-30*tw, 100*m);
    }
    pg.endShape();
    for(let i in frame) {
      let z = frame[i];
      pg.push();
      pg.translate(z.x * s, z.y * s);
      pg.fill(z.r, z.g, z.b);
      pg.rect(0, 0, r, r);
      pg.pop();
    }
  }
  pg.pop();
}
recordedWords[2].draw = function (pg) {
  pg.push();
  pg.fill(0);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.noStroke();
    for(let i in frame) {
      pg.push();
      let z = frame[i];
      pg.translate(z.x * s, z.y * s);
      pg.fill(z.r, z.g, z.b);
      pg.translate(0, 0, z.mag * 100);
      pg.rect(0, 0, r, r);
      pg.pop();
    }
  }
  pg.pop();
}
recordedWords[3].draw = function (pg) {
  pg.push();
  pg.fill(0);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.noStroke();
    for(let i in frame) {
      pg.push();
      let z = frame[i];
      pg.translate(z.x * s, z.y * s);
      pg.fill(z.r, z.g, z.b);
      pg.rotateX(z.mag*3);
      pg.box(r, r, 10);
      pg.pop();
    }
  }
  pg.pop();
}

if(SX001 == undefined)
{
var SX001 = function(p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.1;
  this.uRoughness = 0.8;
  this.uSpecular = 0.01;
  this.uExposure = 5.0;
  this.uVignette = 0.0;
  this.uLightRadius = 1800.0;
  this.setup();
  this.pg.perspective(60.0 / 180 * Math.PI, this.pg.width / this.pg.height, 10, 5000);
  this.shadowMap.ortho(-800, 800, -800, 1600, -1000, 2400);
  this.cameraPosition.set(0, 0, 1000);
  this.lightPos.set(270, -270, 800);
  this.lightDirection.set(270, -270, 800);
  this.cameraTarget.set(0, 0, 0);
}

  SX001.prototype = Object.create(SRendererShadow.prototype);
  SX001.prototype.constructor = SX001;

  SX001.prototype.update = function (args) {
    let t = args.t;
    this.t = t;
    let p = this.p;
    if(objs.words.isRefreshed()) {
      for(let i in recordedWords)
        recordedWords[i].curFrame = 30;
    }
  }
  SX001.prototype.drawScene = function (pg, isShadow) {
    let t = this.t;
    let p = this.p;
    let ef = EasingFunctions;

    pg.clear();
    pg.push();
    pg.fill(255);
    pg.translate(0, 0, -20);
    pg.box(2000, 2000, 10);
    pg.translate(0, 0, 10);
    pg.translate(-10*160/2, -10*90/2, 0);
    let d = 80;
    setColor(pg, "stroke", 1);
    for(let i = -0; i <= 24; i++) {
      for(let j = -0; j <= 20; j++) {
        pg.line(i * d - 10, j * d, i * d + 10, j * d);
        pg.line(i * d, j * d - 10, i * d, j * d + 10);
      }
    }
    pg.translate(0, 0, 10);
  
    let tw0 = objs.rhythm0.get(t, true);

    pg.translate(0,0,1);
    pg.noStroke();

    recordedWords[objs.words.note].draw(pg);

    pg.pop();
  }
}
////////

if(s == undefined) {
var s = function (p) {
  let sX001 = new SX001(p, windowWidth, windowHeight);

  p.setup = function () {
    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    sX001.update({t: t});
    sX001.draw({t: t});
  
    p.background(0);
    p.image(sX001.pg, 0, 0);
    for(let i in recordedWords)
    {
      recordedWords[i].drawState(p.g);
    }
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
    for(let i = 0; i < m.length / 7; i++) {
      let x = parseInt(m[i * 7 + 0]);
      let y = parseInt(m[i * 7 + 1]);
      let cr = parseInt(m[i * 7 + 2]);
      let cg = parseInt(m[i * 7 + 3]);
      let cb = parseInt(m[i * 7 + 4]);
      // let pu = lastFrame[i] == undefined ? 0 : lastFrame[i].u;
      // let pv = lastFrame[i] == undefined ? 0 : lastFrame[i].v;
      let u = m[i * 7 + 5];//p.lerp(m[i * 7 + 5], pu, 0.8);
      let v = m[i * 7 + 6];//p.lerp(m[i * 7 + 6], pv, 0.8);
      let mag = Math.sqrt(u*u+v*v);
      frame.push({x: x, y: y, u: u, v: v, r: cr, g: cg, b: cb, mag: mag});
    }
    if(curWord >= 0)
      recordedWords[curWord].addFrame(frame);
    lastFrame = frame;
  }

  p.keyPressed = function () {
    if(p.key == 'c') {
      for(let i in recordedWords) {
        recordedWords[i].reset();
      }
    }
    if(p.key >= '0' && p.key < '6') {
      if(recordedWords.length <= p.key - '0') return;
      curWord = p.key - '0';
      recordedWords[curWord].reset();
    }
  }
};

var pX001 = new p5(s);
}