import { Box } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import { FiberScene } from 'components/scene';
import { rand, randInt } from 'lib/helpers';
import Page from '../../components/page';

const size = 25;
const axis = new THREE.Vector3(0, 1, 0);

const Electron = React.memo(function Electron({
  direction,
  position,
  remove,
}: {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  remove: () => void;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  const scene = useThree((t) => t.scene);

  const raycaster = React.useMemo(
    () => new THREE.Raycaster(undefined, undefined, 0, 1),
    [],
  );
  useFrame(() => {
    const mesh = ref.current!;
    raycaster.set(mesh.position, direction);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const angle = Math.PI / 2;
      direction.applyAxisAngle(axis, angle);
    } else {
      mesh.position.add(direction);
      if (mesh.position.length() > size) {
        remove();
      }
    }
  });

  return (
    <Box ref={ref} position={position}>
      <meshStandardMaterial color="pink" />
    </Box>
  );
});

const randomPosition = (): {
  position: THREE.Vector3;
  direction: THREE.Vector3;
} => {
  const position = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const x = randInt(4);
  if (x === 0) {
    position.set(rand(-size / 2, size / 2), 0, -size / 2);
    direction.set(0, 0, 1);
  } else if (x === 1) {
    position.set(rand(-size / 2, size / 2), 0, size / 2);
    direction.set(0, 0, -1);
  } else if (x === 2) {
    position.set(-size / 2, 0, rand(-size / 2, size / 2));
    direction.set(1, 0, 0);
  } else {
    position.set(size / 2, 0, rand(-size / 2, size / 2));
    direction.set(-1, 0, 0);
  }
  direction.divideScalar(10);
  return { position, direction };
};

const Eclipse = React.memo(function Shader() {
  const [electrons, setElectrons] = React.useState<
    {
      key: string;
      remove: () => void;
      position: THREE.Vector3;
      direction: THREE.Vector3;
    }[]
  >([]);

  const removeElectron = React.useCallback(
    (key: string) => () => {
      setElectrons((electrons) => electrons.filter((e) => e.key !== key));
    },
    [],
  );

  const newElectron = React.useCallback(() => {
    const key = String(Math.random());
    return { key, remove: removeElectron(key), ...randomPosition() };
  }, [removeElectron]);

  React.useEffect(() => {
    const initElectrons = Array(200).fill(0).map(newElectron);
    setElectrons(initElectrons);
  }, [newElectron, removeElectron]);

  // const i = React.useRef(0);
  useFrame(() => {
    // i.current++;
    // if (i.current % 10 !== 0) return;

    if (electrons.length < 200) {
      setElectrons((electrons) => [...electrons, newElectron()]);
    }
  });

  return (
    <>
      {/* <Plane
        args={[size * 2, size * 2]}
        position={[0, -10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="blue" />
      </Plane> */}
      {electrons.map(({ remove, key, position, direction }) => {
        return (
          <Electron
            key={key}
            remove={remove}
            position={position}
            direction={direction}
          />
        );
      })}
      {/* <Electron
        position={new THREE.Vector3(-size / 2, 0, 0)}
        direction={new THREE.Vector3(1, 0, 0)}
      />
      <Electron
        position={new THREE.Vector3(size / 2, 0, 0)}
        direction={new THREE.Vector3(-1, 0, 0)}
      /> */}
      <pointLight position={[-size / 2, 0, size / 2]} intensity={1000} />
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
