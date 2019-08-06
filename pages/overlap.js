import React from 'react'
import Scene from '../components/scene'
import styled from 'styled-components'
import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

const generateCube = (length) => {
  const geometry = new THREE.BoxGeometry(length, length, length)
  // for ( var i = 0; i < geometry.faces.length; i ++ ) {
  //   geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
  // }

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
      vertexColors: THREE.FaceColors,
      transparent: true,
      opacity: 0.1
    })
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: lightgray;
`

class CubeZoom extends Scene {
  componentDidMount () {
    this.timer = 0

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    )
    this.camera.position.z = 300
    this.camera.position.x = 300
    this.camera.position.y = 300

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)
    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const increment = 30
    let previousCube = generateCube(increment)
    this.scene.add(previousCube)
    const direction = () => Math.random() > 0.5 ? -1 : -1
    for (let i = increment * 2; i < 500; i = i + increment) {
      const newCube = generateCube(i)
      newCube.position.x = previousCube.position.x + direction() * increment / 2
      newCube.position.y = previousCube.position.y + direction() * increment / 2
      newCube.position.z = previousCube.position.z + direction() * increment / 2
      this.scene.add(newCube)
      previousCube = newCube
    }

    this.start()
  }

  renderScene = () => {
    this.timer++
    // this.camera.translateX(-1)
    this.camera.translateX(-0.5)
    this.camera.translateZ(-0.5)
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
          style={{ width: '1200px', height: '1200px' }}
          ref={mount => { this.mount = mount }}
        />
      </Container>
    )
  }
}

export default CubeZoom
