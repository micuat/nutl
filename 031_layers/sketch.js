var colorScheme = new ColorScheme("61e294-7bcdba-9799ca-bd93d8-b47aea");
// var colorScheme = new ColorScheme("dfbbb1-f56476-e43f6f-373f51-008dd5");

function TLayer (p, w, h) {
  this.p = p;
  this.width = w;
  this.height = h;
  if(this.patterns == undefined) {
    this.patterns = ["default"];
  }
  this.pgs = {};
  for(let i in this.patterns) {
    let key = this.patterns[i];
    this.pgs[key] = p.createGraphics(this.width, this.height, p.P3D);
  }
  this.pg = this.pgs.default;
}

TLayer.prototype.update = function (args) {
}

TLayer.prototype.draw = function (args) {
  let p = this.p;
  this.update(args);
  for(let key in this.pgs) {
    this.pgs[key].beginDraw();
    this.drawLayer(this.pgs[key], key, args);
    this.pgs[key].endDraw();
  }
}

TLayer.prototype.drawTo = function (pg, key) {
  if(key == undefined) {
    pg.image(this.pg, 0, 0);
  }
  else {
    pg.image(this.pgs[key], 0, 0);
  }
}

////////

function TDot (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDot.prototype = Object.create(TLayer.prototype);

TDot.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  pg.clear();
  let idx = 1;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  idx = 2;
  pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.noStroke();
  for(let i = 0; i < 40; i++) {
    for(let j = 0; j < 40; j++) {
      let x = (j + 0.5) * 20;
      let y = (i + 0.5) * 20;
      let r = (40 - i) * 0.75;
      pg.ellipse(x, y, r, r);
    }
  }
}

TDot.prototype.constructor = TDot;

////////

function TBackBoxes (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
  this.data = [];
  for(let i = 0; i < 40; i++) {
    let v = p5.Vector.random3D();
    v.mult(p.random(0, 400));
    let w = 20 * Math.floor(p.random(1, 5));
    v.x = Math.floor(v.x/w) * w;
    v.y = Math.floor(v.y/w) * w;
    v.z = Math.floor(v.z/w) * w;
    idx = Math.floor(p.random(1, 5));
    this.data.push({v: v, idx: idx, w: w});
  }
}

TBackBoxes.prototype = Object.create(TLayer.prototype);

TBackBoxes.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let idx = 1;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.noStroke();
  pg.fill(255);
  pg.translate(pg.width / 2, pg.height / 2);
  pg.rotateZ(args.t);
  for(let i = 0; i < this.data.length; i++) {
    let v = this.data[i].v;
    let w = this.data[i].w;
    let idx = this.data[i].idx;
    pg.fill(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
    pg.pushMatrix();
    pg.translate(v.x, v.y, v.z);
    // pg.box(w);
    pg.sphere(w/2);
    pg.popMatrix();
  }
}

TBackBoxes.prototype.constructor = TBackBoxes;

////////

function TStripe (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TStripe.prototype = Object.create(TLayer.prototype);

TStripe.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let idx = 3;
  pg.background(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  idx = 4;
  pg.stroke(colorScheme.get(idx).r, colorScheme.get(idx).g, colorScheme.get(idx).b);
  pg.translate(this.width / 2, this.height / 2);
  pg.rotate(-Math.PI / 4);
  pg.strokeWeight(10);
  for(let i = -40; i < 40; i++) {
    let x0 = -this.width;
    let y0 = i * 20;
    let x1 = this.width;
    let y1 = i * 20;
    pg.line(x0, y0, x1, y1);
  }
}

TStripe.prototype.constructor = TStripe;

////////

function TRibbons (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.curR = p.random(0, Math.PI * 2);
  this.targetR = 0;
  this.v = p.random(0.5, 1.5);
  this.x = args.x;
  this.y = args.y;
  this.size = args.size;

  // this.pg.smooth(5);
}

TRibbons.prototype = Object.create(TLayer.prototype);

TRibbons.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t * 0.125 + 0.25;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.targetR = Math.floor(p.random(-2, 3)) * Math.PI * 0.25;
  }
  this.lastT = t;
  this.curR = p.lerp(this.curR, this.targetR, 0.05);

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  pg.translate(this.width / 2, this.height / 2);
  pg.rotate(this.curR);
  pg.translate(0, ((t * this.v) % 1) * 80);
  pg.noStroke();
  pg.fill(255);
  pg.rectMode(p.CENTER);
  let r = 40;
  for(let i = -10; i <= 10; i++) {
    pg.ellipse(0, i * 80, r, r);
  }
  pg.popStyle();
  pg.popMatrix();
}

TRibbons.prototype.constructor = TRibbons;

////////

function TBox (p, w, h, args) {
  TLayer.call(this, p, w, h);

  this.lastT = 0;
  this.params = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    rz: 0
  };
  this.paramsTarget = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    rz: 0
  };
  this.size = args.size;
  this.delay = args.delay;

  // this.pg.smooth(5);
}

TBox.prototype = Object.create(TLayer.prototype);

TBox.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;
  let t = args.t + this.delay;

  pg.clear();
  pg.pushMatrix();
  pg.pushStyle();
  pg.noStroke();

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    let key = p.random(Object.keys(this.paramsTarget));
    if(key == "w" || key == "h" || key == "d") {
      this.paramsTarget[key] = Math.floor(p.random(1, 5));
      if(this.paramsTarget[key] == 0) this.paramsTarget[key] = 1;
    }
    else if(key == "rx" || key == "rz") {
      this.paramsTarget[key] = Math.floor(p.random(-2, 2));
    }
    else {
      this.paramsTarget[key] = Math.floor(p.random(-4, 5));
    }
  }
  this.lastT = t;

  for(let key in this.params) {
    this.params[key] = p.lerp(this.params[key], this.paramsTarget[key], 0.1);
  }

  pg.translate(this.width / 2, this.height / 2);
  pg.translate(this.params.x * this.size, this.params.y * this.size);
  pg.rotateZ(this.params.rz * Math.PI / 2);
  pg.rectMode(p.CENTER);
  pg.rect(0, 0, this.size * (this.params.w + 1),
  this.size * (this.params.h + 1));
  pg.popStyle();
  pg.popMatrix();
}

TBox.prototype.constructor = TBox;

////////

function TLayerBlend (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.blendMode = args.mode;
  this.bottomLayer = args.bottom;
  this.topLayer = args.top;
  this.maskLayer = args.mask;
}

TLayerBlend.prototype = Object.create(TLayer.prototype);

TLayerBlend.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  pg.clear();
  pg.blendMode(p.BLEND);
  pg.image(this.bottomLayer, 0, 0);
  pg.blendMode(this.blendMode);
  pg.image(this.topLayer, 0, 0);
  if(this.maskLayer != undefined) {
    pg.mask(this.maskLayer);
  }
}

TLayerBlend.prototype.constructor = TLayerBlend;

////////

function TSmoke(p, w, h, args) {
  // this.patterns = ["default", "mono"];
  TLayer.call(this, p, w, h);
  this.dwgl = Packages.com.thomasdiewald.pixelflow.java.dwgl;

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

  this.tex_render_normal = p.createGraphics(this.width, this.height, p.P3D);
  this.tex_render_normal.smooth(0);
  this.tex_render_normal.beginDraw();
  this.tex_render_normal.endDraw();
}

TSmoke.prototype = Object.create(TLayer.prototype);

TSmoke.prototype.reactionDiffusionPass = function() {
  this.context.beginDraw(this.tex_grayscott.dst);
  this.shader_grayscott.begin();
  this.shader_grayscott.uniform2f     ("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_grayscott.uniformTexture("tex", this.tex_grayscott.src);
  this.shader_grayscott.drawFullScreenQuad();
  this.shader_grayscott.end();
  this.context.endDraw("reactionDiffusionPass()"); 
  this.tex_grayscott.swap();
}

TSmoke.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  // multipass rendering, ping-pong 
  this.context.begin();

  for (let i = 0; i < 2; i++) {
    this.reactionDiffusionPass();
  }

  // create display texture
  this.context.beginDraw(this.tex_render);
  this.shader_render.begin();
  let idx = 0;
  this.shader_render.uniform3f     ("colA", colorScheme.get(idx).r/255.0, colorScheme.get(idx).g/255.0, colorScheme.get(idx).b/255.0);
  idx = 1;
  this.shader_render.uniform3f     ("colB", colorScheme.get(idx).r/255.0, colorScheme.get(idx).g/255.0, colorScheme.get(idx).b/255.0);
  idx = 4;
  this.shader_render.uniform3f     ("colC", colorScheme.get(idx).r/255.0, colorScheme.get(idx).g/255.0, colorScheme.get(idx).b/255.0);
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
}

TSmoke.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  if(key == "default") {
    pg.image(this.tex_render, 0, 0);
  }
  else {
    pg.image(this.tex_render_normal, 0, 0);
  }
}

TSmoke.prototype.constructor = TSmoke;

////////

function TSlide (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.pg.beginDraw();
  this.pg.clear();
  // this.pg.background(0);
  this.pg.endDraw();
  this.inputs = args.inputs;
}

TSlide.prototype = Object.create(TLayer.prototype);

TSlide.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  let t = args.t;
  // this.pg.background(0, 100);
  for(let i in this.inputs) {
    if(i == 0) {
      pg.tint(255, 5);
    }
    else {
      pg.tint(255, EasingFunctions.easeInOutCubic(
        p.map(Math.sin((i / 3.0 + 0.1 * t) * Math.PI), -1, 1, 0, 1)) * 150 + 50);
    }
    pg.image(this.inputs[i], 0, 0);
  }
}

TSlide.prototype.constructor = TSlide;

////////

function S031Tex(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tSmoke = new TSmoke(p, this.width, this.height);

  this.tStripe = new TStripe(p, this.width, this.height);
  this.tStripe.draw();

  this.tBackBoxes = new TBackBoxes(p, this.width, this.height);

  this.tObjects = [];
  this.tLayers = [this.tSmoke.pg]
  for(let i = 0; i < 3; i++) {
    let TObj = TBox;
    // if(i == 3) TObj = TRibbons;
    // else TObj = TBox;
    let tBox = new TObj(p, this.width, this.height, {
      x: p.random(this.width),
      y: p.random(this.height),
      size: 100,
      delay: i % 2 == 0 ? 0.5 : 0.0
    });
    let layeredBox = new TLayerBlend(p, this.width, this.height, {
      top: [this.tBackBoxes.pg, this.tStripe.pg, this.tSmoke.pg][i % 3],
      bottom: tBox.pg,
      mask: tBox.pg,
      mode: p.MULTIPLY
    });
        
    this.tObjects.push({
      tBox: tBox,
      layeredBox: layeredBox,
    });
    this.tLayers.push(layeredBox.pg);
  }

  this.tSlide = new TSlide(p, this.width, this.height, {
    inputs: this.tLayers
  });
}

S031Tex.prototype = Object.create(TLayer.prototype);

S031Tex.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  this.tSmoke.draw({t: t});
  this.tBackBoxes.draw({t: t});

  for(let i in this.tObjects) {
    this.tObjects[i].tBox.draw({t: t});
    this.tObjects[i].layeredBox.draw({t: t});
  }
  this.tSlide.draw({t: t});
}


S031Tex.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.background(255);

  this.tSmoke.drawTo(pg);
  // pg.image(this.tSmoke.pgs.mono, 0, 0);
  // for(let i in this.tObjects) {
  //   this.tObjects[i].layeredBox.drawTo(pg);
  // }
  this.tSlide.drawTo(pg);
}

S031Tex.prototype.constructor = S031Tex;


var s = function (p) {
  let s031Tex = new S031Tex(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s031Tex.draw({t: t});
    p.image(s031Tex.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p031 = new p5(s);
