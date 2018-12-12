function S008 (p) {
  SRenderer.call(this, p);
  this.colorScheme = new ColorScheme("edae49-d1495b-00798c-30638e-003d5b");
  this.fontS = new Packages.geomerative.RFont("assets/fonts/Avenir-Medium.ttf", 100, p.CENTER);
  this.fontL = new Packages.geomerative.RFont("assets/fonts/Avenir-Medium.ttf", 150, p.CENTER);
}

S008.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      let pg = this.pg;

      pg.beginDraw();
      pg.clear();
      // pg.stroke(0);
      pg.strokeWeight(2);
      pg.noStroke();
      pg.translate(pg.width / 2, pg.height / 2);
      // pg.textAlign(p.CENTER, p.CENTER);

      Packages.geomerative.RCommand.setSegmentLength(5); // 5 = many points; 125 = only a few points
      Packages.geomerative.RCommand.setSegmentator(Packages.geomerative.RCommand.UNIFORMLENGTH);

      // pg.noFill();
      let mode = 2;
      switch (mode) {
        case 0:
        {
          let fshape = this.fontL.toShape('MMCK');
          for(let ci = 0; ci < fshape.children.length; ci++) {
            let rpoints = fshape.children[ci].getPoints();
            pg.beginShape();
            for (let i = 0; i < rpoints.length - 1; i++) {
              let x = rpoints[i].x;
              let y = rpoints[i].y + 50.0;
              let idx = Math.floor(p.map(x, -256, 256, 0, 20)) % 5;
              pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, 255);
              // pg.stroke(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, 255);
              pg.noStroke();
              // if(ci == 3) {
              //   x += Math.sin(y * 0.5) * 4;
              // }
              let n = 16;
              x = Math.floor(x / n) * n;
              y = Math.floor(y / n) * n;
              pg.vertex(x, y);
              // pg.beginShape();
              // pg.noFill();
              // pg.strokeWeight(3);
              // for (let j = 0; j < 300; j++) {
              //   pg.stroke(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, p.map(j, 0, 300, 155, 0));
              //   // let rot = j * Math.PI / 8.0 / 2.0;
              //   // let nx = x * Math.cos(rot) + y * -Math.sin(rot);
              //   // let ny = x * Math.sin(rot) + y * Math.cos(rot);
              //   let nx = x + Math.sin(j * 0.1) * j * 0.1;
              //   let ny = y + j * 1 - 100;
              //   pg.vertex(nx, ny);
              // }
              // pg.endShape();
            }
            pg.endShape(p.CLOSE);
          }
        }
        break;

        case 1:
        pg.pushMatrix();
        pg.text("STUPID", 0, 0);
        pg.popMatrix();
        break;

        case 2:
        {
          let str = ["IGNORE", "ME"];
          for(let k = 0; k < str.length; k++) {
            let fshape = this.fontS.toShape(str[k]);
            for(let ci = 0; ci < fshape.children.length; ci++) {
              let rpoints = fshape.children[ci].getPoints();
              pg.beginShape();
              for (let i = 0; i < rpoints.length; i++) {
                let x = rpoints[i].x;
                let y = rpoints[i].y + 40.0 + p.map(k, 0, 1, -50, 50);
                let idx = ci % 5;//Math.floor(p.map(x, -256, 256, 0, 20)) % 5;
                pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, 255);
                // pg.stroke(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, 255);
                pg.noStroke();
                if(ci == 3) {
                  x += Math.sin(y * 0.5) * 4;
                }
                let n = 4;
                // x = Math.floor(x / n) * n;
                // y = Math.floor(y / n) * n;
                pg.vertex(x, y);
                // pg.beginShape();
                // pg.noFill();
                // pg.strokeWeight(3);
                // for (let j = 0; j < 300; j++) {
                //   pg.stroke(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, p.map(j, 0, 300, 155, 0));
                //   // let rot = j * Math.PI / 8.0 / 2.0;
                //   // let nx = x * Math.cos(rot) + y * -Math.sin(rot);
                //   // let ny = x * Math.sin(rot) + y * Math.cos(rot);
                //   let nx = x + Math.sin(j * 0.1) * j * 0.1;
                //   let ny = y + j * 1 - 100;
                //   pg.vertex(nx, ny);
                // }
                // pg.endShape();
              }
              pg.endShape(p.CLOSE);
            }
          }
        }
        break;

        case 3:
        pg.pushMatrix();
        pg.text("I'm suffering but fine", 0, 0);
        pg.popMatrix();
        break;

        case 4:
        pg.pushMatrix();
        pg.text("ICE CREAM", 0, 0);
        pg.popMatrix();
        break;

        case 5:
        pg.pushMatrix();
        pg.text("ONIGIRI", 0, 0);
        pg.popMatrix();
        break;

        case 6:
        pg.pushMatrix();
        pg.text("YOU EAT A LOT", 0, 0);
        pg.popMatrix();
        break;

        case 7:
        pg.pushMatrix();
        pg.text("Don't talk about me", 0, 0);
        pg.popMatrix();
        break;

        case 8:
        pg.pushMatrix();
        pg.text("I'm screaming but fine", 0, 0);
        pg.popMatrix();
        break;
      }
      pg.endDraw();
    }
  }
});

S008.prototype.constructor = S008;

var s = function (p) {
  let s008 = new S008(p);

  p.setup = function () {
    p.createCanvas(512, 512);
    p.frameRate(30);

    s008.setup();
    s008.pg = p.createGraphics(512, 512, p.P3D);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    s008.draw(t);
    p.background(128);
    p.image(s008.pg, 0, 0);
  }

  p.mousePressed = function () {
    s008.pg.save("dump.png");
  }
};

var p008 = new p5(s);
