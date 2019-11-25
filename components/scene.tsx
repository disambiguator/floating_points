import React from 'react'
import * as THREE from 'three'

class Scene<Props> extends React.Component<Props, {}> {
  scene: THREE.Scene;

  mount: any;

  renderer: any;

  frameId: number | null = null;

  constructor (props: Props) {
    super(props)
    this.scene = new THREE.Scene()
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

  renderScene () {
    throw new Error('Implement renderScene()')
  }
}

export default Scene
