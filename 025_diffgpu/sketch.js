function S024Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.dwgl = Packages.com.thomasdiewald.pixelflow.java.dwgl;

  this.context = p.pfContext;
  this.tex_grayscott = new this.dwgl.DwGLTexture.TexturePingPong();

  let GL = Java.type("com.jogamp.opengl.GL");
  // 1) 32 bit per channel
  this.tex_grayscott.resize(this.context, GL.GL_RGBA32F, this.width, this.height, GL.GL_RGBA, GL.GL_FLOAT, GL.GL_NEAREST, 2, 4);
  this.tex_grayscott.src.setParamWrap(GL.GL_REPEAT);
  this.tex_grayscott.dst.setParamWrap(GL.GL_REPEAT);

  // glsl shader
  this.shader_grayscott = this.context.createShader(p.folderName + "/shaders/diff.frag");
  this.shader_render    = this.context.createShader(p.folderName + "/shaders/render.frag");

  // init
  this.tex_render = p.createGraphics(this.width, this.height, p.P3D);
  this.tex_render.smooth(0);
  this.tex_render.beginDraw();
  this.tex_render.textureSampling(2);
  this.tex_render.blendMode(p.REPLACE);
  this.tex_render.clear();
  this.tex_render.noStroke();
  this.tex_render.background(0, 0, 0, 0);
  this.tex_render.noStroke();
  this.tex_render.rectMode(p.CENTER);
  for(let i = 0; i < 3; i++) {
    this.tex_render.pushMatrix();
    this.tex_render.translate(p.random(this.width), p.random(this.height));
    this.tex_render.scale(3, 1);
    this.tex_render.beginShape(p.QUAD);
    this.tex_render.fill(p.random(255), p.random(255), 0, 255);
    this.tex_render.vertex(-100, -100);
    this.tex_render.fill(p.random(255), p.random(255), 0, 255);
    this.tex_render.vertex(100, -100);
    this.tex_render.fill(p.random(255), p.random(255), 0, 255);
    this.tex_render.vertex(100, 100);
    this.tex_render.fill(p.random(255), p.random(255), 0, 255);
    this.tex_render.vertex(-100, 100);
    this.tex_render.endShape();
    this.tex_render.popMatrix();
  }
  this.tex_render.endDraw();

  // // copy initial data to source texture
  let imageprocessing = Packages.com.thomasdiewald.pixelflow.java.imageprocessing;
  imageprocessing.filter.DwFilter.get(this.context).copy.apply(this.tex_render, this.tex_grayscott.src);
}

S024Tex.prototype.reactionDiffusionPass = function() {
  this.context.beginDraw(this.tex_grayscott.dst);
  this.shader_grayscott.begin();
  this.shader_grayscott.uniform2f     ("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_grayscott.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_grayscott.drawFullScreenQuad();
  this.shader_grayscott.end();
  this.context.endDraw("reactionDiffusionPass()"); 
  this.tex_grayscott.swap();
}

S024Tex.prototype.draw = function(t) {
  let p = this.p;

  // multipass rendering, ping-pong 
  this.context.begin();

  for (let i = 0; i < 2; i++) {
    this.reactionDiffusionPass();
  }

  // create display texture
  this.context.beginDraw(this.tex_render);
  this.shader_render.begin();
  this.shader_render.uniform2f     ("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_render.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_render.drawFullScreenQuad();
  this.shader_render.end();
  this.context.endDraw("render()"); 
  this.context.end();
}

var s = function (p) {
  let s024Tex = new S024Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");
  // with(p) {
  //   print(random(100))
  // }

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s024Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s024Tex.draw(t);
    p.image(s024Tex.tex_render, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p024 = new p5(s);
