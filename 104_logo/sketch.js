var colorSchemes = [
  new ColorScheme("4281a4-48a9a6-e4dfda-d4b483-c1666b"),
  new ColorScheme("c33149-a8c256-f3d9b1-c29979-a22522"),
  new ColorScheme("390099-9e0064-ff0054-ff5400-ffbd00"),
]

function setColor(parent, func, index, alpha) {
  if (alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

////////

var width = 1920;
var height = 1080;

function Panel(p, i) {
  this.x = width / 2 - 350;
  this.y = height / 2;

  let v = p5.Vector.random2D();
  this.vx = 4 * v.x;
  this.vy = 4 * v.y;
  this.shake = 100000;
  this.p = p;
  this.i = i;
  let texts = [];
  texts.push("node")
  texts.push("forum")
  texts.push("choreographic")
  texts.push("coding")
  texts.push("online")
  texts.push("oct 2-8")
  // this.text = p.random(texts).toUpperCase();
  this.text = texts[i].toUpperCase();
  this.width = 450;
  this.tx = 0;
  this.tvx = 0;
}

Panel.prototype.update = function () {
  const p = this.p;

  this.x += this.vx;
  this.y += this.vy;
  if (this.x - 15 + this.width > width) {
    this.shake = 0;
    this.vx *= -1;
    this.tvx = 1;
  }
  if (this.x - 15 < 0) {
    this.shake = 0;
    this.vx *= -1;
    this.tvx = -1;
  }
  if (this.y + 70 > height) {
    this.shake = 0;
    this.vy *= -1;
  }
  if (this.y + 0 < 0) {
    this.shake = 0;
    this.vy *= -1;
  }
  this.shake++;

  this.tx = p.constrain(this.tx + this.tvx * Math.abs(this.vx), 0, this.width - p.textWidth(this.text) - 25);
}

Panel.prototype.draw = function (pg, t) {
  const p = this.p;
  pg.pushMatrix();
  pg.translate(this.x, this.y);
  // pg.fill(0)
  setColor(pg, "fill", this.i % 5);
  // pg.rect(-15, 0, 700, 70)
  let amp = p.map(p.constrain(this.shake, 0, 60), 0, 60, 10, 0);
  for (let i = 0; i < 20; i++) {
    let w = this.width / 20;
    pg.rect(-15 + i * w, 0 + Math.sin(t * 12 + i / 7 * 4 * Math.PI) * amp, w, 70)
  }
  pg.fill(0)
  // setColor(pg, "fill", (this.i + 1) % 5)
  pg.text(this.text, this.tx, 50)
  pg.popMatrix();
}

function S064(p, w, h) {
  TLayer.call(this, p, w, h);
  this.lastT = 0;
  this.panels = [];
  for (let i = 0; i < 6; i++) {
    this.panels.push(new Panel(p, i));
  }
}

S064.prototype = Object.create(TLayer.prototype);
S064.prototype.constructor = S064;

S064.prototype.update = function (args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
  for (let i = 0; i < this.panels.length; i++) {
    this.panels[i].update();
  }
}

S064.prototype.drawLayer = function (pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  pg.background(0);
  // setColor(pg, "background", 2)
  // setColor(pg, "stroke", 1)
  pg.strokeWeight(2);

  pg.textFont(font)
  pg.textSize(48)
  // hacky
  p.textFont(font)
  p.textSize(48)
  pg.noStroke();
  for (let i = 0; i < this.panels.length; i++) {
    this.panels[i].draw(pg, t);
  }
}

////////

var font;

var s = function (p) {
  let s064 = new S064(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);

    if (font == undefined) {
      font = p.createFont("assets/fonts/Prompt-Light.otf", 48);
    }
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
