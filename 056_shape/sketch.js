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
    this.shader = p.loadShader(p.folderName + "/shaders/vignette.frag", p.folderName + "/shaders/vignette.vert");
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
  pg.rotateX(Math.PI / 6);
  pg.rotateY(t * 0.1);

  pg.pushMatrix();
  pg.noStroke();
  pg.blendMode(p.BLEND);

  for(let i = -3; i <= 3; i++) {
    for(let j = -3; j <= 3; j++) {
      for(let k = 0; k < 2; k++) {
        pg.push();
        pg.rotateY(j / 3 * Math.PI);
        pg.translate(0, i * 300, 260);
        if(Math.floor((t*(j%2+0.5)) % 7) == i + 3)
        pg.rotateY(2*Math.PI*EasingFunctions.easeInOutCubic((t*(j%2+0.5))-Math.floor((t*(j%2+0.5)))));
        if((i+3)%2==0)
        pg.rotateY(Math.PI)
        pg.rotate(k * Math.PI);
        pg.beginShape();
        pg.fill(255, 0, 0, (i + 3) * 7 + (j + 3));
        pg.vertex(-150, -150, 0);
        pg.fill(0, 255, 0, (i + 3) * 7 + (j + 3));
        pg.vertex(150, -150, 0);
        pg.fill(0, 0, 255, (i + 3) * 7 + (j + 3));
        pg.vertex(-150, 150, 0);
        pg.endShape();
        pg.pop();
      }
    }
  }

  pg.popMatrix();
}

////////

var s = function (p) {
  let s056 = new S056(p, 1920, 1080);

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    s056.draw({t: t});
    p.background(0);
    p.image(s056.pg, 0, 0);
  }
};

var p056 = new p5(s);
