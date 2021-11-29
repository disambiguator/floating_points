import { useControls } from 'leva';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Config } from '../lib/store';

const WebcamShader = {
  vertexShader: /* glsl */ `
  varying vec4 vColor;
    uniform sampler2D camera;
    uniform float depth;



    vec3 rgb2hsv(vec3 c)
    {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    void main() {
    vColor = texture2D(camera, uv);

    vec3 transformed = position;
    transformed.z += rgb2hsv(vColor.rgb).b * depth;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(transformed,1.0);
    }
`,

  fragmentShader: /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;
uniform sampler2D camera;

void main()
{
    gl_FragColor = vColor;
}
    `,

  uniforms: {
    depth: { value: 0.0 },
    camera: {
      value: new THREE.DataTexture(new Uint8Array([0]), 0, 1, THREE.RedFormat),
    },
  },
};

const Webcam = React.memo(function Shader() {
  const ref = useRef<THREE.ShaderMaterial>();
  const { depth } = useControls({ depth: { value: 30, min: 0, max: 500 } });
  const video: HTMLVideoElement = document.getElementById(
    'webcam',
  ) as HTMLVideoElement;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        console.log('An error occured! ' + err);
      });
  }, [video]);

  return (
    <mesh>
      <planeGeometry args={[1280, 720, 1280, 720]} />
      <shaderMaterial
        ref={ref}
        args={[WebcamShader]}
        uniforms-camera-value={new THREE.VideoTexture(video!)}
        uniforms-depth-value={depth}
      />
    </mesh>
  );
});

export const webcamConfig: Config = {
  name: 'webcam',
  Contents: Webcam,
  params: {},
};
