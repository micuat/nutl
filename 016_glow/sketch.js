function S016 (p) {
  SRendererGlow.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.015;
  this.aperture = 0.01;
  this.blurIteration = 4;
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
      pg.fill(250);
      pg.rotateX(Math.PI * 0.3);
      pg.rotateZ(Math.PI * 0.2);
    
      for (let i = -5; i <= 5; i++) {
        pg.pushMatrix();
        pg.translate(i * 20, 0, 0);
        let idx = (i + 22) % 4;
        for (let j = -5; j <= 5; j++) {
          let z = 0;//p.map(Math.sin(t * (i * 0.5 + 0.5) + j * 0.5), -1, 1, -50, 50);
          pg.pushMatrix();
          pg.translate(-5, j * 40, z);
          let r = 5 * p.sin(t * Math.PI * 4 + i * 0.5) * p.sin(t * 0.5);
          if(j < r) {
            if(isDepth) {
              pg.fill(255);
            }
            else {
              pg.fill(255, 0, 0);
            }
            pg.sphere(15 * 0.5 * Math.min(r - j, 1.0));
          }

          if(isDepth) {
            pg.fill(0);
          }
          else {
            // pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
            pg.fill(100);
          }
          pg.translate(0, 0, -10);
          pg.box(5, 5, 100);
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
      Object.getPrototypeOf(S016.prototype).draw(this, {t: t});
    }
  }
});

S016.prototype.constructor = S016;

var s = function (p) {
  let s016 = new S016(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s016.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s016.draw(t);
    p.background(0, 255, 0);
    p.image(s016.pg, 0, 0);
  }

};

var p016 = new p5(s);
