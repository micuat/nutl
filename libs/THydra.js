function ShaderHelper (p) {
  this.p = p;
}

ShaderHelper.prototype.load = function (path, fragString) {
  let fragSourceRaw = this.p.loadStrings(path);
  let fragSource = [];

  for (let i in fragSourceRaw) {
    if (fragSourceRaw[i].match(/^#pragma include "(.*)"$/)) {
      let name = fragSourceRaw[i].replace(/^#pragma include "(.*)"$/, '$1');
      let includeSource = this.p.loadStrings("shaders/hydra/" + name);
      for (let j in includeSource) {
        fragSource.push(includeSource[j]);
      }
    }
    else if (fragSourceRaw[i].match(/^#pragma insert fragColor$/)) {
      fragSource.push(fragString);
    }
    else {
      fragSource.push(fragSourceRaw[i]);
    }
  }
  let vertSource = this.p.loadStrings("libs/textureVert.glsl");
  return new Packages.processing.opengl.PShader(this.p.that, vertSource, fragSource);
}

////////

function Hydra() {
  this.queue = [];
  this.layerQueue = [];
}
Hydra.prototype.parse = function(default_args, input_args) {
  let post = "";
  for(let i = 0; i < default_args.length; i++) {
    if(input_args[i] == undefined) {
      post = post + ", " + default_args[i];
    }
    else if (input_args[i] instanceof Hydra) {
      post = post + ", " + input_args[i].generate();
    }
    else {
      post = post + ", " + input_args[i];
    }
  }
  return post;
}
Hydra.prototype.osc = function () {
  let post = this.parse([10.0, 0.1, 0.1], arguments);
  this.queue.push({pre: "osc(", post: post + ")"});
  return this;
}
Hydra.prototype.noise = function () {
  let post = this.parse([10.0, 0.1], arguments);
  this.queue.push({pre: "noise(", post: post + ")"});
  return this;
}
Hydra.prototype.voronoi = function () {
  let post = this.parse([10.0, 0.25, 0.01], arguments);
  this.queue.push({pre: "voronoi(", post: post + ")"});
  return this;
}
Hydra.prototype.rotate = function () {
  let post = this.parse([0.3], arguments);
  this.queue.push({pre: "rotate(", post: post + ")"});
  return this;
}
Hydra.prototype.modulate = function () {
  let post = this.parse([null, 0.5], arguments);
  this.queue.push({pre: "modulate(", post: post + ")"});
  return this;
}
Hydra.prototype.add = function () {
  let post = this.parse([null], arguments);
  this.layerQueue.push({pre: "add(", post: post + ")"});
  return this;
}
Hydra.prototype.color = function () {
  let post = this.parse([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], arguments);
  this.layerQueue.push({pre: "color(", post: post + ")"});
  return this;
}
Hydra.prototype.generate = function () {
  let str = "fragCoord.st";
  for(let i = this.queue.length - 1; i >= 0; i--) {
    let q = this.queue[i];
    str = q.pre + str + q.post;
  }
  this.queue = [];

  for(let i = 0; i < this.layerQueue.length; i++) {
    let q = this.layerQueue[i];
    str = q.pre + str + q.post;
  }
  this.layerQueue = [];
  return str;
}

////////

function THydra (p, w, h, hydra) {
  TLayer.call(this, p, w, h);

  this.shaderHelper = new ShaderHelper(p);
  let str = "gl_FragColor = ";
  str += hydra.generate() + ";";
  // print(str)
  this.shader = this.shaderHelper.load("shaders/hydra/frag.glsl", str);

}

THydra.prototype = Object.create(TLayer.prototype);

THydra.prototype.drawLayer = function (pg, key, args) {
  let p = this.p;

  this.shader.set("time", args.t);
  pg.filter(this.shader);
}

THydra.prototype.constructor = THydra;
