function S011 (p) {
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
    let v = p5.Vector.random3D();
    v.mult(350);
    let x = Math.floor(v.x / w) * w;
    let y = Math.floor(v.y / w) * w;
    let z = Math.floor(v.z / w) * w;
    this.shape.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    Cube(this.shape, x - w/2, y - w/2, z - w/2, x + w/2, y + w/2, z + w/2, 0, 0, 1, 1);
  }
  this.shape.endShape();

  this.cubeprop = {
    x: {cur: 0, target: 0, start: 0},
    z: {cur: 0, target: 0, start: 0},
    rotX: {cur: 0, target: 0, start: 0},
    rotY: {cur: 0, target: 0, start: 0},
    rotZ: {cur: 0, target: 0, start: 0},
    sx: {cur: 1, target: 1, start: 1},
    sy: {cur: 1, target: 1, start: 1}
  }
}

S011.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.clear();

      pg.pushMatrix();

      // pg.rotateY(args.t * 0.2);
      pg.shape(this.shape, 0, 0);

      pg.noStroke();
      let idx = 0;
      pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      pg.translate(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur);
      pg.rotateX(Math.PI * 0.5 * this.cubeprop.rotX.cur);
      pg.rotateY(Math.PI * 0.5 * this.cubeprop.rotY.cur);
      pg.rotateZ(Math.PI * 0.5 * this.cubeprop.rotZ.cur);
      pg.box(40 * this.cubeprop.sx.cur, 40 * this.cubeprop.sy.cur, 40);

      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let angle = t * 0.2;
      this.cameraPosition = p.createVector(300.0 * Math.cos(angle), 0.0, 300.0 * Math.sin(angle));
      this.cameraTarget = p.createVector(0.0, 0.0, 0.0);

      if(p.frameCount % 30 == 0) {
        for(let key in this.cubeprop) {
          this.cubeprop[key].start = this.cubeprop[key].target;
        }
        let key = p.random(Object.keys(this.cubeprop));
        this.cubeprop[key].target = Math.floor(p.random(1, 4));
      }
      let ease = EasingFunctions.easeInOutQuad((p.frameCount % 30) / 30.0);
      for(let key in this.cubeprop) {
        this.cubeprop[key].cur = p.lerp(this.cubeprop[key].start, this.cubeprop[key].target, ease);
      }

      let v = this.cameraPosition.copy();
      v.sub(p.createVector(40 * this.cubeprop.x.cur, 0, 40 * this.cubeprop.z.cur));
      let mid = v.mag() - 20;
      this.minDepth = mid - 300.0;
      this.maxDepth = mid + 300.0;

      Object.getPrototypeOf(S011.prototype).draw(this, {t: t});
    }
  }
});

S011.prototype.constructor = S011;

var s = function (p) {
  let s011 = new S011(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s011.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s011.draw(t);
    p.image(s011.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p011 = new p5(s);
