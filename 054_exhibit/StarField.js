// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/17WoOqgXsRM

// instance mode by Naoto Hieda

function Star() {
  this.x = p001.random(-p001.width, p001.width);
  this.y = p001.random(-p001.height, p001.height);
  this.z = p001.random(p001.width);
  this.pz = this.z;

  this.update = function(speed) {
    this.z = this.z - speed;
    if (this.z < 1) {
      this.z = p001.width;
      this.x = p001.random(-p001.width, p001.width);
      this.y = p001.random(-p001.height, p001.height);
      this.pz = this.z;
    }
  }

  this.show = function() {
    p001.fill(255);
    p001.noStroke();

    var sx = p001.map(this.x / this.z, 0, 1, 0, p001.width);
    var sy = p001.map(this.y / this.z, 0, 1, 0, p001.height);

    var r = p001.map(this.z, 0, p001.width, 16, 0);
    p001.ellipse(sx, sy, r, r);

    var px = p001.map(this.x / this.pz, 0, 1, 0, p001.width);
    var py = p001.map(this.y / this.pz, 0, 1, 0, p001.height);

    this.pz = this.z;

    p001.stroke(255);
    p001.line(px, py, sx, sy);

  }
}

var s = function(p) {

  var stars = [];

  var speed;

  p.setup = function () {
    p.createCanvas(512, 512).parent('sketch-holder');
    for (var i = 0; i < 200; i++) {
      stars[i] = new Star();
    }
  }

  p.draw = function () {
    speed = 25;//p.map(p.mouseX, 0, p.width, 0, 50);
    p.background(0);
    p.translate(p.width / 2, p.height / 2);
    for (var i = 0; i < stars.length; i++) {
      stars[i].update(speed);
      stars[i].show();
    }
  };
};

var p001 = new p5(s);