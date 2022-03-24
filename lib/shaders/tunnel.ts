import glsl from 'glslify';
import * as THREE from 'three';

const TunnelShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
    trailNoiseAmplitude: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) },
    aspect: { value: 0 },
    numSides: { value: 0 },
    bitcrush: { value: 0 },
    zoomDamp: { value: 0.96 },
    zoom: { value: 0.01 },
    resolution: { value: new THREE.Vector2(0, 0) },
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

      #pragma glslify: kaleidoscope = require(./kaleidoscope.glsl)
      #pragma glslify: zoomFun = require(./zoom.glsl)
      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
      #pragma glslify: blend = require(glsl-blend/all)

      vec4 colorBlend(in vec4 colorNew, in vec4 colorOld) {
        if(colorNew.a > 0.99) return colorNew;

        // See all blend modes: https://github.com/jamieowen/glsl-blend/blob/master/modes.js
        // LIGHTEN = 11
        // NEGATION = 16
        vec3 color = blend(11, colorOld.rgb, colorNew.rgb);

        // Modulus mixing, gets cool ink splatter effects
        //color = mod(colorNew + colorOld, 1.0);


        // Creat flashing effects but a bit rough
        // color = vec4(blendDifference(colorOld.rgb, colorNew.rgb, 1.0), 1.0);

        return vec4(color,1.0);
      }

      void main() {
        vec2 coord = vUv;

        if(bitcrush > 0.0) {
          vec2 dxy = bitcrush / resolution;
          coord = dxy * floor( vUv / dxy );
        }

        // Shift to -1 to 1 coordinate system
        coord = coord * 2. - 1.;
        coord.x *= aspect;

        if(numSides > 0.0) {
          coord = kaleidoscope(coord, numSides);
        }

        // Zoom multiplier
        if(zoom > 0.0) {
          coord = zoomFun(coord, zoomDamp, zoom);
        }

        // Rotate defined angle
        vec2 rotation = vec2(sin(angle), cos(angle));
        coord.x = coord.x * rotation.y + coord.y * rotation.x;
        coord.y = coord.y * rotation.y - coord.x * rotation.x;

        // tunnel and zoom
        float scale = 0.05;
        coord.y=(coord.y - mouse.y) * (1. + scale * yspeed) + mouse.y;
        coord.x=(coord.x - mouse.x) * (1. + scale * xspeed) + mouse.x;

        // Get old frame (in 0 to 1 coordinate system)
        coord.x /= aspect;
        coord = (coord + 1.)/2.;

        if(trailNoiseAmplitude > 0. && trailNoiseFrequency > 0.) {
          coord += trailNoiseAmplitude * vec2(
            snoise3(trailNoiseFrequency * vec3(coord.x * aspect, coord.y, 1234. + time/10.)),
            snoise3(trailNoiseFrequency * vec3(coord.x * aspect, coord.y, time/10.))
          );
        }

        vec4 texelNew = texture2D(tNew, coord);
        vec4 texelOld = texture2D(tOld, coord) - (1. - damp);

        gl_FragColor = colorBlend(texelNew, texelOld);
      }
    `,
};

export default TunnelShader;
