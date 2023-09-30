#ifdef GL_ES
precision highp float;
#endif
uniform float damp;
uniform float zoom;
uniform float zoomDamp;
uniform float bitcrush;
uniform float aberration;
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

in vec2 vUv;

#pragma glslify: kaleidoscope = require(./kaleidoscope.glsl)
#pragma glslify: zoomFun = require(./zoom.glsl)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: blend = require(glsl-blend/all)

// Getting blending right has been hard here.
vec4 colorBlend(vec4 colorNew, vec4 colorOld) {
  // This is maybe a bad idea, but always use the newest value if the trails value
  // is all the way high. This should prevent the screen from just going white.
  if (damp == 1.0 && length(colorNew.rgb) > 0.1) return colorNew;

  // See all blend modes: https://github.com/jamieowen/glsl-blend/blob/master/modes.js
  // LIGHTEN = 11
  // NEGATION = 16
  vec3 color = blend(11, colorOld.rgb, colorNew.rgb);

  // Modulus mixing, gets cool ink splatter effects
  //color = mod(colorNew + colorOld, 1.0);

  // Creat flashing effects but a bit rough
  // color = vec4(blendDifference(colorOld.rgb, colorNew.rgb, 1.0), 1.0);

  return vec4(color, 1.0);
}

void main() {
  vec2 coord = vUv;

  if (bitcrush > 0.0) {
    vec2 dxy = bitcrush / resolution;
    coord = dxy * floor(vUv / dxy);
  }

  // Shift to -1 to 1 coordinate system
  coord = coord * 2.0 - 1.0;
  coord.x *= aspect;

  if (numSides > 0.0) {
    coord = kaleidoscope(coord, numSides);
  }

  // Zoom multiplier
  if (zoom > 0.0) {
    coord = zoomFun(coord, zoomDamp, zoom);
  }

  // Rotate defined angle
  float c = cos(angle);
  float s = sin(angle);
  vec2 center = mouse;
  mat2 rotation_matrix = mat2(c, -s, s, c);
  coord = rotation_matrix * (coord - center) + center;

  // tunnel and zoom
  float scale = 0.05;
  coord.y = (coord.y - mouse.y) * (1.0 + scale * yspeed) + mouse.y;
  coord.x = (coord.x - mouse.x) * (1.0 + scale * xspeed) + mouse.x;

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
  vec4 texelOld = texture2D(tOld, coord) - (1.0 - damp);

  if (aberration > 0.0) {
    texelNew.r = texture2D(
      tNew,
      coord + aberration * vec2(-sin(PI / 3.0), cos(PI / 3.0))
    ).r;
    texelNew.g = texture2D(
      tNew,
      coord + aberration * vec2(sin(PI / 3.0), cos(PI / 3.0))
    ).g;
    texelNew.b = texture2D(
      tNew,
      coord + aspect * aberration * vec2(0.0, -1.0)
    ).b;
  }

  gl_FragColor = colorBlend(texelNew, texelOld);
}
