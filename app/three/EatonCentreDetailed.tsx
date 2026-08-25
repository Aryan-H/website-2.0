"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];

type InstanceItem = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

const COLORS = {
  blue: "#1883b6",
  blueDark: "#07395f",
  glass: "#3d7186",
  glassDark: "#142f3d",
  steel: "#8da2ad",
  steelDark: "#334852",
  facade: "#d0d2cd",
  facadeDark: "#555f64",
  warm: "#f4b46a",
  pavement: "#6a7375",
};

// The mall spans the original block and the block immediately east of it.
// Keeping the main entrance at x=0 preserves the route arrival point while
// the galleria extends into the newly joined block.
const MALL_CENTER_X = 4.5;
const MALL_PARCEL_WIDTH = 16;
const MALL_BODY_WIDTH = 15.55;
const MALL_ROOF_LENGTH = 15;
const SECONDARY_ENTRANCE_X = 8.4;
const MALL_RIGHT_X = MALL_CENTER_X + MALL_ROOF_LENGTH * 0.5;

function BoxInstances({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.12,
  roughness = 0.72,
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

function SphereInstances({ items }: { items: InstanceItem[] }) {
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
      <meshStandardMaterial color="#244936" roughness={0.94} vertexColors />
    </instancedMesh>
  );
}

function RoofRibs() {
  const ribPositions = Array.from(
    { length: 21 },
    (_, index) => -3 + index * 0.75,
  );
  return (
    <group>
      {ribPositions.map((x) => (
        <mesh key={x} position={[x, 1.96, 0]} rotation-y={Math.PI / 2} raycast={() => undefined}>
          <torusGeometry args={[1.5, 0.035, 5, 28, Math.PI]} />
          <meshStandardMaterial color={COLORS.steel} metalness={0.7} roughness={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function GalleriaRoof() {
  const purlins = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const angle = 0.16 + index * ((Math.PI - 0.32) / 6);
        return {
          position: [MALL_CENTER_X, 1.96 + Math.sin(angle) * 1.5, -Math.cos(angle) * 1.5] as Vec3,
          scale: [MALL_ROOF_LENGTH + 0.06, 0.035, 0.035] as Vec3,
        };
      }),
    [],
  );

  return (
    <group>
      <mesh position={[MALL_CENTER_X, 1.96, 0]} rotation-z={Math.PI / 2} raycast={() => undefined}>
        <cylinderGeometry args={[1.5, 1.5, MALL_ROOF_LENGTH, 32, 1, true, 0, Math.PI]} />
        <meshPhysicalMaterial
          clearcoat={0.8}
          clearcoatRoughness={0.12}
          color={COLORS.glass}
          depthWrite={false}
          metalness={0.16}
          opacity={0.47}
          roughness={0.13}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      <RoofRibs />
      <BoxInstances items={purlins} color={COLORS.steel} metalness={0.72} roughness={0.32} />
      <mesh position={[MALL_CENTER_X, 1.97, 1.51]} raycast={() => undefined}>
        <boxGeometry args={[MALL_ROOF_LENGTH + 0.12, 0.08, 0.1]} />
        <meshStandardMaterial color={COLORS.steelDark} metalness={0.68} roughness={0.38} />
      </mesh>
      <mesh position={[MALL_CENTER_X, 1.97, -1.51]} raycast={() => undefined}>
        <boxGeometry args={[MALL_ROOF_LENGTH + 0.12, 0.08, 0.1]} />
        <meshStandardMaterial color={COLORS.steelDark} metalness={0.68} roughness={0.38} />
      </mesh>
    </group>
  );
}

function MallRightEndWall() {
  return (
    <group>
      <mesh position={[MALL_RIGHT_X + 0.025, 1, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.11, 1.9, 3]} />
        <meshPhysicalMaterial
          clearcoat={0.76}
          color={COLORS.glassDark}
          metalness={0.24}
          opacity={0.68}
          roughness={0.18}
          transparent
        />
      </mesh>
      <mesh
        position={[MALL_RIGHT_X + 0.03, 1.96, 0]}
        rotation-y={Math.PI / 2}
        raycast={() => undefined}
      >
        <circleGeometry args={[1.5, 32, 0, Math.PI]} />
        <meshPhysicalMaterial
          clearcoat={0.8}
          color={COLORS.glass}
          depthWrite={false}
          metalness={0.18}
          opacity={0.58}
          roughness={0.14}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      {[-1.46, -0.74, 0, 0.74, 1.46].map((z) => (
        <mesh
          key={z}
          position={[MALL_RIGHT_X + 0.09, 1.02, z]}
          raycast={() => undefined}
        >
          <boxGeometry args={[0.07, 1.86, 0.045]} />
          <meshStandardMaterial color={COLORS.steelDark} metalness={0.7} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[MALL_RIGHT_X + 0.09, 1.96, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.07, 0.065, 3.04]} />
        <meshStandardMaterial color={COLORS.steelDark} metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[MALL_RIGHT_X + 0.09, 2.69, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.07, 1.42, 0.045]} />
        <meshStandardMaterial color={COLORS.steel} metalness={0.72} roughness={0.3} />
      </mesh>
    </group>
  );
}

function EatonSign() {
  const signTexture = useTexture("/cf-eaton-sign.svg");

  useLayoutEffect(() => {
    signTexture.colorSpace = THREE.SRGBColorSpace;
    signTexture.anisotropy = 8;
    signTexture.needsUpdate = true;
  }, [signTexture]);

  return (
    <group>
      {[0, SECONDARY_ENTRANCE_X].map((x) => (
        <mesh key={x} position={[x, 2.2, 2.315]} raycast={() => undefined}>
          <planeGeometry args={[1.86, 0.52]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Storefronts() {
  const { frames, glass, signs } = useMemo(() => {
    const glassItems: InstanceItem[] = [];
    const frameItems: InstanceItem[] = [];
    const signItems: InstanceItem[] = [];
    const columns = Array.from(
      { length: 31 },
      (_, index) => -3 + index * 0.5,
    ).filter(
      (x) =>
        Math.abs(x) > 0.95 &&
        Math.abs(x - SECONDARY_ENTRANCE_X) > 0.9,
    );
    [0.58, 1.2].forEach((y, floorIndex) => {
      columns.forEach((x, index) => {
        glassItems.push({
          position: [x, y, 2.205],
          scale: [0.39, 0.46, 0.035],
          color: (index + floorIndex) % 3 === 0 ? "#d39558" : "#4f98b4",
        });
        frameItems.push({ position: [x, y - 0.27, 2.23], scale: [0.46, 0.04, 0.05] });
        signItems.push({
          position: [x, y + 0.27, 2.237],
          scale: [0.34, 0.055, 0.025],
          color: index % 2 === 0 ? "#f2bb6d" : "#7bd1ee",
        });
      });
    });
    return { frames: frameItems, glass: glassItems, signs: signItems };
  }, []);

  return (
    <group>
      <BoxInstances
        items={glass}
        color={COLORS.glassDark}
        emissive={COLORS.warm}
        emissiveIntensity={0.22}
        metalness={0.42}
        roughness={0.25}
        vertexColors
      />
      <BoxInstances items={frames} color={COLORS.steelDark} metalness={0.58} roughness={0.4} />
      <BoxInstances
        items={signs}
        color="#ffffff"
        emissive="#a6dfff"
        emissiveIntensity={0.7}
        roughness={0.3}
        vertexColors
      />
    </group>
  );
}

function GalleriaInterior() {
  const balconyRails = useMemo<InstanceItem[]>(
    () =>
      [0.82, 1.42].flatMap((y) =>
        [-1.12, 1.12].map((z) => ({
          position: [MALL_CENTER_X, y, z] as Vec3,
          scale: [MALL_ROOF_LENGTH - 0.2, 0.055, 0.045] as Vec3,
        })),
      ),
    [],
  );
  const geese = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 19 }, (_, index) => {
        const x = -2.35 + index * 0.76;
        const y = 2.42 + (index % 3) * 0.16;
        const z = (index % 2 === 0 ? -1 : 1) * 0.22;
        return [
          { position: [x - 0.08, y, z], rotation: [0, 0, 0.48], scale: [0.18, 0.025, 0.08] },
          { position: [x + 0.08, y, z], rotation: [0, 0, -0.48], scale: [0.18, 0.025, 0.08] },
        ] as InstanceItem[];
      }).flat(),
    [],
  );
  const suspensionWires = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 19 }, (_, index) => ({
        position: [-2.35 + index * 0.76, 2.77 + (index % 3) * 0.08, (index % 2 === 0 ? -1 : 1) * 0.22],
        scale: [0.012, 0.56, 0.012],
      })),
    [],
  );

  return (
    <group>
      <BoxInstances items={balconyRails} color="#d7e4e8" metalness={0.55} roughness={0.32} />
      <BoxInstances items={geese} color="#b8c1c2" metalness={0.5} roughness={0.5} />
      <BoxInstances items={suspensionWires} color="#77878d" metalness={0.7} roughness={0.34} />
      {[-1.3, 1.3, 6.9, 9.5].map((x, index) => (
        <group key={x} position={[x, 0.92, 0.15]} rotation-z={index === 0 ? -0.36 : 0.36}>
          <mesh raycast={() => undefined}>
            <boxGeometry args={[1.65, 0.12, 0.46]} />
            <meshStandardMaterial color="#4d5960" metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.09, 0]} raycast={() => undefined}>
            <boxGeometry args={[1.55, 0.035, 0.38]} />
            <meshBasicMaterial color="#8edfff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EntranceAndPlaza() {
  const planters = useMemo<InstanceItem[]>(
    () =>
      [-2.65, -1.65, 1.65, 2.65, 5.6, 6.55, 10.25, 11.2].map((x) => ({
        position: [x, 0.25, 2.55],
        scale: [0.24, 0.42, 0.24],
      })),
    [],
  );
  const foliage = useMemo<InstanceItem[]>(
    () =>
      planters.flatMap(({ position }, planterIndex) =>
        Array.from({ length: 3 }, (_, index) => ({
          position: [
            position[0] + (index - 1) * 0.12,
            0.57 + (index % 2) * 0.08,
            position[2] + (index % 2) * 0.08,
          ] as Vec3,
          scale: [0.22, 0.26, 0.22] as Vec3,
          color: planterIndex % 2 === 0 ? "#275442" : "#1e4939",
        })),
      ),
    [planters],
  );
  const bollards = useMemo<InstanceItem[]>(
    () =>
      [-0.92, -0.56, 0.56, 0.92, 7.72, 8.08, 8.72, 9.08].map((x) => ({
        position: [x, 0.24, 2.65],
        scale: [0.07, 0.45, 0.07],
      })),
    [],
  );

  return (
    <group>
      <mesh position={[MALL_CENTER_X, 0.065, 2.47]} receiveShadow raycast={() => undefined}>
        <boxGeometry args={[MALL_PARCEL_WIDTH - 0.25, 0.08, 0.82]} />
        <meshStandardMaterial color={COLORS.pavement} roughness={0.9} />
      </mesh>
      {[0, SECONDARY_ENTRANCE_X].map((entranceX) => (
        <group key={entranceX} position-x={entranceX}>
          <mesh position={[0, 0.83, 2.25]} raycast={() => undefined}>
            <boxGeometry args={[entranceX === 0 ? 1.48 : 1.34, 1.35, 0.07]} />
            <meshPhysicalMaterial
              clearcoat={0.82}
              color="#285b73"
              metalness={0.22}
              opacity={0.68}
              roughness={0.15}
              transparent
            />
          </mesh>
          <mesh position={[0, 1.52, 2.43]} raycast={() => undefined}>
            <boxGeometry args={[entranceX === 0 ? 1.8 : 1.62, 0.09, 0.62]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.65} roughness={0.34} />
          </mesh>
          {[-0.48, 0, 0.48].map((mullionX) => (
            <mesh key={mullionX} position={[mullionX, 0.72, 2.3]} raycast={() => undefined}>
              <boxGeometry args={[0.035, 1.12, 0.04]} />
              <meshStandardMaterial color="#bfd1d8" metalness={0.62} roughness={0.32} />
            </mesh>
          ))}
        </group>
      ))}
      <BoxInstances items={planters} color="#3b454a" metalness={0.34} roughness={0.58} />
      <SphereInstances items={foliage} />
      <BoxInstances items={bollards} color="#77858b" metalness={0.72} roughness={0.38} />
    </group>
  );
}

export default function EatonCentreDetailed() {
  const facadeBands = useMemo<InstanceItem[]>(
    () =>
      [0.32, 0.92, 1.54].map((y) => ({
        position: [MALL_CENTER_X, y, 2.19],
        scale: [MALL_BODY_WIDTH, 0.08, 0.08],
      })),
    [],
  );
  const facadeMullions = useMemo<InstanceItem[]>(
    () =>
      [-3.04, -2.85, -0.92, 0.92, 3.3, 5.55, 7.5, 9.3, 11.85, 12.04].map((x) => ({
        position: [x, 1.02, 2.2],
        scale: [0.07, 1.92, 0.08],
      })),
    [],
  );

  return (
    <group>
      <mesh position={[MALL_CENTER_X, 0.045, 0]} receiveShadow>
        <boxGeometry args={[MALL_PARCEL_WIDTH, 0.09, 4.82]} />
        <meshStandardMaterial color="#414a4e" metalness={0.22} roughness={0.66} />
      </mesh>
      <mesh position={[MALL_CENTER_X, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[MALL_BODY_WIDTH, 1.1, 4.35]} />
        <meshStandardMaterial color={COLORS.facadeDark} metalness={0.3} roughness={0.52} />
      </mesh>
      <mesh position={[MALL_CENTER_X, 1.38, 1.78]} castShadow receiveShadow>
        <boxGeometry args={[MALL_BODY_WIDTH - 0.2, 1.68, 0.83]} />
        <meshStandardMaterial color={COLORS.facade} metalness={0.12} roughness={0.6} />
      </mesh>
      <mesh position={[MALL_CENTER_X, 1.38, -1.78]} castShadow receiveShadow>
        <boxGeometry args={[MALL_BODY_WIDTH - 0.2, 1.68, 0.83]} />
        <meshStandardMaterial color="#8f9697" metalness={0.18} roughness={0.56} />
      </mesh>

      <GalleriaInterior />
      <GalleriaRoof />
      <MallRightEndWall />
      <Storefronts />
      <EatonSign />
      <EntranceAndPlaza />
      <BoxInstances items={facadeBands} color={COLORS.steelDark} metalness={0.62} roughness={0.38} />
      <BoxInstances items={facadeMullions} color="#768990" metalness={0.6} roughness={0.36} />

      <mesh position={[MALL_CENTER_X, 0.15, 0]} rotation-x={-Math.PI / 2} raycast={() => undefined}>
        <planeGeometry args={[MALL_ROOF_LENGTH - 0.25, 2.65]} />
        <meshBasicMaterial color={COLORS.warm} opacity={0.09} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
