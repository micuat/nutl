const Hydra = require('hydra-synth')

let hydra, hydra2;

window.onload = function () {
  let canvas;
  function setupHydra() {
    canvas = document.createElement('canvas');
    canvas.setAttribute("id", "hydra-canvas0-tex");
    canvas.style.width = "1024px"
    canvas.style.height = "1024px"
    canvas.width = 1024;
    canvas.height = 1024;
    document.body.appendChild(canvas)
    canvas.style.display = "none";

    hydra = new Hydra({ canvas: canvas, makeGlobal: false })

    canvas = document.createElement('canvas');
    canvas.setAttribute("id", "hydra-canvas1-tex");
    canvas.style.width = "512px";//"1024px"
    canvas.style.height = "512px";//"1024px"
    canvas.width = 512;//1024;
    canvas.height = 512;//1024;
    document.body.appendChild(canvas)
    canvas.style.display = "none";

    // hydra2 = new Hydra({ canvas: canvas, makeGlobal: false })

    // by default, hydra makes everything global.
    // see options to change parameters
    hydra.osc(100, 0.1, 0.1).color(0.1, 0.8, 0.1).add(hydra.osc(100, -0.08, 0.1).color(0.1, 0.1, 0.8)).kaleid(128).out();
    // hydra.osc(10, 0.6, 0.5).color(1, 4, 1).modulate(hydra.noise(20.0, 2.0), 0.1).colorama(0.001).rotate(Math.PI/2).out();
    // hydra2.noise(2,0.5).color(1,0,4).colorama(0.001).scale(0.25).rotate(0, [0, Math.PI*2]).out()
    // hydra2.noise(2,0.5).color(1,0,4).colorama(0.001).scale(0.25).rotate(0, [0, Math.PI*2]).out(hydra2.o[1])
    // hydra2.src(hydra2.o[1],1).add(hydra2.o[0],0.95).scale(1.01).out(hydra2.o[0])
    // hydra2.osc(100, 0.01, 1.4)
    // .color(1.83,0.91,0.99)
    // .rotate(0.1)
    // .pixelate(100,8)
    // .scrollY(0.1,0.2)
    // .modulateRotate(hydra2.osc(2,0.2,0))
    // .out()
  }
  setupHydra();

  let light1, light2;
  let renderer, scene, camera;
  let uniforms = {};
  let comp;
  let spreadTubes = 2;
  let meshes = [];

  function setupFlocking() {
    fluid.registerNamespace("testugen");

    testugen.click = function (inputs, output, options) {
      var that = flock.ugen(inputs, output, options);
      console.log(that.inputs)

      that.gen = function (numSamps) {
        var out = that.output,
          m = that.model,
          i;

        for (i = 0; i < numSamps; i++) {
          out[i] = m.unscaledValue;
        }

        that.mulAdd(numSamps);
        m.value = flock.ugen.lastOutputValue(numSamps, out);
      };

      that.init = function () {
        setInterval(() => {
          that.model.unscaledValue = 1.0;
          setTimeout(() => {
            that.model.unscaledValue = 0.0;
          }, 100);
        }, 1000);
        that.onInputChanged();
      };

      that.onInputChanged = function () {
        flock.onMulAddInputChanged(that);
      };

      that.init();
      return that;
    };
    flock.ugenDefaults("testugen.click", {
      rate: "audio",
      func: undefined
    })

    // Define an Infusion component that represents your instrument.
    fluid.defaults("myStuff.sinewaver",
      {
        gradeNames: ["flock.synth"],

        // Define the synthDef for your instrument.
        synthDef: {
          id: "parent",
          ugen: "flock.ugen.squareOsc",
          freq:
          {
            ugen: "flock.ugen.triggerCallback",
            source: {
              ugen: "flock.ugen.sequencer",
              id: "sqnotes",
              durations: [0.25, 0.25, 0.25, 0.25],
              values: [1, 10 / 8, 3 / 4, 3 / 2],
              mul: 55 / 2,
              loop: 1.0,
              options: {
                holdLastValue: true
              }
            },
            trigger: {
              ugen: "flock.ugen.impulse",
              freq: 60
            },
            options: {
              callback: {
                func: (v) => {
                  if (v / (55 / 2) < 1) {
                    uniforms.uColor.value.x = 219.0 / 255;
                    uniforms.uColor.value.y = 39.0 / 255;
                    uniforms.uColor.value.z = 99.0 / 255;
                  }
                  else {
                    uniforms.uColor.value.x = 18.0 / 255;
                    uniforms.uColor.value.y = 234.0 / 255;
                    uniforms.uColor.value.z = 234.0 / 255;
                  }
                  //spreadTubes = v * 0.05 * 0.05 + 0.95 * spreadTubes;
                },
                args: []
              }
            }
          },
          mul: {
            ugen: "flock.ugen.triggerCallback",
            source: {
              ugen: "flock.ugen.envGen",
              envelope: {
                levels: [0, 1, 0],
                times: [0.03, 0.1]
              },
              gate: {
                ugen: "flock.ugen.sequencer",
                durations: [0.25, 0.25, 0.2, 0.2],//, 0.3, 0.25, 0.25],
                values: [1, 1, 1, 1],//, 1, 1, 1],
                loop: 1.0,
                options: {
                  resetOnNext: true
                }
              },
              mul: 0
            },
            trigger: {
              ugen: "flock.ugen.impulse",
              freq: 60
            },
            options: {
              callback: {
                func: (v) => {
                  uniforms.delta.value += 1 * v + 0.1;
                },
                args: []
              }
            }
          }
        }
      }
    );

    fluid.defaults("myStuff.composition", {
      gradeNames: ["fluid.component"],
      components: {
        environment: {
          type: "flock.enviro"
        },

        instrument: {
          type: "myStuff.sinewaver"
        }
      },
      listeners: {
        "onCreate.startEnvironment": {
          func: "{environment}.start"
        }
      }
    });
    comp = myStuff.composition();
  }

  function setupThreejs() {
    scene = new THREE.Scene();

    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    let sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);

    light1 = new THREE.PointLight(0xffffff, 2, 50);
    scene.add(light1);

    light2 = new THREE.PointLight(0xffffff, 2, 50);
    light2.position.set(0, 5, 15);
    scene.add(light2);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1024, 1024);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // reuse the fragment shader stuff from the lambert material
    let basicShader = THREE.ShaderLib['standard'];
    uniforms = basicShader.uniforms;
    uniforms.uColor = { value: new THREE.Vector3() };
    uniforms.delta = { type: 'f', value: 0.0 };
    uniforms.scale = { type: 'f', value: 0.5 };
    uniforms.time = { type: 'f', value: 0.0 };
    uniforms.metalness.value = 1.0;

    var defines = {};
    defines["USE_MAP"] = "";
    defines["USE_DISPLACEMENTMAP"] = "";
    let sinusMaterial = new THREE.ShaderMaterial({
      defines: defines,
      uniforms: uniforms,
      vertexShader: basicShader.vertexShader,
      // vertexShader: document.
      //   getElementById('sinusVertexShader').text,
      fragmentShader: basicShader.fragmentShader,
      // fragmentShader: document.
      //   getElementById('sinusFragmentShader').text,
      lights: true,
      vertexColors: THREE.VertexColors,
      fog: true
    });

    class CustomSinCurve extends THREE.Curve {
      constructor(scale = 1) {
        super();
        this.scale = scale;
      }
      getPoint(t) {
        let tx = Math.sin(2 * Math.PI * t);
        let ty = Math.sin(4 * Math.PI * t);
        let tz = Math.cos(6 * Math.PI * t);

        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
      }
    }

    let path = new CustomSinCurve(4);
    let geometry = new THREE.TubeGeometry(path, 1024*4, 0.02, 32, false);

    // create a cube and add to scene
    // cube = new THREE.Mesh(geometry, sinusMaterial);
    // scene.add(cube);
    // meshes.push(cube);

    for(let i = 0; i < 10; i++) {
      let geometry = new THREE.CylinderGeometry( 0.1, 0.1, 15, 32, 128);
      cube = new THREE.Mesh(geometry, sinusMaterial);
      cube.rotation.x = Math.random() * Math.PI;
      cube.rotation.y = Math.random() * Math.PI;
      cube.rotation.z = Math.random() * Math.PI;
      scene.add(cube);
      meshes.push(cube);
    }

    geometry = new THREE.SphereGeometry(2, 250, 250);
    cube = new THREE.Mesh(geometry, sinusMaterial);
    scene.add(cube);
    meshes.push(cube);

    // let material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    // let n = 2;
    // for (let i = -n; i <= n; i++) {
    //   for (let j = -n; j <= n; j++) {
    //     let mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.x = j * 5;
    //     mesh.position.y = i * 5;
    //     mesh.position.z = 0;
    //     mesh.rotation.y = Math.sin(i * 0.02);
    //     mesh.rotation.x = Math.sin(j * 0.02);
    //     mesh.matrixAutoUpdate = false;
    //     mesh.updateMatrix();
    //     //scene.add(mesh);
    //     meshes.push({ mesh: mesh, i: i, j: j });
    //   }
    // }
  }
  setupThreejs();
  setupFlocking();
  rtTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });

  let hydraTexture, hydraTexture2;
  function animate() {
    uniforms['time'].value += 0.01;

    if (scene.background == null) {
      hydraTexture = new THREE.Texture(document.getElementById("hydra-canvas0-tex"));
      // hydraTexture2 = new THREE.Texture(document.getElementById("hydra-canvas1-tex"));
      if (document.getElementById("hydra-canvas0-tex") != null) {
        scene.background = hydraTexture;
        uniforms['map'].value = hydraTexture;
        uniforms['displacementMap'].value = hydraTexture;
        uniforms['displacementScale'].value = 1.0;
        uniforms['displacementBias'].value = 0.0;
        // uniforms['displacementScale'].value = -5.0;
        // uniforms['displacementBias'].value = 5.0;
      }
    }
    let time = Date.now() * 0.0005;
    light1.position.x = Math.sin(time * 0.7) * 10;
    light1.position.y = Math.cos(time * 0.5) * 20;
    light1.position.z = Math.cos(time * 0.3) * 10;

    // for (let m of meshes) {
    //   m.rotation.y += 0.01;
    //   m.updateMatrix();
    // }
    camera.position.set(15 * Math.cos(time), 0, 15 * Math.sin(time));
    camera.lookAt(0, 0, 0);

    // light2.position.x = Math.sin(time * 0.3) * 10;
    // light2.position.y = Math.cos(time * 0.5) * 20;
    // light2.position.z = Math.cos(time * 0.7) * 10;

    // for (let m of meshes) {
    //   m.mesh.position.x = m.j * 5 * spreadTubes;
    //   m.mesh.position.y = m.i * 5 * spreadTubes;
    //   m.mesh.updateMatrix();
    // }
    requestAnimationFrame(animate);
    hydraTexture.needsUpdate = true;
    // hydraTexture2.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();
}
