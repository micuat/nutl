function S009PBR (p) {
  SRendererShadow.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("efbdeb-b68cb8-6461a0-314cb6-0a81d1");
  this.colorTextures = [];
  this.normalTextures = [];
  for(let i = 0; i < 7; i++) {
    this.colorTextures.push(p.createGraphics(400, 800, p.P3D));
    this.normalTextures.push(p.createGraphics(400, 400, p.P3D));
  }
  this.cameraPositionTo = this.cameraPosition.copy();
}

S009PBR.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      let t = p.millis() * 0.001;
      pg.clear();
      pg.pushMatrix();

      pg.pushMatrix();
      pg.translate(0, -20, 0);

      let w = p.map(t % 2, 0, 2, 0, 2);
      if(w > 1) w = 2 - w;
      w = 40;

      if(isShadow == false) {
        for(let i = 0; i < this.colorTextures.length; i++) {
          let ct = this.colorTextures[i];

          let idx = Math.floor(p.map(i, -3, 3, 0, 4));
          ct.beginDraw();
          ct.fill(200, 150, 100);
          // ct.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
          ct.noStroke();
          ct.rect(0, 0, 400, 400);

          ct.translate(0, 400);
          ct.fill(128, 128, 255);
          ct.rect(0, 0, 400, 400);
          ct.fill(128, 60, 255);
          for(let j = 0; j < 10 - i; j++) {
            ct.rect(0, j * 40, 400, 10);
          }
          if(this.rayPg != undefined) {
            ct.image(this.ray.pg, 0, 0, 400, 400);
          }
          ct.endDraw();
        }
      }

      for(let i = -3; i <= 3; i++) {
        pg.pushMatrix();
        pg.translate(i * 100, 0, 0);

        pg.textureMode(this.p.NORMAL);
        pg.fill(255);
        pg.beginShape(p.TRIANGLE_STRIP);
        pg.texture(this.colorTextures[i + 3]);
        for(let j = -60; j <= 60; j++) {
          let z = 50 + p.sin(p.frameCount / 30.0 + j * 0.3 + i * 2.0) * 50;
          let w = 15;
          // pg.normal(1, 0, 0);
          pg.vertex(-w, z, j * 60, p.map(j, -10, 10, 0, 1), 0);
          pg.vertex(w, z, j * 60, p.map(j, -10, 10, 0, 1), 1);
        }
        pg.endShape();
        pg.popMatrix();
      }

      pg.popMatrix();

      pg.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;

      if(p.frameCount % 60 == 0) {
        this.cameraPositionTo = p5.Vector.random3D();
        this.cameraPositionTo.mult(500);
        this.cameraPositionTo.y = -Math.abs(this.cameraPositionTo.y) - 50;
      }
      this.angle += this.angleVel;
      this.angleVel = Math.max(this.angleVel * 0.95, 0);
      var camAngle = p.frameCount * 0.002;
      var lightAngle = Math.PI / -4;
      this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      this.lightDirection = p.createVector(0, 0, 1);
      // this.cameraPosition.set(400 * Math.cos(camAngle), 100 * Math.sin(p.frameCount * 0.01) - 200, 400 * Math.sin(camAngle));
      this.cameraPosition.lerp(this.cameraPositionTo, 0.1);
      this.cameraTarget.set(0, 0, 0);
      Object.getPrototypeOf(S009PBR.prototype).draw(this);
    }
  },
  TexturedCube: {
    value: function (pg, tex, x0, y0, x1, y1) {
      pg.textureMode(this.p.NORMAL);

      // +Z "front" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal( 0,  0,  1);
      pg.vertex(-1, -1,  1, x0, y0);
      pg.vertex( 1, -1,  1, x1, y0);
      pg.vertex( 1,  1,  1, x1, y1);
      pg.vertex(-1,  1,  1, x0, y1);
      pg.endShape();

      // -Z "back" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal( 0,  0, -1);
      pg.vertex( 1, -1, -1, x0, y0);
      pg.vertex(-1, -1, -1, x1, y0);
      pg.vertex(-1,  1, -1, x1, y1);
      pg.vertex( 1,  1, -1, x0, y1);
      pg.endShape();

      // +Y "bottom" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal( 0,  1,  0);
      pg.vertex(-1,  1,  1, x0, y0);
      pg.vertex( 1,  1,  1, x1, y0);
      pg.vertex( 1,  1, -1, x1, y1);
      pg.vertex(-1,  1, -1, x0, y1);
      pg.endShape();

      // -Y "top" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal( 0, -1,  0);
      pg.vertex(-1, -1, -1, x0, y0);
      pg.vertex( 1, -1, -1, x1, y0);
      pg.vertex( 1, -1,  1, x1, y1);
      pg.vertex(-1, -1,  1, x0, y1);
      pg.endShape();

      // +X "right" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal( 1,  0,  0);
      pg.vertex( 1, -1,  1, x0, y0);
      pg.vertex( 1, -1, -1, x1, y0);
      pg.vertex( 1,  1, -1, x1, y1);
      pg.vertex( 1,  1,  1, x0, y1);
      pg.endShape();

      // -X "left" face
      pg.beginShape(this.p.QUADS);
      pg.texture(tex);
      pg.normal(-1,  0,  0);
      pg.vertex(-1, -1, -1, x0, y0);
      pg.vertex(-1, -1,  1, x1, y0);
      pg.vertex(-1,  1,  1, x1, y1);
      pg.vertex(-1,  1, -1, x0, y1);
      pg.endShape();
    }
  },
  oscEvent: {
    value: function (m) {
      let p = this.p;
      let path = m.addrPattern().split("/");
      if (path.length >= 3 && path[1] == "sc3p5") {
        this.angleVel += 0.1;
      }
    }
  }
});

S009PBR.prototype.constructor = S009PBR;

function S009Ray (p) {
  SRenderer.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
  this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
  this.angle = 0;
}

S009Ray.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      if (p.frameCount % 60 == 0) {
        // this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
      }
  
      let pg = this.pg;

      p.background(0);
  
      this.shader.set("iTime", t);

      this.cameraPosition = this.pbr.cameraPosition.copy();
      this.cameraTarget = this.pbr.cameraTarget.copy();

      this.cameraPosition.mult(0.01);
      this.cameraPosition.y *= -1;
      this.cameraTarget.mult(0.01);
      this.cameraTarget.y *= -1;

      this.shader.set("cameraPosition", this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
      this.shader.set("cameraTarget", this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);

      this.angle += 0.025;

      pg.filter(this.shader);
    }
  }
});

S009Ray.prototype.constructor = S009Ray;

var s = function (p) {
  let s009PBR = new S009PBR(p);
  let s009Ray = new S009Ray(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s009PBR.setup();
    s009Ray.setup();
    s009PBR.ray = s009Ray;
    s009Ray.pbr = s009PBR;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s009PBR.draw(t);
    s009Ray.draw(t);
    p.image(s009Ray.pg, 0, 0);
    p.image(s009PBR.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p009 = new p5(s);
