function S002 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.5;
  this.aperture = 0.05;
}

S002.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let t = args.t;
      let p = this.p;
      pg.background(30);
      if (isDepth != true)
        pg.lights();
      pg.pushMatrix();
      pg.noStroke();
      pg.fill(250);
      pg.rotateX(Math.PI * 0.3);
      pg.rotateZ(Math.PI * 0.2);
    
      for (let i = -10; i <= 10; i++) {
        pg.pushMatrix();
        pg.translate(i * 20, 0, 0);
        let idx = (i + 22) % 5;
        pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
        for (let j = -10; j <= 10; j++) {
          let z = p.map(Math.sin(t * (i * 0.5 + 0.5) + j * 0.5), -1, 1, -50, 50);
          pg.pushMatrix();
          pg.translate(-5, j * 40, z);
          pg.box(15, 15, 15);
          pg.popMatrix();
        }
        pg.popMatrix();
      }
      pg.popMatrix();
      pg.translate(0, 0, -1000);
      pg.box(3000, 3000, 1);
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let mid = 110;
      this.minDepth = mid - 100.0;
      this.maxDepth = mid + 100.0;
      Object.getPrototypeOf(S002.prototype).draw(this, {t: t});
    }
  }
});

S002.prototype.constructor = S002;

var s = function (p) {
  let s002 = new S002(p);
  let postProcess0 = new PostProcess(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s002.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s002.draw(t);
    postProcess0.draw("slide", s002.pg, {
      delta: p.constrain(Math.sin(p.millis() * 0.001) * 0.1 - 0.08, 0, 1),
      time: p.millis() * 0.001
    });
 
    p.image(postProcess0.pg, 0, 0);
  }

};

var p061 = new p5(s);
