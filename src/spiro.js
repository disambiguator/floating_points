import * as THREE from 'three'

let positions = []
let renderSpeed = 2500
let scene, renderer, camera
let counter = 0
const numPoints = 50000
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight
const vertices = new Array(renderSpeed)

function randInt (min, max) {
  return Math.floor(Math.random() * max) + min
}

function addComplexity () {
  positions.push({
    radius: randInt(50, 300),
    arc: randInt(0, 360),
    speed: randInt(1, 10) * 360 / (randInt(10, 100) + numPoints)
  })
}

function getPoint (radius, angle) {
  const xCoordinate = windowWidth / 2 + radius * Math.cos(angle)
  const yCoordinate = windowHeight / 2 + radius * Math.sin(angle)
  return {x: xCoordinate, y: yCoordinate}
}

function sum (array, f) {
  return array.reduce((accum, p) => accum + f(p), 0)
}

function animate () {
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map(p => getPoint(p.radius, p.arc))

    positions.forEach(function (p) {
      p.arc += p.speed
    })

    const points_2 = positions.map(p => getPoint(p.radius, p.arc))

    const x1 = sum(points, p => p.x) / points.length
    const y1 = sum(points, p => p.y) / points.length
    const x2 = sum(points_2, p => p.x) / points.length
    const y2 = sum(points_2, p => p.y) / points.length

    vertices[i].geometry.vertices[0].set(x1, y1, 0)
    vertices[i].geometry.vertices[1].set(x2, y2, 0)
    vertices[i].geometry.verticesNeedUpdate = true
  }

  if (counter > 1000) {
    frameRate(0)
  }
  counter++

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function runSpiro (bindingElement) {
  _.times(10, addComplexity)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(windowWidth, windowHeight)
  bindingElement.appendChild(renderer.domElement)

  camera = new THREE.OrthographicCamera(
    0, windowWidth,
    0, windowHeight,
    1,
    1000
  )
  camera.position.set(0, 0, 100)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  renderer.render(scene, camera)

  const material = new THREE.LineBasicMaterial({color: 0xffffff})
  for (let i = 0; i < renderSpeed; i++) {
    const geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    const line = new THREE.Line(geometry, material)
    vertices[i] = line
    scene.add(line)
  }

  animate()
}

export default runSpiro
