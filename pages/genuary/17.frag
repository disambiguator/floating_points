#ifdef GL_ES
precision highp float;
#endif

in vec3 color;
void main() {
  gl_FragColor = vec4(color, 1.0);
}
