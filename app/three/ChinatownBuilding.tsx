"use client";

import { useTexture } from "@react-three/drei";
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
  metalness = 0.1,
  roughness = 0.72,
  vertexColors = false,
}: {
  items: BoxItem[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
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
    >
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
        vertexColors={vertexColors}
      />
    </instancedMesh>
  );
}

function ChinatownBanner() {
  const texture = useTexture("/chinatown-banner.png");

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh
      position={[2.59, 1.38, 0.38]}
      rotation-y={Math.PI / 2}
      raycast={() => undefined}
    >
      <planeGeometry args={[0.82, 1.92]} />
      <meshBasicMaterial
        map={texture}
        color="#ffffff"
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ChinatownBuilding() {
  const frontWindows = useMemo<BoxItem[]>(
    () =>
      [0.69, 1.7].flatMap((y, floor) =>
        [-1.95, -1.35, -0.75, -0.15, 0.45, 1.05, 1.65].map((x, column) => ({
          position: [x, y, 1.62] as Vec3,
          scale: [0.48, floor === 0 ? 0.72 : 0.58, 0.045] as Vec3,
          color: (floor + column) % 5 === 0 ? "#c18b55" : "#3e7488",
        })),
      ),
    [],
  );
  const sideWindows = useMemo<BoxItem[]>(
    () =>
      [0.69, 1.7].flatMap((y, floor) =>
        [-1.18, -0.56, 0.06, 0.98].map((z, column) => ({
          position: [2.535, y, z] as Vec3,
          scale: [0.045, floor === 0 ? 0.72 : 0.58, 0.48] as Vec3,
          color: (floor + column) % 4 === 0 ? "#bd8552" : "#376a7e",
        })),
      ),
    [],
  );
  const frontMullions = useMemo<BoxItem[]>(
    () =>
      [-2.23, -1.65, -1.05, -0.45, 0.15, 0.75, 1.35, 1.95].map((x) => ({
        position: [x, 1.19, 1.67] as Vec3,
        scale: [0.045, 1.93, 0.055] as Vec3,
      })),
    [],
  );
  const lintels = useMemo<BoxItem[]>(
    () => [
      ...[-1.95, -1.35, -0.75, -0.15, 0.45, 1.05, 1.65].map((x) => ({
        position: [x, 2.05, 1.66] as Vec3,
        scale: [0.54, 0.07, 0.08] as Vec3,
      })),
      ...[-1.18, -0.56, 0.06, 0.98].map((z) => ({
        position: [2.57, 2.05, z] as Vec3,
        scale: [0.08, 0.07, 0.54] as Vec3,
      })),
    ],
    [],
  );
  const brickCourses = useMemo<BoxItem[]>(
    () =>
      [0.42, 0.75, 1.08, 1.41, 1.74, 2.07].flatMap((y) => [
        { position: [-2.55, y, -0.05] as Vec3, scale: [0.025, 0.018, 3.24] as Vec3 },
        { position: [0, y, -1.68] as Vec3, scale: [5.08, 0.018, 0.025] as Vec3 },
      ]),
    [],
  );
  const awnings = useMemo<BoxItem[]>(
    () =>
      [-1.65, -0.55, 0.55, 1.65].map((x) => ({
        position: [x, 1.13, 1.92] as Vec3,
        scale: [0.92, 0.1, 0.58] as Vec3,
      })),
    [],
  );
  const canopyLights = useMemo<BoxItem[]>(
    () =>
      [-1.94, -1.38, -0.82, -0.26, 0.3, 0.86, 1.42, 1.98].map((x) => ({
        position: [x, 1.075, 2.03] as Vec3,
        scale: [0.1, 0.025, 0.06] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.2, 0.08, 4.82]} />
        <meshStandardMaterial color="#52595b" metalness={0.16} roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.18, -0.05]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.05, 2.28, 3.25]} />
        <meshStandardMaterial color="#8f4938" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.38, -0.05]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.3, 0.18, 3.48]} />
        <meshStandardMaterial color="#27343a" metalness={0.42} roughness={0.52} />
      </mesh>

      <Boxes
        items={frontWindows}
        color="#ffffff"
        emissive="#b87743"
        emissiveIntensity={0.19}
        metalness={0.48}
        roughness={0.24}
        vertexColors
      />
      <Boxes
        items={sideWindows}
        color="#ffffff"
        emissive="#aa7047"
        emissiveIntensity={0.16}
        metalness={0.48}
        roughness={0.24}
        vertexColors
      />
      <Boxes items={frontMullions} color="#27373e" metalness={0.7} roughness={0.35} />
      <Boxes items={lintels} color="#b8a48d" roughness={0.82} />
      <Boxes items={brickCourses} color="#70362b" roughness={0.92} />
      <Boxes items={awnings} color="#174f78" metalness={0.32} roughness={0.5} />
      <Boxes
        items={canopyLights}
        color="#f0d19a"
        emissive="#eebf68"
        emissiveIntensity={0.52}
        roughness={0.28}
      />

      <ChinatownBanner />

      <Boxes
        items={[
          { position: [-1.7, 0.16, 2.05], scale: [0.52, 0.24, 0.42] },
          { position: [1.68, 0.16, 2.05], scale: [0.52, 0.24, 0.42] },
        ]}
        color="#343f42"
        metalness={0.22}
        roughness={0.72}
      />
      <Boxes
        items={[
          { position: [-1.7, 0.43, 2.05], scale: [0.4, 0.36, 0.34], color: "#214933" },
          { position: [1.68, 0.43, 2.05], scale: [0.4, 0.36, 0.34], color: "#1f4531" },
        ]}
        color="#ffffff"
        roughness={0.92}
        vertexColors
      />

      <Boxes
        items={[
          { position: [-1.4, 2.59, -0.58], scale: [0.55, 0.24, 0.62] },
          { position: [0.15, 2.58, -0.7], scale: [0.72, 0.22, 0.54] },
          { position: [1.5, 2.58, -0.55], scale: [0.45, 0.2, 0.48] },
        ]}
        color="#44535a"
        metalness={0.36}
        roughness={0.62}
      />
    </group>
  );
}
