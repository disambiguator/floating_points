import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef, useState } from 'react';
import type { Line2 } from 'three-stdlib';
import { FiberScene } from 'components/scene';
import Page from '../../components/page';

const width = 30;
const pointsPerRow = 30;
const height = 50;
const noise = makeNoise2D(123);

const Eclipse = React.memo(function Shader() {
  const lineRef = useRef<Line2>(null);
  const [points, setPoints] = useState<[number, number, number][]>([]);
  const [index, setIndex] = useState(0);

  useFrame(() => {
    const line = lineRef.current;
    if (!line) return;
    const i = points.length;
    if (points.length < pointsPerRow * pointsPerRow) {
      const row = Math.floor(i / pointsPerRow);
      const forward = row % 2 === 0;
      const x = forward ? i % pointsPerRow : pointsPerRow - (i % pointsPerRow);
      const y = ((noise(x / 8, row / 8) + 1) * 20) / 2;
      const newPoint: [number, number, number] = [
        x,
        y,
        (row * width) / pointsPerRow,
      ];
      setPoints([...points, newPoint]);
      setIndex(i);
    } else {
      setIndex((i) => i + 1);
    }
  });

  const transformedPoints: [number, number, number][] = useMemo(() => {
    return points.map((p, i) => {
      return [p[0], Math.max(p[1], height - (10 * (index - i)) / height), p[2]];
    });
  }, [points, index]);

  return (
    <>
      <group
        position={[-width / 2, 0, -width / 2]}
        scale={width / pointsPerRow}
      >
        <Line
          ref={lineRef}
          points={points.length > 0 ? transformedPoints : [[0, 0, 0]]}
          // @ts-expect-error - not sure what is happening. Hopefully fixed in newer Drei
          color={'purple'}
          lineWidth={3}
          alphaWrite={undefined} // IDK why i need this
        />
      </group>
    </>
  );
});

export default function ShaderPage() {
  return (
    <Page>
      <FiberScene controls camera={{ position: [-15, 30, 15] }}>
        <Eclipse />
      </FiberScene>
    </Page>
  );
}
