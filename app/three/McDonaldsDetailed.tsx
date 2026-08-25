"use client";

import { useTexture } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type BoxItem = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
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

function McDonaldsSign() {
  const texture = useTexture("/mcdonalds-sign.svg");

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group>
      <mesh position={[-0.15, 1.59, 1.385]} raycast={() => undefined}>
        <boxGeometry args={[2.75, 0.63, 0.1]} />
        <meshStandardMaterial
          color="#8f161d"
          emissive="#5b080d"
          emissiveIntensity={0.18}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[-0.15, 1.59, 1.441]} raycast={() => undefined}>
        <planeGeometry args={[2.62, 0.53]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <mesh
        position={[2.285, 1.5, -0.35]}
        rotation-y={Math.PI / 2}
        raycast={() => undefined}
      >
        <planeGeometry args={[2.05, 0.62]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PoleSign() {
  const texture = useTexture("/mcdonalds-sign.svg");

  return (
    <group position={[2.45, 0, 1.85]}>
      <mesh position={[0, 0.78, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[0.045, 0.06, 1.45, 10]} />
        <meshStandardMaterial color="#687379" metalness={0.76} roughness={0.34} />
      </mesh>
      <mesh position={[0, 1.48, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.96, 0.62, 0.12]} />
        <meshStandardMaterial color="#a71820" emissive="#4d070a" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 1.48, 0.066]} raycast={() => undefined}>
        <planeGeometry args={[0.88, 0.53]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function McDonaldsDetailed() {
  const frontGlass = useMemo<BoxItem[]>(
    () =>
      [-1.7, -1.2, -0.7, 0.7, 1.2, 1.7].map((x, index) => ({
        position: [x, 0.74, 1.34] as Vec3,
        scale: [0.4, 0.82, 0.045] as Vec3,
        color: index % 3 === 0 ? "#c58b52" : "#3d7184",
      })),
    [],
  );
  const sideGlass = useMemo<BoxItem[]>(
    () =>
      [-1.05, -0.48, 0.09, 0.66].map((z, index) => ({
        position: [2.22, 0.74, z] as Vec3,
        scale: [0.045, 0.82, 0.45] as Vec3,
        color: index === 2 ? "#c58b52" : "#37697b",
      })),
    [],
  );
  const mullions = useMemo<BoxItem[]>(
    () => [
      ...[-1.94, -1.45, -0.95, -0.45, 0.45, 0.95, 1.45, 1.94].map((x) => ({
        position: [x, 0.74, 1.39] as Vec3,
        scale: [0.045, 0.94, 0.055] as Vec3,
      })),
      ...[-1.31, -0.76, -0.2, 0.37, 0.92].map((z) => ({
        position: [2.27, 0.74, z] as Vec3,
        scale: [0.055, 0.94, 0.045] as Vec3,
      })),
    ],
    [],
  );
  const brickCourses = useMemo<BoxItem[]>(
    () =>
      [0.48, 0.76, 1.04, 1.32].flatMap((y) => [
        { position: [-2.22, y, -0.2] as Vec3, scale: [0.025, 0.018, 2.92] as Vec3 },
        { position: [0, y, -1.68] as Vec3, scale: [4.42, 0.018, 0.025] as Vec3 },
      ]),
    [],
  );
  const driveLane = useMemo<BoxItem[]>(
    () => [
      { position: [-2.63, 0.085, -0.2], scale: [0.09, 0.025, 3.75] },
      { position: [-1.55, 0.086, -2.03], scale: [2.2, 0.025, 0.09] },
      { position: [2.62, 0.086, -0.2], scale: [0.09, 0.025, 3.75] },
    ],
    [],
  );
  const canopyLights = useMemo<BoxItem[]>(
    () =>
      [-1.65, -1.05, -0.45, 0.15, 0.75, 1.35, 1.95].map((x) => ({
        position: [x, 0.42, 1.84] as Vec3,
        scale: [0.1, 0.025, 0.06] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.2, 0.08, 4.82]} />
        <meshStandardMaterial color="#343a3d" metalness={0.18} roughness={0.75} />
      </mesh>

      <mesh position={[0, 0.78, -0.2]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[4.5, 1.48, 3]} />
        <meshStandardMaterial color="#562d25" roughness={0.88} />
      </mesh>
      <mesh position={[-1.92, 1.14, 0.45]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[0.7, 2.18, 2.05]} />
        <meshStandardMaterial color="#a71921" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.54, -0.2]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[4.72, 0.16, 3.18]} />
        <meshStandardMaterial color="#2a3032" metalness={0.42} roughness={0.52} />
      </mesh>

      <Boxes
        items={frontGlass}
        color="#ffffff"
        emissive="#bb7740"
        emissiveIntensity={0.2}
        metalness={0.5}
        roughness={0.24}
        vertexColors
      />
      <Boxes
        items={sideGlass}
        color="#ffffff"
        emissive="#a36c43"
        emissiveIntensity={0.17}
        metalness={0.5}
        roughness={0.24}
        vertexColors
      />
      <Boxes items={mullions} color="#20292d" metalness={0.7} roughness={0.34} />
      <Boxes items={brickCourses} color="#7e4538" roughness={0.9} />

      <mesh position={[0, 0.4, 1.68]} raycast={() => undefined}>
        <boxGeometry args={[4.6, 0.12, 0.7]} />
        <meshStandardMaterial color="#414b4f" metalness={0.66} roughness={0.36} />
      </mesh>
      <Boxes
        items={canopyLights}
        color="#ffd174"
        emissive="#ffc451"
        emissiveIntensity={0.72}
        roughness={0.26}
      />

      <McDonaldsSign />
      <PoleSign />

      <Boxes
        items={driveLane}
        color="#e6c243"
        emissive="#9e781b"
        emissiveIntensity={0.08}
        roughness={0.68}
      />
      <Boxes
        items={[
          { position: [-2.33, 0.52, -1.55], scale: [0.1, 0.82, 0.1] },
          { position: [-2.23, 0.92, -1.55], scale: [0.62, 0.55, 0.09] },
          { position: [-2.22, 0.92, -1.495], scale: [0.48, 0.35, 0.03], color: "#203f53" },
        ]}
        color="#313b40"
        metalness={0.42}
        roughness={0.5}
        vertexColors
      />

      <Boxes
        items={[
          { position: [-0.72, 0.17, 2.05], scale: [0.52, 0.26, 0.42] },
          { position: [0.85, 0.17, 2.05], scale: [0.52, 0.26, 0.42] },
        ]}
        color="#343f42"
        metalness={0.22}
        roughness={0.7}
      />
      <Boxes
        items={[
          { position: [-0.72, 0.44, 2.05], scale: [0.42, 0.34, 0.34], color: "#224b36" },
          { position: [0.85, 0.44, 2.05], scale: [0.42, 0.34, 0.34], color: "#1e4632" },
        ]}
        color="#ffffff"
        roughness={0.9}
        vertexColors
      />
    </group>
  );
}
