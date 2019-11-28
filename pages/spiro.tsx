import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import _ from 'lodash'
import Scene from '../components/scene'

const numPoints = 50000
const near = 0.1
const far = 10000
const geometry = new THREE.BufferGeometry()
const renderSpeed = 1000
let positions = []

const vertexShader = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    uniform float color;
    attribute float displacement;

    varying vec3 vPosition;
    varying float vColor;

    float computeDistance(vec3 mouseOrigin, vec3 mouseDirection, vec3 vertexPosition) {
      vec3 d = normalize(mouseDirection);
      vec3 v = vertexPosition - mouseOrigin;
      float t = dot(v, d);
      vec3 P = mouseOrigin + t * d;
      return distance(P, vertexPosition);
    }

    void main() {

    vPosition = position;
    vColor = color;

    vec3 newPosition = position + amplitude * displacement * pow(computeDistance(origin, direction, position),2.) * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    }
`

const fragmentShader = `
    #ifdef GL_ES
    precision highp float;
    #endif

    // same name and type as VS
    varying vec3 vPosition;
    varying float vColor;

    void main() {

    vec3 color = vColor * normalize(vPosition) + (1. - vColor) * vec3(1.0);

    // feed into our frag colour
    gl_FragColor = vec4(color, 1.0);

    }
`

const uniforms = {
  amplitude: new THREE.Uniform(0.0005),
  origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  color: new THREE.Uniform(0.0),
}

function randInt(min, max) {
  return Math.floor(Math.random() * max) + min
}

export interface Seed {
  radius: number;
  arc: number;
  phi: number;
  speed: number;
  phiSpeed: number
}

const randPosition = (): Seed => ({
  radius: randInt(50, 300),
  arc: randInt(0, 360),
  phi: randInt(0, 360),
  speed: (randInt(1, 10) * 360) / (randInt(10, 100) + numPoints),
  phiSpeed: 0,
})

function getPoint(radius, theta, phi) {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi)
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi)
  const zCoordinate = radius * Math.cos(theta)
  return { x: xCoordinate, y: yCoordinate, z: zCoordinate }
}

function sum(array, f) {
  return array.reduce((accum, p) => accum + f(p), 0)
}

function generateVertices() {
  const vertices = []
  for (let i = 0; i < renderSpeed; i++) {
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

function amplitudeSlider(event) {
  uniforms.amplitude.value = parseFloat(event.target.value)
}

function enableColor(event) {
  uniforms.color.value = event.target.checked ? 1.0 : 0.0
}

const addToPresets = () =>
  window.fetch('/api/addPreset', {
    method: 'POST',
    body: JSON.stringify({ seeds: seeds }),
  })

const initPositions = () => {
  seeds = [randPosition(), randPosition()]
  setPositions([...seeds])
}

const setPositions = p => {
  positions = p
  geometry.attributes.position = new THREE.Float32BufferAttribute(
    generateVertices(),
    3,
  )
  geometry.attributes.position.needsUpdate = true
}

let seeds = []
let presets = []

const initFromPreset = async () => {
  const randomPreset = _.sample(presets)

  const response = await window.fetch(
    `/api/getPreset?ids=${JSON.stringify(randomPreset.positions)}`,
  )
  const jsonResponse = await response.json()
  setPositions(await jsonResponse)
}

const getInitialPresets = async () => {
  const response = await window.fetch('/api/getPresets')
  const json = await response.json()
  presets = json.presets
}

const getCamera = props => {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    45,
    props.width / props.height,
    near,
    far,
  )

  perspectiveCamera.position.set(0, 0, 300)
  perspectiveCamera.lookAt(0, 0, 0)

  return perspectiveCamera
}

const renderer = props => {
  const webGLRenderer = new THREE.WebGLRenderer({ antialias: true })
  webGLRenderer.setSize(props.width, props.height)

  return webGLRenderer
}

const updateRayCaster = (x, y, camera) => {
  const mouse = new THREE.Vector2(x, y)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  uniforms.origin.value = raycaster.ray.origin
  uniforms.direction.value = raycaster.ray.direction
}

const Spiro = props => {
  initPositions()
  getInitialPresets()

  const camera = getCamera(props)

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  })

  const displacement = new Float32Array(renderSpeed)
  for (let i = 0; i < renderSpeed; i++) {
    displacement[i] = Math.random() * 5
  }

  geometry.addAttribute(
    'displacement',
    new THREE.BufferAttribute(displacement, 1),
  )

  const line = new THREE.Line(geometry, material)

  updateRayCaster(0, 0, camera)

  const renderScene = () => {
    geometry.attributes.position = new THREE.Float32BufferAttribute(
      generateVertices(),
      3,
    )
    geometry.attributes.position.needsUpdate = true
  }

  const mouseMove = event => {
    updateRayCaster(
      (event.clientX / props.width) * 2 - 1,
      -(event.clientY / props.height) * 2 + 1,
      camera,
    )
  }

  return (
    <div onMouseMove={mouseMove}>
      <label>Amplitude</label>
      <input
        type="range"
        min="0"
        max=".005"
        step=".00001"
        onInput={amplitudeSlider}
      />
      <label>Color</label>
      <input type="checkbox" onInput={enableColor} />

      <button onClick={addToPresets}>Add to Presets</button>
      <button onClick={initPositions}>New Positions</button>
      <button onClick={initFromPreset}>Random Preset</button>

      <Scene
        camera={camera}
        shapes={[line]}
        renderer={renderer(props)}
        renderScene={renderScene}
        orbitControls
      />
    </div>
  )
}

const Page = () => {
  const [dimensions, setDimensions] = useState(null)

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  })

  return (
    <div>
      {dimensions ? (
        <Spiro height={dimensions.height} width={dimensions.width} />
      ) : null}
    </div>
  )
}

export default Page
