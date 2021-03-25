import glsl from 'glslify';
import * as THREE from 'three';

const TunnelShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) },
    aspect: { value: 0 },
    numSides: { value: 0 },
    zoomDamp: { value: 0.96 },
    zoom: { value: 0.01 },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: glsl`
      #ifdef GL_ES
      precision highp float;
      #endif
      uniform float damp;
      uniform float zoom;
      uniform float zoomDamp;
      uniform float xspeed;
      uniform float yspeed;
      uniform float angle;
      uniform vec2 mouse;
      uniform float aspect;
      uniform float time;
      uniform float numSides;

      const float PI = 3.14159265359;

      uniform sampler2D tOld;
      uniform sampler2D tNew;

      varying vec2 vUv;

      #pragma glslify: kaleidoscope = require(./kaleidoscope.glsl)
      #pragma glslify: zoomFun = require(./zoom.glsl)

      float blendOverlay(float base, float blend) {
         return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
      }

      vec4 blendOverlay(vec4 base, vec4 blend) {
        return vec4(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b), 1.);
      }

      vec2 rotation() {
        return vec2(sin(angle), cos(angle));
      }


      vec3 blendDifference(vec3 base, vec3 blend) {
      return abs(base-blend);
  }

  vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
      return (blendDifference(base, blend) * opacity + base * (1.0 - opacity));
  }

      vec4 colorBlend(in vec4 colorNew, in vec4 colorOld) {
        vec4 color;

        color = mix(colorNew, colorOld, 0.5);

        // Modulus mixing, gets cool ink splatter effects
        //color = mod(colorNew + colorOld, 1.0);


        // Creat flashing effects but a bit rough
        // color = vec4(blendDifference(colorOld.rgb, colorNew.rgb, 1.0), 1.0);

        return color;
      }

      void main() {
        // Shift to -1 to 1 coordinate system
        vec2 coord = vUv * 2. - 1.;
        coord.x *= aspect;

        // Zoom multiplier
        if(zoom > 0.0) {
          coord = zoomFun(coord, zoomDamp, zoom);
        }

        if(numSides > 0.0) {
          coord = kaleidoscope(coord, numSides);
        }

        // Rotate defined angle
        coord.x = coord.x * rotation().y + coord.y * rotation().x;
        coord.y = coord.y * rotation().y - coord.x * rotation().x;

        // tunnel and zoom
        float scale = 0.05;
        coord.y=(coord.y - mouse.y) * (1. + scale * yspeed) + mouse.y;
        coord.x=(coord.x - mouse.x) * (1. + scale * xspeed) + mouse.x;

        // Get old frame (in 0 to 1 coordinate system)
        coord.x /= aspect;
        coord = (coord + 1.)/2.;
        vec4 texelNew = texture2D(tNew, coord);
        vec4 texelOld = texture2D(tOld, coord) - (1. - damp);

        gl_FragColor = length(texelNew) > 0. ? colorBlend(texelNew, texelOld) : texelOld;
      }
    `,
};

export default TunnelShader;
