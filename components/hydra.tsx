import { useControls } from 'leva';
import { useEffect } from 'react';
import { useRefState } from 'lib/hooks';
import useHydra from 'lib/hydra';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generators } = require('hydra-ts');

export default function HydraApp() {
  const [frequency, setFrequency] = useRefState(4);
  const [scale, setScale] = useRefState(4);
  const [color, setColor] = useRefState({ r: 248, g: 214, b: 40 });
  const [color2, setColor2] = useRefState({ r: 48, g: 11, b: 140 });
  useControls({
    color: { value: { r: 248, g: 214, b: 40 }, onChange: setColor },
    color2: { value: { r: 28, g: 31, b: 40 }, onChange: setColor2 },
    kaleid: { value: 4, min: 0, max: 100, onChange: setFrequency },
    scale: { value: 4, min: 0, max: 100, onChange: setScale },
  });
  const hydra = useHydra();
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-unused-vars  */
    /* eslint-disable no-unused-vars */
    const { src, osc, gradient, shape, voronoi, solid, noise } = generators;
    const {
      sources: [s0, s1, s2, s3],
      outputs: [o0, o1, o2, o3],
      hush,
      loop,
      render,
    } = hydra;
    /* eslint-enable no-unused-vars */
    /* eslint-enable @typescript-eslint/no-unused-vars */

    (noise(() => scale.current) as any)
      .mult(
        solid(
          () => color.current.r / 255,
          () => color.current.g / 255,
          () => color.current.b / 255,
        ),
      )
      .add(
        noise(() => scale.current)
          .invert()
          .mult(
            solid(
              () => color2.current.r / 255,
              () => color2.current.g / 255,
              () => color2.current.b / 255,
            ),
          ),
      )
      .kaleid(() => frequency.current)
      .out(o0);

    loop.start();
    render();
  }, [frequency, color, color2, hydra, scale]);
  return null;
}
