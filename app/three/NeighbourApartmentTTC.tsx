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
  metalness = 0.2,
  roughness = 0.55,
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
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} raycast={() => undefined}>
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

const CONDO_X = -1.8;
const TTC_X = 2;

function ReferenceCondo() {
  const details = useMemo(() => {
    const facadePanels: BoxItem[] = [];
    const sidePanels: BoxItem[] = [];
    const verticalFrames: BoxItem[] = [];
    const floorBands: BoxItem[] = [];
    const balconySlabs: BoxItem[] = [];
    const balconyRails: BoxItem[] = [];
    const crownFins: BoxItem[] = [];

    const lowerFloorYs = [1.18, 1.74, 2.3, 2.86, 3.42, 3.98, 4.54, 5.1, 5.66];
    lowerFloorYs.forEach((y, floor) => {
      [-0.92, -0.31, 0.31, 0.92].forEach((offset, column) => {
        facadePanels.push({
          position: [CONDO_X + offset, y, 1.565],
          scale: [0.49, 0.36, 0.035],
          color:
            (floor * 3 + column * 2) % 13 === 0
              ? "#dff7ff"
              : column % 2
                ? "#397e9b"
                : "#286886",
        });
      });
      [-1, 1].forEach((side) => {
        [-0.92, -0.31, 0.31, 0.92].forEach((z, column) => {
          sidePanels.push({
            position: [CONDO_X + side * 1.385, y, z],
            scale: [0.035, 0.36, 0.48],
            color:
              (floor + column * 3) % 14 === 0
                ? "#caeffb"
                : column % 2
                  ? "#347793"
                  : "#285f7c",
          });
        });
      });
      const balconyY = y + 0.27;
      balconySlabs.push({
        position: [CONDO_X, balconyY, 1.74],
        scale: [2.98, 0.07, 0.45],
      });
      balconyRails.push({
        position: [CONDO_X, balconyY + 0.17, 1.95],
        scale: [2.82, 0.27, 0.035],
      });
    });

    [-1.16, -0.58, 0, 0.58, 1.16].forEach((offset) => {
      verticalFrames.push({
        position: [CONDO_X + offset, 3.42, 1.594],
        scale: [0.035, 5.28, 0.05],
      });
    });

    const midX = CONDO_X + 0.12;
    [6.15, 6.67, 7.19, 7.71, 8.23].forEach((y, floor) => {
      [-0.78, -0.26, 0.26, 0.78].forEach((offset, column) => {
        facadePanels.push({
          position: [midX + offset, y, 1.258],
          scale: [0.41, 0.34, 0.035],
          color:
            (floor + column * 2) % 11 === 0
              ? "#d9f6ff"
              : column % 2
                ? "#377f9c"
                : "#2b6b88",
        });
      });
      [-1, 1].forEach((side) => {
        [-0.83, -0.28, 0.28, 0.83].forEach((z, column) => {
          sidePanels.push({
            position: [midX + side * 1.145, y, z - 0.08],
            scale: [0.035, 0.34, 0.42],
            color: column % 2 ? "#34758f" : "#275e79",
          });
        });
      });
      floorBands.push({ position: [midX, y - 0.25, -0.08], scale: [2.32, 0.055, 2.7] });
    });
    [-0.88, -0.44, 0, 0.44, 0.88].forEach((offset) => {
      verticalFrames.push({
        position: [midX + offset, 7.2, 1.287],
        scale: [0.035, 2.36, 0.05],
      });
    });

    const crownX = CONDO_X + 0.18;
    [8.5, 9.04, 9.58, 10.12, 10.66].forEach((y, floor) => {
      [-0.58, -0.19, 0.19, 0.58].forEach((offset, column) => {
        facadePanels.push({
          position: [crownX + offset, y, 1.018],
          scale: [0.3, 0.35, 0.03],
          color:
            (floor + column * 2) % 9 === 0
              ? "#e4f8ff"
              : column % 2
                ? "#3a819d"
                : "#2c6d89",
        });
      });
      [-1, 1].forEach((side) => {
        [-0.76, -0.25, 0.25, 0.76].forEach((z, column) => {
          sidePanels.push({
            position: [crownX + side * 0.965, y, z - 0.12],
            scale: [0.03, 0.35, 0.38],
            color: column % 2 ? "#397b96" : "#2a6580",
          });
        });
      });
      floorBands.push({ position: [crownX, y - 0.26, -0.12], scale: [1.94, 0.045, 2.28] });
    });

    [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].forEach((offset) => {
      crownFins.push({
        position: [crownX + offset, 9.65, 1.052],
        scale: [0.045, 2.76, 0.075],
      });
    });
    [-0.82, -0.41, 0, 0.41, 0.82].forEach((z) => {
      [-1, 1].forEach((side) => {
        crownFins.push({
          position: [crownX + side * 0.985, 9.65, z - 0.12],
          scale: [0.075, 2.76, 0.045],
        });
      });
    });

    return {
      balconyRails,
      balconySlabs,
      crownFins,
      facadePanels,
      floorBands,
      sidePanels,
      verticalFrames,
    };
  }, []);

  return (
    <group>
      <mesh position={[CONDO_X, 0.54, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.08, 1.02, 3.9]} />
        <meshPhysicalMaterial clearcoat={0.52} color="#1c3747" metalness={0.48} roughness={0.32} />
      </mesh>
      <mesh position={[CONDO_X, 3.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.76, 5.82, 3.1]} />
        <meshPhysicalMaterial clearcoat={0.82} clearcoatRoughness={0.1} color="#123e59" metalness={0.58} roughness={0.2} />
      </mesh>
      <mesh position={[CONDO_X + 0.12, 7.2, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[2.28, 2.5, 2.66]} />
        <meshPhysicalMaterial clearcoat={0.86} clearcoatRoughness={0.08} color="#164761" metalness={0.62} roughness={0.18} />
      </mesh>
      <mesh position={[CONDO_X + 0.18, 9.65, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.92, 2.86, 2.26]} />
        <meshPhysicalMaterial clearcoat={0.86} clearcoatRoughness={0.08} color="#174d68" metalness={0.62} roughness={0.18} />
      </mesh>
      <Boxes items={details.facadePanels} color="#ffffff" emissive="#1b668b" emissiveIntensity={0.12} metalness={0.55} roughness={0.2} vertexColors />
      <Boxes items={details.sidePanels} color="#ffffff" emissive="#185875" emissiveIntensity={0.1} metalness={0.55} roughness={0.22} vertexColors />
      <Boxes items={details.verticalFrames} color="#9ebdca" metalness={0.72} roughness={0.28} />
      <Boxes items={details.floorBands} color="#284d60" metalness={0.56} roughness={0.34} />
      <Boxes items={details.balconySlabs} color="#b7cdd5" metalness={0.42} roughness={0.4} />
      <Boxes items={details.balconyRails} color="#3f829e" emissive="#1e6380" emissiveIntensity={0.12} metalness={0.55} roughness={0.22} />
      <Boxes items={details.crownFins} color="#d7eaf0" emissive="#3f9bc0" emissiveIntensity={0.1} metalness={0.72} roughness={0.26} />
      <mesh position={[CONDO_X + 0.18, 11.105, -0.12]} castShadow>
        <boxGeometry args={[1.94, 0.06, 2.28]} />
        <meshStandardMaterial color="#bed2d9" metalness={0.58} roughness={0.34} />
      </mesh>
      <mesh position={[CONDO_X, 0.54, 1.97]} raycast={() => undefined}>
        <boxGeometry args={[1.34, 0.72, 0.05]} />
        <meshPhysicalMaterial clearcoat={0.8} color="#3e839c" metalness={0.3} opacity={0.72} roughness={0.15} transparent />
      </mesh>
      <mesh position={[CONDO_X, 0.98, 2.16]} castShadow raycast={() => undefined}>
        <boxGeometry args={[1.65, 0.08, 0.5]} />
        <meshStandardMaterial color="#e1edf0" metalness={0.62} roughness={0.32} />
      </mesh>
    </group>
  );
}

function TTCBuilding() {
  const logo = useTexture("/ttc-logo-blue.svg");

  useLayoutEffect(() => {
    logo.colorSpace = THREE.SRGBColorSpace;
    logo.anisotropy = 8;
    logo.needsUpdate = true;
  }, [logo]);

  const roofUnits = useMemo<BoxItem[]>(
    () => [
      { position: [TTC_X - 0.65, 1.61, -0.45], scale: [0.55, 0.24, 0.42] },
      { position: [TTC_X + 0.48, 1.61, -0.52], scale: [0.42, 0.24, 0.36] },
    ],
    [],
  );

  return (
    <group>
      <mesh position={[TTC_X, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.72, 1.18, 3.82]} />
        <meshPhysicalMaterial clearcoat={0.4} color="#47565d" metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh position={[TTC_X, 1.25, -0.28]} castShadow>
        <boxGeometry args={[2.3, 0.48, 2.95]} />
        <meshStandardMaterial color="#62727a" metalness={0.34} roughness={0.48} />
      </mesh>
      <mesh position={[TTC_X, 0.53, 1.93]} raycast={() => undefined}>
        <boxGeometry args={[1.78, 0.72, 0.055]} />
        <meshPhysicalMaterial clearcoat={0.78} color="#225d79" metalness={0.28} opacity={0.74} roughness={0.16} transparent />
      </mesh>
      {[-0.55, 0, 0.55].map((offset) => (
        <mesh key={offset} position={[TTC_X + offset, 0.53, 1.97]} raycast={() => undefined}>
          <boxGeometry args={[0.035, 0.65, 0.035]} />
          <meshStandardMaterial color="#c8dce4" metalness={0.68} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[TTC_X, 1.24, 1.935]} raycast={() => undefined}>
        <planeGeometry args={[1.62, 0.63]} />
        <meshBasicMaterial map={logo} toneMapped={false} transparent />
      </mesh>
      <mesh position={[TTC_X, 1.52, 0]} castShadow>
        <boxGeometry args={[2.86, 0.09, 3.96]} />
        <meshStandardMaterial color="#d5e5ea" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[TTC_X, 1.08, 1.98]} raycast={() => undefined}>
        <boxGeometry args={[2.72, 0.08, 0.08]} />
        <meshBasicMaterial color="#35bff3" toneMapped={false} />
      </mesh>
      <Boxes items={roofUnits} color="#34464f" metalness={0.5} roughness={0.46} />
    </group>
  );
}

function MiddlePath() {
  const pavers = useMemo<BoxItem[]>(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        position: [0.15, 0.13, -1.92 + index * 0.48],
        scale: [0.68, 0.035, 0.36],
        color: index % 2 ? "#8c979a" : "#727f83",
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0.15, 0.075, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[0.88, 0.09, 4.7]} />
        <meshStandardMaterial color="#687477" roughness={0.86} />
      </mesh>
      <Boxes items={pavers} color="#ffffff" roughness={0.82} vertexColors />
    </group>
  );
}

export default function NeighbourApartmentTTC() {
  return (
    <group>
      <mesh position={[0, 0.045, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[7.25, 0.09, 4.82]} />
        <meshStandardMaterial color="#465156" metalness={0.12} roughness={0.82} />
      </mesh>
      <ReferenceCondo />
      <MiddlePath />
      <TTCBuilding />
    </group>
  );
}
