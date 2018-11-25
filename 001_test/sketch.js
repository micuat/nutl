function SRenderer (p) {
  this.p = p;
}

SRenderer.prototype.setup = function (that) { // what "that" f***
  let p = that.p;
  that.name = p.folderName;
}

function SRendererShadow (p) {
  SRenderer.call(this, p);
  this.lightPos;
  this.defaultShader;
  this.shadowMap;
  this.lightDirection = p.createVector(0, 0, 1);
  this.cameraPosition = p.createVector(0, -200.0, 150.0);
  this.name;
}

SRendererShadow.prototype = Object.create(SRenderer.prototype, {
  initShadowPass: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      that.shadowMap = p.createGraphics(2048, 2048, p.P3D);
      that.shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
      //that.shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
      that.shadowMap.beginDraw();
      that.shadowMap.noStroke();
      that.shadowMap.shader(p.loadShader(that.name + ("/shadow.frag"), that.name + ("/shadow.vert")));
      that.shadowMap.ortho(-400, 400, -400, 400, -1000, 1000); // Setup orthogonal view matrix for the directional light
      that.shadowMap.endDraw();
    }
  },
  initDefaultPass: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      that.defaultShader = p.loadShader(that.name + ("/default.frag"), that.name + ("/default.vert"));
      p.shader(that.defaultShader);
      p.noStroke();
      p.perspective(60.0 / 180 * Math.PI, p.width / p.height, 10, 1000);
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
      let modelviewInv = p.g.modelviewInv;
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
      that.defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
      // that.defaultShader.set("uBaseColor", 0.5, 0.5, 0.5);
    
      that.defaultShader.set("uMetallic", 0.4);
      that.defaultShader.set("uRoughness", 0.1);
      that.defaultShader.set("uSpecular", 0.99);
      that.defaultShader.set("uLightRadius", 500.0);
      that.defaultShader.set("uExposure", 2.0);
      that.defaultShader.set("uGamma", 0.6);
    
      that.defaultShader.set("vLightPosition", that.lightPos.x, that.lightPos.y, that.lightPos.z);
    
      // Send the shadowmap to the default shader
      that.defaultShader.set("shadowMap", that.shadowMap);
    }
  },
  renderLandscape: {
    value: function (that, canvas) {
      if(that == undefined) that = this;
    }
  },
  draw: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
      p.shader(that.defaultShader);
    
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
    
      p.camera(that.cameraPosition.x, that.cameraPosition.y, that.cameraPosition.z, 0.0, 0.0, 0, 0, 1, 0);
      p.background(0);
    
      // var lightAngle = p.frameCount * 0.02;
      // that.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
    
      // Render shadow pass
      that.shadowMap.beginDraw();
      that.shadowMap.camera(that.lightPos.x, that.lightPos.y, that.lightPos.z, that.lightDirection.x-that.lightPos.x, that.lightDirection.y-that.lightPos.y, that.lightDirection.z-that.lightPos.z, 0, 1, 0);
      that.shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
      that.renderLandscape(that.shadowMap);
      that.shadowMap.endDraw();
      // shadowMap.updatePixels();
    
      // Update the shadow transformation matrix and send it, the light
      // direction normal and the shadow map to the default shader.
      that.updateDefaultShader();
    
      // Render default pass
      p.background(34, 34, 34, 255);
      p.noStroke();
      that.renderLandscape(p.g, that.defaultShader);
    
      // Render light source
      p.pushMatrix();
      p.fill(255, 255, 255, 255);
      p.translate(that.lightPos.x, that.lightPos.y, that.lightPos.z);
      p.popMatrix();
    }
  }
});

SRendererShadow.prototype.constructor = SRendererShadow;

function S001 (p) {
  SRendererShadow.call(this, p);
}

S001.prototype = Object.create(SRendererShadow.prototype, {
  renderLandscape: {
    value: function (canvas) {
      let p = this.p;
      canvas.pushMatrix();

      canvas.pushMatrix();
      canvas.translate(0, -20, 0);
      for(let i = -3; i <= 3; i++) {
        for(let j = -3; j <= 3; j++) {
          canvas.pushMatrix();
          canvas.translate(i * 60, 0, j * 60);
          canvas.rotateZ(p.millis() * 0.001 + i * 0.1);
          canvas.rotateX(p.millis() * 0.001 + j * 0.1);
          canvas.box(20, 3, 20);
          canvas.popMatrix();
        }
      }
      canvas.popMatrix();

      canvas.fill(200, 200, 200, 255);
      canvas.box(660, 5, 660);
      canvas.popMatrix();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      var lightAngle = p.frameCount * 0.1;
      this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));
      this.lightDirection = p.createVector(0, 0, 1);
      Object.getPrototypeOf(S001.prototype).draw(this);
    }
  }
});

S001.prototype.constructor = S001;

var s = function (p) {
  let s001 = new S001(p);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s001.setup();
  }

  p.draw = function () {
    s001.draw();
  }

};

var p001 = new p5(s);