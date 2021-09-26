var scene, camera, renderer;

var scene = new THREE.Scene();
var url = "https://raw.githubusercontent.com/Blank2275/threejs-scenes/master/scene.gltf"

var loader = new THREE.GLTFLoader();
loader.load(url, (gltf) => {
    console.log(gltf.scene);
    gltf.scene.traverse((object) => {
        object.position.y -= 10;
        object.updateMatrix();
        object.updateMatrixWorld();
        
    })
    scene.add(gltf.scene);
    scene.updateMatrixWorld();
})

var pointLight = new THREE.PointLight("white", 1);
scene.add(pointLight);
var ambientLight = new THREE.AmbientLight("white", 0.6);
scene.add(ambientLight);

var width = window.innerWidth / 1.1;
var height = window.innerHeight / 1.1;
var aspect = width / height;

camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100)

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//make a fps controller
var player = new FPSController({scene: scene, camera: camera, renderer: renderer, maxSteepness : Math.PI / 3, y: 10});

/*
//add cube to scene
var geometry = new THREE.BoxGeometry(25, 2, 25);
var cover = new THREE.MeshPhongMaterial({color:"green"});
var box = new THREE.Mesh(geometry, cover);
box.position.y = -5;
box.layers.enable(20);
scene.add(box);

geometry = new THREE.BoxGeometry(50, 2, 25);
cover = new THREE.MeshPhongMaterial({color:"blue"});
box = new THREE.Mesh(geometry, cover);
box.position.y = -5;
box.position.x = 12.5
box.rotation.z = Math.PI / 4
box.layers.enable(20);
scene.add(box);

geometry = new THREE.BoxGeometry(50, 2, 25);
cover = new THREE.MeshPhongMaterial({color:"blue"});
box = new THREE.Mesh(geometry, cover);
box.position.y = -5;
box.position.x = -12.5
box.rotation.z = -Math.PI / 8
box.layers.enable(20);
scene.add(box);

geometry = new THREE.SphereGeometry(20, 10, 10);
cover = new THREE.MeshPhongMaterial({color:"blue", wireframe: true});
sphere = new THREE.Mesh(geometry, cover);
sphere.position.z = 17.5;
sphere.position.y = -15;
sphere.layers.enable(20);
scene.add(sphere);
*/

animate();

function animate(){
    player.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}