  #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

  vec3 distortFunct(vec3 transformed) {
    transformed.z += snoise3(vec3(transformed.xy/100., time)) * depth;
    return transformed;
  }

  vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
  }

  vec3 distortNormal(vec3 position, vec3 distortedPosition, vec3 normal) {
    vec3 nearby1 = vec3(position.x + 0.1, position.yz);
    vec3 nearby2 = vec3(position.x, position.y + 0.1, position.z);
    vec3 distorted1 = distortFunct(nearby1);
    vec3 distorted2 = distortFunct(nearby2);
    return normalize(cross(distorted1 - distortedPosition, distorted2 - distortedPosition));
  }
