function ColorScheme (colorString) {
  this.colors = [];
  {
    let cs = colorString.split("-");
    for(let i in cs) {
      this.colors.push({
        r: parseInt("0x"+cs[i].substring(0,2)),
        g: parseInt("0x"+cs[i].substring(2,4)),
        b: parseInt("0x"+cs[i].substring(4,6))
      });
    }
  }
  this.get = function (i) {
    i = Math.min(this.colors.length - 1, Math.max(0, i));
    return this.colors[i];
  }
}
