export const KaleidoscopeShader = {
  uniforms: {
    tDiffuse: { value: null },
    numSides: { value: 12.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
    	vUv = uv;
    	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    uniform float numSides;

    const float PI = 3.14159265359;

    const float time = 0.0;

    float KA = PI / numSides;

    vec2 smallKoleidoscope(vec2 uv) {
        // get the angle in radians of the current coords relative to origin (i.e. center of screen)
        float angle = atan (uv.y, uv.x);
        // repeat image over evenly divided rotations around the center
        angle = mod (angle, 2.0 * KA);
        // reflect the image within each subdivision to create a tilelable appearance
        angle = abs (angle - KA);
        // rotate image over time
        // angle += 0.1*time;
        // get the distance of the coords from the uv origin (i.e. center of the screen)
        float d = length(uv); 
        // map the calculated angle to the uv coordinate system at the given distance
        return d * vec2(cos(angle), sin(angle));
    }

    void main() {
      gl_FragColor = texture2D(tDiffuse, 1.0 - smallKoleidoscope(vUv - 0.5));
    }
  `,
};
