function SObject (p) {
  this.p = p;
  this.doFadeIn = false;
  this.fadeIn = 0.0;
  this.doFadeOut = false;
  this.fadeOut = 0.0;
  this.fadeSpeed = 1.0;
  this.tLastUpdate = 0.0;
}

SObject.prototype.setup = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
}

SObject.prototype.in = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  that.doFadeIn = true;
  that.doFadeOut = false;
  that.fadeIn = 0.0;
  that.fadeOut = 0.0;
}

SObject.prototype.out = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  that.doFadeIn = false;
  that.doFadeOut = true;
  that.fadeIn = 1.0;
  that.fadeOut = 0.0;
}

SObject.prototype.update = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  let t = p.millis() * 0.001;
  let tDiff = t - that.tLastUpdate;
  if(that.doFadeIn) {
    that.fadeIn += tDiff * that.fadeSpeed;
    if(that.fadeIn > 1.0) that.fadeIn = 1.0;
  }
  if(that.doFadeOut) {
    that.fadeOut += tDiff * that.fadeSpeed;
    if(that.fadeOut > 1.0) that.fadeOut = 1.0;
  }
  that.tLastUpdate = t;
}

SObject.prototype.draw = function (that, pg) {
  if(that == undefined) that = this;
  let p = that.p;
}

function SBox (p) {
  SObject.call(this, p);
}

SBox.prototype = Object.create(SObject.prototype, {
  draw: {
    value: function (pg) {
      let p = this.p;
      let scale = 100 * EasingFunctions.easeInOutCubic(this.fadeIn * (1.0 - this.fadeOut));
      pg.box(scale);
      Object.getPrototypeOf(SBox.prototype).draw(this);
    }
  }
});

SBox.prototype.constructor = SBox;

function SSphere (p) {
  SObject.call(this, p);
  this.shape = p.createShape(p.GROUP);
  let n = 128;
  let r = 100;
  for(let i = -n; i <= n; i++) {
    let s = p.createShape();
    s.beginShape(this.p.TRIANGLE_STRIP);
    s.noStroke();
    s.fill(255);
    for(let j = -n; j <= n; j++) {
      for(let ii = 1; ii >= 0; ii--) {
        let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
        let phi = p.map(j, -n, n, 0, Math.PI);
        let x0 = r * Math.sin(phi) * Math.cos(theta);
        let y0 = r * Math.sin(phi) * Math.sin(theta);
        let z0 = r * Math.cos(phi);
        s.normal(x0, y0, z0);
        s.vertex(x0, y0, z0, phi / Math.PI, (theta / Math.PI) * 0.5 + 0.5);
      }
    }
    s.endShape(this.p.CLOSE);
    this.shape.addChild(s);
  }
}

SSphere.prototype = Object.create(SObject.prototype, {
  draw: {
    value: function (pg) {
      let p = this.p;
      let scale = EasingFunctions.easeInOutCubic(this.fadeIn * (1.0 - this.fadeOut));
      pg.pushMatrix();
      pg.scale(scale, scale, scale);
      pg.shape(this.shape, 0, 0);
      pg.popMatrix();
      Object.getPrototypeOf(SSphere.prototype).draw(this);
    }
  }
});

SSphere.prototype.constructor = SSphere;

function SWeirdSphere (p) {
  SObject.call(this, p);
  this.shape = p.createShape(p.GROUP);
  let n = 16;
  let r = 100;
  for(let i = -n; i <= n; i++) {
    let s = p.createShape();
    s.beginShape(this.p.TRIANGLE_STRIP);
    s.noStroke();
    s.fill(255);
    for(let j = -n; j <= n; j++) {
      for(let ii = 1; ii >= 0; ii--) {
        let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
        let phi = p.map(j, -n, n, 0, Math.PI);
        let x0 = r * Math.sin(phi) * Math.cos(theta);
        let y0 = r * Math.sin(phi) * Math.sin(theta);
        let z0 = r * Math.cos(phi);
        // s.normal(x0, y0, z0);
        s.vertex(x0, y0, z0, phi / Math.PI, (theta / Math.PI) * 0.5 + 0.5);
        theta = p.map(i + ii * 0.5, -n, n, -Math.PI, Math.PI);
        x0 = 0.9*r * Math.sin(phi) * Math.cos(theta * 2.0);// + ((i >= 0) ? 100 : -100);
        y0 = 0.9*r * Math.sin(phi) * Math.sin(theta * 2.0);
        z0 = 0.9*r * Math.cos(phi);
        // s.normal(x0, y0, z0);
        s.vertex(x0, y0, z0, phi / Math.PI, (theta / Math.PI) * 0.5 + 0.5);
      }
    }
    s.endShape(this.p.CLOSE);
    this.shape.addChild(s);
  }
}

SWeirdSphere.prototype = Object.create(SObject.prototype, {
  draw: {
    value: function (pg) {
      let p = this.p;
      let scale = EasingFunctions.easeInOutCubic(this.fadeIn * (1.0 - this.fadeOut));
      pg.pushMatrix();
      pg.scale(scale, scale, scale);
      pg.shape(this.shape, 0, 0);
      pg.popMatrix();
      Object.getPrototypeOf(SWeirdSphere.prototype).draw(this);
    }
  }
});

SWeirdSphere.prototype.constructor = SWeirdSphere;

function S020 (p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.colorScheme = new ColorScheme("8a6552-462521-ca2e55-dde0b5-bdb246");
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;
  this.uVignette = 1.0;

  let box = new SWeirdSphere(p);
  box.fadeSpeed = 2.0;
  let sphere = new SSphere(p);
  sphere.fadeSpeed = 2.0;
  this.shapes = [];
  this.shapes.push(box);
  this.shapes.push(sphere);
  this.shape = this.shapes[0];
}

S020.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      for(let i in this.shapes) {
        this.shapes[i].draw(pg);
      }
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(100, -130, 100);
      this.lightDirection = this.lightPos;
      if(p.frameCount % 60 == 0) {
        this.shape = p.random(this.shapes);
        this.shape.in();
      }
      if(p.frameCount % 60 == 30) {
        this.shape.out();
      }
      for(let i in this.shapes) {
        this.shapes[i].update();
      }
      Object.getPrototypeOf(S020.prototype).draw(this);
    }
  }
});

S020.prototype.constructor = S020;

var s = function (p) {
  let s020 = new S020(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s020.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s020.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s020.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.resetShader();
    p.background(0);
    s020.draw(t);
    p.tint(255);
    p.blendMode(p.BLEND);
    p.image(s020.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p020 = new p5(s);
