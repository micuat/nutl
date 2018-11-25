function S001 (p) {
  SRendererShadow.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("26547c-ef476f-ffd166-06d6a0-fffcf9");
}

S001.prototype = Object.create(SRendererShadow.prototype, {
  renderLandscape: {
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
          canvas.rotateX(this.angle + p.millis() * 0.0001 + i * 0.2);
          canvas.rotateY(p.millis() * 0.0001 + j * 0.2);
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
      Object.getPrototypeOf(S001.prototype).draw(this);
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

S001.prototype.constructor = S001;

var s = function (p) {
  let s001 = new S001(p);
  let postProcess0 = new PostProcess(p);
  let postProcess1 = new PostProcess(p);
  let postProcess2 = new PostProcess(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s001.setup();
  }

  p.draw = function () {
    s001.draw();

    // postProcess.draw("bloom", s001.pg, {delta: 0.001, num: 5});
    // postProcess.draw("invert", s001.pg, {delta: 1.0});
    // postProcess.draw("kaleid", s001.pg, {delta: 1.0});
    // postProcess.draw("mpeg", s001.pg, {time: p.millis() * 0.001});
    // postProcess.draw("pixelate", s001.pg, {delta: 1.0});
    // postProcess.draw("rgbshift", s001.pg, {delta: 100.0});
    // postProcess.draw("slide", s001.pg, {delta: 0.01, time: p.millis() * 0.001});

    postProcess0.draw("bloom", s001.pg, {delta: 0.002, num: 2});
    postProcess1.draw("rgbshift", postProcess0.pg, {
      delta: 300 * p.constrain(-Math.sin(p.millis() * 0.001) * 1 - 0.5, 0, 1)
    });
    postProcess2.draw("slide", postProcess1.pg, {
      delta: p.constrain(Math.sin(p.millis() * 0.001) * 0.1 - 0.08, 0, 1),
      time: p.millis() * 0.001
    });

    p.image(postProcess2.pg, 0, 0);
  }

  p.oscEvent = function(m) {
    s001.oscEvent(m);
  }
};

var p001 = new p5(s);