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

SRenderer.prototype.setup = function () {
  let p = this.p;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.name = p.folderName;
}
