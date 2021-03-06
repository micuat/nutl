var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function SDisplay(p, w, h) {
  TLayer.call(this, p, w, h);
  this.lastT = 0;
  this.tBase = 0;
}

SDisplay.prototype = Object.create(TLayer.prototype);
SDisplay.prototype.constructor = SDisplay;

SDisplay.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
  }
  this.lastT = t;
}

SDisplay.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  let c0 = this.c;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  // pg.background((t % 1) * 255);
  // pg.background(0);

  pg.translate(this.width / 2, this.height / 2 / 2);
  c0 = 4;
  pg.noStroke();
  // pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.fill(255);

  // pg.beginShape(p.LINE_STRIP);
  for(let i = -20; i <= 20; i++) {
    // let env = Math.cos(i / 40 * Math.PI);
    // pg.vertex(i * 20, 100 * Math.sin(i * Math.PI / 40 * 16 + EasingFunctions.easeInOutQuad(t%1) * Math.PI * 8) * env);
    let x = 150 * Math.cos(2 * i / 20 * Math.PI + t * Math.PI);
    let y = 150 * Math.sin(i / 20 * Math.PI + (t + this.phase) * Math.PI);
    pg.circle(x, y, 10);
  }

  pg.fill(255);
  pg.rect(0, this.height/2, 0, this.height/2);

  // pg.endShape();

  tReturn = function () {
    return 1 - Math.abs(t % 2 - 1);
  }
}

////////

function SLorenz(p, w, h) {
  TLayer.call(this, p, w, h);
  this.x = 0.01;
  this.y = 0;
  this.z = 0;
  
  this.a = 10;
  this.b = 28;
  this.c = 8.0 / 3.0;
  
  this.points = new Array();
}

SLorenz.prototype = Object.create(TLayer.prototype);
SLorenz.prototype.constructor = SLorenz;

SLorenz.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  let dt = 0.01;
  let dx = (this.a * (this.y - this.x)) * dt;
  let dy = (this.x * (this.b - this.z) - this.y) * dt;
  let dz = (this.x * this.y - this.c * this.z) * dt;
  this.x += dx;
  this.y += dy;
  this.z += dz;

  this.points.push(new p5.Vector(this.x, this.y, this.z));
  if(this.points.length > 500) {
    this.points.shift();
  }
}

SLorenz.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.colorMode(p.HSB);

  pg.background(0);

  pg.translate(0, 0, -80);
  pg.translate(this.width/2, this.height/2/2);
  pg.scale(5);
  pg.stroke(255);
  pg.noFill();
  pg.rotateY(t * 0.25 * Math.PI);

  let hu = 0;
  pg.beginShape();

  for (let i in this.points) {
    let v = this.points[i];
    pg.stroke(hu, 255, 255);
    pg.vertex(v.x, v.y, v.z);

    hu += 1;
    if (hu > 255) {
      hu = 0;
    }
  }
  pg.endShape();
}

////////

function Drop(p) {
  this.x = p.random(800);
  this.y = p.random(-500, -50);
  this.z = p.random(0, 20);
  this.len = p.map(this.z, 0, 20, 10, 20);
  this.yspeed = p.map(this.z, 0, 20, 1, 20);

  this.fall = function() {
    this.y = this.y + this.yspeed;
    var grav = p.map(this.z, 0, 20, 0, 0.2);
    this.yspeed = this.yspeed + grav;

    if (this.y > 400) {
      this.y = p.random(-200, -100);
      this.yspeed = p.map(this.z, 0, 20, 4, 10);
    }
  }

  this.show = function(pg) {
    var thick = p.map(this.z, 0, 20, 1, 3);
    pg.strokeWeight(thick);
    pg.stroke(138, 43, 226);
    pg.line(this.x, this.y, this.x, this.y+this.len);
  }
}

function SPurpleRain(p, w, h) {
  TLayer.call(this, p, w, h);
  this.drops = [];
  for (let i = 0; i < 200; i++) {
    this.drops[i] = new Drop(p);
  }
}

SPurpleRain.prototype = Object.create(TLayer.prototype);
SPurpleRain.prototype.constructor = SPurpleRain;

SPurpleRain.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

SPurpleRain.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.background(230, 230, 250);
  for (let i in this.drops) {
    this.drops[i].fall();
    this.drops[i].show(pg);
  }
}

////////

function Star(p) {
  let w = h = 800;
  this.x = p.random(-w, w);
  this.y = p.random(-h, h);
  this.z = p.random(w);
  this.pz = this.z;

  this.update = function(speed) {
    this.z = this.z - speed;
    if (this.z < 1) {
      this.z = w;
      this.x = p.random(-w, w);
      this.y = p.random(-h, h);
      this.pz = this.z;
    }
  }

  this.show = function(pg) {
    pg.fill(255);
    pg.noStroke();

    let sx = p.map(this.x / this.z, 0, 1, 0, w);
    let sy = p.map(this.y / this.z, 0, 1, 0, h);

    let r = p.map(this.z, 0, p.width, 16, 0);
    pg.ellipse(sx, sy, r, r);

    let px = p.map(this.x / this.pz, 0, 1, 0, w);
    let py = p.map(this.y / this.pz, 0, 1, 0, h);

    this.pz = this.z;

    pg.stroke(255);
    pg.line(px, py, sx, sy);
  }
}

function SStarField(p, w, h) {
  TLayer.call(this, p, w, h);
  this.stars = [];
  for (let i = 0; i < 200; i++) {
    this.stars[i] = new Star(p);
  }
}

SStarField.prototype = Object.create(TLayer.prototype);
SStarField.prototype.constructor = SStarField;

SStarField.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

SStarField.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  let speed = 25;
  pg.background(0);
  pg.translate(this.width / 2, this.height / 4);
  for (let i in this.stars) {
    this.stars[i].update(speed);
    this.stars[i].show(pg);
  }
}

////////

function SCamera(p, w, h) {
  TLayer.call(this, p, w, h);
  this.lastT = 0;
}

SCamera.prototype = Object.create(TLayer.prototype);
SCamera.prototype.constructor = SCamera;

SCamera.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

SCamera.prototype.drawLayer = function(pg, key, args) {
  let t = args.t * 0.25;
  let p = this.p;
  if(true||Math.floor(t) - Math.floor(this.lastT) > 0) {
    pg.clear();
    if(this.resultPg != undefined) {
      pg.image(this.resultPg, 0, 0);
    }
  }

  this.lastT = t;
}

function S051 (p, w, h, texes) {
  this.texes = texes;
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.1;
  this.uRoughness = 0.8;
  this.uSpecular = 0.01;
  this.uExposure = 4.0;
  this.uVignette = 0.7;
  this.uLightRadius = 1000.0;
  // this.uGamma = 0.6;

  this.shape = p.createShape(p.GROUP);
  this.displays = p.createShape(p.GROUP);
  for(let i = -2; i <= 2; i++) {
    for(let j = -2; j <= 2; j++) {
      let h = p.random([0, 100, 200]);
      if(h == 0) continue;
      let s = p.createShape(p.BOX, 10, h, 10);
      s.translate(j * 100, -h/2, i * 100);
      s.disableStyle();
      this.shape.addChild(s);
    }
  }

  // wall
  let dw = 47.5;
  let dh = 47.5;
  let rate = 0.1;
  for(let i = -1.5; i <= 2; i++) {
    for(let j = -1; j <= 1; j++) {
      if(Math.random() > 0.5) {
        let h = 100;
        let s = p.createShape(p.BOX, 5, h, 100);
        s.translate(j * 100, -h/2, i * 100);
        s.disableStyle();
        this.shape.addChild(s);
        if(Math.random() > rate) {
          s = p.createShape();
          s.beginShape(p.TRIANGLE_STRIP);
          s.noStroke();
          s.textureMode(p.NORMAL);
          s.texture(p.random(this.texes).pg);
          s.vertex(-dw, -dh, 0, 0);
          s.vertex(-dw, dh, 0, 1);
          s.vertex(dw, -dh, 1, 0);
          s.vertex(dw, dh, 1, 1);
          s.endShape();
          s.rotateY(Math.PI / 2);
          s.translate(j * 100 - 2.51, -h/2, i * 100);
          this.displays.addChild(s);
        }

        if(Math.random() > rate) {
          s = p.createShape();
          s.beginShape(p.TRIANGLE_STRIP);
          s.noStroke();
          s.textureMode(p.NORMAL);
          s.texture(p.random(this.texes).pg);
          s.vertex(-dw, -dh, 0, 0);
          s.vertex(-dw, dh, 0, 1);
          s.vertex(dw, -dh, 1, 0);
          s.vertex(dw, dh, 1, 1);
          s.endShape();
          s.rotateY(-Math.PI / 2);
          s.translate(j * 100 + 2.51, -h/2, i * 100);
          this.displays.addChild(s);
        }
      }
    }
  }
  for(let i = -1; i <= 1; i++) {
    for(let j = -1.5; j <= 2; j++) {
      if(Math.random() > 0.5) {
        let h = 100;
        let s = p.createShape(p.BOX, 100, h, 5);
        s.translate(j * 100, -h/2, i * 100);
        s.disableStyle();
        this.shape.addChild(s);

        if(Math.random() > rate) {
          s = p.createShape();
          s.beginShape(p.TRIANGLE_STRIP);
          s.noStroke();
          s.textureMode(p.NORMAL);
          s.texture(p.random(this.texes).pg);
          s.vertex(-dw, -dh, 0, 0);
          s.vertex(-dw, dh, 0, 1);
          s.vertex(dw, -dh, 1, 0);
          s.vertex(dw, dh, 1, 1);
          s.endShape();
          s.translate(j * 100, -h/2, i * 100 - 2.51);
          this.displays.addChild(s);
        }

        if(Math.random() > rate) {
          s = p.createShape();
          s.beginShape(p.TRIANGLE_STRIP);
          s.noStroke();
          s.textureMode(p.NORMAL);
          s.texture(p.random(this.texes).pg);
          s.vertex(-dw, -dh, 0, 0);
          s.vertex(-dw, dh, 0, 1);
          s.vertex(dw, -dh, 1, 0);
          s.vertex(dw, dh, 1, 1);
          s.endShape();
          s.rotateY(Math.PI);
          s.translate(j * 100, -h/2, i * 100 + 2.51);
          this.displays.addChild(s);
        }
      }
    }
  }

  // ceiling / floor
  for(let i = -3.5; i <= 4; i++) {
    for(let j = -3.5; j <= 4; j++) {
      let h = 10;
      if(Math.abs(i) < 2 && Math.abs(j) < 2) {
        let s = p.createShape(p.BOX, 100, h, 100);
        s.translate(j * 100, -h/2 - 100, i * 100);
        s.disableStyle();
        this.shape.addChild(s);
      }

      {
        let s = p.createShape(p.BOX, 100, h, 100);
        s.translate(j * 100, h/2, i * 100);
        s.disableStyle();
        this.shape.addChild(s);
      }
    }
  }
  this.shape.disableStyle();
}

S051.prototype = Object.create(SRendererShadow.prototype);

S051.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();
  let c0 = 0;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.noStroke();
  pg.fill(255);
  this.defaultShader.set("uUseTexture", 0);
  pg.shape(this.shape, 0, 0);
  if(!isShadow) {
    this.defaultShader.set("uUseTexture", 1);
  }
  // pg.texture(this.tex);
  // pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
  pg.shape(this.displays, 0, 0);
}

S051.prototype.draw = function (args) {
  let p = this.p;
  Object.getPrototypeOf(S051.prototype).draw.call(this);
}

S051.prototype.constructor = S051;

////////

var s = function (p) {
  // let tex0 = new SDisplay(p, 800, 800);
  // tex0.c = 4;
  // tex0.phase = 0;
  let texes = [];
  texes.push(new SStarField(p, 800, 1600));
  texes.push(new SLorenz(p, 800, 800));
  texes.push(new SPurpleRain(p, 800, 800));
  texes.push(new SCamera(p, 800, 1600));
  let s051 = new S051(p, 800, 800, texes);
  // let s051 = new S051(p, 800, 800, [tex0.pg]);
  // let s051 = new S051(p, 1920, 1080, [tex0.pg, tex1.pg, tex2.pg]);


  p.setup = function () {
    p.createCanvas(800, 800);
    // p.createCanvas(1920, 1080);
    p.frameRate(60);
    // tex.draw({t: 0});
    s051.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * -0.05;
    s051.cameraPosition.set(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
    // s051.cameraPosition.set(100, -50, 100);
    s051.lightPos.set(200, -20, 50);
    s051.lightDirection = s051.lightPos;
    s051.draw({t: t});
    texes[3].resultPg = s051.pg;
    for(let i in texes) {
      texes[i].draw({t: t});
    }

    p.background(0);
    angle = t * 0.1;
    s051.cameraPosition.set(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
    s051.lightPos.set(s051.cameraPosition.x, s051.cameraPosition.y, s051.cameraPosition.z);
    s051.lightDirection = s051.lightPos;
    s051.draw({t: t});
    p.image(s051.pg, 0, 0);
  }
};

var p051 = new p5(s);
