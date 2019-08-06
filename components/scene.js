import React from 'react'
import * as THREE from 'three'

class Scene extends React.Component {
  constructor (props) {
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
}

export default Scene
