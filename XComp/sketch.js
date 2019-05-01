var windowWidth = 1280;
var windowHeight = 800;


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
    words: {
      notes : [0,1,2], mult: 0.5, doMutate: false, duration: 1.0, offset: 0.0},
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
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  // pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    pg.stroke(0);
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*8;
    pg.noStroke();
    setColor(pg, "fill", 1);
    for(let i in frame) {
      let z = frame[i];
      pg.push();
      let m = Math.sqrt(z.u*z.u + z.v*z.v)*150;
      // if(m > 100) m = 100
      pg.translate(z.x * s, z.y * s);
      pg.box(Math.abs(z.u) * r, Math.abs(z.v) * r, m);
      pg.pop();
    }
  }
  pg.pop();
}
recordedWords[1].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  // pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    // pg.noStroke();
    setColor(pg, "fill", 2);
    // pg.strokeWeight(3);
    pg.beginShape(pX001.TRIANGLE_STRIP)
    let x = 0;
    for(let i in frame) {
      let z = frame[i];
      if(z.x < x) {
        pg.endShape();
        pg.beginShape(pX001.TRIANGLE_STRIP)
      }
      x = z.x;
      let m = Math.sqrt(z.u*z.u + z.v*z.v);
      pg.vertex(z.x * s + z.u * r, z.y * s + z.v * r, 150*m+30);
      pg.vertex(z.x * s + z.u * r, z.y * s + z.v * r-30, 150*m);
    }
    pg.endShape();
  }
  pg.pop();
}
recordedWords[2].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  // pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.noStroke();
    setColor(pg, "fill", 3);
    for(let i in frame) {
      pg.push();
      let z = frame[i];
      let m = Math.sqrt(z.u*z.u + z.v*z.v);
      pg.translate(z.x * s, z.y * s, m * 150);
      pg.rect(0, 0, r, r);
      // pg.rect(z.x * s, z.y * s, z.u * r, z.v * r);
      pg.pop();
    }
  }
  pg.pop();
}
recordedWords[3].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  // pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40*2;
    let r = 6*10;
    pg.noStroke();
    setColor(pg, "stroke", 4);
    setColor(pg, "fill", 4);
    for(let i in frame) {
      let z = frame[i];
      let w = z.u*r;
      let h = z.v*r;
      setColor(pg, "fill", 4);
      pg.rect(z.x * s, z.y * s, w/2,h/2);
      setColor(pg, "fill", 0);
      pg.rect(z.x * s+w/2, z.y * s+h/2, w/2,h/2);
    }
  }
  pg.pop();
}

function SX001(p, w, h) {
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

{
  SX001.prototype = Object.create(SRendererShadow.prototype);
  SX001.prototype.constructor = SX001;

  SX001.prototype.update = function (args) {
    let t = args.t;
    this.t = t;
    let p = this.p;
    if(objs.words.isCycled()) {
      for(let i in recordedWords)
        recordedWords[i].curFrame = 0;
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

    // print(objs.words.note)
    recordedWords[objs.words.note].draw(pg);

    pg.pop();
  }
}
////////

// if(s == undefined)
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
    // print(recordedWords[2].draw)
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
    for(let i = 0; i < m.length / 4; i++) {
      let x = parseInt(m[i * 4 + 0]);
      let y = parseInt(m[i * 4 + 1]);
      let pu = lastFrame[i] == undefined ? 0 : lastFrame[i].u;
      let pv = lastFrame[i] == undefined ? 0 : lastFrame[i].v;
      let u = p.lerp(m[i * 4 + 2], pu, 0.8);
      let v = p.lerp(m[i * 4 + 3], pv, 0.8);
      frame.push({x: x, y: y, u: u, v: v});
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
