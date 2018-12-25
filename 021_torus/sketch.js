function SObject (p) {
  this.p = p;
  this.doFadeIn = false;
  this.fadeIn = 0.0;
  this.doFadeOut = false;
  this.fadeOut = 0.0;
  this.fadeSpeed = 1.0;
  this.tLastUpdate = 0.0;
}

SObject.prototype.setup = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
}

SObject.prototype.in = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  that.doFadeIn = true;
  that.doFadeOut = false;
  that.fadeIn = 0.0;
  that.fadeOut = 0.0;
}

SObject.prototype.out = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  that.doFadeIn = false;
  that.doFadeOut = true;
  that.fadeIn = 1.0;
  that.fadeOut = 0.0;
}

SObject.prototype.update = function (that) {
  if(that == undefined) that = this;
  let p = that.p;
  let t = p.millis() * 0.001;
  let tDiff = t - that.tLastUpdate;
  if(that.doFadeIn) {
    that.fadeIn += tDiff * that.fadeSpeed;
    if(that.fadeIn > 1.0) that.fadeIn = 1.0;
  }
  if(that.doFadeOut) {
    that.fadeOut += tDiff * that.fadeSpeed;
    if(that.fadeOut > 1.0) that.fadeOut = 1.0;
  }
  that.tLastUpdate = t;
}

SObject.prototype.draw = function (that, pg) {
  if(that == undefined) that = this;
  let p = that.p;
}

function SSphere (p) {
  SObject.call(this, p);
  this.shape = p.createShape(p.GROUP);
  let n = 128;
  let r = 100;
  for(let i = -n; i <= n; i++) {
    let s = p.createShape();
    s.beginShape(this.p.TRIANGLE_STRIP);
    s.noStroke();
    s.fill(255);
    for(let j = -n; j <= n; j++) {
      for(let ii = 1; ii >= 0; ii--) {
        let theta = p.map(i + ii, -n, n, -Math.PI, Math.PI);
        let phi = p.map(j, -n, n, 0, Math.PI);
        let x0 = r * Math.sin(phi) * Math.cos(theta);
        let y0 = r * Math.sin(phi) * Math.sin(theta);
        let z0 = r * Math.cos(phi);
        s.normal(x0, y0, z0);
        s.vertex(x0, y0, z0, phi / Math.PI, (theta / Math.PI) * 0.5 + 0.5);
      }
    }
    s.endShape(this.p.CLOSE);
    this.shape.addChild(s);
  }
}

SSphere.prototype = Object.create(SObject.prototype, {
  draw: {
    value: function (pg) {
      let p = this.p;
      let scale = EasingFunctions.easeInOutCubic(this.fadeIn * (1.0 - this.fadeOut));
      pg.pushMatrix();
      pg.scale(scale, scale, scale);
      pg.shape(this.shape, 0, 0);
      pg.popMatrix();
      Object.getPrototypeOf(SSphere.prototype).draw(this);
    }
  }
});

SSphere.prototype.constructor = SSphere;

function S021 (p, w, h) {
  SRendererShadow.call(this, p, w, h);
  this.colorScheme = new ColorScheme("8a6552-462521-ca2e55-dde0b5-bdb246");
  this.texture = p.createGraphics(40, 40, p.P3D);
  this.texture.beginDraw();
  this.texture.background(255);
  this.texture.endDraw();
  this.uMetallic = 0.3;
  this.uRoughness = 0.5;
  this.uSpecular = 0.9;
  this.uExposure = 4.0;
  this.uVignette = 0.0;

  this.pts = 40; 
  this.angle = 0;
  this.radius = 40.0;

  // lathe segments
  this.segments = 80;
  this.latheAngle = 0;
  this.latheRadius = 80.0;

  //vertices
  this.vertices = [], this.vertices2 = [];

  // for shaded or wireframe rendering 
  this.isWireFrame = false;

  // for optional helix
  this.isHelix = false;
  this.helixOffset = 5.0;
}

S021.prototype = Object.create(SRendererShadow.prototype, {
  drawScene: {
    value: function (pg, isShadow) {
      let p = this.p;
      pg.clear();
      pg.pushMatrix();
      if(!isShadow) {
        let idx = 4;
        // pg.background(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      }
      //center and spin toroid
      // pg.translate(pg.width/2, pg.height/2, -100);
    
      pg.rotateX(p.frameCount*Math.PI/150);
      pg.rotateY(p.frameCount*Math.PI/170);
      pg.rotateZ(p.frameCount*Math.PI/90);

      pg.translate(0, 0, p.map(Math.sin(p.frameCount / 60.0 * Math.PI), -1, 1, 0, -500));
      
      // draw toroid
      this.latheAngle = 0;
      for(let i=0; i<=this.segments; i++){
        if (this.isWireFrame){
          pg.stroke(255, 255, 150);
          pg.noFill();
        } 
        else {
          pg.noStroke();
          if(i % 2 == 0) {
            let idx = 2;
            pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
          }
          else {
            pg.fill(200);
          }
        }
        pg.beginShape(p.QUAD_STRIP);
        for(let j=this.pts; j>=0; j--){
          if (i>0){
            pg.vertex(this.vertices2[j].x, this.vertices2[j].y, this.vertices2[j].z);
          }
          this.vertices2[j].x = Math.cos(p.radians(this.latheAngle))*this.vertices[j].x;
          this.vertices2[j].y = Math.sin(p.radians(this.latheAngle))*this.vertices[j].x;
          this.vertices2[j].z = this.vertices[j].z;
          // optional helix offset
          // if (this.isHelix){
          //   this.vertices[j].z+=this.helixOffset;
          // } 
          this.vertices[j].z+=p.map(Math.sin(p.frameCount / 60.0 * Math.PI), -1, 1, 0, this.helixOffset);
          pg.vertex(this.vertices2[j].x, this.vertices2[j].y, this.vertices2[j].z);
        }
        // create extra rotation for helix
        // if (this.isHelix){
        //   this.latheAngle+=720.0/this.segments;
        // } 
        // else {
        //   this.latheAngle+=360.0/this.segments;
        // }
        this.latheAngle+=p.map(Math.sin(p.frameCount / 60.0 * Math.PI), -1, 1, 360, 720)/this.segments;
        pg.endShape();
      }
      pg.popMatrix();

      let idx = 4;
      pg.fill(this.colorScheme.get(idx).r, this.colorScheme.get(idx).g, this.colorScheme.get(idx).b);
      pg.pushMatrix();
      pg.translate(0, 280, 0);
      pg.box(6000, 40, 6000);
      pg.popMatrix();
    }
  },
  draw: {
    value: function (t) {
      let p = this.p;
      this.lightPos.set(100, -300, 200);
      this.lightDirection = this.lightPos;

      // initialize point arrays
      this.vertices = [];
      this.vertices2 = [];
    
      // fill arrays
      for(let i=0; i<=this.pts; i++){
        this.vertices[i] = p.createVector();
        this.vertices2[i] = p.createVector();
        this.vertices[i].x = this.latheRadius + Math.sin(p.radians(this.angle))*this.radius;
        if (this.isHelix){
          this.vertices[i].z = Math.cos(p.radians(this.angle))*this.radius-(this.helixOffset* 
            this.segments)/2;
        } 
        else{
          this.vertices[i].z = Math.cos(p.radians(this.angle))*this.radius;
        }
        this.angle+=360.0/this.pts;
      }
      Object.getPrototypeOf(S021.prototype).draw(this);
    }
  }
});

S021.prototype.constructor = S021;

var s = function (p) {
  let s021 = new S021(p, 800, 800);

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s021.setup();
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    let angle = t * 0.2;
    s021.cameraPosition = p.createVector(300.0 * Math.cos(angle), -200.0, 300.0 * Math.sin(angle));
    s021.cameraTarget = p.createVector(0.0, 0.0, 0.0);
    // s021.cameraPosition = p.createVector(0.0, 0.0, 500.0);
    // s021.cameraTarget = p.createVector(0.0, 0.0, 0.0);

    p.resetShader();
    p.background(0);
    s021.draw(t);
    p.image(s021.pg, 0, 0);
  }

  p.oscEvent = function(m) {
  }
};

var p021 = new p5(s);
