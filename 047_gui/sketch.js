var colorScheme = new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function S047(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.moveStep = 10;
  this.timeStep = 2.5;
  this.gridTick = 100;
  this.init();
}

S047.prototype = Object.create(TLayer.prototype);

S047.prototype.init = function() {
  let p = this.p;
  this.pos = p.createVector(0, 5);
  this.direction = p.createVector(0, 1);
  this.availableDirections = [
    p.createVector(-1,  0),
    p.createVector( 1,  0),
    p.createVector( 0, -1),
    p.createVector( 0,  1)
  ]
  this.moveCount = 0;
  this.scale = 1;
  this.scaleDest = 1;

  // this.matrix = new Array(100, new Array(100));
  this.matrix = [];
  for(let i = 0; i < 50; i++) {
    this.matrix[i] = [];
    for(let j = 0; j < 50; j++) {
      this.matrix[i][j] = -1;
    }
  }
}

S047.prototype.update = function(args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    let pd = this.direction.copy();
    pd.mult(this.moveStep);
    this.pos.add(pd);
    print(this.pos)

    this.moveCount++;
    if(this.moveCount % 10 <= 3) {
      this.direction = this.availableDirections[3];
    }
    else if(this.moveCount % 10 == 4) {
      this.direction = this.availableDirections[1];
    }
    else if(this.moveCount % 10 <= 8) {
      this.direction = this.availableDirections[2];
    }
    else {
      this.direction = this.availableDirections[1];
    }
    // this.direction = p.random(this.availableDirections);

    this.scale = this.scaleDest;
    if(p.random(1) > 0.6) {
      this.scaleDest = p.random([1, 0.5]);
    }
    
    
    if(this.pos.x > this.matrix[0].length) {
      // ended
      this.init();
    }

  }
  this.lastT = t;
  // let tPhase = t - this.tBase;
}

S047.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  function tReturn(tMult, tOffset) {
    if(tOffset == undefined) tOffset = 0;
    let tt = (t * tMult - tOffset) % 2;
    if(tt > 1) tt = 2 - tt;
    return tt;
  }

  function drawBar(i, offset, alpha) {
    pg.noStroke();
    pg.fill(70, 255);
    let L = 90;
    pg.rect(-L/2, -L/2, L, L);
    let rate = EasingFunctions.easeInOutQuint(alpha);
    // let rate = EasingFunctions.easeInOutQuint(tReturn(0.5, offset));
    let l = L * rate;
    let c0 = i % 2 + 2;
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
    pg.rect(-l/2, -L/2, l, L);
  }

  function drawRing(r0, r1, rate) {
    let n = 20;
    pg.beginShape(p.QUADS);
    for(let i = 0; i < n; i++) {
      let theta0, theta1, x, y;
      theta0 = i / n * Math.PI * 2.0 * rate;
      theta1 = (i+1) / n * Math.PI * 2.0 * rate;
      x = r0 * Math.sin(theta0);
      y = r0 * -Math.cos(theta0);
      pg.vertex(x, y);

      x = r0 * Math.sin(theta1);
      y = r0 * -Math.cos(theta1);
      pg.vertex(x, y);

      x = r1 * Math.sin(theta1);
      y = r1 * -Math.cos(theta1);
      pg.vertex(x, y);

      x = r1 * Math.sin(theta0);
      y = r1 * -Math.cos(theta0);
      pg.vertex(x, y);
    }
    pg.endShape();
  }
  function drawCircle(i, offset, alpha) {
    let r0 = 45;
    let r1 = 0;
    pg.noStroke();
    pg.fill(100);
    // pg.ellipse(0, 0, r0, r0);
    //drawRing(r0, r1, 1);
    let c0 = i % 2;
    let a = p.map(EasingFunctions.easeInOutQuint(alpha), 0, 1, 0, 1 - offset);
    if(a > 1) a = 2 - a;
    let rate = a;
    // let rate = EasingFunctions.easeInOutQuint(tReturn(0.5, offset));
    pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
    pg.rotate(rate * Math.PI);
    drawRing(r0, r1, rate);
    // pg.ellipse(0, 0, r0, r0);
  }

  pg.clear();

  let c0 = 4;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 150);

  pg.translate(this.width / 2, this.height / 2);

  pg.pushMatrix();

  let scale = p.map(EasingFunctions.easeInOutCubic(t % 1), 0, 1, this.scale, this.scaleDest);

  let absx = this.pos.x * this.gridTick;
  let absy = this.pos.y * this.gridTick;

  let dx = (EasingFunctions.easeInOutCubic(t%1) * this.moveStep * this.direction.x) * this.gridTick;
  let dy = (EasingFunctions.easeInOutCubic(t%1) * this.moveStep * this.direction.y) * this.gridTick;

  // legal position that is closest to the center
  let cx = Math.floor((absx + dx) / this.gridTick) * this.gridTick;
  let cy = Math.floor((absy + dy) / this.gridTick) * this.gridTick;

  pg.scale(scale, scale);
  pg.translate(absx + dx - cx, absy + dy - cy);

  for(let i = -10; i <= 10; i++) {
    for(let j = -10; j <= 10; j++) {
      // real position
      let rx = cx - j * this.gridTick;
      let ry = cy - i * this.gridTick;

      // real id
      let ix = Math.floor(rx / this.gridTick);
      let iy = Math.floor(ry / this.gridTick);

      pg.pushMatrix();
      pg.translate(j * this.gridTick, i * this.gridTick);
      let sx = pg.screenX(0, 0);
      let sy = pg.screenY(0, 0);

      if(this.matrix[iy] != undefined && this.matrix[iy][ix] != undefined) {
        if(Math.abs(i) <= 5 && Math.abs(j) <= 5) {
          if(this.matrix[iy][ix] < 0) {
            this.matrix[iy][ix] = t; // init
          }
        }
      }

      if(Math.abs(sx - this.width / 2) < (this.width + this.gridTick) / 2
      && Math.abs(sy - this.height / 2) < (this.height + this.gridTick) / 2) {
        // let noise = p.osnoise.eval(ix* 0.2, iy * 0.2);
        let noise = (ix * 0.5 + iy * 0.5) % 1;
        if(this.matrix[iy] != undefined && this.matrix[iy][ix] != undefined) {
          let tween = Math.min(1, 1 * (t - this.matrix[iy][ix]));
          if(this.matrix[iy][ix] < 0) tween = 0;
          drawBar((1) % 4 + 1, 0.5-noise, tween);
          drawCircle((3) % 4 + 1, noise, tween);
        }
        // pg.text(ix + " " + iy, 0, 0);
      }

      pg.popMatrix();
    }
  }

  pg.popMatrix();
}

S047.prototype.constructor = S047;

////////

var s = function (p) {
  let s047 = new S047(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s047.draw({t: t});
    p.background(0);
    p.image(s047.pg, 0, 0);
  }
};

var p047 = new p5(s);
