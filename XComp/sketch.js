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
      notes : [0,1], mult: 0.5, doMutate: false, duration: 1.0, offset: 0.0},
    camera: {notes: [0,1], mult: 0.25, doMutate: false, duration: 3},
  };

  for(let key in timings) {
    objs[key] = new Tween(timings[key]);
  }
}

if(recordedWords == undefined) {
  var recordedWords = new Array(4);
  for(let i = 0; i < recordedWords.length; i++) {
    recordedWords[i] = new Word({name: i + "th", position: {x: (i % 2) * 600, y: Math.floor(i / 2) * 600}});
  }
}

recordedWords[0].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    pg.stroke(0);
    let frame = this.sequence[this.curFrame];
    let s = 40;
    let r = 6*4;
    pg.noStroke();
    setColor(pg, "fill", 1);
    for(let i in frame) {
      let z = frame[i];
      pg.rect(z.x * s, z.y * s, z.u * r, z.v * r);
      // if(frame[i][j+1] != undefined) {
      //   let z1 = frame[i][j+1];
      //   pg.rect((z.x+z1.x)*0.5 * s, (z.y+z1.y)*0.5 * s, z.u * r, z.v * r);
      // }
    }
  }
  pg.pop();
}
recordedWords[1].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40;
    let r = 6*4;
    // pg.noStroke();
    setColor(pg, "stroke", 2);
    pg.beginShape(pX001.LINE_STRIP)
    let x = 0;
    for(let i in frame) {
      let z = frame[i];
      if(z.x < x) {
        pg.endShape();
        pg.beginShape(pX001.LINE_STRIP)
      }
      x = z.x;
      pg.vertex(z.x * s + z.u * r, z.y * s + z.v * r);
    }
    pg.endShape();
  }
  pg.pop();
}
recordedWords[2].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40;
    let r = 6*4;
    pg.noStroke();
    setColor(pg, "fill", 3);
    for(let i in frame) {
      for(let j in frame[i]) {
        let z = frame[i][j];
        pg.rect(z.x * s, z.y * s, z.u * r, z.v * r);
      }
    }
  }
  pg.pop();
}
recordedWords[3].draw = function (pg) {
  pg.push();
  // pg.translate(this.position.x, this.position.y);
  pg.fill(0);
  pg.text(this.name, 150, 100);
  if(this.sequence.length >= this.maxSequence) {
    let frame = this.sequence[this.curFrame];
    let s = 40;
    let r = 6*4;
    pg.noStroke();
    setColor(pg, "fill", 4);
    for(let i in frame) {
      for(let j in frame[i]) {
        let z = frame[i][j];
        let w = z.u*r;
        let h = z.v*r;
        setColor(pg, "fill", 4);
        pg.rect(z.x * s, z.y * s, w/2,h/2);
        setColor(pg, "fill", 0);
        pg.rect(z.x * s+w/2, z.y * s+h/2, w/2,h/2);
      }
    }
  }
  pg.pop();
}

if(s == undefined)
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
      frame.push({x: x, y: y, u: u, v: v});
    }
    if(curWord >= 0)
      recordedWords[curWord].addFrame(frame);
    lastFrame = frame;
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
