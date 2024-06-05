const float MINIMUM_HIT_DISTANCE = 0.001;

vec3 calculate_normal(vec3 p, vec3 ro, vec3 rd) {
  const vec3 small_step = vec3(0.001, 0.0, 0.0);

  float gradient_x =
    map_the_world(p + small_step.xyy, ro, rd).dist -
    map_the_world(p - small_step.xyy, ro, rd).dist;
  float gradient_y =
    map_the_world(p + small_step.yxy, ro, rd).dist -
    map_the_world(p - small_step.yxy, ro, rd).dist;
  float gradient_z =
    map_the_world(p + small_step.yyx, ro, rd).dist -
    map_the_world(p - small_step.yyx, ro, rd).dist;

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float w) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 256 && t < maxt; i++) {
    float h = map_the_world(ro + t * rd, ro, rd).dist;
    res = min(res, h / (w * t));
    t += clamp(h, 0.005, 0.5);
    if (res < -1.0 || t > maxt) break;
  }
  res = max(res, -1.0);
  return 0.25 * (1.0 + res) * (1.0 + res) * (2.0 - res);
}

// vec3 get_color2(vec3 ro, vec3 current_position, vec3 rd) {
//   vec3 normal = calculate_normal(current_position, rd);
//   // vec3 light_position = vec3(2.0, -5.0, 3.0);
//   vec3 light_position = vec3(0.0);
//   vec3 direction_to_light = normalize(current_position - light_position);

//   float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

//   // float basis = length(current_position);
//   float basis =
//     (sin(current_position.x) +
//       cos(current_position.y) +
//       cos(current_position.z)) /
//     10.0;
//   // float basis = current_position.z / 10.0;
//   // vec3 color = vec3(1.0);

//   vec3 color = mod(vec3(basis * 4.0, basis * 6.0, basis * 10.0), 1.0);
//   // return color;
//   // return normal * diffuse_intensity * 2.0;
//   // return color * diffuse_intensity * 2.0;
//   // return color / distance(current_position, ro);
//   // return color * diffuse_intensity * 2.0;

//   float softShadow1 = softShadow(ro, rd, 0.02, 2.5, 1.0);
//   return color * softShadow1 * diffuse_intensity * 5.0;
// }

struct Sadsad {
  Surface surface;
  vec3 current_position;
};

Sadsad closest_surface(vec3 ro, vec3 rd, float starting_distance) {
  float total_distance_traveled = starting_distance;
  const int NUMBER_OF_STEPS = 128;
  const float MAXIMUM_TRACE_DISTANCE = 1000.0;

  for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
    vec3 current_position = ro + total_distance_traveled * rd;

    Surface surface = map_the_world(current_position, ro, rd);

    if (surface.dist < MINIMUM_HIT_DISTANCE) {
      surface.color *= min(
        1.0,
        // 100.0 / (total_distance_traveled * total_distance_traveled)
        100.0
      );
      return Sadsad(surface, current_position);
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
      break;
    }
    float backoff = 0.0;
    // backoff = 0.5;
    total_distance_traveled += surface.dist + backoff;
  }
  return Sadsad(Surface(total_distance_traveled, vec3(0.0), false), vec3(0.0));
}

vec3 ray_march(vec3 ro, vec3 rd, float starting_distance) {
  Sadsad s = closest_surface(ro, rd, starting_distance);
  Surface surface = s.surface;

  if (surface.lighting) {
    // vec3 current_position = starting_distance + ro + rd * surface.dist;
    vec3 normal = calculate_normal(s.current_position, ro, rd);
    vec3 direction_to_light = normalize(s.current_position);

    float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

    float shadows = 1.0;
    // shadows = softShadow(ro, rd, 0.02, 2.5, 1.0);

    return surface.color * diffuse_intensity * shadows;
  }

  return surface.color;
}

#pragma glslify: export(ray_march)
