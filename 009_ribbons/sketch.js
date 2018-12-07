function SRendererDof(p, w, h) {
  SRenderer.call(this, p);
  this.cameraPosition = p.createVector(0.0, 0.0, 200.0);
  this.cameraTarget = p.createVector(0.0, 0.0, 0.0);

  this.minDepth = 0.0;
  this.maxDepth = 255.0;
  this.focus = 0.5;
  this.maxBlur = 0.05;
  this.aperture = 0.1;

  this.src = p.createGraphics(w, h, p.P3D);
  this.dest = p.createGraphics(w, h, p.P3D);
  this.dest2 = p.createGraphics(w, h, p.P3D);
  this.depth = p.createGraphics(w, h, p.P3D);
  this.depth.smooth(8);

  this.defaultShader = p.loadShader("shaders/dof/default.frag", "shaders/dof/default.vert");
  this.depthShader = p.loadShader("shaders/dof/depthfrag.glsl",
      "shaders/dof/depthvert.glsl");
      this.depthShader.set("minDepth", this.minDepth);
      this.depthShader.set("maxDepth", this.maxDepth);

  this.dof = p.loadShader("shaders/dof/dof.glsl");
  this.dof.set("aspect", parseFloat(p.width) / p.height);

  this.src.shader(this.defaultShader);
  this.depth.shader(this.depthShader);
}

SRendererDof.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (that, args) {
      if(that == undefined) that = this;
      let p = that.p;
      p.background(0);

      that.src.beginDraw();
      that.defaultShader.set("vLightPosition", 0, -100, -100);
      that.defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
      that.defaultShader.set("uMetallic", 0.4);
      that.defaultShader.set("uRoughness", 0.3);
      that.defaultShader.set("uSpecular", 0.99);
      that.defaultShader.set("uLightRadius", 500.0);
      that.defaultShader.set("uExposure", 3.0);
      that.defaultShader.set("uGamma", 0.8);
      let viewMatrix = new Packages.processing.core.PMatrix3D(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );
      viewMatrix.translate(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z);
      that.defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
        viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
        viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
        viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
        viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
      ));
      that.src.camera(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z, that.cameraTarget.x, that.cameraTarget.y, that.cameraTarget.z, 0, 1, 0);
      that.drawScene(that.src, args, false);
      that.src.endDraw();
      that.depth.beginDraw();
      that.depth.camera(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z, that.cameraTarget.x, that.cameraTarget.y, that.cameraTarget.z, 0, 1, 0);
      that.drawScene(that.depth, args, true);
      that.depth.endDraw();

      that.depthShader.set("minDepth", that.minDepth);
      that.depthShader.set("maxDepth", that.maxDepth); 
      
      that.dest.beginDraw();
      that.dof.set("tDepth", that.depth);
      that.dest.shader(that.dof);

      that.dof.set("maxBlur", that.maxBlur);
      that.dof.set("focus", that.focus);
      that.dof.set("aperture", that.aperture);

      that.dest.image(that.src, 0, 0);
      that.dest.endDraw();

      for(let i = 0; i < 2; i++) {
        that.dest2.beginDraw();
        that.dof.set("tDepth", that.depth);
        that.dest2.shader(that.dof);
    
        that.dof.set("maxBlur", that.maxBlur);
        that.dof.set("focus", that.focus);
        that.dof.set("aperture", that.aperture);
    
        that.dest2.image(that.dest, 0, 0);
        that.dest2.endDraw();
        
        let destTemp = that.dest;
        that.dest = that.dest2;
        that.dest2 = destTemp;
      }
      that.pg = that.dest2;
    }
  },
  drawScene: {
    value: function (that, pg, args, isDepth) {
      if(that == undefined) that = this;
    }
  }
});

SRendererDof.prototype.constructor = SRendererDof;

function S009PBR (p) {
  SRendererDof.call(this, p, 800, 800);
  this.angleVel = 0;
  this.angle = 0;
  this.colorTextures = [];
  this.normalTextures = [];
  for(let i = 0; i < 7; i++) {
    this.colorTextures.push(p.createGraphics(400, 800, p.P3D));
    this.normalTextures.push(p.createGraphics(400, 400, p.P3D));
  }
  this.cameraPositionTo = this.cameraPosition.copy();
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.5;
  this.aperture = 0.05;

  this.signal = [];
  for(let i = -100; i <= 100; i++) {
    this.signal[i + 100] = 0;
  }
  this.sigFuncs = [
    function (args) {
      return 100 * args.p.random(-1, 1);
    },
    function (args) {
      return 0;
    },
    function (args) {
      return 100 * Math.sin(args.j * 0.1 + args.t * 10.0);
    },
    function (args) {
      return Math.sin(args.p.frameCount / 30.0 + args.j * 0.3 + args.i * 2.0) * 50;
    },
    function (args) {
      let y = Math.sin(args.p.frameCount / 30.0 * 15.0 + args.j * 0.3 + args.i * 2.0);
      return args.p.constrain(args.p.map(y, 0.95, 1, 0, 1), 0, 1) * -200;
    }
  ];
  this.sigFunc = this.sigFuncs[0];
  this.sigFunc2 = this.sigFuncs[0];
}

S009PBR.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.clear();

      pg.pushMatrix();

      for(let i = -5; i <= 5; i++) {

        pg.beginShape(p.TRIANGLE_STRIP);
        pg.noStroke();
        if(i == 0) {
          pg.fill(255, 0, 0);
        }
        else {
          pg.fill(255);
        }
        for(let j = -100; j <= 100; j++) {
          let y;
          if(i != 0) {
            y = this.sigFunc2({t: p.frameCount / 30.0, j: j, i: i, p: p});
          }
          else {
            let yy = this.sigFunc({t: p.frameCount / 30.0, j: j, i: i, p: p});
            // this.signal[j + 100] = p.lerp(this.signal[j + 100], yy, 0.3);
            // y = this.signal[j + 100];
            y = yy;
          }
          let w = 15;
          let x = i * 70;
          let z = j * 30;
          pg.vertex(x - w, y, z, p.map(j, -10, 10, 0, 1), 0);
          pg.vertex(x + w, y, z, p.map(j, -10, 10, 0, 1), 1);
        }
        pg.endShape();
      }
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
        this.sigFunc = p.random(this.sigFuncs);
        this.sigFunc2 = p.random(this.sigFuncs);
      }
      this.angle += this.angleVel;
      this.angleVel = Math.max(this.angleVel * 0.95, 0);
      var camAngle = p.frameCount * 0.002;
      // var lightAngle = Math.PI / -4;
      // this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      // this.lightDirection = p.createVector(0, 0, 1);
      // this.cameraPosition.set(400 * Math.cos(camAngle), 100 * Math.sin(p.frameCount * 0.01) - 200, 400 * Math.sin(camAngle));
      this.cameraPosition.lerp(this.cameraPositionTo, 0.1);
      this.cameraTarget.set(0, 0, 0);

      let mid = this.cameraPosition.mag();
      this.minDepth = mid - 200.0;
      this.maxDepth = mid + 200.0;
      Object.getPrototypeOf(S009PBR.prototype).draw(this);
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
  this.shader = p.loadShader(p.sketchPath(p.folderName + "/frag.glsl"));
  this.angle = 0;
}

S009Ray.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
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
    // s009Ray.draw(t);
    // p.image(s009Ray.pg, 0, 0);
    p.image(s009PBR.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p009 = new p5(s);
