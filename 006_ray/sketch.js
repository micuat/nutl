function S006 (p) {
  SRendererShadow.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
}

S006.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (canvas, isShadow) {
      let p = this.p;
      canvas.pushMatrix();

      canvas.pushMatrix();
      canvas.translate(0, -20, 0);

      for(let i = -3; i <= 3; i++) {
        for(let j = -3; j <= 3; j++) {
          let idx = Math.floor(p.map(i, -3, 3, 0, 4));
          canvas.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
          canvas.pushMatrix();
          canvas.translate(i * 60, 0, j * 60);
          canvas.rotateX(this.angle + p.millis() * 0.0006 + i * 0.2);
          canvas.rotateY(p.millis() * 0.0006 + j * 0.2);
          canvas.box(30, 3, 30);
          canvas.popMatrix();
        }
      }
      canvas.popMatrix();

      canvas.fill(250, 250, 250);
      canvas.box(6600, 5, 6600);
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
      Object.getPrototypeOf(S006.prototype).draw(this);
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

S006.prototype.constructor = S006;

function S006a (p) {
  SRenderer.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
  this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
  this.angle = 0;
}

S006a.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      if (p.frameCount % 60 == 0) {
        this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
      }
  
      p.background(0);
  
      this.shader.set("iTime", t);
  
      let x = Math.cos(this.angle) * 3.0;
      let y = 3.0;
      let z = Math.sin(this.angle) * 3.0;
      this.shader.set("cameraPosition", x, y, z);

      this.angle += 0.025;
      p.filter(this.shader);
    }
  }
});

S006a.prototype.constructor = S006a;

var s = function (p) {
  let s006 = new S006(p);
  let s006a = new S006a(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s006.setup();
    s006a.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(t % 4 < 2) {
      s006a.draw(t);
      p.image(s006a.pg, 0, 0);
    }
    else {
      s006.draw(t);
      p.image(s006.pg, 0, 0);
    }
  }

  p.oscEvent = function(m) {
    // s006.oscEvent(m);
  }
};

var p006 = new p5(s);
