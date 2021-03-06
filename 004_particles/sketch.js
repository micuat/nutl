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
    this.vel.mult(0.9);
    let va = 2.0;
    this.vel.x += Math.sin(phi) * Math.cos(theta) * va + wind.x;
    this.vel.y += Math.sin(phi) * Math.sin(theta) * va + wind.y;
    this.vel.z += Math.cos(phi) * va + wind.z;
    this.pos.add(this.vel);
    this.rotX += 0.1;
    this.rotY += 0.1;

    this.velSmooth.lerp(this.vel, 0.15);
  }

  this.drawLine = function (pg, agent) {
    pg.pushMatrix();
    // pg.translate(this.pos.x, this.pos.y, this.pos.z);
    let pdiff = this.pos.copy();
    pdiff.sub(agent.pos);
    let w = p.map(pdiff.mag(), 300, 0, 0, 255);
    if(w < 0) {
    }
    else {
      pg.strokeWeight(3);
      pg.stroke(w);
      pg.line(this.pos.x, this.pos.y, this.pos.z, agent.pos.x, agent.pos.y, agent.pos.z);
    }
    pg.popMatrix();
  }

  this.draw = function (pg, agent) {
    if(this.life <= 0) {
      // return;
    }
    pg.pushMatrix();
    pg.translate(this.pos.x, this.pos.y, this.pos.z);
    // pg.fill(200);
    pg.fill(this.col.r, this.col.g, this.col.b);
    pg.rotateX(this.rotX);
    pg.rotateY(this.rotY);
    pg.box(10, 10, 50);
    // pg.sphere(30);
    pg.popMatrix();

    let pdiff = this.pos.copy();
    pdiff.sub(agent.pos);
    let w = p.map(pdiff.mag(), 600, 0, 0, 8);
    if(w < 0) return;

    pg.pushMatrix();
    pg.noStroke();
    pg.fill(this.col.r, this.col.g, this.col.b);

    // pg.translate(this.pos.x, this.pos.y, this.pos.z);
    pg.translate((this.pos.x + agent.pos.x) / 2,
    (this.pos.y + agent.pos.y) / 2,
    (this.pos.z + agent.pos.z) / 2);

    // let zaxis = pdiff.copy();
    // zaxis.normalize();
    // let theta = Math.acos(zaxis.z);
    // let phi = Math.atan2(zaxis.y, zaxis.x);
    // pg.rotateX(theta);
    // pg.rotateZ(phi);


    // let zaxis = pdiff.copy();
    // zaxis.normalize();
    // let xaxis = p.createVector(0, -1, 0).cross(zaxis);
    // xaxis.normalize(); 
    // let yaxis = zaxis.cross(xaxis);
    // yaxis.normalize();

    // pg.applyMatrix(
    //   xaxis.x, xaxis.y, xaxis.z, 0.0,
    //   yaxis.x, yaxis.y, yaxis.z, 0.0,
    //   zaxis.x, zaxis.y, zaxis.z, 0.0,
    //   0.0, 0.0, 0.0, 1.0
    // );
    // pg.fill(255);
    // pg.box(30, 30, 30);
    // pg.fill(this.col.r, this.col.g, this.col.b);
    // pg.box(w, w, pdiff.mag() * 1);

    pg.popMatrix();
  }
}

function S004 (p) {
  SRendererDof.call(this, p, 1500, 1050);
  this.colorScheme = new ColorScheme("97ead2-55d6be-7d5ba6-dddddd-fc6471");
  this.minDepth = -100.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.2;
  this.aperture = 0.02;
  this.agents = [];
  this.cameraPosition = p.createVector(0.0, -300.0, 500.0);
  this.wind = p.createVector();
  this.camRot = 0;
  this.camRotTarget = 0;
}

S004.prototype = Object.create(SRendererDof.prototype, {
  drawScene: {
    value: function (pg, args, isDepth) {
      let p = this.p;
      pg.background(0);

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
      if(p.random(1) > 0.92) {
        let idx = Math.floor(p.random(0, 5));
        this.agents.push(new Agent({p: p, pos: p.createVector(0, 200, -200), col: this.colorScheme.get(idx)}));
        if(this.agents.length > 15) this.agents.shift();
      }

      this.wind.x = Math.cos(t) * 0.2;
      this.wind.y = -0.3;
      this.wind.z = Math.sin(t) * 0.2;
      for(let i in this.agents) {
        this.agents[i].update(this.wind);
        // this.agents[i].update(p.createVector(0, -1, 0));
      }

      // if(p.frameCount % 60 == 0) {
      //   this.camRotTarget = p.random(-Math.PI, Math.PI);
      // }
      // this.cameraPosition = p.createVector(500.0 * Math.cos(this.camRot), 0.0, 500.0 * Math.sin(this.camRot));
      // this.camRot = p.lerp(this.camRot, this.camRotTarget, 0.1);

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


function S004a (p, solid) {
  SRenderer.call(this, p, 1500, 1050);
  this.solid = solid;
}

S004a.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      this.pg.beginDraw();
      this.pg.clear();
      // this.pg.background(0);
      this.pg.blendMode(p.ADD);
      this.cameraPosition = p.createVector(0.0, -300.0, 500.0);
      this.cameraTarget = p.createVector(0.0, 0.0, 0.0);
      this.pg.camera(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z, this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z, 0, 1, 0);
      for(let i = 0; i < this.solid.agents.length; i++) {
        for(let j = i + 1; j < this.solid.agents.length; j++) {
          this.solid.agents[i].drawLine(this.pg, this.solid.agents[j]);
        }
      }
      this.pg.endDraw();
    }
  }
});

S004a.prototype.constructor = S004a;

var s = function (p) {
  let s004 = new S004(p);
  let s004a = new S004a(p, s004);
  let postProcess0 = new PostProcess(p, 1500, 1050);
  // let postProcess0a = new PostProcess(p, 1500, 1050);
  let postProcess1a = new PostProcess(p, 1500, 1050);
  let startFrame;

  p.setup = function () {
    p.createCanvas(1500, 1050);
    p.frameRate(30);

    s004.setup();
    s004a.setup();
    postProcess0.setup();
    postProcess1a.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s004.draw(t);
    s004a.draw(t);
    postProcess0.draw("bloom", s004.pg, {delta: 0.003, num: 2});
    // postProcess0a.draw("bloom", s004a.pg, {delta: 0.001, num: 6});
    postProcess1a.draw("rgbshift", s004a.pg, {delta: 100.0, num: 2});
 
    p.blendMode(p.ADD);
    p.tint(255);
    p.image(postProcess0.pg, 0, 0);
    p.tint(128);
    p.image(postProcess1a.pg, 0, 0);
  }

  p.oscEvent = function (m) {
    s004.onOsc(m);
  }

};

var p061 = new p5(s);
