function TLedAnimation (p, w, h, args) {
  TLayer.call(this, p, w, h);
  this.layer = args.layer;
  this.splitN = args.n;
  this.layerMod = p.createGraphics(w, h, p.P3D);
  this.mode_dir = "up";
  this.type = args.type;
  this.lastT = -100;
  this.timeScale = args.timeScale;
}

TLedAnimation.prototype = Object.create(TLayer.prototype);

TLedAnimation.prototype.update = function (args) {
  let t = args.t * this.timeScale;        
  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.mode_dir = this.p.random(["left", "right", "up", "down"]);
  }
  this.lastT = t;
  let mode_dir = this.mode_dir;
  this.layerMod.beginDraw();
  this.layerMod.clear();
  if(mode_dir == "up" || mode_dir == "down") {
    this.layerMod.translate(this.layerMod.width / 2, this.layerMod.height / 2);
    this.layerMod.rotate(Math.PI / 2);
    this.layerMod.translate(-this.layerMod.width / 2, -this.layerMod.height / 2);
  }
  this.layerMod.image(this.layer, 0, 0);
  this.layerMod.endDraw();
}

TLedAnimation.prototype.drawLayer = function (pg, i, args) {
  let p = this.p;
  let t = args.t * this.timeScale + args.scratch;    
  pg.clear();
  pg.noStroke();

  let mode_dir = this.mode_dir;
  if(t % 2 < 1) {
    mode_inout = "in";
  }
  else if(t % 2 >= 1) {
    mode_inout= "out";
  }

  pg.translate(pg.width/2, pg.height/2);
  if(mode_dir == "up" || mode_dir == "down") {
    pg.rotate(Math.PI / -2);
  }
  pg.translate(-pg.width/2, -pg.height/2);

  if(mode_dir == "right" || mode_dir == "up") {
    pg.translate(pg.width/2, pg.height/2);
    pg.scale(-1, 1);
    pg.translate(-pg.width/2, -pg.height/2);
  }

  let n = this.splitN;
  let h = pg.height;
  let tPhase = t % 1;
  pg.textureMode(p.NORMAL);
  if(this.type == "stretch") {
    let w = 0;
    let ti = tPhase;
    if (mode_inout == "in") {
      w = p.lerp(1, 0, ti) * this.pg.width;
    }
    else if (mode_inout == "out") {
      w = p.lerp(0, 1, ti) * this.pg.width;
    }
    let x = 0;
    let y = 0;
    let W = pg.width;
    let tx0 = 0;
    let tx1 = w / W;
    if(mode_dir == "right" || mode_dir == "up") {
      tx0 = 1 - tx0;
      tx1 = 1 - tx1;
    }
    let ty0 = 0;
    let ty1 = 1;
    pg.beginShape(p.QUADS);
    pg.texture(this.layerMod);
    pg.vertex(x, y, tx0, ty0);
    pg.vertex(x + w, y, tx1, ty0);
    pg.vertex(x + w, y + h, tx1, ty1);
    pg.vertex(x, y + h, tx0, ty1);
    pg.endShape();

    pg.beginShape(p.QUADS);
    pg.texture(this.layerMod);
    pg.vertex(w, y, tx1, ty0);
    pg.vertex(W, y, tx1, ty0);
    pg.vertex(W, y + h, tx1, ty1);
    pg.vertex(w, y + h, tx1, ty1);
    pg.endShape();
  }
  else if(this.type == "strip") {
    let w = pg.width / n;
    for(let i = 0; i < n; i++) {
      let off = p.map(0.5-Math.abs(i/n-0.5), 0, 0.5, 0, 1);
      off = Math.sqrt(off) * 0.4;
      let ti = p.constrain(p.map(tPhase, i / n, (i+1) / n, 0+off, 1-off), 0, 1);
      let x;
      if (mode_inout == "in") {
        x = p.lerp(1, i / n, ti) * this.pg.width;
      }
      else if (mode_inout == "out") {
        x = p.lerp(i / n, -1 / n, ti) * this.pg.width;
      }
      let y = 0;
      let tx0 = i / n;
      let tx1 = (i + 1) / n;
      if(mode_dir == "right" || mode_dir == "up") {
        tx0 = 1 - tx0;
        tx1 = 1 - tx1;
      }
      let ty0 = 0;
      let ty1 = 1;
      pg.beginShape(p.QUADS);
      pg.texture(this.layerMod);
      pg.vertex(x, y, tx0, ty0);
      pg.vertex(x + w, y, tx1, ty0);
      pg.vertex(x + w, y + h, tx1, ty1);
      pg.vertex(x, y + h, tx0, ty1);
      pg.endShape();
    }
  }
}

TLedAnimation.prototype.constructor = TLedAnimation;
