import { WebGLRenderTarget, ShaderMaterial } from 'three';

import { Pass } from './Pass';

export class AfterimagePass extends Pass {
  constructor(shader: object);
  shader: object;
  uniforms: object;
  textureComp: WebGLRenderTarget;
  textureOld: WebGLRenderTarget;
  shaderMaterial: ShaderMaterial;
  compFsQuad: object;
  copyFsQuad: object;
}
