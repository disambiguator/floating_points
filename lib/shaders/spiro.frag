#ifdef GL_ES
precision highp float;
#endif

in vec4 vPosition;
uniform bool color;
uniform float time;

void main() {
  if (color) {
    vec2 vCoords = vPosition.xy;
    vCoords /= vPosition.w;
    vCoords = vCoords * 0.5 + 0.5;
    gl_FragColor = vec4(vCoords.x, vCoords.y, vCoords.x + vCoords.y, 1.0);
  } else {
    gl_FragColor = vec4(1.0);
  }
}
