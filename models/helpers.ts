import { forwardRef } from 'react';
import * as THREE from 'three';

export const forwardModelRef = (
  model: Parameters<
    typeof forwardRef<
      THREE.Group<THREE.Object3DEventMap>,
      JSX.IntrinsicElements['group']
    >
  >[0],
) =>
  forwardRef<
    THREE.Group<THREE.Object3DEventMap>,
    JSX.IntrinsicElements['group']
  >(model);
