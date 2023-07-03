import vertexShader from 'lib/shaders/defaultForwardUV.vert';
import fragmentShader from './dusen.frag';

const DusenShader = () => ({
  vertexShader,
  fragmentShader,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.15 },
  },
});

export default DusenShader;
