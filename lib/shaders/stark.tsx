import glsl from 'glslify';

const StarkShader = {
  vertexShader: /* glsl */ `
  varying vec2 vUv;

    void main() {

    vUv = uv;
    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(position,1.0);
    }
`,

  fragmentShader: glsl`
#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform float s;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)

void main()
{
    vec2 position = vUv * 2. - 1.;
    position.x *= aspect;

    float noise = snoise2(vec2(vUv.x*35., time/10.))/50.;

    float p = vUv.y+noise+time/20.;
    float d = mod(p, s);

    vec3 color = hsv2rgb(vec3((p-d)*10., 1.0, 1.0));

    gl_FragColor = vec4(color, 1.0);
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    s: { value: 0.04 },
  },
};

export default StarkShader;
