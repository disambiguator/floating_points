import glsl from 'glslify';

const MarbleShader = {
  vertexShader: glsl`

  uniform float aspect;
  uniform float time;
  uniform float G;
  varying vec4 vColor;

  #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

  const int numOctaves = 2;
  const float timeScale = 100.;

  float fbm( in vec2 x) //, in float H )
  {
      float f = 3.0;
      float a = 1.0;
      float t = 0.0;
      float tt = time/timeScale;

      for( int i=0; i<numOctaves; i++ )
      {
          t += a * (snoise3(f * vec3(x.x, x.y, tt))/2.0);
          f *= 2.0;
          a *= G;
      }
      return t;
  }

    void main() {
      float t = time/timeScale;
      vec2 pos = uv * 2. - 1.;
      pos.x *= aspect;
      pos.y += t;

      float fbm_p = fbm(pos);
      vec2 q = vec2(fbm_p);
      vec3 color = fbm(pos + q) > 0. ? vec3(151./255., 122.0/255., 182./255.) : vec3(213./255., 222./255., 164./255.);

      vColor = vec4(color, 1.0);

    vec3 p = position;
    p.z += vColor.r * 100.;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
`,

  fragmentShader: glsl`
    varying vec4 vColor;

void main()
{
    gl_FragColor = vColor;
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    G: { value: Math.pow(2, -0.707) },
  },
};

export default MarbleShader;
