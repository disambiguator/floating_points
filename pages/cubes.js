import React, { useEffect, useState } from 'react'
import Scene from '../components/composable_scene'
import styled from 'styled-components'
import * as THREE from 'three'

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

const camera = (width, height) => {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    10000
  )
  perspectiveCamera.position.z = 300

  return perspectiveCamera
}

const renderer = (width, height) => {
  const webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor('#000000')
  webGLRenderer.setSize(width, height)

  return webGLRenderer
}

const Cubes = (props) => {
  const width = props.width
  const height = props.height

  let timer = 0
  let isRotating = false

  const greenLength = 100
  const yellowLength = 500
  const redLength = 2500

  const redCube = generateCube(redLength)
  redCube.position.z = -(2 * greenLength * Math.sin(Math.PI / 4) + 2 * yellowLength * Math.sin(Math.PI / 4) + redLength * Math.sin(Math.PI / 4))

  const yellowCube = generateCube(yellowLength)
  yellowCube.position.z = -(2 * greenLength * Math.sin(Math.PI / 4) + yellowLength * Math.sin(Math.PI / 4))

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

const Page = () => {
  const [dimensions, setDimensions] = useState(null)
  const myRef = React.createRef()

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({ width: myRef.current.clientWidth, height: myRef.current.clientHeight })
    }
  })

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
        ref={myRef}
      >
        {dimensions ? <Cubes height={dimensions.height} width={dimensions.width} /> : null}
      </div>
    </Container>
  )
}

export default Page
