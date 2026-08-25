"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type BoxItem = {
  position: Vec3;
  scale: Vec3;
  color?: string;
};

function Boxes({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.12,
  roughness = 0.72,
  vertexColors = false,
  fog = true,
}: {
  items: BoxItem[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  vertexColors?: boolean;
  fog?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    items.forEach((item, index) => {
      helper.position.set(...item.position);
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
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, items.length]}
      raycast={() => undefined}
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        fog={fog}
        metalness={metalness}
        roughness={roughness}
        vertexColors={vertexColors}
      />
    </instancedMesh>
  );
}

export default function UofTGreyBuildings() {
  const bodies = useMemo<BoxItem[]>(
    () => [
      { position: [-0.94, 1.87, 0.03], scale: [1.28, 3.62, 1.48], color: "#727d82" },
      { position: [0.94, 1.84, -0.03], scale: [1.2, 3.56, 1.56], color: "#899196" },
    ],
    [],
  );
  const facadePanels = useMemo<BoxItem[]>(
    () => [
      { position: [-0.94, 1.88, 0.795], scale: [1.07, 3.3, 0.07], color: "#818d91" },
      { position: [0.94, 1.85, 0.78], scale: [1, 3.23, 0.07], color: "#9aa1a4" },
    ],
    [],
  );
  const frontWindows = useMemo<BoxItem[]>(
    () =>
      [-0.94, 0.94].flatMap((x, buildingIndex) =>
        [0.66, 1.2, 1.74, 2.28, 2.82].map((y, floor) => ({
          position: [x, y, buildingIndex === 0 ? 0.838 : 0.823] as Vec3,
          scale: [buildingIndex === 0 ? 0.83 : 0.77, 0.25, 0.035] as Vec3,
          color: (buildingIndex + floor) % 4 === 0 ? "#d2a168" : "#52778a",
        })),
      ),
    [],
  );
  const windowFrames = useMemo<BoxItem[]>(
    () =>
      [-0.94, 0.94].flatMap((x, buildingIndex) =>
        [0.66, 1.2, 1.74, 2.28, 2.82].flatMap((y) => [
          {
            position: [x, y + 0.17, buildingIndex === 0 ? 0.86 : 0.845] as Vec3,
            scale: [buildingIndex === 0 ? 0.92 : 0.86, 0.045, 0.045] as Vec3,
          },
          {
            position: [x, y - 0.17, buildingIndex === 0 ? 0.86 : 0.845] as Vec3,
            scale: [buildingIndex === 0 ? 0.92 : 0.86, 0.045, 0.045] as Vec3,
          },
        ]),
      ),
    [],
  );
  const sideWindows = useMemo<BoxItem[]>(
    () =>
      [0.7, 1.25, 1.8, 2.35, 2.9].map((y, index) => ({
        position: [1.565, y, -0.02] as Vec3,
        scale: [0.035, 0.23, 1.18] as Vec3,
        color: index % 3 === 0 ? "#bd8d59" : "#476d81",
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.045, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[4.45, 0.09, 2.25]} />
        <meshStandardMaterial color="#747b7d" metalness={0.1} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.09, 0.75]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[4.3, 0.08, 0.55]} />
        <meshStandardMaterial color="#8b9090" metalness={0.08} roughness={0.9} />
      </mesh>

      <Boxes
        items={bodies}
        color="#ffffff"
        emissive="#343b3e"
        emissiveIntensity={0.34}
        metalness={0.16}
        roughness={0.76}
        vertexColors
        fog={false}
      />
      <Boxes
        items={facadePanels}
        color="#ffffff"
        emissive="#394144"
        emissiveIntensity={0.26}
        metalness={0.2}
        roughness={0.68}
        vertexColors
        fog={false}
      />
      <Boxes
        items={frontWindows}
        color="#ffffff"
        emissive="#a36a3e"
        emissiveIntensity={0.2}
        metalness={0.42}
        roughness={0.26}
        vertexColors
      />
      <Boxes items={windowFrames} color="#3b4a50" metalness={0.58} roughness={0.4} />
      <Boxes
        items={sideWindows}
        color="#ffffff"
        emissive="#94633e"
        emissiveIntensity={0.17}
        metalness={0.42}
        roughness={0.26}
        vertexColors
      />

      <Boxes
        items={[
          { position: [-0.94, 3.75, 0.03], scale: [1.46, 0.16, 1.66], color: "#626d72" },
          { position: [0.94, 3.69, -0.03], scale: [1.38, 0.16, 1.74], color: "#778186" },
          { position: [-0.94, 3.92, -0.15], scale: [0.46, 0.2, 0.42], color: "#4b5559" },
          { position: [0.94, 3.86, -0.15], scale: [0.52, 0.22, 0.46], color: "#596367" },
        ]}
        color="#ffffff"
        metalness={0.3}
        roughness={0.62}
        vertexColors
        fog={false}
      />

      <Boxes
        items={[
          { position: [-0.94, 0.46, 0.84], scale: [0.48, 0.7, 0.05], color: "#263f4a" },
          { position: [0.94, 0.45, 0.84], scale: [0.46, 0.68, 0.05], color: "#2c4752" },
        ]}
        color="#ffffff"
        emissive="#83603f"
        emissiveIntensity={0.12}
        metalness={0.38}
        roughness={0.34}
        vertexColors
      />
    </group>
  );
}
