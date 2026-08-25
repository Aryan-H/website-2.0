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
  metalness = 0.08,
  roughness = 0.82,
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
      receiveShadow
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

function AthleticCentreSign() {
  const sign = useTexture("/uoft-athletic-centre-sign.svg");
  const crest = useTexture("/utoronto-coat-of-arms.webp");

  useLayoutEffect(() => {
    [sign, crest].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    });
  }, [crest, sign]);

  return (
    <group>
      <mesh position={[0.7, 1.36, 2.126]} raycast={() => undefined}>
        <boxGeometry args={[2.35, 0.62, 0.09]} />
        <meshStandardMaterial color="#0b315c" metalness={0.3} roughness={0.46} />
      </mesh>
      <mesh position={[0.7, 1.36, 2.178]} raycast={() => undefined}>
        <planeGeometry args={[2.22, 0.5]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>

      <mesh position={[-0.63, 1.26, 2.15]} raycast={() => undefined}>
        <boxGeometry args={[0.62, 1.1, 0.08]} />
        <meshStandardMaterial color="#d2d1cb" roughness={0.7} />
      </mesh>
      <mesh position={[-0.63, 1.26, 2.197]} raycast={() => undefined}>
        <planeGeometry args={[0.52, 0.98]} />
        <meshBasicMaterial alphaTest={0.08} map={crest} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}

export default function UofTAthleticCentre() {
  const redInfill = useMemo<InstanceItem[]>(
    () => [
      { position: [-2.18, 1.98, 1.96], scale: [1.12, 0.58, 0.15], rotation: [0, 0, -0.15] },
      { position: [-0.75, 2.02, 1.96], scale: [1.18, 0.62, 0.15], rotation: [0, 0, 0.08] },
      { position: [0.75, 2.02, 1.96], scale: [1.18, 0.62, 0.15], rotation: [0, 0, -0.08] },
      { position: [2.18, 1.98, 1.96], scale: [1.12, 0.58, 0.15], rotation: [0, 0, 0.15] },
      { position: [2.93, 1.92, -1.1], scale: [0.08, 0.62, 1.2] },
      { position: [2.93, 1.92, 0.35], scale: [0.08, 0.62, 1.15] },
    ],
    [],
  );
  const buttresses = useMemo<InstanceItem[]>(
    () => [
      { position: [-2.72, 1.55, 1.88], scale: [0.42, 1.62, 0.7], rotation: [0, 0, -0.05] },
      { position: [-1.43, 1.58, 1.9], scale: [0.38, 1.55, 0.68], rotation: [0, 0, 0.12] },
      { position: [0, 1.58, 1.9], scale: [0.4, 1.6, 0.68] },
      { position: [1.43, 1.58, 1.9], scale: [0.38, 1.55, 0.68], rotation: [0, 0, -0.12] },
      { position: [2.72, 1.55, 1.88], scale: [0.42, 1.62, 0.7], rotation: [0, 0, 0.05] },
    ],
    [],
  );
  const entrances = useMemo<InstanceItem[]>(
    () => [
      { position: [-1.78, 0.69, 2.075], scale: [1.08, 1.2, 0.1] },
      { position: [1.78, 0.69, 2.075], scale: [1.08, 1.2, 0.1] },
    ],
    [],
  );
  const doorGlass = useMemo<InstanceItem[]>(
    () =>
      [-2.05, -1.5, 1.5, 2.05].map((x, index) => ({
        position: [x, 0.62, 2.138] as Vec3,
        scale: [0.42, 0.94, 0.04] as Vec3,
        color: index % 2 ? "#3c7186" : "#284e60",
      })),
    [],
  );
  const concreteSeams = useMemo<InstanceItem[]>(
    () => [
      ...[0.42, 0.78, 1.14, 1.5].map((y) => ({
        position: [0, y, -2.04] as Vec3,
        scale: [5.66, 0.025, 0.03] as Vec3,
      })),
      ...[-2.35, -1.65, -0.95, -0.25, 0.45, 1.15, 1.85, 2.55].map((x) => ({
        position: [x, 0.86, -2.045] as Vec3,
        scale: [0.025, 1.5, 0.03] as Vec3,
      })),
    ],
    [],
  );
  const sideWindows = useMemo<InstanceItem[]>(
    () =>
      [-1.32, -0.72, -0.12, 0.48, 1.08].map((z, index) => ({
        position: [2.865, 0.72, z] as Vec3,
        scale: [0.045, 0.68, 0.42] as Vec3,
        color: index % 3 === 0 ? "#c48752" : "#294d5e",
      })),
    [],
  );
  const bollards = useMemo<InstanceItem[]>(
    () =>
      [-2.45, -1.75, -1.05, 1.05, 1.75, 2.45].map((x) => ({
        position: [x, 0.2, 2.55] as Vec3,
        scale: [0.075, 0.36, 0.075] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.045, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.3, 0.09, 4.82]} />
        <meshStandardMaterial color="#686d6c" metalness={0.12} roughness={0.82} />
      </mesh>

      <mesh position={[0, 1.05, -0.1]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.72, 1.95, 4.03]} />
        <meshStandardMaterial color="#8e8e87" roughness={0.9} />
      </mesh>
      <mesh
        position={[0, 2.7, -0.12]}
        rotation-z={-0.045}
        castShadow
        receiveShadow
        raycast={() => undefined}
      >
        <boxGeometry args={[6.18, 0.46, 4.5]} />
        <meshStandardMaterial color="#b0afa7" roughness={0.84} />
      </mesh>
      <mesh position={[0, 2.96, -0.12]} rotation-z={-0.045} raycast={() => undefined}>
        <boxGeometry args={[6.28, 0.08, 4.6]} />
        <meshStandardMaterial color="#d0cec5" roughness={0.8} />
      </mesh>

      <BoxInstances items={redInfill} color="#a2342d" roughness={0.88} />
      <BoxInstances items={buttresses} color="#aaa9a2" roughness={0.86} />
      <BoxInstances items={entrances} color="#111a1f" metalness={0.3} roughness={0.5} />
      <BoxInstances
        items={doorGlass}
        color="#ffffff"
        emissive="#a66d43"
        emissiveIntensity={0.14}
        metalness={0.5}
        roughness={0.24}
        vertexColors
      />
      <BoxInstances items={concreteSeams} color="#6f7473" roughness={0.84} />
      <BoxInstances
        items={sideWindows}
        color="#ffffff"
        emissive="#a66d43"
        emissiveIntensity={0.12}
        metalness={0.48}
        roughness={0.24}
        vertexColors
      />
      <AthleticCentreSign />

      <mesh position={[0, 0.12, 2.28]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.7, 0.13, 0.64]} />
        <meshStandardMaterial color="#8c8c87" roughness={0.86} />
      </mesh>
      <BoxInstances items={bollards} color="#38454a" metalness={0.7} roughness={0.4} />

      <BoxInstances
        items={[
          { position: [-2.58, 0.24, 2.2], scale: [0.5, 0.36, 0.46] },
          { position: [2.58, 0.24, 2.2], scale: [0.5, 0.36, 0.46] },
        ]}
        color="#4b5253"
        metalness={0.18}
        roughness={0.72}
      />
      <BoxInstances
        items={[
          { position: [-2.58, 0.62, 2.2], scale: [0.38, 0.55, 0.36], color: "#214738" },
          { position: [2.58, 0.62, 2.2], scale: [0.38, 0.55, 0.36], color: "#1d4133" },
        ]}
        color="#ffffff"
        roughness={0.94}
        vertexColors
      />

      <BoxInstances
        items={[
          { position: [-1.45, 3.07, -0.65], scale: [0.64, 0.2, 0.55] },
          { position: [0.1, 3.07, -0.55], scale: [0.5, 0.18, 0.48] },
        ]}
        color="#626a6c"
        metalness={0.36}
        roughness={0.62}
      />
    </group>
  );
}
