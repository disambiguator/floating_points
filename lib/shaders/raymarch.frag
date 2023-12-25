in vec2 vUV;
uniform float aspect;
uniform float time;
uniform float band;
uniform float band_center;
uniform vec3 camera_position;
uniform vec3 ta;
uniform float amp;
out vec4 o_color;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

const float MINIMUM_HIT_DISTANCE = 0.001;

float distance_from_sphere(vec3 p, vec3 c, float r) {
  float d = 8.0;

  vec3 position = mod(p + d / 2.0, d) - d / 2.0;
  vec3 center = c * 10.0;
  float radius = r * 10.0 * snoise3(p - position);
  return length(position - center) - radius;
}

float sphereSDF(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

vec3 rayPlaneIntersection(
  vec3 ray_origin,
  vec3 ray_direction,
  vec3 plane_normal,
  vec3 plane_point
) {
  float t =
    dot(plane_point - ray_origin, plane_normal) /
    dot(ray_direction, plane_normal);
  return ray_origin + t * ray_direction;
}

float perlin_field(vec3 p, vec3 rd, float z) {
  vec3 intersection = rayPlaneIntersection(
    p,
    rd,
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, z)
  );
  float noise = snoise4(vec4(intersection, time / 2.0));
  // if (noise > 0.3) {
  if (noise < 0.001) {
    return length(intersection - p);
  }
  return 1.0;
}

const float spacing = 1.0;

float perlin_sphere(vec3 p, vec3 rd, float r) {
  vec3 center = vec3(0.0, 0.0, 0.0);

  float distance = sphereSDF(p, vec3(0.0), r);

  // float band = 0.01;

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

float perlin_cavern(vec3 p) {
  float noise = snoise4(vec4(p * 2.0, time / 20.0));

  // return noise * 4.0;

  // return noise;
  return mod(noise, band);

  if (noise < band_center - band || noise > band_center + band) {
    return 0.03;
  } else {
    return 0.0;
  }
}

float map_the_world(vec3 p, vec3 rd) {
  // float displacement = snoise4(vec4(p, time)) * 0.25 * amp;
  // float sphere_0 = distance_from_sphere(p, vec3(0.0), 2.0);

  // return sphere_0 + displacement;
  // return min(sphereSDF(p, vec3(1.0), 2.0), p.y + 1.0);

  // return perlin_field(p, rd, min(1.0, ceil(p.z)));

  return perlin_cavern(p);

  // float d = length(p);

  // return min(
  //   perlin_sphere(p, rd, d - mod(d, spacing)),
  //   perlin_sphere(p, rd, d - mod(d, spacing) + spacing)
  // );

}

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

uniform float starting_distance;
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

      float softShadow = clamp(
        softShadow(current_position, direction_to_light, 0.02, 2.5),
        0.1,
        1.0
      );
      return color * softShadow * diffuse_intensity * 5.0;
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
      break;
    }
    total_distance_traveled += distance_to_closest;
  }
  return vec3(0.0);
}

#pragma glslify: cameraRay = require('glsl-camera-ray');

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  vec3 ro = camera_position;
  vec3 rd = cameraRay(ro, ta, uv, 1.0);

  // vec3 ro = vec3(0.0, 0.0, -8.0);
  // vec3 rd = vec3(uv, 1.0);

  vec3 shaded_color = ray_march(ro, rd);

  o_color = vec4(shaded_color, 1.0);
}
