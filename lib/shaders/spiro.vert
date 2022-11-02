#ifdef GL_ES
precision highp float;
#endif

uniform float amplitude;
uniform vec3 origin;
uniform vec3 direction;
in float displacement;

out vec4 vPosition;

float computeDistance(
  vec3 mouseOrigin,
  vec3 mouseDirection,
  vec3 vertexPosition
) {
  vec3 d = normalize(mouseDirection);
  vec3 v = vertexPosition - mouseOrigin;
  float t = dot(v, d);
  vec3 P = mouseOrigin + t * d;
  return distance(P, vertexPosition);
}

void main() {
  vec3 newPosition =
    position +
    amplitude *
      displacement *
      pow(computeDistance(origin, direction, position), 2.0) *
      direction;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  vPosition = gl_Position;
}

