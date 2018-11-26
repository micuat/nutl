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

  this.update = function (wind) {
    this.life--;
    if(this.life <= 0) {
      return;
    }
    this.poss.push({pos: this.pos.copy(), rx: this.rotX, ry: this.rotY});
    if(this.poss.length > 10) this.poss.shift();
    let phi = (p.noise(this.pos.x, this.pos.y) * 2 - 1) * Math.PI * 2;
    let theta = (p.noise(this.pos.z, this.pos.y) * 2 - 1) * Math.PI * 2;
    this.vel.mult(0.9);
    let va = 2.0;
    this.vel.x += Math.sin(phi) * Math.cos(theta) * va + wind.x;
    this.vel.y += Math.sin(phi) * Math.sin(theta) * va + wind.y;
    this.vel.z += Math.cos(phi) * va + wind.z;
    this.pos.add(this.vel);
    this.rotX += 0.1;
    this.rotY += 0.1;

  }

  this.draw = function (pg) {
    if(this.life <= 0) {
      return;
    }
    pg.pushMatrix();
    pg.noStroke();
    pg.translate(this.pos.x, this.pos.y, this.pos.z);
    pg.fill(this.col.r, this.col.g, this.col.b);
    pg.rotateX(this.rotX);
    pg.rotateY(this.rotY);
    pg.box(7.5, 7.5, 25);
    pg.popMatrix();
    // pg.beginShape(p.TRIANGLE_STRIP);
    for(let i in this.poss) {
      pg.pushMatrix();
      pg.fill(this.col.r, this.col.g, this.col.b, p.map(i, 0, this.poss.length, 0, 255));
      pg.translate(this.poss[i].pos.x, this.poss[i].pos.y, this.poss[i].pos.z);
      pg.rotateX(this.poss[i].rx);
      pg.rotateY(this.poss[i].ry);
      pg.box(7.5, 7.5, 25);
      pg.popMatrix();
      // pg.fill(this.col.r, this.col.g, this.col.b, p.map(i, 0, this.poss.length, 0, 255));
      // pg.vertex(this.poss[i].pos.x+3, this.poss[i].pos.y, this.poss[i].pos.z);
      // pg.vertex(this.poss[i].pos.x-3, this.poss[i].pos.y, this.poss[i].pos.z);
    }
    // pg.endShape();
  }
}

function S003 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("52489c-4062bb-59c3c3-ebebeb-f45b69");
  this.minDepth = -100.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.2;
  this.aperture = 0.01;
  this.agents = [];
  this.cameraPosition = p.createVector(0.0, 0.0, 500.0);
  this.wind = p.createVector();
}

S003.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.background(40);

      pg.pushMatrix();
      pg.noStroke();
      // pg.rotateX(Math.PI * 0.3);
      // pg.rotateZ(Math.PI * 0.2);

      for(let i in this.agents) {
        this.agents[i].draw(pg);
      }

    
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      let mid = p.mouseX;//600;
      this.minDepth = mid - 200.0;
      this.maxDepth = mid + 200.0;
      if(p.random(1) > 0.2) {
        let idx = Math.floor(p.random(0, 5));
        this.agents.push(new Agent({p: p, pos: p.createVector(0, 250, 0), col: this.colorScheme.get(idx)}));
        if(this.agents.length > 50) this.agents.shift();
      }

      for(let i in this.agents) {
        this.agents[i].update(this.wind);
        // this.agents[i].update(p.createVector(0, -1, 0));
      }
      Object.getPrototypeOf(S003.prototype).draw(this, {t: t});
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

S003.prototype.constructor = S003;

var s = function (p) {
  let s003 = new S003(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s003.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s003.draw(t);
 
    p.image(s003.pg, 0, 0);
  }

  p.oscEvent = function (m) {
    s003.onOsc(m);
  }

};

var p061 = new p5(s);
