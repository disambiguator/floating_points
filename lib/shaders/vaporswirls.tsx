import defaultForwardUV from './defaultForwardUV.vert';
import vaporswirlsFrag from './vaporswirls.frag';

const FbmShader = {
  vertexShader: defaultForwardUV,
  fragmentShader: vaporswirlsFrag,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.0 },
  },
};

export default FbmShader;
