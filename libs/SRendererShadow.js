function SRendererShadow (p) {
  SRenderer.call(this, p);
  this.lightPos;
  this.defaultShader;
  this.shadowMap;
  this.lightDirection = p.createVector(0, 0, 1);
  this.cameraPosition = p.createVector(0, -200.0, 150.0);
  this.cameraTarget = p.createVector(0, 0, 0);
  this.name;
}

SRendererShadow.prototype = Object.create(SRenderer.prototype, {
  initShadowPass: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      that.pg.beginDraw();
      let sh = that.pg.loadShader("shaders/shadow/shadow.frag", "shaders/shadow/shadow.vert");
      that.pg.endDraw();
      that.shadowMap = p.createGraphics(2048, 2048, p.P3D);
      that.shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
      //that.shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
      that.shadowMap.beginDraw();
      that.shadowMap.noStroke();
      that.shadowMap.shader(sh);
      that.shadowMap.ortho(-400, 400, -400, 400, -1000, 1000); // Setup orthogonal view matrix for the directional light
      that.shadowMap.endDraw();
    }
  },
  initDefaultPass: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      that.pg.beginDraw();
      that.defaultShader = that.pg.loadShader("shaders/shadow/default.frag", "shaders/shadow/default.vert");
      that.pg.shader(that.defaultShader);
      that.pg.noStroke();
      that.pg.perspective(60.0 / 180 * Math.PI, that.pg.width / that.pg.height, 10, 1000);
      that.pg.endDraw();
    }
  },
  setup: {
    value: function (that) {
      if(that == undefined) that = this;
      Object.getPrototypeOf(SRendererShadow.prototype).setup(that);
      let p = that.p;
      that.initShadowPass();
      that.initDefaultPass();
      that.lightPos = p.createVector();
    }
  },
  updateDefaultShader: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      // Bias matrix to move homogeneous shadowCoords into the UV texture space
      let shadowTransform = new Packages.processing.core.PMatrix3D(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );
    
      // Apply project modelview matrix from the shadow pass (light direction)
      shadowTransform.apply(that.shadowMap.projmodelview);
    
      // Apply the inverted modelview matrix from the default pass to get the original vertex
      // positions inside the shader. that is needed because Processing is pre-multiplying
      // the vertices by the modelview matrix (for better performance).
      let modelviewInv = that.pg.modelviewInv;
      shadowTransform.apply(modelviewInv);
    
      // Convert column-minor PMatrix to column-major GLMatrix and send it to the shader.
      // PShader.set(String, PMatrix3D) doesn't convert the matrix for some reason.
      that.defaultShader.set("shadowTransform", new Packages.processing.core.PMatrix3D(
        shadowTransform.m00, shadowTransform.m10, shadowTransform.m20, shadowTransform.m30,
        shadowTransform.m01, shadowTransform.m11, shadowTransform.m21, shadowTransform.m31,
        shadowTransform.m02, shadowTransform.m12, shadowTransform.m22, shadowTransform.m32,
        shadowTransform.m03, shadowTransform.m13, shadowTransform.m23, shadowTransform.m33
      ));
    
      // Calculate light direction normal, which is the transpose of the inverse of the
      // modelview matrix and send it to the default shader.
      let lightNormalX = that.lightPos.x * modelviewInv.m00 + that.lightPos.y * modelviewInv.m10 + that.lightPos.z * modelviewInv.m20;
      let lightNormalY = that.lightPos.x * modelviewInv.m01 + that.lightPos.y * modelviewInv.m11 + that.lightPos.z * modelviewInv.m21;
      let lightNormalZ = that.lightPos.x * modelviewInv.m02 + that.lightPos.y * modelviewInv.m12 + that.lightPos.z * modelviewInv.m22;
      let normalLength = Math.sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
      that.lightDirection.set(lightNormalX / -normalLength, lightNormalY / -normalLength, lightNormalZ / -normalLength);
      that.defaultShader.set("lightDirection", that.lightDirection.x, that.lightDirection.y, that.lightDirection.z);
      that.defaultShader.set("uLightColor", 0.75, 0.75, 0.75);
      // that.defaultShader.set("uBaseColor", 0.5, 0.5, 0.5);
    
      that.defaultShader.set("uMetallic", 0.4);
      that.defaultShader.set("uRoughness", 0.1);
      that.defaultShader.set("uSpecular", 0.99);
      that.defaultShader.set("uLightRadius", 500.0);
      that.defaultShader.set("uExposure", 2.0);
      that.defaultShader.set("uGamma", 0.8);
    
      that.defaultShader.set("vLightPosition", that.lightPos.x, that.lightPos.y, that.lightPos.z);
    
      // Send the shadowmap to the default shader
      that.defaultShader.set("shadowMap", that.shadowMap);
    }
  },
  renderLandscape: {
    value: function (that, canvas, isShadow) {
      if(that == undefined) that = this;
    }
  },
  draw: {
    value: function (that) {
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
      let modelviewInv = p.g.modelviewInv;
      that.defaultShader.set("modelviewInv", new Packages.processing.core.PMatrix3D(
        modelviewInv.m00, modelviewInv.m10, modelviewInv.m20, modelviewInv.m30,
        modelviewInv.m01, modelviewInv.m11, modelviewInv.m21, modelviewInv.m31,
        modelviewInv.m02, modelviewInv.m12, modelviewInv.m22, modelviewInv.m32,
        modelviewInv.m03, modelviewInv.m13, modelviewInv.m23, modelviewInv.m33
      ));
    
      that.pg.camera(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z, that.cameraTarget.x, that.cameraTarget.y, that.cameraTarget.z, 0, 1, 0);
      that.pg.background(0);
      that.pg.endDraw();
    
      // Render shadow pass
      that.shadowMap.beginDraw();
      that.shadowMap.camera(that.lightPos.x, that.lightPos.y, that.lightPos.z, that.lightDirection.x-that.lightPos.x, that.lightDirection.y-that.lightPos.y, that.lightDirection.z-that.lightPos.z, 0, 1, 0);
      that.shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
      that.renderLandscape(that.shadowMap, true);
      that.shadowMap.endDraw();
      // shadowMap.updatePixels();
    
      // Update the shadow transformation matrix and send it, the light
      // direction normal and the shadow map to the default shader.
      that.updateDefaultShader();
    
      // Render default pass
      that.pg.beginDraw();
      that.pg.background(34, 34, 34, 255);
      that.pg.noStroke();
      that.renderLandscape(that.pg, false);
      that.pg.endDraw();
    }
  }
});

SRendererShadow.prototype.constructor = SRendererShadow;
