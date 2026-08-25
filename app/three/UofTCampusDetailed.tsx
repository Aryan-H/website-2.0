"use client";

import { useTexture } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type InstanceItem = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

const COLORS = {
  stone: "#5b5952",
  stoneDark: "#34383a",
  stoneLight: "#9a927f",
  trim: "#b0a58e",
  copper: "#36504c",
  copperEdge: "#6d6657",
  glass: "#172c38",
  warm: "#f0b66f",
  wood: "#41281f",
  blue: "#0b3d74",
  lawn: "#17382b",
  hedge: "#1e4937",
  flower: "#b0443d",
};

function BoxInstances({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.04,
  roughness = 0.86,
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

function CylinderInstances({
  items,
  color,
  metalness = 0.05,
  radialSegments = 8,
  roughness = 0.8,
}: {
  items: InstanceItem[];
  color: string;
  metalness?: number;
  radialSegments?: number;
  roughness?: number;
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
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} raycast={() => undefined}>
      <cylinderGeometry args={[1, 1, 1, radialSegments]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}

function SphereInstances({ items, color }: { items: InstanceItem[]; color: string }) {
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
      <meshStandardMaterial color={color} roughness={0.94} vertexColors />
    </instancedMesh>
  );
}

function ArchInstances({ items }: { items: InstanceItem[] }) {
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
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} raycast={() => undefined}>
      <torusGeometry args={[1, 0.115, 4, 18, Math.PI]} />
      <meshStandardMaterial color={COLORS.trim} roughness={0.76} />
    </instancedMesh>
  );
}

function GothicWindows() {
  const { arches, glass, jambs, sills } = useMemo(() => {
    const windowPositions = [-2.72, -2.16, -1.6, 1.6, 2.16, 2.72].flatMap((x) =>
      [0.75, 1.38].map((y) => ({ x, y })),
    );
    const glassItems: InstanceItem[] = [];
    const archItems: InstanceItem[] = [];
    const jambItems: InstanceItem[] = [];
    const sillItems: InstanceItem[] = [];

    windowPositions.forEach(({ x, y }, index) => {
      glassItems.push({
        position: [x, y, 1.472],
        scale: [0.27, 0.39, 0.025],
        color: index % 4 === 0 ? "#d49b57" : COLORS.glass,
      });
      archItems.push({ position: [x, y + 0.2, 1.502], scale: [0.135, 0.135, 0.135] });
      [-0.155, 0.155].forEach((offset) =>
        jambItems.push({ position: [x + offset, y - 0.03, 1.505], scale: [0.035, 0.42, 0.04] }),
      );
      sillItems.push({ position: [x, y - 0.235, 1.507], scale: [0.38, 0.055, 0.08] });
    });

    return { arches: archItems, glass: glassItems, jambs: jambItems, sills: sillItems };
  }, []);

  return (
    <group>
      <BoxInstances
        items={glass}
        color={COLORS.glass}
        emissive={COLORS.warm}
        emissiveIntensity={0.22}
        metalness={0.3}
        roughness={0.28}
        vertexColors
      />
      <ArchInstances items={arches} />
      <BoxInstances items={jambs} color={COLORS.trim} roughness={0.76} />
      <BoxInstances items={sills} color={COLORS.stoneLight} roughness={0.82} />
    </group>
  );
}

function TowerWindows() {
  const upperX = [-0.42, 0, 0.42];
  return (
    <group>
      {upperX.map((x) => (
        <group key={x} position={[x, 3.46, 1.018]}>
          <mesh raycast={() => undefined}>
            <boxGeometry args={[0.26, 0.66, 0.035]} />
            <meshStandardMaterial
              color={COLORS.glass}
              emissive={COLORS.warm}
              emissiveIntensity={0.18}
              metalness={0.32}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, 0.32, 0.025]} raycast={() => undefined}>
            <torusGeometry args={[0.13, 0.03, 4, 16, Math.PI]} />
            <meshStandardMaterial color={COLORS.trim} roughness={0.78} />
          </mesh>
          <mesh position={[-0.155, 0, 0.025]} raycast={() => undefined}>
            <boxGeometry args={[0.035, 0.68, 0.04]} />
            <meshStandardMaterial color={COLORS.trim} roughness={0.78} />
          </mesh>
          <mesh position={[0.155, 0, 0.025]} raycast={() => undefined}>
            <boxGeometry args={[0.035, 0.68, 0.04]} />
            <meshStandardMaterial color={COLORS.trim} roughness={0.78} />
          </mesh>
        </group>
      ))}

      {[-0.24, 0.24].map((x) => (
        <group key={x} position={[x, 2.38, 1.018]}>
          <mesh raycast={() => undefined}>
            <boxGeometry args={[0.3, 0.72, 0.035]} />
            <meshStandardMaterial color="#1b3340" emissive={COLORS.warm} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0.35, 0.027]} raycast={() => undefined}>
            <torusGeometry args={[0.15, 0.035, 4, 18, Math.PI]} />
            <meshStandardMaterial color={COLORS.trim} roughness={0.76} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Roofs() {
  return (
    <group>
      {[-1.92, 1.92].map((x) => (
        <group key={x} position={[x, 2.12, 0]}>
          <mesh position={[0, 0.13, 0.62]} rotation-x={-0.5} raycast={() => undefined}>
            <boxGeometry args={[2.22, 0.09, 1.55]} />
            <meshStandardMaterial color={COLORS.copper} metalness={0.28} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.13, -0.62]} rotation-x={0.5} raycast={() => undefined}>
            <boxGeometry args={[2.22, 0.09, 1.55]} />
            <meshStandardMaterial color={COLORS.copper} metalness={0.28} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]} raycast={() => undefined}>
            <boxGeometry args={[2.28, 0.07, 0.08]} />
            <meshStandardMaterial color={COLORS.copperEdge} metalness={0.5} roughness={0.46} />
          </mesh>
        </group>
      ))}

      {[-2.65, 2.65].map((x) => (
        <group key={x} position={[x, 2.54, 0]}>
          <mesh rotation-y={Math.PI / 4} raycast={() => undefined}>
            <coneGeometry args={[0.76, 1.18, 4]} />
            <meshStandardMaterial color="#3b5550" metalness={0.3} roughness={0.56} />
          </mesh>
          <mesh position={[0, 0.72, 0]} raycast={() => undefined}>
            <cylinderGeometry args={[0.025, 0.035, 0.55, 6]} />
            <meshStandardMaterial color="#77847e" metalness={0.68} roughness={0.38} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EntrancePorch() {
  const pediment = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.72, 0);
    shape.lineTo(0.72, 0);
    shape.lineTo(0, 0.72);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.7, 1.58]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[1.42, 1.15, 0.72]} />
        <meshStandardMaterial color={COLORS.stoneLight} roughness={0.84} />
      </mesh>
      <mesh position={[0, 1.26, 1.94]} raycast={() => undefined}>
        <extrudeGeometry args={[pediment, { bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.04, depth: 0.1 }]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.56, 1.955]} raycast={() => undefined}>
        <boxGeometry args={[0.54, 0.76, 0.04]} />
        <meshStandardMaterial color={COLORS.wood} metalness={0.08} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.93, 1.98]} raycast={() => undefined}>
        <torusGeometry args={[0.27, 0.055, 5, 20, Math.PI]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.78} />
      </mesh>
      {[-0.39, 0.39].map((x) => (
        <mesh key={x} position={[x, 0.68, 1.99]} raycast={() => undefined}>
          <cylinderGeometry args={[0.065, 0.075, 0.9, 10]} />
          <meshStandardMaterial color={COLORS.trim} roughness={0.76} />
        </mesh>
      ))}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, 0.055 + step * 0.055, 2.35 - step * 0.14]} receiveShadow>
          <boxGeometry args={[1.65 - step * 0.12, 0.11, 0.34]} />
          <meshStandardMaterial color="#827d71" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function CanadianFlag({ x }: { x: number }) {
  return (
    <group position={[x, 1.38, 1.49]}>
      <mesh raycast={() => undefined}>
        <planeGeometry args={[0.72, 0.4]} />
        <meshBasicMaterial color="#f1eee7" toneMapped={false} />
      </mesh>
      {[-0.29, 0.29].map((offset) => (
        <mesh key={offset} position={[offset, 0, 0.006]} raycast={() => undefined}>
          <planeGeometry args={[0.14, 0.4]} />
          <meshBasicMaterial color="#d93636" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.009]} rotation-z={Math.PI / 4} raycast={() => undefined}>
        <planeGeometry args={[0.13, 0.13]} />
        <meshBasicMaterial color="#d93636" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CrestMonument() {
  const crest = useTexture("/utoronto-coat-of-arms.webp");

  useEffect(() => {
    crest.colorSpace = THREE.SRGBColorSpace;
    crest.anisotropy = 4;
    crest.needsUpdate = true;
  }, [crest]);

  return (
    <group position={[2.2, 0, 1.95]} rotation-y={0.48}>
      <mesh position={[0, 0.56, 0]} castShadow raycast={() => undefined}>
        <boxGeometry args={[1.34, 1.22, 0.18]} />
        <meshStandardMaterial color={COLORS.stoneLight} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.57, 0.101]} raycast={() => undefined}>
        <planeGeometry args={[1.13, 1.04]} />
        <meshStandardMaterial color={COLORS.blue} metalness={0.18} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.6, 0.108]} raycast={() => undefined}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial alphaTest={0.08} map={crest} toneMapped={false} transparent />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[1.62, 0.16, 0.62]} />
        <meshStandardMaterial color="#575a58" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.2, 0]} raycast={() => undefined}>
        <boxGeometry args={[1.46, 0.08, 0.24]} />
        <meshStandardMaterial color="#c1b7a1" roughness={0.72} />
      </mesh>
    </group>
  );
}

function FieldBench({ position, rotationY }: { position: Vec3; rotationY: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.25, 0]} castShadow raycast={() => undefined}>
        <boxGeometry args={[0.72, 0.09, 0.25]} />
        <meshStandardMaterial color="#5a4333" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.43, -0.11]} rotation-x={-0.12} raycast={() => undefined}>
        <boxGeometry args={[0.72, 0.3, 0.065]} />
        <meshStandardMaterial color="#513b2f" roughness={0.9} />
      </mesh>
      {[-0.27, 0.27].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} raycast={() => undefined}>
          <boxGeometry args={[0.055, 0.24, 0.18]} />
          <meshStandardMaterial color="#283238" metalness={0.58} roughness={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function CampusField() {
  return (
    <group>
      <mesh
        position={[0, 0.052, 6.02]}
        rotation-x={-Math.PI / 2}
        scale={[3.25, 2.68, 1]}
        receiveShadow
        raycast={() => undefined}
      >
        <ringGeometry args={[0.79, 1, 64]} />
        <meshStandardMaterial color="#777b7b" metalness={0.04} roughness={0.9} />
      </mesh>
      <mesh
        position={[0, 0.049, 6.02]}
        rotation-x={-Math.PI / 2}
        scale={[2.57, 2.12, 1]}
        receiveShadow
        raycast={() => undefined}
      >
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#254936" roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.07, 3.52]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[1.42, 0.055, 0.7]} />
        <meshStandardMaterial color="#777b7b" roughness={0.9} />
      </mesh>

      <FieldBench position={[-3.02, 0, 4.9]} rotationY={Math.PI / 2} />
      <FieldBench position={[-3.02, 0, 7.15]} rotationY={Math.PI / 2} />
      <FieldBench position={[3.02, 0, 5.05]} rotationY={-Math.PI / 2} />
      <FieldBench position={[3.02, 0, 7.3]} rotationY={-Math.PI / 2} />
    </group>
  );
}

function Landscaping() {
  const hedges = useMemo<InstanceItem[]>(
    () =>
      [-2.65, -1.95, 1.95].map((x) => ({
        position: [x, 0.26, 1.75],
        scale: [0.62, 0.38, 0.38],
      })),
    [],
  );
  const flowers = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        position: [-3.05 + index * 0.34, 0.13, 2.01 + (index % 2) * 0.12] as Vec3,
        scale: [0.055, 0.055, 0.055] as Vec3,
        color: index % 3 === 0 ? "#d6ad45" : index % 3 === 1 ? "#b44343" : "#d9d0bf",
      })),
    [],
  );
  const trunks = useMemo<InstanceItem[]>(
    () => [
      { position: [-3.15, 0.72, 0.3], scale: [0.12, 1.42, 0.12] },
      { position: [3.15, 0.78, -0.2], scale: [0.13, 1.55, 0.13] },
      { position: [-3.08, 0.64, 4.05], scale: [0.1, 1.25, 0.1] },
      { position: [-3.12, 0.67, 8.0], scale: [0.1, 1.3, 0.1] },
      { position: [3.1, 0.66, 8.02], scale: [0.1, 1.28, 0.1] },
    ],
    [],
  );
  const foliage = useMemo<InstanceItem[]>(
    () =>
      trunks.flatMap(({ position }, treeIndex) =>
        Array.from({ length: 6 }, (_, index) => {
          const angle = (index / 6) * Math.PI * 2;
          return {
            position: [
              position[0] + Math.cos(angle) * 0.34,
              1.5 + treeIndex * 0.08 + (index % 2) * 0.28,
              position[2] + Math.sin(angle) * 0.34,
            ] as Vec3,
            scale: [0.48, 0.55, 0.48] as Vec3,
            color: index % 2 === 0 ? "#1c4434" : "#285641",
          };
        }),
      ),
    [trunks],
  );

  return (
    <group>
      <SphereInstances items={hedges} color={COLORS.hedge} />
      <SphereInstances items={flowers} color={COLORS.flower} />
      <CylinderInstances items={trunks} color="#3e3027" radialSegments={7} roughness={0.95} />
      <SphereInstances items={foliage} color="#1d4736" />
    </group>
  );
}

export default function UofTCampusDetailed() {
  const masonryBands = useMemo<InstanceItem[]>(
    () =>
      [0.35, 0.95, 1.58, 1.94].map((y) => ({
        position: [0, y, 1.376],
        scale: [6.18, 0.065, 0.09],
      })),
    [],
  );
  const buttresses = useMemo<InstanceItem[]>(
    () =>
      [-3.02, -1.3, 1.3, 3.02].map((x) => ({
        position: [x, 0.9, 1.48],
        scale: [0.16, 1.72, 0.28],
      })),
    [],
  );
  const towerQuoins = useMemo<InstanceItem[]>(
    () =>
      [-0.83, 0.83].flatMap((x) =>
        Array.from({ length: 10 }, (_, index) => ({
          position: [x, 0.38 + index * 0.41, 0.986],
          scale: [0.18, 0.16, 0.12],
        })),
      ),
    [],
  );
  const battlements = useMemo<InstanceItem[]>(
    () => [
      ...[-0.68, -0.34, 0, 0.34, 0.68].map((x) => ({
        position: [x, 4.62, 0.18] as Vec3,
        scale: [0.2, 0.34, 1.58] as Vec3,
      })),
      ...[-0.57, 0.57].flatMap((z) =>
        [-0.83, 0.83].map((x) => ({
          position: [x, 4.62, z] as Vec3,
          scale: [0.2, 0.34, 0.22] as Vec3,
        })),
      ),
    ],
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.035, 2.4]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[6.55, 0.07, 2.45]} />
        <meshStandardMaterial color={COLORS.lawn} roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.075, 2.34]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[1.45, 0.075, 2.25]} />
        <meshStandardMaterial color="#77766f" roughness={0.92} />
      </mesh>

      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 2.04, 2.72]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.92} />
      </mesh>
      <mesh position={[-2.65, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 2.5, 2.86]} />
        <meshStandardMaterial color="#575851" roughness={0.9} />
      </mesh>
      <mesh position={[2.65, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 2.5, 2.86]} />
        <meshStandardMaterial color="#575851" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.25, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 4.5, 1.62]} />
        <meshStandardMaterial color="#4e504d" roughness={0.92} />
      </mesh>

      <Roofs />
      <GothicWindows />
      <TowerWindows />
      <EntrancePorch />
      <CanadianFlag x={-1.08} />
      <CanadianFlag x={1.08} />

      <BoxInstances items={masonryBands} color={COLORS.stoneDark} roughness={0.9} />
      <BoxInstances items={buttresses} color={COLORS.stoneLight} roughness={0.84} />
      <BoxInstances items={towerQuoins} color={COLORS.stoneLight} roughness={0.84} />
      <BoxInstances items={battlements} color="#62635d" roughness={0.88} />

      <mesh position={[0, 4.42, 0.18]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[1.82, 0.16, 1.82]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.82} />
      </mesh>
      <mesh position={[0.58, 5.02, 0.18]} raycast={() => undefined}>
        <coneGeometry args={[0.18, 0.86, 4]} />
        <meshStandardMaterial color={COLORS.copper} metalness={0.34} roughness={0.55} />
      </mesh>
      <mesh position={[0, 3.01, 1.004]} raycast={() => undefined}>
        <torusGeometry args={[0.52, 0.075, 5, 26, Math.PI]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.76} />
      </mesh>

      <Landscaping />
      <CampusField />
      <CrestMonument />
    </group>
  );
}
