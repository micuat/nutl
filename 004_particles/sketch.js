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

function Agent (params) {
  let p = params.p;
  this.col = params.col;
  this.pos = params.pos;
  this.poss = [];
  this.vel = p5.Vector.random3D();
  this.vel.mult(0.1);
  this.life = 1000;
  this.rotX = p.random(Math.PI);
  this.rotY = p.random(Math.PI);
  this.velSmooth = p.createVector(0, 0, 0);

  this.update = function (wind) {
    this.life--;
    if(this.life <= 0) {
      // return;
    }
    this.poss.push({pos: this.pos.copy(), rx: this.rotX, ry: this.rotY});
    if(this.poss.length > 10) this.poss.shift();
    let nc = 0.05;
    let phi = (p.noise(this.pos.x * nc, this.pos.y * nc) * 2 - 1) * Math.PI * 2;
    let theta = (p.noise(this.pos.z * nc, this.pos.y * nc) * 2 - 1) * Math.PI * 2;
    this.vel.mult(0.975);
    let va = 2.0;
    this.vel.x += Math.sin(phi) * Math.cos(theta) * va + wind.x;
    this.vel.y += Math.sin(phi) * Math.sin(theta) * va + wind.y;
    this.vel.z += Math.cos(phi) * va + wind.z;
    this.pos.add(this.vel);
    this.rotX += 0.1;
    this.rotY += 0.1;

    this.velSmooth.lerp(this.vel, 0.15);
  }

  this.draw = function (pg, agent) {
    if(this.life <= 0) {
      // return;
    }
    // pg.pushMatrix();
    // pg.translate(this.pos.x, this.pos.y, this.pos.z);
    // pg.fill(0);
    // pg.box(30, 30, 30);
    // pg.popMatrix();

    pg.pushMatrix();
    pg.noStroke();
    pg.fill(this.col.r, this.col.g, this.col.b);

    // pg.translate(this.pos.x, this.pos.y, this.pos.z);
    pg.translate((this.pos.x + agent.pos.x) / 2,
    (this.pos.y + agent.pos.y) / 2,
    (this.pos.z + agent.pos.z) / 2);

    let pdiff = agent.pos.copy();
    pdiff.sub(this.pos);
    let zaxis = pdiff.copy();
    zaxis.normalize();
    let xaxis = p.createVector(0, -1, 0).cross(zaxis);
    xaxis.normalize();
    let yaxis = zaxis.cross(xaxis);
    yaxis.normalize();
    pg.applyMatrix(
      xaxis.x, xaxis.y, xaxis.z, 0.0,
      yaxis.x, yaxis.y, yaxis.z, 0.0,
      zaxis.x, zaxis.y, zaxis.z, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
    // pg.fill(255);
    // pg.box(30, 30, 30);
    pg.fill(this.col.r, this.col.g, this.col.b);
    let w = p.constrain(p.map(pdiff.mag(), 0, 10, 0, 4), 0, 4);
    pg.box(w, w, pdiff.mag() * 1);

    pg.popMatrix();
  }
}

function S004 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("97ead2-55d6be-7d5ba6-dddddd-fc6471");
  this.minDepth = -100.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.2;
  this.aperture = 0.02;
  this.agents = [];
  this.cameraPosition = p.createVector(0.0, 0.0, 500.0);
  this.wind = p.createVector();
  this.camRot = 0;
  this.camRotTarget = 0;
}

S004.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.background(40);

      pg.pushMatrix();
      pg.noStroke();
      // pg.rotateX(Math.PI * 0.3);
      // pg.rotateZ(Math.PI * 0.2);

      // for(let i in this.agents) {
      //   this.agents[i].draw(pg);
      // }
      for(let i = 0; i < this.agents.length; i++) {
        for(let j = i + 1; j < this.agents.length; j++) {
          this.agents[j].draw(pg, this.agents[i]);
        }
      }

    
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let mid = 400;
      this.minDepth = mid - 200.0;
      this.maxDepth = mid + 200.0;
      if(p.random(1) > 0.95) {
        let idx = Math.floor(p.random(0, 5));
        this.agents.push(new Agent({p: p, pos: p.createVector(0, 100, 0), col: this.colorScheme.get(idx)}));
        if(this.agents.length > 10) this.agents.shift();
      }

      this.wind.x = Math.cos(t) * 0.2;
      this.wind.y = -0.3;
      this.wind.z = Math.sin(t) * 0.2;
      for(let i in this.agents) {
        this.agents[i].update(this.wind);
        // this.agents[i].update(p.createVector(0, -1, 0));
      }

      if(p.frameCount % 60 == 0) {
        this.camRotTarget = p.random(-Math.PI, Math.PI);
      }
      this.cameraPosition = p.createVector(500.0 * Math.cos(this.camRot), 0.0, 500.0 * Math.sin(this.camRot));
      this.camRot = p.lerp(this.camRot, this.camRotTarget, 0.1);

      Object.getPrototypeOf(S004.prototype).draw(this, {t: t});
    }
  },
  onOsc: {
    value: function (m) {
      // print(m.get(10).floatValue());
      this.wind.x = m.get(10).floatValue() * 0.01;
      this.wind.y = -1;
      this.wind.z = -m.get(11).floatValue() * 0.01;
    }
  }
});

S004.prototype.constructor = S004;

var s = function (p) {
  let s004 = new S004(p);
  let postProcess0 = new PostProcess(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s004.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s004.draw(t);
    postProcess0.draw("bloom", s004.pg, {delta: 0.01, num: 2});
 
    p.image(postProcess0.pg, 0, 0);
  }

  p.oscEvent = function (m) {
    s004.onOsc(m);
  }

};

var p061 = new p5(s);
