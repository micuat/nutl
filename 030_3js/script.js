var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 0, 15 );
camera.lookAt( 0, 0, 0 );

var sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );

var light1 = new THREE.PointLight( 0xff0040, 2, 50 );
light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
scene.add( light1 );

var light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
scene.add( light2 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

function CustomSinCurve( scale ) {

	THREE.Curve.call( this );

	this.scale = ( scale === undefined ) ? 1 : scale;

}

CustomSinCurve.prototype = Object.create( THREE.Curve.prototype );
CustomSinCurve.prototype.constructor = CustomSinCurve;

CustomSinCurve.prototype.getPoint = function ( t ) {

	var tx = t * 3 - 1.5;
	var ty = Math.sin( 2 * Math.PI * t );
	var tz = 0;

	return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

};

var path = new CustomSinCurve( 10 );
var geometry = new THREE.TubeGeometry( path, 20, 0.2, 8, false );

// var geometry = new THREE.BoxGeometry( 2,2,2 );
// var geometry = new THREE.OctahedronGeometry( 1 );
var material = new THREE.MeshPhysicalMaterial( { color: 0x999999 } );
// var material = new THREE.MeshPhongMaterial( { color: 0x999999 } );
var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
for ( var i = -10; i <= 10; i++ ) {
    for ( var j = -10; j <= 10; j++ ) {
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = j * 5;//20 * ( 0.5 - Math.random() );
        mesh.position.y = i * 5;//20 * ( 0.5 - Math.random() );
        mesh.position.z = 0;//10 * ( 0.5 - Math.random() );
        mesh.rotation.y = Math.sin(i * 0.02);//3.14 * ( 0.5 - Math.random() );
        mesh.rotation.x = Math.sin(j * 0.02);//3.14 * ( 0.5 - Math.random() );
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        scene.add( mesh );
    }
}

// camera.position.z = 5;

let s = 0.0;
function animate() {
    var time = Date.now() * 0.0005;
    // var delta = clock.getDelta();
    // if ( object ) object.rotation.y -= 0.5 * delta;
    light1.position.x = Math.sin( time * 0.7 ) * 10;
    light1.position.y = Math.cos( time * 0.5 ) * 20;
    light1.position.z = Math.cos( time * 0.3 ) * 10;

    light2.position.x = Math.sin( time * 0.3 ) * 10;
    light2.position.y = Math.cos( time * 0.5 ) * 20;
    light2.position.z = Math.cos( time * 0.7 ) * 10;

    // cube.scale.x = Math.sin(s) * 2.0;
    // s += 0.1;
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();