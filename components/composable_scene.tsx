import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import orbitControlsConstructor from 'three-orbit-controls'
const OrbitControls = orbitControlsConstructor(THREE)

type Props = {
  renderer: any,
  renderScene: () => void,
  orbitControls: boolean,
  camera: THREE.Camera,
  shapes: Array<THREE.Mesh | THREE.Line>
}

const Scene = (props: Props) => {
  const controls = props.orbitControls ? new OrbitControls(props.camera, props.renderer.domElement) : null
  let frameId : number = null
  const scene = new THREE.Scene()
  const ref = useRef(null)

  const animate = () => {
    props.renderScene()
    if (props.orbitControls) {
      controls.update()
    }
    props.renderer.render(scene, props.camera)
    frameId = window.requestAnimationFrame(animate)
  }

  const start = () => {
    if (!frameId) {
      frameId = window.requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    ref.current.appendChild(props.renderer.domElement)

    start()
    props.shapes.forEach((shape) => {
      scene.add(shape)
    })

    return stop
  })

  const stop = () => {
    window.cancelAnimationFrame(frameId)
  }

  return <div ref={ref} />
}

export default Scene
