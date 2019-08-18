// this doesnt work yet

import React from 'react'
import * as THREE from 'three'

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
  video: { width: { exact: 640 }, height: { exact: 480 } }
}

const setStream = async (video) => {
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints)
}

class Feedback extends React.Component {
  constructor (props) {
    super(props)

    this.scene = null
    this.camera = null
    this.renderer = null
    this.bufferScene = null
    this.textureA = null
    this.textureB = null
    this.bufferMaterial = null
    this.quad = null
    this.video = null
    this.videoTexture = null
  }

  componentDidMount () {
    // console.log(window.innerWidth, window.innerWidth)
    this.mount.width = window.innerWidth
    this.mount.height = window.innerHeight

    this.width = this.mount.width
    this.height = this.mount.height

    // ADD SCENE
    this.scene = new THREE.Scene()

    // ADD CAMERA
    this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 1, 1000)
    this.camera.position.z = 2

    // ADD RENDERER
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)
    this.mount.appendChild(this.renderer.domElement)

    this.videoTextureSetup()
    this.bufferTextureSetup()

    this.start()
  }

  bufferTextureSetup () {
    console.log(this.width, this.height)
    // Create buffer scene
    this.bufferScene = new THREE.Scene()
    // Create 2 buffer textures
    this.textureA = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    })
    this.textureB = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    })
    // Pass textureA to shader
    this.bufferMaterial = new THREE.ShaderMaterial({
      uniforms: {
        bufferTexture: { type: 't', value: this.textureA.texture },
        res: { type: 'v2', value: new THREE.Vector2(this.width, this.height) },
        // Keeps the resolution
        videoTexture: { type: 't', value: this.videoTexture },
        time: { type: 'f', value: Math.random() * Math.PI * 2 + Math.PI }
      },
      fragmentShader: fragmentShader
    })
    const plane = new THREE.PlaneBufferGeometry(this.width, this.height)
    const bufferObject = new THREE.Mesh(plane, this.bufferMaterial)
    this.bufferScene.add(bufferObject)
    // Draw textureB to screen
    const finalMaterial = new THREE.MeshBasicMaterial({ map: this.textureB })
    this.quad = new THREE.Mesh(plane, finalMaterial)
    this.scene.add(this.quad)
  }

  videoTextureSetup () {
    setStream(this.video)
    this.videoTexture = new THREE.VideoTexture(this.video)
    this.videoTexture.minFilter = THREE.LinearFilter
    this.videoTexture.magFilter = THREE.LinearFilter
    this.videoTexture.format = THREE.RGBFormat
  }

  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    window.cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.setRenderTarget(this.textureB)
    this.renderer.render(this.bufferScene, this.camera)

    // Swap textureA and B
    const t = this.textureA
    this.textureA = this.textureB
    this.textureB = t
    this.quad.material.map = this.textureB.texture
    this.bufferMaterial.uniforms.bufferTexture.value = this.textureA.texture
    // Update time
    this.bufferMaterial.uniforms.time.value += 0.01
    // Finally, draw to the screen
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
  }

  render () {
    return (
      <div>
        <video id='video' autoPlay ref={video => { this.video = video }} />
        <div ref={mount => { this.mount = mount }} />
      </div>
    )
  }
}

export default Feedback
