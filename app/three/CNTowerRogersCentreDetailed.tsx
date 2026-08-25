"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type BoxInstance = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

type BeamInstance = {
  start: Vec3;
  end: Vec3;
  radius: number;
};

const COLORS = {
  concrete: "#a8adb0",
  concreteDark: "#5b6266",
  concreteShadow: "#333c42",
  steel: "#75838b",
  steelDark: "#26343d",
  glass: "#12374d",
  blue: "#48c6ff",
  blueDark: "#0b5581",
  warm: "#ffc777",
  beacon: "#ff665d",
  stadiumWhite: "#c7cbca",
  stadiumShadow: "#505a60",
  stadiumBlue: "#174872",
  seatBlue: "#17659a",
  seatDark: "#0b2742",
  seatLight: "#45a8d4",
  field: "#1c713d",
  fieldLight: "#27864b",
  dirt: "#a45f3d",
};

const STADIUM_TIERS = [
  { inner: 0.49, outer: 0.58, y: 0.66, color: COLORS.seatLight },
  { inner: 0.59, outer: 0.68, y: 0.79, color: COLORS.seatBlue },
  { inner: 0.69, outer: 0.78, y: 0.94, color: COLORS.seatDark },
  { inner: 0.79, outer: 0.88, y: 1.1, color: COLORS.seatBlue },
  { inner: 0.89, outer: 0.97, y: 1.28, color: COLORS.seatDark },
] as const;

function StaticBoxes({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  interactive = true,
  metalness = 0.1,
  roughness = 0.7,
  castShadow = false,
  receiveShadow = false,
  vertexColors = false,
}: {
  items: BoxInstance[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  interactive?: boolean;
  metalness?: number;
  roughness?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
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
      castShadow={castShadow}
      raycast={interactive ? undefined : () => undefined}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={[1, 1, 1]} />
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

function StructuralBeam({
  start,
  end,
  radius,
  color = COLORS.concrete,
  interactive = true,
  shadows = false,
}: {
  start: Vec3;
  end: Vec3;
  radius: number;
  color?: string;
  interactive?: boolean;
  shadows?: boolean;
}) {
  const transform = useMemo(() => {
    const startPoint = new THREE.Vector3(...start);
    const endPoint = new THREE.Vector3(...end);
    const direction = endPoint.clone().sub(startPoint);
    return {
      length: direction.length(),
      midpoint: startPoint.add(endPoint).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
    };
  }, [end, start]);

  return (
    <mesh
      castShadow={shadows}
      position={transform.midpoint}
      quaternion={transform.quaternion}
      raycast={interactive ? undefined : () => undefined}
      receiveShadow={shadows}
    >
      <cylinderGeometry args={[radius, radius, transform.length, 8]} />
      <meshStandardMaterial color={color} metalness={0.18} roughness={0.55} />
    </mesh>
  );
}

/** Repeated support beams share one geometry/material and one shadow-free draw call. */
function StaticBeams({
  items,
  color,
}: {
  items: BeamInstance[];
  color: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const direction = new THREE.Vector3();

    items.forEach((item, index) => {
      start.set(...item.start);
      end.set(...item.end);
      direction.copy(end).sub(start);
      helper.position.copy(start).add(end).multiplyScalar(0.5);
      helper.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      helper.scale.set(item.radius, direction.length(), item.radius);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, items.length]}
      raycast={() => undefined}
    >
      <cylinderGeometry args={[1, 1, 1, 6]} />
      <meshStandardMaterial color={color} metalness={0.18} roughness={0.55} />
    </instancedMesh>
  );
}

function GlowBeam({ start, end, radius, color = COLORS.blue }: {
  start: Vec3;
  end: Vec3;
  radius: number;
  color?: string;
}) {
  const transform = useMemo(() => {
    const startPoint = new THREE.Vector3(...start);
    const endPoint = new THREE.Vector3(...end);
    const direction = endPoint.clone().sub(startPoint);
    return {
      length: direction.length(),
      midpoint: startPoint.add(endPoint).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
    };
  }, [end, start]);

  return (
    <group position={transform.midpoint} quaternion={transform.quaternion}>
      <mesh raycast={() => undefined}>
        <cylinderGeometry args={[radius, radius, transform.length, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh raycast={() => undefined}>
        <cylinderGeometry args={[radius * 2.8, radius * 2.8, transform.length, 8]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={color}
          depthWrite={false}
          opacity={0.13}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function StaticCylinders({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.2,
  radialSegments = 8,
  roughness = 0.58,
  topRadius = 1,
  castShadow = false,
  receiveShadow = false,
}: {
  items: BoxInstance[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  radialSegments?: number;
  roughness?: number;
  topRadius?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
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
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, items.length]}
      castShadow={castShadow}
      raycast={() => undefined}
      receiveShadow={receiveShadow}
    >
      <cylinderGeometry args={[topRadius, 1, 1, radialSegments]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
      />
    </instancedMesh>
  );
}

function StaticFoliage({ items, color }: { items: BoxInstance[]; color: string }) {
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
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.88} vertexColors />
    </instancedMesh>
  );
}

type PlazaFixture = {
  x: number;
  z: number;
  yaw?: number;
};

const PLAZA_TREES = [
  { x: -6.72, z: -2.38, scale: 0.86 },
  { x: -0.42, z: -2.48, scale: 0.78 },
  { x: 6.78, z: -1, scale: 0.78 },
  { x: -6.77, z: 2.38, scale: 0.76 },
] as const;

const PLAZA_LAMPS: readonly PlazaFixture[] = [
  { x: -5.55, z: -2.56 },
  { x: -2.25, z: -2.56 },
  { x: 1.85, z: -2.56 },
  { x: 5.62, z: -2.56 },
  { x: 1.45, z: 3.35 },
];

function PlazaTrees() {
  const planterBodies = useMemo<BoxInstance[]>(
    () =>
      PLAZA_TREES.flatMap((tree) => [
        {
          position: [tree.x, 0.16, tree.z],
          scale: [0.7 * tree.scale, 0.25, 0.7 * tree.scale],
        },
        {
          position: [tree.x, 0.3, tree.z],
          scale: [0.79 * tree.scale, 0.055, 0.79 * tree.scale],
        },
      ]),
    [],
  );
  const soil = useMemo<BoxInstance[]>(
    () =>
      PLAZA_TREES.map((tree) => ({
        position: [tree.x, 0.337, tree.z],
        scale: [0.56 * tree.scale, 0.024, 0.56 * tree.scale],
        rotation: [0, Math.PI / 4, 0],
      })),
    [],
  );
  const trunks = useMemo<BoxInstance[]>(
    () =>
      PLAZA_TREES.map((tree) => ({
        position: [tree.x, 0.68, tree.z],
        scale: [0.065 * tree.scale, 0.7 * tree.scale, 0.065 * tree.scale],
      })),
    [],
  );
  const crowns = useMemo<BoxInstance[]>(
    () =>
      PLAZA_TREES.flatMap((tree, index) => [
        {
          position: [tree.x, 1.02 * tree.scale + 0.23, tree.z],
          rotation: [0.12, index * 0.63, 0.08],
          scale: [0.38 * tree.scale, 0.46 * tree.scale, 0.36 * tree.scale],
          color: index % 2 === 0 ? "#174735" : "#113b31",
        },
        {
          position: [tree.x - 0.14 * tree.scale, 1.2 * tree.scale + 0.23, tree.z + 0.02],
          rotation: [0, index * 0.41, -0.08],
          scale: [0.29 * tree.scale, 0.34 * tree.scale, 0.3 * tree.scale],
          color: index % 2 === 0 ? "#205846" : "#194d3b",
        },
      ]),
    [],
  );

  return (
    <group>
      <StaticBoxes
        items={planterBodies}
        color="#526068"
        interactive={false}
        metalness={0.18}
        roughness={0.74}
      />
      <StaticBoxes
        items={soil}
        color="#25342c"
        interactive={false}
        metalness={0.03}
        roughness={0.96}
      />
      <StaticCylinders
        items={trunks}
        color="#594c3e"
        metalness={0.04}
        roughness={0.9}
        topRadius={0.72}
      />
      <StaticFoliage color="#164433" items={crowns} />
    </group>
  );
}

function PlazaLamps() {
  const poles = useMemo<BoxInstance[]>(
    () =>
      PLAZA_LAMPS.map((lamp) => ({
        position: [lamp.x, 0.78, lamp.z],
        scale: [0.035, 1.42, 0.035],
      })),
    [],
  );
  const bases = useMemo<BoxInstance[]>(
    () =>
      PLAZA_LAMPS.map((lamp) => ({
        position: [lamp.x, 0.13, lamp.z],
        scale: [0.09, 0.2, 0.09],
      })),
    [],
  );
  const arms = useMemo<BoxInstance[]>(
    () =>
      PLAZA_LAMPS.map((lamp, index) => ({
        position: [lamp.x + (index % 2 === 0 ? 0.12 : -0.12), 1.46, lamp.z],
        scale: [0.28, 0.035, 0.035],
      })),
    [],
  );
  const heads = useMemo<BoxInstance[]>(
    () =>
      PLAZA_LAMPS.map((lamp, index) => ({
        position: [lamp.x + (index % 2 === 0 ? 0.25 : -0.25), 1.42, lamp.z],
        scale: [0.23, 0.1, 0.15],
      })),
    [],
  );
  const bulbs = useMemo<BoxInstance[]>(
    () =>
      PLAZA_LAMPS.map((lamp, index) => ({
        position: [lamp.x + (index % 2 === 0 ? 0.25 : -0.25), 1.365, lamp.z],
        scale: [0.17, 0.014, 0.1],
      })),
    [],
  );

  return (
    <group>
      <StaticCylinders items={bases} color="#53616a" metalness={0.65} roughness={0.35} />
      <StaticCylinders items={poles} color="#31454f" metalness={0.72} roughness={0.32} />
      <StaticBoxes
        items={[...arms, ...heads]}
        color="#334751"
        interactive={false}
        metalness={0.72}
        roughness={0.3}
      />
      <StaticBoxes
        items={bulbs}
        color="#ffe5b8"
        emissive="#a95f28"
        emissiveIntensity={2.1}
        interactive={false}
        metalness={0.05}
        roughness={0.2}
      />
    </group>
  );
}

function StadiumEntryGates() {
  const gateCenters = useMemo(() => [-1.35, -0.85, -0.35, 0.15], []);
  const cabinets = useMemo<BoxInstance[]>(
    () =>
      gateCenters.flatMap((x) => [
        { position: [x, 0.31, 2.51], scale: [0.14, 0.48, 0.28] },
        { position: [x, 0.58, 2.51], scale: [0.18, 0.08, 0.32] },
      ]),
    [gateCenters],
  );
  const scanners = useMemo<BoxInstance[]>(
    () =>
      gateCenters.map((x) => ({
        position: [x, 0.63, 2.53],
        scale: [0.09, 0.018, 0.18],
      })),
    [gateCenters],
  );
  const arms = useMemo<BoxInstance[]>(() => {
    const armLength = 0.25;
    return gateCenters.flatMap((x) =>
      [-Math.PI / 2, Math.PI / 6, (Math.PI * 5) / 6].map((rotationZ) => {
        const directionX = -Math.sin(rotationZ);
        const directionY = Math.cos(rotationZ);
        return {
          position: [
            x + directionX * armLength * 0.5,
            0.47 + directionY * armLength * 0.5,
            2.365,
          ] as Vec3,
          rotation: [0, 0, rotationZ] as Vec3,
          scale: [0.018, armLength, 0.018] as Vec3,
        };
      }),
    );
  }, [gateCenters]);
  const laneRails = useMemo<BoxInstance[]>(
    () =>
      [-1.61, -1.1, -0.6, -0.1, 0.41].flatMap((x) => [
        { position: [x, 0.45, 2.31], scale: [0.035, 0.74, 0.035] },
        { position: [x, 0.45, 2.72], scale: [0.035, 0.74, 0.035] },
        { position: [x, 0.63, 2.515], scale: [0.035, 0.035, 0.41] },
      ]),
    [],
  );

  return (
    <group>
      <StaticBoxes
        items={cabinets}
        color="#364952"
        interactive={false}
        metalness={0.62}
        roughness={0.34}
      />
      <StaticBoxes
        items={scanners}
        color="#b8f1ff"
        emissive={COLORS.blue}
        emissiveIntensity={1.7}
        interactive={false}
        metalness={0.12}
        roughness={0.22}
      />
      <StaticCylinders items={arms} color="#8c999f" metalness={0.76} radialSegments={8} roughness={0.27} />
      <StaticBoxes
        items={laneRails}
        color="#64747c"
        interactive={false}
        metalness={0.72}
        roughness={0.3}
      />
    </group>
  );
}

function CNTowerBollards() {
  const positions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const angle = Math.PI * (0.12 + index * (0.76 / 9));
        return {
          x: 4 + Math.cos(angle) * 2.97,
          z: -0.285 + Math.sin(angle) * 2.97,
        };
      }),
    [],
  );
  const posts = useMemo<BoxInstance[]>(
    () =>
      positions.map(({ x, z }) => ({
        position: [x, 0.29, z],
        scale: [0.065, 0.48, 0.065],
      })),
    [positions],
  );
  const lightBands = useMemo<BoxInstance[]>(
    () =>
      positions.map(({ x, z }) => ({
        position: [x, 0.46, z],
        scale: [0.071, 0.045, 0.071],
      })),
    [positions],
  );

  return (
    <group>
      <StaticCylinders items={posts} color="#63727a" metalness={0.78} roughness={0.28} topRadius={0.82} />
      <StaticCylinders
        items={lightBands}
        color="#9be8ff"
        emissive={COLORS.blue}
        emissiveIntensity={1.45}
        metalness={0.22}
        radialSegments={10}
        roughness={0.2}
      />
    </group>
  );
}

function PlazaRailings() {
  const rails = useMemo<BoxInstance[]>(
    () => [
      { position: [-6.15, 0.48, -2.7], scale: [1.45, 0.035, 0.035] },
      { position: [-1.65, 0.48, -2.7], scale: [1.45, 0.035, 0.035] },
      { position: [5.65, 0.48, -2.7], scale: [1.05, 0.035, 0.035] },
      { position: [-6.15, 0.27, -2.7], scale: [1.45, 0.035, 0.035] },
      { position: [-1.65, 0.27, -2.7], scale: [1.45, 0.035, 0.035] },
      { position: [5.65, 0.27, -2.7], scale: [1.05, 0.035, 0.035] },
    ],
    [],
  );
  const posts = useMemo<BoxInstance[]>(
    () => [
      ...[-6.88, -6.15, -5.42, -2.38, -1.65, -0.92, 5.12, 5.65, 6.18].map((x) => ({
        position: [x, 0.32, -2.7] as Vec3,
        scale: [0.045, 0.58, 0.045] as Vec3,
      })),
    ],
    [],
  );

  return (
    <StaticBoxes
      items={[...rails, ...posts]}
      color="#516670"
      interactive={false}
      metalness={0.75}
      roughness={0.3}
    />
  );
}

function PlazaKiosksAndStreetFurniture() {
  const bins = useMemo<BoxInstance[]>(
    () => [
      { position: [-4.74, 0.31, 3.35], scale: [0.3, 0.55, 0.3] },
      { position: [1.22, 0.31, -2.48], scale: [0.3, 0.55, 0.3] },
    ],
    [],
  );
  const binLids = useMemo<BoxInstance[]>(
    () =>
      bins.map((bin) => ({
        position: [bin.position[0], 0.6, bin.position[2]],
        scale: [0.33, 0.055, 0.33],
      })),
    [bins],
  );

  return (
    <group>
      <group position={[0.57, 0, 1.12]}>
        <mesh position={[0, 0.49, 0]} raycast={() => undefined}>
          <boxGeometry args={[0.42, 0.94, 0.32]} />
          <meshStandardMaterial color="#354852" metalness={0.52} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.61, 0.166]} raycast={() => undefined}>
          <planeGeometry args={[0.27, 0.36]} />
          <meshBasicMaterial color="#4fc8f2" opacity={0.84} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.85, 0.169]} raycast={() => undefined}>
          <planeGeometry args={[0.2, 0.045]} />
          <meshBasicMaterial color="#ffd181" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.99, 0]} raycast={() => undefined}>
          <boxGeometry args={[0.52, 0.08, 0.4]} />
          <meshStandardMaterial color="#718087" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      <group position={[0.95, 0, -1.56]}>
        <mesh position={[0, 0.66, 0]} raycast={() => undefined}>
          <boxGeometry args={[0.18, 1.22, 0.2]} />
          <meshStandardMaterial color="#384d58" metalness={0.5} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.78, 0.106]} raycast={() => undefined}>
          <planeGeometry args={[0.11, 0.42]} />
          <meshBasicMaterial color="#72dcff" opacity={0.82} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.12, 0.108]} raycast={() => undefined}>
          <planeGeometry args={[0.11, 0.11]} />
          <meshBasicMaterial color="#ffca74" toneMapped={false} />
        </mesh>
      </group>
      <StaticBoxes
        items={bins}
        color="#30414a"
        interactive={false}
        metalness={0.46}
        roughness={0.46}
      />
      <StaticBoxes
        items={binLids}
        color="#65747b"
        interactive={false}
        metalness={0.65}
        roughness={0.32}
      />
      {[-1.28, -0.76, -0.24].map((z) => (
        <mesh
          key={z}
          position={[6.83, 0.28, z]}
          raycast={() => undefined}
          rotation-y={Math.PI / 2}
        >
          <torusGeometry args={[0.22, 0.022, 6, 14]} />
          <meshStandardMaterial color="#71818a" metalness={0.78} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function WaterfrontPlantingBand() {
  const shrubs = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 15 }, (_, index) => ({
        position: [-6.55 + index * 0.42, 0.43 + (index % 3) * 0.025, 4.27 + (index % 2) * 0.08] as Vec3,
        rotation: [0.06 * (index % 2), index * 0.71, -0.04 * (index % 3)] as Vec3,
        scale: [0.25 + (index % 3) * 0.025, 0.24 + (index % 4) * 0.025, 0.22 + (index % 2) * 0.035] as Vec3,
        color: index % 3 === 0 ? "#285844" : index % 3 === 1 ? "#1f4d3b" : "#31634b",
      })),
    [],
  );

  return (
    <group>
      <mesh position={[-3.6, 0.15, 4.27]} raycast={() => undefined} receiveShadow>
        <boxGeometry args={[7.05, 0.24, 1]} />
        <meshStandardMaterial color="#69757a" metalness={0.12} roughness={0.82} />
      </mesh>
      <mesh position={[-3.6, 0.285, 4.27]} raycast={() => undefined} receiveShadow>
        <boxGeometry args={[6.7, 0.05, 0.72]} />
        <meshStandardMaterial color="#25352d" metalness={0.02} roughness={0.98} />
      </mesh>
      <StaticFoliage color="#285844" items={shrubs} />
    </group>
  );
}

function PlazaWaterfrontFillers() {
  const apron = useMemo(() => {
    const outline = [
      [-7.2, 3.73],
      [5.98, 3.73],
      [3, 4.135],
      [0, 4.486],
      [-3, 4.785],
      [-7.2, 5.014],
    ];
    const shape = new THREE.Shape();
    shape.moveTo(outline[0][0], -outline[0][1]);
    outline.slice(1).forEach(([x, z]) => shape.lineTo(x, -z));
    shape.closePath();
    return shape;
  }, []);

  return (
    <mesh
      position={[0, 0.073, 0]}
      raycast={() => undefined}
      receiveShadow
      rotation-x={-Math.PI / 2}
    >
      <shapeGeometry args={[apron, 1]} />
      <meshStandardMaterial
        color="#6a777d"
        metalness={0.16}
        roughness={0.82}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Shared non-interactive plaza that visually joins the two former blocks. */
export function CNRogersPlaza() {
  const paverTiles = useMemo<BoxInstance[]>(() => {
    const tiles: BoxInstance[] = [];
    const tones = ["#68757b", "#6c797f", "#707d83", "#6a777d"];
    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        tiles.push({
          position: [-6.6 + column * 1.2, 0.061, -2.43 + row * 0.72],
          scale: [1.15, 0.026, 0.68],
          color: tones[(row * 3 + column) % tones.length],
        });
      }
    }
    return tiles;
  }, []);
  const paverJoints = useMemo<BoxInstance[]>(() => {
    const joints: BoxInstance[] = [];
    for (let x = -6; x <= 6; x += 1.2) {
      joints.push({
        position: [x, 0.078, 0.45],
        scale: [0.014, 0.008, 6.5],
      });
    }
    for (let z = -2.1; z <= 3.3; z += 0.9) {
      joints.push({
        position: [0, 0.079, z],
        scale: [14.18, 0.008, 0.014],
      });
    }
    return joints;
  }, []);

  const lightInlays = useMemo<BoxInstance[]>(
    () => [
      { position: [-0.2, 0.086, -2.17], scale: [8.2, 0.01, 0.026] },
      { position: [2.55, 0.087, 3.18], scale: [3.4, 0.01, 0.026] },
      { position: [0.86, 0.087, 0.55], scale: [0.026, 0.01, 1.76] },
    ],
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.024, 0.45]} raycast={() => undefined} receiveShadow>
        <boxGeometry args={[14.4, 0.048, 6.6]} />
        <meshStandardMaterial color="#56636a" metalness={0.12} roughness={0.88} />
      </mesh>
      <StaticBoxes
        items={paverTiles}
        color="#707e84"
        interactive={false}
        metalness={0.16}
        roughness={0.82}
        vertexColors
      />
      <mesh position={[0.65, 0.077, 0.45]} raycast={() => undefined} receiveShadow>
        <boxGeometry args={[1.18, 0.014, 6.25]} />
        <meshStandardMaterial color="#829097" metalness={0.16} roughness={0.78} />
      </mesh>
      <mesh position={[0.04, 0.087, 0.45]} raycast={() => undefined} receiveShadow>
        <boxGeometry args={[0.018, 0.014, 6.12]} />
        <meshBasicMaterial color="#84dfff" opacity={0.62} transparent toneMapped={false} />
      </mesh>
      <StaticBoxes
        items={paverJoints}
        color="#354249"
        interactive={false}
        metalness={0.22}
        roughness={0.7}
      />
      <StaticBoxes
        items={lightInlays}
        color={COLORS.blue}
        emissive={COLORS.blueDark}
        emissiveIntensity={1.15}
        interactive={false}
        metalness={0.12}
        roughness={0.3}
      />
      <PlazaWaterfrontFillers />
      <PlazaTrees />
      <PlazaLamps />
      <StadiumEntryGates />
      <CNTowerBollards />
      <PlazaRailings />
      <PlazaKiosksAndStreetFurniture />
      <WaterfrontPlantingBand />
    </group>
  );
}

function TowerBeacon({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const beacon = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!active) return;
    const pulse = reducedMotion
      ? 0.88
      : 0.5 + Math.max(0, Math.sin(clock.elapsedTime * 2.7)) * 0.5;
    if (beacon.current) beacon.current.opacity = pulse;
    if (halo.current) halo.current.opacity = pulse * 0.22;
  });

  return (
    <group position={[0, 12.68, 0]}>
      <mesh>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshBasicMaterial
          ref={beacon}
          color={COLORS.beacon}
          opacity={0.9}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh raycast={() => undefined}>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshBasicMaterial
          ref={halo}
          blending={THREE.AdditiveBlending}
          color={COLORS.beacon}
          depthWrite={false}
          opacity={0.18}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ObservationDeck() {
  const windows = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const angle = (index / 36) * Math.PI * 2;
        const warm = index % 9 === 2 || index % 13 === 4;
        return {
          position: [Math.sin(angle) * 0.94, 8.08, Math.cos(angle) * 0.94],
          rotation: [0, angle, 0],
          scale: [0.115, 0.2, 0.045],
          color: warm ? "#ffd18c" : index % 4 === 0 ? "#89ddff" : "#1d6285",
        };
      }),
    [],
  );

  const upperWindows = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        return {
          position: [Math.sin(angle) * 0.76, 8.43, Math.cos(angle) * 0.76],
          rotation: [0, angle, 0],
          scale: [0.12, 0.14, 0.035],
          color: index % 8 === 1 ? "#ffc979" : "#28789d",
        };
      }),
    [],
  );

  return (
    <group>
      <mesh position={[0, 7.73, 0]}>
        <cylinderGeometry args={[0.76, 0.42, 0.34, 24]} />
        <meshStandardMaterial color="#989fa4" metalness={0.34} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0, 7.91, 0]} receiveShadow>
        <cylinderGeometry args={[1.14, 0.75, 0.25, 28]} />
        <meshStandardMaterial color={COLORS.concrete} metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, 8.08, 0]}>
        <cylinderGeometry args={[0.98, 1.02, 0.28, 28]} />
        <meshPhysicalMaterial
          clearcoat={0.92}
          clearcoatRoughness={0.09}
          color={COLORS.glass}
          emissive={COLORS.blueDark}
          emissiveIntensity={0.42}
          metalness={0.3}
          opacity={0.82}
          roughness={0.15}
          transparent
        />
      </mesh>
      <StaticBoxes
        items={windows}
        color={COLORS.glass}
        emissive={COLORS.blueDark}
        emissiveIntensity={0.48}
        metalness={0.25}
        roughness={0.2}
        vertexColors
      />
      {[7.96, 8.2, 8.31].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[index === 2 ? 0.82 : 1.02, index === 2 ? 0.035 : 0.045, 6, 32]} />
          <meshStandardMaterial
            color={index === 1 ? "#cbd1d3" : "#7d8990"}
            metalness={0.72}
            roughness={0.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 8.41, 0]}>
        <cylinderGeometry args={[0.79, 0.85, 0.3, 24]} />
        <meshPhysicalMaterial
          clearcoat={0.82}
          color="#22495c"
          emissive="#153f55"
          emissiveIntensity={0.28}
          metalness={0.28}
          roughness={0.21}
        />
      </mesh>
      <StaticBoxes
        items={upperWindows}
        color={COLORS.glass}
        emissive={COLORS.blueDark}
        emissiveIntensity={0.36}
        metalness={0.2}
        roughness={0.24}
        vertexColors
      />
      <mesh position={[0, 8.61, 0]}>
        <cylinderGeometry args={[0.53, 0.75, 0.18, 24]} />
        <meshStandardMaterial color="#aab1b5" metalness={0.36} roughness={0.38} />
      </mesh>
      <mesh position={[0, 8.21, 0]} rotation-x={Math.PI / 2} raycast={() => undefined}>
        <torusGeometry args={[1.055, 0.035, 6, 32]} />
        <meshBasicMaterial color={COLORS.blue} toneMapped={false} />
      </mesh>
      <mesh position={[0, 8.21, 0]} rotation-x={Math.PI / 2} raycast={() => undefined}>
        <torusGeometry args={[1.065, 0.085, 6, 32]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={COLORS.blue}
          depthWrite={false}
          opacity={0.13}
          transparent
          toneMapped={false}
        />
      </mesh>
      <pointLight color={COLORS.blue} decay={2} distance={8.5} intensity={6.4} position={[0, 8.15, 0]} />
    </group>
  );
}

/**
 * Detailed CN Tower, centred on its local origin. The visible footprint is
 * approximately 5.25 x 5.25 units and its aircraft beacon reaches y=12.68.
 */
export function CNTowerDetailed({
  active = true,
  reducedMotion = false,
}: {
  active?: boolean;
  reducedMotion?: boolean;
}) {
  const legAngles = useMemo(() => [Math.PI / 2, Math.PI / 2 + (Math.PI * 2) / 3, Math.PI / 2 + (Math.PI * 4) / 3], []);
  const redAntennaBands = useMemo<BoxInstance[]>(
    () => [
      { position: [0, 10.67, 0], scale: [0.07, 0.26, 0.07] },
      { position: [0, 11.48, 0], scale: [0.046, 0.16, 0.046] },
      { position: [0, 12.28, 0], scale: [0.028, 0.16, 0.028] },
    ],
    [],
  );

  return (
    <group>
      <mesh castShadow position={[0, 0.045, 0]} receiveShadow rotation-y={Math.PI / 6}>
        <cylinderGeometry args={[2.45, 2.62, 0.09, 6]} />
        <meshStandardMaterial color="#545d61" metalness={0.12} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.098, 0]} receiveShadow rotation={[-Math.PI / 2, Math.PI / 6, 0]}>
        <ringGeometry args={[1.46, 2.26, 6, 2]} />
        <meshStandardMaterial color="#81878a" metalness={0.08} roughness={0.86} side={THREE.DoubleSide} />
      </mesh>
      {legAngles.map((angle, index) => {
        const foot: Vec3 = [Math.cos(angle) * 1.18, 0.18, Math.sin(angle) * 1.18];
        const glowStart: Vec3 = [Math.cos(angle) * 1.08, 0.3, Math.sin(angle) * 1.08];
        const glowEnd: Vec3 = [Math.cos(angle) * 0.12, 4.64, Math.sin(angle) * 0.12];
        return (
          <group key={angle}>
            <mesh castShadow position={[foot[0], 0.16, foot[2]]} receiveShadow rotation-y={angle}>
              <cylinderGeometry args={[0.34, 0.44, 0.32, 6]} />
              <meshStandardMaterial color="#6e7477" metalness={0.14} roughness={0.66} />
            </mesh>
            <StructuralBeam
              color={index === 1 ? "#999fa2" : COLORS.concrete}
              end={[0, 4.88, 0]}
              radius={0.2}
              shadows
              start={foot}
            />
            <GlowBeam end={glowEnd} radius={0.024} start={glowStart} />
            <mesh position={[Math.cos(angle) * 1.84, 0.18, Math.sin(angle) * 1.84]} rotation-y={Math.PI / 2 - angle}>
              <boxGeometry args={[0.74, 0.24, 0.48]} />
              <meshStandardMaterial color="#39454b" metalness={0.28} roughness={0.65} />
            </mesh>
          </group>
        );
      })}
      <mesh castShadow position={[0, 4.11, 0]} receiveShadow>
        <cylinderGeometry args={[0.235, 0.54, 7.34, 18]} />
        <meshStandardMaterial color="#b3b8bb" metalness={0.18} roughness={0.5} />
      </mesh>
      {[2.15, 3.65, 5.2, 6.55].map((y, index) => (
        <group key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
          <mesh>
            <torusGeometry args={[0.52 - index * 0.08, 0.025, 6, 20]} />
            <meshStandardMaterial
              color="#71818a"
              emissive={COLORS.blueDark}
              emissiveIntensity={index % 2 === 0 ? 0.52 : 0.32}
              metalness={0.68}
              roughness={0.32}
            />
          </mesh>
          <mesh raycast={() => undefined}>
            <torusGeometry args={[0.535 - index * 0.08, 0.01, 5, 20]} />
            <meshBasicMaterial
              blending={THREE.AdditiveBlending}
              color={COLORS.blue}
              depthWrite={false}
              opacity={0.58}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <ObservationDeck />
      <mesh position={[0, 8.84, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 0.46, 16]} />
        <meshStandardMaterial color="#9fa7ab" metalness={0.38} roughness={0.4} />
      </mesh>
      <mesh position={[0, 10.69, 0]}>
        <cylinderGeometry args={[0.014, 0.15, 3.86, 8]} />
        <meshStandardMaterial color="#d3d7d8" metalness={0.48} roughness={0.38} />
      </mesh>
      <StaticCylinders
        color="#e85d57"
        items={redAntennaBands}
        metalness={0.42}
        radialSegments={8}
        roughness={0.4}
        topRadius={0.86}
      />
      {[10.55, 11.4, 12.2].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} raycast={() => undefined}>
          <torusGeometry args={[0.095, 0.012, 5, 12]} />
          <meshBasicMaterial color={COLORS.beacon} toneMapped={false} />
        </mesh>
      ))}
      <TowerBeacon active={active} reducedMotion={reducedMotion} />
    </group>
  );
}

function EllipseRing({
  color,
  emissive,
  emissiveIntensity = 0,
  radius = 1,
  tube = 0.018,
  width = 3.4,
  depth = 2.8,
  y,
}: {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  radius?: number;
  tube?: number;
  width?: number;
  depth?: number;
  y: number;
}) {
  return (
    <mesh
      position={[0, y, 0]}
      raycast={() => undefined}
      rotation-x={-Math.PI / 2}
      scale={[width, depth, 1]}
    >
      <torusGeometry args={[radius, tube, 6, 40]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.62}
        roughness={0.34}
      />
    </mesh>
  );
}

function BaseballField() {
  const grassStripes = useMemo<BoxInstance[]>(() => {
    const stripes: BoxInstance[] = [];
    for (let index = 0; index < 13; index += 1) {
      const x = -1.44 + index * 0.24;
      const halfDepth = 1.04 * Math.sqrt(Math.max(0, 1 - (x * x) / (1.63 * 1.63)));
      stripes.push({
        position: [x, 0.485, -0.04],
        scale: [0.235, 0.012, halfDepth * 2],
        color: index % 2 === 0 ? COLORS.field : COLORS.fieldLight,
      });
    }
    return stripes;
  }, []);

  const bases = useMemo<BoxInstance[]>(
    () => [
      { position: [0.61, 0.54, 0.16], rotation: [0, Math.PI / 4, 0], scale: [0.12, 0.025, 0.12] },
      { position: [0, 0.54, -0.45], rotation: [0, Math.PI / 4, 0], scale: [0.12, 0.025, 0.12] },
      { position: [-0.61, 0.54, 0.16], rotation: [0, Math.PI / 4, 0], scale: [0.12, 0.025, 0.12] },
      { position: [0, 0.54, 0.79], rotation: [0, Math.PI / 4, 0], scale: [0.12, 0.025, 0.12] },
    ],
    [],
  );
  const foulLines = useMemo<BeamInstance[]>(
    () => [
      { start: [0, 0.545, 0.82], end: [0.78, 0.545, 0.01], radius: 0.012 },
      { start: [0, 0.545, 0.82], end: [-0.78, 0.545, 0.01], radius: 0.012 },
    ],
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.47, -0.04]} raycast={() => undefined} rotation-x={-Math.PI / 2} scale={[1.72, 1.15, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color={COLORS.field} roughness={0.94} />
      </mesh>
      <StaticBoxes items={grassStripes} color={COLORS.field} interactive={false} roughness={0.96} vertexColors />
      <mesh position={[0, 0.51, 0.15]} raycast={() => undefined} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[0.73, 0.73, 1]}>
        <circleGeometry args={[1, 4]} />
        <meshStandardMaterial color={COLORS.dirt} roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.525, 0.12]} raycast={() => undefined} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#b7794f" roughness={0.98} />
      </mesh>
      <StaticBeams color="#f5ead0" items={foulLines} />
      <StaticBoxes items={bases} color="#f7f1df" interactive={false} metalness={0.02} roughness={0.8} />
      <mesh position={[0, 0.55, 0.83]} raycast={() => undefined} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.095, 5]} />
        <meshBasicMaterial color="#fff7df" toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.08, 0.62, 0.55]}>
          <mesh raycast={() => undefined}>
            <boxGeometry args={[0.68, 0.15, 0.22]} />
            <meshStandardMaterial color="#20323f" metalness={0.24} roughness={0.56} />
          </mesh>
          <mesh position={[0, 0.09, 0]} raycast={() => undefined}>
            <boxGeometry args={[0.58, 0.035, 0.16]} />
            <meshBasicMaterial color={COLORS.blue} opacity={0.55} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function StadiumSeating() {
  const seats = useMemo<BoxInstance[]>(() => {
    const result: BoxInstance[] = [];
    STADIUM_TIERS.forEach((tier, tierIndex) => {
      const radius = (tier.inner + tier.outer) * 0.5;
      const count = 48 + tierIndex * 8;
      for (let index = 0; index < count; index += 1) {
        if (index % 12 === 0 || index % 12 === 1) continue;
        const angle = (index / count) * Math.PI * 2;
        result.push({
          position: [Math.cos(angle) * radius * 2.72, tier.y + 0.035, Math.sin(angle) * radius * 2],
          rotation: [0, Math.PI / 2 - angle, 0],
          scale: [0.075, 0.055, 0.095],
          color:
            tierIndex === 0 && index % 9 === 0
              ? "#dd5962"
              : tierIndex % 2 === 0
                ? COLORS.seatLight
                : index % 5 === 0
                  ? COLORS.seatBlue
                  : COLORS.seatDark,
        });
      }
    });
    return result;
  }, []);
  const supports = useMemo<BeamInstance[]>(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return {
          start: [Math.cos(angle) * 1.36, 0.65, Math.sin(angle) * 0.95],
          end: [Math.cos(angle) * 2.58, 1.3, Math.sin(angle) * 1.92],
          radius: 0.018,
        };
      }),
    [],
  );

  return (
    <group>
      {STADIUM_TIERS.map((tier) => (
        <mesh
          key={tier.y}
          position={[0, tier.y, 0]}
          raycast={() => undefined}
          rotation-x={-Math.PI / 2}
          scale={[2.84, 2.12, 1]}
        >
          <ringGeometry args={[tier.inner, tier.outer, 44, 1]} />
          <meshStandardMaterial color={tier.color} metalness={0.08} roughness={0.86} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <StaticBoxes items={seats} color={COLORS.seatBlue} interactive={false} roughness={0.78} vertexColors />
      <StaticBeams color="#9ca6a9" items={supports} />
    </group>
  );
}

function RetractableRoof() {
  const panels = [
    { start: 0.14, length: 0.74, y: 2.01, color: "#d8d9d5" },
    { start: 0.92, length: 0.62, y: 2.06, color: "#bfc3c2" },
    { start: 1.59, length: 0.72, y: 2.02, color: "#d4d5d1" },
    { start: 2.36, length: 0.53, y: 1.98, color: "#b8bdbe" },
    { start: 4.34, length: 0.45, y: 1.96, color: "#c9ccca" },
    { start: 5.18, length: 0.48, y: 1.98, color: "#d7d8d4" },
  ];
  const supports = useMemo<BeamInstance[]>(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        if (angle > 2.9 && angle < 4.25) return null;
        return {
          start: [Math.cos(angle) * 2.13, 1.92, Math.sin(angle) * 1.58],
          end: [Math.cos(angle) * 3.22, 2.02, Math.sin(angle) * 2.45],
          radius: 0.024,
        } satisfies BeamInstance;
      }).filter((beam): beam is BeamInstance => beam !== null),
    [],
  );

  return (
    <group>
      {panels.map((panel) => (
        <mesh
          key={panel.start}
          position={[0, panel.y, 0]}
          raycast={() => undefined}
          rotation-x={-Math.PI / 2}
          scale={[3.31, 2.52, 1]}
        >
          <ringGeometry args={[0.64, 1, 34, 2, panel.start, panel.length]} />
          <meshStandardMaterial
            color={panel.color}
            metalness={0.42}
            roughness={0.48}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <EllipseRing color="#edf0ef" depth={2.51} tube={0.026} width={3.32} y={2.01} />
      <EllipseRing color="#78858a" depth={1.6} tube={0.022} width={2.16} y={1.92} />
      <StaticBeams color="#90999b" items={supports} />
    </group>
  );
}

function StadiumScoreboard({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const screen = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!active) return;
    if (!screen.current) return;
    screen.current.opacity = reducedMotion
      ? 0.86
      : 0.79 + Math.sin(clock.elapsedTime * 0.85) * 0.07;
  });

  return (
    <group position={[0, 1.37, -2.02]}>
      <mesh raycast={() => undefined}>
        <boxGeometry args={[1.18, 0.56, 0.09]} />
        <meshStandardMaterial color="#101922" metalness={0.52} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0, 0.052]} raycast={() => undefined}>
        <planeGeometry args={[1.03, 0.42]} />
        <meshBasicMaterial ref={screen} color="#1d88bc" opacity={0.86} transparent toneMapped={false} />
      </mesh>
      {[-0.3, 0, 0.3].map((x, index) => (
        <mesh key={x} position={[x, index === 1 ? 0.04 : -0.06, 0.057]} raycast={() => undefined}>
          <boxGeometry args={[0.17, index === 1 ? 0.2 : 0.1, 0.008]} />
          <meshBasicMaterial color={index === 1 ? "#ffcf74" : "#b8efff"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function BlueJaysTributeBanner() {
  const cloth = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.66, 0.22);
    shape.lineTo(0.66, 0.22);
    shape.lineTo(0.64, -0.18);
    shape.quadraticCurveTo(0.33, -0.235, 0, -0.2);
    shape.quadraticCurveTo(-0.33, -0.245, -0.64, -0.18);
    shape.closePath();
    return shape;
  }, []);
  const jayHead = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.105, 0.018);
    shape.lineTo(-0.045, 0.105);
    shape.lineTo(0.02, 0.078);
    shape.lineTo(-0.005, 0.042);
    shape.lineTo(0.118, 0.012);
    shape.lineTo(0.024, -0.012);
    shape.quadraticCurveTo(0.005, -0.088, -0.078, -0.084);
    shape.lineTo(-0.036, -0.02);
    shape.closePath();
    return shape;
  }, []);
  const mapleLeaf = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.066);
    shape.lineTo(0.014, 0.03);
    shape.lineTo(0.043, 0.045);
    shape.lineTo(0.034, 0.012);
    shape.lineTo(0.065, 0.002);
    shape.lineTo(0.034, -0.012);
    shape.lineTo(0.041, -0.047);
    shape.lineTo(0.012, -0.029);
    shape.lineTo(0, -0.072);
    shape.lineTo(-0.012, -0.029);
    shape.lineTo(-0.041, -0.047);
    shape.lineTo(-0.034, -0.012);
    shape.lineTo(-0.065, 0.002);
    shape.lineTo(-0.034, 0.012);
    shape.lineTo(-0.043, 0.045);
    shape.lineTo(-0.014, 0.03);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group position={[2.82, 1.17, 1.69]} rotation-y={0.76}>
      <mesh raycast={() => undefined}>
        <shapeGeometry args={[cloth, 4]} />
        <meshStandardMaterial
          color="#123d72"
          emissive="#081f3e"
          emissiveIntensity={0.22}
          metalness={0.03}
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.235, -0.005]} raycast={() => undefined} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.014, 0.014, 1.39, 8]} />
        <meshStandardMaterial color="#9ba9af" metalness={0.72} roughness={0.3} />
      </mesh>
      {[-0.48, -0.24, 0, 0.24, 0.48].map((x, index) => (
        <mesh key={x} position={[x, -0.005, 0.012]} raycast={() => undefined}>
          <planeGeometry args={[0.032, 0.36]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#6ba9d8" : "#061f42"}
            opacity={index % 2 === 0 ? 0.1 : 0.13}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
      <group position={[-0.36, 0.005, 0.022]}>
        <mesh raycast={() => undefined}>
          <circleGeometry args={[0.165, 24]} />
          <meshBasicMaterial color="#f4f7fa" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.002]} raycast={() => undefined}>
          <ringGeometry args={[0.126, 0.16, 24]} />
          <meshBasicMaterial color="#1d2d5c" toneMapped={false} />
        </mesh>
        <mesh position={[0.025, -0.025, 0.004]} raycast={() => undefined}>
          <shapeGeometry args={[mapleLeaf, 2]} />
          <meshBasicMaterial color="#e8291c" toneMapped={false} />
        </mesh>
        <mesh position={[-0.018, 0.012, 0.007]} raycast={() => undefined}>
          <shapeGeometry args={[jayHead, 3]} />
          <meshBasicMaterial color="#134a8e" toneMapped={false} />
        </mesh>
        <mesh position={[-0.047, 0.058, 0.009]} raycast={() => undefined}>
          <circleGeometry args={[0.012, 10]} />
          <meshBasicMaterial color="#f7fbff" toneMapped={false} />
        </mesh>
        <mesh position={[-0.047, 0.058, 0.011]} raycast={() => undefined}>
          <circleGeometry args={[0.005, 8]} />
          <meshBasicMaterial color="#07111f" toneMapped={false} />
        </mesh>
      </group>
      {[
        { x: 0.2, y: 0.07, width: 0.4, height: 0.032, color: "#f4f7fa" },
        { x: 0.165, y: 0.018, width: 0.33, height: 0.022, color: "#9bdcf3" },
        { x: 0.13, y: -0.024, width: 0.26, height: 0.018, color: "#f4f7fa" },
        { x: 0.18, y: -0.09, width: 0.36, height: 0.018, color: "#e8291c" },
      ].map((bar) => (
        <mesh key={`${bar.y}-${bar.width}`} position={[bar.x, bar.y, 0.024]} raycast={() => undefined}>
          <planeGeometry args={[bar.width, bar.height]} />
          <meshBasicMaterial color={bar.color} toneMapped={false} />
        </mesh>
      ))}
      {[-0.61, 0.61].map((x) => (
        <mesh key={x} position={[x, 0.205, 0.022]} raycast={() => undefined}>
          <circleGeometry args={[0.018, 10]} />
          <meshStandardMaterial color="#c9d2d5" metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Decorative open-roof Rogers Centre. It is centred on its own local origin,
 * spans roughly 7.1 x 5.4 units, and intentionally disables raycasting so the
 * neighbouring CN Tower remains the only interactive destination.
 */
export function RogersCentreDetailed({
  active = true,
  reducedMotion = false,
}: {
  active?: boolean;
  reducedMotion?: boolean;
}) {
  const facadeFins = useMemo<BoxInstance[]>(() => {
    const result: BoxInstance[] = [];
    for (let index = 0; index < 48; index += 1) {
      const angle = (index / 48) * Math.PI * 2;
      result.push({
        position: [Math.cos(angle) * 3.23, 0.89, Math.sin(angle) * 2.45],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.055, index % 4 === 0 ? 1.46 : 1.24, 0.15],
        color: index % 4 === 0 ? "#8b9598" : "#59666b",
      });
    }
    return result;
  }, []);

  const facadeGlass = useMemo<BoxInstance[]>(() => {
    const result: BoxInstance[] = [];
    const start = -0.12;
    for (let index = 0; index < 18; index += 1) {
      const angle = start + index * 0.1;
      result.push({
        position: [Math.cos(angle) * 3.31, 0.78, Math.sin(angle) * 2.51],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.32, 0.43, 0.035],
        color: index % 6 === 2 ? "#ffd18a" : index % 3 === 0 ? "#4bbde8" : "#153f58",
      });
    }
    return result;
  }, []);

  const perimeterLights = useMemo<BoxInstance[]>(() => {
    const result: BoxInstance[] = [];
    for (let index = 0; index < 32; index += 1) {
      const angle = (index / 32) * Math.PI * 2;
      result.push({
        position: [Math.cos(angle) * 3.4, 1.58, Math.sin(angle) * 2.58],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.055, 0.055, 0.045],
        color: index % 7 === 0 ? COLORS.warm : "#8ce2ff",
      });
    }
    return result;
  }, []);

  const entrances = useMemo(
    () => [0.08, 0.34, 0.6, 0.86, 1.12, 1.38],
    [],
  );
  const entranceGlass = useMemo<BoxInstance[]>(
    () =>
      entrances.map((angle) => ({
        position: [Math.cos(angle) * 3.4, 0.43, Math.sin(angle) * 2.6],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.48, 0.68, 0.06],
      })),
    [entrances],
  );
  const entranceCanopies = useMemo<BoxInstance[]>(
    () =>
      entrances.map((angle) => ({
        position: [Math.cos(angle) * 3.6, 0.8, Math.sin(angle) * 2.8],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.65, 0.055, 0.48],
      })),
    [entrances],
  );
  const entranceLights = useMemo<BoxInstance[]>(
    () =>
      entrances.map((angle) => ({
        position: [Math.cos(angle) * 3.625, 0.82, Math.sin(angle) * 2.825],
        rotation: [0, Math.PI / 2 - angle, 0],
        scale: [0.5, 0.018, 0.38],
      })),
    [entrances],
  );

  return (
    <group>
      <mesh position={[0, 0.045, 0]} raycast={() => undefined} receiveShadow scale={[3.5, 1, 2.68]}>
        <cylinderGeometry args={[1, 1, 0.09, 44]} />
        <meshStandardMaterial color="#596367" metalness={0.12} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 0.89, 0]} raycast={() => undefined} receiveShadow scale={[3.3, 1, 2.5]}>
        <cylinderGeometry args={[1, 1, 1.68, 44, 1, true]} />
        <meshStandardMaterial color={COLORS.stadiumShadow} metalness={0.38} roughness={0.52} side={THREE.DoubleSide} />
      </mesh>
      <StaticBoxes
        items={facadeFins}
        color={COLORS.stadiumShadow}
        interactive={false}
        metalness={0.68}
        roughness={0.35}
        vertexColors
      />
      <StaticBoxes
        items={facadeGlass}
        color={COLORS.stadiumBlue}
        emissive="#0d5379"
        emissiveIntensity={0.38}
        interactive={false}
        metalness={0.22}
        roughness={0.28}
        vertexColors
      />
      <StaticBoxes
        items={perimeterLights}
        color={COLORS.blue}
        emissive={COLORS.blue}
        emissiveIntensity={1.6}
        interactive={false}
        metalness={0.08}
        roughness={0.24}
        vertexColors
      />
      {[0.18, 0.57, 1.03, 1.48, 1.72].map((y, index) => (
        <EllipseRing
          key={y}
          color={index === 4 ? COLORS.stadiumWhite : index % 2 === 0 ? "#8c9699" : "#33464f"}
          depth={2.51 + index * 0.012}
          emissive={index === 3 ? COLORS.blueDark : undefined}
          emissiveIntensity={index === 3 ? 0.5 : 0}
          tube={index === 4 ? 0.035 : 0.02}
          width={3.31 + index * 0.012}
          y={y}
        />
      ))}
      <StaticBoxes
        color="#164b69"
        emissive="#0b3c58"
        emissiveIntensity={0.36}
        interactive={false}
        items={entranceGlass}
        metalness={0.3}
        roughness={0.22}
      />
      <StaticBoxes
        color="#aeb5b5"
        interactive={false}
        items={entranceCanopies}
        metalness={0.58}
        roughness={0.38}
      />
      <StaticBoxes
        color={COLORS.blue}
        emissive={COLORS.blue}
        emissiveIntensity={1.25}
        interactive={false}
        items={entranceLights}
        metalness={0.08}
        roughness={0.24}
      />
      <BaseballField />
      <StadiumSeating />
      <StadiumScoreboard active={active} reducedMotion={reducedMotion} />
      <RetractableRoof />
      <BlueJaysTributeBanner />
      <mesh position={[3.05, 0.16, 1.78]} raycast={() => undefined} rotation-y={0.76}>
        <boxGeometry args={[1.16, 0.18, 0.72]} />
        <meshStandardMaterial color="#737d7e" metalness={0.16} roughness={0.77} />
      </mesh>
    </group>
  );
}

export default CNTowerDetailed;
