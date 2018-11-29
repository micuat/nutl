function S005 (p) {
  SRendererShadow.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("eac435-345995-03cea4-fb4d3d-ca1551");

  this.pixels = [];
  let w = 40;
  for(let i = -5; i <= 5; i++) {
    for(let j = -5; j <= 5; j++) {
      if(Math.abs(j) + Math.abs(i) < 3) continue;
      let idx = Math.floor(p.random(7));
      this.pixels.push({idx: idx, x: i * w, y: j * w, z: 0, w: w, h: w, d: 3});
    }
  }
}

S005.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (canvas, isShadow) {
      let p = this.p;
      canvas.pushMatrix();

      canvas.pushMatrix();
      canvas.translate(0, 0, -20);

      for(let i in this.pixels) {
        let pix = this.pixels[i];
        if(pix.idx >= 5) continue;
        canvas.fill(this.colorScheme.get(pix.idx).r, this.colorScheme.get(pix.idx).g, this.colorScheme.get(pix.idx).b);
        canvas.pushMatrix();
        canvas.translate(pix.x, pix.y, pix.z);
        canvas.box(pix.w, pix.h, pix.d);
        canvas.popMatrix();
      }
      canvas.popMatrix();

      canvas.translate(0, 0, 20);
      canvas.fill(100);
      canvas.box(6600, 6600, 5);
      canvas.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      this.angle += this.angleVel;
      this.angleVel = Math.max(this.angleVel * 0.95, 0);
      this.lightPos.set(0, 0, -100);
      this.lightDirection = p.createVector(0, 0, 1);
      this.cameraPosition.set(0, 0, -400);
      this.cameraTarget.set(0, 0, 0);
      this.uLightRadius = 400.0;
      this.uMetallic = 0.1;
      this.uSpecular = 0.3;
      this.uLightColor = {r: 0.5, g: 0.5, b: 0.5};

      for(let i in this.pixels) {
        let pix = this.pixels[i];
        if(p.random(1) > 0.99) {
          // pix.idx = Math.floor(p.random(7));
        }
      }
      Object.getPrototypeOf(S005.prototype).draw(this);
    }
  },
  oscEvent: {
    value: function (m) {
      let p = this.p;
      let path = m.addrPattern().split("/");
      if (path.length >= 3 && path[1] == "sc3p5") {
        let pix = p.random(this.pixels);
        pix.idx = Math.floor(p.random(7));
      }
    }
  }
});

S005.prototype.constructor = S005;

var s = function (p) {
  let s005 = new S005(p);
  let postProcess0 = new PostProcess(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s005.setup();
  }

  p.draw = function () {
    s005.draw();

    postProcess0.draw("bloom", s005.pg, {delta: 0.001, num: 4});

    p.image(postProcess0.pg, 0, 0);
  }

  p.oscEvent = function(m) {
    s005.oscEvent(m);
  }
};

var p005 = new p5(s);