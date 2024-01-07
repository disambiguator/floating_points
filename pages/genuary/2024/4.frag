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

const float MINIMUM_HIT_DISTANCE = 0.001;

float sphereSDF(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

float perlin_sphere(vec3 p, vec3 rd, float r) {
  vec3 center = vec3(0.0, 0.0, 0.0);

  float distance = sphereSDF(p, vec3(0.0), r);
  if (distance < MINIMUM_HIT_DISTANCE) {
    float noise = snoise4(vec4(p + vec3(0.0, 0.0, -time * 1.0), time * 0.03));
    if (noise < band_center - band || noise > band_center + band) {
      return spacing;
    }
  }
  return distance;
}

float map_the_world(vec3 p, vec3 rd) {
  float d = length(p);

  float distance = min(
    perlin_sphere(p, rd, d - mod(d, spacing)),
    perlin_sphere(p, rd, d - mod(d, spacing) + spacing)
  );

  return distance;
}

#pragma glslify: cameraRay = require('glsl-camera-ray');

vec2 cmod(vec2 a, float b) {
  return mod(a + b / 2.0, b) - b / 2.0;
}

vec3 raymarcher(vec3 ro, vec3 rd) {
  float total_distance_traveled = starting_distance;
  const int NUMBER_OF_STEPS = 64;
  const float MAXIMUM_TRACE_DISTANCE = 1000.0;

  for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
    vec3 p = ro + total_distance_traveled * rd;

    float distance_to_closest = map_the_world(p, rd);

    if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
      float basis = p.z / 10.0;
      return mod(vec3(basis * 4.0, basis * 6.0, basis * 10.0), 1.0);

    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
      break;
    }
    total_distance_traveled += distance_to_closest;
  }
  return vec3(0.0);
}

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  uv = uv - cmod(uv, length(uv) / 7.0);
  vec3 ro = camera_position;
  vec3 rd = cameraRay(ro, ta, uv, 1.0);

  vec3 shaded_color = raymarcher(ro, rd);

  o_color = vec4(shaded_color, 1.0);
}
