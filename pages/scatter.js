import React, {Component} from 'react';
import * as THREE from 'three';
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

const vertexShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform float amplitude;
uniform vec3 origin;
uniform vec3 direction;
uniform float color;
attribute float displacement;

void main() {
vec4 newPosition = projectionMatrix *
  modelViewMatrix *
  vec4(position,1.0);
  
gl_Position = vec4(mod(newPosition.x + 0.0,1.0), newPosition.y, newPosition.z, newPosition.w);
}
`

const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

void main() {

// feed into our frag colour
gl_FragColor = vec4(1.0);
}
`

function generateVertices() {
  const v = []
  const radius = 100;
  const phi = Math.PI/4;

  for(let theta=0; theta<10; theta = theta + 0.01) {
    v.push(
      radius * Math.sin(theta*Math.PI) * Math.cos(phi),
      radius * Math.cos(theta*Math.PI) * Math.sin(phi),
      radius * Math.cos(theta*Math.PI))
  }

  return v;
}

function generateDisplacement() {
  const v = []

  for(let theta=0; theta<10; theta = theta + 0.01) {
    v.push(Math.random())
  }

  return v;
}


function getPoint(radius, theta, phi) {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi)
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi)
  const zCoordinate = radius * Math.cos(theta)
  return {x: xCoordinate, y: yCoordinate, z: zCoordinate}
}

class ThreeScene extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //ADD SCENE
    this.scene = new THREE.Scene()

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.z = 300

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const material =
      new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      })

    const geometry = new THREE.BufferGeometry()
    geometry.attributes.position = new THREE.Float32BufferAttribute(generateVertices(), 3)
    geometry.attributes.displacement = new THREE.Float32BufferAttribute(generateDisplacement(), 1)

    const line = new THREE.Line(geometry, material)
    this.scene.add(line)
    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    this.renderScene()
    this.controls.update()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
      <div
        style={{width: '400px', height: '400px'}}
        ref={(mount) => {
          this.mount = mount
        }}
      />
    )
  }
}

export default ThreeScene