function SRendererShadow (p) {
  this.lightPos;
  this.defaultShader;
  this.shadowMap;
  this.lightDirection = p.createVector(0, 0, 1);
  this.name;
  this.p = p;
}

SRendererShadow.prototype.initShadowPass = function () {
  let p = this.p;
  this.shadowMap = p.createGraphics(2048, 2048, p.P3D);
  this.shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
  //this.shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
  this.shadowMap.beginDraw();
  this.shadowMap.noStroke();
  this.shadowMap.shader(p.loadShader(this.name + ("/shadow.frag"), this.name + ("/shadow.vert")));
  this.shadowMap.ortho(-400, 400, -400, 400, -1000, 1000); // Setup orthogonal view matrix for the directional light
  this.shadowMap.endDraw();
}

SRendererShadow.prototype.initDefaultPass = function () {
  let p = this.p;
  this.defaultShader = p.loadShader(this.name + ("/default.frag"), this.name + ("/default.vert"));
  p.shader(this.defaultShader);
  p.noStroke();
  p.perspective(60.0 / 180 * Math.PI, p.width / p.height, 10, 1000);
}

SRendererShadow.prototype.setup = function () {
  let p = this.p;
  this.name = p.folderName;

  this.initShadowPass();
  this.initDefaultPass();
  this.lightPos = p.createVector();
}

SRendererShadow.prototype.updateDefaultShader = function () {
  let p = this.p;
  // Bias matrix to move homogeneous shadowCoords into the UV texture space
  let shadowTransform = new Packages.processing.core.PMatrix3D(
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.0, 0.0, 0.0, 1.0
  );

  // Apply project modelview matrix from the shadow pass (light direction)
  shadowTransform.apply(this.shadowMap.projmodelview);

  // Apply the inverted modelview matrix from the default pass to get the original vertex
  // positions inside the shader. This is needed because Processing is pre-multiplying
  // the vertices by the modelview matrix (for better performance).
  let modelviewInv = p.g.modelviewInv;
  shadowTransform.apply(modelviewInv);

  // Convert column-minor PMatrix to column-major GLMatrix and send it to the shader.
  // PShader.set(String, PMatrix3D) doesn't convert the matrix for some reason.
  this.defaultShader.set("shadowTransform", new Packages.processing.core.PMatrix3D(
    shadowTransform.m00, shadowTransform.m10, shadowTransform.m20, shadowTransform.m30,
    shadowTransform.m01, shadowTransform.m11, shadowTransform.m21, shadowTransform.m31,
    shadowTransform.m02, shadowTransform.m12, shadowTransform.m22, shadowTransform.m32,
    shadowTransform.m03, shadowTransform.m13, shadowTransform.m23, shadowTransform.m33
  ));

  // Calculate light direction normal, which is the transpose of the inverse of the
  // modelview matrix and send it to the default shader.
  let lightNormalX = this.lightPos.x * modelviewInv.m00 + this.lightPos.y * modelviewInv.m10 + this.lightPos.z * modelviewInv.m20;
  let lightNormalY = this.lightPos.x * modelviewInv.m01 + this.lightPos.y * modelviewInv.m11 + this.lightPos.z * modelviewInv.m21;
  let lightNormalZ = this.lightPos.x * modelviewInv.m02 + this.lightPos.y * modelviewInv.m12 + this.lightPos.z * modelviewInv.m22;
  let normalLength = Math.sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
  this.lightDirection.set(lightNormalX / -normalLength, lightNormalY / -normalLength, lightNormalZ / -normalLength);
  this.defaultShader.set("lightDirection", this.lightDirection.x, this.lightDirection.y, this.lightDirection.z);
  this.defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
  // this.defaultShader.set("uBaseColor", 0.5, 0.5, 0.5);

  this.defaultShader.set("uMetallic", 0.4);
  this.defaultShader.set("uRoughness", 0.1);
  this.defaultShader.set("uSpecular", 0.99);
  this.defaultShader.set("uLightRadius", 500.0);
  this.defaultShader.set("uExposure", 2.0);
  this.defaultShader.set("uGamma", 0.6);

  this.defaultShader.set("vLightPosition", this.lightPos.x, this.lightPos.y, this.lightPos.z);

  // Send the shadowmap to the default shader
  this.defaultShader.set("shadowMap", this.shadowMap);
}

SRendererShadow.prototype.renderLandscape = function (canvas) {
}

SRendererShadow.prototype.draw = function () {
  let p = this.p;
  p.shader(this.defaultShader);

  let viewMatrix = new Packages.processing.core.PMatrix3D(
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.0, 0.0, 0.0, 1.0
  );
  let cameraPosition = p.createVector(0, -200.0, 150.0);
  viewMatrix.translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  this.defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
    viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
    viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
    viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
    viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
  ));
  let modelviewInv = p.g.modelviewInv;
  this.defaultShader.set("modelviewInv", new Packages.processing.core.PMatrix3D(
    modelviewInv.m00, modelviewInv.m10, modelviewInv.m20, modelviewInv.m30,
    modelviewInv.m01, modelviewInv.m11, modelviewInv.m21, modelviewInv.m31,
    modelviewInv.m02, modelviewInv.m12, modelviewInv.m22, modelviewInv.m32,
    modelviewInv.m03, modelviewInv.m13, modelviewInv.m23, modelviewInv.m33
  ));

  p.camera(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0.0, 0.0, 0, 0, 1, 0);
  p.background(0);

  var lightAngle = p.frameCount * 0.02;
  this.lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));

  // Render shadow pass
  this.shadowMap.beginDraw();
  this.shadowMap.camera(this.lightPos.x, this.lightPos.y, this.lightPos.z, this.lightDirection.x-this.lightPos.x, this.lightDirection.y-this.lightPos.y, this.lightDirection.z-this.lightPos.z, 0, 1, 0);
  this.shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
  this.renderLandscape(this.shadowMap);
  this.shadowMap.endDraw();
  // shadowMap.updatePixels();

  // Update the shadow transformation matrix and send it, the light
  // direction normal and the shadow map to the default shader.
  this.updateDefaultShader();

  // Render default pass
  p.background(34, 34, 34, 255);
  p.noStroke();
  this.renderLandscape(p.g, this.defaultShader);

  // Render light source
  p.pushMatrix();
  p.fill(255, 255, 255, 255);
  p.translate(this.lightPos.x, this.lightPos.y, this.lightPos.z);
  p.popMatrix();
}

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