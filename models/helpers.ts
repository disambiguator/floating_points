import React from 'react';
import * as THREE from 'three';

export const forwardModelRef = (
  model: Parameters<
    typeof React.forwardRef<THREE.Group, React.JSX.IntrinsicElements['group']>
  >[0],
) => React.forwardRef<THREE.Group, React.JSX.IntrinsicElements['group']>(model);
