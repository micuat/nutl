// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/l__fEY1xanY

// instance mode by Naoto Hieda

var x;
var y;

var s = function (p) {
  p.setup = function () {
    p.createCanvas(64, 64).parent('sketch-holder');
    x = p.width/2;
    y = p.height/2;
    p.background(51);
  }

  p.draw = function () {
    p.stroke(255, 100);
    p.strokeWeight(2);
    p.point(x, y);

    var r = p.floor(p.random(4));

    switch (r) {
      case 0:
        x = x + 1;
        break;
      case 1:
        x = x - 1;
        break;
      case 2:
        y = y + 1;
        break;
      case 3:
        y = y - 1;
        break;
    }


  }

};

var p052 = new p5(s);