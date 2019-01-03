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

TLayer.prototype.draw = function (args) {
  let p = this.p;
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

TDot.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.clear();
      pg.background(255);
      pg.fill(0);
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
  }
});

TDot.prototype.constructor = TDot;

////////

function TDotSimple (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TDotSimple.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.clear();
      pg.background(255);
      pg.fill(0);
      pg.noStroke();
      pg.translate(this.width / 2, this.height / 2);
      pg.rotate(-Math.PI / 4);
      for(let i = -40; i < 40; i++) {
        for(let j = -40; j < 40; j++) {
          let x = (j + 0.5) * 20;
          let y = (i + 0.5) * 20;
          let r = 7;
          pg.ellipse(x, y, r, r);
        }
      }
    }
  }
});

TDotSimple.prototype.constructor = TDotSimple;

////////

function TVoronoi (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
  this.voronoi = new Voronoi();

  this.sites = [];
  // create vertices
  this.margin = 0.15;
  let xmargin = this.width*this.margin,
    ymargin = this.height*this.margin,
    xo = xmargin,
    dx = this.width-xmargin*2,
    yo = ymargin,
    dy = this.height-ymargin*2,
    n = 5;
  for (let i = 0; i < n; i++) {
    this.sites.push({
      x: xo + Math.random()*dx + Math.random()/dx,
      y: yo + Math.random()*dy + Math.random()/dy
      });
  }
  this.voronoi.recycle(this.diagram);
  this.bbox = {xl: 0, xr: this.width, yt: 0, yb: this.height};
  this.diagram = this.voronoi.compute(this.sites, this.bbox);

  // let vertices = this.diagram.vertices;
  // let iVertex = vertices.length;
  // while(iVertex--) {
  //   let v = vertices[iVertex];
  //   print(Object.keys(v))
  // }
  // let edges = this.diagram.edges;
  // let iEdge = edges.length;
  // while(iEdge--) {
  //   let edge = edges[iEdge];
  //   print(Object.keys(edge.lSite))
  // }
}

TVoronoi.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.clear();
      pg.fill(255, 0, 0);
      pg.stroke(0);
      pg.strokeWeight(3);
      // pg.translate(this.width / 2, this.height / 2);
      let edges = this.diagram.edges;
      let iEdge = edges.length;
      while(iEdge--) {
        let edge = edges[iEdge];
        let va = edge.va;
        let vb = edge.vb;
        // pg.line(va.x, va.y, vb.x, vb.y);

        if(edge.lSite != undefined) {
          let vl = p.createVector(edge.lSite.x, edge.lSite.y);
          let vla = p.createVector(va.x, va.y);
          let vlb = p.createVector(vb.x, vb.y);
          vla.lerp(vl, 0.1);
          vlb.lerp(vl, 0.1);
          pg.line(vla.x, vla.y, vlb.x, vlb.y);
        }
        if(edge.rSite != undefined) {
          let vr = p.createVector(edge.rSite.x, edge.rSite.y);
          let vra = p.createVector(va.x, va.y);
          let vrb = p.createVector(vb.x, vb.y);
          vra.lerp(vr, 0.1);
          vrb.lerp(vr, 0.1);
          pg.line(vra.x, vra.y, vrb.x, vrb.y);
        }
      }
    }
  }
});

TVoronoi.prototype.constructor = TVoronoi;

////////

// function TPentagon (p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.pg.smooth(5);
// }

// TPentagon.prototype = Object.create(TLayer.prototype, {
//   drawLayer: {
//     value: function (pg, key, args) {
//       let p = this.p;
//       pg.clear();
//       pg.background(255);
//       pg.fill(0);
//       pg.noStroke();
//       pg.translate(this.width / 2, this.height / 2);
//       pg.rotate(-Math.PI / 4);
//       for(let i = -40; i < 40; i++) {
//         for(let j = -40; j < 40; j++) {
//           let x = (j + 0.5) * 20;
//           let y = (i + 0.5) * 20;
//           let r = 7;
//           pg.ellipse(x, y, r, r);
//         }
//       }
//     }
//   }
// });

// TPentagon.prototype.constructor = TPentagon;

////////

function TCenterLine (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TCenterLine.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.background(255);
      pg.stroke(0);
      pg.translate(pg.width / 2, pg.height / 2);
      for(let i = 0; i < 300; i++) {
        pg.strokeWeight(p.random(1, 3));
        let angle = p.random(0, Math.PI * 2);
        let r0 = p.random(150, 300);
        let r1 = p.random(400, 500);
        let x0 = r0 * Math.cos(angle);
        let y0 = r0 * Math.sin(angle);
        let x1 = r1 * Math.cos(angle);
        let y1 = r1 * Math.sin(angle);
        pg.line(x0, y0, x1, y1);
      }
    }
  }
});

TCenterLine.prototype.constructor = TCenterLine;

////////

function TStripe (p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
}

TStripe.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.background(255);
      pg.stroke(0);
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
  }
});

TStripe.prototype.constructor = TStripe;

////////

function TBlurb (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(5);
  this.x = args.x;
  this.y = args.y;
}

TBlurb.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      pg.pushMatrix();
      pg.pushStyle();
      pg.stroke(0);
      pg.strokeWeight(3);
      pg.fill(255);
      pg.translate(this.x, this.y);

      let pointAngle = 0 / 100.0 * p.TWO_PI;
      let pointX = 50 * Math.cos(pointAngle) * 1.5;
      let pointY = 150 * Math.sin(pointAngle) * 1.5;

      pg.translate(-pointX, -pointY);

      pg.beginShape();
      pg.vertex(pointX, pointY);

      for(let i = 2; i < 100 - 2; i++) {
        let angle = i / 100.0 * p.TWO_PI;
        let x = 50 * Math.cos(angle);
        let y = 150 * Math.sin(angle);
        pg.vertex(x, y);
      }
      pg.endShape(p.CLOSE);
      pg.popStyle();
      pg.popMatrix();
    }
  }
});

TBlurb.prototype.constructor = TBlurb;

////////

function TBox (p, w, h, args) {
  this.patterns = ["default", "mask"];
  TLayer.call(this, p, w, h);

  this.tLast = 0.0;
  this.curRx = 0.0;
  this.curRy = 0.0;
  this.targetRx = 0.0;
  this.targetRy = 0.0;

  this.x = args.x;
  this.y = args.y;
  this.size = args.size;

  this.pg.smooth(5);
  this.shape = p.createShape();
  this.shape.disableStyle();
  this.shape.beginShape(p.QUADS);
  let size = this.size;
  Polygons.Cube(this.shape, -size, -size, -size, size, size, size, 0, 0, 1, 1);
  this.shape.endShape();
}

TBox.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, key, args) {
      let p = this.p;
      let t = args.t;
      // if(key == "default") {
        if(Math.floor(t) - Math.floor(this.tLast) > 0) {
          this.targetRx = p.random(0, Math.PI * 2);
          this.targetRy = p.random(0, Math.PI * 2);
        }
        this.tLast = t;
      
        this.curRx = p.lerp(this.curRx, this.targetRx, 0.05);
        this.curRy = p.lerp(this.curRy, this.targetRy, 0.05);
      // }
    
      pg.clear();
      pg.pushMatrix();
      pg.pushStyle();
      if(key == "default") {
        pg.lights();
      }
      pg.translate(this.x, this.y);
      pg.rotateX(this.curRx);
      pg.rotateY(this.curRy);
      if(key == "default") {
        pg.fill(255);
        pg.stroke(0);
        pg.strokeWeight(5);
      }
      else if(key == "mask") {
        pg.fill(255);
        pg.stroke(255);
        pg.strokeWeight(5);
      }
      pg.shape(this.shape);
      pg.popStyle();
      pg.popMatrix();
    }
  }
});

TBox.prototype.constructor = TBox;

////////

function TLayerBlend (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.blendMode = args.mode;
  this.bottomLayer = args.bottom;
  this.topLayer = args.top;
  this.maskLayer = args.mask;
}

TLayerBlend.prototype = Object.create(TLayer.prototype, {
  drawLayer: {
    value: function (pg, i, args) {
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
  }
});

TLayerBlend.prototype.constructor = TLayerBlend;

////////

function S027Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pg.smooth(5);

  this.tDot = new TDot(p, this.width, this.height);
  this.tDot.draw();

  this.tDotSimple = new TDotSimple(p, this.width, this.height);
  this.tDotSimple.draw();

  this.tVoronoi = new TVoronoi(p, this.width, this.height);
  this.tVoronoi.draw();

  // this.tCenterLine = new TCenterLine(p, this.width, this.height);
  // this.tCenterLine.draw();

  this.tStripe = new TStripe(p, this.width, this.height);
  this.tStripe.draw();

  this.tBox0 = new TBox(p, this.width, this.height, {
    x: this.width / 4,
    y: this.height / 4 * 3,
    size: 75
  });

  this.tBox1 = new TBox(p, this.width, this.height, {
    x: this.width / 4 * 3,
    y: this.height / 4,
    size: 75
  });

  this.tDotOnBox = new TLayerBlend(p, this.width, this.height, {
    top: this.tDot.pg,
    bottom: this.tBox0.pgs.default,
    mask: this.tBox0.pgs.mask,
    mode: p.MULTIPLY
  });

  this.tStripeOnBox = new TLayerBlend(p, this.width, this.height, {
    top: this.tStripe.pg,
    bottom: this.tBox1.pgs.default,
    mask: this.tBox1.pgs.mask,
    mode: p.MULTIPLY
  });

  this.tBlurb0 = new TBlurb(p, this.width, this.height, {
    x: this.tBox0.x - 50, y: this.tBox0.y
  });
  this.tBlurb0.draw();

  this.tBlurb1 = new TBlurb(p, this.width, this.height, {
    x: this.tBox1.x - 50, y: this.tBox1.y
  });
  this.tBlurb1.draw();
}

S027Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  this.tBox0.draw({t: t});
  this.tBox1.draw({t: t});
  this.tDotOnBox.draw();
  this.tStripeOnBox.draw();
  this.tVoronoi.draw();

  pg.beginDraw();
  pg.background(255);
  // this.tDotSimple.drawTo(pg);
  this.tVoronoi.drawTo(pg);
  // this.tCenterLine.drawTo(pg);
  this.tDotOnBox.drawTo(pg);
  this.tStripeOnBox.drawTo(pg);
  // this.tBlurb0.drawTo(pg);
  // this.tBlurb1.drawTo(pg);

  pg.endDraw();
}

var s = function (p) {
  let s027Tex = new S027Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s027Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s027Tex.draw(t);
    p.image(s027Tex.pg, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p027 = new p5(s);
