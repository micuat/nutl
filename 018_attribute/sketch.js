function S018 (p, w, h) {
  SRendererPbr.call(this, p, w, h);
  this.colorScheme = new ColorScheme("ffba49-20a39e-ef5b5b-23001e-a4a9ad");
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;

  this.shape = [];
  
  // for(let i = 0; i < 500; i++) {
  //   let v = p5.Vector.random2D();
  //   let idx = Math.floor(p.random(0, 5));
  //   let radius = Math.pow(2, (idx + p.random(1)) + 4);
  //   v.mult(radius);
  //   let w = Math.pow(2, idx + 2);
  //   let x = Math.floor(v.x / w) * w;
  //   // let y = Math.floor(v.y / w) * w;
  //   let y = -w / 2;
  //   let z = (Math.floor(v.y / w) + (Math.floor(v.x / w) % 2 == 0 ? 0.5 : 0)) * w;
  //   let s = p.createShape();
  //   s.beginShape(this.p.TRIANGLES);
  //   s.translate(0, -y, 0);
  //   s.rotateX(p.random(-0.2, 0.2));
  //   s.rotateZ(p.random(-0.2, 0.2));
  //   s.translate(0, y, 0);
  //   // this.shape.beginShape(this.p.QUADS);
  //   s.noStroke();
  //   s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
  //   s.attribNormal("aPbr", 0.9 - radius * 0.005, radius * 0.005 + 0.1, 0.1);
  //   Polygons.Hexagon(s, x, 50, z, w / Math.sqrt(3) * 0.9, Math.pow(2, -idx + 7));
  //   s.endShape(this.p.CLOSE);
  //   this.shape.push(s);
  // }
  let di = 2;
  for(let i = -200; i < 200; i+=di) {
    let s = p.createShape();
    s.beginShape(this.p.TRIANGLE_STRIP);
    s.noStroke();
    let idx = 1;
    s.fill(100);
    // s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
    for(let j = -200; j < 200; j+=di) {
      for(let ii = di; ii >= 0; ii-=di) {
        let n;
        n = p.noise((i+ii) * 0.05, j * 0.05);
        s.attribPosition("aPbr", n, 1.0-n, 0.1);
        s.vertex(j * 2, -n * 150, (i + ii * 0.5) * 2);

        let theta = p.map(i + ii * 0.5, -200, 200, -Math.PI, Math.PI);
        let phi = p.map(j, -200, 200, 0, Math.PI);
        let r = 100 + n * 100;
        let x0 = r * Math.sin(phi) * Math.cos(theta);
        let y0 = r * Math.sin(phi) * Math.sin(theta);
        let z0 = r * Math.cos(phi);
        s.attribPosition("tweened0", x0, y0, z0);
        r = 100;
        theta = p.map(i + ii * 1.0, -200, 200, -Math.PI, Math.PI);
        x0 = r * Math.sin(phi) * Math.cos(theta * 2.0) + ((i >= 0) ? 100 : -100);
        y0 = r * Math.sin(phi) * Math.sin(theta * 2.0);
        z0 = r * Math.cos(phi);
        s.attribPosition("tweened1", x0, y0, z0);
      }
    }
    s.endShape(this.p.CLOSE);
    this.shape.push(s);
  }
}

S018.prototype = Object.create(SRendererPbr.prototype, {
  drawScene: {
    value: function (pg) {
      let p = this.p;
      pg.clear();
      let idx = 0;
      // pg.background(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      pg.pushMatrix();

      for(let i in this.shape) {
        pg.shape(this.shape[i], 0, 0);
      }
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(100, -130, 100);
      // this.lightPos = this.cameraPosition;
      this.lightDirection = this.lightPos;//p.createVector(0, 1, 1);
      if(Math.sin(t) > 0) {
        this.defaultShader.set("tween0", EasingFunctions.easeInOutCubic(Math.sin(t)));
      }
      else {
        this.defaultShader.set("tween1", EasingFunctions.easeInOutCubic(-Math.sin(t)));
      }
      Object.getPrototypeOf(S018.prototype).draw(this);
    }
  }
});

S018.prototype.constructor = S018;

var s = function (p) {
  let s018 = new S018(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s018.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s018.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s018.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.resetShader();
    p.background(255);
    s018.draw(t);
    p.image(s018.pg, 0, 0);
  }

  p.mousePressed = function () {
    p.saveFrame();
  }

  p.oscEvent = function(m) {
  }
};

var p018 = new p5(s);
