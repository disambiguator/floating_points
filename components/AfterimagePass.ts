/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */

import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  ShaderMaterialParameters,
  Uniform,
  UniformsUtils,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';
import { FullScreenQuad, Pass } from 'three-stdlib/postprocessing/Pass';

class AfterimagePass<T extends ShaderMaterialParameters> extends Pass {
  shader: T;
  uniforms: T['uniforms'] & {
    tOld: Uniform;
    tNew: Uniform;
  };
  textureComp: WebGLRenderTarget;
  textureOld: WebGLRenderTarget;
  shaderMaterial: ShaderMaterial;
  compFsQuad: FullScreenQuad<ShaderMaterial>;
  copyFsQuad: FullScreenQuad<MeshBasicMaterial>;
  constructor(shader: T) {
    super();

    this.shader = shader;

    this.uniforms = UniformsUtils.clone(this.shader.uniforms);

    this.textureComp = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
      },
    );

    this.textureOld = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
      },
    );

    this.shaderMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
    });

    this.compFsQuad = new FullScreenQuad(this.shaderMaterial);

    const material = new MeshBasicMaterial();
    this.copyFsQuad = new FullScreenQuad(material);
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
  ) {
    this.uniforms['tOld'].value = this.textureOld.texture;
    this.uniforms['tNew'].value = readBuffer.texture;

    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);

    this.copyFsQuad.material.map = this.textureComp.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);

      if (this.clear) renderer.clear();

      this.copyFsQuad.render(renderer);
    }

    // Swap buffers.
    const temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
    // Now textureOld contains the latest image, ready for the next frame.
  }

  setSize(width: number, height: number) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }
}

export { AfterimagePass };
