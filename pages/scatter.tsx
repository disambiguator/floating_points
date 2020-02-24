import React from 'react';
import * as THREE from 'three';
import Scene from '../components/scene';
import Page from '../components/page';
import { Dimensions } from '../lib/types';

const vertexShader = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vPosition;
    varying float vColor;

    void main() {

    vPosition = position;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(position,1.0);
    }
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

// glslsandbox uniforms
uniform float time;
uniform vec2 resolution;

// shadertoy emulation
#define iTime time
#define iResolution resolution

// --------[ Original ShaderToy begins here ]---------- //
// by @etiennejcb
// Using Ikeda style pattern from bookofshaders : https://thebookofshaders.com/edit.php#10/ikeda-03.frag
// Using torus raymarching from https://www.shadertoy.com/view/MsX3Wj

// There is some antialiasing
const bool TURN_ON_ANTI_ALIASING = true; // put it to false for faster computation

const float PI = 3.14159265358979323846264;
const int MAX_PRIMARY_RAY_STEPS = 80; // decrease this number if it runs slow on your computer


float sdTorus( vec3 p, vec2 t ) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float distanceField(vec3 p) {
	return -sdTorus(p.yxz, vec2(5.0, 1.0));
}

vec3 castRay(vec3 pos, vec3 dir) {
	for (int i = 0; i < MAX_PRIMARY_RAY_STEPS; i++) {
			float dist = distanceField(pos);
			pos += dist * dir;
	}
	return pos;
}

float random (in float x) {
    return fract(sin(x)*1e4);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float pattern(vec2 st, vec2 v, float t) {
    vec2 p = floor(st+v);
    return step(t, random(25.+p*.000004)+random(p.x)*0.75 );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = vec4(0.0);
    
    for(float di=-0.25;di<=0.25;di+=.5){
        for(float dj=-0.25;dj<=0.25;dj+=.5){
            vec2 screenPos = ((fragCoord.xy + vec2(di,dj)) / iResolution.xy) * 2.0 - 1.0;
            vec3 cameraPos = vec3(0.0, 4.2, -3.8);

            vec3 cameraDir = vec3(0., 0.22, 1.3);
            vec3 planeU = vec3(1.0, 0.0, 0.0) * 0.8;
            vec3 planeV = vec3(0.0, iResolution.y / iResolution.x * 1.0, 0.0);
            vec3 rayDir = normalize(cameraDir + screenPos.x * planeU + screenPos.y * planeV);

            vec3 rayPos = castRay(cameraPos, rayDir);

            float majorAngle = atan(rayPos.z, rayPos.y);
            float minorAngle = atan(rayPos.x, length(rayPos.yz) - 5.0);

            vec2 st = vec2(majorAngle/PI/2.0,minorAngle/PI);

            vec2 grid = vec2(1000.0,50.);
            st *= grid;

            vec2 ipos = floor(st);  // integer
            vec2 fpos = fract(st);  // fraction

            vec2 vel = vec2(iTime*0.09*max(grid.x,grid.y)); // time
            vel *= vec2(1.,0.0) *(0.4+2.0*pow(random(1.0+ipos.y),2.0)); // direction

            // For colorful stuff
            vec2 offset = 0.*vec2(0.2,0.25);

            vec3 color = vec3(0.);
            float replaceMouse = 0.75+0.45*sin(0.6*iTime + 0.015*st.x);
            color.r = pattern(st+offset,vel,replaceMouse);
            color.g = pattern(st,vel,replaceMouse);
            color.b = pattern(st-offset,vel,replaceMouse);

            // Margins
            color *= step(0.2,fpos.y);

            if(TURN_ON_ANTI_ALIASING){
            	fragColor += 0.25*vec4(color,1.0);
            } else {
                fragColor = vec4(color,1.0);
                return;
            }
        }
    }
}
// --------[ Original ShaderToy ends here ]---------- //

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const Scatter = ({ width, height }: Dimensions) => {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor('#000000');
  renderer.setSize(width, height);

  const uniforms = {
    resolution: { value: new THREE.Vector2(800, 800), type: 'v2' },
    time: { value: 0.0 },
  };
  const redCube = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300, 32),
    new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    }),
  );

  const renderScene = () => {
    uniforms.time.value += 0.001;
  };
  return (
    <Scene
      camera={camera}
      renderer={renderer}
      shapes={[redCube]}
      renderScene={renderScene}
    />
  );
};

export default () => <Page>{_ => <Scatter width={800} height={800} />}</Page>;
