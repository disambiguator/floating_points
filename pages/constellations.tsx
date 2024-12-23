import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import { BufferGeometry } from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';

const distance = 5;

const randomUnitVector = () => {
  const v = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  );
  v.normalize();
  return v;
};

class Ray {
  origin: THREE.Vector3;
  end: THREE.Vector3;
  points: THREE.Points;
  canMove = true;

  constructor(
    origin: THREE.Vector3,
    end: THREE.Vector3,
    material: THREE.Material,
  ) {
    this.origin = origin;
    this.end = end;

    const geometry = new BufferGeometry();
    const vertices = new Float32Array(origin.toArray());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.points = new THREE.Points(geometry, material);
  }

  move() {
    const positionAttribute = this.points.geometry.attributes['position'].array;
    if (positionAttribute.length > 100) {
      this.canMove = false;
      return;
    }

    this.end.multiplyScalar(1 + distance / this.end.length());

    const newVertex = this.origin.clone().add(this.end);
    const newArray = new Float32Array(positionAttribute.length + 3);
    for (let i = 0; i < positionAttribute.length; i++) {
      newArray[i] = positionAttribute[i];
    }

    const noiseLevel = 40;
    newArray[positionAttribute.length] =
      newVertex.x + (Math.random() - 0.5) * noiseLevel;
    newArray[positionAttribute.length + 1] =
      newVertex.y + (Math.random() - 0.5) * noiseLevel;
    newArray[positionAttribute.length + 2] =
      newVertex.z + (Math.random() - 0.5) * noiseLevel;

    this.points.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(newArray, 3),
    );
    this.points.geometry.attributes['position'].needsUpdate = true;
  }
}

const Constellations = React.memo(function Constellations() {
  const t = React.useRef(0);
  const raysRef = React.useRef<Ray[]>([]);
  const { scene } = useThree();

  const material = React.useMemo(() => {
    const pointShader = {
      uniforms: {
        size: { value: 10 },
        scale: { value: 350 },
        color: { value: new THREE.Color('white') },
      },
      defines: {
        USE_SIZEATTENUATION: '',
      },
      vertexShader: THREE.ShaderLib.points.vertexShader,
      fragmentShader: `
        uniform vec3 color;
        void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            gl_FragColor = vec4(color, 2.*(0.5-ll));
        }
        `,
    };
    const m = new THREE.ShaderMaterial(pointShader);
    m.transparent = true;
    m.depthWrite = false;
    m.depthTest = true;

    return m;
  }, []);
  React.useEffect(() => {
    scene.background = new THREE.Color(8 / 255, 38 / 255, 69 / 255);
    const rays = raysRef.current;
    return () => {
      rays.forEach((ray) => {
        scene.remove(ray.points);
      });
      raysRef.current = [];
    };
  }, [scene]);

  useFrame(() => {
    const rays = raysRef.current;
    if (rays.length < 10 && t.current % 45 === 0) {
      // eslint-disable-next-line @react-three/no-new-in-loop
      const ray = new Ray(
        // eslint-disable-next-line @react-three/no-new-in-loop
        new THREE.Vector3(
          Math.random() * 200 - 100,
          Math.random() * 200 - 100,
          Math.random() * 200 - 100,
        ),
        randomUnitVector(),
        material,
      );
      scene.add(ray.points);
      rays.push(ray);
    }

    rays
      .filter((r) => r.canMove)
      .forEach((ray) => {
        ray.move();
      });

    t.current++;
  });

  return null;
});

export default function ConstellationPage() {
  return (
    <Page>
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 300], far: 10000 }}
        controls
      >
        <Constellations />
      </FiberScene>
    </Page>
  );
}
