// random shifting

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
var pgTemp;
var v;
var font, fontBig;
var scaling = printing ? 1.25 : .75;
// var scaling = 1;
// var scaling = 1.25;

S064.prototype.drawLayer = function (pg, key, args) {
  let t = args.t;
  let p = this.p;
  if (args.first) {
    pg.blendMode(p.BLEND);
    pg.background(0);
  }

  pg.blendMode(p.ADD);

  pg.pushMatrix();
  // if (printing) {
  //   pg.fill(0);
  // }
  // else {
  //   if (this.ink == "pink") {
  //     pg.fill(255, 100, 100);
  //   }
  //   if (this.ink == "blue") {
  //     pg.fill(0, 0, 255);
  //   }
  // }
  
  if (this.ink == "pink") {
  }
  if (this.ink == "blue" && args.first) {
    pg.pushStyle();
    pg.noStroke();
    if (printing) {
      pg.fill(255);
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

  pg.image(pgTemp, 0, 0);

  pg.popMatrix();
}

function drawBack(p, pg, shift, r, g, b, i) {
  pg.beginDraw();
  pg.background(0);
  pg.pushStyle();
  pg.fill(255)
  pg.textAlign(p.CENTER, p.CENTER);
  pg.pushMatrix();
  pg.translate(pg.width / 2, pg.height / 2);
  pg.textFont(fontBig);
  // for (let i = 0; i < v.length; i++) 
  {
    pg.pushMatrix();
    let x = v[i].x;
    let y = v[i].y;
    let a = v[i].a;
    pg.translate(x, y);
    pg.rotate(a);
    let s = p.map(i, 0, 26*6, 2, .5);
    pg.scale(s, s);
    pg.text(String.fromCharCode(65 + i%26), 0, 0);
    pg.popMatrix();
  }
  pg.popMatrix();
  pg.popStyle();

  pg.pushStyle();
  pg.stroke(0);
  pg.strokeWeight(3);
  let N = Math.floor(150 * pg.width / pg.height);
  let Nstart = 0;
  let Nstop = N;
  Nstart = 10;
  let X = 0;
  if (shift) {
    X = p.random(-4, 4);
  }
  for (let j = Nstart; j < Nstop; j++) {
    let x = p.map(j, 0, N - 1, 50, pg.width - 50);
    pg.line(x + X, 50, x + X, pg.height - 50);
  }
  pg.popStyle();
  pg.endDraw();
}
////////

var s = function (p) {
  let h = 297 * 4 * scaling;
  let w = 420 * 4 * scaling;
  let ii = 0;

  pgTemp = p.createGraphics(w, h);
  v = [];
  for (let i = 0; i < 26*6; i++) {
    let x = p.random(-w / 2 + 200*scaling, w / 2 - 200*scaling);
    let y = p.random(-h / 2 + 200*scaling, h / 2 - 200*scaling);
    let a = p.random(-Math.PI, Math.PI);
    v.push({x: x, y: y, a: a});
  }

  let spink = new S064(p, w, h);
  spink.ink = "pink";
  let sblue = new S064(p, w, h);
  sblue.ink = "blue";

  if(map === undefined) {
  }

  // if (font == undefined) {
    font = p.createFont("assets/fonts/ApfelGrotezk-Regular.otf", 40 * scaling);
    fontBig = p.createFont("assets/fonts/ApfelGrotezk-Regular.otf", 160 * scaling);
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

    if(ii >= 4 && inited == false) {
      if (ii % 2 == 0) {
        drawBack(p, pgTemp, false, 255, 100, 100, Math.floor(ii / 2 - 2));
        spink.draw({ first: ii == 4 });
      }
      else {
        drawBack(p, pgTemp, true, 0, 0, 255, Math.floor(ii / 2 - 2));
        sblue.draw({ first: ii == 5 });
      }
      if (ii >= v.length * 2)
        inited = true;
    }
    ii++;

    p.background(0);
    p.blendMode(p.ADD);

    if (printing) {
      if (printingIndex == v.length * 2) {
        p.image(spink.pg, 0, 0);
        p.saveFrame(p.folderName + "/output/pink.png");
      }
      else if (printingIndex == v.length * 2 + 1) {
        p.image(sblue.pg, 0, 0);
        p.saveFrame(p.folderName + "/output/blue.png");
        printingIndex = -1;
        printing = false;
      }
      printingIndex++;
    }
    else {
      p.tint(255, 100, 100);
      p.image(spink.pg, 0, 0);
      p.translate((t / 1.0) % 6 - 3,0)
      p.tint(0, 0, 255);
      p.image(sblue.pg, 0, 0);
      p.tint(255);
    }
  }

  let lastT = 0;
};

var p064 = new p5(s);
