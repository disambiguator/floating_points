import React, { useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'
import Scene from '../components/scene'
import styled from 'styled-components'

const near = 0.1
const far = 10000
const renderSpeed = 1000

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

    vec3 newPosition = position + amplitude * displacement * 100.0 * direction;

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

    vec3 color = normalize(vPosition);

    // feed into our frag colour
    gl_FragColor = vec4(color, 1.0);

    }
`

// const generateCube = (length) => {
//   const geometry = new THREE.BoxGeometry(length, length, length)
//   for (var i = 0; i < geometry.faces.length; i++) {
//     geometry.faces[i].color.setHex(Math.random() * 0xffffff)
//   }
//
//   return new THREE.Mesh(
//     geometry,
//     new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors })
//   )
// }

const uniforms = {
  amplitude: new THREE.Uniform(0.0005),
  origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  color: new THREE.Uniform(0.0)
}

function sum (array, f) {
  return array.reduce((accum, p) => accum + f(p), 0)
}

class Spiro extends Scene<{}> {
  private camera: THREE.PerspectiveCamera;

  private controls: any;

  private analyser: THREE.AudioAnalyser

  private sound: THREE.Audio;

  componentDidMount () {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      near,
      far
    )

    this.camera.position.set(0, 0, 300)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const material =
      new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      })

    const displacement = new Float32Array(renderSpeed)
    for (let i = 0; i < renderSpeed; i++) {
      displacement[i] = Math.random() * 5
    }

    for (let i = 0; i < 500; i++) {
      const geometry = new THREE.BoxBufferGeometry(15, 15, 15)
      geometry.addAttribute('displacement', new THREE.BufferAttribute(displacement, 1))
      geometry.translate(Math.random() * 300, Math.random() * 300, Math.random() * 300)
      const line = new THREE.Mesh(geometry, material)
      line.rotation.x += Math.PI / 64 * Math.random() * 100
      line.rotation.y += Math.PI / 64 * Math.random() * 100
      line.rotation.z += Math.PI / 64 * Math.random() * 100
      this.scene.add(line)
    }

    this.updateRayCaster(0, 0)

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener()
    this.camera.add(listener)

    // create an Audio source
    this.sound = new THREE.Audio(listener)

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load(
      'https://floating-points.s3.us-east-2.amazonaws.com/dreamspace.mp3',
      (buffer) => {
        this.sound.setBuffer(buffer)
        this.sound.setLoop(true)
        this.sound.setVolume(0.5)
        this.sound.play(1000)
      },
      () => {
      },
      (error) => {
        console.log(error, 'error!')
      }
    )

    // create an AudioAnalyser, passing in the sound and desired fftSize
    this.analyser = new THREE.AudioAnalyser(this.sound, 32)

    // get the average frequency of the sound
    // const data = analyser.getAverageFrequency()

    this.start()
  }

  renderScene = () => {
    // geometry.attributes.position = new THREE.Float32BufferAttribute(generateVertices(), 3)
    // geometry.attributes.position.needsUpdate = true

    const freq = this.analyser.getFrequencyData()

    const value = sum(freq, f => f) / 5000.0
    uniforms.amplitude.value = value > 0.005 ? value : 0
    this.camera.translateX(-0.5)

    this.renderer.render(this.scene, this.camera)
    this.controls.update()
  }

  updateRayCaster (x, y) {
    const mouse = new THREE.Vector2(x, y)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)

    uniforms.origin.value = raycaster.ray.origin
    uniforms.direction.value = raycaster.ray.direction
  }

  mouseMove = (event) => {
    this.updateRayCaster(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.sound.stop()
  }

  render = () => (
    <div
      onMouseMove={this.mouseMove}
      ref={(mount) => {
        this.mount = mount
      }}
    />
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: lightgray;
  width: 500px;
  height: 500px;
`

const Page = (props) => {
  const [started, start] = useState(false)

  return (
    started ? <Spiro />
      : <Container onClick={() => start(true)}>
        Click to start
      </Container>
  )
}

export default Page
