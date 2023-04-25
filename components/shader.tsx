import { useThree } from '@react-three/fiber';
import React from 'react';

const Shader = React.memo(function Shader({
  children,
}: {
  children: React.ReactNode;
}) {
  const size = useThree((t) => t.size);

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      {children}
    </mesh>
  );
});

export default Shader;
