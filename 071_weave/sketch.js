// var colorSchemes = [new ColorScheme("ff0000-00bb00-ffff00-0000ff-dbcbd8")];
var colorSchemes = [new ColorScheme("acf39d-e85f5c-9cfffa-a5ffd6-ffffff")];
// var colorSchemes = [new ColorScheme("4effef-564787-c7b8ea-d8a7ca-dbcbd8")];
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function S071(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  p.noiseSeed(0);

  this.W = 40;
  this.H = 3.2;
  this.J = 22;
  this.hh = 60;
  this.I = 240;

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
        let col = 0;
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
    function getB(j, i) {
      return p.brightness(self.image.get(j/(self.J+1)*self.image.width/1.75, 80+i/self.I*self.image.height/1.75)) / 255;
    }
    do {
      let j = prevOne.j;
      let i = prevOne.i;
      let dj = i % 2 == 0 ? 0 : 0.5;
      let b = getB(j+dj, i);
      if(b > 0.5) {
        let h = 0;
        for(let n = 0; n < 100; n++) {
          let b = getB(j+dj, i+n);
          if(b > 0.5) h+=0.1;
          else break;
        }
        if(h > 4) {
          self.matrix[i][j].col = Math.floor(h*4) % 5;
          self.matrix[i][j].cut = true;
          self.matrix[i][j].H = 4;//Math.max(2, h);
          let bl = getB(j+dj-1, i);
          if(bl < 0.5) {
            let prev = self.matrix[i][j];
            do {
              prev.col = 2;
              prev = prev.prev;
            } while(prev != undefined && prev.cut != true);
          }
          let br = getB(j+dj+1, i);
          if(br < 0.5) {
            let prev = self.matrix[i][j];
            do {
              prev.col = 1;
              prev = prev.prev;
            } while(prev != undefined && prev.cut != true);
          }
        }
      }
      prevOne = prevOne.next;
    } while(prevOne != undefined);
    self.calcDone = true;
  }).start();
}

S071.prototype = Object.create(TLayer.prototype);

S071.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S071.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  // setColor(pg, "background", 3);
  pg.background(255);

  pg.translate(130, -100);
  // pg.translate(0, 300);

  pg.pushMatrix();

  let W = this.W;
  let H = this.H;
  let J = this.J;
  let hh = this.hh;
  pg.strokeWeight(1);
  pg.noFill();

  // pg.translate(p.width/2, p.height/2);
  // pg.rotateY(p.map(p.mouseX, 0, p.width, -Math.PI * 0.5, Math.PI * 0.5));
  // pg.rotateX(p.map(p.mouseY, 0, p.height, Math.PI * 0.5, -Math.PI * 0.5));
  // pg.translate(-p.width/2, -p.height/2);
  pg.translate(30, 0);
  function drawVertex(ii, args, debug) {
    let x = ii/W;
    let X = p.lerp(args.prev.x, args.x, x);
    let Y = 0;
    let a = Math.sin(ii / W * Math.PI);
    let y = (a)*(debug?1:a) * args.H;
    pg.vertex(X, y * hh + Y, Math.sqrt(a) * args.H * 20 * (debug?0:1));
  }
  function drawCurve(args, overrideAlpha, debug) {
    setColor(pg, "stroke", args.col, 150);
    if(args.prev != undefined && args.cut == false) {
      pg.beginShape();
      for(let ii = 0; ii <= W; ii++) {
        setColor(pg, "stroke", args.col, 255 * overrideAlpha);
        drawVertex(ii, args, debug);
      }
      pg.endShape();
    }

    if(args.prev != undefined && args.cut) {
      pg.beginShape();
      for(let ii = 0; ii <= W/4; ii++) {
        setColor(pg, "stroke", args.col, 255 * overrideAlpha);
        drawVertex(ii, args, debug);
      }
      pg.endShape();

      pg.beginShape();
      for(let ii = W*0.75; ii <= W; ii++) {
        setColor(pg, "stroke", args.next.col, 255 * overrideAlpha);
        drawVertex(ii, args, debug);
      }
      pg.endShape();
    }
  }
  function drawWeft(matrix, i, overrideAlpha, debug) {
    for(let j = 0; j < J; j++) {
      let dj = i % 2 == 0 ? 0 : 0.5;
      pg.push();
      drawCurve(matrix[i][j], overrideAlpha, debug);

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
    drawWeft(this.matrix, i, 1);
    pg.pop();
  }

  pg.strokeWeight(2);

  pg.push();
  pg.translate(0, 750);
  pg.translate(0, 250);
  // let line = Math.floor(p.map(p.mouseX, 0, p.width, 0, 159));//159;
  let line = 139;
  drawWeft(this.matrix, line, 1, true);
  pg.translate(0, 200);
  drawWeft(this.matrix, line+1, 1, true);
  pg.pop();

  pg.popMatrix();
}

S071.prototype.constructor = S071;

////////

var s = function (p) {
  let width = 1200;
  let height = 1400;
  let s071 = new S071(p, width, height);

  p.setup = function () {
    p.createCanvas(width, height);
    p.frameRate(60);
    let t = p.millis() * 0.001;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    if(s071.calcDone == true) {
      s071.draw({t: t});
      s071.calcDone = false;
    }
    // s071.draw({t: t});
    p.image(s071.pg, 0, 0);
  }
};

var p071 = new p5(s);
