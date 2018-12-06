function S008 (p) {
  SRenderer.call(this, p);
  this.colorScheme = new ColorScheme("1be7ff-6eeb83-e4ff1a-ffb800-ff5714");
}

S008.prototype = Object.create(SRenderer.prototype, {
  draw: {
    value: function (t) {
      let p = this.p;
      let pg = this.pg;

      if(this.font == undefined || this.font == null) {
        this.font = new Packages.geomerative.RFont("assets/fonts/Avenir.ttf", 180, p.CENTER);
      }

      pg.beginDraw();
      pg.clear();
      // pg.stroke(0);
      // pg.strokeWeight(2);
      pg.noStroke();
      pg.translate(pg.width / 2, pg.height / 2 + 180.0 / 4.0);
      // pg.textAlign(p.CENTER, p.CENTER);

      Packages.geomerative.RCommand.setSegmentLength(5); // 5 = many points; 125 = only a few points
      Packages.geomerative.RCommand.setSegmentator(Packages.geomerative.RCommand.UNIFORMLENGTH);

      // pg.noFill();
      let mode = 0;
      switch (mode) {
        case 0:
        {
          let grp = this.font.toGroup('MMCK');
          pg.fill(255);
          grp.draw(pg);
          let rpoints = grp.getPoints();
          let rot = 0.3;
          // pg.stroke(255);
          for (let i = 0; i < rpoints.length - 1; i++) {
            let x = rpoints[i].x;
            let y = rpoints[i].y;
            let n = 8;
            let nx = (Math.floor(x / n) + 0.5) * n;
            let ny = (Math.floor(y / n) + 0.5) * n;
            // let nx = x * Math.cos(rot) + y * -Math.sin(rot);
            // let ny = x * Math.sin(rot) + y * Math.cos(rot);
            // pg.line(x, y, nx, ny);
            let idx = Math.floor(p.map(x, -256, 256, 0, 10)) % 5;
            pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
            pg.ellipse(nx, ny, n, n);
          }
        }
        // pg.textFont(this.font);
        // for(let i = 0; i < 10; i++) {
        //   pg.pushMatrix();
        //   pg.translate(0, p.map(i, 0, 9, -100, 100));
        //   let s = p.map(i, 0, 9, 0.8, 1);
        //   pg.scale(s, s);
        //   let idx = Math.floor(p.map(i, 0, 9, 0, 4));
        //   s = p.map(i, 0, 9, 0.5, 1);
        //   pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b, s * 255);
        //   pg.text("MMCK", 0, 0);
        //   pg.popMatrix();
        // }
        break;

        case 1:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("STUPID", 0, 0);
        pg.popMatrix();
        break;

        case 2:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("IGNORE ME", 0, 0);
        pg.popMatrix();
        break;

        case 3:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("I'm suffering but fine", 0, 0);
        pg.popMatrix();
        break;

        case 4:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("ICE CREAM", 0, 0);
        pg.popMatrix();
        break;

        case 5:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("ONIGIRI", 0, 0);
        pg.popMatrix();
        break;

        case 6:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("YOU EAT A LOT", 0, 0);
        pg.popMatrix();
        break;

        case 7:
        pg.textFont(this.font);
        pg.pushMatrix();
        pg.text("Don't talk about me", 0, 0);
        pg.popMatrix();
        break;

        case 8:
        pg.textFont(this.font);
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
