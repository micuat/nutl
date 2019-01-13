let light1, light2;
let renderer, scene, camera, cube;
let uniforms = {};
let comp;
let spreadTubes = 0;
let meshes = [];

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
        setInterval(()=>{
            that.model.unscaledValue = 1.0;
            setTimeout(()=>{
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
function setupFlocking() {
    // Define an Infusion component that represents your instrument.
    fluid.defaults("myStuff.sinewaver",
        {
            gradeNames: ["flock.synth"],

            // Define the synthDef for your instrument.
            synthDef: {
                // id: "parent",
                // ugen: "flock.ugen.squareOsc",
                // freq: 110,
                // mul: {
                //     ugen: "flock.ugen.envGen",
                //     envelope: {
                //         levels: [0, 1, 0],
                //         times: [0.03, 0.1]
                //     },
                //     gate: {
                //         ugen: "testugen.click",
                //         func: {val: "hey"},
                //         hey: 100
                //     }
                // }
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
                        mul: 55/2,//{ugen: "flock.ugen.sin",rate:"control",freq:0.1,add:55,mul:55},
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
                                if(v/(55/2) < 1) {
                                    uniforms.uColor.value.x = 219.0/255;
                                    uniforms.uColor.value.y = 39.0/255;
                                    uniforms.uColor.value.z = 99.0/255;
                                }
                                else {
                                    uniforms.uColor.value.x = 18.0/255;
                                    uniforms.uColor.value.y = 234.0/255;
                                    uniforms.uColor.value.z = 234.0/255;
                                }
                                spreadTubes = v*0.05*0.05 + 0.95*spreadTubes;
                                // camera.position.z = camera.position.z * 0.9 + 0.1 * v * 0.5;
                                // uniforms.delta.value = uniforms.delta.value * 0.98 + 0.02*v;
                            },
                            args: []
                            // "this": "console",
                            // method: "log",
                            // args: ["Sinewave value is"]
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
                        }
                    },
                    trigger: {
                        ugen: "flock.ugen.impulse",
                        freq: 60
                    },
                    options: {
                        callback: {
                            func: (v) => {
                                uniforms.delta.value += 1 * v + 0.1;
                                // uniforms.delta.value = uniforms.delta.value * 0.9 + 0.1*v;
                            },
                            args: []
                            // "this": "console",
                            // method: "log",
                            // args: ["Sinewave value is"]
                        }
                    }
                }
            }
        }
    );


    // Define an Infusion component that represents your composition.
    fluid.defaults("myStuff.composition", {
        gradeNames: ["fluid.component"],

        // This composition has two components:
        //  1. our sinewaver instrument (defined above)
        //  2. an instance of the Flocking environment
        components: {
            environment: {
                type: "flock.enviro"
            },

            instrument: {
                type: "myStuff.sinewaver"
            }
        },

        // This section registers listeners for our composition's "onCreate" event,
        // which is one of the built-in lifecycle events for Infusion.
        // When onCreate fires, we start the Flocking environment.
        listeners: {
            "onCreate.startEnvironment": {
                func: "{environment}.start"
            }
        }
    });
    comp = myStuff.composition();
}

function setup() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    let sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);

    light1 = new THREE.PointLight(0xffffff, 2, 50);
    // light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 })));
    scene.add(light1);

    light2 = new THREE.PointLight(0xffffff, 2, 50);
    // light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff })));
    scene.add(light2);

    renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1024, 1024);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // reuse the fragment shader stuff from the lambert material
    let basicShader = THREE.ShaderLib['standard'];
    uniforms = basicShader.uniforms;
    uniforms.uColor = { value: new THREE.Vector3() };
    uniforms.delta = { type: 'f', value: 0.0 };
    uniforms.scale = { type: 'f', value: 0.5 };

    let sinusMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.
            getElementById('sinusVertexShader').text,
        fragmentShader: basicShader.fragmentShader,
        lights: true,
        vertexColors: THREE.VertexColors,
        fog: true
    });

    // create a cube and add to scene
    cube = new THREE.Mesh(new THREE.SphereGeometry(7, 150, 150), sinusMaterial);
    // cube.name = 'cube';
    scene.add(cube);

    class CustomSinCurve extends THREE.Curve {
        constructor(scale = 1) {
            super();
            this.scale = scale;
        }
        getPoint(t) {
            let tx = t * 3 - 1.5;
            let ty = Math.sin(2 * Math.PI * t);
            let tz = Math.cos(2 * Math.PI * t);

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    }

    let path = new CustomSinCurve(10);
    let geometry = new THREE.TubeGeometry(path, 200, 0.2, 8, false);

    let material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    let n = 2;
    for (let i = -n; i <= n; i++) {
        for (let j = -n; j <= n; j++) {
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = j * 5;
            mesh.position.y = i * 5;
            mesh.position.z = 0;
            mesh.rotation.y = Math.sin(i * 0.02);
            mesh.rotation.x = Math.sin(j * 0.02);
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            scene.add(mesh);
            meshes.push({mesh: mesh, i: i, j: j});
        }
    }
}
setup();
setupFlocking();
let hydraTexture;
function animate() {
    if(scene.background == null) {
        hydraTexture = new THREE.Texture(document.getElementById("hydra-canvas0-tex"));
        if(document.getElementById("hydra-canvas0-tex") != null) {
            console.log(hydraTexture)
            scene.background = hydraTexture;
        }
    }
    let time = Date.now() * 0.0005;
    light1.position.x = Math.sin(time * 0.7) * 10;
    light1.position.y = Math.cos(time * 0.5) * 20;
    light1.position.z = Math.cos(time * 0.3) * 10;

    light2.position.x = Math.sin(time * 0.3) * 10;
    light2.position.y = Math.cos(time * 0.5) * 20;
    light2.position.z = Math.cos(time * 0.7) * 10;


    // uniforms.delta.value += 0.1;
    if(Math.random() > 0.95) {
        // console.log("do it")
        if(Math.random() > 0.5) {
            // comp.instrument.set("sqnotes.mul", 55);
            // comp.instrument.set("sqnotes.values", [1, 10 / 8, 4 / 3, 3 / 2]);
        }
        else {
            // comp.instrument.set("sqnotes.mul", 55/2);
            // comp.instrument.set("sqnotes.values", [1, 10 / 8, 3 / 4, 3 / 2]);
        }
    }

    for(let m of meshes) {
        m.mesh.position.x = m.j * 5 * spreadTubes;
        m.mesh.position.y = m.i * 5 * spreadTubes;
        m.mesh.updateMatrix();
    }
    requestAnimationFrame(animate);
    hydraTexture.needsUpdate = true;
    renderer.render(scene, camera);
}
animate();