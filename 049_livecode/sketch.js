// doUpdate = true;
// doUpdate = false;

// if(ps == undefined || doUpdate) {
//   var ps = new p5(function (p) {
//     p.setup = function () {
//       if(ps == undefined || doUpdate) {
//         p.createCanvas(1920, 1080);
//         p.frameRate(60);
//       }
//     }

//     p.draw = function () {
//     }
//   });
// }

// ps.draw = function () {
//   let t = ps.millis() * 0.001;

//   if(ps.frameCount % 30 == 0) {
//     print(ps.frameRate())
//   }

//   ps.background(0);
//   ps.translate(ps.width/2, ps.height/2);
//   ps.rectMode(ps.CENTER);
//   ps.fill(255, 100)
//   ps.noStroke();

//   for (let i = -2; i <= 2; i++) {
//     ps.push();
//     ps.translate(i * 200, 0);
//     ps.rotate(ps.millis() * 0.001 + i * 0.2)
//     ps.scale(Math.sin(ps.millis() * 0.001), 1);
//     ps.rect(0, 0, 300, 300);
//     ps.pop();
//   }
// }

function S(p, w, h) {
  TLayer.call(this, p, w, h);
}

S.prototype = Object.create(TLayer.prototype);

S.prototype.update = function(args) {
}

S.prototype.drawLayer = function(pg, key, args) {
  pg.translate(this.width/2, this.height/2);
}

S.prototype.constructor = S;

var doUpdate = false;
if(ps == undefined || doUpdate) var ps = new p5(function (p) {
  p.s = new S(p, 1920, 1080);
  p.sets = [];

  p.setup = function () {
    p.createCanvas(1920, 1080);
    p.frameRate(60);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;
    p.t = t;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    // p.s.draw({t: t});
    p.background(128);
    p.image(p.s.pg, 0, 0);
    for(let i in p.sets) {
      let t0 = (t - p.sets[i].t) / p.sets[i].cycle;
      p.translate(0, 0, 0.001);
      (p.sets[i].func)(t0, p.sets[i].pts, p.sets[i].c);
    }
  }

  let recording = false;
  let startTime = 0;
  let curPts = [];
  p.mousePressed = function () {
    recording = true;
    startTime = p.millis() * 0.001;
    curPts = [];
    curPts.push({x: p.mouseX, y: p.mouseY});
  }

  p.mouseDragged = function () {
    curPts.push({x: p.mouseX, y: p.mouseY});
  }

  p.mouseReleased = function () {
    recording = false;
    curPts.push({x: p.mouseX, y: p.mouseY});

    let cx = 0, cy = 0;
    for(let i = 0; i < curPts.length; i++) {
      cx += curPts[i].x;
      cy += curPts[i].y;
    }
    cx /= curPts.length;
    cy /= curPts.length;
  
    p.sets.push({pts: curPts, func: p.drawPtsNext, c: {x: cx, y: cy}, t: startTime, cycle: p.millis() * 0.001 - startTime});
    if(p.sets.length > 10) p.sets.shift();
  }

  p.drawPtsNext = function (pts) {
    for(let i = 0; i < pts.length - 1; i++) {
      p.line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y)
    }
  }
});

ps.current = function (t, pts) {
  t *= 30;
  let p0 = pts[Math.floor(t) % pts.length];
  let p1 = pts[Math.ceil(t) % pts.length];
  return {x: ps.lerp(p0.x, p1.x, t % 1), y: ps.lerp(p0.y, p1.y, t % 1)};
}
ps.drawPtsNext = function (t, pts, c) {
  ps.push();
  ps.translate(c.x, c.y);
  ps.rotate(ps.current(pts).x * 0.01);
  ps.translate(-c.x, -c.y);
  ps.colorMode(ps.HSB, 255, 255, 255)
  ps.beginShape();
  ps.vertex(c.x, c.y);
  for(let i = 0; i < pts.length - 1; i++) {
    ps.fill(i * 10, 255, 255);
    // ps.rect(pts[i].x, Math.sin(ps.t*2+i*0.1)*20+pts[i].y, 10, 10)
    ps.vertex(pts[i].x, Math.sin(ps.t*2+i*0.1)*20+pts[i].y)
    // ps.line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y)
  }
  ps.endShape();
  // let size = ps.current(pts).x;
  // ps.rect(0, 0, size, size)
  ps.pop();
}

// ps.drawPtsNext = function (pts, c) {
//   ps.push();
//   ps.translate(pts[0].x, pts[0].y);
//   ps.circle(0, 0, ps.current(t, pts).x * 0.1)
//   ps.pop();
// }

tReturn = function (t) {
  return t % 2 > 1 ? 1 - t % 1: t % 1;
}

tEase = function (t) {
  return EasingFunctions.easeInOutCubic(tReturn(t));
}

ps.drawPtsNext = function (t, pts, c) {
  ps.push();
  // ps.blendMode(ps.SCREEN)
  ps.colorMode(ps.HSB, 255, 255, 255)
  ps.beginShape();
  let x, y;
  let r = 100 * ps.constrain(ps.map(c.x - pts[0].x, 0, 100, 0.8, 1.0), 0.8, 1.0);
  for(let i = 0; i < pts.length; i++) {
    ps.fill(i * 255 / pts.length * 0.5 + 128, 255, 255, 150);
    x = Math.floor(pts[i].x * 0.01) * 100;
    y = Math.floor(pts[i].y * 0.01) * 100;
    let r = 100 * ps.constrain(ps.map(c.x - pts[0].x, 0, 100, 0.8, 1.0), 0.8, 1.0);
    x = ps.lerp(x, ps.width/2-600 + r * Math.cos(i/pts.length*2*Math.PI), tEase(t));
    y = ps.lerp(y, ps.height/2 + r * Math.sin(i/pts.length*2*Math.PI), tEase(t));
    ps.vertex(x, y, 10, 10)
    // ps.rect(x, y, 10, 10)
  }
  ps.endShape(ps.CLOSE);
  // let size = ps.current(t, pts).x;
  // ps.rect(0, 0, size, size)
  ps.pop();
}
