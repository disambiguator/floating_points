import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';

const Shader = {
  vertexShader: /* glsl */ `
  varying vec2 vUv;

  void main() {

  vUv = uv;
  gl_Position = projectionMatrix *
    modelViewMatrix *
    vec4(position,1.0);
  }
`,

  fragmentShader: /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform float zoom;

varying vec2 vUv;
uniform vec2 bounds;

// http://www.iquilezles.org/www/articles/palettes/palettes.htm
// As t runs from 0 to 1 (our normalized palette index or domain),
//the cosine oscilates c times with a phase of d.
//The result is scaled and biased by a and b to meet the desired constrast and brightness.
vec3 cosPalette( float t, vec3 a, vec3 b, vec3 c, vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

vec2 mandelbrot(vec2 z, vec2 c) {
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
}

float mandelbrot(highp vec2 c) {
  float x = 0.0;
  vec2 z0 = vec2(0.0,0.0);
  for(int i=0; i < 100; ++i) {
    z0 = mandelbrot(z0, c);
  }

  return length(z0);
}


void main() {
    vec2 p = vUv * 2. - 1.;
    p.x *= aspect;
    p = p / zoom - bounds;

    float d = mandelbrot(p) * 80.;
    vec3 color = cosPalette(0.5,vec3(0.1),vec3(0.3),vec3(1),vec3(time/10.+d*0.01,d*0.1,time/20. + d*.2));;
    gl_FragColor = vec4(color, 1.0);
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.000001 },
    bounds: { value: new THREE.Vector2(0, 0) },
    zoom: { value: 1 },
  },
};

const Dusen = function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<THREE.ShaderMaterial>();
  const zoomState = useRef({
    mouse: { clientX: 0, clientY: 0 },
    zooming: false,
  });

  useFrame(({ invalidate, clock }) => {
    const { zooming, mouse } = zoomState.current;
    if (!zooming) {
      invalidate();
      return;
    }

    ref.current!.uniforms.time.value = clock.elapsedTime;
    zoom(mouse);
  });

  const onMouseMove = (e: { clientX: number; clientY: number }) => {
    zoomState.current.mouse = e;
  };

  const startZoom = () => {
    zoomState.current.zooming = true;
  };

  const stopZoom = () => {
    zoomState.current.zooming = false;
  };

  const zoom = (mouse: { clientX: number; clientY: number }) => {
    const { uniforms } = ref.current!;

    const bounds = uniforms.bounds.value as THREE.Vector2;
    const normalizedCoords = new THREE.Vector2(
      ((mouse.clientX / window.innerWidth) * 2 - 1) * viewport.aspect,
      ((window.innerHeight - mouse.clientY) / window.innerHeight) * 2 - 1,
    );

    const mandelbrotCoord = normalizedCoords
      .clone()
      .divideScalar(uniforms.zoom.value as number)
      .sub(bounds);

    uniforms.zoom.value *= 1.01;

    uniforms.bounds.value = normalizedCoords
      .divideScalar(uniforms.zoom.value as number)
      .sub(mandelbrotCoord);
  };

  return (
    <mesh
      onPointerDown={startZoom}
      onPointerUp={stopZoom}
      onPointerMove={onMouseMove}
      position={[0, 0, -215]}
    >
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[Shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
};

export default function DusenPage() {
  return (
    <Page>
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 300], far: 10000 }}
      >
        <Dusen />
      </FiberScene>
    </Page>
  );
}
