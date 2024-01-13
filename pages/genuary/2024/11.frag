precision highp float;

struct Shape {
  vec2 position;
  vec2 size;
  vec3 color;
  float repeat;
  vec2 speed;
};

uniform float time;
uniform float aspect;
in vec2 vUV;
out vec4 outColor;
uniform Shape[100] shapes;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 12.233))) * 43758.5453);
}

vec4 shape(vec2 uv, Shape s) {
  uv.x = mod(uv.x + time * s.speed.x, 1.0);
  uv.y = mod(uv.y + time * s.speed.y, 1.0);

  float c = step(s.position.x, uv.x) * step(uv.x, s.position.x + s.size.x);
  float d = step(s.position.y, uv.y) * step(uv.y, s.position.y + s.size.y);
  return (c + d) * vec4(s.color, 1.0);
}

void main() {
  vec2 uv = vUV;
  uv.x *= aspect;

  uv += rand(uv) * 0.06;

  for (int i = 0; i < 80; i++) {
    vec4 color = shape(uv, shapes[i]);
    if (color.a > 0.0) {
      outColor = color;
      return;
    }
  }

  // for (int i = 20; i < 30; i++) {
  //   vec4 invert = shape(uv, shapes[i]);
  //   if (invert.a > 0.0) {
  //     color = vec4(1.0) - color;
  //     break;
  //   }
  // }

  outColor = vec4(0.8784, 0.851, 0.7804, 1.0);
}
