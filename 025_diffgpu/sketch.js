function S025 (p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.8;
  this.uRoughness = 0.1;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;
  this.uVignette = 0.0;
  this.uUseTexture = 1;
}

S025.prototype = Object.create(SRendererShadow.prototype, {
  setup: {
    value: function () {
      let p = this.p;
      this.shape = p.createShape(p.GROUP);
      let n = 64;
      let r = 150;
      for(let i = -n; i < n; i++) {
        let s = p.createShape();
        s.beginShape(this.p.TRIANGLE_STRIP);
        s.texture(this.texture);
        s.textureMode(p.NORMAL);
        s.noStroke();
        s.fill(255);
        for(let j = -n; j <= n; j++) {
          for(let ii = 1; ii >= 0; ii--) {
            let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
            let phi = p.map(j, -n, n, 0, Math.PI);
            let x0 = r * Math.sin(phi) * Math.cos(theta);
            let z0 = r * Math.sin(phi) * Math.sin(theta);
            let y0 = r * Math.cos(phi);
            s.normal(x0, y0, z0);
            s.vertex(x0, y0, z0, (theta / Math.PI) * 0.5 + 0.5, phi / Math.PI);
          }
        }
        s.endShape(this.p.CLOSE);
        this.shape.addChild(s);
      }
      Object.getPrototypeOf(S025.prototype).setup(this);
    }
  },
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
    
      pg.pushMatrix();
      pg.fill(255);
      pg.shape(this.shape);
      pg.popMatrix();

      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      // this.lightPos.set(-400, -200, 400);
      this.lightDirection = this.lightPos;
      let cycle = 90;
      Object.getPrototypeOf(S025.prototype).draw(this);
    }
  }
});

S025.prototype.constructor = S025;

function S025Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.dwgl = Packages.com.thomasdiewald.pixelflow.java.dwgl;

  this.pg = p.createGraphics(this.width, this.height * 2, p.P3D);

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

S025Tex.prototype.reactionDiffusionPass = function() {
  this.context.beginDraw(this.tex_grayscott.dst);
  this.shader_grayscott.begin();
  this.shader_grayscott.uniform2f     ("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_grayscott.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_grayscott.drawFullScreenQuad();
  this.shader_grayscott.end();
  this.context.endDraw("reactionDiffusionPass()"); 
  this.tex_grayscott.swap();
}

S025Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

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

  pg.beginDraw();
  pg.image(this.tex_render, 0, 0);
  pg.image(this.tex_render, 0, this.height);
  pg.endDraw();
}

var s = function (p) {
  let s025 = new S025(p, 800, 800);
  let s025Tex = new S025Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");
  s025.texture = s025Tex.pg;
  s025.colorScheme = colorScheme;
  s025Tex.colorScheme = colorScheme;
  s025.setup();
  // with(p) {
  //   print(random(100))
  // }

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s025Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.1;
    s025.cameraPosition = p.createVector(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
    s025.lightPos = p.createVector(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
    s025.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.background(0);
    s025Tex.draw(t);
    p.image(s025Tex.pg, 0, 0, 800, 1600);

    p.resetShader();
    s025.draw(t);
    p.image(s025.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p025 = new p5(s);
