var colorScheme = new ColorScheme("247ba0-70c1b3-b2dbbf-f3ffbd-ff1654");
// var colorScheme = new ColorScheme("ff6b35-f7c59f-efefd0-004e89-1a659e");

function Vec3f (ix, iy, ip) {
	if(ix != undefined)
		this.set(ix, iy, ip);
	else
		this.set(0, 0, 0);
}

Vec3f.prototype.set = function (ix, iy, ip) {
	this.x = ix;
	this.y = iy;
	this.p = ip;
}

function Gesture (mw, mh) {
	this.damp = 5.0;
	this.dampInv = 1.0 / this.damp;
	this.damp1 = this.damp - 1;
	this.INIT_TH = 14;
	this.thickness = this.INIT_TH;

	this.w = mw;
	this.h = mh;
	this.capacity = 600;
	this.path = new Array(this.capacity);
	this.polygons = new Array(this.capacity);
	this.crosses  = new Array(this.capacity);
	for (let i=0;i<this.capacity;i++) {
		this.polygons[i] = new Polygon();
		this.path[i] = new Vec3f();
		this.crosses[i] = 0;
	}
	this.nPoints = 0;
	this.nPolys = 0;

	this.exists = false;
	this.jumpDx = 0;
	this.jumpDy = 0;
}

Gesture.prototype.clear = function () {
	this.nPoints = 0;
	this.exists = false;
	this.thickness = this.INIT_TH;
}

Gesture.prototype.clearPolys = function () {
	this.nPolys = 0;
}

Gesture.prototype.addPoint = function (x, y) {

	if (this.nPoints >= this.capacity) {
		// there are all sorts of possible solutions here,
		// but for abject simplicity, I don't do anything.
	} 
	else {
		let v = this.distToLast(x, y);
		let p = this.getPressureFromVelocity(v);
		this.path[this.nPoints++].set(x,y,p);

		if (this.nPoints > 1) {
			this.exists = true;
			this.jumpDx = this.path[this.nPoints-1].x - this.path[0].x;
			this.jumpDy = this.path[this.nPoints-1].y - this.path[0].y;
		}
	}

}

Gesture.prototype.getPressureFromVelocity = function (v) {
	const scale = 18;
	const minP = 0.02;
	const oldP = (this.nPoints > 0) ? this.path[this.nPoints-1].p : 0;
	return ((minP + Math.max(0, 1.0 - v/scale)) + (this.damp1*oldP))*this.dampInv;
}

Gesture.prototype.setPressures = function () {
	// pressures vary from 0...1
	let pressure;
	let tmp;
	let t = 0;
	let u = 1.0 / (this.nPoints - 1)*Math.PI * 2;
	for (let i = 0; i < this.nPoints; i++) {
		pressure = Math.sqrt((1.0 - Math.cos(t))*0.5);
		this.path[i].p = pressure;
		t += u;
	}
}

Gesture.prototype.distToLast = function (ix, iy) {
	if (this.nPoints > 0) {
		let v = this.path[this.nPoints-1];
		let dx = v.x - ix;
		let dy = v.y - iy;

		return Math.sqrt(dx * dx + dy * dy);
	} 
	else {
		return 30;
	}
}

Gesture.prototype.compile = function () {
	// compute the polygons from the path of Vec3f's
	if (this.exists) {
		this.clearPolys();

		let p0, p1, p2;
		let radius0, radius1;
		let ax, bx, cx, dx;
		let ay, by, cy, dy;
		let   axi, bxi, cxi, dxi, axip, axid;
		let   ayi, byi, cyi, dyi, ayip, ayid;
		let p1x, p1y;
		let dx01, dy01, hp01, si01, co01;
		let dx02, dy02, hp02, si02, co02;
		let dx13, dy13, hp13, si13, co13;
		let taper = 1.0;

		let  nPathPoints = this.nPoints - 1;
		let  lastPolyIndex = nPathPoints - 1;
		let npm1finv =  1.0 / Math.max(1, nPathPoints - 1);

		// handle the first point
		p0 = this.path[0];
		p1 = this.path[1];
		radius0 = p0.p * this.thickness;
		dx01 = p1.x - p0.x;
		dy01 = p1.y - p0.y;
		hp01 = Math.sqrt(dx01*dx01 + dy01*dy01);
		if (hp01 == 0) {
			hp02 = 0.0001;
		}
		co01 = radius0 * dx01 / hp01;
		si01 = radius0 * dy01 / hp01;
		ax = p0.x - si01; 
		ay = p0.y + co01;
		bx = p0.x + si01; 
		by = p0.y - co01;

		let xpts;
		let ypts;

		let LC = 20;
		let RC = this.w-LC;
		let TC = 20;
		let BC = this.h-TC;
		let mint = 0.618;
		let tapow = 0.4;

		// handle the middle points
		let i = 1;
		let apoly;
		for (i = 1; i < nPathPoints; i++) {
			taper = Math.pow((lastPolyIndex-i)*npm1finv,tapow);
			

			p0 = this.path[i-1];
			p1 = this.path[i  ];
			p2 = this.path[i+1];
			p1x = p1.x;
			p1y = p1.y;
			radius1 = Math.max(mint,taper*p1.p*this.thickness);

			// assumes all segments are roughly the same length...
			dx02 = p2.x - p0.x;
			dy02 = p2.y - p0.y;
			hp02 = Math.sqrt(dx02*dx02 + dy02*dy02);
			if (hp02 != 0) {
				hp02 = radius1/hp02;
			}
			co02 = dx02 * hp02;
			si02 = dy02 * hp02;

			// translate the integer coordinates to the viewing rectangle
			axi = axip = Math.floor(ax);
			ayi = ayip = Math.floor(ay);
			axi=(axi<0)?(this.w-((-axi)%this.w)):axi%this.w;
			axid = axi-axip;
			ayi=(ayi<0)?(this.h-((-ayi)%this.h)):ayi%this.h;
			ayid = ayi-ayip;

			// set the vertices of the polygon
			apoly = this.polygons[this.nPolys++];
			xpts = apoly.xpoints;
			ypts = apoly.ypoints;
			xpts[0] = axi = axid + axip;
			xpts[1] = bxi = axid + Math.floor(bx);
			xpts[2] = cxi = axid + Math.floor(cx = p1x + si02);
			xpts[3] = dxi = axid + Math.floor(dx = p1x - si02);
			ypts[0] = ayi = ayid + ayip;
			ypts[1] = byi = ayid + Math.floor(by);
			ypts[2] = cyi = ayid + Math.floor(cy = p1y - co02);
			ypts[3] = dyi = ayid + Math.floor(dy = p1y + co02);

			// keep a record of where we cross the edge of the screen
			this.crosses[i] = 0;
			if ((axi<=LC)||(bxi<=LC)||(cxi<=LC)||(dxi<=LC)) { 
				this.crosses[i]|=1; 
			}
			if ((axi>=RC)||(bxi>=RC)||(cxi>=RC)||(dxi>=RC)) { 
				this.crosses[i]|=2; 
			}
			if ((ayi<=TC)||(byi<=TC)||(cyi<=TC)||(dyi<=TC)) { 
				this.crosses[i]|=4; 
			}
			if ((ayi>=BC)||(byi>=BC)||(cyi>=BC)||(dyi>=BC)) { 
				this.crosses[i]|=8; 
			}

			//swap data for next time
			ax = dx; 
			ay = dy;
			bx = cx; 
			by = cy;
		}

		// handle the last point
		p2 = this.path[nPathPoints];
		apoly = this.polygons[this.nPolys++];
		xpts = apoly.xpoints;
		ypts = apoly.ypoints;

		xpts[0] = Math.floor(ax);
		xpts[1] = Math.floor(bx);
		xpts[2] = Math.floor(p2.x);
		xpts[3] = Math.floor(p2.x);

		ypts[0] = Math.floor(ay);
		ypts[1] = Math.floor(by);
		ypts[2] = Math.floor(p2.y);
		ypts[3] = Math.floor(p2.y);

	}
}

Gesture.prototype.smooth = function () {
	// average neighboring points

	const weight = 18;
	const scale  = 1.0 / (weight + 2);
	let nPointsMinusTwo = this.nPoints - 2;
	let lower, upper, center;

	for (let i = 1; i < nPointsMinusTwo; i++) {
		lower = this.path[i-1];
		center = this.path[i];
		upper = this.path[i+1];

		center.x = (lower.x + weight*center.x + upper.x)*scale;
		center.y = (lower.y + weight*center.y + upper.y)*scale;
	}
}

/**
 * Yellowtail
 * by Golan Levin (www.flong.com). 
 * 
 * Click, drag, and release to create a kinetic gesture.
 * 
 * Yellowtail (1998-2000) is an interactive software system for the gestural 
 * creation and performance of real-time abstract animation. Yellowtail repeats 
 * a user's strokes end-over-end, enabling simultaneous specification of a 
 * line's shape and quality of movement. Each line repeats according to its 
 * own period, producing an ever-changing and responsive display of lively, 
 * worm-like textures.
 *
 * p5.js version by Naoto Hieda (naotohieda.com) 2019
 */

function Polygon () {
  this.xpoints = new Array(4);
  this.ypoints = new Array(4);
}

function SYellowtail (p, w, h) {
	this.p = p;

	this.gestureArray;
	this.nGestures = 36;  // Number of gestures
	this.minMove = 3;     // Minimum travel for a new point
	this.currentGestureID;

	this.pressing = false;

	this.tempP;
	this.tmpXp;
	this.tmpYp;

  p.background(0, 0, 0);
  p.noStroke();

  this.currentGestureID = -1;
  this.gestureArray = new Array(this.nGestures);
  for (let i = 0; i < this.nGestures; i++) {
    this.gestureArray[i] = new Gesture(p.width, p.height);
  }
  this.clearGestures();
}

SYellowtail.prototype.draw = function () {
	let p = this.p;
  p.background(0);

  this.updateGeometry();
  p.fill(255, 255, 245);
  for (let i = 0; i < this.nGestures; i++) {
    this.renderGesture(this.gestureArray[i], p.width, p.height);
  }
}

SYellowtail.prototype.mousePressed = function () {
	let p = this.p;
	this.pressing = true;
  this.currentGestureID = (this.currentGestureID+1) % this.nGestures;
	let G = this.gestureArray[this.currentGestureID];
  G.clear();
  G.clearPolys();
  G.addPoint(p.mouseX, p.mouseY);
}

SYellowtail.prototype.mouseDragged = function () {
	let p = this.p;
  if (this.currentGestureID >= 0) {
    let G = this.gestureArray[this.currentGestureID];
    if (G.distToLast(p.mouseX, p.mouseY) > this.minMove) {
      G.addPoint(p.mouseX, p.mouseY);
      G.smooth();
      G.compile();
    }
  }
}

SYellowtail.prototype.mouseReleased = function () {
	let p = this.p;
	this.pressing = false;
}

SYellowtail.prototype.keyPressed = function () {
	let p = this.p;
  if (p.key == '+' || p.key == '=') {
    if (this.currentGestureID >= 0) {
      let th = this.gestureArray[this.currentGestureID].thickness;
      this.gestureArray[this.currentGestureID].thickness = Math.min(96, th+1);
      this.gestureArray[this.currentGestureID].compile();
    }
  } else if (p.key == '-') {
    if (this.currentGestureID >= 0) {
      let th = this.gestureArray[this.currentGestureID].thickness;
      this.gestureArray[this.currentGestureID].thickness = Math.max(2, th-1);
      this.gestureArray[this.currentGestureID].compile();
    }
  } else if (p.key == ' ') {
    this.clearGestures();
  }
}

SYellowtail.prototype.renderGesture = function (gesture, w, h) {
	let p = this.p;
  if (gesture.exists) {
    if (gesture.nPolys > 0) {
      let polygons = gesture.polygons;
      let crosses = gesture.crosses;

      let xpts;
      let ypts;
      let poly;
      let cr;

      p.beginShape(p.QUADS);
      let gnp = gesture.nPolys;
      for (let i=0; i<gnp; i++) {

        poly = polygons[i];
        xpts = poly.xpoints;
        ypts = poly.ypoints;
				

        p.vertex(xpts[0], ypts[0]);
        p.vertex(xpts[1], ypts[1]);
        p.vertex(xpts[2], ypts[2]);
        p.vertex(xpts[3], ypts[3]);

        if ((cr = crosses[i]) > 0) {
          if ((cr & 3)>0) {
            p.vertex(xpts[0]+w, ypts[0]);
            p.vertex(xpts[1]+w, ypts[1]);
            p.vertex(xpts[2]+w, ypts[2]);
            p.vertex(xpts[3]+w, ypts[3]);

            p.vertex(xpts[0]-w, ypts[0]);
            p.vertex(xpts[1]-w, ypts[1]);
            p.vertex(xpts[2]-w, ypts[2]);
            p.vertex(xpts[3]-w, ypts[3]);
          }
          if ((cr & 12)>0) {
            p.vertex(xpts[0], ypts[0]+h);
            p.vertex(xpts[1], ypts[1]+h);
            p.vertex(xpts[2], ypts[2]+h);
            p.vertex(xpts[3], ypts[3]+h);

            p.vertex(xpts[0], ypts[0]-h);
            p.vertex(xpts[1], ypts[1]-h);
            p.vertex(xpts[2], ypts[2]-h);
            p.vertex(xpts[3], ypts[3]-h);
          }

          // I have knowingly retained the small flaw of not
          // completely dealing with the corner conditions
          // (the case in which both of the above are true).
        }
      }
      p.endShape();
    }
  }
}

SYellowtail.prototype.updateGeometry = function () {
	let p = this.p;
  let J;
  for (let g=0; g<this.nGestures; g++) {
    if ((J=this.gestureArray[g]).exists) {
      if (g!=this.currentGestureID) {
        this.advanceGesture(J);
      } else if (!this.pressing) {
        this.advanceGesture(J);
      }
    }
  }
}

SYellowtail.prototype.advanceGesture = function (gesture) {
  // Move a Gesture one step
  if (gesture.exists) { // check
    let nPts = gesture.nPoints;
    let nPts1 = nPts-1;
    let path;
    let jx = gesture.jumpDx;
    let jy = gesture.jumpDy;

    if (nPts > 0) {
      path = gesture.path;
      for (let i = nPts1; i > 0; i--) {
        path[i].x = path[i-1].x;
        path[i].y = path[i-1].y;
      }
      path[0].x = path[nPts1].x - jx;
      path[0].y = path[nPts1].y - jy;
      gesture.compile();
    }
  }
}

SYellowtail.prototype.clearGestures = function () {
  for (let i = 0; i < this.nGestures; i++) {
    this.gestureArray[i].clear();
  }
}


var s = function (p) {
  let sYellowtail;
	

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(60);
	  sYellowtail = new SYellowtail(p, 800, 800);
  }

  p.draw = function () {
    //p.background(0);
    sYellowtail.draw();
    //p.image(sYellowtail.pg, 0, 0);
  }

  p.mousePressed = function () {
		sYellowtail.mousePressed();
  }

  p.mouseDragged = function () {
		sYellowtail.mouseDragged();
  }

  p.mouseReleased = function () {
		sYellowtail.mouseReleased();
  }
};

var p5js = new p5(s);

////////

// function SDisplay(p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.lastT = 0;
//   this.tBase = 0;
// }

// SDisplay.prototype = Object.create(TLayer.prototype);
// SDisplay.prototype.constructor = SDisplay;

// SDisplay.prototype.update = function(args) {
//   let t = args.t;
//   let p = this.p;

//   if(Math.floor(t) - Math.floor(this.lastT) > 0) {
//     this.tBase = t;
//   }
//   this.lastT = t;
// }

// SDisplay.prototype.drawLayer = function(pg, key, args) {
//   let t = args.t;
//   let p = this.p;

//   pg.clear();

//   let c0 = this.c;
//   pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
//   // pg.background((t % 1) * 255);
//   // pg.background(0);

//   pg.translate(this.width / 2, this.height / 2 / 2);
//   c0 = 4;
//   pg.noStroke();
//   // pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
//   pg.fill(255);

//   // pg.beginShape(p.LINE_STRIP);
//   for(let i = -20; i <= 20; i++) {
//     // let env = Math.cos(i / 40 * Math.PI);
//     // pg.vertex(i * 20, 100 * Math.sin(i * Math.PI / 40 * 16 + EasingFunctions.easeInOutQuad(t%1) * Math.PI * 8) * env);
//     let x = 150 * Math.cos(2 * i / 20 * Math.PI + t * Math.PI);
//     let y = 150 * Math.sin(i / 20 * Math.PI + (t + this.phase) * Math.PI);
//     pg.circle(x, y, 10);
//   }

//   pg.fill(255);
//   pg.rect(0, this.height/2, 0, this.height/2);

//   // pg.endShape();

//   tReturn = function () {
//     return 1 - Math.abs(t % 2 - 1);
//   }
// }

// ////////

// function SLorenz(p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.x = 0.01;
//   this.y = 0;
//   this.z = 0;
  
//   this.a = 10;
//   this.b = 28;
//   this.c = 8.0 / 3.0;
  
//   this.points = new Array();
// }

// SLorenz.prototype = Object.create(TLayer.prototype);
// SLorenz.prototype.constructor = SLorenz;

// SLorenz.prototype.update = function(args) {
//   let t = args.t;
//   let p = this.p;

//   let dt = 0.01;
//   let dx = (this.a * (this.y - this.x)) * dt;
//   let dy = (this.x * (this.b - this.z) - this.y) * dt;
//   let dz = (this.x * this.y - this.c * this.z) * dt;
//   this.x += dx;
//   this.y += dy;
//   this.z += dz;

//   this.points.push(new p5.Vector(this.x, this.y, this.z));
//   if(this.points.length > 500) {
//     this.points.shift();
//   }
// }

// SLorenz.prototype.drawLayer = function(pg, key, args) {
//   let t = args.t;
//   let p = this.p;

//   pg.colorMode(p.HSB);

//   pg.background(0);

//   pg.translate(0, 0, -80);
//   pg.translate(this.width/2, this.height/2/2);
//   pg.scale(5);
//   pg.stroke(255);
//   pg.noFill();
//   pg.rotateY(t * 0.25 * Math.PI);

//   let hu = 0;
//   pg.beginShape();

//   for (let i in this.points) {
//     let v = this.points[i];
//     pg.stroke(hu, 255, 255);
//     pg.vertex(v.x, v.y, v.z);

//     hu += 1;
//     if (hu > 255) {
//       hu = 0;
//     }
//   }
//   pg.endShape();
// }

// ////////

// function Drop(p) {
//   this.x = p.random(800);
//   this.y = p.random(-500, -50);
//   this.z = p.random(0, 20);
//   this.len = p.map(this.z, 0, 20, 10, 20);
//   this.yspeed = p.map(this.z, 0, 20, 1, 20);

//   this.fall = function() {
//     this.y = this.y + this.yspeed;
//     var grav = p.map(this.z, 0, 20, 0, 0.2);
//     this.yspeed = this.yspeed + grav;

//     if (this.y > 400) {
//       this.y = p.random(-200, -100);
//       this.yspeed = p.map(this.z, 0, 20, 4, 10);
//     }
//   }

//   this.show = function(pg) {
//     var thick = p.map(this.z, 0, 20, 1, 3);
//     pg.strokeWeight(thick);
//     pg.stroke(138, 43, 226);
//     pg.line(this.x, this.y, this.x, this.y+this.len);
//   }
// }

// function SPurpleRain(p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.drops = [];
//   for (let i = 0; i < 200; i++) {
//     this.drops[i] = new Drop(p);
//   }
// }

// SPurpleRain.prototype = Object.create(TLayer.prototype);
// SPurpleRain.prototype.constructor = SPurpleRain;

// SPurpleRain.prototype.update = function(args) {
//   let t = args.t;
//   let p = this.p;
// }

// SPurpleRain.prototype.drawLayer = function(pg, key, args) {
//   let t = args.t;
//   let p = this.p;

//   pg.background(230, 230, 250);
//   for (let i in this.drops) {
//     this.drops[i].fall();
//     this.drops[i].show(pg);
//   }
// }

// ////////

// function Star(p) {
//   let w = h = 800;
//   this.x = p.random(-w, w);
//   this.y = p.random(-h, h);
//   this.z = p.random(w);
//   this.pz = this.z;

//   this.update = function(speed) {
//     this.z = this.z - speed;
//     if (this.z < 1) {
//       this.z = w;
//       this.x = p.random(-w, w);
//       this.y = p.random(-h, h);
//       this.pz = this.z;
//     }
//   }

//   this.show = function(pg) {
//     pg.fill(255);
//     pg.noStroke();

//     let sx = p.map(this.x / this.z, 0, 1, 0, w);
//     let sy = p.map(this.y / this.z, 0, 1, 0, h);

//     let r = p.map(this.z, 0, p.width, 16, 0);
//     pg.ellipse(sx, sy, r, r);

//     let px = p.map(this.x / this.pz, 0, 1, 0, w);
//     let py = p.map(this.y / this.pz, 0, 1, 0, h);

//     this.pz = this.z;

//     pg.stroke(255);
//     pg.line(px, py, sx, sy);
//   }
// }

// function SStarField(p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.stars = [];
//   for (let i = 0; i < 200; i++) {
//     this.stars[i] = new Star(p);
//   }
// }

// SStarField.prototype = Object.create(TLayer.prototype);
// SStarField.prototype.constructor = SStarField;

// SStarField.prototype.update = function(args) {
//   let t = args.t;
//   let p = this.p;
// }

// SStarField.prototype.drawLayer = function(pg, key, args) {
//   let t = args.t;
//   let p = this.p;

//   let speed = 25;
//   pg.background(0);
//   pg.translate(this.width / 2, this.height / 4);
//   for (let i in this.stars) {
//     this.stars[i].update(speed);
//     this.stars[i].show(pg);
//   }
// }

// ////////

// function SCamera(p, w, h) {
//   TLayer.call(this, p, w, h);
//   this.lastT = 0;
// }

// SCamera.prototype = Object.create(TLayer.prototype);
// SCamera.prototype.constructor = SCamera;

// SCamera.prototype.update = function(args) {
//   let t = args.t;
//   let p = this.p;
// }

// SCamera.prototype.drawLayer = function(pg, key, args) {
//   let t = args.t * 0.25;
//   let p = this.p;
//   if(true||Math.floor(t) - Math.floor(this.lastT) > 0) {
//     pg.clear();
//     if(this.resultPg != undefined) {
//       pg.image(this.resultPg, 0, 0);
//     }
//   }

//   this.lastT = t;
// }

// function S051 (p, w, h, texes) {
//   this.texes = texes;
//   SRendererShadow.call(this, p, w, h);
//   this.uMetallic = 0.1;
//   this.uRoughness = 0.8;
//   this.uSpecular = 0.01;
//   this.uExposure = 4.0;
//   this.uVignette = 0.7;
//   this.uLightRadius = 1000.0;
//   // this.uGamma = 0.6;

//   this.shape = p.createShape(p.GROUP);
//   this.displays = p.createShape(p.GROUP);
//   for(let i = -2; i <= 2; i++) {
//     for(let j = -2; j <= 2; j++) {
//       let h = p.random([0, 100, 200]);
//       if(h == 0) continue;
//       let s = p.createShape(p.BOX, 10, h, 10);
//       s.translate(j * 100, -h/2, i * 100);
//       s.disableStyle();
//       this.shape.addChild(s);
//     }
//   }

//   // wall
//   let dw = 47.5;
//   let dh = 47.5;
//   let rate = 0.1;
//   for(let i = -1.5; i <= 2; i++) {
//     for(let j = -1; j <= 1; j++) {
//       if(Math.random() > 0.5) {
//         let h = 100;
//         let s = p.createShape(p.BOX, 5, h, 100);
//         s.translate(j * 100, -h/2, i * 100);
//         s.disableStyle();
//         this.shape.addChild(s);
//         if(Math.random() > rate) {
//           s = p.createShape();
//           s.beginShape(p.TRIANGLE_STRIP);
//           s.noStroke();
//           s.textureMode(p.NORMAL);
//           s.texture(p.random(this.texes).pg);
//           s.vertex(-dw, -dh, 0, 0);
//           s.vertex(-dw, dh, 0, 1);
//           s.vertex(dw, -dh, 1, 0);
//           s.vertex(dw, dh, 1, 1);
//           s.endShape();
//           s.rotateY(Math.PI / 2);
//           s.translate(j * 100 - 2.51, -h/2, i * 100);
//           this.displays.addChild(s);
//         }

//         if(Math.random() > rate) {
//           s = p.createShape();
//           s.beginShape(p.TRIANGLE_STRIP);
//           s.noStroke();
//           s.textureMode(p.NORMAL);
//           s.texture(p.random(this.texes).pg);
//           s.vertex(-dw, -dh, 0, 0);
//           s.vertex(-dw, dh, 0, 1);
//           s.vertex(dw, -dh, 1, 0);
//           s.vertex(dw, dh, 1, 1);
//           s.endShape();
//           s.rotateY(-Math.PI / 2);
//           s.translate(j * 100 + 2.51, -h/2, i * 100);
//           this.displays.addChild(s);
//         }
//       }
//     }
//   }
//   for(let i = -1; i <= 1; i++) {
//     for(let j = -1.5; j <= 2; j++) {
//       if(Math.random() > 0.5) {
//         let h = 100;
//         let s = p.createShape(p.BOX, 100, h, 5);
//         s.translate(j * 100, -h/2, i * 100);
//         s.disableStyle();
//         this.shape.addChild(s);

//         if(Math.random() > rate) {
//           s = p.createShape();
//           s.beginShape(p.TRIANGLE_STRIP);
//           s.noStroke();
//           s.textureMode(p.NORMAL);
//           s.texture(p.random(this.texes).pg);
//           s.vertex(-dw, -dh, 0, 0);
//           s.vertex(-dw, dh, 0, 1);
//           s.vertex(dw, -dh, 1, 0);
//           s.vertex(dw, dh, 1, 1);
//           s.endShape();
//           s.translate(j * 100, -h/2, i * 100 - 2.51);
//           this.displays.addChild(s);
//         }

//         if(Math.random() > rate) {
//           s = p.createShape();
//           s.beginShape(p.TRIANGLE_STRIP);
//           s.noStroke();
//           s.textureMode(p.NORMAL);
//           s.texture(p.random(this.texes).pg);
//           s.vertex(-dw, -dh, 0, 0);
//           s.vertex(-dw, dh, 0, 1);
//           s.vertex(dw, -dh, 1, 0);
//           s.vertex(dw, dh, 1, 1);
//           s.endShape();
//           s.rotateY(Math.PI);
//           s.translate(j * 100, -h/2, i * 100 + 2.51);
//           this.displays.addChild(s);
//         }
//       }
//     }
//   }

//   // ceiling / floor
//   for(let i = -3.5; i <= 4; i++) {
//     for(let j = -3.5; j <= 4; j++) {
//       let h = 10;
//       if(Math.abs(i) < 2 && Math.abs(j) < 2) {
//         let s = p.createShape(p.BOX, 100, h, 100);
//         s.translate(j * 100, -h/2 - 100, i * 100);
//         s.disableStyle();
//         this.shape.addChild(s);
//       }

//       {
//         let s = p.createShape(p.BOX, 100, h, 100);
//         s.translate(j * 100, h/2, i * 100);
//         s.disableStyle();
//         this.shape.addChild(s);
//       }
//     }
//   }
//   this.shape.disableStyle();
// }

// S051.prototype = Object.create(SRendererShadow.prototype);

// S051.prototype.drawScene = function (pg, isShadow) {
//   let p = this.p;
//   pg.clear();
//   let c0 = 0;
//   pg.background(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
//   pg.noStroke();
//   pg.fill(255);
//   this.defaultShader.set("uUseTexture", 0);
//   pg.shape(this.shape, 0, 0);
//   if(!isShadow) {
//     this.defaultShader.set("uUseTexture", 1);
//   }
//   // pg.texture(this.tex);
//   // pg.fill(colorScheme.get(c0).r, colorScheme.get(c0).g, colorScheme.get(c0).b);
//   pg.shape(this.displays, 0, 0);
// }

// S051.prototype.draw = function (args) {
//   let p = this.p;
//   Object.getPrototypeOf(S051.prototype).draw.call(this);
// }

// S051.prototype.constructor = S051;

// ////////

// var s = function (p) {
//   // let tex0 = new SDisplay(p, 800, 800);
//   // tex0.c = 4;
//   // tex0.phase = 0;
//   let texes = [];
//   texes.push(new SStarField(p, 800, 1600));
//   texes.push(new SLorenz(p, 800, 800));
//   texes.push(new SPurpleRain(p, 800, 800));
//   texes.push(new SCamera(p, 800, 1600));
//   let s051 = new S051(p, 800, 800, texes);
//   // let s051 = new S051(p, 800, 800, [tex0.pg]);
//   // let s051 = new S051(p, 1920, 1080, [tex0.pg, tex1.pg, tex2.pg]);


//   p.setup = function () {
//     p.createCanvas(800, 800);
//     // p.createCanvas(1920, 1080);
//     p.frameRate(60);
//     // tex.draw({t: 0});
//     s051.setup();
//   }

//   p.draw = function () {
//     let t = p.millis() * 0.001;

//     if(p.frameCount % 30 == 0) {
//       print(p.frameRate())
//     }

//     let angle = t * -0.05;
//     s051.cameraPosition.set(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
//     // s051.cameraPosition.set(100, -50, 100);
//     s051.lightPos.set(200, -20, 50);
//     s051.lightDirection = s051.lightPos;
//     s051.draw({t: t});
//     texes[3].resultPg = s051.pg;
//     for(let i in texes) {
//       texes[i].draw({t: t});
//     }

//     p.background(0);
//     angle = t * 0.1;
//     s051.cameraPosition.set(300.0 * Math.cos(angle), -50.0, 300.0 * Math.sin(angle));
//     s051.lightPos.set(s051.cameraPosition.x, s051.cameraPosition.y, s051.cameraPosition.z);
//     s051.lightDirection = s051.lightPos;
//     s051.draw({t: t});
//     p.image(s051.pg, 0, 0);
//   }
// };

// var p051 = new p5(s);
