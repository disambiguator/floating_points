import { Effects } from '@react-three/drei';
import { extend, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AfterimagePass, type ShaderPass } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

extend({ AfterimagePass });

const Text = ({ children }: { children: any }) => {
  return <div style={{ padding: '20px' }}> {children} </div>;
};

const ValentineShader = {
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
  uniform sampler2D video;
  in vec2 vUv;
  const float a = 0.09;

  float heart(in vec2 p) {
    p.y -= 0.35;
    float a = atan(p.x,p.y)/3.141593;
    float r = length(p);
    float h = abs(a);
    float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);

    return d - r;
  }

  vec4 loomer(vec2 p) {
    vec3 texture = texture2D(video, vec2(vUv.x*aspect - (aspect - 1.)/2.,vUv.y)).xyz;
    float l = length(texture)/3.;
    vec3 c = mix(
      vec3(31., 2., 15.)/255.,
      vec3(235., 40., 127.)/255.,
      ((0.5/a) * (l-a) * 3.07 + 0.5)
    );
    return vec4(c,1.);
  }

  float circ(vec2 p, float radius) {
    return smoothstep(-0.2, 0.2, radius - length(p - 0.5));
  }

  void main()
  {
      vec2 p = vUv * 2. - 1.;
      p.x *= aspect;

      vec2 point = vec2(-1.1,0.6);
      vec4 stripe = vec4((circ(p - point, 1.8) - circ(p - point, 1.3)) * vec3(204., 0., 37.)/255.*0.8,1.0);

      gl_FragColor = heart(p*0.7) > 0.
      ? loomer(p) + stripe
      : vec4(
        vec3(204., 0., 37.)/255. * heart(
          p*.3
            // *(1. + sin(time))
            ),1.);
  }
 `,
  uniforms: {
    aspect: { value: 0.0 },
    video: {
      value: new THREE.DataTexture(new Uint8Array([0]), 0, 1, THREE.RedFormat),
    },
  },
};

const Quad = () => {
  const ref = useRef<ShaderPass>(null);
  const aspect = useThree((t) => t.viewport.aspect);
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
        // eslint-disable-next-line no-console
        console.error(`An error occured! ${err}`);
      });
  }, [video]);

  return (
    <Effects disableRenderPass>
      <shaderPass
        ref={ref}
        attachArray="passes"
        args={[ValentineShader]}
        uniforms-video-value={new THREE.VideoTexture(video)}
        uniforms-aspect-value={aspect}
      />
      <afterimagePass attachArray="passes" args={[0.98]} />
    </Effects>
  );
};

export default function ShaderPage() {
  return (
    <Page>
      <video
        id="webcam"
        style={{ display: 'none' }}
        autoPlay
        playsInline
      ></video>
      <FiberScene>
        <Quad />
      </FiberScene>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          fontFamily: 'Futura',
          fontWeight: 'bold',
          textShadow: '0px 0 20px rgba(255,0,0,0.7)',
          fontSize: 40,
          color: 'rgb(120, 52, 56)',
        }}
      >
        <Text>a valentine</Text>
        <Text>love paras + daniella</Text>
      </div>
    </Page>
  );
}
