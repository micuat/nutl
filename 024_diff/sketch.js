function S024Tex(p) {
  this.p = p;
  this.width = 800, this.height = 800;
  this.W = 128.0, this.H = 128.0;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.pixels = [];
  this.pixels_dst = [];
  for(let i = 0; i < this.H; i++) {
    this.pixels[i] = [];
    this.pixels_dst[i] = [];
    for(let j = 0; j < this.W; j++) {
      this.pixels[i][j] = this.pixels_dst[i][j] = {
        a: p.random(1.0),
        b: p.random(1.0),
        c: p.random(1.0),
        p: p.random(1.0)
      };
    }
  }
}
S024Tex.prototype.draw = function(t) {
  let p = this.p;
  let pg = this.pg;

  pg.beginDraw();
  pg.background(255, 0, 0);
  pg.noStroke();
  let _K0 = -20.0/6.0; // center weight
  let _K1 = 4.0/6.0; // edge-neighbors
  let _K2 = 1.0/6.0; // vertex-neighbors
  for(let i = 1; i < this.H - 1; i++) {
    for(let j = 1; j < this.W - 1; j++) {
      let cs = 0.256;
      let ws = 0.128;
      let amp = 1.001;
      let sp = 0.2;
      let lps = 0.06;
      let lps2 = -0.08;
      let ps = 0.0;
      let sq2 = Math.sqrt(2.0)/2.0;
      let wds = 2 + 2 * Math.sqrt(2.0);

      let a    = this.pixels[i  ][j  ].a;
      let a_n  = this.pixels[i-1][j  ].a;
      let a_ne = this.pixels[i-1][j+1].a;
      let a_e  = this.pixels[i  ][j+1].a;
      let a_se = this.pixels[i+1][j+1].a;
      let a_s  = this.pixels[i+1][j  ].a;
      let a_sw = this.pixels[i+1][j-1].a;
      let a_w  = this.pixels[i  ][j-1].a;
      let a_nw = this.pixels[i-1][j-1].a;

      let b    = this.pixels[i  ][j  ].b;
      let b_n  = this.pixels[i-1][j  ].b;
      let b_ne = this.pixels[i-1][j+1].b;
      let b_e  = this.pixels[i  ][j+1].b;
      let b_se = this.pixels[i+1][j+1].b;
      let b_s  = this.pixels[i+1][j  ].b;
      let b_sw = this.pixels[i+1][j-1].b;
      let b_w  = this.pixels[i  ][j-1].b;
      let b_nw = this.pixels[i-1][j-1].b;

      let p    = this.pixels[i  ][j  ].p;
      let p_n  = this.pixels[i-1][j  ].p;
      let p_ne = this.pixels[i-1][j+1].p;
      let p_e  = this.pixels[i  ][j+1].p;
      let p_se = this.pixels[i+1][j+1].p;
      let p_s  = this.pixels[i+1][j  ].p;
      let p_sw = this.pixels[i+1][j-1].p;
      let p_w  = this.pixels[i  ][j-1].p;
      let p_nw = this.pixels[i-1][j-1].p;
  
      let laplacian_p = p_n*_K1 + p_ne*_K2 + p_e*_K1 + p_se*_K2 + p_s*_K1 + p_sw*_K2 + p_w*_K1 + p_nw*_K2 + p*_K0;

      let v  = (a_n - a_s - b_e + b_w + sq2 * (a_nw + b_nw) + sq2 * (a_ne - b_ne) + sq2 * (b_sw - a_sw) - sq2 * (b_se + a_se));
      let sv = cs * (v > 0 ? 1 : -1) * Math.pow(Math.abs(v), sp);
  
      let wa = a_w + a_e + sq2 * (a_nw + a_ne + a_se + a_sw) - wds * a;
      let wb = b_s + b_n + sq2 * (b_nw + b_ne + b_se + b_sw) - wds * b;
  
      let pa = a_w + a_e + sq2 * (b_nw - a_nw + a_sw + b_sw + a_ne + b_ne + a_se - b_se);
      let pb = b_s + b_n + sq2 * (a_nw - b_nw + a_sw + b_sw + a_ne + b_ne - a_se + b_se);
  
      p = b_s - b_n - a_e + a_w + sq2 * (a_nw - b_nw) - sq2 * (a_ne + b_ne) + sq2 * (a_sw + b_sw) + sq2 * (b_se - a_se);
  
      let theta = Math.atan2(b, a);
      let mag = Math.sqrt(a*a + b*b);
      let cost = Math.cos(theta);
      let sint = Math.sin(theta);
      let ta = amp * a + ws * wa - lps * cost * laplacian_p + lps2 * a * p;
      let tb = amp * b + ws * wb - lps * sint * laplacian_p + lps2 * b * p;
      a = ta * Math.cos(sv) - tb * Math.sin(sv);
      b = ta * Math.sin(sv) + tb * Math.cos(sv);
  
      this.pixels_dst[i][j].a = this.p.constrain(a, -1.0, 1.0);
      this.pixels_dst[i][j].b = this.p.constrain(b, -1.0, 1.0);
      this.pixels_dst[i][j].p = p;
  
      this.pixels_dst[i][j].c = 1000000 * (pb + pa);
    }
  }

  let tmp = this.pixels;
  this.pixels = this.pixels_dst;
  this.pixels_dst = tmp;

  let w = this.width / this.W;
  let h = this.height / this.H;
  for(let i = 0; i < this.H; i++) {
    for(let j = 0; j < this.W; j++) {
      let pix = this.pixels[i][j];
      pg.fill(pix.a * 128 + 128, pix.b * 128 + 128, pix.c * 128 + 128);
      let x = p.map(j, 0, this.W, 0, this.width);
      let y = p.map(i, 0, this.H, 0, this.height);
      pg.rect(x, y, w, h);
    }
  }
  pg.endDraw();
}

var s = function (p) {
  let s024Tex = new S024Tex(p, 800, 800);
  let colorScheme = new ColorScheme("6564db-f896d8-edf67d-ca7df9-564592");

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    s024Tex.colorScheme = colorScheme;
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if(p.frameCount % 30 == 0) {
      print(p.frameRate())
    }

    p.background(0);
    s024Tex.draw(t);
    p.image(s024Tex.pg, 0, 0, 800, 800);
  }

  p.oscEvent = function(m) {
  }
};

var p024 = new p5(s);
