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

const float spacing = 1.0;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

const float MINIMUM_HIT_DISTANCE = 0.001;

float sphereSDF(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

float perlin_sphere(vec3 p, vec3 rd, float r) {
  vec3 center = vec3(0.0, 0.0, 0.0);

  float distance = sphereSDF(p, vec3(0.0), r);

  if (distance < MINIMUM_HIT_DISTANCE) {
    float noise = snoise4(vec4(p, time / 20.0));
    if (noise < band_center - band || noise > band_center + band) {
      // if (noise > 0.00001) {
      return spacing;
    }
  }

  return distance;
  // float noise = snoise4(vec4(intersection, time / 2.0));
  // if (noise > 0.5) {
  //   // if (noise < 0.001) {
  //   return length(intersection - p);
  // }
  // return 1.0;
}

float map_the_world(vec3 p, vec3 rd) {
  float d = length(p);

  return min(
    perlin_sphere(p, rd, d - mod(d, spacing)),
    perlin_sphere(p, rd, d - mod(d, spacing) + spacing)
  );
}

#pragma glslify: raymarcher = require(./raymarcher.glsl, map_the_world=map_the_world, starting_distance=starting_distance)

#pragma glslify: cameraRay = require('glsl-camera-ray');

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  vec3 ro = camera_position;
  vec3 rd = cameraRay(ro, ta, uv, 1.0);

  vec3 shaded_color = raymarcher(ro, rd);

  o_color = vec4(shaded_color, 1.0);
}
