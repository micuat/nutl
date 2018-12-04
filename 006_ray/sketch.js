function S006PBR (p) {
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

S006PBR.prototype = Object.create(SRendererShadow.prototype, {
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

          ct.beginDraw();
          ct.background(100);
          ct.noStroke();
          ct.fill(255);
          // ct.rect(0, p.map(t % 2, 0, 2, -200, 400), 200, 200);
          // ct.rect(200, p.map((t + 1) % 2, 0, 2, 400, -200), 200, 200);
          ct.rect(0, 0, 400, 400 * i / 7.0);

          ct.translate(0, 400);
          ct.fill(128, 128, 255);
          ct.rect(0, 0, 400, 400);
          ct.fill(128, 20, 255);
          for(let j = 0; j < 10 - i; j++) {
            ct.rect(j * 40, 0, 10, 400);
          }
          ct.endDraw();
        }
      }

      for(let i = -3; i <= 3; i++) {
        canvas.textureMode(p.NORMAL);
        for(let j = -3; j <= 3; j++) {
          let idx = Math.floor(p.map(i, -3, 3, 0, 4));
          canvas.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
          canvas.pushMatrix();
          canvas.translate(i * 60, 0, j * 60);
          canvas.rotateX(this.angle + p.millis() * 0.0006 + i * 0.2);
          canvas.rotateY(p.millis() * 0.0006 + j * 0.2);
          // canvas.box(w, 3, w);

          canvas.beginShape();
          //this.defaultShader.set("colorTexture", this.colorTextures[i + 3]);
          // this.defaultShader.set("normalTexture", this.normalTextures[i + 3]);
          canvas.texture(this.colorTextures[i + 3]);
          canvas.normal(0, -1, 0)
          canvas.vertex(-w/2, -1.5, -w/2, 0, 0);
          canvas.vertex(w/2, -1.5, -w/2, 1, 0);
          canvas.vertex(w/2, -1.5, w/2, 1, 1);
          canvas.vertex(-w/2, -1.5, w/2, 0, 1);
          canvas.endShape();

          canvas.beginShape();
          //this.defaultShader.set("colorTexture", this.colorTextures[i + 3]);
          // this.defaultShader.set("normalTexture", this.normalTextures[i + 3]);
          canvas.texture(this.colorTextures[i + 3]);
          canvas.normal(0, 1, 0)
          canvas.vertex(-w/2, 1.5, -w/2, 0, 0);
          canvas.vertex(w/2, 1.5, -w/2, 1, 0);
          canvas.vertex(w/2, 1.5, w/2, 1, 1);
          canvas.vertex(-w/2, 1.5, w/2, 0, 1);
          canvas.endShape();

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
      Object.getPrototypeOf(S006PBR.prototype).draw(this);
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

S006PBR.prototype.constructor = S006PBR;

function S006Ray (p) {
  SRenderer.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
  this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
  this.angle = 0;
}

S006Ray.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      if (p.frameCount % 60 == 0) {
        // this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
      }
  
      p.background(0);
  
      this.shader.set("iTime", t);

      let r = p.map(t % 2, 0, 2, 1.0, 0.0);
      r = Math.sqrt(r) * 3.0;
      let x = Math.cos(this.angle) * r;
      let y = r;
      let z = Math.sin(this.angle) * r;
      this.shader.set("cameraPosition", x, y, z);
      if(r > 2) r = p.map(r, 3, 2, 5, 0);
      else r = 0.0;
      let tx = 0.0;//Math.cos(this.angle) * r;
      let ty = r;
      let tz = 0.0;//Math.sin(this.angle) * r;
      this.shader.set("cameraTarget", tx, ty, tz);

      this.angle += 0.025;
      p.filter(this.shader);
    }
  }
});

S006Ray.prototype.constructor = S006Ray;

var s = function (p) {
  let s006PBR = new S006PBR(p);
  let s006Ray = new S006Ray(p);

  let pg = p.createGraphics(400, 400, p.P3D);
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s006PBR.setup();
    s006Ray.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    // s006Ray.draw(t);
    if(false && t % 4 < 2) {
      s006Ray.draw(t);
      p.image(s006Ray.pg, 0, 0);
    }
    else {
      s006PBR.draw(t);
      p.image(s006PBR.pg, 0, 0);
    }

    pg.beginDraw();
    pg.background(255, 0, 0);
    pg.endDraw();
  }

  p.oscEvent = function(m) {
  }
};

var p006 = new p5(s);
