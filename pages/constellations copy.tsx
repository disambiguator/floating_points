import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import { FiberScene } from '../components/scene';
import Page from '../components/page';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { BufferGeometry } from 'three';

const distance = 1;

const randomUnitVector = () => {
  const v = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  );
  v.normalize();
  return v;
};

function linePoint(
  rayOrigin: THREE.Vector3,
  rayEnd: THREE.Vector3,
  point: THREE.Vector3,
) {
  const d1 = point.distanceTo(rayOrigin);
  const d2 = point.distanceTo(rayEnd);

  const lineLen = rayOrigin.distanceTo(rayEnd);

  const buffer = 0.01;

  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true;
  }
  return false;
}

class Ray {
  origin: THREE.Vector3;
  end: THREE.Vector3;
  // line: Line2;
  points: THREE.Points;
  canMove: boolean;

  constructor(origin: THREE.Vector3, end: THREE.Vector3) {
    this.origin = origin;
    this.end = end;

    // const geometry = new LineGeometry();
    // const material = new LineMaterial();
    // material.linewidth = 0.005;
    // material.color = new THREE.Color(219 / 255, 193 / 255, 96 / 255);
    // this.line = new Line2(geometry, material);

    const geometry = new BufferGeometry();
    const vertices = new Float32Array(origin.toArray());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.points = new THREE.Points(geometry);

    // <points material={mat} position={[0, 0, -4]}>
    //   <bufferGeometry>
    //     <bufferAttribute
    //       ref={positionAttributeRef}
    //       attachObject={['attributes', 'position']}
    //       count={MAX}
    //       array={positionsFromParticles(particles)}
    //       itemSize={3}
    //     />
    //   </bufferGeometry>
    // </points>;

    this.canMove = true;
  }

  checkMove(rays: Ray[]) {
    const newEnd = this.end
      .clone()
      .multiplyScalar(1 + distance / this.end.length());
    const v = this.origin.clone().add(newEnd);
    if (Math.abs(v.x) > 100 || Math.abs(v.y) > 100) {
      return false;
    }

    const intersections = rays.find((r: Ray) => {
      return r !== this && linePoint(r.origin, r.end, v);
    });

    return !intersections;
  }

  move() {
    this.end.multiplyScalar(1 + distance / this.end.length());

    const newVertex = this.origin.clone().add(this.end);

    const positionAttribute = this.points.geometry.attributes.position.array;
    positionAttribute << newVertex.x;
    positionAttribute << newVertex.y;
    positionAttribute << newVertex.z;

    this.points.geometry.attributes.position.needsUpdate = true;
    // this.line.geometry.setPositions([
    //   ...this.origin.toArray(),
    //   ...this.origin.clone().add(this.end).toArray(),
    // ]);
  }
}

const Constellations = React.memo(function Constellations() {
  const t = useRef(0);
  const raysRef = useRef<Ray[]>([]);
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(8 / 255, 38 / 255, 69 / 255);
    const rays = raysRef.current;
    return () => {
      rays.forEach((ray) => {
        scene.remove(ray.line);
      });
      raysRef.current = [];
    };
  }, [scene]);

  useFrame(() => {
    const rays = raysRef.current;
    if (rays.length < 10 && t.current % 30 === 0) {
      const ray = new Ray(
        new THREE.Vector3(
          Math.random() * 200 - 100,
          Math.random() * 200 - 100,
          Math.random() * 200 - 100,
        ),
        randomUnitVector(),
      );
      // scene.add(ray.line);
      scene.add(ray.points);
      rays.push(ray);
    }

    rays.forEach((ray) => {
      // if (ray.canMove && ray.checkMove(rays)) {
      ray.move();
      // } else {
      // ray.canMove = false;
      // }
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
