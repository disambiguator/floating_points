import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { useEffect } from 'react';
import { WebGLRendererParameters } from 'three';

const ENABLE_DPR_SCALING = false;

const useDocumentFocus = () => {
  const [focus, setFocus] = React.useState(true);
  useEffect(() => {
    const onBlur = () => {
      setFocus(false);
    };
    const onFocus = () => {
      setFocus(true);
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return focus;
};

export const FiberScene = ({
  controls = true,
  children,
  gl,
  ...rest
}: Omit<Props, 'gl'> & {
  gl?: WebGLRendererParameters;
  controls?: React.ReactNode;
}) => {
  const router = useRouter();
  const debug = React.useMemo(() => !!router.query['debug'], [router]);
  const focused = useDocumentFocus();

  const canvasProps: Omit<Props, 'children'> = {
    ...rest,
    gl: {
      localClippingEnabled: true,
      ...gl,
    },
    dpr: 0.9,
    ...(!focused ? { frameloop: 'never' } : {}),
  };

  return (
    <Canvas {...canvasProps}>
      {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ENABLE_DPR_SCALING && <AdaptiveDpr />
      }
      {controls === true ? <OrbitControls makeDefault /> : controls}
      {debug && <Perf />}
      {children}
    </Canvas>
  );
};
