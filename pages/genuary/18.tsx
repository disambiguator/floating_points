import { useFrame } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

const Shader = {
  vertexShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
    uniform float posScale;
    uniform float time;
    uniform float striations;
    uniform float height;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec2 vUv;
    uniform float time;
    const float f = 2.;

    float rand(vec2 co) {
      float t = floor(time);
      return fract(sin(dot(co, vec2(t + .2323, t + .078233))) * 43758.5453);
    }

    float randTime(vec2 co) {
      return fract(sin(dot(co, vec2(time + .2323, time + .078233))) * 43758.5453);
    }

    const int N = 4;
    float sdPolygon( in vec2 p, in vec2[N] v )
    {
    const int num = v.length();
    float d = dot(p-v[0],p-v[0]);
    float s = 1.0;
    for( int i=0, j=num-1; i<num; j=i, i++ )
    {
        // distance
        vec2 e = v[j] - v[i];
        vec2 w =    p - v[i];
        vec2 b = w - e*clamp( dot(w,e)/dot(e,e), 0.0, 1.0 );
        d = min( d, dot(b,b) );

        // winding number from http://geomalgorithms.com/a03-_inclusion.html
        bvec3 cond = bvec3( p.y>=v[i].y,
                            p.y <v[j].y,
                            e.x*w.y>e.y*w.x );
        if( all(cond) || all(not(cond)) ) s=-s;
    }

    return s*sqrt(d);
}

    void main() {

      // vec2[] polygon = vec2[](vec2(0.7,0.5),vec2(0.3,0.2),vec2(0.3,0.8));
      // float d = sdPolygon(vUv, polygon);

      vec2[] polygon = vec2[](vec2(0.43,0.8),vec2(0.43,0.2),vec2(0.57,0.2),vec2(0.57,0.8));
      float a = sdPolygon(vUv - vec2(0.1,0.), polygon);
      float b = sdPolygon(vUv - vec2(-0.1,0.), polygon);
      float d = min(a,b);
      float c = rand(vUv);
      // float c = abs(length(vUv) - abs(sin(time))) < 0.01 ? 1. - rand(vUv) : rand(vUv);
      c = d < 0.0001 && mod(time, f) < f/2. ? rand(vUv)  : randTime(vUv);

      gl_FragColor = vec4(vec3(c), 1.0);
    }
  `,
  uniforms: {
    posScale: new THREE.Uniform(0),
    striations: new THREE.Uniform(0),
    time: new THREE.Uniform(0),
    height: new THREE.Uniform(0),
  },
};

const Scene = React.memo(function Scene() {
  // const { posScale, striations, height } = useControls({
  //   posScale: { value: 30, min: 0, max: 60 },
  //   striations: { value: 30, min: 0, max: 50 },
  //   height: { value: 30, min: 0, max: 200 },
  // });
  useFrame(({ clock }) => {
    Shader.uniforms.time.value = clock.elapsedTime;
  });
  // const gl = useThree((t) => t.gl);
  // React.useEffect(() => {
  //   gl.setPixelRatio(0.1);
  // }, [gl]);

  return (
    <>
      <mesh>
        <planeGeometry args={[400 / 2, 300 / 2]} />
        <shaderMaterial args={[Shader]} />
      </mesh>
    </>
  );
});

export default function Fifteen() {
  return (
    <Page>
      <FiberScene camera={{ position: [0, 0, 100], far: 10000 }}>
        <Scene />
      </FiberScene>
    </Page>
  );
}
