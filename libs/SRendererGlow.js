function SRendererGlow(p, w, h) {
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

  this.defaultShader = p.loadShader("shaders/glow/default.frag", "shaders/glow/default.vert");
  this.depthShader = p.loadShader("shaders/glow/depthfrag.glsl",
      "shaders/glow/depthvert.glsl");
      this.depthShader.set("minDepth", this.minDepth);
      this.depthShader.set("maxDepth", this.maxDepth);

  this.glow = p.loadShader("shaders/glow/glow.glsl");
  this.glow.set("aspect", parseFloat(p.width) / p.height);

  this.src.shader(this.defaultShader);
  this.depth.shader(this.depthShader);
}

SRendererGlow.prototype = Object.create(SRenderer.prototype, {
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
      that.glow.set("tDepth", that.depth);
      that.dest.shader(that.glow);

      that.glow.set("maxBlur", that.maxBlur);
      that.glow.set("focus", that.focus);
      that.glow.set("aperture", that.aperture);

      that.dest.image(that.src, 0, 0);
      that.dest.endDraw();

      for(let i = 0; i < 2; i++) {
        that.dest2.beginDraw();
        that.glow.set("tDepth", that.depth);
        that.dest2.shader(that.glow);
    
        that.glow.set("maxBlur", that.maxBlur);
        that.glow.set("focus", that.focus);
        that.glow.set("aperture", that.aperture);
    
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

SRendererGlow.prototype.constructor = SRendererGlow;
