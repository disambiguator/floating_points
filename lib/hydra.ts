import { useEffect, useMemo } from 'react';
import REGL from 'regl';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Hydra } = require('hydra-ts');

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
