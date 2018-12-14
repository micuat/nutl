function PostProcess (p, w, h) {
  if(w != undefined && h != undefined) {
    this.width = w;
    this.height = h;
  }
  else {
    this.width = 800;
    this.height = 800;
  }

  this.setup = function () {
    this.passPg = p.createGraphics(this.width, this.height, p.P3D);
    this.pg = p.createGraphics(this.width, this.height, p.P3D);
    this.postShaders = {};
    this.singlePassTypes = ["invert", "kaleid", "mpeg", "pixelate", "rgbshift", "slide"];
    this.multiPassTypes = ["bloom"];
    this.shaderTypes = this.singlePassTypes.concat(this.multiPassTypes);
    for (let i in this.shaderTypes) {
      this.postShaders[this.shaderTypes[i]] = p.loadShader(p.sketchPath("shaders/post/" + this.shaderTypes[i] + ".glsl"));
    }
    let self = this;
    this.postProcess = {
      "bloom" : function (lpg, params) {
        self.passPg.beginDraw();
        self.passPg.clear();
        self.passPg.image(lpg, 0, 0);
        self.passPg.endDraw();
        for (let i = 0; i < params.num; i++) {
          self.pg.beginDraw();
          self.pg.clear();
          for (let k in params) {
            self.postShaders["bloom"].set(k, params[k]);
          }
            self.pg.image(self.passPg, 0, 0);
          self.pg.filter(self.postShaders["bloom"]);
          self.pg.endDraw();
          let temppg = self.pg;
          self.pg = self.passPg;
          self.passPg = temppg;
        }
        let temppg = self.pg;
        self.pg = self.passPg;
        self.passPg = temppg;
      }
    }
    for (let i in this.singlePassTypes) {
      let sname = self.singlePassTypes[i];
      this.postProcess[this.singlePassTypes[i]] = function(lpg, params) {
        self.pg.beginDraw();
        self.pg.clear();
        for (let k in params) {
          self.postShaders[sname].set(k, params[k]);
        }
        self.postShaders[sname].set("resolution", self.pg.width * 1.0, self.pg.height * 1.0);
        self.pg.image(lpg, 0, 0);
        self.pg.filter(self.postShaders[sname]);
        self.pg.endDraw();
      }
    }
  }

  this.draw = function (type, pg, params) {
    this.postProcess[type](pg, params);
  }
}
