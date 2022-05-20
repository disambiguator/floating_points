import { Hydra } from 'hydra-ts';
import { useEffect, useMemo } from 'react';
import REGL from 'regl';

export default function useHydra() {
  const regl = useMemo(() => REGL(), []);
  const hydra = useMemo(
    () =>
      new Hydra({
        height: window.innerHeight,
        width: window.innerWidth,
        regl,
      }),
    [regl],
  );
  useEffect(() => {
    return () => {
      regl.destroy();
    };
  }, [regl]);
  return hydra;
}
