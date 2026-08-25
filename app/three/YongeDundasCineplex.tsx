"use client";

import { useTexture } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type InstanceItem = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

function BoxInstances({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.12,
  roughness = 0.7,
  vertexColors = false,
}: {
  items: InstanceItem[];
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

function CineplexLogo() {
  const texture = useTexture("/cineplex-sign.svg");

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group>
      <mesh position={[0.18, 2.34, 2.205]} raycast={() => undefined}>
        <boxGeometry args={[3.15, 0.76, 0.1]} />
        <meshStandardMaterial
          color="#0d2032"
          emissive="#132f47"
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.18, 2.34, 2.262]} raycast={() => undefined}>
        <planeGeometry args={[2.98, 0.68]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh
        position={[2.921, 2.1, 0.35]}
        rotation-y={Math.PI / 2}
        raycast={() => undefined}
      >
        <planeGeometry args={[2.35, 0.63]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function RoundedGlassCorner() {
  const panels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 6) * (Math.PI / 2);
        const radius = 0.82;
        return {
          position: [
            1.78 + Math.cos(angle) * radius,
            1.22,
            1.25 + Math.sin(angle) * radius,
          ] as Vec3,
          rotation: [0, Math.PI / 2 - angle, 0] as Vec3,
          scale: [0.42, 1.94, 0.055] as Vec3,
          color: index % 2 ? "#36758c" : "#4d8da2",
        };
      }),
    [],
  );

  const mullions = useMemo(
    () =>
      panels.map((panel) => ({
        ...panel,
        position: [panel.position[0], 1.22, panel.position[2]] as Vec3,
        scale: [0.035, 2.08, 0.09] as Vec3,
      })),
    [panels],
  );

  return (
    <group>
      <BoxInstances
        items={panels}
        color="#ffffff"
        emissive="#3c8aa5"
        emissiveIntensity={0.16}
        metalness={0.58}
        roughness={0.2}
        vertexColors
      />
      <BoxInstances
        items={mullions}
        color="#263c48"
        metalness={0.75}
        roughness={0.32}
      />
    </group>
  );
}

function StaticBillboards() {
  return (
    <group>
      <mesh position={[-1.55, 3.18, 1.86]} raycast={() => undefined}>
        <boxGeometry args={[2.05, 1.08, 0.12]} />
        <meshStandardMaterial
          color="#285d77"
          emissive="#2d85a8"
          emissiveIntensity={0.34}
          metalness={0.25}
          roughness={0.36}
        />
      </mesh>
      <mesh position={[-1.55, 3.18, 1.93]} raycast={() => undefined}>
        <planeGeometry args={[1.72, 0.82]} />
        <meshBasicMaterial color="#75c9df" toneMapped={false} />
      </mesh>
      <mesh position={[-1.55, 3.18, 1.938]} raycast={() => undefined}>
        <ringGeometry args={[0.22, 0.33, 32]} />
        <meshBasicMaterial color="#f2ba2f" toneMapped={false} />
      </mesh>

      <mesh position={[1.25, 3.13, 1.68]} rotation-y={-0.08} raycast={() => undefined}>
        <boxGeometry args={[1.45, 1.18, 0.12]} />
        <meshStandardMaterial
          color="#733c5f"
          emissive="#a54d78"
          emissiveIntensity={0.25}
          metalness={0.22}
          roughness={0.4}
        />
      </mesh>
      <BoxInstances
        items={[
          { position: [0.9, 3.36, 1.755], scale: [0.4, 0.08, 0.03] },
          { position: [1.28, 3.13, 1.755], scale: [0.65, 0.08, 0.03] },
          { position: [1.1, 2.9, 1.755], scale: [0.3, 0.08, 0.03] },
        ]}
        color="#f5c3d8"
        emissive="#dc79a7"
        emissiveIntensity={0.45}
        roughness={0.34}
      />
    </group>
  );
}

export default function YongeDundasCineplex() {
  const frontGlass = useMemo<InstanceItem[]>(
    () =>
      [0.62, 1.2, 1.76].flatMap((y, floor) =>
        [-2.32, -1.74, -1.16, -0.58, 0, 0.58, 1.16].map((x, column) => ({
          position: [x, y, 2.09] as Vec3,
          scale: [0.47, 0.42, 0.045] as Vec3,
          color: (floor + column) % 4 === 0 ? "#d79b5f" : "#356a80",
        })),
      ),
    [],
  );
  const sideGlass = useMemo<InstanceItem[]>(
    () =>
      [0.62, 1.2, 1.76].flatMap((y, floor) =>
        [-1.55, -0.93, -0.31, 0.31, 0.9].map((z, column) => ({
          position: [2.84, y, z] as Vec3,
          scale: [0.045, 0.42, 0.5] as Vec3,
          color: (floor + column) % 5 === 0 ? "#d79b5f" : "#315f73",
        })),
      ),
    [],
  );
  const frontFrames = useMemo<InstanceItem[]>(
    () =>
      [-2.62, -2.03, -1.45, -0.87, -0.29, 0.29, 0.87, 1.45].map((x) => ({
        position: [x, 1.2, 2.145] as Vec3,
        scale: [0.045, 1.86, 0.055] as Vec3,
      })),
    [],
  );
  const canopyLights = useMemo<InstanceItem[]>(
    () =>
      [-2.28, -1.52, -0.76, 0, 0.76, 1.52, 2.28].map((x) => ({
        position: [x, 0.49, 2.48] as Vec3,
        scale: [0.13, 0.035, 0.08] as Vec3,
      })),
    [],
  );
  const bollards = useMemo<InstanceItem[]>(
    () =>
      [-2.25, -1.5, -0.75, 0, 0.75, 1.5, 2.25].map((x) => ({
        position: [x, 0.2, 2.72] as Vec3,
        scale: [0.08, 0.36, 0.08] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.35, 0.08, 4.78]} />
        <meshStandardMaterial color="#545d61" metalness={0.16} roughness={0.74} />
      </mesh>
      <mesh position={[-0.12, 1.08, -0.05]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.62, 2.08, 4.1]} />
        <meshStandardMaterial color="#5f6a70" metalness={0.28} roughness={0.5} />
      </mesh>
      <mesh position={[-0.48, 2.32, -0.32]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[4.55, 0.55, 3.32]} />
        <meshStandardMaterial color="#818b8d" metalness={0.34} roughness={0.46} />
      </mesh>

      <BoxInstances
        items={frontGlass}
        color="#ffffff"
        emissive="#c78b51"
        emissiveIntensity={0.18}
        metalness={0.48}
        roughness={0.23}
        vertexColors
      />
      <BoxInstances
        items={sideGlass}
        color="#ffffff"
        emissive="#9d6c43"
        emissiveIntensity={0.14}
        metalness={0.48}
        roughness={0.23}
        vertexColors
      />
      <BoxInstances items={frontFrames} color="#283b45" metalness={0.72} roughness={0.34} />
      <BoxInstances
        items={[
          { position: [0, 0.92, 2.14], scale: [5.52, 0.055, 0.06] },
          { position: [0, 1.49, 2.14], scale: [5.52, 0.055, 0.06] },
          { position: [2.9, 0.92, -0.28], scale: [0.06, 0.055, 3.52] },
          { position: [2.9, 1.49, -0.28], scale: [0.06, 0.055, 3.52] },
        ]}
        color="#273c47"
        metalness={0.72}
        roughness={0.34}
      />

      <RoundedGlassCorner />
      <CineplexLogo />
      <StaticBillboards />

      <mesh position={[0, 0.49, 2.38]} raycast={() => undefined}>
        <boxGeometry args={[5.58, 0.12, 0.68]} />
        <meshStandardMaterial color="#667b84" metalness={0.68} roughness={0.34} />
      </mesh>
      <BoxInstances
        items={canopyLights}
        color="#f6d58b"
        emissive="#f6c96b"
        emissiveIntensity={0.7}
        roughness={0.25}
      />
      <BoxInstances items={bollards} color="#252f34" metalness={0.72} roughness={0.38} />

      <BoxInstances
        items={[
          { position: [-2.3, 2.52, -0.7], scale: [0.42, 0.2, 0.72] },
          { position: [-1.55, 2.55, -0.7], scale: [0.68, 0.26, 0.72] },
          { position: [0.25, 2.56, -0.85], scale: [0.5, 0.28, 0.62] },
        ]}
        color="#45535a"
        metalness={0.38}
        roughness={0.62}
      />
      <BoxInstances
        items={[
          { position: [-2.82, 2.24, 0], scale: [0.08, 0.08, 4.15] },
          { position: [0, 2.24, -2.08], scale: [5.72, 0.08, 0.08] },
        ]}
        color="#b9c1c0"
        metalness={0.55}
        roughness={0.4}
      />
    </group>
  );
}
