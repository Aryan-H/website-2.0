"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type BoxInstance = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

const COLORS = {
  limestone: "#9d8c72",
  limestoneLight: "#c3b394",
  limestoneHighlight: "#d2c4a7",
  limestoneShadow: "#62594d",
  limestoneDark: "#443f38",
  glass: "#102a38",
  glassBlue: "#16475f",
  warm: "#ffc875",
  warmDim: "#9b6f3e",
  metal: "#26343b",
  metalLight: "#60717a",
  paving: "#687277",
  pavingLight: "#747f83",
  pavingDark: "#4d595f",
  blue: "#54c9ff",
  blueDark: "#0b5b88",
  planter: "#31383a",
  foliage: "#17392f",
};

function StaticBoxes({
  items,
  color,
  castShadow = false,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.08,
  receiveShadow = true,
  roughness = 0.78,
  vertexColors = false,
}: {
  items: BoxInstance[];
  color: string;
  castShadow?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  receiveShadow?: boolean;
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
      castShadow={castShadow}
      raycast={() => undefined}
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

function StaticCylinders({
  items,
  color,
  bottomRadius = 1,
  castShadow = false,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.08,
  radialSegments = 8,
  receiveShadow = true,
  roughness = 0.78,
  topRadius = 1,
  vertexColors = false,
}: {
  items: BoxInstance[];
  color: string;
  bottomRadius?: number;
  castShadow?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  radialSegments?: number;
  receiveShadow?: boolean;
  roughness?: number;
  topRadius?: number;
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
      raycast={() => undefined}
      receiveShadow={receiveShadow}
    >
      <cylinderGeometry args={[topRadius, bottomRadius, 1, radialSegments]} />
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

function StaticSpheres({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.04,
  receiveShadow = true,
  roughness = 0.88,
  vertexColors = false,
}: {
  items: BoxInstance[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  receiveShadow?: boolean;
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
      receiveShadow={receiveShadow}
    >
      <sphereGeometry args={[1, 8, 6]} />
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

function StaticTori({
  items,
  color,
  metalness = 0.72,
  roughness = 0.3,
}: {
  items: BoxInstance[];
  color: string;
  metalness?: number;
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
      <torusGeometry args={[1, 0.12, 5, 12, Math.PI]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}

function StonePavement() {
  const pavers = useMemo<BoxInstance[]>(() => {
    const palette = ["#697378", "#707a7e", "#667176", "#747d80"];
    const tiles: BoxInstance[] = [];
    const columns = 17;
    const rows = 12;
    const tileWidth = 8.32 / columns;
    const tileDepth = 5.82 / rows;

    for (let row = 0; row < rows; row += 1) {
      const offset = row % 2 === 0 ? 0 : tileWidth * 0.5;
      for (let column = -1; column <= columns; column += 1) {
        const x = -4.16 + tileWidth * 0.5 + column * tileWidth + offset;
        if (x < -4.16 || x > 4.16) continue;
        tiles.push({
          position: [x, 0.055, -2.91 + tileDepth * 0.5 + row * tileDepth],
          scale: [tileWidth - 0.025, 0.025, tileDepth - 0.025],
          color: palette[(row * 5 + column * 3 + 19) % palette.length],
        });
      }
    }
    return tiles;
  }, []);

  const frontInlays = useMemo<BoxInstance[]>(
    () => [
      { position: [-3.38, 0.083, 2.63], scale: [0.025, 0.015, 0.62] },
      { position: [-2.26, 0.083, 2.63], scale: [0.025, 0.015, 0.62] },
      { position: [2.26, 0.083, 2.63], scale: [0.025, 0.015, 0.62] },
      { position: [3.38, 0.083, 2.63], scale: [0.025, 0.015, 0.62] },
      { position: [0, 0.083, 2.95], scale: [3.4, 0.014, 0.018] },
    ],
    [],
  );

  const forecourtJoints = useMemo<BoxInstance[]>(
    () =>
      [-1.13, 0, 1.13].map((x) => ({
        position: [x, 0.087, 1.88] as Vec3,
        scale: [0.018, 0.01, 1.38] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.025, 0]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[8.5, 0.05, 6]} />
        <meshStandardMaterial color={COLORS.pavingDark} metalness={0.1} roughness={0.92} />
      </mesh>
      <StaticBoxes items={pavers} color={COLORS.paving} vertexColors />
      <StaticBoxes
        items={frontInlays}
        color={COLORS.blue}
        emissive={COLORS.blueDark}
        emissiveIntensity={1.4}
        metalness={0.22}
        roughness={0.28}
      />
      <mesh position={[0, 0.073, 1.88]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[3.35, 0.018, 1.44]} />
        <meshStandardMaterial color="#798184" metalness={0.08} roughness={0.86} />
      </mesh>
      <StaticBoxes items={forecourtJoints} color="#4b575c" roughness={0.88} />
    </group>
  );
}

function WingWindows() {
  const windows = useMemo<BoxInstance[]>(() => {
    const items: BoxInstance[] = [];
    const wingCenters = [-2.68, 2.68];
    for (const center of wingCenters) {
      for (let row = 0; row < 2; row += 1) {
        for (let column = 0; column < 5; column += 1) {
          const x = center - 0.92 + column * 0.46;
          const lit = (column * 7 + row * 5 + (center > 0 ? 3 : 0)) % 6 === 1;
          items.push({
            position: [x, 0.72 + row * 0.72, 1.318],
            scale: [0.23, 0.38, 0.035],
            color: lit ? "#a97845" : row === 0 ? "#153141" : "#102734",
          });
        }
      }
    }
    return items;
  }, []);

  const frames = useMemo<BoxInstance[]>(() => {
    const items: BoxInstance[] = [];
    for (const center of [-2.68, 2.68]) {
      for (let row = 0; row < 2; row += 1) {
        for (let column = 0; column < 5; column += 1) {
          const x = center - 0.92 + column * 0.46;
          const y = 0.72 + row * 0.72;
          items.push(
            { position: [x - 0.137, y, 1.342], scale: [0.035, 0.51, 0.035] },
            { position: [x + 0.137, y, 1.342], scale: [0.035, 0.51, 0.035] },
            { position: [x, y - 0.255, 1.342], scale: [0.31, 0.04, 0.035] },
            { position: [x, y + 0.255, 1.342], scale: [0.31, 0.04, 0.035] },
          );
        }
      }
    }
    return items;
  }, []);

  return (
    <group>
      <StaticBoxes
        items={windows}
        color={COLORS.glass}
        emissive={COLORS.warmDim}
        emissiveIntensity={0.48}
        metalness={0.34}
        roughness={0.22}
        vertexColors
      />
      <StaticBoxes
        items={frames}
        color={COLORS.limestoneLight}
        metalness={0.05}
        roughness={0.84}
      />
    </group>
  );
}

function Colonnade() {
  const columns = useMemo(() => Array.from({ length: 11 }, (_, index) => -1.3 + index * 0.26), []);
  const columnBodies = useMemo<BoxInstance[]>(
    () =>
      columns.map((x) => ({
        position: [x, 1.45, 1.52],
        scale: [0.092, 1.72, 0.092],
      })),
    [columns],
  );
  const columnBases = useMemo<BoxInstance[]>(
    () =>
      columns.map((x) => ({
        position: [x, 0.55, 1.52],
        scale: [0.13, 0.09, 0.13],
      })),
    [columns],
  );
  const columnCaps = useMemo<BoxInstance[]>(
    () =>
      columns.map((x) => ({
        position: [x, 2.34, 1.52],
        scale: [0.19, 0.09, 0.19],
      })),
    [columns],
  );
  const colonnadeWindows = useMemo<BoxInstance[]>(
    () =>
      [-0.9, -0.45, 0, 0.45, 0.9].map((x, index) => ({
        position: [x, 1.1, 1.39],
        scale: [0.26, 0.92, 0.03],
        color: index === 1 || index === 3 ? "#8f683f" : COLORS.glass,
      })),
    [],
  );

  return (
    <group>
      <mesh castShadow position={[0, 1.35, 1.285]} receiveShadow>
        <boxGeometry args={[2.86, 1.76, 0.18]} />
        <meshStandardMaterial color={COLORS.limestoneShadow} roughness={0.86} />
      </mesh>
      <StaticBoxes
        items={colonnadeWindows}
        color={COLORS.glass}
        emissive={COLORS.warmDim}
        emissiveIntensity={0.42}
        metalness={0.24}
        roughness={0.24}
        vertexColors
      />
      <StaticCylinders
        items={columnBodies}
        bottomRadius={1}
        castShadow
        color={COLORS.limestoneLight}
        radialSegments={10}
        roughness={0.81}
        topRadius={0.793}
      />
      <StaticCylinders
        items={columnBases}
        bottomRadius={1}
        color={COLORS.limestoneHighlight}
        radialSegments={10}
        roughness={0.83}
        topRadius={0.908}
      />
      <StaticBoxes items={columnCaps} color={COLORS.limestoneHighlight} roughness={0.8} />
      <mesh castShadow position={[0, 2.4, 1.48]} receiveShadow>
        <boxGeometry args={[3.08, 0.19, 0.32]} />
        <meshStandardMaterial color={COLORS.limestoneHighlight} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 2.54, 1.43]} receiveShadow>
        <boxGeometry args={[3.24, 0.095, 0.42]} />
        <meshStandardMaterial color={COLORS.limestone} roughness={0.83} />
      </mesh>
    </group>
  );
}

function CentralClock() {
  const markers = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return {
          position: [Math.sin(angle) * 0.16, Math.cos(angle) * 0.16, 0.062],
          rotation: [0, 0, -angle],
          scale: [0.012, index % 3 === 0 ? 0.04 : 0.025, 0.012],
        };
      }),
    [],
  );
  const hands = useMemo<BoxInstance[]>(
    () => [
      {
        position: [0.035, 0.055, 0.07],
        rotation: [0, 0, -0.55],
        scale: [0.018, 0.125, 0.014],
      },
      {
        position: [-0.035, -0.005, 0.072],
        rotation: [0, 0, 0.95],
        scale: [0.014, 0.09, 0.014],
      },
    ],
    [],
  );

  return (
    <group position={[0, 2.91, 1.4]}>
      <mesh castShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.255, 0.255, 0.085, 24]} />
        <meshStandardMaterial color={COLORS.limestoneLight} roughness={0.68} />
      </mesh>
      <mesh position={[0, 0, 0.048]}>
        <circleGeometry args={[0.205, 24]} />
        <meshStandardMaterial
          color="#e3d4b0"
          emissive={COLORS.warmDim}
          emissiveIntensity={0.22}
          roughness={0.63}
        />
      </mesh>
      <StaticBoxes items={markers} color="#423d34" receiveShadow={false} roughness={0.56} />
      <StaticBoxes
        items={hands}
        color="#2b302f"
        metalness={0.3}
        receiveShadow={false}
        roughness={0.44}
      />
    </group>
  );
}

function BuildingShell() {
  const wingBodies = useMemo<BoxInstance[]>(
    () =>
      [-2.68, 2.68].map((x) => ({
        position: [x, 1.16, -0.05] as Vec3,
        scale: [2.65, 2.18, 2.66] as Vec3,
      })),
    [],
  );
  const lightBands = useMemo<BoxInstance[]>(
    () => [
      { position: [0, 0.22, 1.295], scale: [8.08, 0.075, 0.14] },
      { position: [0, 2.22, 1.331], scale: [7.84, 0.1, 0.14] },
    ],
    [],
  );
  const shadowBands = useMemo<BoxInstance[]>(
    () => [{ position: [0, 1.77, 1.313], scale: [7.96, 0.075, 0.14] }],
    [],
  );
  const lowerCornices = useMemo<BoxInstance[]>(
    () =>
      [-2.68, 2.68].map((x) => ({
        position: [x, 2.27, -0.05] as Vec3,
        scale: [2.9, 0.17, 2.9] as Vec3,
      })),
    [],
  );
  const middleCornices = useMemo<BoxInstance[]>(
    () =>
      [-2.68, 2.68].map((x) => ({
        position: [x, 2.37, -0.12] as Vec3,
        scale: [2.73, 0.08, 2.72] as Vec3,
      })),
    [],
  );
  const upperCornices = useMemo<BoxInstance[]>(
    () =>
      [-2.68, 2.68].map((x) => ({
        position: [x, 2.48, -0.32] as Vec3,
        scale: [2.36, 0.17, 2.1] as Vec3,
      })),
    [],
  );
  const parapets = useMemo<BoxInstance[]>(() => {
    const blocks: BoxInstance[] = [];
    for (const center of [-2.7, 2.7]) {
      for (let index = 0; index < 7; index += 1) {
        blocks.push({
          position: [center - 1.18 + index * 0.395, 2.42, 0.86],
          scale: [0.25, index % 3 === 1 ? 0.22 : 0.17, 0.22],
        });
      }
    }
    return blocks;
  }, []);

  return (
    <group>
      <StaticBoxes castShadow items={wingBodies} color={COLORS.limestone} roughness={0.9} />
      <mesh castShadow position={[0, 1.45, -0.05]} receiveShadow>
        <boxGeometry args={[2.92, 2.75, 2.62]} />
        <meshStandardMaterial color={COLORS.limestone} roughness={0.88} />
      </mesh>

      {/* Deep shadow bands make the masonry read as layered rather than a single block. */}
      <StaticBoxes items={lightBands} color={COLORS.limestoneLight} roughness={0.84} />
      <StaticBoxes items={shadowBands} color={COLORS.limestoneShadow} roughness={0.84} />

      {/* Wing cornices and stepped roof line. */}
      <StaticBoxes castShadow items={lowerCornices} color={COLORS.limestoneLight} roughness={0.8} />
      <StaticBoxes items={middleCornices} color={COLORS.limestoneShadow} roughness={0.82} />
      <StaticBoxes
        items={upperCornices}
        color="#55514a"
        metalness={0.1}
        roughness={0.72}
      />

      <mesh castShadow position={[0, 2.83, -0.09]} receiveShadow>
        <boxGeometry args={[3.1, 0.22, 2.78]} />
        <meshStandardMaterial color={COLORS.limestoneLight} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 3.03, -0.28]} receiveShadow>
        <boxGeometry args={[2.62, 0.2, 2.24]} />
        <meshStandardMaterial color={COLORS.limestone} roughness={0.84} />
      </mesh>
      <mesh castShadow position={[0, 3.18, -0.43]} receiveShadow>
        <boxGeometry args={[2.18, 0.11, 1.84]} />
        <meshStandardMaterial color={COLORS.limestoneShadow} roughness={0.8} />
      </mesh>

      <StaticBoxes items={parapets} color={COLORS.limestoneLight} roughness={0.82} />
      <WingWindows />
      <Colonnade />
      <CentralClock />
    </group>
  );
}

function EastRailPortal() {
  const { innerShape, surroundShape } = useMemo(() => {
    const createArch = (width: number, sideHeight: number, radius: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-width * 0.5, 0);
      shape.lineTo(-width * 0.5, sideHeight);
      shape.absarc(0, sideHeight, radius, Math.PI, 0, true);
      shape.lineTo(width * 0.5, 0);
      shape.closePath();
      return shape;
    };

    const surround = createArch(2.38, 0.69, 1.19);
    const hole = createArch(2.08, 0.65, 1.04);
    surround.holes.push(hole);
    return { innerShape: createArch(2.08, 0.65, 1.04), surroundShape: surround };
  }, []);

  const sideStonework = useMemo<BoxInstance[]>(
    () => [
      { position: [4.035, 0.75, -1.2], scale: [0.12, 1.3, 0.28] },
      { position: [4.035, 0.75, 1.2], scale: [0.12, 1.3, 0.28] },
      { position: [4.035, 1.98, 0], scale: [0.12, 0.58, 2.68] },
      { position: [4.095, 0.4, -1.18], scale: [0.16, 0.12, 0.12] },
      { position: [4.095, 0.4, 1.18], scale: [0.16, 0.12, 0.12] },
    ],
    [],
  );

  return (
    <group>
      <StaticBoxes items={sideStonework} color={COLORS.limestone} roughness={0.89} />
      <mesh position={[4.101, 0.39, 0]} rotation-y={Math.PI / 2} raycast={() => undefined}>
        <shapeGeometry args={[innerShape]} />
        <meshBasicMaterial color="#02070b" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4.118, 0.39, 0]} rotation-y={Math.PI / 2} raycast={() => undefined}>
        <shapeGeometry args={[surroundShape]} />
        <meshStandardMaterial
          color={COLORS.limestoneLight}
          metalness={0.04}
          roughness={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[4.126, 0.43, 0]} rotation-y={Math.PI / 2} raycast={() => undefined}>
        <planeGeometry args={[0.94, 0.035]} />
        <meshBasicMaterial color={COLORS.blue} toneMapped={false} />
      </mesh>
      <mesh position={[4.132, 1.24, 0]} rotation-y={Math.PI / 2} raycast={() => undefined}>
        <planeGeometry args={[0.54, 0.028]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={COLORS.blue}
          depthWrite={false}
          opacity={0.68}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function EntranceStepsAndDoors() {
  const doors = useMemo<BoxInstance[]>(
    () =>
      [-0.88, -0.44, 0, 0.44, 0.88].map((x, index) => ({
        position: [x, 0.68, 1.405] as Vec3,
        scale: [0.25, 0.86, 0.04] as Vec3,
        color: index % 2 === 0 ? "#16384a" : "#7f5f3f",
      })),
    [],
  );
  const steps = useMemo<BoxInstance[]>(
    () =>
      [0, 1, 2].map((step) => ({
        position: [0, 0.1 + step * 0.055, 1.69 - step * 0.13],
        scale: [3.35 - step * 0.18, 0.11, 0.3],
      })),
    [],
  );
  const finialPosts = useMemo<BoxInstance[]>(
    () =>
      [-1.56, 1.56].map((x) => ({
        position: [x, 0.62, 1.72] as Vec3,
        scale: [0.11, 0.65, 0.11] as Vec3,
      })),
    [],
  );
  const finialCaps = useMemo<BoxInstance[]>(
    () =>
      [-1.56, 1.56].map((x) => ({
        position: [x, 0.97, 1.72] as Vec3,
        scale: [0.1, 0.1, 0.1] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <StaticBoxes
        items={doors}
        color={COLORS.glass}
        emissive={COLORS.warmDim}
        emissiveIntensity={0.42}
        metalness={0.3}
        roughness={0.22}
        vertexColors
      />
      <StaticBoxes castShadow items={steps} color={COLORS.limestoneLight} roughness={0.9} />
      <StaticBoxes items={finialPosts} color={COLORS.limestoneHighlight} roughness={0.84} />
      <StaticSpheres items={finialCaps} color={COLORS.limestoneHighlight} roughness={0.76} />
    </group>
  );
}

function PlazaPlanters() {
  const { bodies, foliage, soil } = useMemo(() => {
    const planters: Array<{ x: number; z: number; scale: number }> = [
      { x: -3.42, z: 2.05, scale: 0.9 },
      { x: -2.42, z: 2.48, scale: 0.76 },
      { x: 2.42, z: 2.48, scale: 0.76 },
      { x: 3.42, z: 2.05, scale: 0.9 },
    ];
    const bodyItems: BoxInstance[] = [];
    const soilItems: BoxInstance[] = [];
    const foliageItems: BoxInstance[] = [];

    planters.forEach(({ x, z, scale }) => {
      bodyItems.push({
        position: [x, 0.22 * scale, z],
        scale: [0.34 * scale, 0.4 * scale, 0.34 * scale],
      });
      soilItems.push({
        position: [x, 0.425 * scale, z],
        scale: [0.26 * scale, 0.035 * scale, 0.26 * scale],
      });
      foliageItems.push({
        position: [x, 0.56 * scale, z],
        scale: [0.31 * scale, 0.31 * scale, 0.31 * scale],
        color: COLORS.foliage,
      });
      for (let index = 0; index < 3; index += 1) {
        const angle = index * 2.1;
        foliageItems.push({
          position: [
            x + Math.cos(angle) * 0.19 * scale,
            (0.58 + index * 0.035) * scale,
            z + Math.sin(angle) * 0.19 * scale,
          ],
          scale: [0.18 * scale, 0.18 * scale, 0.18 * scale],
          color: index === 1 ? "#21503d" : "#183f33",
        });
      }
    });

    return { bodies: bodyItems, foliage: foliageItems, soil: soilItems };
  }, []);

  return (
    <group>
      <StaticCylinders
        items={bodies}
        bottomRadius={1}
        color={COLORS.planter}
        metalness={0.38}
        radialSegments={12}
        roughness={0.55}
        topRadius={0.882}
      />
      <StaticCylinders items={soil} color="#3d3329" radialSegments={12} roughness={1} />
      <StaticSpheres items={foliage} color={COLORS.foliage} roughness={0.95} vertexColors />
    </group>
  );
}

function PlazaLamps() {
  const { bulbs, housings, poles } = useMemo(() => {
    const lamps: Vec3[] = [
      [-3.86, 0, 2.72],
      [-1.88, 0, 2.78],
      [1.88, 0, 2.78],
      [3.86, 0, 2.72],
    ];
    return {
      bulbs: lamps.map(([x, , z]) => ({
        position: [x, 0.94, z] as Vec3,
        scale: [0.07, 0.07, 0.07] as Vec3,
      })),
      housings: lamps.map(([x, , z]) => ({
        position: [x, 0.92, z] as Vec3,
        scale: [0.075, 0.19, 0.075] as Vec3,
      })),
      poles: lamps.map(([x, , z]) => ({
        position: [x, 0.46, z] as Vec3,
        scale: [0.055, 0.86, 0.055] as Vec3,
      })),
    };
  }, []);

  return (
    <group>
      <StaticCylinders
        items={poles}
        bottomRadius={1}
        color={COLORS.metal}
        metalness={0.76}
        radialSegments={8}
        roughness={0.36}
        topRadius={0.636}
      />
      <StaticCylinders
        items={housings}
        bottomRadius={1}
        color={COLORS.metalLight}
        metalness={0.58}
        radialSegments={8}
        roughness={0.35}
        topRadius={1.6}
      />
      <StaticSpheres
        items={bulbs}
        color="#ffd59a"
        emissive="#ffbd6c"
        emissiveIntensity={3.4}
        receiveShadow={false}
      />
    </group>
  );
}

function BicycleRacks() {
  const racks = useMemo<BoxInstance[]>(
    () =>
      [-0.72, -0.36, 0, 0.36, 0.72].map((x) => ({
        position: [x, 0.18, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.18, 0.18, 0.18],
      })),
    [],
  );
  return (
    <group position={[-2.75, 0.11, 2.8]} raycast={() => undefined}>
      <StaticTori items={racks} color={COLORS.metalLight} metalness={0.82} roughness={0.28} />
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.75, 0.055, 0.18]} />
        <meshStandardMaterial color={COLORS.metal} metalness={0.58} roughness={0.44} />
      </mesh>
    </group>
  );
}

function Bollards() {
  const positions = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        position: [-1.6 + index * 0.4, 0.22, 2.74] as Vec3,
        scale: [0.075, 0.28, 0.075] as Vec3,
      })),
    [],
  );
  return <StaticBoxes items={positions} color="#303c42" metalness={0.7} roughness={0.36} />;
}

/**
 * A code-native, night-lit interpretation of Toronto Union Station. The
 * component is centred on an 8.5 x 6.0 parcel, faces local +z, and reserves
 * an arched rail portal on local +x. Its portal threshold aligns with a
 * rail-deck top near y=0.42.
 */
export default function UnionStationDetailed() {
  return (
    <group>
      <StonePavement />
      <BuildingShell />
      <EastRailPortal />
      <EntranceStepsAndDoors />
      <PlazaPlanters />
      <PlazaLamps />
      <BicycleRacks />
      <Bollards />
    </group>
  );
}
