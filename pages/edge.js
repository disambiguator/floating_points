import React from 'react'
import Scene from '../components/scene'
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'

class Edge extends Scene {
  componentDidMount () {
    this.mount.width = window.innerWidth
    this.mount.height = window.innerHeight

    this.width = this.mount.width
    this.height = this.mount.height
    this.time = 0

    // ADD CAMERA
    this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 1, 1000)
    this.camera.position.z = 2

    // ADD RENDERER
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)
    this.mount.appendChild(this.renderer.domElement)

    this.bufferTextureSetup()
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.start()
  }

  bufferTextureSetup () {
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

    this.bufferMaterial = new THREE.ShaderMaterial({
      uniforms: {
        res: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        videoTexture: { type: 't', value: new THREE.TextureLoader().load('/static/bernal.jpg') },
        distortion: { type: 'f', value: 1.0 },
        time: { type: 'f', value: Math.random() * Math.PI * 2 + Math.PI }
      },
      fragmentShader: edgeShader
    })
    const plane = new THREE.PlaneBufferGeometry(this.width, this.height)
    this.quad = new THREE.Mesh(plane, this.bufferMaterial)
    this.scene.add(this.quad)
  }

  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  renderScene = () => {
    this.time += 0.02
    this.bufferMaterial.uniforms.time.value = this.time
    this.renderer.render(this.scene, this.camera)
    this.controls.update()
  }

  render () {
    return (
      <div>
        <div ref={mount => { this.mount = mount }} />
      </div>
    )
  }
}

export default Edge
