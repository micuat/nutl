var colorSchemes = [new ColorScheme("20bf55-0b4f6c-01baef-fbfbff-757575")];
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function setColor(parent, func, index, alpha) {
  if(alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}

function S065(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  p.noiseSeed(0);

  this.shape = p.createShape();
  {
    this.shape.beginShape();
    this.shape.stroke(0);
    let w = 30;
    let h = w * 1.5;
    let d = 2;
    this.shape.noFill();
    for(let i = 0; i <= w; i++) {
      let x = Math.cos(i / w * Math.PI * 2) * 0.5 + 0.5;
      this.shape.vertex(i, (1 - x * x) * h);
    }
    // this.shape.vertex(0, 0);
    // this.shape.vertex(d, 0);
    // this.shape.vertex(d, h);
    // this.shape.vertex(w-d, h);
    // this.shape.vertex(w-d, 0);
    // this.shape.vertex(w, 0);
  }
  this.shape.endShape();
  this.shape.disableStyle();
}

S065.prototype = Object.create(TLayer.prototype);

S065.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S065.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  setColor(pg, "background", 3);

  pg.pushMatrix();

  let W = 40;
  let H = 7.5;
  let J = 22;
  let N = 8;
  pg.strokeWeight(2);
  pg.noFill();
  for(let i = 0; i < 36 * 4; i++) {
    for(let j = 0; j < J; j++) {
      let dx = i % 2 == 0 ? 0 : W / 2;
      pg.push();
      pg.translate(j * W + dx, i * H);
      let HH = 1;
      let iId = Math.floor(i/16);
      let jId = Math.floor(j/4);
      // if((iId + jId) % 2 == i % 2) HH = 0;
      // else {
      //   // if(iId % 2 == 0)
      //     if(Math.sin((j/4)*Math.PI)*0.5+0.5<(i%16)/16) HH = 0;
      //   // else
      //   //   if(Math.sin((j/8 + iId/2)*Math.PI)*0.5+0.5>=(i%16)/16) HH = 0;
      // }
      let sinVal = Math.sin((j/p.map(iId, 0, 8, 4, 8) + iId)*Math.PI)*0.5+0.5;
      let iVal = (i % 16) / 16;
      if(sinVal < iVal && i % 2 == 0) HH = 0;
      if(sinVal >= iVal && i % 2 == 1) HH = 0;

      pg.beginShape();
      let h = W * 1.5;
      let d = 2;
      for(let ii = 0; ii <= W; ii++) {
        let x = Math.cos(ii / W * Math.PI * 2) * 0.5 + 0.5;
        let y = (1 - x * x) * HH;
        setColor(pg, "stroke", i % 2, p.map(y*y, 0, 1, 50, 255));
        pg.vertex(ii, y * h);
      }
      pg.endShape();
      pg.pop();
    }
    // pg.translate(0, 0, 0.001);
  }

  pg.popMatrix();
}

S065.prototype.constructor = S065;

////////

var s = function (p) {
  let s065 = new S065(p, 1200, 3000);
  let counter = 99;

  p.setup = function () {
    p.createCanvas(1200, 1200);
    p.frameRate(60);
    let t = p.millis() * 0.001;
    s065.draw({t: t});
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    //p.translate(0, -counter * 20 + p.height / 2);

    p.image(s065.pg, 0, 0);
    p.noStroke();
    p.fill(255, 0, 0, 100);
    p.rect(28*20, counter * 20, -28*20, 10);
  }

  p.keyPressed = function () {
    if(p.key == 'w') {
      counter = Math.max(counter - 1, 0);
    }
    else if(p.key == 's') {
      counter = Math.min(counter + 1, 199);
    }
    print(counter)
  }
};

var p065 = new p5(s);
