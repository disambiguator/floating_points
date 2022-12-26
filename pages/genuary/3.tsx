import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import type { ShaderMaterial } from 'three';
import { FiberScene } from 'components/scene';
import Page from '../../components/page';

const shader = {
  vertexShader: /* glsl */ `
    out vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: /* glsl */ `
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform float aspect;
  uniform float time;
  in vec2 vUv;

  const vec2 lpos = vec2(0.5);
  const vec3 moonColor = vec3(0.2);
  const float moonRadius = 0.04;
  const vec2 sunPos = vec2(0.5);

  float distCircle(vec2 p, float r){
    return max(0.,length(p)-r);
  }

  float distLight(vec2 p){
    return distCircle(p-lpos,0.01);
  }

  float distW(vec2 p){
    vec2 moonPos = vec2(mod(time/8.,1.),0.4 + abs(sin(time * 2. * 3.1415/16.))/10.);
    return distCircle(p - moonPos,moonRadius);
  }

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec3 iter(vec2 p){
      vec2 dir = normalize(lpos-p);
      vec2 pos = p;
      float depth = 0.;

      float distSun = (1. - distCircle(sunPos - p, 0.01));
      vec3 sunColor =
      vec3(
       1.,
       1.-abs(sin(time * 2. * 3.1415/16.))/2.,
       0.
      ) * distSun * distSun * distSun * 4. * (0.5 + abs(sin(3.1415/2. + time * 2. * 3.1415/16.)));

      for (int i = 0; i < 64; i++){
          float dw = distW(pos);
          float dl = distLight(pos);
          float d = min(dw,dl);
          if (dw < moonRadius){
            vec3 stars = vec3(rand(vUv) < 0.0003 ? 1. : 0.);

            vec3 shadow =  stars + sunColor * abs(sin(3.1415/2. + time * 2. * 3.1415/16.));
            return shadow;
          }else if(dl < 0.0001){
            return sunColor;
          }

          depth += d;
          pos += dir*d;
      }

    return vec3(0.);
  }

  void main()
  {
    vec3 color;
    vec2 moonPos = vec2(mod(time/8.,1.),0.4 + abs(sin(time * 2. * 3.1415/16.))/10.);
    if(distCircle(vUv - moonPos, moonRadius) < moonRadius) {
      color = moonColor;
    } else {
      color = iter(vUv);
    }

    gl_FragColor = vec4(color,1.0);
  }
      `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
  },
};

const Eclipse = React.memo(function Shader() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -500]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
});

export default function ShaderPage() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Eclipse />
        </FiberScene>
      </div>
    </Page>
  );
}
