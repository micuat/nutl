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
  Dice: function (shape, x0, y0, z0, x1, y1, z1) {
    // +Z "front" face
    shape.normal( 0,  0,  1);
    shape.vertex(x0, y0, z1, 0.25, 0.25);
    shape.vertex(x1, y0, z1, 0.5 , 0.25);
    shape.vertex(x1, y1, z1, 0.5 , 0.5);
    shape.vertex(x0, y1, z1, 0.25, 0.5);

    // -Z "back" face
    shape.normal( 0,  0, -1);
    shape.vertex(x1, y0, z0, 0.5 , 1.0);
    shape.vertex(x0, y0, z0, 0.25, 1.0);
    shape.vertex(x0, y1, z0, 0.25, 0.75);
    shape.vertex(x1, y1, z0, 0.5 , 0.75);

    // +Y "bottom" face
    shape.normal( 0,  1,  0);
    shape.vertex(x0, y1, z1, 0.25, 0.5);
    shape.vertex(x1, y1, z1, 0.5 , 0.5);
    shape.vertex(x1, y1, z0, 0.5 , 0.75);
    shape.vertex(x0, y1, z0, 0.25, 0.75);

    // -Y "top" face
    shape.normal( 0, -1,  0);
    shape.vertex(x0, y0, z0, 0.25, 0.0);
    shape.vertex(x1, y0, z0, 0.5 , 0.0);
    shape.vertex(x1, y0, z1, 0.5 , 0.25);
    shape.vertex(x0, y0, z1, 0.25, 0.25);

    // +X "right" face
    shape.normal( 1,  0,  0);
    shape.vertex(x1, y0, z1, 0.25, 0.5);
    shape.vertex(x1, y0, z0, 0.25, 0.75);
    shape.vertex(x1, y1, z0, 0.5 , 0.75);
    shape.vertex(x1, y1, z1, 0.5 , 0.5);

    // -X "left" face
    shape.normal(-1,  0,  0);
    shape.vertex(x0, y0, z0, 0.25, 0.0);
    shape.vertex(x0, y0, z1, 0.25, 0.25);
    shape.vertex(x0, y1, z1, 0.5 , 0.25);
    shape.vertex(x0, y1, z0, 0.5 , 0.0);
  },
  Hexagon: function (shape, x0, y0, z0, r, h) {
    let n = 6.0;
    for(let i = 0; i < n; i++) {
      shape.normal(0, -1, 0);
      shape.vertex(x0, y0 - h, z0, 0.5, 0.5);
      let c1 = Math.cos(i * 2.0 * Math.PI / n);
      let s1 = Math.sin(i * 2.0 * Math.PI / n);
      let x1 = x0 + r * c1;
      let y1 = y0 - h;
      let z1 = z0 + r * s1;
      shape.vertex(x1, y1, z1, c1 * 0.5 + 0.5, s1 * 0.5 + 0.5);
      let c2 = Math.cos((i+1) * 2.0 * Math.PI / n);
      let s2 = Math.sin((i+1) * 2.0 * Math.PI / n);
      let x2 = x0 + r * c2;
      let y2 = y0 - h;
      let z2 = z0 + r * s2;
      shape.vertex(x2, y2, z2, c2 * 0.5 + 0.5, s2 * 0.5 + 0.5);

      shape.normal(Math.cos((i + 0.5) * 2.0 * Math.PI / n), 0, Math.sin((i + 0.5) * 2.0 * Math.PI / n));
      shape.vertex(x2, y2, z2, 1, 0);
      shape.vertex(x1, y1, z1, 0, 0);
      shape.vertex(x1, y0 + h, z1, 0, 1);

      shape.vertex(x2, y2, z2, 1, 0);
      shape.vertex(x1, y0 + h, z1, 0, 1);
      shape.vertex(x2, y0 + h, z2, 1, 1);

    }
  }
}
