function S017 (p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.colorScheme = new ColorScheme("ffba49-20a39e-ef5b5b-23001e-a4a9ad");
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;

  this.shape = p.createShape(p.GROUP);
  this.shapeBloom = p.createShape(p.GROUP);
  
  for(let i = 0; i < 500; i++) {
    let bloom = p.random(1.0) > 0.9;

    let v = p5.Vector.random2D();
    let idx = Math.floor(p.random(0, 5));
    let radius = Math.pow(2, (idx + p.random(1)) + 4);
    v.mult(radius);
    let w = Math.pow(2, idx + 2);
    let x = Math.floor(v.x / w) * w;
    // let y = Math.floor(v.y / w) * w;
    let y = -w / 2;
    let z = (Math.floor(v.y / w) + (Math.floor(v.x / w) % 2 == 0 ? 0.5 : 0)) * w;
    let s = p.createShape();
    s.beginShape(this.p.TRIANGLES);
    s.translate(0, -y, 0);
    s.rotateX(p.random(-0.2, 0.2));
    s.rotateZ(p.random(-0.2, 0.2));
    s.translate(0, y, 0);
    // this.shape.beginShape(this.p.QUADS);
    s.noStroke();
    // if(bloom) {
    //   s.fill(255);
    // }
    // else {
      s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    // }
    Polygons.Hexagon(s, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, -idx + 7));
    s.endShape(this.p.CLOSE);
    if(bloom) {
      this.shapeBloom.addChild(s);
    }
    else {
      this.shape.addChild(s);
    }
  }
}

S017.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      // pg.textureMode(p.NORMAL);
      // pg.texture(this.texture);

      if(!isShadow) {
        this.defaultShader.set("uMetallic", 0.9);
        this.defaultShader.set("uRoughness", 0.02);
        this.defaultShader.set("uSpecular", 0.9);
        // pg.shader(this.defaultShader);
      }

      pg.shape(this.shape, 0, 0);

      if(!isShadow) {
        this.defaultShader.set("uMetallic", EasingFunctions.easeInOutCubic(p.sin(p.millis() * 0.002) * 0.5 + 0.5) * 0.9);
        this.defaultShader.set("uRoughness", 0.01);
        this.defaultShader.set("uSpecular", 0.1);
        // pg.shader(this.defaultShader);
      }

      pg.shape(this.shapeBloom, 0, 0);

      pg.popMatrix();

      pg.fill(150);
      pg.pushMatrix();
      pg.translate(0, 40 + 40, 0);
      // pg.box(1000, 40, 1000);
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(100, -130, 100);
      // this.lightPos = this.cameraPosition;
      this.lightDirection = this.lightPos;//p.createVector(0, 1, 1);
      Object.getPrototypeOf(S017.prototype).draw(this);
    }
  }
});

S017.prototype.constructor = S017;

var s = function (p) {
  let s017 = new S017(p, 800, 800);
  let postProcess0 = new PostProcess(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s017.setup();
    postProcess0.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s017.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s017.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.resetShader();
    p.background(0);
    s017.draw(t);
    postProcess0.draw("bloom", s017.pg, {delta: 0.002, num: 6});
    p.tint(255);
    p.blendMode(p.BLEND);
    p.image(s017.pg, 0, 0);
    p.tint(128);
    p.blendMode(p.SCREEN);
    p.image(postProcess0.pg, 0, 0);
  }

  p.mousePressed = function () {
    p.saveFrame();
  }

  p.oscEvent = function(m) {
  }
};

var p017 = new p5(s);
