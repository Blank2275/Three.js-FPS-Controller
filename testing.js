var scene, camera, renderer;

scene = new THREE.Scene();

var width = window.innerWidth / 1.1;
var height = window.innerHeight / 1.1;
var aspect = width / height;

camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100)

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//make a fps controller
var player = new FPSController(scene, camera, renderer);

//add cube to scene
var geometry = new THREE.BoxGeometry(25, 2, 25);
var cover = new THREE.MeshBasicMaterial({color:"green"});
var box = new THREE.Mesh(geometry, cover);
box.position.y = -5;
box.layers.enable(20);
scene.add(box);

animate();

function animate(){
    player.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}