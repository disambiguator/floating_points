import React from 'react'
import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'
const OrbitControls = orbitControlsConstructor(THREE)

type Props = {
  renderer: any,
  renderScene: () => void,
  orbitControls: boolean,
  camera: THREE.Camera,
  shapes: Array<THREE.Mesh>
}

class Scene extends React.Component<Props, {}> {
  scene: THREE.Scene = new THREE.Scene()

  mount: any;

  frameId: number;

  private controls: any;

  componentDidMount () {
    this.mount.appendChild(this.props.renderer.domElement)

    if (this.props.orbitControls) {
      this.controls = new OrbitControls(this.props.camera, this.props.renderer.domElement)
    }

    this.start()
    this.props.shapes.forEach((shape) => {
      this.scene.add(shape)
    })
  }

  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.props.renderer.domElement)
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
    this.props.renderScene()
    if (this.props.orbitControls) {
      this.controls.update()
    }
    this.props.renderer.render(this.scene, this.props.camera)
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  render = () => (
    <div
      ref={mount => { this.mount = mount }}
    />
  )
}

export default Scene
