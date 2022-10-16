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
vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

vec4 colorBlend(vec4 colorNew, vec4 colorOld) {
  // color = mix(colorNew, colorOld, 0.5);

  // See all blend modes: https://github.com/jamieowen/glsl-blend/blob/master/modes.js
  // LIGHTEN = 11
  // NEGATION = 16

  if (colorNew.a > 0.0) {
    if (colorNew.g > 0.0) {
      colorNew.rgb = cosPalette(
        time / 4.0,
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(1.0, 1.0, 1.0),
        vec3(0.0, 0.33, 0.67)
      );
    } else {
      colorNew.rgb = cosPalette(
        time / 4.0,
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(1.0, 1.0, 1.0),
        vec3(0.3, 0.2, 0.2)
      );
    }
    return vec4(colorNew.rgb, 1.0);
  }

  vec3 color = blend(11, colorOld.rgb, colorNew.rgb);
  // vec3 color = colorNew.rgb;

  return vec4(color, 1.0);
}

void main() {
  vec2 coord = vUv;

  // Shift to -1 to 1 coordinate system
  coord = coord * 2.0 - 1.0;
  coord.x *= aspect;

  // // Rotate defined angle
  // vec2 rotation = vec2(sin(angle), cos(angle));
  // coord.x = coord.x * rotation.y + coord.y * rotation.x;
  // coord.y = coord.y * rotation.y - coord.x * rotation.x;

  // tunnel and zoom
  float scale = 0.04;
  coord.y *= 1.0 + scale * yspeed / coord.y;
  coord.x *= 1.0 + scale * xspeed / coord.x;

  // Get old frame (in 0 to 1 coordinate system)
  coord.x /= aspect;
  coord = (coord + 1.0) / 2.0;

  if (trailNoiseAmplitude > 0.0 && trailNoiseFrequency > 0.0) {
    coord +=
      trailNoiseAmplitude *
      vec2(
        snoise3(
          trailNoiseFrequency *
            vec3(coord.x * aspect, coord.y, 1234.0 + time / 10.0)
        ),
        snoise3(
          trailNoiseFrequency * vec3(coord.x * aspect, coord.y, time / 10.0)
        )
      );
  }

  vec4 texelNew = texture2D(tNew, coord);
  vec4 texelOld = texture2D(tOld, coord);

  gl_FragColor = colorBlend(texelNew, texelOld);
}
