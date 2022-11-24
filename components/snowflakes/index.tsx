import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { minBy } from 'lodash';
import React, { useRef } from 'react';
import { Vector2 } from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import vertexShader from 'lib/shaders/defaultForwardUV.vert';
import fragmentShader from './index.frag';

// Similar to kaleidoscope glsl
const kaleid = (uv: Vector2) => {
  const KA = Math.PI / 6.0;
  // get the angle in radians of the current coords relative to origin (i.e. center of screen)
  let angle = Math.atan2(uv.y, uv.x) + 2 * Math.PI;
  // repeat image over evenly divided rotations around the center
  angle = angle % (2.0 * KA);
  // reflect the image within each subdivision to create a tilelable appearance
  angle = Math.abs(angle - KA);
  angle += Math.PI / 2.0;
  // get the distance of the coords from the uv origin (i.e. center of the screen)
  const d = uv.length();
  // map the calculated angle to the uv coordinate system at the given distance
  uv.x = Math.cos(angle);
  uv.y = Math.sin(angle);
  uv.multiplyScalar(d);

  return uv;
};

const points = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] as const;

const shader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    ...(Object.fromEntries(
      points.map((p) => [p, { value: new Vector2() }]),
    ) as Record<typeof points[number], { value: Vector2 }>),
    k: { value: true },
    hover: { value: false },
    time: { value: 0 },
    totalTime: { value: 0 },
  },
};

const Shaders = React.memo(function Shader() {
  const size = useThree((t) => t.size);
  const clock = useThree((t) => t.clock);

  const mouseDown = useRef<typeof points[number] | null>(null);
  const animate = useRef<number | null>(null);
  const ref = useRef<typeof shader>();
  const uniforms = () => ref.current!.uniforms;

  const { kaleidoscope } = useControls({
    kaleidoscope: true,
    randomize: button(() => {
      const numPoints = Math.floor(Math.random() * 8);
      points.forEach((p, i) => {
        if (i < numPoints) {
          uniforms()[p].value.set(0, 0);
        } else {
          kaleid(
            uniforms()[p].value.set(
              Math.random() * 2 - 1,
              Math.random() * 2 - 1,
            ),
          );
        }
      });
    }),
  });

  const onPointerDown = ({ uv }: ThreeEvent<PointerEvent>) => {
    if (!uv) return;

    uv.multiplyScalar(2).subScalar(1);
    kaleid(uv);

    const distances = points.map((p) => ({
      name: p,
      distance: uv.distanceTo(uniforms()[p].value),
    }));
    const m = minBy(distances, (i) => i.distance)!;
    if (m.distance < 0.05) {
      mouseDown.current = m.name;
    }
  };

  const onPointerMove = ({ uv }: ThreeEvent<PointerEvent>) => {
    if (mouseDown.current !== null && uv) {
      uv.multiplyScalar(2).subScalar(1);
      kaleid(uv);
      uniforms()[mouseDown.current].value = uv;
    }
  };

  const onPointerUp = () => {
    mouseDown.current = null;
  };

  const onPointerEnter = () => {
    uniforms().hover.value = true;
    animate.current = clock.elapsedTime;
  };

  const onPointerLeave = () => {
    uniforms().hover.value = false;
    animate.current = clock.elapsedTime;
  };

  useFrame(() => {
    uniforms().totalTime.value = clock.elapsedTime;
    if (animate.current !== null) {
      uniforms().time.value = uniforms().hover.value
        ? clock.elapsedTime - animate.current
        : 0.2 - (clock.elapsedTime - animate.current);
      if (uniforms().time.value > 1 || uniforms().time.value < 0)
        animate.current = null;
    }
  });

  // const t = useRef(1);
  // // animate many snowflakes
  // useFrame(() => {
  //   t.current++;
  //   if (t.current % 20 === 0) {
  //     t.current = 1;
  //     kaleid(
  //       uniforms().p1.value.set(Math.random() * 2 - 1, Math.random() * 2 - 1),
  //     );
  //     kaleid(
  //       uniforms().p2.value.set(Math.random() * 2 - 1, Math.random() * 2 - 1),
  //     );
  //   }
  // });

  return (
    <mesh
      position={[0, 0, -610]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-k-value={kaleidoscope}
      />
    </mesh>
  );
});

export default function ShaderPage() {
  // light blue background
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shaders />
        </FiberScene>
      </div>
    </Page>
  );
}
