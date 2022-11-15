#define N (4)

uniform float k, hover, time;
uniform vec2 p1, p2;
in vec2 vUv;

float cross2d(vec2 v0, vec2 v1) {
  return v0.x * v1.y - v0.y * v1.x;
}

const float PI = 3.14159265359;

// signed distance to a 2D polygon
// adapted from triangle
// https://iquilezles.org/articles/distfunctions2d
float sdPoly(vec2[N] poly, vec2 p) {
  vec2[N] e;
  vec2[N] v;
  vec2[N] pq;
  // data
  for (int i = 0; i < N; i++) {
    int i2 = int(mod(float(i + 1), float(N))); //i+1
    e[i] = poly[i2] - poly[i];
    v[i] = p - poly[i];
    pq[i] = v[i] - e[i] * clamp(dot(v[i], e[i]) / dot(e[i], e[i]), 0.0, 1.0);
  }

  //distance
  float d = dot(pq[0], pq[0]);
  for (int i = 1; i < N; i++) {
    d = min(d, dot(pq[i], pq[i]));
  }

  //winding number
  // from http://geomalgorithms.com/a03-_inclusion.html
  int wn = 0;
  for (int i = 0; i < N; i++) {
    int i2 = int(mod(float(i + 1), float(N)));
    bool cond1 = 0.0 <= v[i].y;
    bool cond2 = 0.0 > v[i2].y;
    float val3 = cross2d(e[i], v[i]); //isLeft
    wn += cond1 && cond2 && val3 > 0.0 ? 1 : 0; // have  a valid up intersect
    wn -= !cond1 && !cond2 && val3 < 0.0 ? 1 : 0; // have  a valid down intersect
  }
  float s = wn == 0 ? 1.0 : -1.0;
  return sqrt(d) * s;
}

const vec2 top = vec2(0.0, 1.0);
const vec2 center = vec2(0.0, 0.0);
const float dF = 0.01;

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

  vec2[N] poly = vec2[N](top, p1, p2, center);
  float d = sdPoly(poly, p);

  vec3 col = vec3(0.0);
  // border of cutout
  float cutoffSize = 0.08;
  col = mix(col, vec3(1.0), smoothstep(-cutoffSize - dF, -cutoffSize + dF, d));
  // border of snowflake
  col = mix(col, vec3(0.0), smoothstep(-dF, dF, d));

  //   vec3 col = vec3(1.0) - sign(d) * vec3(0.1, 0.4, 0.7);
  //   col *= 1.0 - exp(-2.0 * abs(d));
  //   col *= 0.8 + 0.2 * cos(120.0 * d);
  //   col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));

  // hover targets
  if (min(distance(p, p1), distance(p, p2)) < 0.02) {
    col = mix(col, vec3(1.0, 0.0, 0.0), smoothstep(0.0, 0.2, time));
  }

  gl_FragColor = vec4(col, 1.0);
}
