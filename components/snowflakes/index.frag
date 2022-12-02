#define N (10)

uniform float k, hover, time, totalTime;
uniform vec2 p1, p2, p3, p4, p5, p6, p7, p8;
in vec2 vUv;

float cross2d(vec2 v0, vec2 v1) {
  return v0.x * v1.y - v0.y * v1.x;
}

const float PI = 3.14159265359;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float PRECISION = 0.001;
const vec2 top = vec2(0.0, 1.0);
const vec2 center = vec2(0.0, 0.0);
const float dF = 0.01;

// signed distance to a 2D polygon
// adapted from triangle
// https://iquilezles.org/articles/distfunctions2d
float sdPoly(vec2[N] v, vec2 p) {
  float d = dot(p - v[0], p - v[0]);
  float s = 1.0;
  for (int i = 0, j = N - 1; i < N; j = i, i++) {
    vec2 e = v[j] - v[i];
    // vec2 e = v[j] - v[i] + 0.08 * sin(p.y * 150.0 + totalTime * 3.0);
    // e += 0.01 * sin(p.y * 150.0);
    // e += 0.03 * sin(p.x * 150.0);
    vec2 w = p - v[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= v[i].y, p.y < v[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
  }
  return s * sqrt(d);
}

float sdSphere(vec3 p, float unused) {
  vec2[N] poly = vec2[N](top, p1, p2, p3, p4, p5, p6, p7, p8, center);
  float d = sdPoly(poly, p.xy);

  float col = 0.0;
  // border of cutout
  float cutoffSize = 0.06;
  col = mix(col, 1.0, smoothstep(-cutoffSize - dF, -cutoffSize + dF, d));
  // border of snowflake
  col = mix(col, 0.0, smoothstep(-dF, dF, d));

  return col;
}

// float sdSphere(vec3 p, float r) {
//   vec3 offset = vec3(0, 0, -2);
//   return length(p - offset) - r;
// }

float rayMarch(vec3 ro, vec3 rd, float start, float end) {
  float depth = start;

  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = ro + depth * rd;
    float d = sdSphere(p, 1.0);
    depth += d;
    if (d < PRECISION || depth > end) break;
  }

  return depth;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.0005; // epsilon
  float r = 1.0; // radius of sphere
  return normalize(
    e.xyy * sdSphere(p + e.xyy, r) +
      e.yyx * sdSphere(p + e.yyx, r) +
      e.yxy * sdSphere(p + e.yxy, r) +
      e.xxx * sdSphere(p + e.xxx, r)
  );
}

// Modified kaleidoscope function
vec2 kaleidoscope(vec2 uv, float numSides) {
  float KA = PI / numSides;
  // get the angle in radians of the current coords relative to origin (i.e. center of screen)
  float angle = atan(uv.y, uv.x);
  // repeat image over evenly divided rotations around the center
  angle = mod(angle, 2.0 * KA);
  // reflect the image within each subdivision to create a tilelable appearance
  angle = abs(angle - KA);
  // This is the only change from the other version to make corners line up
  angle += PI / 2.0;
  // get the distance of the coords from the uv origin (i.e. center of the screen)
  float d = length(uv);
  // map the calculated angle to the uv coordinate system at the given distance
  return d * vec2(cos(angle), sin(angle));
}

void main() {
  // Move from 0 to 1 domain to -1 to 1 domain
  vec2 p = vUv * 2.0 - 1.0;

  if (k > 0.0) {
    p = kaleidoscope(p, 6.0);
  }

  vec3 backgroundColor = vec3(0.0);

  vec3 col = vec3(0);
  vec3 ro = vec3(0, 0, 3); // ray origin that represents camera position
  vec3 rd = normalize(vec3(p, -1)); // ray direction

  float d = rayMarch(ro, rd, MIN_DIST, MAX_DIST); // distance to sphere

  if (d > MAX_DIST) {
    col = backgroundColor; // ray didn't hit anything
  } else {
    vec3 p = ro + rd * d; // point on sphere we discovered from ray marching
    vec3 normal = calcNormal(p);
    vec3 lightPosition = vec3(2, 2, 7);
    vec3 lightDirection = normalize(lightPosition - p);

    // Calculate diffuse reflection by taking the dot product of
    // the normal and the light direction.
    float dif = clamp(dot(normal, lightDirection), 0.3, 1.0);

    // Multiply the diffuse reflection value by an orange color and add a bit
    // of the background color to the sphere to blend it more with the background.
    col = dif * vec3(1, 0.58, 0.29) + backgroundColor * 0.2;
  }

  // Output to screen
  gl_FragColor = vec4(col, 1.0);
}

