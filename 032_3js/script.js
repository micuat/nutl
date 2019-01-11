let light1, light2;
let renderer, scene, camera, cube;
let uniforms = {};

function setup() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 0, 15 );
    camera.lookAt( 0, 0, 0 );

    let sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );

    light1 = new THREE.PointLight( 0xff0040, 2, 50 );
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    scene.add( light1 );

    light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
    light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    scene.add( light2 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild( renderer.domElement );

    // reuse the fragment shader stuff from the lambert material
    let basicShader = THREE.ShaderLib['standard'];
    uniforms = basicShader.uniforms;
    uniforms.delta = {type: 'f', value: 0.0};
    uniforms.scale = {type: 'f', value: 0.5};

    let sinusMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.
                getElementById('sinusVertexShader').text,
        fragmentShader: basicShader.fragmentShader,
        lights: true,
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
        getPoint ( t ) {
            let tx = t * 3 - 1.5;
            let ty = Math.sin( 2 * Math.PI * t );
            let tz = Math.cos( 2 * Math.PI * t );

            return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );
        }
    }

    let path = new CustomSinCurve(10);
    let geometry = new THREE.TubeGeometry( path, 200, 0.2, 8, false );

    let material = new THREE.MeshStandardMaterial( { color: 0x999999 } );
    let n = 2;
    for ( let i = -n; i <= n; i++ ) {
        for ( let j = -n; j <= n; j++ ) {
            let mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = j * 5;
            mesh.position.y = i * 5;
            mesh.position.z = 0;
            mesh.rotation.y = Math.sin(i * 0.02);
            mesh.rotation.x = Math.sin(j * 0.02);
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            scene.add( mesh );
        }
    }
}
setup();

function animate() {
    let time = Date.now() * 0.0005;
    light1.position.x = Math.sin( time * 0.7 ) * 10;
    light1.position.y = Math.cos( time * 0.5 ) * 20;
    light1.position.z = Math.cos( time * 0.3 ) * 10;

    light2.position.x = Math.sin( time * 0.3 ) * 10;
    light2.position.y = Math.cos( time * 0.5 ) * 20;
    light2.position.z = Math.cos( time * 0.7 ) * 10;

    uniforms.delta.value += 0.1;

    requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();