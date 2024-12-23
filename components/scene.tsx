import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React from 'react';

const ENABLE_DPR_SCALING = false;

export const FiberScene = ({
  controls = true,
  children,
  gl,
  ...rest
}: Props & { controls?: React.ReactNode }) => {
  const router = useRouter();
  const debug = React.useMemo(() => !!router.query['debug'], [router]);

  const canvasProps: Omit<Props, 'children'> = {
    ...rest,
    gl: {
      localClippingEnabled: true,
      ...gl,
    },
    dpr: 0.9,
  };

  return (
    <Canvas {...canvasProps}>
      {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ENABLE_DPR_SCALING && <AdaptiveDpr />
      }
      {controls === true ? <OrbitControls makeDefault /> : controls}
      {/* {controls && <FlyControls makeDefault movementSpeed={50} />} */}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
