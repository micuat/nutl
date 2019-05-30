var colorSchemes = [new ColorScheme("0b4f6c-01baef-a682ff-20bf55-715aff")];
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function S065(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  p.noiseSeed(0);

  this.W = 40;
  this.H = 4;
  this.J = 22;
  this.hh = 60;
  this.I = 160;

  this.image = p.loadImage(p.folderName + "/map.png");

  this.matrix = [];
  for(let i = 0; i < this.I + 1; i++) { // oh...
    this.matrix[i] = [];
    for(let j = 0; j < this.J; j++) {
      let dj = i % 2 == 0 ? 0 : 0.5;
      let H = 0;
      let b = p.brightness(this.image.get((j+dj)/(this.J+1)*this.image.width/2, i/this.I*this.image.height/2)) / 255;
      let col = i % 2;
      let th0 = 0.05;
      let th1 = 0.5;
      let th2 = 0.95;
      if(col == 0) {
        if(b < th0) {
          H = 1;
        }
        else if(b < th2) {
          H = 0.5;
        }
        else {
          H = 0;
        }
      }
      else {
        H = 0.5;
      }

      this.matrix[i][j] = {H: H, col: col};
    }
  }
}

S065.prototype = Object.create(TLayer.prototype);

S065.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S065.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  // setColor(pg, "background", 3);
  pg.background(255);

  pg.pushMatrix();

  let W = this.W;
  let H = this.H;
  let J = this.J;
  let hh = this.hh;
  pg.strokeWeight(2);
  pg.noFill();

  function drawCurve(args) {
    pg.beginShape();
    for(let ii = 0; ii <= W; ii++) {
      let x = Math.cos(ii / W * Math.PI * 2) * 0.5 + 0.5;
      let y = (1 - x * x) * args.H;
      let alpha = p.constrain(p.map(y, 0, 0.7, 50, 255), 0, 255);
      if(args.H == 0) alpha = 50;
      setColor(pg, "stroke", args.col, alpha);
      pg.vertex(ii, y * hh);
    }
    pg.endShape();
  }
  function drawWeft(matrix, i, debug) {
    for(let j = 0; j < J; j++) {
      let dj = i % 2 == 0 ? 0 : 0.5;
      pg.push();
      pg.translate((j+dj) * W, 0);

      drawCurve(matrix[i][j]);

      if(debug) {
        pg.fill(0)
        pg.text((j+1)+"", W/2, 0);
        pg.text((J-j)+"", W/2, -10);
      }
      pg.pop();
    }
  }
  for(let i = 0; i < this.I; i++) {
    pg.push();
    pg.translate(0, i * H);
    drawWeft(this.matrix, i);
    pg.pop();
  }

  pg.push();
  pg.translate(0, 950);
  let line = 159;
  drawWeft(this.matrix, line,true);
  pg.translate(0, 100);
  drawWeft(this.matrix, line+1,true);
  pg.pop();

  pg.popMatrix();
}

S065.prototype.constructor = S065;

////////

var s = function (p) {
  let s065 = new S065(p, 1200, 3000);
  let counter = 99;

  p.setup = function () {
    p.createCanvas(1200, 1200);
    p.frameRate(60);
    let t = p.millis() * 0.001;
    s065.draw({t: t});
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    //p.translate(0, -counter * 20 + p.height / 2);

    p.image(s065.pg, 0, 0);
    p.noStroke();
    p.fill(255, 0, 0, 100);
    p.rect(28*20, counter * 20, -28*20, 10);
  }

  p.keyPressed = function () {
    if(p.key == 'w') {
      counter = Math.max(counter - 1, 0);
    }
    else if(p.key == 's') {
      counter = Math.min(counter + 1, 199);
    }
    print(counter)
  }
};

var p065 = new p5(s);
