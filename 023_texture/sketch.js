function S023 (p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.uMetallic = 0.8;
  this.uRoughness = 0.1;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;
  this.uVignette = 0.0;
  this.uUseTexture = 1;
}

S023.prototype = Object.create(SRendererShadow.prototype, {
  setup: {
    value: function () {
      let p = this.p;
      this.shape = p.createShape(p.GROUP);
      let n = 64;
      let r = 100;
      for(let i = -n; i <= n; i++) {
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
            let y0 = r * Math.sin(phi) * Math.sin(theta);
            let z0 = r * Math.cos(phi);
            s.normal(x0, y0, z0);
            s.vertex(x0, y0, z0, phi / Math.PI, (theta / Math.PI) * 0.5 + 0.5);
          }
        }
        s.endShape(this.p.CLOSE);
        this.shape.addChild(s);
      }
      // Polygons.Dice(this.shape, -100, -100, -100, 100, 100, 100);
      Object.getPrototypeOf(S023.prototype).setup(this);
    }
  },
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
    
      pg.pushMatrix();
      pg.fill(255);
      // let idx = 1;
      // pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      // pg.rotateX((p.frameCount+i*30)*Math.PI/150);
      // pg.rotateY((p.frameCount+i*30)*Math.PI/170);
      // pg.rotateZ((p.frameCount+i*30)*Math.PI/90);
      pg.shape(this.shape);
      pg.popMatrix();

      pg.popMatrix();

      // if(!isShadow) this.defaultShader.set("uUseTexture", 0);
      // idx = 1;
      // pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      // pg.pushMatrix();
      // pg.translate(0, 280, 0);
      // pg.box(6000, 40, 6000);
      // pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(-400, -200, 400);
      this.lightDirection = this.lightPos;
      let cycle = 90;
      Object.getPrototypeOf(S023.prototype).draw(this);
    }
  }
});

S023.prototype.constructor = S023;

function S023Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height * 2, p.P3D);
  this.pgC = p.createGraphics(this.width, this.height, p.P3D);
  this.pgN = p.createGraphics(this.width, this.height, p.P3D);

  this.pass = 0;
  function createTexture(w, h){
    let pg = p.createGraphics(w, h, p.P3D);
    pg.smooth(0);
    pg.beginDraw();
    // pg.textureSampling(2);
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
   
  // init
  this.pg_src.beginDraw();
  this.pg_src.background(255, 255, 0, 0);
  this.pg_src.fill(0, 0, 255, 255);
  this.pg_src.noStroke();
  this.pg_src.rectMode(p.CENTER);
  for(let i = -10; i <= 10; i++) {
    this.pg_src.rect(this.width * 0.5 + i * 50, this.height * 0.5, 10, 10);
  }
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
  this.shader_grayscott.set("dA"    , 1.0  );
  this.shader_grayscott.set("dB"    , 0.5  );
  this.shader_grayscott.set("feed"  , 0.055);
  this.shader_grayscott.set("kill"  , 0.062);
  this.shader_grayscott.set("dt"    , 1.0  );
  this.shader_grayscott.set("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_grayscott.set("tex"   , this.pg_src);
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
  pgC.beginDraw();
  // let idx = 0;
  // pgC.background(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
  // pgC.noStroke();
  // idx = 4;
  // pgC.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
  // pgC.rect(0, 0, this.width / 2.0, this.height);
  pgC.endDraw();

  for(let i = 0; i < 30; i++){
    this.reactionDiffusionPass();
  }

  pgN.beginDraw();
 
  // display result
  this.shader_render.set("wh_rcp", 1.0/this.width, 1.0/this.height);
  this.shader_render.set("tex"   , this.pg_src);
  pgN.shader(this.shader_render);
  pgN.rectMode(p.CORNER);
  pgN.noStroke();
  pgN.fill(255);
  pgN.rect(0, 0, pgN.width, pgN.height);

  pgN.endDraw();

  pg.beginDraw();
  pg.image(pgN, 0, 0);
  pg.image(pgN, 0, this.height);
  pg.endDraw();
}

var s = function (p) {
  let s023 = new S023(p, 800, 800);
  let s023Tex = new S023Tex(p, 800, 800);
  let colorScheme = new ColorScheme("e8ac14-ff001d-ff0072-f200de-910060");

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s023.texture = s023Tex.pg;
    s023.colorScheme = colorScheme;
    s023Tex.colorScheme = colorScheme;
    s023.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.1;
    s023.cameraPosition = p.createVector(300.0 * Math.cos(angle), -150.0, 300.0 * Math.sin(angle));
    s023.cameraTarget = p.createVector(0.0, 0.0, 0.0);
    // s023.cameraPosition = p.createVector(0.0, 0.0, 500.0);
    // s023.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.background(0);
    s023Tex.draw(t);
    p.image(s023Tex.pg, 0, 0, 800, 1600);

    p.resetShader();
    s023.draw(t);
    p.image(s023.pg, 0, 0);

  }

  p.oscEvent = function(m) {
  }
};

var p023 = new p5(s);
