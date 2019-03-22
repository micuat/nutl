const MOVE_UP = 1;
const MOVE_DOWN = 0;

// Scene properties
let scene_color = 0x000000;
let scene_color_alpha = 1;

// Camera Properties
let camera_angle = 0;
let camera_range = -4;
let camera_speed = 0.05 * Math.PI / 180;
let camera_target = new THREE.Vector3(0, 0, -5);
let camera_focal = 70;
let camera_near = 0.1;
let camera_far = 50;

// Lights
let light_am_color = 0xAAAAAA;
let light_spot_color = 0xDDDDDD;
let light_spot_intensity = 0.7;
let light_spot_position = { x: -2, y: -2, z: 5, }
let light_spot_position1 = { x: 6, y: 7, z: 5, }
let light_spot_camera_near = 0.5;
let light_spot_shadow_darkness = 0.35;

// Sphere properties
let sphere_upper = 0;
let sphere_lower = -4.0;
let sphere_direction = MOVE_DOWN;
let sphere_move = 0.02;
let sphere_rotation_speed = 0.05;
let sphere_size = 1;
let sphere_width_seg = 12;
let sphere_height_seg = 8;
let sphere_color = 0xff0000;
let sphere_position = { x: 1, y: 1, z: 0 };

// Plane Properties
let plane_width = 10;
let plane_height = 10;
let plane_width_segs = 1;
let plane_height_segs = 1;
let plane_color = 0xDDDDDD;
let plane_position = { x: 0, y: 0, z: -5 };

// Box properties
let box_width = 0.5;
let box_height = 0.5;
let box_depth = 1;
let box_rotation_speed = 0.01;
let box_color = 0xffffff;
let box_position = { x: -1, y: -1, z: -4 };


// New renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(scene_color, scene_color_alpha);

// Add the renderer to the DOM
document.body.appendChild(renderer.domElement);

// Create the scene
let scene = new THREE.Scene();

// Set some camera defaults

let camera = new THREE.PerspectiveCamera(camera_focal, window.innerWidth / window.innerHeight, camera_near, camera_far);
camera.position.set(0, camera_range, 0);
camera.lookAt(camera_target);

// Add abbient light
let am_light = new THREE.AmbientLight(light_am_color); // soft white light
scene.add(am_light);

// Add directional light
let spot_light = new THREE.SpotLight(light_spot_color, light_spot_intensity);
spot_light.position.set(light_spot_position.x, light_spot_position.y, light_spot_position.z);
spot_light.target = scene;
spot_light.castShadow = true;
spot_light.receiveShadow = true;
spot_light.shadowDarkness = light_spot_shadow_darkness;
spot_light.shadow.camera.near = light_spot_camera_near;
spot_light.shadow.mapSize.width = 1024 * 2; // default is 512
spot_light.shadow.mapSize.height = 1024 * 2; // default is 512	
scene.add(spot_light);

// Add directional light
let spot_light1 = new THREE.SpotLight(light_spot_color, light_spot_intensity);
spot_light1.position.set(light_spot_position1.x, light_spot_position1.y, light_spot_position1.z);
spot_light1.target = scene;
spot_light1.castShadow = true;
spot_light1.receiveShadow = true;
spot_light1.shadowDarkness = light_spot_shadow_darkness;
spot_light1.shadow.camera.near = light_spot_camera_near;
spot_light1.shadow.mapSize.width = 1024 * 2; // default is 512
spot_light1.shadow.mapSize.height = 1024 * 2; // default is 512	
scene.add(spot_light1);

// Add the ground plane
let plane_geometry = new THREE.PlaneGeometry(plane_width, plane_height, plane_width_segs, plane_height_segs);
let plane_material = new THREE.MeshLambertMaterial({ color: plane_color });
let plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
plane_mesh.position.set(plane_position.x, plane_position.y, plane_position.z);
plane_mesh.receiveShadow = true;
scene.add(plane_mesh);

// Add the ground plane
let plane_geometry1 = new THREE.PlaneGeometry(plane_width, plane_height, plane_width_segs, plane_height_segs);
let plane_material1 = new THREE.MeshLambertMaterial({ color: plane_color });
let plane_mesh1 = new THREE.Mesh(plane_geometry1, plane_material1);
plane_mesh1.position.set(plane_position.x+plane_width, plane_position.y, plane_position.z);
plane_mesh1.receiveShadow = true;
scene.add(plane_mesh1);

// Add the box
// let texture = new THREE.Texture(document.getElementById('defaultCanvas0'));

// let box_material = new THREE.MeshLambertMaterial({ color: box_color, map: texture });
let box_material = new THREE.MeshLambertMaterial({ color: box_color });
let box_geometry = new THREE.BoxGeometry(box_width, box_height, box_depth);
let box_mesh = new THREE.Mesh(box_geometry, box_material);
box_mesh.castShadow = true;
box_mesh.receiveShadow = true;
box_mesh.position.set(box_position.x, box_position.y, box_position.z);
scene.add(box_mesh);


// Add the sphere
let sphere_geometry = new THREE.SphereGeometry(sphere_size, sphere_width_seg, sphere_height_seg);
let sphere_material = new THREE.MeshPhongMaterial({ color: sphere_color });
let sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
sphere_mesh.castShadow = true;
sphere_mesh.receiveShadow = true;
sphere_mesh.position.set(sphere_position.x, sphere_position.y, sphere_position.z);
scene.add(sphere_mesh);

// Render loop
let texture, texture1;
let render = function () {
    texture.needsUpdate = true;
    texture1.needsUpdate = true;

    camera_angle += camera_speed;
    camera.position.x = Math.cos(camera_angle) * camera_range;
    camera.position.y = Math.sin(camera_angle) * camera_range;
    camera.up.set(0, 0, 1);
    camera.lookAt(box_mesh.position);

    requestAnimationFrame(render);

    // Bounce the sphere
    if (sphere_direction == 1) {
        if (sphere_mesh.position.z >= sphere_upper) {
            sphere_direction = MOVE_DOWN;
            sphere_mesh.position.z -= sphere_move;
        }
        else {
            sphere_mesh.position.z += sphere_move;
        }
    }
    else {
        if (sphere_mesh.position.z <= sphere_lower) {
            sphere_direction = MOVE_UP;
            sphere_mesh.position.z += sphere_move;
        }
        else {
            sphere_mesh.position.z -= sphere_move;
        }
    }

    // Rotate the sphere
    sphere_mesh.rotation.z += sphere_rotation_speed;

    // Rotate the box
    box_mesh.rotation.x += box_rotation_speed;
    box_mesh.rotation.y += box_rotation_speed;

    renderer.render(scene, camera);
};

setTimeout(() => {
    if (document.getElementById('defaultCanvas0') != null) {
        texture = new THREE.Texture(document.getElementById('defaultCanvas0'));
        plane_material.map = texture;
    }
    if (document.getElementById('defaultCanvas1') != null) {
        texture1 = new THREE.Texture(document.getElementById('defaultCanvas1'));
        plane_material1.map = texture1;
    }

    render();
}, 500)