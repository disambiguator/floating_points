vec2 zoomFunc(vec2 coord, float damp, float zoom) {
  if (coord.x > 0.0) {
    coord.x = coord.x - zoom;
  }
  if (coord.x < 0.0) {
    coord.x = coord.x + zoom;
  }
  if (coord.y > 0.0) {
    coord.y = coord.y - zoom;
  }
  if (coord.y < 0.0) {
    coord.y = coord.y + zoom;
  }

  return coord;
}

#pragma glslify: export(zoomFunc)
