function DofManager() {

  this.depthShader;
  this.dof;
  this.src;
  this.dest;
  this.dest2;
  this.depth;

  this.minDepth = 0.0;
  this.maxDepth = 255.0;
  this.focus;
  this.maxBlur;
  this.aperture;

  this.setup = function (parent, w, h) {
    this.depthShader = parent.loadShader(parent.folderName + "/colorfrag.glsl",
        parent.folderName + "/colorvert.glsl");
        this.depthShader.set("minDepth", this.minDepth);
        this.depthShader.set("maxDepth", this.maxDepth);

    this.dof = parent.loadShader(parent.folderName + "/dof.glsl");
    this.dof.set("aspect", parseFloat(parent.width) / parent.height);

    this.src = parent.createGraphics(w, h, parent.P3D);
    this.dest = parent.createGraphics(w, h, parent.P3D);
    this.dest2 = parent.createGraphics(w, h, parent.P3D);
    this.depth = parent.createGraphics(w, h, parent.P3D);
    this.depth.smooth(8);
    this.depth.shader(this.depthShader);
  }

  this.getDepthShader = function () {
    return this.depthShader;
  }

  this.setDepthShader = function (depthShader) {
    this.depthShader = depthShader;
  }

  this.getDof = function () {
    return this.dof;
  }

  this.setDof = function (dof) {
    this.dof = dof;
  }

  this.getSrc = function () {
    return this.src;
  }

  this.setSrc = function (src) {
    this.src = src;
  }

  this.getDest = function () {
    return this.dest;
  }

  this.setDest = function (dest) {
    this.dest = dest;
  }

  this.getDepth = function () {
    return this.depth;
  }

  this.setDepth = function (depth) {
    this.depth = depth;
  }

  this.getMaxDepth = function () {
    return this.maxDepth;
  }

  this.setMaxDepth = function (maxDepth) {
    this.maxDepth = maxDepth;
  }

  this.getFocus = function () {
    return this.focus;
  }

  this.setFocus = function (focus) {
    this.focus = focus;
  }
  
  this.getMaxBlur = function () {
    return this.maxBlur;
  }

  this.setMaxBlur = function (maxBlur) {
    this.maxBlur = maxBlur;
  }
  
  this.getAperture = function () {
    return this.aperture;
  }

  this.setAperture = function (aperture) {
    this.aperture = aperture;
  }
  
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

var lightPos;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
  let dof;
  let startFrame;
  let colorScheme = new ColorScheme("ff934f-c2e812-91f5ad-ffffff-bfcbc2");

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    dof = new DofManager();
    dof.setup(p, p.width, p.height);
    dof.minDepth = -0.0;
    dof.maxDepth = 100.0;
    dof.focus = 0.0;//p.map(p.mouseX, 0, p.width, -0.5, 1.5);
    dof.maxBlur = 0.5;
    dof.aperture = 0.05;

    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  drawGeometry = function (pg, t, lights) {
    pg.beginDraw();
    pg.camera(0, 0, 200, 0, 0, 0, 0, 1, 0);
    //
    pg.background(30);
    if (lights)
      pg.lights();
    pg.pushMatrix();
    // pg.translate(pg.width / 2, pg.height / 2);
    pg.noStroke();
    pg.fill(250);
    // pg.rotateY(t * 0.3);
    pg.rotateX(Math.PI * 0.3);
    pg.rotateZ(Math.PI * 0.2);
  
    for (let i = -10; i <= 10; i++) {
      pg.pushMatrix();
      pg.translate(i * 20, 0, 0);//p.map(Math.sin(t + i * 0.8), -1, 1, 0, -1000));
      let idx = (i + 22) % 5;
      pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
      // pg.beginShape(p.TRIANGLE_STRIP);
      for (let j = -10; j <= 10; j++) {
        // pg.rect(0, j * 20, 10, 20);
        let z = p.map(Math.sin(t * (i * 0.5 + 0.5) + j * 0.5), -1, 1, -50, 50);
        // pg.vertex(-7.5, j * 10, z);
        // pg.vertex(7.5, j * 10, z);
        pg.pushMatrix();
        pg.translate(-5, j * 40, z-500);
        pg.box(15, 15, 1000);
        pg.popMatrix();
      }
      // pg.endShape(p.CLOSE);
      pg.popMatrix();
    }
    // pg.translate(0, 0, -25);
    pg.popMatrix();
    pg.translate(0, 0, -1000);
    pg.box(3000, 3000, 1);
    // pg.rotateX(t);
    // pg.rotateY(t);
    // pg.box(50);
    pg.endDraw();
  }

  p.draw = function () {
    t = (getCount() / 30.0);

    p.background(0);
  
    drawGeometry(dof.getSrc(), t, true);
    drawGeometry(dof.getDepth(), t, false);
  
    dof.draw();
  
    // dof.focus = 0.7;
    dof.focus = 0.5;//p.map(p.mouseX, 0, p.width, -0, 0.5);
    // let mid = p.map(p.mouseX, 0, p.width, 0, 400);
    let mid = 130;//p.map(Math.sin(t), -1, 1, -100, 400);
    dof.minDepth = mid - 100.0;
    dof.maxDepth = mid + 100.0;
  
    p.image(dof.dest2, 0, 0);
    // p.image(dof.getDest(), 0, 0);

    if(getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p061 = new p5(s);
