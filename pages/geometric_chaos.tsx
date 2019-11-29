import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import Scene from '../components/scene'
import styled from 'styled-components'
import sumBy from 'lodash/sumBy'
import sum from 'lodash/sum'

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
  color: new THREE.Uniform(0.0),
}

const Spiro = () => {
  const updateRayCaster = (x: number, y: number) => {
    const mouse = new THREE.Vector2(x, y)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    uniforms.origin.value = raycaster.ray.origin
    uniforms.direction.value = raycaster.ray.direction
  }

  const width = window.innerWidth
  const height = window.innerHeight

  const camera = new THREE.PerspectiveCamera(45, width / height, near, far)
  camera.position.set(0, 0, 300)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  })

  const displacement = new Float32Array(renderSpeed)
  for (let i = 0; i < renderSpeed; i++) {
    displacement[i] = Math.random() * 5
  }

  const lines = []
  for (let i = 0; i < 500; i++) {
    const geometry = new THREE.BoxBufferGeometry(15, 15, 15)
    geometry.setAttribute(
      'displacement',
      new THREE.BufferAttribute(displacement, 1),
    )
    geometry.translate(
      Math.random() * 300,
      Math.random() * 300,
      Math.random() * 300,
    )
    const line = new THREE.Mesh(geometry, material)
    line.rotation.x += (Math.PI / 64) * Math.random() * 100
    line.rotation.y += (Math.PI / 64) * Math.random() * 100
    line.rotation.z += (Math.PI / 64) * Math.random() * 100
    lines.push(line)
  }

  updateRayCaster(0, 0)

  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener()
  camera.add(listener)

  // create an Audio source
  const sound = new THREE.Audio(listener)

  useEffect(() => {
    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load(
      'https://floating-points.s3.us-east-2.amazonaws.com/dreamspace.mp3',
      (buffer: THREE.AudioBuffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(true)
        sound.setVolume(0.5)
        sound.play()
      },
      () => {
        console.log('playing')
      },
      (error: string) => {
        console.log(error, 'error!')
      },
    )
    return () => {
      sound.stop()
    }
  })

  // create an AudioAnalyser, passing in the sound and desired fftSize
  const analyser = new THREE.AudioAnalyser(sound, 32)

  // get the average frequency of the sound
  // const data = analyser.getAverageFrequency()

  const renderScene = () => {
    // geometry.attributes.position = new THREE.Float32BufferAttribute(generateVertices(), 3)
    // geometry.attributes.position.needsUpdate = true

    const freq = analyser.getFrequencyData()

    const value = sum(freq) / 5000.0
    uniforms.amplitude.value = value > 0.005 ? value : 0
    camera.translateX(-0.5)
    console.log(value)
  }

  const mouseMove = (event: React.MouseEvent) => {
    updateRayCaster(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    )
  }

  return (
    <div onMouseMove={mouseMove}>
      <Scene
        camera={camera}
        shapes={lines}
        renderer={renderer}
        renderScene={renderScene}
        orbitControls
      />
    </div>
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

const Page = () => {
  const [started, start] = useState(false)

  return started ? (
    <Spiro />
  ) : (
    <Container onClick={() => start(true)}>Click to start</Container>
  )
}

export default Page
