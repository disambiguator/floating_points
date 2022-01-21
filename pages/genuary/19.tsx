import { Effects, Text } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import glsl from 'glslify';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { AfterimagePass } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
extend({ AfterimagePass });

const TunnelShader = {
  uniforms: {
    damp: { value: 1 },
    xspeed: { value: 0.05 },
    yspeed: { value: 0.05 },
    trailNoiseAmplitude: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    aspect: { value: 0 },
    resolution: { value: new THREE.Vector2(0, 0) },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: glsl`
      #ifdef GL_ES
      precision highp float;
      #endif
      uniform float damp;
      uniform float zoom;
      uniform float zoomDamp;
      uniform float bitcrush;
      uniform float xspeed;
      uniform float yspeed;
      uniform float trailNoiseFrequency;
      uniform float trailNoiseAmplitude;
      uniform float angle;
      uniform vec2 mouse;
      uniform vec2 resolution;
      uniform float aspect;
      uniform float time;
      uniform float numSides;

      const float PI = 3.14159265359;

      uniform sampler2D tOld;
      uniform sampler2D tNew;

      varying vec2 vUv;

      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
      #pragma glslify: blend = require(glsl-blend/all)

// http://www.iquilezles.org/www/articles/palettes/palettes.htm
  // As t runs from 0 to 1 (our normalized palette index or domain),
  //the cosine oscilates c times with a phase of d.
  //The result is scaled and biased by a and b to meet the desired constrast and brightness.
  vec3 cosPalette( float t, vec3 a, vec3 b, vec3 c, vec3 d )
  {
      return a + b*cos( 6.28318*(c*t+d) );
  }

      vec4 colorBlend(in vec4 colorNew, in vec4 colorOld) {
        // color = mix(colorNew, colorOld, 0.5);

        // See all blend modes: https://github.com/jamieowen/glsl-blend/blob/master/modes.js
        // LIGHTEN = 11
        // NEGATION = 16

        if(colorNew.a > 0.0) {
          if(colorNew.g > 0.) {
            colorNew.rgb = cosPalette(time/4.,vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.33,0.67));
          } else {
            colorNew.rgb = cosPalette(time/4.,vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.3,0.20,0.20));
          }
          return vec4(colorNew.rgb,1.);
        }

        vec3 color = blend(11, colorOld.rgb, colorNew.rgb);
        // vec3 color = colorNew.rgb;

        return vec4(color,1.0);
      }

      void main() {
        vec2 coord = vUv;

        // Shift to -1 to 1 coordinate system
        coord = coord * 2. - 1.;
        coord.x *= aspect;

        // // Rotate defined angle
        // vec2 rotation = vec2(sin(angle), cos(angle));
        // coord.x = coord.x * rotation.y + coord.y * rotation.x;
        // coord.y = coord.y * rotation.y - coord.x * rotation.x;

        // tunnel and zoom
        float scale = 0.04;
        coord.y *= (1. + scale * yspeed / coord.y);
        coord.x *= (1. + scale * xspeed / coord.x);

        // Get old frame (in 0 to 1 coordinate system)
        coord.x /= aspect;
        coord = (coord + 1.)/2.;

        if(trailNoiseAmplitude > 0. && trailNoiseFrequency > 0.) {
          coord += trailNoiseAmplitude * vec2(
            snoise3(trailNoiseFrequency * vec3(coord.x * aspect, coord.y, 1234. + time/10.)),
            snoise3(trailNoiseFrequency * vec3(coord.x * aspect, coord.y, time/10.))
          );
        }

        vec4 texelNew = texture2D(tNew, coord);
        vec4 texelOld = texture2D(tOld, coord);

        gl_FragColor = colorBlend(texelNew, texelOld);
      }
    `,
};

const Letter = ({ letter, angle }: { letter: string; angle: number }) => {
  const textRef = useRef<typeof Text>();

  return (
    <group rotation={[0, 0, angle]}>
      <Text
        position={[0.15, 0, 0]}
        ref={textRef}
        color={new THREE.Color(1, 0, 0)}
        outlineColor={new THREE.Color(0, 1, 0)}
        outlineWidth={0.003}
        anchorX="center"
        anchorY="middle"
      >
        {letter}
      </Text>
    </group>
  );
};

const Postprocessing = () => {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const effectsRef = useRef<AfterimagePass>();
  useFrame(({ clock }) => {
    effectsRef.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <Effects>
      <afterimagePass
        ref={effectsRef}
        attachArray="passes"
        args={[0.96, TunnelShader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-resolution-value={new THREE.Vector2(
          size.width,
          size.height,
        ).multiplyScalar(window.devicePixelRatio)}
      />
    </Effects>
  );
};

export const Shapes = React.memo(function Shapes() {
  const groupRef = useRef<THREE.Group>();
  useFrame(() => {
    groupRef.current!.rotation.z += 0.01;
  });

  const letters = 'GENUARY'.split('').map((l, i) => {
    return <Letter key={i} letter={l} angle={(-i * (2 * Math.PI)) / 7} />;
  });

  return (
    <>
      <group ref={groupRef}>{letters}</group>
      <Postprocessing />
    </>
  );
});

export default function Scene() {
  return (
    <Page background="black">
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene
          flat
          linear
          gl={{ antialias: true }}
          controls
          camera={{ far: 10000, position: [0, 0, 1] }}
        >
          <Shapes />
        </FiberScene>
      </div>
    </Page>
  );
}
