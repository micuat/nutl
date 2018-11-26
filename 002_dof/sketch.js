function SRendererDof(p, w, h) {
  SRenderer.call(this, p);
  this.cameraPosition = p.createVector(0.0, 0.0, 200.0);
  this.cameraTarget = p.createVector(0.0, 0.0, 0.0);

  this.minDepth = 0.0;
  this.maxDepth = 255.0;
  this.focus = 0.5;
  this.maxBlur = 0.1;
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
      that.defaultShader.set("uLightColor", 0.75, 0.75, 0.75);
      that.defaultShader.set("uMetallic", 0.4);
      that.defaultShader.set("uRoughness", 0.1);
      that.defaultShader.set("uSpecular", 0.99);
      that.defaultShader.set("uLightRadius", 500.0);
      that.defaultShader.set("uExposure", 2.0);
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

function S002 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.5;
  this.aperture = 0.05;
}

S002.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let t = args.t;
      let p = this.p;
      pg.background(30);
      if (isDepth != true)
        pg.lights();
      pg.pushMatrix();
      pg.noStroke();
      pg.fill(250);
      pg.rotateX(Math.PI * 0.3);
      pg.rotateZ(Math.PI * 0.2);
    
      for (let i = -10; i <= 10; i++) {
        pg.pushMatrix();
        pg.translate(i * 20, 0, 0);
        let idx = (i + 22) % 5;
        pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
        for (let j = -10; j <= 10; j++) {
          let z = p.map(Math.sin(t * (i * 0.5 + 0.5) + j * 0.5), -1, 1, -50, 50);
          pg.pushMatrix();
          pg.translate(-5, j * 40, z);
          pg.box(15, 15, 15);
          pg.popMatrix();
        }
        pg.popMatrix();
      }
      pg.popMatrix();
      pg.translate(0, 0, -1000);
      pg.box(3000, 3000, 1);
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let mid = 110;
      this.minDepth = mid - 100.0;
      this.maxDepth = mid + 100.0;
      Object.getPrototypeOf(S002.prototype).draw(this, {t: t});
    }
  }
});

S002.prototype.constructor = S002;

var s = function (p) {
  let s002 = new S002(p);
  let postProcess0 = new PostProcess(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s002.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s002.draw(t);
    postProcess0.draw("slide", s002.pg, {
      delta: p.constrain(Math.sin(p.millis() * 0.001) * 0.1 - 0.08, 0, 1),
      time: p.millis() * 0.001
    });
 
    p.image(postProcess0.pg, 0, 0);
  }

};

var p061 = new p5(s);
