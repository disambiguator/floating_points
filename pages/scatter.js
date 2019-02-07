import React from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import orbitControlsConstructor from 'three-orbit-controls'

const OrbitControls = orbitControlsConstructor(THREE)

const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float distortion[300];

float lookup(int index) {
  for(int i = 0; i < 300; i++) {
    if(index==i) {
      return distortion[i];
    }
  }
  
  return 0.0;
}

void main() {
    vec2 st = gl_FragCoord.xy/resolution;
    
    int index = int(floor((st.y+1.)/(2./300.)));
    
    vec2 distorted = vec2(mod(st.x + lookup(index),1.),  st.y);
    
    vec2 center = vec2(0.5);

    vec3 color = vec3(step(0.3, distance(distorted,center))) * vec3(step(distance(distorted,center),0.305));

    gl_FragColor = vec4( color, 1.0 );
}
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
`

const generateDistortion = () => {
  const d = new Array(300)
  d[0] = 0
  for (let i = 1; i < 300; i++) {
    d[i] = d[i - 1] + Math.random() * 0.01 - 0.005
  }
  return d
}

class Scatter extends React.Component {
  componentDidMount () {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //ADD SCENE
    this.scene = new THREE.Scene()

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.z = 100

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.uniforms = {
      resolution: { value: new THREE.Vector2(800, 800), type: 'v2' },
      distortion: new THREE.Uniform(generateDistortion())
    };
    this.redCube = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300, 32),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        // vertexShader: vertexShader,
        fragmentShader: fragmentShader
      })
    );
    this.scene.add(this.redCube);
    this.start()
  }

  componentWillUnmount () {
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
    this.renderScene()
    this.controls.update()
    this.uniforms.distortion = new THREE.Uniform(generateDistortion())
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
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
          style={{ width: '800px', height: '800px' }}
          ref={mount => this.mount = mount}
        />
      </Container>
    )
  }
}

export default Scatter
