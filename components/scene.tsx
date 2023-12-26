import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { useMemo, useState } from 'react';

export const FiberScene = ({
  controls,
  children,
  gl,
  ...rest
}: Props & { controls?: boolean }) => {
  const router = useRouter();
  const debug = useMemo(() => !!router.query['debug'], [router]);
  const [dpr, setDpr] = useState(1.5);

  const canvasProps: Omit<Props, 'children'> = {
    ...rest,
    gl: {
      localClippingEnabled: true,
      // pixelRatio: 0.001,
      ...gl,
    },
    dpr,
  };

  return (
    <Canvas {...canvasProps}>
      <PerformanceMonitor
        onIncline={() => {
          console.log('incline');
          setDpr(2);
        }}
        onDecline={() => {
          console.log('decline');
          setDpr(1);
        }}
      />
      {controls && <OrbitControls makeDefault />}
      {/* {controls && <FlyControls makeDefault movementSpeed={50} />} */}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
