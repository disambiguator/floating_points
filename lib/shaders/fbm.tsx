import glsl from 'glslify';

const FbmShader = {
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
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

const int numOctaves = 8;
const float H = 0.707;

float fbm( in vec2 x) //, in float H )
{
    float G = exp2(-H);
    float f = 3.0;
    float a = 1.0;
    float t = 0.0;
    float tt = time/50.0;

    for( int i=0; i<numOctaves; i++ )
    {
        t += a * (snoise3(f * vec3(x.x, x.y, tt))/2.0 + 0.3);
        f *= 2.0;
        a *= G;
    }
    return t;
}


void main()
{
    float t = time/50.0;
    vec2 position = vUv * 2. - 1.;
    position.x *= aspect;
    position.y += t;
    position /=4.0;

    vec2 q = vec2( fbm( position + vec2(0.0,0.0) ),
                   fbm( position + vec2(0.,0.) ) );
    vec2 r = vec2( fbm( position + vec2(0.0,0.0) ),
                   fbm( position + vec2(2.2,t) ) );
    vec2 s = vec2( fbm( position + vec2(0.0,0.0) ),
                   fbm( position + vec2(t,3.52) ) );


  // float aaa = fbm(position)/2. + 0.5;
  //  aaa = aaa > 0. ? 1.0 : 0.0;

    // gl_FragColor = vec4(fbm(position, 0.5), fbm(position, 0.7), fbm(position, 0.6), 0.0);
    gl_FragColor = vec4(
      vec3(fbm(position + 4.0*q)),
      // vec3(fbm(position)),
      // aaa,
      //  fbm(position + 4.0*q),
      //  fbm(position + 4.0*r),
        // fbm(position + 4.0*s),
        //  0.0,
        //  0.0,
         1.0
         );
    // gl_FragColor = vec4(vec3(fbm( position + 4.0*q )), 0.0);
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.0 },
  },
};

export default FbmShader;
