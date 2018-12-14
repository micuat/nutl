function SRenderer (p, w, h) {
  this.p = p;
  if(w != undefined && h != undefined) {
    this.width = w;
    this.height = h;
  }
  else {
    this.width = 800;
    this.height = 800;
  }
}

SRenderer.prototype.setup = function (that) { // what "that" f***
  if(that == undefined) that = this;
  let p = that.p;
  that.pg = p.createGraphics(that.width, that.height, p.P3D);
  that.name = p.folderName;
}
