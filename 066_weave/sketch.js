var colorSchemes = [new ColorScheme("4effef-564787-c7b8ea-d8a7ca-dbcbd8")];
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function S066(p, w, h) {
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
  this.calcDone = false;
  let self = this;
  var Thread = Java.type('java.lang.Thread');
  new Thread(function () {
    for(let i = 0; i < self.I + 1; i++) { // oh...
      self.matrix[i] = [];
      for(let j = 0; j < self.J; j++) {
        let dj = i % 2 == 0 ? 0 : 0.5;
        let x = (j+dj) * self.W;
        let y = i * self.H;

        let H = 0;
        let col = 0;//i % 4;
        H = 0.25;
        self.matrix[i][j] = {H: H, col: col, x: x, y: y, j: j, i: i, cut: false};
      }
    }
    let prevOne = undefined;
    for(let i = 0; i < self.I + 1; i++) { // oh...
      function assign(self, i, j) {
        if(prevOne == undefined) {
          prevOne = self.matrix[i][j];
        }
        else {
          self.matrix[i][j].prev = prevOne;
          prevOne = self.matrix[i][j];
        }
        if(prevOne.prev != undefined) {
          prevOne.prev.next = prevOne;
        }
      }
      if(i % 2 == 1) {
        for(let j = 0; j < self.J; j++) {
          assign(self, i, j);
        }
      }
      else {
        for(let j = self.J - 1; j >= 0; j--) {
          assign(self, i, j);
        }
      }
    }
    prevOne = self.matrix[0][0];
    do {
      let j = prevOne.j;
      let i = prevOne.i;
      let dj = i % 2 == 0 ? 0 : 0.5;
      let b = p.brightness(self.image.get((j+dj)/(self.J+1)*self.image.width/1.5, i/self.I*self.image.height/1.5)) / 255;
      if(b > 0.5) {
        self.matrix[i][j].cut = true;
        let h = 0;
        for(let n = 0; n < 100; n++) {
          let b = p.brightness(self.image.get(
            (j+dj)/(self.J+1)*self.image.width/1.5,
            (i+n)/self.I*self.image.height/1.5
          )) / 255;
          if(b > 0.5) h+=0.1;
          else break;
        }
        self.matrix[i][j].H = Math.max(2, h);
        let bl = p.brightness(self.image.get((j+dj-1)/(self.J+1)*self.image.width/1.5, i/self.I*self.image.height/1.5)) / 255;
        if(bl < 0.5) {
          let prev = self.matrix[i][j];
          do {
            prev.col = 3;
            prev = prev.prev;
          } while(prev != undefined && prev.cut != true);
        }
        let br = p.brightness(self.image.get((j+dj+1)/(self.J+1)*self.image.width/1.5, i/self.I*self.image.height/1.5)) / 255;
        if(br < 0.5) {
          let prev = self.matrix[i][j];
          do {
            prev.col = 1;
            prev = prev.prev;
          } while(prev != undefined && prev.cut != true);
        }
      }
      prevOne = prevOne.next;
    } while(prevOne != undefined);
    self.calcDone = true;
  }).start();
}

S066.prototype = Object.create(TLayer.prototype);

S066.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S066.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  // setColor(pg, "background", 3);
  pg.background(255);

  pg.translate(280, 0);

  pg.pushMatrix();

  let W = this.W;
  let H = this.H;
  let J = this.J;
  let hh = this.hh;
  pg.strokeWeight(2);
  pg.noFill();

  pg.translate(30, 0);
  function drawCurve(args, overrideAlpha) {
    setColor(pg, "stroke", args.col, 150);
    if(args.prev != undefined && args.cut == false) {
      pg.beginShape();
      for(let ii = 0; ii <= W; ii++) {
        let x = ii/W;//Math.sin(ii / W * Math.PI) * 0.5 + 0.5;
        let X = p.lerp(args.prev.x, args.x, x);
        let Y = 0;//p.lerp(args.prev.y, args.y, x);
        let a = Math.sin(ii / W * Math.PI);
        let y = (a * a) * args.H;
        let alpha = p.constrain(p.map(y, 0, 0.7, 50, 255), 0, 255);
        if(args.H == 0) alpha = 50;
        // alpha = 150;
        setColor(pg, "stroke", args.col, alpha * overrideAlpha);
        pg.vertex(X, y * hh + Y);
      }
      pg.endShape();
    }

    if(args.prev != undefined && args.cut) {
      pg.beginShape();
      for(let ii = 0; ii <= W/4; ii++) {
        let x = ii/W;//Math.sin(ii / W * Math.PI) * 0.5 + 0.5;
        let X = p.lerp(args.prev.x, args.x, x);
        let Y = 0;//p.lerp(args.prev.y, args.y, x);
        let a = Math.sin(ii / W * Math.PI);
        let y = (a * a) * args.H;
        let alpha = p.constrain(p.map(y, 0, 0.7, 50, 255), 0, 255);
        if(args.H == 0) alpha = 50;
        // alpha = 150;
        setColor(pg, "stroke", args.col, alpha * overrideAlpha);
        pg.vertex(X, y * hh + Y);
      }
      pg.endShape();

      pg.beginShape();
      for(let ii = W*0.75; ii <= W; ii++) {
        let x = ii/W;//Math.sin(ii / W * Math.PI) * 0.5 + 0.5;
        let X = p.lerp(args.prev.x, args.x, x);
        let Y = 0;//p.lerp(args.prev.y, args.y, x);
        let a = Math.sin(ii / W * Math.PI);
        let y = (a * a) * args.H;
        let alpha = p.constrain(p.map(y, 0, 0.7, 50, 255), 0, 255);
        if(args.H == 0) alpha = 50;
        // alpha = 150;
        setColor(pg, "stroke", args.next.col, alpha * overrideAlpha);
        pg.vertex(X, y * hh + Y);
      }
      pg.endShape();
    }
  }
  function drawWeft(matrix, i, overrideAlpha, debug) {
    for(let j = 0; j < J; j++) {
      let dj = i % 2 == 0 ? 0 : 0.5;
      pg.push();
      drawCurve(matrix[i][j], overrideAlpha);

      if(debug) {
        pg.fill(0)
        pg.text((j+1)+"", matrix[i][j].x + W/4, 0);
        pg.text((J-j)+"", matrix[i][j].x + W/4, -10);
      }
      pg.pop();
    }
  }
  for(let i = 0; i < this.I; i++) {
    pg.push();
    pg.translate(0, this.matrix[i][0].y);
    drawWeft(this.matrix, i, 0.3);
    pg.pop();
  }

  pg.push();
  pg.translate(0, 950);
  // let line = Math.floor(p.map(p.mouseX, 0, p.width, 0, 159));//159;
  let line = 10;
  drawWeft(this.matrix, line, 1, true);
  pg.translate(0, 200);
  drawWeft(this.matrix, line+1, 1, true);
  pg.pop();

  pg.popMatrix();
}

S066.prototype.constructor = S066;

////////

var s = function (p) {
  let s066 = new S066(p, 1500, 1500);

  p.setup = function () {
    p.createCanvas(1500, 1500);
    p.frameRate(60);
    let t = p.millis() * 0.001;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    if(s066.calcDone == true) {
      s066.draw({t: t});
      s066.calcDone = false;
    }
    // s066.draw({t: t});
    p.image(s066.pg, 0, 0);
  }
};

var p066 = new p5(s);
