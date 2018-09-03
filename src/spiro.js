import * as THREE from 'three'

function runSpiro(bindingElement) {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  bindingElement.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500)
  camera.position.set(0, 0, 100)
  camera.lookAt(0, 0, 0)

  const scene = new THREE.Scene()

  //create a blue LineBasicMaterial
  const material = new THREE.LineBasicMaterial({color: 0x0000ff})

  const geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(-10, 0, 0))
  geometry.vertices.push(new THREE.Vector3(0, 10, 0))
  geometry.vertices.push(new THREE.Vector3(10, 0, 0))

  const line = new THREE.Line(geometry, material)

  scene.add(line)
  renderer.render(scene, camera)
}

export default runSpiro;
