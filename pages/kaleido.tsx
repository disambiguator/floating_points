import React from 'react'
import * as THREE from 'three'
import Page from '../components/page'
import { Dimensions } from '../lib/types'
import Scene from '../components/scene'

const Feedback = (props: Dimensions) => {
  const { width, height } = props

  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000,
  )
  camera.position.z = 300

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  const plane = new THREE.PlaneBufferGeometry(width, height)

  const bufferScene = new THREE.Scene()
  const textureA = new THREE.WebGLRenderTarget(width, height)

  const geometry = new THREE.BoxGeometry(100, 100, 100)
  const bufferObject = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
      vertexColors: THREE.FaceColors,
    }),
  )
  bufferScene.add(bufferObject)

  const finalMaterial = new THREE.MeshBasicMaterial({ map: textureA.texture })
  const quad = new THREE.Mesh(plane, finalMaterial)

  const renderScene = () => {
    bufferObject.rotateX(0.1 * Math.random())
    bufferObject.rotateY(0.1 * Math.random())
    bufferObject.rotateZ(0.1 * Math.random())

    renderer.setRenderTarget(textureA)
    renderer.render(bufferScene, camera)
    renderer.setRenderTarget(null)
  }

  return (
    <Scene
      shapes={[quad]}
      camera={camera}
      renderer={renderer}
      renderScene={renderScene}
    />
  )
}

export default () => {
  return (
    <Page>
      {({ width, height }) => <Feedback width={width} height={height} />}
    </Page>
  )
}
