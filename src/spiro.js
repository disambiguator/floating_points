import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

let positions = []
let renderSpeed = 2500
let scene, renderer, camera, controls
const numPoints = 50000
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight
const near = 0.1
const far = 10000
const vertices = new Array(renderSpeed)
let glitchEnabled = false

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

function depthGlitch() {
  if (glitchEnabled) {
    glitchEnabled = false

    vertices.forEach(function(v) {
      v.geometry.vertices[0].setComponent(2, 0)
      v.geometry.vertices[1].setComponent(2, 0)
      v.geometry.verticesNeedUpdate = true
    })

  } else {
    glitchEnabled = true

    vertices.forEach(function(v) {
      v.geometry.vertices[0].setComponent(2, randInt(near, far))
      v.geometry.vertices[1].setComponent(2, randInt(near, far))
      v.geometry.verticesNeedUpdate = true
    })
  }
}

function animate() {
  vertices.forEach(function(v) {
    const points = positions.map(p => getPoint(p.radius, p.arc, p.phi))

    positions.forEach(function(p) {
      p.arc += p.speed
      p.phi += p.phiSpeed
    })

    const points_2 = positions.map(p => getPoint(p.radius, p.arc, p.phi))

    const x1 = sum(points, p => p.x) / points.length
    const y1 = sum(points, p => p.y) / points.length
    const z1 = sum(points, p => p.z) / points.length
    const x2 = sum(points_2, p => p.x) / points.length
    const y2 = sum(points_2, p => p.y) / points.length
    const z2 = sum(points_2, p => p.z) / points.length

    v.geometry.vertices[0].set(x1, y1, z1)
    v.geometry.vertices[1].set(x2, y2, z2)
    v.geometry.verticesNeedUpdate = true
  })


  controls.update()

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function zSlider(element) {
  camera.position.z = element.value
}

function runSpiro(bindingElement) {
  _.times(10, addComplexity)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(windowWidth, windowHeight)
  bindingElement.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(
    45,
    windowWidth/windowHeight,
    1,
    1000
  )
  camera.position.set(0, 0, 1000)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  renderer.render(scene, camera)


  // Add OrbitControls so that we can pan around with the mouse.
  controls = new OrbitControls(camera, renderer.domElement)

  const material = new THREE.LineBasicMaterial({color: 0xffffff})
  for (let i = 0; i < renderSpeed; i++) {
    const geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(0, 0, 1))
    geometry.vertices.push(new THREE.Vector3(0, 0, 1))
    const line = new THREE.Line(geometry, material)
    vertices[i] = line
    scene.add(line)
  }

  animate()
}

(function(window) {
  window.depthGlitch = depthGlitch
  window.zSlider = zSlider
})(window)

export default runSpiro
