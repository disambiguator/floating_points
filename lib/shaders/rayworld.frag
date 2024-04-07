precision highp float;

in vec2 vUV;
uniform float aspect;
uniform float time;
uniform float band;
uniform float band_center;
uniform vec3 camera_position;
uniform vec3 ta;
uniform float amp;
out vec4 o_color;

uniform float starting_distance;

float sphereSDF(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

float map_the_world(vec3 p, vec3 rd) {
  float displacement = 0.0;
  // displacement = snoise4(vec4(p, time)) * 1.0;
  float sphere_0 = sphereSDF(p, vec3(0.0), 200.0);
  return sphere_0 + displacement;
}

#pragma glslify: raymarcher = require(./raymarcher.glsl, map_the_world=map_the_world, starting_distance=starting_distance, time=time)

const float spacing = 1.0;

#pragma glslify: cameraRay = require('glsl-camera-ray');

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  vec3 ro = camera_position;
  vec3 t = ta;
  t = t + camera_position;
  // t = vec3(0.0, 0.0, 0.0);
  // ro.x = sin(time) * 100.0;
  // t.x = sin(time) * 100.0;
  vec3 rd = cameraRay(ro, t, uv, 1.0);
  vec3 shaded_color = raymarcher(ro, rd);
  o_color = vec4(shaded_color, 1.0);
}
