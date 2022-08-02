#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform sampler2D noise;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float noise_f(vec2 pos) {
  // return snoise2(vec2(pos.x, 10.));
  return texture2D(noise, vec2(pos.x, 1.)).r;
}

void main()
{
    float t = time/10.;

    vec2 pos = vUv;
    pos.y += noise_f(pos) + t ;
    pos.x += noise_f(pos) + t * 10.;

    pos = mod(pos, 1.);

    vec3 color =
    //  pos.y > 1.
      // ? vec3(0.) :
       vec3(pos.x, pos.y, mix(pos.x,pos.y, snoise2(vec2(time, 1.))));

    // vec3 color = vec3(texture2D(noise, vUv).r);

    gl_FragColor = vec4(color, 1.0);
}
