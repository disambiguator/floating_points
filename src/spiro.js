import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

let positions = []
let renderSpeed = 1000
let scene, renderer, camera, controls
const numPoints = 50000
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight
const near = 0.1
const far = 10000
const geometry = new THREE.BufferGeometry()

const uniforms = {
  amplitude: new THREE.Uniform(0.002),
  origin: new THREE.Uniform(new THREE.Vector3(0,0,0)),
  direction: new THREE.Uniform(new THREE.Vector3(0,0,0)),
  color: new THREE.Uniform(0.0)
}

function randInt(min, max) {
  return Math.floor(Math.random() * max) + min
}

function addComplexity() {
  positions.push({
    radius: randInt(50, 300),
    arc: randInt(0, 360),
    phi: randInt(0, 360),
    speed: randInt(1, 10) * 360 / (randInt(10, 100) + numPoints),
    phiSpeed: randInt(1, 10) * 360 / (randInt(10, 100) + numPoints)
  })
}

function getPoint(radius, theta, phi) {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi)
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi)
  const zCoordinate = radius * Math.cos(theta)
  return {x: xCoordinate, y: yCoordinate, z: zCoordinate}
}

function sum(array, f) {
  return array.reduce((accum, p) => accum + f(p), 0)
}

function generateVertices() {
  const vertices = []
  for(let i=0; i<renderSpeed; i++) {
    const points = positions.map(p => getPoint(p.radius, p.arc, p.phi))

    positions.forEach(function(p) {
      p.arc += p.speed
      p.phi += p.phiSpeed
    })

    const x = sum(points, p => p.x) / points.length
    const y = sum(points, p => p.y) / points.length
    const z = sum(points, p => p.z) / points.length

    vertices.push(x, y, z)
  }

  return vertices
}

function animate() {
  geometry.attributes.position = new THREE.Float32BufferAttribute(generateVertices(), 3)
  geometry.attributes.position.needsUpdate = true

  controls.update()

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function amplitudeSlider(element) {
  uniforms.amplitude.value = parseFloat(element.value)
}

function enableColor(element) {
  uniforms.color.value = element.checked ? 1. : 0.
}

function mouseMove(event) {
  const mouse = new THREE.Vector2(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera( mouse, camera )

  uniforms.origin.value = raycaster.ray.origin
  uniforms.direction.value = raycaster.ray.direction
}

function runSpiro(bindingElement) {
  _.times(2, addComplexity)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(windowWidth, windowHeight)
  bindingElement.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(
    45,
    windowWidth/windowHeight,
    near,
    far
  )
  camera.position.set(0, 0, 300)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  renderer.render(scene, camera)


  // Add OrbitControls so that we can pan around with the mouse.
  controls = new OrbitControls(camera, renderer.domElement)

  const material =
    new THREE.ShaderMaterial({
      uniforms:       uniforms,
      vertexShader:   document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent
    })

  const displacement = new Float32Array( renderSpeed )
  for(let i=0; i<renderSpeed; i++) {
    displacement[i] = Math.random() * 5
  }

  geometry.attributes.position = new THREE.Float32BufferAttribute(generateVertices(), 3)
  geometry.addAttribute( 'displacement', new THREE.BufferAttribute(displacement, 1))

  const line = new THREE.Line(geometry, material)
  scene.add(line)

  document.addEventListener( 'mousemove', mouseMove, false )

  animate()
}

(function(window) {
  window.amplitudeSlider = amplitudeSlider
  window.enableColor = enableColor
})(window)

export default runSpiro
