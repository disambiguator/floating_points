import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'
import Scene from '../components/scene'
import Page from '../components/page'

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

const generateDistortion = () => {
  const d = new Array(300)
  d[0] = 0
  for (let i = 1; i < 300; i++) {
    d[i] = d[i - 1] + Math.random() * 0.01 - 0.005
  }
  return d
}

const Scatter = ({ width, height }) => {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 100

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor('#000000')
  renderer.setSize(width, height)

  const uniforms = {
    resolution: { value: new THREE.Vector2(800, 800), type: 'v2' },
    distortion: new THREE.Uniform(generateDistortion()),
  }
  const redCube = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300, 32),
    new THREE.ShaderMaterial({
      uniforms: uniforms,
      // vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    }),
  )

  const renderScene = () => {
    uniforms.distortion = new THREE.Uniform(generateDistortion())
  }
  return (
    <Scene
      camera={camera}
      renderer={renderer}
      shapes={[redCube]}
      renderScene={renderScene}
    />
  )
}

export default () => <Page>{_ => <Scatter width={800} height={800} />}</Page>
