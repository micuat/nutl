if(curSlide == undefined) {
  var curSlide = 0;
}
if(images == undefined) {
  var images = {};
}
if(videos == undefined) {
  var videos = {};
  let videoPath = "assets/videos";
  let p = pApplet;
  files = (new java.io.File(p.sketchPath(videoPath))).listFiles();
  for(let i = 0; i < files.length; i++) {
    let f = files[i];
    if(videos[f.getName()] == undefined) {
      print("loading " + f.getName())
      videos[f.getName()] = new Packages.processing.video.Movie(p.that, "../" + videoPath + "/" + f.getName());
      // videos[f.getName()].loop();
    }
  }
}

var windowWidth = 1024;
var windowHeight = 768;

function PLorenz(p) {
  let x = 0.02;
  let y = 0;
  let z = 0;
  
  let a = 10;
  let b = 28;
  let c = 8.0 / 3.0;
  
  let points = new Array();
  let pg = p.createGraphics(windowWidth, windowHeight, p.P3D);

  this.draw = function () {
    pg.beginDraw();
    pg.background(0);

    for (let it = 0; it < 20; it++) {
      let dt = 0.001;
      let dx = (a * (y - x)) * dt;
      let dy = (x * (b - z) - y) * dt;
      let dz = (x * y - c * z) * dt;
      x = x + dx;
      y = y + dy;
      z = z + dz;

      let vel = dx * dx + dy * dy + dz * dz;
      vel = Math.sqrt(vel) * 10;

      for (let i = 0; i < 5; i++) {
        let x1 = x + p.randomGaussian() * 0.1 * vel;
        let y1 = y + p.randomGaussian() * 0.1 * vel;
        let z1 = z + p.randomGaussian() * 0.1 * vel;
        points.push(new p5.Vector(x1, y1, z1));
      }

      if(points.length > 10000) {
        for (let i = 0; i < 5; i++) {
          points.shift();
        }
      }
    } 

    pg.translate(pg.width / 2, pg.height / 2, -80);
    pg.scale(10);
    pg.stroke(255, 100);
    pg.strokeWeight(0.2);
    pg.noFill();

    let hu = 0;
    pg.beginShape(p.POINTS);

    for (let i in points) {
      let v = points[i];
      pg.vertex(v.x, v.y, v.z);

      hu += 1;
      if (hu > 255) {
        hu = 0;
      }
    }
    pg.endShape();
    pg.endDraw();
    p.image(pg, -p.width / 2, -p.height / 2);
  }
};

function PTenPrint(p) {
  let x = 0;
  let y = 0;
  let spacing = 32;
  let pg = p.createGraphics(windowWidth, windowHeight);
  this.draw = function () {
    pg.beginDraw();
    pg.stroke(255);
    if (p.random(1) < 0.5) {
      pg.line(x, y, x + spacing, y + spacing);
    } else {
      pg.line(x, y + spacing, x + spacing, y);
    }
    x = x + spacing;
    if (x > pg.width) {
      x = 0;
      y = y + spacing;
    }
    pg.endDraw();
    p.image(pg, -p.width / 2, -p.height / 2);
  }
}

function S181230 (p) {
  SRendererShadow.call(this, p, windowWidth, windowHeight);
  this.colorScheme = new ColorScheme("6fa2d6-89ddaf-c0ef83-fff359-b56246");
  this.uMetallic = 0.2;
  this.uRoughness = 0.5;
  this.uSpecular = 0.2;
  this.uExposure = 5.0;
  this.uVignette = 0.75;
  this.uExposure = 3.0;

  this.shape = [];
  for(let count = 0; count < 32; count++) {
    let idx = Math.floor(p.random(0, 4));
    let rx = p.random(Math.PI * 2);
    let ry = p.random(Math.PI * 2);
    let yStart = p.random(30, 100);
    let yEnd = p.random(150, 300);

    let n = 32;
    for(let i = 0; i < 4; i++) {
      let s = p.createShape();
      s.beginShape(this.p.TRIANGLE_STRIP);
      s.rotateX(rx);
      s.rotateY(ry);
      s.noStroke();
      s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      for(let j = 0; j <= n; j++) {
        for(let ii = 1; ii >= 0; ii--) {
          let x0 = (ii-0.5) * 10;
          let z0 = 20 * (Math.cos(j / n * Math.PI) - 1.0);
          let y0 = p.map(j, 0, n, 0, p.map(i, 0, 4, yStart, yEnd));
          s.normal(0, 0, 1);
          s.vertex(x0, y0, z0, ii, j / n);
        }
      }
      s.endShape(this.p.CLOSE);
      this.shape.push(s);
    }

    for(let i = 0; i < 4; i++) {
      let s = p.createShape();
      s.beginShape(this.p.TRIANGLE_STRIP);
      s.rotateX(rx);
      s.rotateY(ry);
      s.noStroke();
      s.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      for(let j = 0; j <= n; j++) {
        for(let ii = 1; ii >= 0; ii--) {
          let x0 = (ii-0.5) * 10;
          let z0 = 20 * (Math.cos(j / n * Math.PI) - 1.0);
          let y0 = p.map(j, 0, n, 0, p.map(i, 0, 4, yStart, yEnd));
          s.normal(0, 0, -1);
          s.vertex(x0, y0, z0-1, ii, j / n);
        }
      }
      s.endShape(this.p.CLOSE);
      this.shape.push(s);
    }  }
}

S181230.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      pg.translate(0, 0, 0);

      pg.pushMatrix();
      for(let i in this.shape) {
        let s = this.shape[i];
        let idx = 0;
        pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
        pg.shape(s, 0, 0);
      }
      pg.popMatrix();

      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.t = p.millis() * 0.001;
      this.lightPos.set(300, 0, 300);
      // this.lightPos = this.cameraPosition.copy();
      this.lightDirection = this.lightPos.copy();//p.createVector(0, 1, 1);
      // this.lightDirection.sub(this.cameraTarget);
      // this.ShadowMap.beginDraw();
      // this.ShadowMap.ortho(-1000, 1000, -1000, 1000, -10000, 10000); // Setup orthogonal view matrix for the directional light
      // this.ShadowMap.endDraw();
      Object.getPrototypeOf(S181230.prototype).draw.call(this);
    }
  }
});

S181230.prototype.constructor = S181230;

var SA075 = function (p) {
  let name;
  let font;
  let xs = [];
  let ys = [];
  let pg;
  this.setup = function () {
    name = p.folderName;

    font = p.createFont("assets/Avenir.otf", 60);

    pg = p.createGraphics(p.width, p.height, p.P3D);
  }

  let curveFunctionX;
  let curveFunctionY;
  let rotationFunction;
  let logoRotationFunction;
  let pgBackgroundFunction;
  let doDoubleDraw;
  let displaceN;
  let curRotX = 0;
  let destRotX = 0;
  let curRotY = 0;
  let destRotY = 0;
  this.draw = function () {
    p.background(0);

    // let t = p.millis() * 0.001;
    let t = (p.frameCount / 30.0);

    if (curveFunctionX == null || p.frameCount % (30 * 4) == 0) {
      let funcs = [
        function (i) { return Math.sqrt(Math.cos(i / 10 * Math.PI * 0.5)) }
        ,
        function (i) { return i * 0.1 }
        ,
        // function (i) { return i * 0.05 + 0.5 }
        // ,
        function (i) { return 1.0 }
      ];
      curveFunctionX = p.random(funcs);
      curveFunctionY = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) {
          pg.rotateZ(Math.pow(Math.min(t * 1.0, 1.0), 0.25) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateY(Math.pow(Math.min(t * 0.5, 1.0), 0.5) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateY(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateX(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI);
        }
      ];
      rotationFunction = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) {
          p.rotateX(p.map((t * 2.0) % 4.0, 0.5, 2.0, 0.0, Math.PI * 0.5));
        }
        ,
        function (t) {
          p.rotateX(-p.map((t * 2.0) % 4.0, 0.5, 2.0, 0.0, Math.PI * 0.5));
        }
      ];
      logoRotationFunction = p.random(funcs);

      funcs = [
        function () { pg.background(0); }
        // ,
        // function () { pg.background(0); }
        // ,
        // function () { pg.background(0); }
        // ,
        // function () {
        //   pg.noStroke();
        //   pg.fill(0, 10);
        //   pg.rect(0, 0, pg.width, pg.height);
        // }
      ];
      pgBackgroundFunction = p.random(funcs);

      displaceN = Math.floor(p.random(-3, 3));

      destRotX = Math.floor(p.random(-3, 3)) * Math.PI * 0.25;
      destRotY = Math.floor(p.random(-3, 3)) * Math.PI * 0.25;

      doDoubleDraw = p.random(1.0) > 0.7 ? true : false;

      pg.beginDraw();
      pg.background(0);
      pg.endDraw();

      for (let i = 0; i < 21; i++) {
        xs[i] = 0;
        ys[i] = 0;
      }
    }

    pg.beginDraw();
    pgBackgroundFunction();
    pg.endDraw();

    {
      let n = 280;
      let dn = n / 10;
      if (t % 4 < 1) {
      }
      else if (t % 4 < 3) {
        for (let i = -10; i <= 10; i++) {
          let dl = n * curveFunctionX(i);
          xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
        }
        for (let j = -10; j <= 10; j++) {
          let dl = n * curveFunctionY(j);
          ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
        }
      }
      else {
        for (let i = -10; i <= 10; i++) {
          let dl = 0;
          xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
        }
        for (let j = -10; j <= 10; j++) {
          let dl = 0;
          ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
        }
      }
      function drawSystem(broken) {
        for (let i = -10; i <= 10; i++) {
          let dlx0, dly1;
          let i0 = i, i1 = i;
          if (!broken){//} || p.noise(i * 0.8, t * 5.0) > 0.5) {
            dlx0 = xs[i0 + 10];
            dlx1 = xs[i1 + 10];
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
            pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
            pg.line(i0 * dn, -dly0, i1 * dn, dly1);
          }
          else {
            // i1 = Math.floor(p.map(p.noise(i * 0.1, t * 2.0), 0.0, 1.0, -10.0, 11.0));
            dlx0 = xs[i0 + 10] * p.noise(i * 0.8, t * 5.0);
            dlx1 = xs[i1 + 10] * p.noise(i * 0.8, t * 5.0);
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
            pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
            pg.line(i0 * dn * p.noise(i * 0.8, t * 5.0), -dly0, i1 * dn * p.noise(i * 0.8, t * 5.0), dly1);
          }
        }
      }

      pg.beginDraw();

      if (t % 4 < 1.0) {
        let z = Math.cos((t % 1.0) * Math.PI) * displaceN;
        z = z % 1.0;
        z *= 600 * Math.sqrt(2.0);
        pg.translate(0, 0, z);
      }

      pg.stroke(155);
      pg.translate(pg.width / 2, pg.height / 2);
      curRotX = p.lerp(curRotX, destRotX, 0.1);
      if(Math.abs(curRotX - destRotX) < 0.01) curRotX = destRotX;
      curRotY = p.lerp(curRotY, destRotY, 0.1);
      if(Math.abs(curRotY - destRotY) < 0.01) curRotY = destRotY;
      pg.rotateX(curRotX);
      pg.rotateY(curRotY);
      rotationFunction((t - 1) % 4.0);
      if (t % 4 < 20) {
        // pg.rotateY(t)

        pg.pushMatrix();
        pg.rotateY(Math.PI * 0.25);
        pg.noFill();
        let nn = 3;
        for(let i = -nn; i <= nn; i++) {
          for(let j = -nn; j <= nn; j++) {
            for(let k = -nn; k <= nn; k++) {
              pg.pushMatrix();
              pg.translate(i * 600, j * 600, k * 600);
              pg.box(600);
              pg.popMatrix();
            }
          }
        }
        pg.popMatrix();
      }

      pg.stroke(255);
      if (t % 4 >= 1) {

        // if(doDoubleDraw)
        //   pg.translate(0, 0, -pg.width / 4);
        pg.translate(0, 0, -pg.width / 4);
        for(let i = 0; i < 2; i++) {
          pg.pushMatrix();
          pg.translate(-pg.width / 4, 0);
          pg.rotateY(Math.PI * 0.25);
          drawSystem(false);
          pg.popMatrix();

          pg.pushMatrix();
          pg.translate(pg.width / 4, 0);
          pg.rotateY(Math.PI * -0.25);
          drawSystem(true);
          pg.popMatrix();

          if(doDoubleDraw) {
            pg.translate(0, 0, pg.width / 2);
            pg.scale(1, 1, -1);
          }
          else {
            break;
          }
        }
      }
      pg.endDraw();
    }

    p.image(pg, 0, 0)

    p.push();
    p.translate(p.width / 2, p.height / 2, 50);
    if (t % 4 < 2) {
      p.push();
      let tweena = Math.min(1.0, p.map((t * 2.0) % 4.0, 0.0, 0.5, 0.0, 1.0));
      if(t % 4.0 > 0.5) {
        // logoRotationFunction(t);
        tweena = Math.max(0.0, p.map((t * 2.0) % 4.0, 1.5, 2.0, 1.0, 0.0));
      }
      p.fill(255, 255 * tweena);

      p.textFont(font, 40);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('wresting equations from the event', 0, -0);

      p.pop();
    }
    p.pop();

    if(p.frameCount % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }
  }
};

var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;
  let isPlayingVideo = false;

  let s181230 = new S181230(p);
  let sA075 = new SA075(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;

    let assetPath = "assets/slides";
    let files = (new java.io.File(p.sketchPath(assetPath))).listFiles();
    for(let i = 0; i < files.length; i++) {
      let f = files[i];
      if(images[f.getName()] == undefined) {
        print("loading " + f.getName())
        images[f.getName()] = p.loadImage(assetPath + "/" + f.getName());
      }
    }
    s181230.setup();
    sA075.setup();
  }

  function getCount() { return p.frameCount - startFrame };
  function drawImage(name, tint) {
    let im = images[name];
    drawTexture(im, tint);
  }
  function drawVideo(name, tint) {
    for(let key in videos) {
      if(name == key) {
        videos[key].loop();
        isPlayingVideo = true;
      }
      else {
        videos[key].pause();
      }
    }
    let im = videos[name];
    drawTexture(im, tint);
  }
  function drawTexture(im, tint) {
    let aspect = im.width / im.height;
    p.pushStyle();
    if(tint == undefined) {
    }
    else {
      p.tint(255, 255 * tint);
    }
    p.imageMode(p.CENTER);
    if(aspect > windowWidth/windowHeight) {
      let h = windowHeight;
      let w = aspect * h;
      p.image(im, 0, 0, w, h);
    }
    else {
      let w = windowWidth;
      let h = w / aspect;
      p.image(im, 0, 0, w, h);
    }
    p.popStyle();
  }
  let pLorenz = new PLorenz(p);
  let pTenPrint = new PTenPrint(p);

  let funcs = [
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("ccl.jpg");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("Photo: Motion Bank", 0, 300);
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("bc.jpg");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("Photo: PERTE DE SIGNAL | Camille Montuelle", 0, 300);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);

      pLorenz.draw();
  
      p.textSize(64);
      p.text("ALGORITHM | DIVERSION", 0, -50);
      p.textSize(48);
      p.text("Naoto Hieda", 0, 50);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      pTenPrint.draw();
      // p.textSize(48);
      // p.text("10 PRINT (1982)", 0, 0);
      // p.textSize(24);
      // p.text("10 PRINT CHR$(205.5+RND(1)); : GOTO 10", 0, 150);
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("deborah.jpg");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawVideo("ccl4.mp4");
      // drawImage("ccl4smalt.png");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawVideo("eeg.mp4");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawVideo("transenses.mp4");
    },
    // function () {
    //   p.translate(p.width / 2, p.height / 2);
    //   drawImage("pl.png");
    // },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawVideo("pf.mp4");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("pathrefinder.jpg");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("Photo: Andrei Gîndac", 0, 300);
    },
    function () {
      let t = p.millis() * 0.001;

      let angle = t * 0.2;
      s181230.cameraPosition = p.createVector(300.0 * Math.cos(angle), -150.0, 300.0 * Math.sin(angle));
      s181230.cameraTarget = p.createVector(0.0, 0.0, 0.0);
  
      p.background(0);
      s181230.draw(t);
      p.image(s181230.pg, 0, 0);
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
  
      drawImage("autism.jpg");

      p.fill(0);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("A young boy with autism who has arranged his toys in a row", 0, 250);
      p.text("Photo: Andwhatsnext / Wikipedia", 0, 300);
    },
    function () {
      sA075.draw();
    },
  ]
  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);
    p.fill(255);
    p.stroke(255);

    p.textFont(font);
    isPlayingVideo = false;
    funcs[curSlide]();
    if(isPlayingVideo == false) {
      for(let key in videos) {
        videos[key].pause();
      }
    }
  }

  p.keyPressed = function() {
    if(p.keyCode == p.LEFT) {
      curSlide = Math.max(0, curSlide - 1);
    }
    else if(p.keyCode == p.RIGHT) {
      curSlide = Math.min(funcs.length - 1, curSlide + 1);
    }
  }

};

var pSnue = new p5(s);
