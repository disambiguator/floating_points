import { Vector2 } from 'three';
import vertexShader from './defaultForwardUV.vert';
import fragmentShader from './tunnel.frag';

const TunnelShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
    trailNoiseAmplitude: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    mouse: { value: new Vector2(0, 0) },
    aspect: { value: 0 },
    numSides: { value: 0 },
    bitcrush: { value: 0 },
    zoom: { value: 0.01 },
    resolution: { value: new Vector2(0, 0) },
    aberration: { value: 0 },
  },
  vertexShader,
  fragmentShader,
};

export default TunnelShader;
