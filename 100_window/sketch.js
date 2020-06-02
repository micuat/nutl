var colorSchemes = [new ColorScheme("acf39d-e85f5c-9cfffa-a5ffd6-ffffff")];

function setColor(parent, func, index, alpha) {
  if (alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}
// amsterdam_houses_by_scoutingforgeeks-d59iag2.jpg
var s = function (p) {
  let width = 800*2;
  let height = 800*2;
  let image;
  let windowCoords = [];
  let currentCoord = {};

  let HE_Mesh = Packages.wblut.hemesh.HE_Mesh;
  let HEM_Extrude = Packages.wblut.hemesh.HEM_Extrude;
  let HEC_Cube = Packages.wblut.hemesh.HEC_Cube;

  let mesh;
  let modifier;

  p.setup = function () {
    image = p.loadImage(p.folderName + "/amsterdam_houses_by_scoutingforgeeks-d59iag2.jpg");
    p.createCanvas(width, height);
    p.frameRate(60);

    modifier=new HEM_Extrude();
    modifier.setDistance(0);// extrusion distance, set to 0 for inset faces
    modifier.setRelative(false);// treat chamfer as relative to face size or as absolute value
    modifier.setChamfer(10);// chamfer for non-hard edges
    modifier.setHardEdgeChamfer(80);// chamfer for hard edges
    modifier.setThresholdAngle(Math.PI*0.5);// treat edges sharper than this angle as hard edges
    modifier.setFuse(true);// try to fuse planar adjacent planar faces created by the extrude
    modifier.setPeak(true);//if absolute chamfer is too large for face, create a peak on the face
    createMesh();
    mesh.modify(modifier);
  }

  function createMesh() {
    let creator=new HEC_Cube(300, 5, 5, 5);
    mesh=new HE_Mesh(creator);
  }

  p.draw = function () {
    let t = p.millis() * 0.001;

    if (p.frameCount % 30 == 0) {
      // print(p.frameRate())
    }

    p.background(250);
    const w = width / 2;
    const h = height / 2;
    p.translate(width / 2, height / 2);

    // p.stroke(0);
    // createMesh();
    // let d=Math.sin(Math.PI*2*0.01*p.frameCount)*30;
    // if (Math.abs(d)<15) d=0;
    // modifier.setDistance(d);
    // mesh.modify(modifier);

    // p.render.drawFaces(mesh);

    p.noStroke();

    if (p.mouseY > p.height / 2) {
      p.rotateY(p.map(p.mouseX, 0, width, -Math.PI / 4, Math.PI / 4));
    }
    p.beginShape(p.QUADS);
    p.textureMode(p.NORMAL);
    p.texture(image);
    p.vertex(-w, -h, 0, 0, 0);
    p.vertex(w, -h, 0, 1, 0);
    p.vertex(w, h, 0, 1, 1);
    p.vertex(-w, h, 0, 0, 1);
    p.endShape();

    for (let i = 0; i < windowCoords.length; i++) {
      const c = windowCoords[i];
      let tx0 = c.x;
      let ty0 = c.y;
      let tx1 = c.w;
      let ty1 = c.h;
      let z = 40;
      let x0 = p.map(tx0, 0, 1, -w, w);
      let y0 = p.map(ty0, 0, 1, -h, h);
      let x1 = p.map(tx1, 0, 1, -w, w);
      let y1 = p.map(ty1, 0, 1, -h, h);
      p.beginShape(p.QUADS);
      p.textureMode(p.NORMAL);
      p.texture(image);
      p.vertex(x0, y0, z, tx0, ty0);
      p.vertex(x1, y0, z, tx1, ty0);
      p.vertex(x1, y1, z, tx1, ty1);
      p.vertex(x0, y1, z, tx0, ty1);
      p.endShape();
    }
    // p.image(image, 0, 0, width, width/900*675);
  }

  p.mousePressed = function () {
    currentCoord = { x: p.mouseX / width, y: p.mouseY / height };
  }
  p.mouseReleased = function () {
    currentCoord.w = -currentCoord.x*0 + p.mouseX / width;
    currentCoord.h = -currentCoord.y*0 + p.mouseY / height;
    windowCoords.push(currentCoord);
  }
};

var p100 = new p5(s);
