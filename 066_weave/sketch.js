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
      let x = (j+dj) * this.W;
      let y = i * this.H;

      let H = 0;
      let b = p.brightness(this.image.get((j+dj)/(this.J+1)*this.image.width/2, i/this.I*this.image.height/2)) / 255;
      let col = i % 4;
      let th0 = 0.05;
      let th1 = 0.5;
      let th2 = 0.95;
      if((i/8+j)%4 < 0.5) H = 0.5;
      this.matrix[i][j] = {H: H, col: col, x: x, y: y};
    }
  }
  for(let i = 0; i < this.I + 1; i++) { // oh...
    for(let j = 0; j < this.J; j++) {
      let prevJ = j-1;
      let prev = undefined;
      let nextJ = j+1;
      let next = undefined;
      if(prevJ >= 0) prev = this.matrix[i][prevJ];
      if(nextJ < this.J) next = this.matrix[i][nextJ];
      this.matrix[i][j].prev = prev;
      this.matrix[i][j].next = next;
    }
  }
  for(let i = 0; i < 30; i++) {
    let I0 = Math.floor(p.random(this.I));
    let J0 = Math.floor(p.random(this.J-1));

    let I1 = Math.floor(p.random(this.I));
    let J1 = J0 + 1;Math.floor(p.random(this.J));

    if(I0 != I1 && J0 != J1) {
      let tmp = this.matrix[I1][J1].prev;
      this.matrix[I1][J1].prev = this.matrix[I0][J0];
      this.matrix[I1][J1].H = 10;

      this.matrix[I0][J0].next.prev = tmp;
      this.matrix[I0][J0].next.H = 10;


      this.matrix[I0][J0].next = this.matrix[I1][J1];
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
    setColor(pg, "stroke", args.col);
    // pg.ellipse(args.x, args.y, 5, 5);
    // if(args.prev != undefined)
    //   pg.line(args.x, args.y, args.prev.x, args.prev.y);
    if(args.prev != undefined) {
      pg.beginShape();
      for(let ii = 0; ii <= W; ii++) {
        let x = ii/W;//Math.sin(ii / W * Math.PI) * 0.5 + 0.5;
        let X = p.lerp(args.prev.x, args.x, x);
        let Y = p.lerp(args.prev.y, args.y, x);
        let a = Math.sin(ii / W * Math.PI);
        let y = (a * a) * args.H;
        let alpha = p.constrain(p.map(y, 0, 0.7, 50, 255), 0, 255);
        if(args.H == 0) alpha = 50;
        // alpha = 150;
        setColor(pg, "stroke", args.col, alpha);
        pg.vertex(X, y * hh + Y);
      }
      pg.endShape();
    }
  }
  function drawWeft(matrix, i, debug) {
    for(let j = 0; j < J; j++) {
      let dj = i % 2 == 0 ? 0 : 0.5;
      pg.push();
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
    drawWeft(this.matrix, i);
    pg.pop();
  }

  pg.push();
  pg.translate(0, 950);
  let line = 0;//159;
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
