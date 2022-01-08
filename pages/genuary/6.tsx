import { Cone, Sphere, Torus } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { FiberScene } from 'components/scene';
import Page from '../../components/page';

const Eye = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <Sphere args={[0.2]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere args={[0.05]} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="black" />
      </Sphere>
    </group>
  );
};

const radius = 10;

const Person = ({ timeOffset }: { timeOffset: number }) => {
  const ref = useRef<THREE.Group>();
  const mainGroupRef = useRef<THREE.Group>();
  useFrame(({ clock }) => {
    const group = ref.current!;
    const t = clock.elapsedTime - timeOffset;
    group.position.set(
      radius * Math.cos(t),
      0,
      radius * Math.cos(t) * Math.sin(t),
    );
    group.lookAt(
      radius * Math.cos(t + 0.0001),
      0,
      radius * Math.cos(t + 0.0001) * Math.sin(t + 0.0001),
    );
    mainGroupRef.current!.rotation.y += 0.003;
  });

  return (
    <group ref={mainGroupRef}>
      <group ref={ref}>
        <Sphere>
          <meshStandardMaterial color="hotpink" />
        </Sphere>
        <Eye position={[0.3, 0.3, 1]} />
        <Eye position={[-0.3, 0.3, 1]} />
        <Torus args={[0.2, 0.04, 10, 100]} position={[0, -0.2, 1]}>
          <meshStandardMaterial color="red" />
        </Torus>
        <Cone args={[undefined, 3, 20]} position={[0, -1, 0]}>
          <meshStandardMaterial color={Math.random() * 0xffffff} />
        </Cone>
      </group>
    </group>
  );
};

const Eclipse = React.memo(function Shader() {
  const [people, setPeople] = useState<React.ReactElement[]>([]);
  const timeRef = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime > 2 && timeRef.current > 30) {
      console.log('new person');
      setPeople([
        ...people,
        <Person timeOffset={clock.elapsedTime} key={people.length} />,
      ]);
      timeRef.current = 0;
    }
    timeRef.current++;
  });

  return (
    <>
      {people}
      <pointLight position={[0, 4, 5]} />
      <ambientLight />
    </>
  );
});

export default function ShaderPage() {
  return (
    <Page background="#ffd1dc">
      {/* <div style={{ height: '90vh', width: '90vh' }}> */}
      <FiberScene controls camera={{ position: [-10, 2, 0] }}>
        <Eclipse />
      </FiberScene>
      {/* </div> */}
    </Page>
  );
}
