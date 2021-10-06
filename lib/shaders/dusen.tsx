const DusenShader = {
  vertexShader: /* glsl */ `
  varying vec4 vColor;
  uniform float aspect;
  uniform float time;
  uniform float radius;
  uniform float depth;

  float circ(vec2 p, float radius) {
      return step(length(p - 0.5), radius);
  }

  float distanceBetween = 0.8;

  // http://www.iquilezles.org/www/articles/palettes/palettes.htm
  // As t runs from 0 to 1 (our normalized palette index or domain),
  //the cosine oscilates c times with a phase of d.
  //The result is scaled and biased by a and b to meet the desired constrast and brightness.
  vec3 cosPalette( float t, vec3 a, vec3 b, vec3 c, vec3 d )
  {
      return a + b*cos( 6.28318*(c*t+d) );
  }

  float blendOverlay(float base, float blend) {
      return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
  }

  vec3 blendOverlay(vec3 base, vec3 blend) {
      return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
  }

  vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
      return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
  }

  vec3 blendColors(vec3 c1, vec3 c2) {
      if(length(c1) == 0.) { return c2; }
      if(length(c2) == 0.) { return c1; }

      return blendOverlay(c1, c2);
  }

  vec3 shapes(vec2 pos, vec3 color) {
      pos = mod(pos, distanceBetween);
      float inCircle = circ(pos, radius);

      return color * inCircle;
  }

  void main() {

    vec2 pos = uv * 2. - 1.;
    pos.x *= aspect;

      float drift =  mod(time/5., distanceBetween);

      vec3 col = cosPalette(0.5,vec3(0.1),vec3(0.3),vec3(1),vec3(time*0.01,time*0.1,time*.2));
      vec3 col2 = cosPalette(0.3,vec3(0.4),vec3(0.5),vec3(1),vec3(time*0.1,time*0.1,time*.3));
      vec3 col3 = cosPalette(0.1,vec3(0.2),vec3(0.1),vec3(1),vec3(time*0.2,time*0.4,time*.3));
      vec3 col4 = cosPalette(0.2,vec3(0.6),vec3(0.3),vec3(1),vec3(time*0.4,time*0.2,time*.5));

      vec3 shape = shapes(vec2(pos.x + drift,                          pos.y + distanceBetween/4.), vec3(.2, .62, 1.0));
      vec3 shape2 = shapes(vec2(pos.x + distanceBetween/3. - 2.*drift, pos.y), col);
      vec3 shape3 = shapes(vec2(pos.x - drift,                         pos.y + distanceBetween/2.), col3);
      vec3 shape4 = shapes(vec2(pos.x + 2.*drift,                      pos.y + 3.*distanceBetween/4.), col2);

      vColor = vec4(blendColors(blendColors(blendColors(shape, shape2), shape3), shape4), 1.0);

      vec3 p = position;
      p.z += vColor.r * depth;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}

  `,

  fragmentShader: /* glsl */ `
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec4 vColor;

  void main()
  {
      gl_FragColor = vColor;
  }
      `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.2 },
    depth: { value: 0.2 },
  },
};

export default DusenShader;
