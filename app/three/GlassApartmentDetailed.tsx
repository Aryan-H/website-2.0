"use client";

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

function Foliage({ items }: { items: BoxItem[] }) {
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
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} raycast={() => undefined}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#173c31" roughness={0.94} vertexColors />
    </instancedMesh>
  );
}

const GLASS = "#0e4566";
const GLASS_LIGHT = "#4aadd4";
const FRAME = "#c5e0e9";
const FRAME_DARK = "#d8e8ed";

function CurtainWall() {
  const { floorBands, frontPanels, frontMullions, sideMullions, sidePanels } = useMemo(() => {
    const floorBands: BoxItem[] = [];
    const frontPanels: BoxItem[] = [];
    const sidePanels: BoxItem[] = [];
    const frontMullions: BoxItem[] = [];
    const sideMullions: BoxItem[] = [];
    const floorYs = [1.48, 2.18, 2.88, 3.58, 4.28, 4.98, 5.68, 6.38];
    const frontXs = [-1.35, -0.68, 0, 0.68, 1.35];
    const sideZs = [-1.05, -0.35, 0.35, 1.05];

    floorYs.forEach((y, floor) => {
      floorBands.push({ position: [0, y - 0.35, 0], scale: [3.78, 0.085, 3.02] });
      frontXs.forEach((x, column) => {
        const highlighted = floor === 6 && column === 3;
        const bright = highlighted || (floor * 3 + column * 5) % 7 < 2;
        frontPanels.push({
          position: [x, y, 1.476],
          scale: [0.56, 0.48, 0.035],
          color: highlighted ? "#f2fbff" : bright ? "#79c7e5" : floor % 2 ? "#347fa1" : "#286b8d",
        });
      });
      [-1, 1].forEach((side) => {
        sideZs.forEach((z, column) => {
          const bright = (floor + column * 2 + (side > 0 ? 1 : 0)) % 6 === 0;
          sidePanels.push({
            position: [side * 1.826, y, z],
            scale: [0.035, 0.48, 0.55],
            color: bright ? "#91d5ec" : column % 2 ? "#327b9b" : "#276886",
          });
        });
      });
    });

    [-1.67, -1.01, -0.34, 0.34, 1.01, 1.67].forEach((x) => {
      frontMullions.push({ position: [x, 3.92, 1.505], scale: [0.045, 5.6, 0.055] });
    });
    [-1.22, -0.7, 0, 0.7, 1.22].forEach((z) => {
      [-1, 1].forEach((side) => {
        sideMullions.push({ position: [side * 1.855, 3.92, z], scale: [0.055, 5.6, 0.045] });
      });
    });

    return { floorBands, frontPanels, frontMullions, sideMullions, sidePanels };
  }, []);

  return (
    <group>
      <Boxes items={floorBands} color={FRAME_DARK} metalness={0.64} roughness={0.34} />
      <Boxes
        items={frontPanels}
        color="#ffffff"
        emissive="#1b7099"
        emissiveIntensity={0.16}
        metalness={0.52}
        roughness={0.22}
        vertexColors
      />
      <Boxes
        items={sidePanels}
        color="#ffffff"
        emissive="#155d82"
        emissiveIntensity={0.14}
        metalness={0.52}
        roughness={0.22}
        vertexColors
      />
      <Boxes items={[...frontMullions, ...sideMullions]} color={FRAME} metalness={0.78} roughness={0.27} />
    </group>
  );
}

function Balconies() {
  const { glassRails, sideRails, slabs } = useMemo(() => {
    const slabs: BoxItem[] = [];
    const glassRails: BoxItem[] = [];
    const sideRails: BoxItem[] = [];
    [2.52, 3.92, 5.32, 6.72].forEach((y) => {
      slabs.push({ position: [0, y, 1.72], scale: [3.98, 0.09, 0.54] });
      glassRails.push({ position: [0, y + 0.25, 1.97], scale: [3.82, 0.42, 0.045] });
      [-1, 1].forEach((side) => {
        sideRails.push({ position: [side * 1.94, y + 0.25, 1.72], scale: [0.045, 0.42, 0.48] });
      });
    });
    return { glassRails, sideRails, slabs };
  }, []);

  return (
    <group>
      <Boxes items={slabs} color="#dcecf1" metalness={0.45} roughness={0.38} />
      <Boxes
        items={[...glassRails, ...sideRails]}
        color={GLASS_LIGHT}
        emissive="#17445b"
        emissiveIntensity={0.25}
        metalness={0.58}
        roughness={0.2}
      />
    </group>
  );
}

function PodiumAndEntrance() {
  const planters = useMemo<BoxItem[]>(
    () =>
      [-1.9, 1.9].map((x) => ({
        position: [x, 0.3, 2.02],
        scale: [0.48, 0.48, 0.52],
      })),
    [],
  );
  const foliage = useMemo<BoxItem[]>(
    () =>
      planters.flatMap(({ position }, planter) =>
        Array.from({ length: 3 }, (_, index) => ({
          position: [position[0] + (index - 1) * 0.16, 0.69 + (index % 2) * 0.08, position[2]] as Vec3,
          scale: [0.27, 0.3, 0.27] as Vec3,
          color: planter === 0 ? "#285d49" : "#1e503e",
        })),
      ),
    [planters],
  );

  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[5.35, 0.14, 4.72]} />
        <meshStandardMaterial color="#59666b" metalness={0.18} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.61, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.85, 1.08, 4.08]} />
        <meshPhysicalMaterial clearcoat={0.48} color="#174a68" metalness={0.42} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.63, 2.065]} raycast={() => undefined}>
        <boxGeometry args={[2.35, 0.92, 0.055]} />
        <meshPhysicalMaterial clearcoat={0.82} color="#32627a" metalness={0.28} opacity={0.72} roughness={0.14} transparent />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.6, 2.11]} raycast={() => undefined}>
          <boxGeometry args={[0.035, 0.82, 0.04]} />
          <meshStandardMaterial color="#b4cbd5" metalness={0.7} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, 1.17, 2.28]} castShadow raycast={() => undefined}>
        <boxGeometry args={[2.75, 0.1, 0.72]} />
        <meshStandardMaterial color="#e0eef2" metalness={0.68} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.24, 2.11]} raycast={() => undefined}>
        <boxGeometry args={[1.55, 0.13, 0.035]} />
        <meshBasicMaterial color="#65d2ff" toneMapped={false} />
      </mesh>
      <Boxes items={planters} color="#26373d" metalness={0.35} roughness={0.58} />
      <Foliage items={foliage} />
    </group>
  );
}

function Rooftop() {
  const roofPlanters = useMemo<BoxItem[]>(
    () =>
      [-0.72, 0, 0.72].map((x) => ({
        position: [x, 7.76, 0.52],
        scale: [0.42, 0.22, 0.32],
      })),
    [],
  );
  const roofFoliage = useMemo<BoxItem[]>(
    () =>
      roofPlanters.map(({ position }, index) => ({
        position: [position[0], 8.02, position[2]] as Vec3,
        scale: [0.28, 0.3 + index * 0.03, 0.28] as Vec3,
        color: index === 1 ? "#31624a" : "#244f3e",
      })),
    [roofPlanters],
  );

  return (
    <group>
      <mesh position={[0, 7.18, -0.16]} castShadow>
        <boxGeometry args={[2.55, 0.92, 1.9]} />
        <meshPhysicalMaterial clearcoat={0.72} color="#1c465a" metalness={0.48} roughness={0.23} />
      </mesh>
      <mesh position={[0, 7.69, -0.16]} castShadow>
        <boxGeometry args={[2.85, 0.1, 2.16]} />
        <meshStandardMaterial color="#e1eef2" metalness={0.58} roughness={0.34} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 7.42, 0.92]} raycast={() => undefined}>
          <boxGeometry args={[0.055, 0.58, 0.055]} />
          <meshStandardMaterial color={FRAME} metalness={0.76} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 7.68, 0.92]} raycast={() => undefined}>
        <boxGeometry args={[2.15, 0.055, 0.055]} />
        <meshStandardMaterial color={FRAME} metalness={0.76} roughness={0.3} />
      </mesh>
      <Boxes items={roofPlanters} color="#34454b" metalness={0.25} roughness={0.66} />
      <Foliage items={roofFoliage} />
    </group>
  );
}

function ApartmentTennisCourt() {
  const courtZ = 6.5;
  const markings = useMemo<BoxItem[]>(
    () => [
      { position: [0, 0.151, courtZ - 1.5], scale: [6, 0.018, 0.045] },
      { position: [0, 0.151, courtZ + 1.5], scale: [6, 0.018, 0.045] },
      { position: [-3, 0.151, courtZ], scale: [0.045, 0.018, 3.04] },
      { position: [3, 0.151, courtZ], scale: [0.045, 0.018, 3.04] },
      { position: [0, 0.152, courtZ - 1.15], scale: [6, 0.018, 0.035] },
      { position: [0, 0.152, courtZ + 1.15], scale: [6, 0.018, 0.035] },
      { position: [-1.48, 0.152, courtZ], scale: [0.04, 0.018, 2.32] },
      { position: [1.48, 0.152, courtZ], scale: [0.04, 0.018, 2.32] },
      { position: [0, 0.153, courtZ], scale: [2.96, 0.018, 0.035] },
    ],
    [],
  );
  const fencePosts = useMemo<BoxItem[]>(() => {
    const items: BoxItem[] = [];
    [-3.28, 3.28].forEach((x) => {
      [-1.92, -0.96, 0, 0.96, 1.92].forEach((z) => {
        items.push({ position: [x, 0.65, courtZ + z], scale: [0.055, 1.18, 0.055] });
      });
    });
    [-3.28, -2.18, -1.09, 0, 1.09, 2.18, 3.28].forEach((x) => {
      [-1.92, 1.92].forEach((z) => {
        items.push({ position: [x, 0.65, courtZ + z], scale: [0.055, 1.18, 0.055] });
      });
    });
    return items;
  }, []);
  const fenceRails = useMemo<BoxItem[]>(
    () => [
      ...[-3.28, 3.28].flatMap((x) =>
        [0.3, 0.78, 1.23].map((y) => ({
          position: [x, y, courtZ] as Vec3,
          scale: [0.035, 0.035, 3.88] as Vec3,
        })),
      ),
      ...[-1.92, 1.92].flatMap((z) =>
        [0.3, 0.78, 1.23].map((y) => ({
          position: [0, y, courtZ + z] as Vec3,
          scale: [6.6, 0.035, 0.035] as Vec3,
        })),
      ),
    ],
    [],
  );
  const netPosts = useMemo<BoxItem[]>(
    () =>
      [-1.63, 1.63].map((z) => ({
        position: [0, 0.48, courtZ + z],
        scale: [0.055, 0.68, 0.055],
      })),
    [],
  );
  const benches = useMemo<BoxItem[]>(
    () =>
      [-1.45, 1.45].flatMap((x) => [
        { position: [x, 0.28, courtZ + 2.12] as Vec3, scale: [1.05, 0.12, 0.28] as Vec3 },
        { position: [x, 0.47, courtZ + 2.24] as Vec3, scale: [1.05, 0.38, 0.1] as Vec3 },
      ]),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.055, courtZ]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.85, 0.11, 4.72]} />
        <meshStandardMaterial color="#5b686d" metalness={0.12} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.125, courtZ]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.3, 0.08, 3.62]} />
        <meshPhysicalMaterial clearcoat={0.36} color="#10517a" metalness={0.08} roughness={0.56} />
      </mesh>
      <Boxes
        items={markings}
        color="#edfaff"
        emissive="#9de6ff"
        emissiveIntensity={0.35}
        roughness={0.4}
      />
      <Boxes items={fencePosts} color="#7894a2" metalness={0.78} roughness={0.32} />
      <Boxes items={fenceRails} color="#5d7b8a" metalness={0.76} roughness={0.34} />
      <Boxes items={netPosts} color="#4c6673" metalness={0.52} roughness={0.46} />
      <mesh position={[0, 0.49, courtZ]} rotation-y={Math.PI / 2} raycast={() => undefined}>
        <planeGeometry args={[3.2, 0.5, 4, 1]} />
        <meshBasicMaterial color="#344d59" opacity={0.3} transparent wireframe />
      </mesh>
      <Boxes items={benches} color="#b7cbd3" metalness={0.5} roughness={0.44} />
    </group>
  );
}

export default function GlassApartmentDetailed() {
  return (
    <group>
      <ApartmentTennisCourt />
      <PodiumAndEntrance />
      <mesh position={[0, 3.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.68, 5.62, 2.92]} />
        <meshPhysicalMaterial
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          color={GLASS}
          metalness={0.62}
          roughness={0.18}
        />
      </mesh>
      <CurtainWall />
      <Balconies />
      <Rooftop />
    </group>
  );
}
