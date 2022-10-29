import { Color } from 'three';
import defaultForwardUV from './defaultForwardUV.vert';
import fragmentShader from './marble.frag';

const MarbleShader = {
  vertexShader: defaultForwardUV,
  fragmentShader,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    G: { value: 2 ** -0.707 },
    primaryColor: {
      value: new Color(151.0 / 255.0, 122.0 / 255.0, 182.0 / 255.0),
    },
    secondaryColor: {
      value: new Color(213.0 / 255.0, 222.0 / 255.0, 164.0 / 255.0),
    },
  },
};

export default MarbleShader;
