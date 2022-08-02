import defaultForwardUV from './defaultForwardUV.vert';
import fragmentShader from './marble.frag';

const MarbleShader = {
  vertexShader: defaultForwardUV,
  fragmentShader,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    G: { value: 2 ** -0.707 },
  },
};

export default MarbleShader;
