import React, { useEffect, useState } from 'react'
import Scene from '../components/scene'
import styled from 'styled-components'
import * as THREE from 'three'

const generateCube = length => {
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
      opacity: 0.1,
    }),
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
    10000,
  )
  perspectiveCamera.position.z = 300
  perspectiveCamera.position.x = 300
  perspectiveCamera.position.y = 300

  return perspectiveCamera
}

const renderer = (width, height) => {
  const webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setSize(width, height)

  return webGLRenderer
}

const cubes = () => {
  const shapes = []
  const increment = 30
  let previousCube = generateCube(increment)
  shapes.push(previousCube)
  const direction = () => (Math.random() > 0.5 ? -1 : -1)
  for (let i = increment * 2; i < 500; i = i + increment) {
    const newCube = generateCube(i)
    newCube.position.x = previousCube.position.x + (direction() * increment) / 2
    newCube.position.y = previousCube.position.y + (direction() * increment) / 2
    newCube.position.z = previousCube.position.z + (direction() * increment) / 2
    shapes.push(newCube)
    previousCube = newCube
  }

  return shapes
}

const CubeZoom = props => {
  const { width, height } = props
  const sceneCamera = camera(width, height)
  const renderScene = () => {
    // sceneCamera.translateX(-1)
    sceneCamera.translateX(-0.5)
    sceneCamera.translateZ(-0.5)
  }

  return (
    <Scene
      camera={sceneCamera}
      shapes={cubes()}
      renderer={renderer(width, height)}
      renderScene={renderScene}
      orbitControls
    />
  )
}

const Page = () => {
  const [dimensions, setDimensions] = useState(null)
  const myRef: React.RefObject<HTMLDivElement> = React.createRef()

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({
        width: myRef.current.clientWidth,
        height: myRef.current.clientHeight,
      })
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
      <div style={{ width: '1200px', height: '1200px' }} ref={myRef}>
        {dimensions ? (
          <CubeZoom height={dimensions.height} width={dimensions.width} />
        ) : null}
      </div>
    </Container>
  )
}

export default Page
