"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type InstanceItem = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

function Instances({
  items,
  color,
  geometry,
  metalness = 0.04,
  roughness = 0.88,
  vertexColors = false,
}: {
  items: InstanceItem[];
  color: string;
  geometry: "box" | "cylinder" | "foliage";
  metalness?: number;
  roughness?: number;
  vertexColors?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    items.forEach((item, index) => {
      helper.position.set(...item.position);
      helper.rotation.set(...(item.rotation ?? [0, 0, 0]));
      helper.scale.set(...item.scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
      if (item.color) mesh.current?.setColorAt(index, new THREE.Color(item.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} raycast={() => undefined}>
      {geometry === "box" ? (
        <boxGeometry />
      ) : geometry === "cylinder" ? (
        <cylinderGeometry args={[1, 1, 1, 7]} />
      ) : (
        <icosahedronGeometry args={[1, 1]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={geometry === "foliage" ? "#6e2948" : undefined}
        emissiveIntensity={geometry === "foliage" ? 0.22 : 0}
        metalness={metalness}
        roughness={roughness}
        vertexColors={vertexColors}
      />
    </instancedMesh>
  );
}

function ParkBench({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.24, 0]} castShadow raycast={() => undefined}>
        <boxGeometry args={[0.76, 0.08, 0.24]} />
        <meshStandardMaterial color="#574234" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.42, -0.1]} rotation-x={-0.12} raycast={() => undefined}>
        <boxGeometry args={[0.76, 0.28, 0.06]} />
        <meshStandardMaterial color="#4f3b30" roughness={0.9} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.11, 0]} raycast={() => undefined}>
          <boxGeometry args={[0.05, 0.22, 0.16]} />
          <meshStandardMaterial color="#263138" metalness={0.6} roughness={0.46} />
        </mesh>
      ))}
    </group>
  );
}

export default function ShopifyFrontPark() {
  const waterfrontWedge = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3.2, -12.05);
    shape.lineTo(3.2, -12.05);
    shape.lineTo(3.2, -12.58);
    shape.lineTo(-3.2, -13.86);
    shape.closePath();
    return shape;
  }, []);
  const treePositions = useMemo<Vec3[]>(
    () => [
      [-2.5, 0, 4.85],
      [2.48, 0, 5.05],
      [-2.58, 0, 7.45],
      [2.55, 0, 7.65],
      [-2.42, 0, 10.15],
      [2.4, 0, 10.35],
    ],
    [],
  );
  const trunks = useMemo<InstanceItem[]>(
    () =>
      treePositions.map(([x, , z], index) => ({
        position: [x, 0.63 + (index % 2) * 0.04, z],
        scale: [0.105, 1.25 + (index % 2) * 0.08, 0.105],
      })),
    [treePositions],
  );
  const blossoms = useMemo<InstanceItem[]>(
    () =>
      treePositions.flatMap(([x, , z], treeIndex) =>
        Array.from({ length: 6 }, (_, index) => {
          const angle = (index / 6) * Math.PI * 2 + treeIndex * 0.31;
          return {
            position: [
              x + Math.cos(angle) * 0.32,
              1.42 + (index % 3) * 0.2,
              z + Math.sin(angle) * 0.32,
            ] as Vec3,
            scale: [0.43, 0.4, 0.43] as Vec3,
            color:
              index % 3 === 0
                ? "#f4aac5"
                : index % 3 === 1
                  ? "#e984ae"
                  : "#f5c2d4",
          };
        }),
      ),
    [treePositions],
  );
  const borders = useMemo<InstanceItem[]>(
    () => [
      { position: [-3.18, 0.11, 8.05], scale: [0.1, 0.18, 8.15] },
      { position: [3.18, 0.11, 8.05], scale: [0.1, 0.18, 8.15] },
      { position: [0, 0.11, 4.0], scale: [6.45, 0.18, 0.1] },
      { position: [0, 0.11, 13.22], rotation: [0, 0.197, 0], scale: [6.53, 0.18, 0.1] },
    ],
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.035, 8.05]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.4, 0.07, 8.1]} />
        <meshStandardMaterial color="#173b2b" roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.036, 0]} rotation-x={-Math.PI / 2} receiveShadow raycast={() => undefined}>
        <shapeGeometry args={[waterfrontWedge]} />
        <meshStandardMaterial color="#173b2b" roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.075, 8.05]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[0.62, 0.055, 7.65]} />
        <meshStandardMaterial color="#74797a" roughness={0.91} />
      </mesh>
      <mesh position={[0, 0.078, 7.55]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.35, 0.055, 0.58]} />
        <meshStandardMaterial color="#74797a" roughness={0.91} />
      </mesh>
      <mesh position={[0, 0.081, 7.55]} rotation-x={-Math.PI / 2} raycast={() => undefined}>
        <ringGeometry args={[0.34, 0.48, 32]} />
        <meshStandardMaterial color="#929798" roughness={0.84} />
      </mesh>

      <Instances items={borders} color="#59636a" geometry="box" roughness={0.78} />
      <Instances items={trunks} color="#50382c" geometry="cylinder" roughness={0.95} />
      <Instances
        items={blossoms}
        color="#f2a8c2"
        geometry="foliage"
        roughness={0.94}
        vertexColors
      />

      <ParkBench position={[-1.08, 0, 6.5]} rotationY={0} />
      <ParkBench position={[1.08, 0, 8.6]} rotationY={Math.PI} />
      <ParkBench position={[-1.08, 0, 10.15]} rotationY={0} />
      <ParkBench position={[1.08, 0, 5.15]} rotationY={Math.PI} />
    </group>
  );
}
