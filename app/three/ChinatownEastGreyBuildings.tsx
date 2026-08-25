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

export default function ChinatownEastGreyBuildings() {
  const bodies = useMemo<BoxItem[]>(
    () => [
      { position: [-1.5, 1.34, -0.2], scale: [1.3, 2.58, 1.36], color: "#68747a" },
      { position: [1.5, 1.48, -0.24], scale: [1.02, 2.86, 1.18], color: "#8b9397" },
    ],
    [],
  );
  const facadePanels = useMemo<BoxItem[]>(
    () => [
      { position: [-1.5, 1.35, 0.515], scale: [1.08, 2.33, 0.06], color: "#7d898e" },
      { position: [1.5, 1.49, 0.385], scale: [0.82, 2.58, 0.06], color: "#9da4a7" },
    ],
    [],
  );
  const frontWindows = useMemo<BoxItem[]>(
    () =>
      [
        { x: -1.5, z: 0.55, width: 0.82, floors: [0.63, 1.12, 1.61, 2.1] },
        { x: 1.5, z: 0.42, width: 0.62, floors: [0.67, 1.18, 1.69, 2.2, 2.57] },
      ].flatMap((building, buildingIndex) =>
        building.floors.map((y, floor) => ({
          position: [building.x, y, building.z] as Vec3,
          scale: [building.width, 0.22, 0.035] as Vec3,
          color: (buildingIndex + floor) % 4 === 0 ? "#d09b61" : "#50778a",
        })),
      ),
    [],
  );
  const horizontalBands = useMemo<BoxItem[]>(
    () => [
      ...[0.88, 1.38, 1.88, 2.38].map((y) => ({
        position: [-1.5, y, 0.575] as Vec3,
        scale: [1.16, 0.055, 0.055] as Vec3,
      })),
      ...[0.93, 1.45, 1.97, 2.49].map((y) => ({
        position: [1.5, y, 0.445] as Vec3,
        scale: [0.9, 0.055, 0.055] as Vec3,
      })),
    ],
    [],
  );
  const sideWindows = useMemo<BoxItem[]>(
    () =>
      [0.7, 1.22, 1.74, 2.26].map((y, floor) => ({
        position: [2.035, y, -0.24] as Vec3,
        scale: [0.035, 0.22, 0.84] as Vec3,
        color: floor % 3 === 0 ? "#c18e59" : "#496f82",
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.045, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.85, 0.09, 4.7]} />
        <meshStandardMaterial color="#777d7e" metalness={0.09} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.09, 1.75]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.65, 0.08, 0.72]} />
        <meshStandardMaterial color="#8c9190" metalness={0.08} roughness={0.9} />
      </mesh>

      <Boxes
        items={bodies}
        color="#ffffff"
        emissive="#30383c"
        emissiveIntensity={0.28}
        metalness={0.16}
        roughness={0.75}
        vertexColors
        fog={false}
      />
      <Boxes
        items={facadePanels}
        color="#ffffff"
        emissive="#374044"
        emissiveIntensity={0.22}
        metalness={0.2}
        roughness={0.68}
        vertexColors
        fog={false}
      />
      <Boxes
        items={frontWindows}
        color="#ffffff"
        emissive="#9f6a42"
        emissiveIntensity={0.2}
        metalness={0.43}
        roughness={0.26}
        vertexColors
      />
      <Boxes items={horizontalBands} color="#34464e" metalness={0.54} roughness={0.42} />
      <Boxes
        items={sideWindows}
        color="#ffffff"
        emissive="#90603d"
        emissiveIntensity={0.17}
        metalness={0.43}
        roughness={0.26}
        vertexColors
      />

      <Boxes
        items={[
          { position: [-1.5, 2.69, -0.2], scale: [1.48, 0.14, 1.54], color: "#58656a" },
          { position: [1.5, 2.98, -0.24], scale: [1.18, 0.14, 1.36], color: "#737d81" },
          { position: [-1.5, 2.84, -0.27], scale: [0.44, 0.18, 0.42], color: "#465156" },
          { position: [1.5, 3.13, -0.3], scale: [0.38, 0.2, 0.4], color: "#596367" },
        ]}
        color="#ffffff"
        metalness={0.3}
        roughness={0.62}
        vertexColors
        fog={false}
      />

      <Boxes
        items={[
          { position: [-1.5, 0.43, 0.57], scale: [0.46, 0.66, 0.05], color: "#263e49" },
          { position: [1.5, 0.43, 0.44], scale: [0.4, 0.66, 0.05], color: "#2d4651" },
        ]}
        color="#ffffff"
        emissive="#7f5d3e"
        emissiveIntensity={0.12}
        metalness={0.36}
        roughness={0.35}
        vertexColors
      />
    </group>
  );
}
