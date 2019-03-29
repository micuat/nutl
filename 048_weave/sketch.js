var colorScheme = new ColorScheme("db2763-b0db43-12eaea-bce7fd-c492b1");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function S048(p, w, h) {
  TLayer.call(this, p, w, h);
  this.pg.smooth(1);
  p.noiseSeed(0);
}

S048.prototype = Object.create(TLayer.prototype);

S048.prototype.update = function(args) {
  let t = args.t;
  let p = this.p;
}

S048.prototype.drawLayer = function(pg, key, args) {
  let t = args.t;
  let p = this.p;

  pg.clear();

  let c0 = 4;
  pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b, 150);

  // pg.translate(this.width / 2, this.height / 2);

  pg.pushMatrix();

  let W = 20;
  let w = 16;
  let J = 24+4;
  let N = 8;
  pg.noStroke();
  for(let i = 0; i < 200; i++) {
    for(let j = 0; j < J; j++) {
      let jj = Math.floor((j-2) / N);
      let jr = (j-2) % N;

      let over = true;
      let noise = p.noise(jj * 1, i * 0.25);
      // let noise = p.osnoise.eval(jj * 1, i * 0.25) * 0.5+0.5;
      if((j < 2 || j >= J - 2)) {
        if((i+j)%2 == 0) {
          over = true;
        }
        else {
          over = false;
        }
      }
      else {
        if((i+j)%2 == 0) {
            over = true;
        }
        else {
          over = false;
        }
        // if(p.sin(jr * Math.PI *0.25 + (i + jj*1) * Math.PI * 0.125) > 0.0) over = !over;
      }

      let realColor = false;
      if(over) {
        if(realColor)
          pg.fill(0);
        else
          pg.fill(255);
      }
      else {
        if(realColor) {
          if((j-3+8) % 8 < 6) {
            pg.fill(255);
          }
          else {
            pg.fill(0, 0, 255);
          }
        }
        else {
          pg.fill(0, 0, 255);
        }
      }
      pg.rect(j * W, i * W, w, w);
    }
  }

  pg.popMatrix();
}

S048.prototype.constructor = S048;

////////

var s = function (p) {
  let s048 = new S048(p, 800, 3000);
  let counter = 99;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
    let t = p.millis() * 0.001;
    s048.draw({t: t});
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(0);

    p.translate(0, -counter * 20 + p.height / 2);

    p.image(s048.pg, 0, 0);
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

var p048 = new p5(s);
