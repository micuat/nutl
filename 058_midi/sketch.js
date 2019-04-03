var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");

var soundOn = false//||true;

function Tween () {
  this.inited = false;
  this.note = 0;
}

Tween.prototype.init = function (args) {
  this.startTime = args.startTime;
  this.duration = args.duration;
  this.soundDelay = args.soundDelay;
  this.delay = args.delay;
  this.channel = args.channel;
  this.note = args.note;
  this.velocity = args.velocity;
  this.p = args.p;
  this.ringed = false;
  this.inited = true;
}

Tween.prototype.get = function (t) {
  if(this.inited == false) return 0;
  let tt = t - this.startTime - this.delay;
  if(tt == undefined) return 0;

  if(this.ringed == false && tt >= this.soundDelay) {
    if(soundOn)
      this.p.midiBus.sendNoteOn(this.channel, this.note, this.velocity);
    this.ringed = true;
  }

  if(tt > this.duration || tt < 0) return 0;
  tt = tt / this.duration;
  if(tt < 0.5) return tt * 2;
  else return 2 - tt * 2;
}

function Agent(angle, x, y) {
  this.angle = angle;//Math.random() * Math.PI * 2;
  this.x = x;
  this.y = y;
  this.angle2 = (Math.random()*2-1) * Math.PI * 2;
  this.stick = Math.random() * 0.4 + 0.05;
  this.angle3 = angle > Math.PI ? Math.PI / 2 : 0;
}

function S058(p, w, h) {
  this.patterns = ["default", "lines"];
  TLayer.call(this, p, w, h);
  this.pgs.default.smooth(0);
  this.pgs.lines.smooth(0);

  this.lastT = 0;
  this.tBase = 0;
  this.timeStep = 1.0;
  this.objs = [];
  this.circles = [];
  for(let i = 0; i < 10; i++) {
    for(let j = 0; j < 10; j++) {
      this.circles.push({
        x: p.map(j, 0, 9, -w*0.4, w*0.4),
        y: p.map(i, 0, 9, -h*0.4, h*0.4),
        i: i,
        j: j,
        index: Math.floor(p.map(i, 0, 10, 0, 5))//Math.floor(p.random(5))
      });
    }
  }

  for(let i = 0; i < 5; i++) {
    this.objs[i] = new Tween();
  }

  this.agents = [];
  for(let i = 0; i < 64; i++) {
    let angle = i / 64.0 * 2 * Math.PI;
    let x = w/4 * Math.cos(angle);
    let y = w/4 * Math.sin(angle);
    this.agents[i] = new Agent(angle, x, y);
  }
}

S058.prototype = Object.create(TLayer.prototype);
S058.prototype.constructor = S058;

S058.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  this.lastT = t;
}

S058.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  let tw = [];
  let dir = [];
  for(let i in this.objs) {
    tw[i] = EasingFunctions.easeInOutCubic(this.objs[i].get(t));
    dir[i] = this.objs[1].note - 0.5;
  }

  if(key == "default")
    pg.clear();
  else {
    let c0 = 0;
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 250*tw[3]+5);
    pg.rect(0, 0, this.width, this.height);
  }
  pg.translate(this.width / 2, this.height / 2);

  pg.push();


  // let bar = this.obj2 == undefined ? 0 : this.obj2.get(t);
  // pg.rect(-250, -300, 500 * (1-bar), 50);
  {
    for(let i = 0; i < this.agents.length; i++) {
      c0 = 3;
      let agent = this.agents[i];
      pg.noStroke();
      if(key == "default") {
        pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
        agent.angle = (agent.angle + tw[2] * 0.1) % (Math.PI * 2);
        let x0 = this.width / 4 * (tw[1]*0.5+1) * Math.cos(agent.angle);
        let y0 = this.width / 4 * (tw[1]*0.5+1) * Math.sin(agent.angle);
        if(dir[1] > 2) y0 = this.width / 4 * (tw[1]*0.5+1) * Math.sin(3*agent.angle);

        let x1 = p.map(agent.angle, 0, Math.PI*2, -this.width/2, this.width/2);
        let y1 = 150 * Math.sin(agent.angle * 4.0 + 4.0*t * Math.PI + agent.angle3);

        let x = p.lerp(x0, x1, tw[4]);
        let y = p.lerp(y0, y1, tw[4]);
        let stick = tw[4] > 0.5 ? 0.4 : agent.stick;
        agent.x = p.lerp(agent.x, x, stick);
        agent.y = p.lerp(agent.y, y, stick);
        pg.ellipse(agent.x, agent.y, 10,10);
      }

      if(i < this.agents.length - 1 && key == "lines") {
        pg.strokeWeight(2);
        c0 = 3;
        pg.stroke(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 355 * tw[3]);
        pg.line(agent.x, agent.y, this.agents[i+1].x, this.agents[i+1].y);
      }
    }
  }
  pg.pop();
}

////////

var s = function (p) {
  let s058 = new S058(p, 800, 800);

  let timings = [
    [0,3,0,4,0,0,1,2],
    [0,4,0,1,0,2,0,3],
    [0,0,0,4,0,0,4,4],
    [0,0,3,2,0,3,0,2],
    [0,0,0,0,0,0,0,3]
  ];

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
    p.updateDelayMillis = 5;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    s058.draw({t: t});
    p.image(s058.pgs.lines, 0, 0);
    p.image(s058.pgs.default, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;

    if(Math.floor(t) - Math.floor(lastT) > 0) {
      print(t)
    }

    // for(let i = 0; i < 5; i++) {
    //   if(Math.floor(t*(i+1) * 0.5) - Math.floor(lastT*(i+1) * 0.5) > 0) {
    //     // print(t)
    //     // p.midiBus.sendNoteOn(1, p.random([84,82]), 127);

    //     s058.objs[i].init({
    //       startTime: t, duration: 0.25,
    //       channel: 1, note: p.random([-3, -1, 1, 3]), velocity: 127,
    //       soundDelay: 0.125, p: p, delay: 0});
    //   }
    // }

    if(Math.floor(t*0.5) - Math.floor(lastT*0.5) > 0) {
      for(let i = 0; i < 5; i++) {
        if(Math.random() < 0.25) continue;
        let j0 = Math.floor(p.random(timings[i].length));
        let j1 = Math.floor(p.random(timings[i].length));
        let tmp = timings[i][j0];
        timings[i][j0] = timings[i][j1];
        timings[i][j1] = tmp;
      }
    }
    for(let i = 0; i < 5; i++) {
      let index = Math.floor(t*4) % timings[i].length;
      if(Math.floor(t*4+i) - Math.floor(lastT*4+i) > 0 && timings[i][index] != "0") {
        s058.objs[i].init({
          startTime: t, duration: i==4?1.0:0.25,
          channel: 1, note: parseInt(timings[i][index]), velocity: 127,
          soundDelay: 0.125, p: p, delay: 0});
      }
    }

    lastT = t;
  }
};

var p058 = new p5(s);
