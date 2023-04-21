# Three.js-FPS-Controller
It is a simple first person controller for three.js, it is still under devvelopment. It can climb up slopes and walk around. It does not support going up ledges or stairs, you would have to add an invisible object on top of the stairs at an angle so it would go up it like a slope. Any suggestions on what I should add to it to make it better is valuable. Sprinting will be added next and in the future sound effects.

Here is an example usage

```js
var scene, camera, renderer;

scene = new THREE.Scene();

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
var player = new FPSController(scene, camera, renderer, maxSteepness = Math.PI);

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

geometry = new THREE.SphereGeometry(20, 30, 30);
cover = new THREE.MeshPhongMaterial({color:"blue"});
sphere = new THREE.Mesh(geometry, cover);
sphere.position.z = 17.5;
sphere.position.y = -15;
sphere.layers.enable(20);
scene.add(sphere);

animate();

function animate(){
    player.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```
Example at Blank2275.github.io/Three.js-FPS-Controller
