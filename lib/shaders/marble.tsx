import defaultForwardUV from './defaultForwardUV.vert';
import marbleVert from './marble.vert';

const MarbleShader = {
  vertexShader: defaultForwardUV,
  fragmentShader: marbleVert,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    G: { value: 2 ** -0.707 },
  },
};

export default MarbleShader;
