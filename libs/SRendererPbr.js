function SRendererPbr(p, w, h) {
  SRenderer.call(this, p);
  this.cameraPosition = p.createVector(0.0, 0.0, 200.0);
  this.cameraTarget = p.createVector(0.0, 0.0, 0.0);
  this.uLightColor = {r: 0.75, g: 0.75, b: 0.75};
  this.uMetallic = 0.4;
  this.uRoughness = 0.1;
  this.uSpecular = 0.99;
  this.uLightRadius = 500.0;
  this.uExposure = 2.0;
  this.uGamma = 0.8;

  this.pg = p.createGraphics(w, h, p.P3D);

  this.defaultShader = p.loadShader("shaders/pbr/default.frag", "shaders/pbr/default.vert");

  this.pg.shader(this.defaultShader);
}

SRendererPbr.prototype = Object.create(SRenderer.prototype, {
  setup: {
    value: function (that) {
      if(that == undefined) that = this;
      Object.getPrototypeOf(SRendererPbr.prototype).setup(that);
      let p = that.p;
      that.lightPos = p.createVector();
    }
  },
  draw: {
    value: function (that, args) {
      if(that == undefined) that = this;
      let p = that.p;

      that.pg.beginDraw();
      that.pg.shader(that.defaultShader);
    
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
    
      that.pg.camera(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z, that.cameraTarget.x, that.cameraTarget.y, that.cameraTarget.z, 0, 1, 0);
      that.pg.endDraw();
    
      let modelviewInv = that.pg.modelviewInv;
      // Calculate light direction normal, which is the transpose of the inverse of the
      // modelview matrix and send it to the default shader.
      let lightNormalX = that.lightPos.x * modelviewInv.m00 + that.lightPos.y * modelviewInv.m10 + that.lightPos.z * modelviewInv.m20;
      let lightNormalY = that.lightPos.x * modelviewInv.m01 + that.lightPos.y * modelviewInv.m11 + that.lightPos.z * modelviewInv.m21;
      let lightNormalZ = that.lightPos.x * modelviewInv.m02 + that.lightPos.y * modelviewInv.m12 + that.lightPos.z * modelviewInv.m22;
      let normalLength = Math.sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
      that.lightDirection.set(lightNormalX / -normalLength, lightNormalY / -normalLength, lightNormalZ / -normalLength);

      that.defaultShader.set("lightDirection", that.lightDirection.x, that.lightDirection.y, that.lightDirection.z);
      that.defaultShader.set("uLightColor", that.uLightColor.r, that.uLightColor.g, that.uLightColor.b);
      that.defaultShader.set("uMetallic", that.uMetallic);
      that.defaultShader.set("uRoughness", that.uRoughness);
      that.defaultShader.set("uSpecular", that.uSpecular);
      that.defaultShader.set("uLightRadius", that.uLightRadius);
      that.defaultShader.set("uExposure", that.uExposure);
      that.defaultShader.set("uGamma", that.uGamma);
    
      that.defaultShader.set("vLightPosition", that.lightPos.x, that.lightPos.y, that.lightPos.z);
    
      // Render default pass
      that.pg.beginDraw();
      that.pg.noStroke();
      that.drawScene(that.pg, false);
      that.pg.endDraw();
    }
  },
  drawScene: {
    value: function (that, pg, args, isDepth) {
      if(that == undefined) that = this;
    }
  }
});

SRendererPbr.prototype.constructor = SRendererPbr;
