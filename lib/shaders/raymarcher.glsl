const float MINIMUM_HIT_DISTANCE = 0.001;

vec3 calculate_normal(vec3 p, vec3 rd) {
  const vec3 small_step = vec3(0.001, 0.0, 0.0);

  float gradient_x =
    map_the_world(p + small_step.xyy, rd) -
    map_the_world(p - small_step.xyy, rd);
  float gradient_y =
    map_the_world(p + small_step.yxy, rd) -
    map_the_world(p - small_step.yxy, rd);
  float gradient_z =
    map_the_world(p + small_step.yyx, rd) -
    map_the_world(p - small_step.yyx, rd);

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
}

float softShadow(vec3 ro, vec3 rd, float mint, float tmax) {
  float res = 1.0;
  float t = mint;

  for (int i = 0; i < 16; i++) {
    float h = map_the_world(ro + rd * t, rd);
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.02, 0.1);
    if (h < 0.001 || t > tmax) break;
  }

  return clamp(res, 0.0, 1.0);
}

vec3 ray_march(vec3 ro, vec3 rd) {
  float total_distance_traveled = starting_distance;
  const int NUMBER_OF_STEPS = 64;
  const float MAXIMUM_TRACE_DISTANCE = 1000.0;

  for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
    vec3 current_position = ro + total_distance_traveled * rd;

    float distance_to_closest = map_the_world(current_position, rd);

    if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
      vec3 normal = calculate_normal(current_position, rd);
      vec3 light_position = vec3(2.0, -5.0, 3.0);
      // vec3 light_position = vec3(0.0);
      vec3 direction_to_light = normalize(current_position - light_position);

      float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

      // float basis = length(current_position);
      float basis =
        (sin(current_position.x) +
          cos(current_position.y) +
          cos(current_position.z)) /
        10.0;
      // float basis = current_position.z / 10.0;
      // vec3 color = vec3(1.0);

      vec3 color = mod(vec3(basis * 4.0, basis * 6.0, basis * 10.0), 1.0);
      // return color;
      // return normal * diffuse_intensity * 2.0;
      // return color * diffuse_intensity * 2.0;
      // return color / distance(current_position, ro);
      // return color * diffuse_intensity * 2.0;

      float softShadow1 = clamp(
        softShadow(current_position, direction_to_light, 0.02, 2.5),
        0.1,
        1.0
      );
      return color * softShadow1 * diffuse_intensity * 5.0;
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
      break;
    }
    total_distance_traveled += distance_to_closest;
  }
  return vec3(0.0);
}

#pragma glslify: export(ray_march)
