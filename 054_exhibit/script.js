// vignette
// void setup() {
//   size(512, 512);
//   for(int i = 0; i < height; i++) {
//     for(int j = 0; j < width; j++) {
//       float r = mag(j - width/2, i - height / 2) / width;
//       r *= r;
//       set(j, i, color(floor(map(r, 0, 1, 255, 0))));
//     }
//   }
// }

// Camera Properties
let camera_angle = 0;
let camera_range = -10;
let camera_speed = 0.05 * Math.PI / 180;
let camera_target = new THREE.Vector3(0, 0, 0);
let camera_focal = 70;
let camera_near = 0.1;
let camera_far = 50;

let plane_width = 1.8;
let plane_position = { x: 0, y: 0, z: 0 };

// Box properties
let box_rotation_speed = 0.01;
let box_position = { x: -1, y: -1, z: 0 };

// New renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x247ba0, 1);

// Add the renderer to the DOM
document.body.appendChild(renderer.domElement);

// Create the scene
let scene = new THREE.Scene();

// Set some camera defaults
let camera = new THREE.PerspectiveCamera(camera_focal, window.innerWidth / window.innerHeight, camera_near, camera_far);
camera.position.set(0, camera_range, 0);
camera.lookAt(camera_target);

scene.add(new THREE.AmbientLight(0xdddddd));

// Add directional light
let light_spot_positions = [{ x: -2, y: -2, z: 1.5 },{ x: 3, y: 1, z: 1.5 }]
for(let i = 0; i < 2; i++) {
    let spot_light = new THREE.SpotLight(0xDDDDDD, 0.5);
    spot_light.position.set(light_spot_positions[i].x, light_spot_positions[i].y, light_spot_positions[i].z);
    spot_light.target = scene;
    spot_light.castShadow = true;
    spot_light.receiveShadow = true;
    spot_light.shadow.camera.near = 0.5;
    spot_light.shadow.mapSize.width = 1024 * 2; // default is 512
    spot_light.shadow.mapSize.height = 1024 * 2; // default is 512	
    scene.add(spot_light);
}

let textureVig = new THREE.TextureLoader().load( "vig.png" );
let tile_material = new THREE.MeshLambertMaterial({ color: 0xdddddd, map: textureVig });

for(let i = -5; i <= 5; i++) {
    for(let j = -5; j <= 5; j++) {
        {
            let plane_geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
            let plane_mesh = new THREE.Mesh(plane_geometry, tile_material);
            plane_mesh.position.set(j * 2, i * 2, -1);
            plane_mesh.receiveShadow = true;
            scene.add(plane_mesh);
        }
    }
}
for(let i = -2.5; i <= 2.5; i++) {
    for(let j = -2.5; j <= 2.5; j++) {
        if(Math.random() > 0.75) {
            let box_geometry = new THREE.BoxGeometry(0.25, 0.25, 3);
            let box_mesh = new THREE.Mesh(box_geometry, tile_material);
            box_mesh.castShadow = true;
            box_mesh.receiveShadow = true;
            box_mesh.position.set(j * 2, i * 2, 0.5);
            scene.add(box_mesh);
        }
    }
}

let plane_geometry = new THREE.PlaneGeometry(plane_width, plane_width, 1, 1);
let plane_materials = [];

for(let i = 0; i < 4; i++) {
    plane_materials[i] = new THREE.MeshBasicMaterial({ color: 0xffffff });
}

for(let i = -2.5; i <= 2.5; i++) {
    for(let j = -2; j <= 2; j++) {
        if(Math.random() > 0.875) {
            let box_geometry = new THREE.BoxGeometry(2, 0.125, 3);
            let box_mesh = new THREE.Mesh(box_geometry, tile_material);
            box_mesh.castShadow = true;
            box_mesh.receiveShadow = true;
            box_mesh.position.set(j * 2, i * 2, 0.5);
            scene.add(box_mesh);

            {
                let plane_mesh = new THREE.Mesh(plane_geometry, plane_materials[Math.floor(Math.random() * plane_materials.length)]);
                plane_mesh.position.set(j * 2, i * 2 - 0.1, 0.5);
                plane_mesh.rotation.x = Math.PI / 2;
                // plane_mesh.rotation.y = Math.PI / 2;
                plane_mesh.receiveShadow = false;//true;
                scene.add(plane_mesh);
            }
            {
                let plane_mesh = new THREE.Mesh(plane_geometry, plane_materials[Math.floor(Math.random() * plane_materials.length)]);
                plane_mesh.position.set(j * 2, i * 2 + 0.1, 0.5);
                plane_mesh.rotation.x = Math.PI / 2;
                plane_mesh.rotation.y = -Math.PI;
                plane_mesh.receiveShadow = false;//true;
                scene.add(plane_mesh);
            }
        }
    }
}

for(let i = -2; i <= 2; i++) {
    for(let j = -2.5; j <= 2.5; j++) {
        if(Math.random() > 0.875) {
            let box_geometry = new THREE.BoxGeometry(0.125, 2, 3);
            let box_mesh = new THREE.Mesh(box_geometry, tile_material);
            box_mesh.castShadow = true;
            box_mesh.receiveShadow = true;
            box_mesh.position.set(j * 2, i * 2, 0.5);
            scene.add(box_mesh);

            {
                let plane_mesh = new THREE.Mesh(plane_geometry, plane_materials[Math.floor(Math.random() * plane_materials.length)]);
                plane_mesh.position.set(j * 2 - 0.1, i * 2, 0.5);
                plane_mesh.rotation.x = Math.PI / 2;
                plane_mesh.rotation.y = -Math.PI / 2;
                plane_mesh.receiveShadow = false;//true;
                scene.add(plane_mesh);
            }
            {
                let plane_mesh = new THREE.Mesh(plane_geometry, plane_materials[Math.floor(Math.random() * plane_materials.length)]);
                plane_mesh.position.set(j * 2 + 0.1, i * 2, 0.5);
                plane_mesh.rotation.x = Math.PI / 2;
                plane_mesh.rotation.y = Math.PI / 2;
                plane_mesh.receiveShadow = false;//true;
                scene.add(plane_mesh);
            }
        }
    }
}

{
    let box_geometry = new THREE.BoxGeometry(11.5, 11.5, 0.125);
    let box_mesh = new THREE.Mesh(box_geometry, tile_material);
    box_mesh.castShadow = true;
    box_mesh.receiveShadow = true;
    box_mesh.position.set(0, 0, 2);
    scene.add(box_mesh);
}

// Render loop
let textures = [];
let render = function () {
    for(tex of textures)
        tex.needsUpdate = true;

    camera_angle += camera_speed;
    camera.position.x = Math.cos(camera_angle) * camera_range;
    camera.position.y = Math.sin(camera_angle) * camera_range;
    camera.up.set(0, 0, 1);
    camera.lookAt(camera_target);

    requestAnimationFrame(render);

    // Rotate the box
    // box_mesh.rotation.x += box_rotation_speed;
    // box_mesh.rotation.y += box_rotation_speed;

    renderer.render(scene, camera);
};

setTimeout(() => {
    for(let i = 0; i < 4; i++) {
        if (document.getElementById('defaultCanvas' + i) != null) {
            textures[i] = new THREE.Texture(document.getElementById('defaultCanvas' + i));
            if(textures[i].image.width < 256)
                textures[i].minFilter = THREE.NearestFilter;
            plane_materials[i].map = textures[i];
        }
    }

    render();
}, 500)