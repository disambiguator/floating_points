var width = window.innerWidth,
    height = window.innerHeight;

// Create a renderer and add it to the DOM.
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
// Create the scene
var scene = new THREE.Scene();
// Create a camera
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.z = 1;

scene.add(camera);

// Create a light, set its position, and add it to the scene.
var light = new THREE.PointLight(0xffffff);
light.position.set(-100, 200, 100);
scene.add(light);

// Add OrbitControls so that we can pan around with the mouse.
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// var geometry = new THREE.BoxGeometry(5, 5, 5);
var geometry = new THREE.PlaneGeometry(1, 1, 1);
var mouse = new THREE.Vector2();

var cubeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: {value: 1.0, type: 'f'},
        resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight), type: 'v2'},
        mouse: {value: mouse, type: 'v2'}
    },
    fragmentShader: document.getElementById('fragment').textContent
});

var mesh = new THREE.Mesh(geometry, cubeMaterial);
scene.add(mesh);

resize();
animate();
window.addEventListener('resize', resize);

function resize() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}


// Renders the scene
function animate() {
    cubeMaterial.uniforms['mouse'].value = mouse;
    cubeMaterial.uniforms['time'].value++;
    renderer.render(scene, camera);
    controls.update();

    requestAnimationFrame(animate);
}

document.onmousemove = function (event) {
    mouse = new THREE.Vector2(event.clientX, event.clientY);
};
