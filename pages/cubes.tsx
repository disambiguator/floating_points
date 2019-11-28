import React, { useEffect, useState } from 'react'
import Scene from '../components/scene'
import styled from 'styled-components'
import Page from '../components/page'
import * as THREE from 'three'

const generateCube = (length: number) => {
  const geometry = new THREE.BoxGeometry(length, length, length)
  for (let i = 0; i < geometry.faces.length; i++) {
    geometry.faces[i].color.setHex(Math.random() * 0xffffff)
  }

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: THREE.FaceColors,
    }),
  )
}

const camera = (width: number, height: number) => {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    10000,
  )
  perspectiveCamera.position.z = 300

  return perspectiveCamera
}

const renderer = (width: number, height: number) => {
  const webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor('#000000')
  webGLRenderer.setSize(width, height)

  return webGLRenderer
}

interface Props {
  width: number;
  height: number
}
const Cubes = (props: Props) => {
  const width = props.width
  const height = props.height

  let timer = 0
  let isRotating = false

  const greenLength = 100
  const yellowLength = 500
  const redLength = 2500

  const redCube = generateCube(redLength)
  redCube.position.z = -(
    2 * greenLength * Math.sin(Math.PI / 4) +
    2 * yellowLength * Math.sin(Math.PI / 4) +
    redLength * Math.sin(Math.PI / 4)
  )

  const yellowCube = generateCube(yellowLength)
  yellowCube.position.z = -(
    2 * greenLength * Math.sin(Math.PI / 4) +
    yellowLength * Math.sin(Math.PI / 4)
  )

  const greenCube = generateCube(greenLength)
  greenCube.position.z = 0

  const renderScene = () => {
    timer++

    if (timer % 32 === 0) {
      isRotating = !isRotating
    }
    if (isRotating) {
      redCube.rotation.z += Math.PI / 64
      yellowCube.rotation.y += Math.PI / 64
      greenCube.rotation.x += Math.PI / 64
    }
  }

  return (
    <Scene
      camera={camera(width, height)}
      shapes={[redCube, greenCube, yellowCube]}
      renderer={renderer(width, height)}
      renderScene={renderScene}
      orbitControls
    />
  )
}

export default () => {
  return (
    <Page>
      {dimensions => (dimensions ? <Cubes height={400} width={400} /> : null)}
    </Page>
  )
}
