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
    value: function (args) {
      let p = this.p;
      p.background(0);

      this.src.beginDraw();
      this.defaultShader.set("vLightPosition", 0, -100, -100);
      this.defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
      this.defaultShader.set("uMetallic", 0.4);
      this.defaultShader.set("uRoughness", 0.3);
      this.defaultShader.set("uSpecular", 0.99);
      this.defaultShader.set("uLightRadius", 500.0);
      this.defaultShader.set("uExposure", 3.0);
      this.defaultShader.set("uGamma", 0.8);
      let viewMatrix = new Packages.processing.core.PMatrix3D(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );
      viewMatrix.translate(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
      this.defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
        viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
        viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
        viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
        viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
      ));
      this.src.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);
      this.drawScene(this.src, args, false);
      this.src.endDraw();
      this.depth.beginDraw();
      this.depth.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);
      this.drawScene(this.depth, args, true);
      this.depth.endDraw();

      this.depthShader.set("minDepth", this.minDepth);
      this.depthShader.set("maxDepth", this.maxDepth); 
      
      this.dest.beginDraw();
      this.dof.set("tDepth", this.depth);
      this.dest.shader(this.dof);

      this.dof.set("maxBlur", this.maxBlur);
      this.dof.set("focus", this.focus);
      this.dof.set("aperture", this.aperture);

      this.dest.image(this.src, 0, 0);
      this.dest.endDraw();

      for(let i = 0; i < 2; i++) {
        this.dest2.beginDraw();
        this.dof.set("tDepth", this.depth);
        this.dest2.shader(this.dof);
    
        this.dof.set("maxBlur", this.maxBlur);
        this.dof.set("focus", this.focus);
        this.dof.set("aperture", this.aperture);
    
        this.dest2.image(this.dest, 0, 0);
        this.dest2.endDraw();
        
        let destTemp = this.dest;
        this.dest = this.dest2;
        this.dest2 = destTemp;
      }
      this.pg = this.dest2;
    }
  },
  drawScene: {
    value: function (pg, args, isDepth) {
    }
  }
});

SRendererDof.prototype.constructor = SRendererDof;
