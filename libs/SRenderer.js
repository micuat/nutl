function SRenderer (p) {
  this.p = p;
}

SRenderer.prototype.setup = function (that) { // what "that" f***
  if(that == undefined) that = this;
  let p = that.p;
  that.pg = p.createGraphics(800, 800, p.P3D);
  that.name = p.folderName;
}
