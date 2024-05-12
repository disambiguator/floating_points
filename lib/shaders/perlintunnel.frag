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

const float MINIMUM_HIT_DISTANCE = 0.001;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: worley3D = require(glsl-worley/worley3D.glsl)
#pragma glslify: plane = require(./sdf/plane.glsl)
#pragma glslify: sphere = require(./sdf/sphere.glsl)
#pragma glslify: box = require(./sdf/box.glsl)
#pragma glslify: donuts = require(./perlinsphere.frag, time=time, band=band, band_center=band_center)
// #pragma glslify: worley2x2x2 = require(glsl-worley/worley2x2x2.glsl)
// #pragma glslify: worley2D = require(glsl-worley/worley2D.glsl)
// #pragma glslify: worley2x2 = require(glsl-worley/worley2x2.glsl)

struct Surface {
  float dist;
  vec3 color;
  bool lighting;
};

// Grainy portions are really nice here
vec3 get_color(vec3 current_position) {
  float basis = 1.0;
  basis = length(current_position) / 5.0;

  vec3 color = vec3(1.0);
  // color = vec3(basis);
  color = mod(vec3(basis * 4.0, basis * 6.0, basis * 10.0), 1.0);
  // color = normal;

  return color * 2.0;
}

Surface perlin_cavern(vec3 p) {
  bool manhattanDistance = true;
  vec2 n = worley3D(p, band_center, manhattanDistance);
  //float noise = length(n);
  // float noise = abs(max(n.x, n.y)) - 0.001;
  float noise = n.x;
  //return noise;
  //float noise = snoise4(vec4(p * 2.0, time / 20.0));

  // return noise * 4.0;

  // return noise;
  float dist = mod(noise, band);
  return Surface(dist, get_color(p), true);

  // if (noise < band_center - band || noise > band_center + band) {
  //   return 0.03;
  // } else {
  //   return 0.0;
  // }
  // return max(band_center - band - noise, noise - band_center - band);

}

// float distance_from_sphere(vec3 p, vec3 c, float r) {
//   float d = 8.0;

//   vec3 position = mod(p + d / 2.0, d) - d / 2.0;
//   vec3 center = c * 10.0;
//   float radius = r * 10.0 * snoise3(p - position);
//   return length(position - center) - radius;
// }

float distance_from_sphere(vec3 p, vec3 c, float r) {
  float d = 100.0;

  vec3 position = mod(p + d / 2.0, d) - d / 2.0;
  vec3 center = c * 10.0;
  float jitter = 2.0;
  bool manhattanDistance = true;
  float radius = r * 10.0 * worley3D(p - position, jitter, manhattanDistance).y;

  return length(position - center) - radius;
}

Surface minByDistance(Surface a, Surface b) {
  if (a.dist < b.dist) {
    return a;
  }
  return b;
}

// Surface basicSpheres(vec3 p) {
//   float dist =
//     sphere(p, vec3(5.0, 5.0, 290.0), 4.0) + snoise4(vec4(p / 10.0, time)) * 5.0;
//   if (dist > MINIMUM_HIT_DISTANCE) {
//     return Surface(dist, vec3(1.0), false);
//   }

//   return Surface(sphere(mod(p, 3.0), vec3(1.5), 1.0), vec3(1.0), true);
// }

Surface map_the_world(vec3 p, vec3 ro, vec3 rd) {
  // float jitter = 2.0;
  // bool manhattanDistance = true;
  // vec2 n = worley3D(vec3(p.x, p.y, time), band_center, manhattanDistance);
  // float displacement = n.x;
  // float displacement = snoise4(vec4(p, time)) * 10.0;
  // float sphere_0 = distance_from_sphere(p, vec3(0.0), 2.0);

  // return sphere_0 + displacement;
  // return min(sphere(p, vec3(1.0), 2.0), p.y + 1.0);

  // return perlin_field(p, rd, min(1.0, ceil(p.z)));

  Surface floor_plane = Surface(
    box(p, vec3(0.0, -5.0, 0.0), vec3(1000.0, 0.01, 1000.0)),
    vec3(smoothstep(0.65, 1.0, max(mod(p.x * 5.0, 1.0), mod(p.z * 5.0, 1.0)))),
    false
  );
  Surface closest_surface = floor_plane;

  float cullingSphere = sphere(p, ro, starting_distance);
  float boundingSphereDistance = max(
    sphere(p, vec3(5.0, 5.0, 290.0), 5.0) + snoise4(vec4(p / 10.0, time)) * 5.0,
    -cullingSphere
  );
  Surface cavern;
  if (boundingSphereDistance > MINIMUM_HIT_DISTANCE) {
    cavern = Surface(boundingSphereDistance, vec3(0.0), false);
  } else {
    cavern = perlin_cavern(p);
  }
  closest_surface = minByDistance(floor_plane, cavern);

  float donutBoundingSphereDistance = max(
    sphere(p, vec3(-5.0, 5.0, 290.0), 5.0) +
      snoise4(vec4(p / 10.0, time)) * 5.0,
    -cullingSphere
  );
  Surface donutSurface;
  if (donutBoundingSphereDistance > MINIMUM_HIT_DISTANCE) {
    donutSurface = Surface(donutBoundingSphereDistance, vec3(0.0), false);
  } else {
    donutSurface = Surface(donuts(p, rd), get_color(p), true);
  }
  closest_surface = minByDistance(closest_surface, donutSurface);

  // float d = length(p);

  // return min(
  //   perlin_sphere(p, rd, d - mod(d, spacing)),
  //   perlin_sphere(p, rd, d - mod(d, spacing) + spacing)
  // );

  return closest_surface;
}

#pragma glslify: raymarcher = require(./raymarcher.glsl, map_the_world=map_the_world, time=time, Surface=Surface)

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

// float perlin_sphere(vec3 p, vec3 rd, float r) {
//   vec3 center = vec3(0.0, 0.0, 0.0);

//   float distance = sphere(p, vec3(0.0), r);

//   // float band = 0.01;

//   if (distance < MINIMUM_HIT_DISTANCE) {
//     float noise = snoise4(vec4(p, time / 20.0));
//     if (noise < band_center - band || noise > band_center + band) {
//       // if (noise > 0.00001) {
//       return spacing;
//     }
//   }

//   return distance;
//   // float noise = snoise4(vec4(intersection, time / 2.0));
//   // if (noise > 0.5) {
//   //   // if (noise < 0.001) {
//   //   return length(intersection - p);
//   // }
//   // return 1.0;
// }

#pragma glslify: cameraRay = require('glsl-camera-ray');

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  vec3 ro = camera_position;
  vec3 rd = cameraRay(ro, ro + ta, uv, 1.0);

  // vec3 ro = vec3(0.0, 0.0, -8.0);
  // vec3 rd = vec3(uv, 1.0);

  vec3 shaded_color = raymarcher(ro, rd, 0.0);

  o_color = vec4(shaded_color, 1.0);
}
