function S007PBR (p) {
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
}

S007PBR.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (canvas, isShadow) {
      let p = this.p;
      let t = p.millis() * 0.001;
      canvas.background(0);
      canvas.pushMatrix();

      canvas.pushMatrix();
      canvas.translate(0, -20, 0);

      let w = p.map(t % 2, 0, 2, 0, 2);
      if(w > 1) w = 2 - w;
      w = 40;

      if(isShadow == false) {
        for(let i = 0; i < this.colorTextures.length; i++) {
          let ct = this.colorTextures[i];

          let idx = Math.floor(p.map(i, -3, 3, 0, 4));
          ct.beginDraw();
          ct.background(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
          ct.noStroke();
          ct.fill(255);
          // ct.rect(0, 0, 400, 400 * i / 7.0);

          ct.translate(0, 400);
          ct.fill(128, 128, 255);
          ct.rect(0, 0, 400, 400);
          ct.fill(128, 20, 255);
          // for(let j = 0; j < 10 - i; j++) {
          //   ct.rect(j * 40, 0, 10, 400);
          // }
          if(this.rayPg != undefined) {
            ct.image(this.rayPg, 0, 0, 400, 400);
          }
          ct.endDraw();
        }
      }

      for(let i = -3; i <= 3; i++) {
        for(let j = -3; j <= 3; j++) {
          canvas.pushMatrix();
          canvas.translate(i * 60, 0, j * 60);
          canvas.rotateX(this.angle + p.millis() * 0.0007 + i * 0.2);
          canvas.rotateY(p.millis() * 0.0007 + j * 0.2);
          // canvas.box(w, 3, w);

          canvas.scale(w * 0.5, w * 0.5, w * 0.5);
          let x0 = p.map(j - 0.5, -3.5, 3.5, 0, 1);
          let y0 = p.map(i - 0.5, -3.5, 3.5, 0, 1);
          let x1 = p.map(j + 0.5, -3.5, 3.5, 0, 1);
          let y1 = p.map(i + 0.5, -3.5, 3.5, 0, 1);
          this.TexturedCube(canvas, this.colorTextures[i + 3], x0, y0, x1, y1);

          canvas.popMatrix();
        }
      }

      canvas.popMatrix();

      canvas.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      this.angle += this.angleVel;
      this.angleVel = Math.max(this.angleVel * 0.95, 0);
      var camAngle = p.frameCount * 0.002;
      var lightAngle = Math.PI / -4;
      this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      this.lightDirection = p.createVector(0, 0, 1);
      this.cameraPosition.set(400 * Math.cos(camAngle), 100 * Math.sin(p.frameCount * 0.01) - 200, 400 * Math.sin(camAngle));
      this.cameraTarget.set(0, 0, 0);
      Object.getPrototypeOf(S007PBR.prototype).draw(this);
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

S007PBR.prototype.constructor = S007PBR;

function S007Ray (p) {
  SRenderer.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
  this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
  this.angle = 0;
}

S007Ray.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      if (p.frameCount % 60 == 0) {
        // this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
      }
  
      let pg = this.pg;

      p.background(0);
  
      this.shader.set("iTime", t);

      let r = p.map(t % 2, 0, 2, 1.0, 0.0);
      r = 2.5;
      let x = Math.cos(this.angle) * r;
      let y = r;
      let z = Math.sin(this.angle) * r;
      this.shader.set("cameraPosition", x, y, z);
      let tx = 0.0;//Math.cos(this.angle) * r;
      let ty = 0.0;
      let tz = 0.0;//Math.sin(this.angle) * r;
      this.shader.set("cameraTarget", tx, ty, tz);

      this.angle += 0.025;

      pg.filter(this.shader);
    }
  }
});

S007Ray.prototype.constructor = S007Ray;

var s = function (p) {
  let s007PBR = new S007PBR(p);
  let s007Ray = new S007Ray(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s007PBR.setup();
    s007Ray.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s007Ray.draw(t);

    s007PBR.rayPg = s007Ray.pg;
    s007PBR.draw(t);
    p.image(s007PBR.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p007 = new p5(s);
