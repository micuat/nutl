var colorScheme = new ColorScheme("4d9de0-e15554-e1bc29-3bb273-7768ae");


function S023Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pgC = p.createGraphics(this.width, this.height, p.P3D);
  this.pgN = p.createGraphics(this.width, this.height, p.P3D);
  this.rdParam = p.createGraphics(this.width, this.height, p.P3D);
  this.rdParam.beginDraw();
  this.rdParam.noStroke();
  for(let i = 0; i < this.height; i++) {
    for(let j = 0; j < this.width; j++) {
      this.rdParam.fill(p.noise(j*0.005, i*0.005) * 255, p.noise(j*0.005 + 0.1, i*0.005 - 0.2) * 255, 0);
      this.rdParam.rect(j, i, 1, 1);
    }
  }
  this.rdParam.endDraw();

  this.pass = 0;
  function createTexture(w, h){
    let pg = p.createGraphics(w, h, p.P3D);
    pg.smooth(0);
    pg.beginDraw();
    pg.blendMode(p.REPLACE);
    pg.clear();
    pg.noStroke();
    pg.endDraw();
    return pg;
  }
  this.shader_grayscott = p.loadShader("shaders/grayscott/grayscott2.frag");
  this.shader_render = p.loadShader("shaders/grayscott/render2.frag");
  this.pg_src = createTexture(this.width, this.height);
  this.pg_dst = createTexture(this.width, this.height);
  this.params = {
    kill: 0.062
  };
   
  // init
  this.pg_src.beginDraw();
  this.pg_src.background(255, 255, 0, 0);
  this.pg_src.fill(0, 0, 255, 255);
  this.pg_src.noStroke();
  this.pg_src.rectMode(p.CENTER);
  //
  this.pg_src.endDraw();
}

S023Tex.prototype.swap = function (){
  let pg_tmp = this.pg_src;
  this.pg_src = this.pg_dst;
  this.pg_dst = pg_tmp;
}

S023Tex.prototype.reactionDiffusionPass = function (){
  this.pg_dst.beginDraw();
  this.pg_dst.noStroke();
  this.pg_dst.fill(255);
  this.pg_dst.textureWrap(this.p.REPEAT); 
  this.shader_grayscott.set("dA"    , 1.0  );
  this.shader_grayscott.set("dB"    , 0.5  );
  this.shader_grayscott.set("feed"  , 0.055);
  this.shader_grayscott.set("kill"  , this.params.kill);
  this.shader_grayscott.set("dt"    , 1.0  );
  this.shader_grayscott.set("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_grayscott.set("tex"   , this.pg_src);
  this.shader_grayscott.set("paramTex"   , this.rdParam);
  this.pg_dst.shader(this.shader_grayscott);
  this.pg_dst.rectMode(this.p.CORNER);
  this.pg_dst.rect(0, 0, this.width, this.height);
  this.pg_dst.endDraw(); 
  this.swap();
  this.pass++;
}

S023Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;
  let pgC = this.pgC;
  let pgN = this.pgN;

  this.pg_src.beginDraw();
  this.pg_src.resetShader();
  if(p.frameCount % 60000 == 0) {
    this.params = {
      kill: p.randomGaussian(0.062, 0.001)
    };  
    this.pg_src.background(255, 255, 0, 0);
  }
  this.pg_src.fill(0, 0, 255, 255);
  this.pg_src.noStroke();
  this.pg_src.rectMode(p.CENTER);
  for(let i = -2; i <= 2; i++) {
    let x = (this.width * 0.5 + t * 0.1 / Math.PI / 2 * this.width + this.width*0.1) % this.width;
    this.pg_src.rect(x, this.height * 0.5 + i * 100, 10, 10);
  }
  this.pg_src.endDraw();

  for(let i = 0; i < 5; i++){
    this.reactionDiffusionPass();
  }

  pgC.beginDraw();

  // display result (color)
  let cA = colorScheme.get(0);
  let cB = colorScheme.get(1);
  let cC = colorScheme.get(2);
  this.shader_render.set("colorA", cA.r/255.0, cA.g/255.0, cA.b/255.0);
  this.shader_render.set("colorB", cB.r/255.0, cB.g/255.0, cB.b/255.0);
  this.shader_render.set("colorC", cC.r/255.0, cC.g/255.0, cC.b/255.0);
  this.shader_render.set("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_render.set("tex"   , this.pg_src);
  pgC.shader(this.shader_render);
  pgC.rectMode(p.CORNER);
  pgC.noStroke();
  pgC.fill(255);
  pgC.rect(0, 0, pgC.width, pgC.height);

  pgC.endDraw();

  pgN.beginDraw();
 
  // display result (normal)
  this.shader_render.set("colorA", 0.0, 0.0, 1.0);
  this.shader_render.set("colorB", 0.0, 0.0, 0.0);
  this.shader_render.set("colorC", 1.0, 0.0, 0.0);
  this.shader_render.set("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_render.set("tex"   , this.pg_src);
  pgN.shader(this.shader_render);
  pgN.rectMode(p.CORNER);
  pgN.noStroke();
  pgN.fill(255);
  pgN.rect(0, 0, pgN.width, pgN.height);

  pgN.endDraw();

  pg.beginDraw();
  pg.tint(255, 50);
  pg.image(pgC, 0, 0);
  pg.endDraw();
}

////////

function S025Tex(p, w, h) {
  this.p = p;
  this.width = w, this.height = h;
  this.dwgl = Packages.com.thomasdiewald.pixelflow.java.dwgl;

  this.pg = p.createGraphics(this.width, this.height, p.P3D);

  this.context = p.pfContext;
  this.tex_grayscott = new this.dwgl.DwGLTexture.TexturePingPong();

  let GL = Java.type("com.jogamp.opengl.GL");
  // 1) 32 bit per channel
  this.tex_grayscott.resize(this.context, GL.GL_RGBA32F, this.width, this.height, GL.GL_RGBA, GL.GL_FLOAT, GL.GL_NEAREST, 2, 4);
  this.tex_grayscott.src.setParamWrap(GL.GL_REPEAT);
  this.tex_grayscott.dst.setParamWrap(GL.GL_REPEAT);

  // glsl shader
  this.shader_grayscott   = this.context.createShader(p.folderName + "/shaders/diff.frag");
  this.shader_render      = this.context.createShader(p.folderName + "/shaders/render.frag");
  this.shader_render_mono = this.context.createShader(p.folderName + "/shaders/render_mono.frag");

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
  for(let i = 0; i < 6; i++) {
    this.tex_render.pushMatrix();
    this.tex_render.translate(p.random(this.width), p.random(this.height));
    this.tex_render.scale(2, 2);
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

  this.tex_render_normal = p.createGraphics(this.width, this.height, p.P3D);
  this.tex_render_normal.smooth(0);
  this.tex_render_normal.beginDraw();
  this.tex_render_normal.endDraw();
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
  this.shader_render.uniform1f     ("amplitude", 10.0);
  this.shader_render.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_render.drawFullScreenQuad();
  this.shader_render.end();
  this.context.endDraw("render()"); 

  this.context.beginDraw(this.tex_render_normal);
  this.shader_render_mono.begin();
  this.shader_render_mono.uniform2f     ("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_render_mono.uniform1f     ("amplitude", 10.0);
  this.shader_render_mono.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_render_mono.drawFullScreenQuad();
  this.shader_render_mono.end();
  this.context.endDraw("rendernormal()"); 

  this.context.end();

  pg.beginDraw();
  pg.image(this.tex_render, 0, 0);
  pg.endDraw();
}

////////

function S041Tex(p, w, h) {
  TLayer.call(this, p, w, h*2);
  this.pg.smooth(5);

  this.hydra0 = new Hydra();
  this.hydra1 = new Hydra();
  let ci0 = colorScheme.get(0);
  let ci3 = colorScheme.get(1);
  this.hydra0.osc(3).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
  this.tHydra0 = new THydra(p, this.width, this.height/2, this.hydra0);

  this.hydra2 = new Hydra();
  this.hydra3 = new Hydra();
  this.hydra2.osc(3).modulate(this.hydra3.voronoi(3.0), 0.1)
  .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
  this.tHydra1 = new THydra(p, this.width, this.height/2, this.hydra2);
  this.tHydra = this.tHydra0;
  this.lastT = 0;
  this.tBase = 0;
}

S041Tex.prototype = Object.create(TLayer.prototype);

S041Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    // this.tHydra = p.random([this.tHydra0, this.tHydra1]);
  }
  this.lastT = t;

  // this.tHydra.draw({t: t});
}

S041Tex.prototype.drawLayer = function(pg, key, args) {
  let p = this.p;

  pg.blendMode(p.BLEND);
  // pg.clear();
  // this.tHydra.drawTo(pg);
  if(this.refPg != undefined) {
    pg.tint(255, 10);
    pg.image(this.refPg, 0, 0, this.width, this.height / 2);
    pg.translate(0, this.height/2);
    pg.tint(255, 30);
    pg.image(this.refPg, 0, 0, this.width, this.height / 2);
  }
}

S041Tex.prototype.constructor = S041Tex;

////////

function S041(p, w, h, refPg) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.1;
  this.uRoughness = 0.04;
  this.uSpecular = 0.1;
  this.uExposure = 1.5;
  this.uVignette = 0.1;
  this.uLightRadius = 1000.0;
  this.uUseTexture = 1;
  this.tex = new S041Tex(p, w, h);
  this.texture = this.tex.pg;

  this.tex.refPg = refPg;

  {
    let w = 10.0;
    let x0 = -w, y0 = -w, z0 = -w;
    let x1 = w, y1 = w, z1 = w;
  
    let vertices = [];
    let normals = [];
    function addVertex(x,y,z) {vertices.push({x: x, y: y, z: z})}
    function addNormal(x,y,z) {normals.push({x: x, y: y, z: z})}
    // +Z "front" face
    addNormal( 0,  0,  1);
    addVertex(x0, y0, z1, 0.25, 0.25);
    addVertex(x1, y0, z1, 0.5 , 0.25);
    addVertex(x1, y1, z1, 0.5 , 0.5);
    addVertex(x0, y1, z1, 0.25, 0.5);
  
    // -Z "back" face
    addNormal( 0,  0, -1);
    addVertex(x1, y0, z0, 0.5 , 1.0);
    addVertex(x0, y0, z0, 0.25, 1.0);
    addVertex(x0, y1, z0, 0.25, 0.75);
    addVertex(x1, y1, z0, 0.5 , 0.75);
  
    // +Y "bottom" face
    addNormal( 0,  1,  0);
    addVertex(x0, y1, z1, 0.25, 0.5);
    addVertex(x1, y1, z1, 0.5 , 0.5);
    addVertex(x1, y1, z0, 0.5 , 0.75);
    addVertex(x0, y1, z0, 0.25, 0.75);
  
    // -Y "top" face
    addNormal( 0, -1,  0);
    addVertex(x0, y0, z0, 0.25, 0.0);
    addVertex(x1, y0, z0, 0.5 , 0.0);
    addVertex(x1, y0, z1, 0.5 , 0.25);
    addVertex(x0, y0, z1, 0.25, 0.25);
  
    // +X "right" face
    addNormal( 1,  0,  0);
    addVertex(x1, y0, z1, 0.25, 0.5);
    addVertex(x1, y0, z0, 0.25, 0.75);
    addVertex(x1, y1, z0, 0.5 , 0.75);
    addVertex(x1, y1, z1, 0.5 , 0.5);
  
    // -X "left" face
    addNormal(-1,  0,  0);
    addVertex(x0, y0, z0, 0.25, 0.0);
    addVertex(x0, y0, z1, 0.25, 0.25);
    addVertex(x0, y1, z1, 0.5 , 0.25);
    addVertex(x0, y1, z0, 0.5 , 0.0);
    this.vertices = vertices;
    this.normals = normals;
    this.tx = new Array(this.vertices.length, 0);
    this.ty = new Array(this.vertices.length, 0);
  }
}

S041.prototype = Object.create(SRendererShadow.prototype);

S041.prototype.drawScene = function (pg, isShadow) {
  let p = this.p;
  pg.clear();

  pg.pushMatrix();
  pg.fill(255);
  // pg.rotateX(0.3);
  // let shape = p.createShape();

  for(let j = 0; j < 2; j++) {
    pg.pushMatrix();

    pg.scale(2.5, 2.5, 10);
    let st = (this.t * 0.5) % 2;
    let y = 0;
    let theta = 0;
    if(st > 2) {
      y = EasingFunctions.easeInOutQuad(st - 2) + 1;
      theta = Math.PI / 2;
    }
    else if(st > 1) {
      y = 1;
      theta = EasingFunctions.easeInOutCubic(st - 1) * Math.PI / 2;
    }
    else {
      y = EasingFunctions.easeInOutQuad(st);
    }
    pg.translate(0, -250 * y + j * 250, 0);
    pg.rotateZ(theta);
    pg.beginShape(p.QUADS);
    pg.texture(this.texture);
    pg.textureMode(p.NORMAL);
    for(let i = 0; i < this.vertices.length; i++) {
      let n = this.normals[Math.floor(i/4)];
      let v = this.vertices[i];
      pg.normal(n.x, n.y, n.z);
      let tx = pg.screenX(v.x, v.y, v.z) / this.width;
      let ty = pg.screenY(v.x, v.y, v.z) / this.height;
      pg.vertex(v.x, v.y, v.z, tx, ty);
    }
    pg.endShape(p.CLOSE);
    pg.popMatrix();
  }

  pg.pushMatrix();
  // pg.scale(1, 1, 0.1);
  // pg.translate(0, 0, 100);
  // pg.box(100);
  // pg.beginShape(p.QUADS);
  // pg.texture(this.texture);
  // pg.textureMode(p.NORMAL);
  // for(let i = 0; i < this.vertices.length; i++) {
  //   let n = this.normals[Math.floor(i/4)];
  //   let v = this.vertices[i];
  //   pg.normal(n.x, n.y, n.z);
  //   let tx = pg.screenX(v.x, v.y, v.z) / this.width;
  //   let ty = pg.screenY(v.x, v.y, v.z) / this.height;
  //   pg.vertex(v.x, v.y, v.z, tx, ty);
  // }
  // pg.endShape(p.CLOSE);
  pg.popMatrix();
  // pg.shape(shape);
  pg.popMatrix();

}
S041.prototype.draw = function(t) {
  this.t = t;
  let p = this.p;
  this.tex.draw({t: t});
  this.cameraPosition = p.createVector(0.0, -200.0, 10.0);
  this.lightPos = p.createVector(500.0, -100.0, 300.0);
  this.cameraTarget = p.createVector(0.0, 0.0, 0.0);

  // this.lightPos.set(-400, -200, 400);
  this.lightDirection = this.lightPos;
  Object.getPrototypeOf(S041.prototype).draw.call(this);
}

S041.prototype.constructor = S041;

var s = function (p) {
  let hiddenPg = p.createGraphics(800, 800, p.P3D);
  let s041 = new S041(p, 800, 800, hiddenPg);
  let s025 = new S023Tex(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    s041.setup();

    this.hydra0 = new Hydra();
    this.hydra1 = new Hydra();
    let ci0 = colorScheme.get(3);
    let ci3 = colorScheme.get(1);
    this.hydra0.osc(20).rotate(0, 0.25*3.1415).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
    .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
    this.tHydra = new THydra(p, this.width, this.height, this.hydra0);  
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    this.tHydra.draw({t: t});
    s025.draw(t);
    s041.draw(t);

    hiddenPg.beginDraw();
    // this.tHydra.drawTo(hiddenPg);
    hiddenPg.image(s025.pg, 0, 0);
    hiddenPg.image(s041.pg, 0, 0);
    hiddenPg.endDraw();

    p.background(0);
    // p.image(s025.pg, 0, 0);
    p.image(s041.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p041 = new p5(s);
