function DofManager(p, w, h) {
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

  this.draw = function () {
    this.depthShader.set("minDepth", this.minDepth);
    this.depthShader.set("maxDepth", this.maxDepth); 
    
    this.dest.beginDraw();
    this.dof.set("tDepth", this.depth);
    this.dest.shader(this.dof);

    this.dof.set("maxBlur", this.maxBlur);
    this.dof.set("focus", this.focus);
    this.dof.set("aperture", this.aperture);

    this.dest.image(this.src, 0, 0);
    this.dest.endDraw();

    for(let i = 0; i < 2; i++) {
      this.dest2.beginDraw();
      this.dof.set("tDepth", this.depth);
      this.dest2.shader(this.dof);
  
      this.dof.set("maxBlur", this.maxBlur);
      this.dof.set("focus", this.focus);
      this.dof.set("aperture", this.aperture);
  
      this.dest2.image(this.dest, 0, 0);
      this.dest2.endDraw();
      
      let destTemp = this.dest;
      this.dest = this.dest2;
      this.dest2 = destTemp;
    }
  }
}

var s = function (p) {
  let name;
  let dof;
  let startFrame;
  let colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    dof = new DofManager(p, p.width, p.height);
    dof.minDepth = -0.0;
    dof.maxDepth = 100.0;
    dof.maxBlur = 0.5;
    dof.aperture = 0.05;

    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  drawGeometry = function (pg, t, lights) {
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
      pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
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

  p.draw = function () {
    t = (getCount() / 30.0);

    p.background(0);
  
    drawGeometry(dof.src, t, true);
    drawGeometry(dof.depth, t, false);
  
    dof.draw();
  
    let mid = 110;
    dof.minDepth = mid - 100.0;
    dof.maxDepth = mid + 100.0;
  
    p.image(dof.dest2, 0, 0);
  }

};

var p061 = new p5(s);
