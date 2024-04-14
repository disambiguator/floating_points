float sphereSDF(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

#pragma glslify: export(sphereSDF);
