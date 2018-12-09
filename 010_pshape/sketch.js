function S010 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("b3001b-262626-255c99-ccad8f-7ea3cc");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.1;
  this.aperture = 0.05;

  function Cube (shape, x0, y0, z0, x1, y1, z1, tx0, ty0, tx1, ty1) {
    // +Z "front" face
    shape.normal( 0,  0,  1);
    shape.vertex(x0, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z1, tx1, ty0);
    shape.vertex(x1, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z1, tx0, ty1);

    // -Z "back" face
    shape.normal( 0,  0, -1);
    shape.vertex(x1, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z0, tx1, ty0);
    shape.vertex(x0, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z0, tx0, ty1);

    // +Y "bottom" face
    shape.normal( 0,  1,  0);
    shape.vertex(x0, y1, z1, tx0, ty0);
    shape.vertex(x1, y1, z1, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);

    // -Y "top" face
    shape.normal( 0, -1,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y0, z1, tx1, ty1);
    shape.vertex(x0, y0, z1, tx0, ty1);

    // +X "right" face
    shape.normal( 1,  0,  0);
    shape.vertex(x1, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z1, tx0, ty1);

    // -X "left" face
    shape.normal(-1,  0,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z1, tx1, ty0);
    shape.vertex(x0, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);
  }
  this.shape = p.createShape();
  
  this.shape.beginShape(this.p.QUADS);
  this.shape.noStroke();
  // Cube(this.shape, -100, -100, -100, 100, 100, 100, 0, 0, 1, 1);
  for(let i = 0; i < 1000; i++) {
    let idx = Math.floor(p.random(0, 5));
    let w = Math.pow(2, idx + 2);
    let x = Math.floor(p.random(-400, 400) / w) * w;
    let y = Math.floor(p.random(-400, 400) / w) * w;
    let z = Math.floor(p.random(-400, 400) / w) * w;
    this.shape.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
  }
  this.shape.endShape();
}

S010.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.clear();

      pg.pushMatrix();
      pg.noStroke();

      if(isDepth == false) {
        pg.lights();
      }
      pg.rotateY(args.t * 0.2);
      pg.shape(this.shape, 0, 0);
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.cameraPosition = p.createVector(0.0, 0.0, 700.0);
      this.cameraTarget = p.createVector(0.0, 0.0, 0.0);
    
      let mid = p.map(Math.sin(t * 0.5), -1, 1, 200.0, 700.0);//this.cameraPosition.mag();
      this.minDepth = mid - 200.0;
      this.maxDepth = mid + 200.0;
      Object.getPrototypeOf(S010.prototype).draw(this, {t: t});
    }
  }
});

S010.prototype.constructor = S010;

var s = function (p) {
  let s010 = new S010(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s010.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s010.draw(t);
    p.image(s010.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p010 = new p5(s);
