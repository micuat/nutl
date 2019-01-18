let light1, light2;
let renderer, scene, camera, cube;
let uniforms = {};
let comp;
let spreadTubes = 0;
let meshes = [];

let poses = [];
let skeletons = [];

// Grab elements, create settings, etc.
let video = document.getElementById('video');

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject=stream;
    video.play();
  });
}

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on('pose', gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("model ready")
}

function setupThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    let sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);

    light1 = new THREE.PointLight(0xffffff, 2, 50);
    // light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 })));
    scene.add(light1);

    light2 = new THREE.PointLight(0x0000ff, 2, 50);
    // light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff })));
    scene.add(light2);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    // scene.add(cube);

    let material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    let n = 40;
    for (let j = 0; j <= 20; j++) {
        let ms = [];
        for (let i = 0; i <= n; i++) {
            let mesh = new THREE.Mesh(sphere, material);
            mesh.position.x = 1000000;//j * 5;
            mesh.position.y = 1000000;//i * 5;
            mesh.position.z = (-j - 0) * 1;
            if(j==0) mesh.position.z=-1000;
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            scene.add(mesh);
            ms.push(mesh);
        }
        meshes.push(ms);
    }
}
setupThree();

let frameCount = 0;
let targetPos = {x: 0, y: 0, z: 10};
function animate() {
    frameCount++;
    if(frameCount % 120 == 0) {
        targetPos.x = (Math.random() - 0.5) * 40;
        targetPos.y = (Math.random() - 0.5) * 40;
        targetPos.z = 15;//(Math.random() - 0.5) * 40;
    }
    camera.position.x = camera.position.x * 0.95 + 0.05 * targetPos.x;
    camera.position.y = camera.position.y * 0.95 + 0.05 * targetPos.y;
    camera.position.z = camera.position.z * 0.95 + 0.05 * targetPos.z;
    camera.lookAt(0, 0, -10);

    let time = Date.now() * 0.0005;
    light1.position.x = Math.sin(time * 0.7) * 10;
    light1.position.y = Math.cos(time * 0.5) * 20;
    light1.position.z = Math.cos(time * 0.3) * 10;

    light2.position.x = Math.sin(time * 0.3) * 10;
    light2.position.y = Math.cos(time * 0.5) * 20;
    light2.position.z = Math.cos(time * 0.7) * 10;

    uniforms.delta.value += 0.1;

    let count = 0;
    for (let i = 0; i < poses.length && i < 1; i++) {
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
            let keypoint = poses[i].pose.keypoints[j];
            if (keypoint.score > 0.2) {
                let m = meshes[0][count];
                m.position.x = m.position.x * 0.1 + 0.9 * (-keypoint.position.x+320)/320.0 * 10.0;
                m.position.y = m.position.y * 0.1 + 0.9 * (-keypoint.position.y+240)/240.0 * 10.0;
                m.updateMatrix();
                count++;
            }
        }
    }

    for(let j = meshes.length - 2; j >=0; j--) {
        for(let i = 0; i < meshes[0].length; i++) {
            let m0 = meshes[j][i];
            let m1 = meshes[j+1][i];
            m1.position.x = m1.position.x * 0.5 + 0.5 * m0.position.x;
            m1.position.y = m1.position.y * 0.5 + 0.5 * m0.position.y;
            m1.updateMatrix();
        }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();