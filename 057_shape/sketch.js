var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");

function S057(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.shader = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");

  let poly = new Packages.toxi.geom.Rect(0, 0, this.width, this.height);
  this.clip = new Packages.toxi.geom.ConvexPolygonClipper(poly.toPolygon2D());
}

S057.prototype = Object.create(TLayer.prototype);
S057.prototype.constructor = S057;

S057.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    // this.shader = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");
  }
  this.lastT = t;
}

S057.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  let c0 = 3;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  pg.shader(this.shader);
  this.shader.set("iTime", t*2);
  c0 = 0;
  this.shader.set("fColor", colorScheme.get(c0).r/255.0, colorScheme.get(c0).g/255.0, colorScheme.get(c0).b/255.0, 1.0);
  c0 = 4;
  this.shader.set("gColor", colorScheme.get(c0).r/255.0, colorScheme.get(c0).g/255.0, colorScheme.get(c0).b/255.0, 1.0);
  // pg.clear();

  // pg.background(0);

  this.sites = [];
  let tw = Math.floor(t) + EasingFunctions.easeInOutCubic(t%1);
  for(let i = 0; i < 20; i++) {
    this.sites.push({x: p.noise(i*0.9, tw)*this.width, y: p.noise(i*0.7, tw)*this.height});
  }
  // this.sites.push({x: 0, y: 0});
  // this.sites.push({x: this.width, y: 0});
  // this.sites.push({x: this.width, y: this.height});
  // this.sites.push({x: 0, y: this.height});

  this.voronoi = new Packages.toxi.geom.mesh2d.Voronoi();
  for(let i in this.sites) {
    this.voronoi.addPoint(new Packages.toxi.geom.Vec2D(this.sites[i].x, this.sites[i].y));
  }

  pg.translate(this.width / 2, this.height / 2);
  pg.scale(1.5, 1.5);
  pg.translate(-this.width / 2, -this.height / 2);
  pg.noStroke();

  for(let i in this.voronoi.getTriangles()) {
    let triangle = this.voronoi.getTriangles()[i];
    // print(Object.keys(triangle))
    // print(triangle.a)
    let index = i * 0;//.1;
    if(Math.abs(triangle.a.x) > this.width) continue;
    if(Math.abs(triangle.a.y) > this.width) continue;
    if(Math.abs(triangle.b.x) > this.width) continue;
    if(Math.abs(triangle.b.y) > this.width) continue;
    if(Math.abs(triangle.c.x) > this.width) continue;
    if(Math.abs(triangle.c.y) > this.width) continue;
    pg.beginShape();
    pg.fill(255, 0, 0, index);
    pg.vertex(triangle.a.x, triangle.a.y)
    pg.fill(0, 255, 0, index);
    pg.vertex(triangle.b.x, triangle.b.y)
    pg.fill(0, 0, 255, index);
    pg.vertex(triangle.c.x, triangle.c.y)
    // for(let j in poly.vertices) {
    //   let v = poly.vertices[j];
    //   pg.vertex(v.x, v.y);
    // }
    pg.endShape(p.CLOSE);
  }

  // pg.translate(this.width / 2, this.height / 2);
  // pg.rotateX(Math.PI / 4);
  // pg.rotateY(t * 0.1);

  // pg.pushMatrix();
  // pg.noStroke();
  // pg.blendMode(p.BLEND);

  // for(let i = -25; i <= 5; i++) {
  //   for(let j = 0; j < 8; j++) {
  //     for(let k = 0; k < 2; k++) {
  //       pg.push();
  //       pg.rotateY(j / 4 * Math.PI);// + (i) / 16 * Math.PI);
  //       let tween = (t*1 + i * 0.25 + 3) % 4;
  //       if(tween < 2) {
  //         pg.rotateY(EasingFunctions.easeInOutQuad(tween/2)*2 * Math.PI);
  //         if(tween > 1) tween = 2 - tween;
  //         pg.translate(0, 0, -220 * EasingFunctions.easeInOutQuad(tween));
  //         pg.scale(1-0.5*EasingFunctions.easeInOutQuint(tween), 1, 1);
  //       }
  //       // obviously this is quite ffkked up
  //       pg.scale(0.5, 75.0/275.0, 1);
  //       let side = 275;
  //       pg.translate(0, i * side*2, 370);
  //       if((i+3+j)%2==0)
  //       pg.rotateY(Math.PI)
  //       pg.rotate(k * Math.PI);
  //       pg.beginShape();
  //       let index = (i + 6) * 2.0;// + (j*2);// + k * 56;
  //       pg.fill(255, 0, 0, index);
  //       pg.vertex(-side, -side, 0);
  //       pg.fill(0, 255, 0, index);
  //       pg.vertex(side, -side, 0);
  //       pg.fill(0, 0, 255, index);
  //       pg.vertex(-side, side, 0);
  //       pg.endShape();
  //       pg.pop();
  //     }
  //   }
  // }

  // pg.popMatrix();
}

////////

var s = function (p) {
  let s057 = new S057(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s057.draw({t: t});
    p.background(0);
    p.image(s057.pg, 0, 0);
  }
};

var p057 = new p5(s);
