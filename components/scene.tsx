import { OrbitControls } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { useMemo } from 'react';

export const FiberScene = ({
  controls,
  children,
  ...rest
}: Props & { controls?: boolean }) => {
  const router = useRouter();
  const debug = useMemo(() => !!router.query.debug, [router]);

  return (
    <Canvas {...rest}>
      {controls && <OrbitControls />}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
