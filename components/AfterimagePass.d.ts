import { ShaderMaterial, WebGLRenderTarget } from 'three';
import { IUniform } from 'three/renderers/shaders/UniformsLib';

import { Pass } from './Pass';

export class AfterimagePass<
  T extends { uniforms: Record<string, IUniform> }
> extends Pass {
  constructor(shader: T);
  shader: T;
  uniforms: T['uniforms'];
  textureComp: WebGLRenderTarget;
  textureOld: WebGLRenderTarget;
  shaderMaterial: ShaderMaterial;
  compFsQuad: unknown;
  copyFsQuad: unknown;
}
