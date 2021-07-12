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

S064.prototype.drawLayer = function (pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  pg.background(255);
  pg.strokeWeight(3);
  pg.noFill();
  pg.pushMatrix();
  if (printing) {
    pg.stroke(128);
  }
  else {
    if (this.ink == "pink") {
      pg.stroke(255, 100, 100);
    }
    if (this.ink == "blue") {
      pg.stroke(0, 0, 255);
    }
  }
  let N = 200;
  let M = 600;
  for (let j = 0; j < N; j++) {
    pg.beginShape();
    let X = 0;
    if (this.ink == "pink") {
      X = Math.pow(Math.sin(j * Math.PI / 100), 1) * 4;
    }
    for (let i = 0; i < M; i++) {
      // pg.pushMatrix();
      let x = p.map(j, 0, N - 1, 50, pg.width - 50);
      let y = p.map(i, 0, M - 1, 50, pg.height - 50);
      // let l = (pg.height - 50 * 2) / (M - 1) / 2 * 0.9;
      // pg.translate(x, y);
      // pg.rotate((i + j) * Math.PI / 15)
      let xx = 0;
      // xx = Math.sin(i * Math.PI / 8) * 4;
      if (this.ink == "blue") {
        xx = i * 2 > j ? 1 : -1;
        let x = Math.floor(j / N * map.width);
        let y = Math.floor(i / M * map.height);
        xx = Math.pow(p.brightness(map.get(x, y)) * 1.0 / 255, 1) * 10;
      }
      pg.vertex(x + X + xx, y);
      // pg.popMatrix();
    }
    pg.endShape();
  }
  pg.popMatrix();
}

////////

var s = function (p) {
  let h = 297 * 4;
  let w = 420 * 4;
  let spink = new S064(p, w, h);
  spink.ink = "pink";
  let sblue = new S064(p, w, h);
  sblue.ink = "blue";

  if(map === undefined) {
    map = p.loadImage(p.folderName + "/map.png");
  }

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
      p.translate((t / 2) % 4,0)
      p.image(sblue.pg, 0, 0);
    }
  }

  let lastT = 0;
};

var p064 = new p5(s);
