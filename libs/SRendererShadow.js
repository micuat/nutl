function SRendererShadow (p, w, h) {
  SRenderer.call(this, p, w, h);
  this.lightPos;
  this.defaultShader;
  this.shadowMap;
  this.lightDirection = p.createVector(0, 0, 1);
  this.cameraPosition = p.createVector(0, -200.0, 150.0);
  this.cameraTarget = p.createVector(0, 0, 0);
  this.uLightColor = {r: 0.75, g: 0.75, b: 0.75};
  this.uMetallic = 0.4;
  this.uRoughness = 0.1;
  this.uSpecular = 0.99;
  this.uLightRadius = 500.0;
  this.uExposure = 2.0;
  this.uGamma = 0.8;
  this.uVignette = 0.75;
  this.uUseTexture = 0;
  this.name;
}

SRendererShadow.prototype = Object.create(SRenderer.prototype);

SRendererShadow.prototype.initShadowPass = function () {
  let p = this.p;
  this.pg.beginDraw();
  let sh = this.pg.loadShader("shaders/shadow/shadow.frag", "shaders/shadow/shadow.vert");
  this.pg.endDraw();
  this.shadowMap = p.createGraphics(2048, 2048, p.P3D);
  this.shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
  //this.shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
  this.shadowMap.beginDraw();
  this.shadowMap.noStroke();
  this.shadowMap.shader(sh);
  this.shadowMap.ortho(-400, 400, -400, 400, -1000, 1000); // Setup orthogonal view matrix for the directional light
  this.shadowMap.endDraw();
}

SRendererShadow.prototype.initDefaultPass = function () {
  let p = this.p;
  this.pg.beginDraw();
  this.defaultShader = this.pg.loadShader("shaders/shadow/default.frag", "shaders/shadow/default.vert");
  this.pg.shader(this.defaultShader);
  this.pg.noStroke();
  this.pg.perspective(60.0 / 180 * Math.PI, this.pg.width / this.pg.height, 10, 1000);
  this.pg.endDraw();
}

SRendererShadow.prototype.setup = function () {
  Object.getPrototypeOf(SRendererShadow.prototype).setup.call(this);
  let p = this.p;
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
  // positions inside the shader. this is needed because Processing is pre-multiplying
  // the vertices by the modelview matrix (for better performance).
  let modelviewInv = this.pg.modelviewInv;
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
  this.defaultShader.set("uLightColor", this.uLightColor.r, this.uLightColor.g, this.uLightColor.b);
  this.defaultShader.set("uMetallic", this.uMetallic);
  this.defaultShader.set("uRoughness", this.uRoughness);
  this.defaultShader.set("uSpecular", this.uSpecular);
  this.defaultShader.set("uLightRadius", this.uLightRadius);
  this.defaultShader.set("uExposure", this.uExposure);
  this.defaultShader.set("uGamma", this.uGamma);
  this.defaultShader.set("uVignette", this.uVignette);
  this.defaultShader.set("uUseTexture", this.uUseTexture);

  this.defaultShader.set("vLightPosition", this.lightPos.x, this.lightPos.y, this.lightPos.z);

  // Send the shadowmap to the default shader
  this.defaultShader.set("shadowMap", this.shadowMap);
}

SRendererShadow.prototype.drawScene = function (canvas, isShadow) {
}

SRendererShadow.prototype.draw = function () {
  let p = this.p;
  this.pg.beginDraw();
  this.pg.shader(this.defaultShader);

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
  let modelviewInv = p.g.modelviewInv;
  this.defaultShader.set("modelviewInv", new Packages.processing.core.PMatrix3D(
    modelviewInv.m00, modelviewInv.m10, modelviewInv.m20, modelviewInv.m30,
    modelviewInv.m01, modelviewInv.m11, modelviewInv.m21, modelviewInv.m31,
    modelviewInv.m02, modelviewInv.m12, modelviewInv.m22, modelviewInv.m32,
    modelviewInv.m03, modelviewInv.m13, modelviewInv.m23, modelviewInv.m33
  ));

  this.pg.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);
  // this.pg.background(0);
  this.pg.endDraw();

  // Render shadow pass
  this.shadowMap.beginDraw();
  this.shadowMap.camera(this.lightPos.x, this.lightPos.y, this.lightPos.z, this.lightDirection.x-this.lightPos.x, this.lightDirection.y-this.lightPos.y, this.lightDirection.z-this.lightPos.z, 0, 1, 0);
  this.shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
  this.drawScene(this.shadowMap, true);
  this.shadowMap.endDraw();
  // shadowMap.updatePixels();

  // Update the shadow transformation matrix and send it, the light
  // direction normal and the shadow map to the default shader.
  this.updateDefaultShader();

  // Render default pass
  this.pg.beginDraw();
  // this.pg.background(34, 34, 34, 255);
  this.pg.noStroke();
  this.drawScene(this.pg, false);
  this.pg.endDraw();
}

SRendererShadow.prototype.constructor = SRendererShadow;
