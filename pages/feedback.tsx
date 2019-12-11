// this doesnt work yet

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Page from '../components/page'
import { Dimensions } from '../lib/types'
import { MeshBasicMaterial } from 'three'
import Scene from '../components/scene'

const fragmentShader = `
  uniform vec2 res;//The width and height of our screen
  uniform sampler2D bufferTexture;//Our input texture
  uniform sampler2D videoTexture;
  uniform float time;
  void main() {
    vec2 st = gl_FragCoord.xy / res;
    vec2 uv = st * 0.9985;
    vec4 sum = texture2D(bufferTexture, uv);
    vec4 src = texture2D(videoTexture, uv);
    sum.rgb = mix(sum.rbg, src.rgb, 0.01);
    gl_FragColor = sum;
  }
`
const constraints = {
  video: { width: { exact: 640 }, height: { exact: 480 } },
}

const setStream = async (video: HTMLVideoElement) => {
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints)
}

const Feedback = (props: Dimensions) => {
  const { width, height } = props

  const videoRef = useRef<HTMLVideoElement>(null)

  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000,
  )
  camera.position.z = 2

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  const plane = new THREE.PlaneBufferGeometry(width, height)

  // buffer texture setup
  // Create buffer scene
  const bufferScene = new THREE.Scene()
  // Create 2 buffer textures
  let textureA = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  let textureB = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })

  let bufferMaterial: THREE.ShaderMaterial
  // Video texture setup
  useEffect(() => {
    const video = videoRef.current!
    setStream(video)

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBFormat

    // Pass textureA to shader
    bufferMaterial = new THREE.ShaderMaterial({
      uniforms: {
        bufferTexture: { type: 't', value: textureA.texture },
        res: { type: 'v2', value: new THREE.Vector2(width, height) },
        // Keeps the resolution
        videoTexture: { type: 't', value: videoTexture },
        time: { type: 'f', value: Math.random() * Math.PI * 2 + Math.PI },
      },
      fragmentShader: fragmentShader,
    })
    const bufferObject = new THREE.Mesh(plane, bufferMaterial)
    bufferScene.add(bufferObject)
  })

  // Draw textureB to screen
  const finalMaterial = new THREE.MeshBasicMaterial({ map: textureB.texture })
  const quad = new THREE.Mesh(plane, finalMaterial)

  const renderScene = () => {
    renderer.setRenderTarget(textureB)
    renderer.render(bufferScene, camera)

    // Swap textureA and B
    const t = textureA
    textureA = textureB
    textureB = t
    const material = quad.material as MeshBasicMaterial
    material.map = textureB.texture
    bufferMaterial.uniforms.bufferTexture.value = textureA.texture
    bufferMaterial.uniforms.time.value += 0.01
    renderer.setRenderTarget(null)
  }

  return (
    <div>
      <video id="video" autoPlay ref={videoRef} />
      <Scene
        shapes={[quad]}
        camera={camera}
        renderer={renderer}
        renderScene={renderScene}
      />
    </div>
  )
}

export default () => {
  return (
    <Page>
      {({ width, height }) => <Feedback width={width} height={height} />}
    </Page>
  )
}
