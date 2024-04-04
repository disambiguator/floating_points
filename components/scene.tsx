import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { ReactNode, useMemo, useState } from 'react';

const increment = 0.1;

export const FiberScene = ({
  controls = true,
  children,
  gl,
  ...rest
}: Props & { controls?: ReactNode }) => {
  const router = useRouter();
  const debug = useMemo(() => !!router.query['debug'], [router]);
  const [dpr, setDpr] = useState(1.5);

  const canvasProps: Omit<Props, 'children'> = {
    ...rest,
    gl: {
      localClippingEnabled: true,
      ...gl,
    },
    dpr,
  };

  return (
    <Canvas {...canvasProps}>
      <PerformanceMonitor
        onIncline={() => {
          setDpr((d) => {
            const newDpr = Math.min(2, d + increment);
            // eslint-disable-next-line no-console
            console.log('incline', newDpr);
            return newDpr;
          });
        }}
        onDecline={() => {
          setDpr((d) => {
            const newDpr = Math.max(0.1, d - increment);
            // eslint-disable-next-line no-console
            console.log('decline', newDpr);
            return newDpr;
          });
        }}
      />
      {controls === true ? <OrbitControls makeDefault /> : controls}
      {/* {controls && <FlyControls makeDefault movementSpeed={50} />} */}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
