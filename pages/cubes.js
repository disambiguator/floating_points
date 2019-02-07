import React from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)
const vertexShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform float amplitude;
uniform vec3 origin;
uniform vec3 direction;
uniform float color;
attribute float displacement;

void main() {
gl_Position = projectionMatrix *
  modelViewMatrix *
  vec4(position,1.0);
}
`

const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

void main() {

// feed into our frag colour
gl_FragColor = vec4(1.0);
}
`

function generateDisplacement() {
  const v = []

  for(let theta=0; theta<10; theta = theta + 0.01) {
    v.push(Math.random())
  }

  return v;
}

const generateCube = (length, color) => {
  const geometry = new THREE.BoxGeometry(length, length, length);
  for ( var i = 0; i < geometry.faces.length; i ++ ) {
    geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
  }

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } )
  );
}

function getPoint(radius, theta, phi) {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi)
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi)
  const zCoordinate = radius * Math.cos(theta)
  return {x: xCoordinate, y: yCoordinate, z: zCoordinate}
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: lightgray;
`

class Scatter extends React.Component {
  componentDidMount() {
    this.timer = 0
    this.isRotating = false

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //ADD SCENE
    this.scene = new THREE.Scene()

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    )
    this.camera.position.z = 300


    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)
    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)


    let greenLength = 100;
    let yellowLength = 500;
    let redLength = 2500;

    this.redCube = generateCube(redLength, 'red');
    this.redCube.position.z = -(2*greenLength*Math.sin(Math.PI/4) + 2*yellowLength*Math.sin(Math.PI/4) + redLength*Math.sin(Math.PI/4))

    this.yellowCube = generateCube(yellowLength, 'yellow');
    this.yellowCube.position.z = -(2*greenLength*Math.sin(Math.PI/4) + yellowLength*Math.sin(Math.PI/4))

    this.greenCube = generateCube(greenLength, 'green');
    this.greenCube.position.z = 0

    this.scene.add( this.redCube );
    this.scene.add( this.yellowCube );
    this.scene.add( this.greenCube );
    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    this.timer++

    if(this.timer % 32 === 0) {
      this.isRotating = !this.isRotating
    }

    if(this.isRotating) {
      this.redCube.rotation.z += Math.PI / 64;
      this.yellowCube.rotation.y += Math.PI / 64;
      this.greenCube.rotation.x += Math.PI / 64;
    }

    this.controls.update()
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
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
          style={{width: '400px', height: '400px'}}
          ref={mount => this.mount = mount}
        />
      </Container>
    )
  }
}

export default Scatter
