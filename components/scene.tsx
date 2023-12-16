import { OrbitControls } from '@react-three/drei';
import { Canvas, type Props, useThree } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { useMemo } from 'react';

export const FiberScene = ({
  controls,
  children,
  gl,
  ...rest
}: Props & { controls?: boolean }) => {
  const router = useRouter();
  const debug = useMemo(() => !!router.query['debug'], [router]);

  const canvasProps: Omit<Props, 'children'> = {
    ...rest,
    gl: {
      localClippingEnabled: true,
      // pixelRatio: 0.001,
      ...gl,
    },
  };

  return (
    <Canvas {...canvasProps}>
      {controls && <OrbitControls makeDefault />}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
