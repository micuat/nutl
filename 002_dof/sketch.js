function SRendererDof(p, w, h) {
  SRenderer.call(this, p);
  this.minDepth = 0.0;
  this.maxDepth = 255.0;
  this.focus = 0.5;
  this.maxBlur = 0.1;
  this.aperture = 0.1;

  this.depthShader = p.loadShader(p.folderName + "/colorfrag.glsl",
      p.folderName + "/colorvert.glsl");
      this.depthShader.set("minDepth", this.minDepth);
      this.depthShader.set("maxDepth", this.maxDepth);

  this.dof = p.loadShader(p.folderName + "/dof.glsl");
  this.dof.set("aspect", parseFloat(p.width) / p.height);

  this.src = p.createGraphics(w, h, p.P3D);
  this.dest = p.createGraphics(w, h, p.P3D);
  this.dest2 = p.createGraphics(w, h, p.P3D);
  this.depth = p.createGraphics(w, h, p.P3D);
  this.depth.smooth(8);
  this.depth.shader(this.depthShader);
}

SRendererDof.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (that) {
      if(that == undefined) that = this;
      let p = that.p;
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
    }
  },
  renderLandscape: {
    value: function (that, pg) {
      if(that == undefined) that = this;
    }
  }
});

SRendererDof.prototype.constructor = SRendererDof;

function S002 (p) {
  SRendererDof.call(this, p, 800, 800);
  this.colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");
  this.minDepth = -0.0;
  this.maxDepth = 100.0;
  this.maxBlur = 0.5;
  this.aperture = 0.05;
}

S002.prototype = Object.create(SRendererDof.prototype, {
  renderLandscape: {
    value: function (pg, t, lights) {
      let p = this.p;
      pg.beginDraw();
      pg.camera(0, 0, 200, 0, 0, 0, 0, 1, 0);
      pg.background(30);
      if (lights)
        pg.lights();
      pg.pushMatrix();
      pg.noStroke();
      pg.fill(250);
      pg.rotateX(Math.PI * 0.3);
      pg.rotateZ(Math.PI * 0.2);
    
      for (let i = -10; i <= 10; i++) {
        pg.pushMatrix();
        pg.translate(i * 20, 0, 0);
        let idx = (i + 22) % 5;
        pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
        for (let j = -10; j <= 10; j++) {
          let z = p.map(Math.sin(t * (i * 0.5 + 0.5) + j * 0.5), -1, 1, -50, 50);
          pg.pushMatrix();
          pg.translate(-5, j * 40, z);
          pg.box(15, 15, 15);
          pg.popMatrix();
        }
        pg.popMatrix();
      }
      pg.popMatrix();
      pg.translate(0, 0, -1000);
      pg.box(3000, 3000, 1);
      pg.endDraw();
    }
  },
  draw: {
    value: function () {
      let p = this.p;
      p.background(0);
  
      this.renderLandscape(this.src, t, true);
      this.renderLandscape(this.depth, t, false);
    
      Object.getPrototypeOf(S002.prototype).draw(this);
    
      let mid = 110;
      this.minDepth = mid - 100.0;
      this.maxDepth = mid + 100.0;
    }
  }
});

S002.prototype.constructor = S002;

var s = function (p) {
  let s002 = new S002(p);
  let startFrame;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s002.setup();
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    t = (getCount() / 30.0);
    s002.draw(t);
 
    p.image(s002.dest2, 0, 0);
  }

};

var p061 = new p5(s);
