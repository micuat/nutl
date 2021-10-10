// background/foreground

function S064(p, w, h) {
  TLayer.call(this, p, w, h);
}

S064.prototype = Object.create(TLayer.prototype);
S064.prototype.constructor = S064;

S064.prototype.update = function (args) {
  let t = args.t;
  let p = this.p;

  this.lastT = t;
}

var printing = false;
var map;
var font, fontBig;
var scaling = .75;
// var scaling = 1;
// var scaling = 1.25;

S064.prototype.drawLayer = function (pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  pg.background(255);
  pg.strokeWeight(4 * scaling);
  pg.noStroke();
  pg.pushMatrix();
  pg.rectMode(p.CENTER);
  if (printing) {
    pg.fill(0);
  }
  else {
    if (this.ink == "pink") {
      pg.fill(255, 100, 100);
    }
    if (this.ink == "blue") {
      pg.fill(0, 0, 255);
    }
  }
  
  let N = Math.floor(150 * pg.width / pg.height);
  let Nstart = 0;
  let Nstop = N;
  let M = 150;
  let Mstart = 0;
  let Mstop = M;
  Nstart = 10;
  if (this.ink == "pink") {
    // Mstart = 50;
  }
  if (this.ink == "blue") {
    // Mstop = 51;
    pg.pushStyle();
    pg.noStroke();
    if (printing) {
      pg.fill(0);
    }
    else {
      pg.fill(0, 0, 255);
    }
    pg.textSize(16);
    pg.textAlign(p.LEFT, p.CENTER);
    pg.textFont(font);

    pg.pushMatrix();
    pg.translate(70, 50);
    pg.rotate(Math.PI / 2);
    pg.scale(0.5, 0.5);
    pg.text("Naoto Hieda.com", 0, 0)
    pg.popMatrix();

    pg.pushMatrix();
    pg.translate(70, pg.height / 2);
    pg.rotate(Math.PI / 2);
    pg.scale(0.5, 0.5);
    pg.textAlign(p.CENTER, p.CENTER);
    pg.text("riso.glitches.me", 0, 0)
    pg.popMatrix();

    pg.pushMatrix();
    pg.translate(70, pg.height - 50);
    pg.rotate(Math.PI / 2);
    pg.scale(0.5, 0.5);
    pg.textAlign(p.RIGHT, p.CENTER);
    pg.text("2021", 0, 0)
    pg.popMatrix();

    pg.popStyle();
  }

  pg.textAlign(p.RIGHT, p.CENTER);
  pg.pushMatrix();
  pg.translate(pg.width / 2, pg.height / 2);
  pg.rotate(Math.PI / 2);
  pg.textFont(fontBig);
  let text = ["background", "foreground"];
  // let text = ["pink", "grey"];
  for (let i = 0; i < 9; i++) {
    pg.text(text[i % text.length], 400 * scaling, p.map(i, 0, 8, -4, 4) * 125 * scaling);
  }
  // pg.text("hello world", 0, -100);
  // pg.text("hello world", 0, 0);
  // pg.text("hello world", 0, 100);
  pg.popMatrix();

  pg.stroke(255);
  for (let j = Nstart; j < Nstop; j++) {
    let X = 0;
    let Y = 0;
    let x = p.map(j, 0, N - 1, 50, pg.width - 50);
    if (this.ink == "pink") {
      X = Math.pow(Math.sin(j * Math.PI / 40), 1) * 4;
      X = Math.floor((x + 20 + pg.width / 2) / (125 * scaling)) % 2 * 4
    }
    pg.line(x + X, 50, x + X, pg.height - 50);
    for (let i = Mstart; i < Mstop; i++) {
      if (this.ink == "blue") {
        Y = Math.sin(i * Math.PI / 40) * 4;
      }
      let x = p.map(j, 0, N - 1, 50, pg.width - 50);
      let y = p.map(i, 0, M - 1, 50, pg.height - 50);
      // let w = p.map(1, 0, N - 1, 50, pg.width - 50);
      // let h = p.map(1, 0, M - 1, 50, pg.height - 50);
      // if (this.ink == "pink" && (i+j)%2 == 0)
      //   pg.rect(x + X, y + Y, w/4, h/4);
      // if (this.ink == "blue" && (i+j)%2 == 1)
      //   pg.rect(x + X, y + Y, w/4, h/4);
    }
  }
  pg.popMatrix();
}

////////

var s = function (p) {
  let h = 297 * 4 * scaling;
  let w = 420 * 4 * scaling;
  let spink = new S064(p, w, h);
  spink.ink = "pink";
  let sblue = new S064(p, w, h);
  sblue.ink = "blue";

  if(map === undefined) {
  }

  // if (font == undefined) {
    font = p.createFont("assets/fonts/ApfelGrotezk-Regular.otf", 40 * scaling);
    fontBig = p.createFont("assets/fonts/ApfelGrotezk-Regular.otf", 120 * scaling);
  // }

  let printingIndex = -1;
  let inited = false;

  if (printing) {
    printingIndex = 0;
  }

  p.setup = function () {
    p.createCanvas(w, h);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    // if (Math.floor(t / 4) - Math.floor(lastT / 4) > 0) {
    //   print(t, p.frameRate())
    // }

    lastT = t;

    if(inited == false) {
      spink.draw({});
      sblue.draw({});
      inited = true;
    }

    p.background(255);
    p.blendMode(p.MULTIPLY);

    if (printing) {
      if (printingIndex == 10) {
        p.image(spink.pg, 0, 0);
        p.saveFrame(p.folderName + "/output/pink.png");
      }
      else if (printingIndex == 11) {
        p.image(sblue.pg, 0, 0);
        p.saveFrame(p.folderName + "/output/blue.png");
        printingIndex = -1;
        printing = false;
      }
      printingIndex++;
    }
    else {
      p.image(spink.pg, 0, 0);
      p.translate((t / 1.0) % 6 - 3,0)
      p.image(sblue.pg, 0, 0);
    }
  }

  let lastT = 0;
};

var p064 = new p5(s);
