import React from 'react'
import Scene from '../components/scene'
import styled from 'styled-components'
import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

const generateCube = (length) => {
  const geometry = new THREE.BoxGeometry(length, length, length)
  for (var i = 0; i < geometry.faces.length; i++) {
    geometry.faces[i].color.setHex(Math.random() * 0xffffff)
  }

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors })
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: lightgray;
`

class Scatter extends Scene {
  componentDidMount () {
    this.timer = 0
    this.isRotating = false

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    )
    this.camera.position.z = 300

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)
    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const greenLength = 100
    const yellowLength = 500
    const redLength = 2500

    this.redCube = generateCube(redLength)
    this.redCube.position.z = -(2 * greenLength * Math.sin(Math.PI / 4) + 2 * yellowLength * Math.sin(Math.PI / 4) + redLength * Math.sin(Math.PI / 4))

    this.yellowCube = generateCube(yellowLength)
    this.yellowCube.position.z = -(2 * greenLength * Math.sin(Math.PI / 4) + yellowLength * Math.sin(Math.PI / 4))

    this.greenCube = generateCube(greenLength)
    this.greenCube.position.z = 0

    this.scene.add(this.redCube)
    this.scene.add(this.yellowCube)
    this.scene.add(this.greenCube)
    this.start()
  }

  renderScene = () => {
    this.timer++

    if (this.timer % 32 === 0) {
      this.isRotating = !this.isRotating
    }

    if (this.isRotating) {
      this.redCube.rotation.z += Math.PI / 64
      this.yellowCube.rotation.y += Math.PI / 64
      this.greenCube.rotation.x += Math.PI / 64
    }

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  render () {
    return (
      <Container>
        <style global jsx>{`
      html,
      body,
      body > div:first-child,
      div#__next,
      div#__next > div,
      div#__next > div > div {
        height: 100%;
      }
    `}</style>

        <div
          style={{ width: '400px', height: '400px' }}
          ref={mount => { this.mount = mount }}
        />
      </Container>
    )
  }
}

export default Scatter
