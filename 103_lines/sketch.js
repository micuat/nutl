var colorSchemes = [
  new ColorScheme("4281a4-48a9a6-e4dfda-d4b483-c1666b"),
  new ColorScheme("c33149-a8c256-f3d9b1-c29979-a22522"),
  new ColorScheme("390099-9e0064-ff0054-ff5400-ffbd00"),
]

function setColor(parent, func, index, alpha) {
  if (alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function Agent(p) {
  this.p = p;
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.coeff = p.map(Math.random(), 0, 1, 0.9, 0.94);
  this.target = { x: 100, y: 0 };
}
Agent.prototype.setTarget = function (x, y) {
  this.target = { x: x, y: y };
}
Agent.prototype.update = function () {
  let p = this.p;
  this.ax = this.target.x - this.x;
  this.ay = this.target.y - this.y;

  let a = p.dist(0, 0, this.ax, this.ay);
  if (a > 1) {
    this.ax /= a;
    this.ay /= a;
  }

  this.vx *= this.coeff;
  this.vy *= this.coeff;

  this.vx += this.ax;
  this.vy += this.ay;

  this.x += this.vx;
  this.y += this.vy;
}
Agent.prototype.draw = function (pg) {
  setColor(pg, "stroke", 1)
  pg.pushMatrix();
  pg.translate(this.target.x, this.target.y);
  let h = 5;
  pg.line(-h, 0, h, 0);
  pg.line(0, -h, 0, h);
  pg.popMatrix();

  // setColor(pg, "stroke", 3)
  // pg.line(this.x, this.y, this.x + this.ax * 30, this.y + this.ay * 30);
  setColor(pg, "stroke", 4)
  pg.line(this.x, this.y, this.x + this.vx * 3, this.y + this.vy * 3);

  setColor(pg, "fill", 0)
  pg.noStroke();
  pg.ellipse(this.x, this.y, 10, 10);
}

////////

function S064(p, w, h) {
  TLayer.call(this, p, w, h);
  this.agents = [];
  this.strip = [];
  this.stripTo = [];
  this.stripFrom = [];
  for (let i = 0; i < 128; i++) {
    this.agents.push(new Agent(p));
    this.strip.push({ x: 0, y: 0 });
    this.stripTo.push({ x: 10, y: 0 });
    this.stripFrom.push({ x: 0, y: 0 });
  }
  this.lastT = 0;
}

S064.prototype = Object.create(TLayer.prototype);
S064.prototype.constructor = S064;

var Funcs = {
  circle: function (i, N, t) {
    let r = 300;
    let x = r * Math.cos(t + i / (N - 1) * 2 * Math.PI);
    let y = r * Math.sin(t + i / (N - 1) * 2 * Math.PI);
    return { x: x, y: y };
  },
  sine: function (i, N, t) {
    let r = 200;
    let x = (i / N - 0.5) * 600;
    let y = r * Math.sin(t + i / 32 * 2 * Math.PI);
    return { x: x, y: y };
  },
  spiral: function (i, N, t) {
    let r = i / N * 300;
    let x = r * Math.cos(t + i / (N - 1) * 2 * Math.PI * 4);
    let y = r * Math.sin(t + i / (N - 1) * 2 * Math.PI * 4);
    return { x: x, y: y };
  },
  sq: function (i, N, t) {
    let r = 200;
    let x = 0
    let y = 0;
    let n = N / 4;
    if (i < n) {
      x = ((i % n) / n - 0.5) * r * 2;
      y = -r;
    }
    else if (i < n * 2) {
      x = r;
      y = ((i % n) / n - 0.5) * r * 2;
    }
    else if (i < n * 3) {
      x = -((i % n) / n - 0.5) * r * 2;
      y = r;
    }
    else {
      x = -r;
      y = -((i % n) / n - 0.5) * r * 2;
    }
    return { x: x, y: y };
  },
  corners: function (i, N, t) {
    let r = 200;
    let x = 0
    let y = 0;
    let n = N / 4;
    i = (Math.floor((i + n / 2) / n) * n) % N;
    if (i < n) {
      x = ((i % n) / n - 0.5) * r * 2;
      y = -r;
    }
    else if (i < n * 2) {
      x = r;
      y = ((i % n) / n - 0.5) * r * 2;
    }
    else if (i < n * 3) {
      x = -((i % n) / n - 0.5) * r * 2;
      y = r;
    }
    else {
      x = -r;
      y = -((i % n) / n - 0.5) * r * 2;
    }
    return { x: x, y: y };
  },
}
S064.prototype.update = function (args) {
  let t = args.t;
  let p = this.p;

  let N = this.strip.length;

  if (Math.floor(t) - Math.floor(this.lastT) > 0) {
    for (let i = 0; i < this.agents.length; i++) {
      let v = this.stripTo[i];
      this.agents[i].setTarget(v.x, v.y);
    }
    let temp = this.stripFrom;
    this.stripFrom = this.stripTo;
    this.stripTo = temp;
    let func = Funcs[p.random(Object.keys(Funcs))];
    // func = Funcs.sq;
    for (let i = 0; i < N; i++) {
      let v = this.stripTo[i];
      let u = func(i, N, t);
      v.x = u.x;
      v.y = u.y;
    }
  }
  this.lastT = t;

  let l = EasingFunctions.easeInOutCubic(p.constrain(t % 1, 0, 1));
  for (let i = 0; i < N; i++) {
    let v = this.strip[i];
    v.x = p.lerp(this.stripFrom[i].x, this.stripTo[i].x, l);
    v.y = p.lerp(this.stripFrom[i].y, this.stripTo[i].y, l);
  }

  for (let i = 0; i < this.agents.length; i++) {
    this.agents[i].update();
  }
}

S064.prototype.drawLayer = function (pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  setColor(pg, "background", 2)
  setColor(pg, "stroke", 1)
  pg.strokeWeight(2);

  pg.pushMatrix();
  pg.translate(pg.width / 2, pg.height / 2);

  pg.noFill();
  let N = this.strip.length;
  pg.beginShape();
  for (let i = 0; i < N; i++) {
    let v = this.strip[i];
    pg.vertex(v.x, v.y);
  }
  pg.endShape();

  for (let i = 0; i < this.agents.length; i++) {
    this.agents[i].draw(pg);
  }
  pg.popMatrix();
}

////////

var s = function (p) {
  let s064 = new S064(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if (Math.floor(t / 4) - Math.floor(lastT / 4) > 0) {
      print(t, p.frameRate())
    }

    lastT = t;

    s064.draw({ t: t });

    p.background(0);
    p.image(s064.pg, 0, 0);
  }

  let lastT = 0;
};

var p064 = new p5(s);
