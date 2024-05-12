float sdBox(vec3 p, vec3 center, vec3 b) {
  vec3 q = abs(p - center) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

#pragma glslify: export(sdBox)
