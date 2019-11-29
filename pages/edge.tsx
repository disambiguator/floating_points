import React, { useEffect, useRef, useState } from 'react'
import Scene from '../components/scene'
import * as THREE from 'three'
import Page from '../components/page'

const edgeShader = `
      uniform vec2 res;//The width and height of our screen
uniform sampler2D videoTexture;
  uniform float time;

  uniform float threshold;
    void main() {
    vec2 uv = gl_FragCoord.xy / res;
    vec3 col;
    
    /*** Sobel kernels ***/
    // Note: GLSL's mat3 is COLUMN-major ->  mat3[col][row]
    mat3 sobelX = mat3(-1.0, -2.0, -1.0,
                       0.0,  0.0, 0.0,
                       1.0,  2.0,  1.0);
    mat3 sobelY = mat3(-1.0,  0.0,  1.0,
                       -2.0,  0.0, 2.0,
                       -1.0,  0.0,  1.0);  
    
    float sumX = 0.0; // x-axis change
    float sumY = 0.0; // y-axis change
    
    for(int i = -1; i <= 1; i++)
    {
        for(int j = -1; j <= 1; j++)
        {
            // texture coordinates should be between 0.0 and 1.0
            float x = (gl_FragCoord.x + float(i))/res.x;
            float y =  (gl_FragCoord.y + float(j))/res.y;
            
            // Convolve kernels with image
            sumX += length(texture2D( videoTexture, vec2(x, y) ).xyz) * float(sobelX[1+i][1+j]);
            sumY += length(texture2D( videoTexture, vec2(x, y) ).xyz) * float(sobelY[1+i][1+j]);
        }
    }
    
    float g = abs(sumX) + abs(sumY);
    //g = sqrt((sumX*sumX) + (sumY*sumY));
    
    if(g > sin(time)/3. + 0.4)
        col = vec3(1.0,1.0,1.0);
    else
        col = col * 0.0;
    
gl_FragColor.xyz = col;
}
    `

interface Props {
  width: number;
  height: number
}
const Edge = (props: Props) => {
  const { width, height } = props
  let time = 0

  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000,
  )
  camera.position.z = 2

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  const bufferMaterial = new THREE.ShaderMaterial({
    uniforms: {
      res: { type: 'v2', value: new THREE.Vector2(width, height) },
      videoTexture: {
        type: 't',
        value: new THREE.TextureLoader().load('/static/bernal.jpg'),
      },
      distortion: { type: 'f', value: 1.0 },
      time: { type: 'f', value: Math.random() * Math.PI * 2 + Math.PI },
    },
    fragmentShader: edgeShader,
  })
  const plane = new THREE.PlaneBufferGeometry(width, height)
  const quad = new THREE.Mesh(plane, bufferMaterial)

  const renderScene = () => {
    time += 0.02
    bufferMaterial.uniforms.time.value = time
  }

  return (
    <Scene
      camera={camera}
      shapes={[quad]}
      renderer={renderer}
      renderScene={renderScene}
      orbitControls
    />
  )
}

export default () => {
  return (
    <Page>
      {dimensions => (
        <Edge height={dimensions.height} width={dimensions.width} />
      )}
    </Page>
  )
}
