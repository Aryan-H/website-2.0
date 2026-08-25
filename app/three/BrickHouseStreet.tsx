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
  metalness = 0.1,
  roughness = 0.75,
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
        fog={fog}
      />
    </instancedMesh>
  );
}

function Shrubs({ items }: { items: BoxItem[] }) {
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
      <meshStandardMaterial color="#1d4934" roughness={0.96} vertexColors />
    </instancedMesh>
  );
}

const BLOCK_ZS = [9.75, 3.25, -3.25, -9.75] as const;
const HOUSE_Z_OFFSETS = [-1.74, -0.58, 0.58, 1.74] as const;
const BRICK_COLORS = ["#a94d31", "#bd6038", "#963f2c", "#c66c40"] as const;
const ROOF_COLORS = ["#25292d", "#302b2b", "#20282d", "#342b29"] as const;

function BangladeshFlag() {
  return (
    <group position={[1.24, 0, BLOCK_ZS[0] + 0.45]}>
      <mesh position={[0, 0.76, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[0.025, 0.035, 1.48, 10]} />
        <meshStandardMaterial color="#aeb8bc" metalness={0.78} roughness={0.3} />
      </mesh>
      <mesh position={[0.42, 1.18, 0]} raycast={() => undefined}>
        <planeGeometry args={[0.8, 0.48]} />
        <meshBasicMaterial color="#006a4e" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0.35, 1.18, 0.008]} raycast={() => undefined}>
        <circleGeometry args={[0.145, 32]} />
        <meshBasicMaterial color="#f42a41" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.51, 0]} raycast={() => undefined}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshStandardMaterial color="#c6d0d3" metalness={0.75} roughness={0.28} />
      </mesh>
    </group>
  );
}

export default function BrickHouseStreet() {
  const details = useMemo(() => {
    const lots: BoxItem[] = [];
    const sidewalks: BoxItem[] = [];
    const bodies: BoxItem[] = [];
    const waterfrontWhiteBodies: BoxItem[] = [];
    const waterfrontBrickBodies: BoxItem[] = [];
    const foundations: BoxItem[] = [];
    const roofPanels: BoxItem[] = [];
    const chimneys: BoxItem[] = [];
    const windows: BoxItem[] = [];
    const doors: BoxItem[] = [];
    const lintels: BoxItem[] = [];
    const brickCourses: BoxItem[] = [];
    const steps: BoxItem[] = [];
    const railings: BoxItem[] = [];
    const shrubs: BoxItem[] = [];

    BLOCK_ZS.forEach((blockZ, blockIndex) => {
      lots.push({ position: [0, 0.04, blockZ], scale: [5.68, 0.08, 4.82] });
      sidewalks.push({ position: [1.62, 0.105, blockZ], scale: [0.58, 0.08, 4.66] });

      HOUSE_Z_OFFSETS.forEach((zOffset, houseIndex) => {
        const variant = (blockIndex + houseIndex) % 4;
        const height = 1.42 + ((blockIndex * 3 + houseIndex) % 3) * 0.09;
        const bodyX = -0.28;
        const houseZ = blockZ + zOffset;
        const frontX = bodyX + 0.98;
        const doorOffset = houseIndex % 2 === 0 ? -0.28 : 0.28;

        foundations.push({
          position: [bodyX, 0.18, houseZ],
          scale: [2.02, 0.3, 1.08],
          color:
            blockIndex === 0
              ? variant % 2
                ? "#777772"
                : "#888681"
              : variant % 2
                ? "#554942"
                : "#62554b",
        });
        const body: BoxItem = {
          position: [bodyX, 0.3 + height * 0.5, houseZ],
          scale: [1.94, height, 1.05],
          color:
            blockIndex === 0
              ? variant % 2
                ? "#deddd7"
                : "#f0eee7"
              : BRICK_COLORS[variant],
        };
        (blockIndex === 0 ? waterfrontWhiteBodies : bodies).push(body);

        [-1, 1].forEach((side) => {
          roofPanels.push({
            position: [bodyX, height + 0.48, houseZ + side * 0.25],
            rotation: [side * 0.52, 0, 0],
            scale: [2.16, 0.09, 0.66],
            color: ROOF_COLORS[variant],
          });
        });

        chimneys.push({
          position: [bodyX - 0.48, height + 0.63, houseZ - 0.3],
          scale: [0.22, 0.58, 0.18],
          color:
            blockIndex === 0
              ? variant % 2
                ? "#aaa8a1"
                : "#c4c1b8"
              : variant % 2
                ? "#9f472f"
                : "#853925",
        });

        [0.72, 1.18].forEach((y, floor) => {
          [-0.28, 0.28].forEach((offset, column) => {
            if (floor === 0 && Math.abs(offset - doorOffset) < 0.1) return;
            windows.push({
              position: [frontX + 0.018, y, houseZ + offset],
              scale: [0.035, 0.27, 0.24],
              color:
                (blockIndex + houseIndex + floor + column) % 5 === 0
                  ? "#e7c58f"
                  : "#557f94",
            });
            lintels.push({
              position: [frontX + 0.04, y + 0.18, houseZ + offset],
              scale: [0.055, 0.055, 0.32],
            });
          });
        });

        doors.push({
          position: [frontX + 0.025, 0.52, houseZ + doorOffset],
          scale: [0.05, 0.68, 0.3],
          color:
            blockIndex === 0
              ? variant % 2
                ? "#202c35"
                : "#31566b"
              : variant % 2
                ? "#183b4d"
                : "#254f5e",
        });
        lintels.push({
          position: [frontX + 0.045, 0.9, houseZ + doorOffset],
          scale: [0.055, 0.06, 0.38],
        });

        [0.52, 0.82, 1.12].forEach((y) => {
          brickCourses.push({
            position: [frontX + 0.006, y, houseZ],
            scale: [0.018, 0.018, 1.01],
            color:
              blockIndex === 0
                ? variant % 2
                  ? "#bab8b1"
                  : "#cbc8bf"
                : variant % 2
                  ? "#713022"
                  : "#7f3726",
          });
        });

        steps.push(
          { position: [frontX + 0.21, 0.12, houseZ + doorOffset], scale: [0.36, 0.16, 0.52] },
          { position: [frontX + 0.45, 0.055, houseZ + doorOffset], scale: [0.2, 0.08, 0.66] },
        );
        [-1, 1].forEach((side) => {
          railings.push({
            position: [frontX + 0.25, 0.31, houseZ + doorOffset + side * 0.27],
            scale: [0.035, 0.39, 0.035],
          });
        });

        shrubs.push({
          position: [frontX + 0.28, 0.27, houseZ - doorOffset],
          scale: [0.22, 0.28, 0.2],
          color: variant % 2 ? "#24543b" : "#1d4934",
        });
      });

      if (blockIndex === 0) {
        const coastalHouseX = -0.25;
        const coastalHouseZ = blockZ + 4.2;
        const coastalHouseFrontX = 0.73;

        lots.push({
          position: [0, 0.04, coastalHouseZ],
          scale: [5.68, 0.08, 3.2],
        });
        sidewalks.push({
          position: [1.62, 0.105, coastalHouseZ],
          scale: [0.58, 0.08, 3.04],
        });

        foundations.push({
          position: [coastalHouseX, 0.19, coastalHouseZ],
          scale: [2.04, 0.32, 2.18],
          color: "#65544b",
        });
        waterfrontBrickBodies.push({
          position: [coastalHouseX, 1.14, coastalHouseZ],
          scale: [1.94, 1.88, 2.08],
          color: "#ad5136",
        });
        [-1, 1].forEach((side) => {
          roofPanels.push({
            position: [coastalHouseX, 2.18, coastalHouseZ + side * 0.48],
            rotation: [side * 0.5, 0, 0],
            scale: [2.2, 0.1, 1.24],
            color: "#27292b",
          });
        });
        chimneys.push({
          position: [coastalHouseX - 0.42, 2.36, coastalHouseZ - 0.52],
          scale: [0.18, 0.52, 0.18],
          color: "#843b2b",
        });
        [0.78, 1.34].forEach((y) => {
          [-0.56, 0.56].forEach((zOffset) => {
            windows.push({
              position: [coastalHouseFrontX, y, coastalHouseZ + zOffset],
              scale: [0.04, 0.32, 0.3],
              color: y > 1 ? "#6d9bb1" : "#e6b979",
            });
            lintels.push({
              position: [coastalHouseFrontX + 0.025, y + 0.21, coastalHouseZ + zOffset],
              scale: [0.055, 0.055, 0.4],
            });
          });
        });
        [0.52, 0.86, 1.2, 1.54].forEach((y) => {
          brickCourses.push({
            position: [coastalHouseFrontX + 0.008, y, coastalHouseZ],
            scale: [0.02, 0.018, 2.02],
            color: "#763123",
          });
        });
        doors.push({
          position: [coastalHouseFrontX + 0.01, 0.53, coastalHouseZ],
          scale: [0.055, 0.76, 0.34],
          color: "#273c47",
        });
        steps.push(
          {
            position: [coastalHouseFrontX + 0.18, 0.13, coastalHouseZ],
            scale: [0.32, 0.16, 0.62],
          },
          {
            position: [coastalHouseFrontX + 0.38, 0.055, coastalHouseZ],
            scale: [0.16, 0.08, 0.74],
          },
        );
        shrubs.push({
          position: [coastalHouseFrontX + 0.3, 0.28, coastalHouseZ - 0.7],
          scale: [0.24, 0.3, 0.24],
          color: "#24513a",
        });
      }
    });

    return {
      bodies,
      brickCourses,
      chimneys,
      doors,
      foundations,
      lintels,
      lots,
      railings,
      roofPanels,
      shrubs,
      sidewalks,
      steps,
      windows,
      waterfrontBrickBodies,
      waterfrontWhiteBodies,
    };
  }, []);

  return (
    <group>
      <Boxes items={details.lots} color="#17241d" roughness={0.96} />
      <Boxes items={details.sidewalks} color="#747b7b" metalness={0.06} roughness={0.86} />
      <Boxes items={details.foundations} color="#ffffff" metalness={0.08} roughness={0.9} vertexColors />
      <Boxes items={details.bodies} color="#ffffff" metalness={0.02} roughness={0.9} vertexColors />
      <Boxes
        items={details.waterfrontBrickBodies}
        color="#ffffff"
        emissive="#6d2a1d"
        emissiveIntensity={0.38}
        metalness={0.02}
        roughness={0.9}
        vertexColors
        fog={false}
      />
      <Boxes
        items={details.waterfrontWhiteBodies}
        color="#ffffff"
        emissive="#c9c7c0"
        emissiveIntensity={0.48}
        metalness={0.02}
        roughness={0.88}
        vertexColors
        fog={false}
      />
      <Boxes items={details.roofPanels} color="#ffffff" metalness={0.16} roughness={0.72} vertexColors />
      <Boxes items={details.chimneys} color="#ffffff" roughness={0.88} vertexColors />
      <Boxes
        items={details.windows}
        color="#ffffff"
        emissive="#a96d35"
        emissiveIntensity={0.16}
        metalness={0.34}
        roughness={0.28}
        vertexColors
      />
      <Boxes items={details.doors} color="#ffffff" metalness={0.24} roughness={0.48} vertexColors />
      <Boxes items={details.lintels} color="#b8aa95" roughness={0.8} />
      <Boxes items={details.brickCourses} color="#ffffff" roughness={0.92} vertexColors />
      <Boxes items={details.steps} color="#827b72" roughness={0.88} />
      <Boxes items={details.railings} color="#3d4b50" metalness={0.74} roughness={0.38} />
      <Shrubs items={details.shrubs} />
      <BangladeshFlag />
    </group>
  );
}
