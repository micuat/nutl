function S016 (p) {
  SRendererGlow.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("5e2bff-c04cfd-fc6dab-f7f6c5-f3fae1");
  this.minDepth = -0.0;
  this.maxDepth = 255.0;
  this.maxBlur = 0.05;
  this.aperture = 0.01;
  this.focus = 1.0;
  this.blurIteration = 2;

  this.shapes = [];
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      let idx = (i + j + 22) % 5;
      let s = p.createShape();
      s.beginShape(p.TRIANGLES);
      s.translate((i + (j % 2) * 0.5) * 30, 50, j * 30);
      s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, 255);
      s.noStroke();
      Polygons.Hexagon(s, 0, 0, 0, 10, 100);
      s.endShape();
      s.disableStyle();
      this.shapes.push(s);
    }
  }

  this.freqs = [];
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      this.freqs.push(p.random(0.1, 1));
    }
  }
}

S016.prototype = Object.create(SRendererGlow.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let t = args.t;
      let p = this.p;
      pg.clear();
      if (isDepth != true)
        pg.lights();
      pg.pushMatrix();
      pg.noStroke();

      for(let i in this.shapes) {
        let idx = i % 5;
        let s = this.shapes[i];
        let glow = p.map(Math.sin(t * this.freqs[i] * Math.PI), -1, 1, 0, 1);
        pg.fill(this.colorScheme.get(idx).r * glow, this.colorScheme.get(idx).g * glow, this.colorScheme.get(idx).b * glow);
        pg.shape(this.shapes[i], 0, 0);
      }
    
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let mid = 110;
      this.minDepth = mid - 100.0;
      this.maxDepth = mid + 100.0;
      Object.getPrototypeOf(S016.prototype).draw(this, {t: t});
    }
  }
});

S016.prototype.constructor = S016;

var s = function (p) {
  let s016 = new S016(p);
  let postProcess0 = new PostProcess(p);
  let postProcess1 = new PostProcess(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s016.setup();
    postProcess0.setup();
    postProcess1.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s016.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s016.cameraTarget = p.createVector(0.0, 0.0, 0.0);
    s016.draw(t);
    postProcess0.draw("bloom", s016.pg, {delta: 0.001, num: 4});
    postProcess1.draw("rgbshift", postProcess0.pg, {
      delta: 40.0
    });
    p.background(0, 255, 0);
    p.image(postProcess1.pg, 0, 0);
  }

};

var p016 = new p5(s);
