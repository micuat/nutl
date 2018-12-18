Polygons = {
  Cube: function (shape, x0, y0, z0, x1, y1, z1, tx0, ty0, tx1, ty1) {
    // +Z "front" face
    shape.normal( 0,  0,  1);
    shape.vertex(x0, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z1, tx1, ty0);
    shape.vertex(x1, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z1, tx0, ty1);

    // -Z "back" face
    shape.normal( 0,  0, -1);
    shape.vertex(x1, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z0, tx1, ty0);
    shape.vertex(x0, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z0, tx0, ty1);

    // +Y "bottom" face
    shape.normal( 0,  1,  0);
    shape.vertex(x0, y1, z1, tx0, ty0);
    shape.vertex(x1, y1, z1, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);

    // -Y "top" face
    shape.normal( 0, -1,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y0, z1, tx1, ty1);
    shape.vertex(x0, y0, z1, tx0, ty1);

    // +X "right" face
    shape.normal( 1,  0,  0);
    shape.vertex(x1, y0, z1, tx0, ty0);
    shape.vertex(x1, y0, z0, tx1, ty0);
    shape.vertex(x1, y1, z0, tx1, ty1);
    shape.vertex(x1, y1, z1, tx0, ty1);

    // -X "left" face
    shape.normal(-1,  0,  0);
    shape.vertex(x0, y0, z0, tx0, ty0);
    shape.vertex(x0, y0, z1, tx1, ty0);
    shape.vertex(x0, y1, z1, tx1, ty1);
    shape.vertex(x0, y1, z0, tx0, ty1);
  },
  Hexagon: function (shape, x0, y0, z0, r, h) {
    let n = 6.0;
    for(let i = 0; i < n; i++) {
      shape.normal(0, -1, 0);
      shape.vertex(x0, y0 - h, z0, 0, 0);
      let x1 = x0 + r * Math.cos(i * 2.0 * Math.PI / n);
      let y1 = y0 - h;
      let z1 = z0 + r * Math.sin(i * 2.0 * Math.PI / n);
      shape.vertex(x1, y1, z1, 0, 0);
      let x2 = x0 + r * Math.cos((i+1) * 2.0 * Math.PI / n);
      let y2 = y0 - h;
      let z2 = z0 + r * Math.sin((i+1) * 2.0 * Math.PI / n);
      shape.vertex(x2, y2, z2, 0, 0);

      shape.normal(Math.cos((i + 0.5) * 2.0 * Math.PI / n), 0, Math.sin((i + 0.5) * 2.0 * Math.PI / n));
      shape.vertex(x2, y2, z2, 0, 0);
      shape.vertex(x1, y1, z1, 0, 0);
      shape.vertex(x1, y0 + h, z1, 0, 0);

      shape.vertex(x2, y2, z2, 0, 0);
      shape.vertex(x1, y0 + h, z1, 0, 0);
      shape.vertex(x2, y0 + h, z2, 0, 0);

    }
  }
}
