var colorScheme = new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function S047(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.moveStep = 4;
  this.timeStep = 0.5;
  this.gridTick = 100;
  this.init();

  this.shaderVignette = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");

  this.shapes = {};

  {
    s = p.createShape();
    this.drawPatternB(s, 1);
    this.shapes.ichimatsu = s;
  }
  {
    s = p.createShape();
    this.drawPatternA(s, 1);
    this.shapes.circle = s;
  }
}

S047.prototype = Object.create(TLayer.prototype);

S047.prototype.init = function() {
  let p = this.p;
  this.finishing = 0;
  this.patternParams = {
    nAlternate: Math.floor(p.random(0, 4) + 1)
  };
  this.pos = p.createVector(this.moveStep/2-1, this.moveStep/2);
  this.direction = p.createVector(0, 1);
  this.availableDirections = [
    p.createVector(-1,  0),
    p.createVector( 1,  0),
    p.createVector( 0, -1),
    p.createVector( 0,  1)
  ]
  this.moveCount = 0;
  // this.scale = 0.25;
  // this.scaleDest = 0.25;
  this.scale = 2;
  this.scaleDest = 2;

  this.matrix = [];
  for(let i = 0; i < 40; i++) {
    this.matrix[i] = [];
    for(let j = 0; j < 20; j++) {
      this.matrix[i][j] = {state: "wait", time: 0};
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
    let cycle = 4;
    if(this.moveCount % cycle <= cycle / 2 - 1 - 1) {
      this.direction = this.availableDirections[3];
    }
    else if(this.moveCount % cycle == cycle / 2 - 1) {
      this.direction = this.availableDirections[1];
    }
    else if(this.moveCount % cycle <= cycle - 1 - 1) {
      this.direction = this.availableDirections[2];
    }
    else {
      this.direction = this.availableDirections[1];
    }

    this.scale = this.scaleDest;
    this.scaleDest = 1 / (Math.max(this.pos.x, 5) / 20);
    
    if(this.finishing > 0) {
      this.scaleDest = this.scale;
      this.direction.set(0, 0);
      this.finishing++;
      if(this.finishing >= 4) {
        // ended
        this.init();
      }
    }
    else {
      if(this.pos.x + this.direction.x * this.moveStep > this.matrix[0].length) {
        this.finishing = 1;
        this.direction.set(-this.matrix[0].length / 2 / this.moveStep, -cycle / 2 / this.moveStep);
      }
    }
  }
  this.lastT = t;
}

S047.prototype.drawBar = function (pg, c0, alpha) {
  let p = this.p;
  pg.fill(70, 255);
  let L = 90;
  pg.vertex(-L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, L/2, 0.5, 0.5);
  pg.vertex(-L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, L/2, 0.5, 0.5);
  pg.vertex(-L/2, L/2, 0.5, 0.5);
  let a = EasingFunctions.easeInOutQuint(alpha);
  if(a > 1) a = 2 - a;
  let rate = a;
  let l = L * rate;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
  pg.vertex(-l/2, -L/2, 0.5, 0.5);
  pg.vertex(l/2, -L/2, 0.5, 0.5);
  pg.vertex(l/2, L/2, 0.5, 0.5);
  pg.vertex(-l/2, -L/2, 0.5, 0.5);
  pg.vertex(l/2, L/2, 0.5, 0.5);
  pg.vertex(-l/2, L/2, 0.5, 0.5);
}

S047.prototype.drawRing = function (pg, r0, r1, rate) {
  let p = this.p;
  let n = 20;
  for(let i = 0; i < n; i++) {
    let theta0, theta1, x, y;
    theta0 = i / n * Math.PI * 2.0 * rate + rate * Math.PI;
    theta1 = (i+1) / n * Math.PI * 2.0 * rate + rate * Math.PI;
    x = r0 * Math.sin(theta0);
    y = r0 * -Math.cos(theta0);
    pg.vertex(x, y, 1, 0.5);

    x = r0 * Math.sin(theta1);
    y = r0 * -Math.cos(theta1);
    pg.vertex(x, y, 1, 0.5);

    // x = r1 * Math.sin(theta1);
    // y = r1 * -Math.cos(theta1);
    // pg.vertex(x, y, 0.5, 0.5);

    // x = r1 * Math.sin(theta0);
    // y = r1 * -Math.cos(theta0);
    // pg.vertex(x, y, 0.5, 0.5);
    pg.vertex(0, 0, 0.5, 0.5); //TODO
  }
}

S047.prototype.drawCircle = function (pg, c0, alpha) {
  let p = this.p;
  let r0 = 45;
  let r1 = 0;
  let a = EasingFunctions.easeInOutQuint(alpha);
  if(a > 1) a = 2 - a;
  let rate = a;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
  this.drawRing(pg, r0, r1, rate);
}

S047.prototype.drawBase = function (pg, c0, tween) {
  let p = this.p;
  pg.fill(70, 255);
  let L = 90;
  pg.vertex(-L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, L/2, 0.5, 0.5);
  pg.vertex(-L/2, -L/2, 0.5, 0.5);
  pg.vertex(L/2, L/2, 0.5, 0.5);
  pg.vertex(-L/2, L/2, 0.5, 0.5);

  let l = EasingFunctions.easeInOutCubic(p.constrain(tween*2,0,1)) * L;

  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
  pg.vertex(-l/2, -L/2, 0, 0);
  pg.vertex(l/2, -L/2, 1, 0);
  pg.vertex(l/2, L/2, 1, 1);
  pg.vertex(-l/2, -L/2, 0, 0);
  pg.vertex(l/2, L/2, 1, 1);
  pg.vertex(-l/2, L/2, 0, 1);
}

S047.prototype.drawIchimatsu = function (pg, c0, tween) {
  let p = this.p;
  let L = 90;
  let l = EasingFunctions.easeInOutCubic(p.constrain(tween*2-1,0,1)) * L;

  c0+=1;
  pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 255);
  pg.vertex(-L/2, -L/2, 0.5, 0.5);
  pg.vertex(0, 0, 0.5, 0.5);
  pg.vertex(-L/2, -L/2+l, 0.5, 0.5);
  pg.vertex(L/2, -L/2, 0.5, 0.5);
  pg.vertex(0, 0, 0.5, 0.5);
  pg.vertex(L/2, -L/2+l, 0.5, 0.5);
}

S047.prototype.drawPatternA = function (pg, tween) {
  let p = this.p;
  if(pg == null) {
    return this.shapes.circle;
  }
  pg.beginShape(p.TRIANGLES);
  pg.noStroke();
  this.drawBar(pg, 1, tween);
  this.drawCircle(pg, 0, tween);
  pg.endShape();
}

S047.prototype.drawPatternB = function (pg, tween) {
  let p = this.p;
  if(pg == null) {
    return this.shapes.ichimatsu;
  }
  pg.beginShape(p.TRIANGLES);
  pg.noStroke();
  this.drawBase(pg, 0, tween);
  this.drawIchimatsu(pg, 0, tween);
  pg.endShape();
}

S047.prototype.drawPattern = function (pg, ix, iy, tween) {
  let n = this.patternParams.nAlternate;
  if((ix%(n*2)<n && iy%(n*2)<n) || (ix%(n*2)>=n && iy%(n*2)>=n)) {
    return this.drawPatternA(pg, tween);
  }
  else {
    return this.drawPatternB(pg, tween);
  }
}

S047.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * this.timeStep;
  let p = this.p;

  pg.shader(this.shaderVignette);
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
  pg.translate(absx + dx, absy + dy);
  pg.push();
  pg.scale(-1,-1)

  let fakedx = (p.map(t%1, 0.1, 0.9, 0, 1) * this.moveStep * this.direction.x) * this.gridTick;
  let fakedy = (p.map(t%1, 0.1, 0.9, 0, 1) * this.moveStep * this.direction.y) * this.gridTick;
  let fakecx = Math.floor((absx + fakedx) / this.gridTick);
  let fakecy = Math.floor((absy + fakedy) / this.gridTick);
  for(let i = 0; i < this.matrix.length; i++) {
    for(let j = 0; j < this.matrix[0].length; j++) {
      if(Math.abs(i-fakecy) <= this.moveStep/2 && Math.abs(j-fakecx) <= this.moveStep/2) {
        if(this.matrix[i][j].state == "wait") {
          this.matrix[i][j].time = t;
          this.matrix[i][j].state = "tweening";
        }
      }

      if(this.matrix[i][j].state == "tweening") {
        let tween = p.map(t - this.matrix[i][j].time, 0, 0.5, 0, 1);
        if(tween >= 1) {
          this.matrix[i][j].state = "done";
        }
      }

      if(this.matrix[i][j].state == "done") {
        pg.shape(this.drawPattern(null, j, i), j * this.gridTick, i * this.gridTick);
      }
    }
  }
  pg.pop();
  pg.translate(- cx, - cy);

  for(let i = -this.moveStep; i <= this.moveStep; i++) {
    for(let j = -this.moveStep; j <= this.moveStep; j++) {
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

      // if(Math.abs(sx - this.width / 2) < (this.width + this.gridTick) / 2
      // && Math.abs(sy - this.height / 2) < (this.height + this.gridTick) / 2) {
      if(true) {
        if(this.matrix[iy] != undefined && this.matrix[iy][ix] != undefined) {
          let tween = 0;

          if(this.matrix[iy][ix].state == "wait") tween = 0;
          else if(this.matrix[iy][ix].state == "tweening") {
            tween = p.map(t - this.matrix[iy][ix].time, 0, 0.5, 0, 1);
            this.drawPattern(pg, ix, iy, tween);
          }
          else {
            // already drawn
          }
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
  let s047 = new S047(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
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
