// https://iquilezles.org/articles/distfunctions/

float sdPlane(vec3 p, vec3 normal, float height) {
  // n must be normalized
  return dot(p, normal) + height;
}

#pragma glslify: export(sdPlane)

