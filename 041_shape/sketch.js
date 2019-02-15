var colorScheme = new ColorScheme("4d9de0-e15554-e1bc29-3bb273-7768ae");

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
  this.uMetallic = 0.9;
  this.uRoughness = 0.1;
  this.uSpecular = 0.5;
  this.uExposure = 2.0;
  this.uVignette = 0.9;
  this.uUseTexture = 1;
  this.tex = new S041Tex(p, w, h);
  this.texture = this.tex.pg;

  this.tex.refPg = refPg;

  {
    let w = 10.0;
    let x0 = -w*15.0, y0 = -w/2, z0 = -w;
    let x1 = w*15.0, y1 = w/2, z1 = w;
  
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

  for(let j = -5; j <= 5; j++) {
    for(let k = -5; k <= 5; k++) {
      pg.pushMatrix();
      pg.rotateX(EasingFunctions.easeInOutQuad((this.t * 0.125 + (k*0.25+j*0.125))%1.0) * Math.PI * 2);
      pg.rotateZ(EasingFunctions.easeInOutQuint((this.t * 0.125 + (k*0.25+j*0.125))%1.0) * Math.PI * 2);
    
      pg.translate(0, k * 25, j * 25);
      pg.scale(1.0-(Math.sin(this.t * 0.5 + (k*0.25+j*0.125)*0.125)*0.5+0.5), 1.0, 1.0);
      pg.rotateX(Math.sin((this.t * 0.25 + j*0.25)%1.0) * Math.PI * 2);
      pg.beginShape(p.QUADS);
      pg.texture(this.texture);
      pg.textureMode(p.NORMAL);
      for(let i = 0; i < this.vertices.length; i++) {
        let n = this.normals[Math.floor(i/4)];
        let v = this.vertices[i];
        pg.normal(n.x, n.y, n.z);
        let tx = pg.screenX(v.x, v.y, v.z) / this.width;
        let ty = pg.screenY(v.x, v.y, v.z) / this.height;
        if(true||p.frameCount % 30 == 0) {
          this.tx[i] = tx;
          this.ty[i] = ty;
        }
        else {
          tx = this.tx[i];
          ty = this.ty[i];
        }
        pg.vertex(v.x, v.y, v.z, tx, ty);
      }
      pg.endShape(p.CLOSE);
      pg.popMatrix();
    }
  }

  // pg.shape(shape);
  pg.popMatrix();

}
S041.prototype.draw = function(t) {
  this.t = t;
  let p = this.p;
  this.tex.draw({t: t});
  this.cameraPosition = p.createVector(0.0, -300.0, 10.0);
  this.lightPos = p.createVector(0.0, -100.0, 50.0);
  this.cameraTarget = p.createVector(0.0, 0.0, 0.0);

  // this.lightPos.set(-400, -200, 400);
  this.lightDirection = this.lightPos;
  Object.getPrototypeOf(S041.prototype).draw.call(this);
}

S041.prototype.constructor = S041;

var s = function (p) {
  let hiddenPg = p.createGraphics(800, 800, p.P3D);
  let s041 = new S041(p, 800, 800, hiddenPg);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    s041.setup();

    this.hydra0 = new Hydra();
    this.hydra1 = new Hydra();
    let ci0 = colorScheme.get(3);
    let ci3 = colorScheme.get(1);
    this.hydra0.osc(20).rotate(0.25*3.1415, 0).modulate(this.hydra1.noise(3.0).rotate(-0.1), 0.1)
    .color(ci0.r/255, ci0.g/255, ci0.b/255, 1.0, ci3.r/255, ci3.g/255, ci3.b/255, 1.0);
    this.tHydra = new THydra(p, this.width, this.height, this.hydra0);  
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    this.tHydra.draw({t: t});
    s041.draw(t);

    hiddenPg.beginDraw();
    this.tHydra.drawTo(hiddenPg);
    hiddenPg.image(s041.pg, 0, 0);
    hiddenPg.endDraw();

    p.background(0);
    p.image(s041.pg, 0, 0);

  }

  p.oscEvent = function(m) {
  }
};

var p041 = new p5(s);
