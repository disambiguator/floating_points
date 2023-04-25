import fbmVert from './defaultForwardUV.vert';
import fbmFrag from './fbm.frag';

const FbmShader = () => ({
  vertexShader: fbmVert,
  fragmentShader: fbmFrag,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.0 },
    G: { value: 2 ** -0.707 },
  },
});

export default FbmShader;
