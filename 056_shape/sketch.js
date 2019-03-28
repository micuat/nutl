var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");

function S056(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);

  this.lastT = 0;
  this.tBase = 0;
  this.shader = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");
}

S056.prototype = Object.create(TLayer.prototype);
S056.prototype.constructor = S056;

S056.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;

  if(Math.floor(t) - Math.floor(this.lastT) > 0) {
    this.tBase = t;
    // this.shader = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");
  }
  this.lastT = t;
}

S056.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  let c0 = 1;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);

  pg.shader(this.shader);
  this.shader.set("iTime", t);
  c0 = 0;
  this.shader.set("fColor", colorScheme.get(c0).r/255.0, colorScheme.get(c0).g/255.0, colorScheme.get(c0).b/255.0, 1.0);
  c0 = 4;
  this.shader.set("gColor", colorScheme.get(c0).r/255.0, colorScheme.get(c0).g/255.0, colorScheme.get(c0).b/255.0, 1.0);
  // pg.clear();

  // pg.background(0);

  pg.translate(this.width / 2, this.height / 2);
  pg.rotateX(Math.PI / 4);
  pg.rotateY(t * 0.1);

  pg.pushMatrix();
  pg.noStroke();
  pg.blendMode(p.BLEND);

  for(let i = -25; i <= 5; i++) {
    for(let j = 0; j < 8; j++) {
      for(let k = 0; k < 2; k++) {
        pg.push();
        pg.rotateY(j / 4 * Math.PI);// + (i) / 16 * Math.PI);
        let tween = (t*1 + i * 0.25 + 3) % 4;
        if(tween < 2) {
          pg.rotateY(EasingFunctions.easeInOutQuad(tween/2)*2 * Math.PI);
          if(tween > 1) tween = 2 - tween;
          pg.translate(0, 0, -220 * EasingFunctions.easeInOutQuad(tween));
          pg.scale(1-0.5*EasingFunctions.easeInOutQuint(tween), 1, 1);
        }
        // obviously this is quite ffkked up
        pg.scale(0.5, 75.0/275.0, 1);
        let side = 275;
        pg.translate(0, i * side*2, 370);
        if((i+3+j)%2==0)
        pg.rotateY(Math.PI)
        pg.rotate(k * Math.PI);
        pg.beginShape();
        let index = (i + 6) * 2.0;// + (j*2);// + k * 56;
        pg.fill(255, 0, 0, index);
        pg.vertex(-side, -side, 0);
        pg.fill(0, 255, 0, index);
        pg.vertex(side, -side, 0);
        pg.fill(0, 0, 255, index);
        pg.vertex(-side, side, 0);
        pg.endShape();
        pg.pop();
      }
    }
  }

  pg.popMatrix();
}

////////

var s = function (p) {
  let s056 = new S056(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s056.draw({t: t});
    p.background(0);
    p.image(s056.pg, 0, 0);
  }

  let lastT = 0;
  p.update = function () {
    let t = p.millis() * 0.001;
    if(Math.floor(t) - Math.floor(lastT) > 0) {
      print(t, p.oscP5)
    }
    lastT = t;
    // if(p.frameCount % 30 == 0) {
    //   print(p.frameRate())
    // }
  }
};

var p056 = new p5(s);
