import { Hydra, generators } from 'hydra-ts';
import { useControls } from 'leva';
import { useEffect } from 'react';
import { useRefState } from 'lib/hooks';
import useHydra from 'lib/hydra';

const { src, osc, gradient, shape, voronoi, solid, noise } = generators;

export default function HydraApp() {
  const [frequency, setFrequency] = useRefState(4);
  const [scale, setScale] = useRefState(4);
  const [color, setColor] = useRefState({ r: 248, g: 214, b: 40 });
  const [color2, setColor2] = useRefState({ r: 48, g: 11, b: 140 });
  useControls({
    color: { value: { r: 248, g: 214, b: 40 }, onChange: setColor },
    color2: { value: { r: 248, g: 214, b: 40 }, onChange: setColor2 },
    frequency: { value: 4, min: 0, max: 100, onChange: setFrequency },
    scale: { value: 4, min: 0, max: 100, onChange: setScale },
  });
  const hydra = useHydra();
  useEffect(() => {
    const {
      sources: [s0, s1, s2, s3],
      outputs: [o0, o1, o2, o3],
      hush,
      loop,
      render,
    } = hydra;

    noise(() => scale.current)
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
      .out(o0);

    loop.start();
    render();
  }, [frequency, color, hydra, scale]);
  return null;
}
