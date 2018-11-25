function SRenderer (p) {
  this.p = p;
}

SRenderer.prototype.setup = function (that) { // what "that" f***
  if(that == undefined) that = this;
  let p = that.p;
  that.pg = p.createGraphics(800, 800, p.P3D);
  that.name = p.folderName;
}

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

function ColorScheme (colorString) {
  this.colors = [];
  {
    let cs = colorString.split("-");
    for(let i in cs) {
      this.colors.push({
        r: parseInt("0x"+cs[i].substring(0,2)),
        g: parseInt("0x"+cs[i].substring(2,4)),
        b: parseInt("0x"+cs[i].substring(4,6))
      });
    }
  }
  this.get = function (i) {
    i = Math.min(this.colors.length - 1, Math.max(0, i));
    return this.colors[i];
  }
}

function S001 (p) {
  SRendererShadow.call(this, p);
  this.angleVel = 0;
  this.angle = 0;
  this.colorScheme = new ColorScheme("273043-9197ae-eff6ee-f02d3a-dd0426");
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
          canvas.rotateX(this.angle + p.millis() * 0.0001 + i * 0.1);
          canvas.rotateY(p.millis() * 0.0001 + j * 0.1);
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
        print(m)
        this.angleVel += 0.1;
      }
    }
  }
});

S001.prototype.constructor = S001;

var s = function (p) {
  let s001 = new S001(p);
  let passPg = p.createGraphics(800, 800, p.P3D);
  let ppg = p.createGraphics(800, 800, p.P3D);
  let postShaders = {};
  let shaderTypes = ["kaleid", "rgbshift", "slide", "bloom", "invert", "mpeg", "radial", "darktoalpha", "pixelate", "fillalpha"];
  for (let i in shaderTypes) {
    postShaders[shaderTypes[i]] = p.loadShader(p.sketchPath("shaders/post/" + shaderTypes[i] + ".glsl"));
  }
  let postProcess = {
    "bloom" : function (lpg) {
      passPg.beginDraw();
      passPg.clear();
      passPg.image(lpg, 0, 0);
      passPg.endDraw();
      for (let i = 0; i < 2; i++) {
        ppg.beginDraw();
        ppg.clear();
        postShaders["bloom"].set("delta", 0.001);
        ppg.image(passPg, 0, 0);
        ppg.filter(postShaders["bloom"]);
        ppg.endDraw();
        let temppg = ppg;
        ppg = passPg;
        passPg = temppg;
      }
      let temppg = ppg;
      ppg = passPg;
      passPg = temppg;
    },
    "kaleid" : function (lpg) {
      ppg.beginDraw();
      ppg.clear();
      ppg.image(lpg, 0, 0);
      ppg.filter(postShaders["kaleid"]);
      ppg.endDraw();
    }
  }


  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s001.setup();
  }

  p.draw = function () {
    s001.draw();

    // postProcess.bloom(s001.pg);
    postProcess.kaleid(s001.pg);

    p.image(ppg, 0, 0);
  }

  p.oscEvent = function(m) {
    s001.oscEvent(m);
  }
};

var p001 = new p5(s);