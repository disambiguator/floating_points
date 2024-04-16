precision highp float;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: sphereSDF = require(./sdf/sphere.glsl)

const float MINIMUM_HIT_DISTANCE = 0.001;
const float spacing = 1.0;

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

#pragma glslify: export(map_the_world);
