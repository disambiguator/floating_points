import { ShaderMaterial, WebGLRenderTarget } from 'three';

import { Pass } from './Pass';

export class AfterimagePass extends Pass {
  constructor(shader: unknown);
  shader: unknown;
  uniforms: unknown;
  textureComp: WebGLRenderTarget;
  textureOld: WebGLRenderTarget;
  shaderMaterial: ShaderMaterial;
  compFsQuad: unknown;
  copyFsQuad: unknown;
}
