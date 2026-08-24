"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type Vec3 = [number, number, number];

type InstanceBox = {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: string;
};

type WingDefinition = {
  position: Vec3;
  width: number;
  depth: number;
  floors: number;
  columnsFront: number;
  columnsSide: number;
  seed: number;
};

const FLOOR_PITCH = 0.575;

const SHOPIFY_S_VECTOR = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74.61 86.73">
    <path fill="#fff" d="m39.55 27.27-2.62 9.8A15 15 0 0 0 30.54 36c-5.08.33-5.13 3.53-5.08 4.33.27 4.39 11.8 5.34 12.45 15.61.51 8.08-4.28 13.6-11.19 14a16.75 16.75 0 0 1-12.85-4.3l1.75-7.47s4.6 3.46 8.27 3.23a3.26 3.26 0 0 0 3.19-3.4v-.17c-.36-5.72-9.76-5.39-10.35-14.78-.5-7.91 4.69-15.92 16.15-16.64 4.41-.27 6.67.86 6.67.86Z"/>
  </svg>
`;

const COLORS = {
  glass: "#132c3b",
  glassHighlight: "#24475a",
  glassDark: "#091923",
  mullion: "#273a45",
  aluminum: "#7f919a",
  aluminumBright: "#9eb0b8",
  brick: "#5b3731",
  brickDark: "#392825",
  brickLight: "#7d4d42",
  mortar: "#302927",
  limestone: "#8c8780",
  roof: "#26343b",
  warm: "#ffc477",
  blue: "#48c6ff",
};

function pseudoRandom(seed: number, index: number, channel: number) {
  const value = Math.sin(seed * 19.37 + index * 47.17 + channel * 83.11) * 43758.5453;
  return value - Math.floor(value);
}

function StaticInstances({
  items,
  color,
  metalness = 0.05,
  roughness = 0.75,
  vertexColors = false,
}: {
  items: InstanceBox[];
  color: string;
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
      receiveShadow
      raycast={() => undefined}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        vertexColors={vertexColors}
      />
    </instancedMesh>
  );
}

function LuminousInstances({ items }: { items: InstanceBox[] }) {
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
      mesh.current?.setColorAt(index, new THREE.Color(item.color ?? COLORS.glassDark));
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
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} vertexColors />
    </instancedMesh>
  );
}

function Beam({
  start,
  end,
  radius = 0.018,
  color = COLORS.aluminum,
}: {
  start: Vec3;
  end: Vec3;
  radius?: number;
  color?: string;
}) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const startPoint = new THREE.Vector3(...start);
    const endPoint = new THREE.Vector3(...end);
    const direction = endPoint.clone().sub(startPoint);
    return {
      midpoint: startPoint.add(endPoint).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [end, start]);

  return (
    <mesh position={midpoint} quaternion={quaternion} raycast={() => undefined}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.88} roughness={0.28} />
    </mesh>
  );
}

function createRoundedSlabGeometry(width: number, depth: number, height: number, radius: number) {
  const halfWidth = width * 0.5;
  const halfDepth = depth * 0.5;
  const shape = new THREE.Shape();

  shape.moveTo(-halfWidth + radius, -halfDepth);
  shape.lineTo(halfWidth - radius, -halfDepth);
  shape.quadraticCurveTo(halfWidth, -halfDepth, halfWidth, -halfDepth + radius);
  shape.lineTo(halfWidth, halfDepth - radius);
  shape.quadraticCurveTo(halfWidth, halfDepth, halfWidth - radius, halfDepth);
  shape.lineTo(-halfWidth + radius, halfDepth);
  shape.quadraticCurveTo(-halfWidth, halfDepth, -halfWidth, halfDepth - radius);
  shape.lineTo(-halfWidth, -halfDepth + radius);
  shape.quadraticCurveTo(-halfWidth, -halfDepth, -halfWidth + radius, -halfDepth);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: false,
    depth: height,
    steps: 1,
    curveSegments: 3,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -height * 0.5, 0);
  geometry.computeVertexNormals();
  return geometry;
}

function FloorBands({
  width,
  depth,
  floors,
}: {
  width: number;
  depth: number;
  floors: number;
}) {
  const geometry = useMemo(
    () => createRoundedSlabGeometry(width + 0.1, depth + 0.1, 0.085, 0.22),
    [depth, width],
  );
  const mesh = useRef<THREE.InstancedMesh>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    for (let floor = 0; floor <= floors; floor += 1) {
      helper.position.set(0, floor * FLOOR_PITCH, 0);
      helper.updateMatrix();
      mesh.current.setMatrixAt(floor, helper.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [floors, geometry]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, floors + 1]}
      castShadow
      raycast={() => undefined}
    >
      <meshStandardMaterial color={COLORS.aluminum} metalness={0.82} roughness={0.3} />
    </instancedMesh>
  );
}

function CurtainWallWing({ wing }: { wing: WingDefinition }) {
  const height = wing.floors * FLOOR_PITCH;
  const { windows, mullions, ceilingLights } = useMemo(() => {
    const panes: InstanceBox[] = [];
    const frames: InstanceBox[] = [];
    const lights: InstanceBox[] = [];

    for (let floor = 0; floor < wing.floors; floor += 1) {
      const y = floor * FLOOR_PITCH + FLOOR_PITCH * 0.51;
      const paneHeight = FLOOR_PITCH - 0.145;
      const frontPitch = wing.width / wing.columnsFront;
      const sidePitch = wing.depth / wing.columnsSide;

      for (let column = 0; column < wing.columnsFront; column += 1) {
        const value = pseudoRandom(wing.seed, floor * 19 + column, 0);
        const color =
          value > 0.79
            ? value > 0.94
              ? "#9ee7ff"
              : "#ffc982"
            : value < 0.13
              ? "#08151d"
              : floor % 3 === 0
                ? "#1c4255"
                : "#133244";
        panes.push({
          position: [
            -wing.width * 0.5 + frontPitch * (column + 0.5),
            y,
            wing.depth * 0.5 + 0.026,
          ],
          scale: [frontPitch - 0.055, paneHeight, 0.028],
          color,
        });
      }

      for (let column = 0; column < wing.columnsSide; column += 1) {
        const value = pseudoRandom(wing.seed + 11, floor * 17 + column, 1);
        const color =
          value > 0.8
            ? value > 0.95
              ? "#82dfff"
              : "#ffd292"
            : value < 0.12
              ? "#07131b"
              : floor % 2 === 0
                ? "#193b4d"
                : "#102d3d";
        panes.push({
          position: [
            wing.width * 0.5 + 0.026,
            y,
            -wing.depth * 0.5 + sidePitch * (column + 0.5),
          ],
          scale: [0.028, paneHeight, sidePitch - 0.055],
          color,
        });
      }

      if (floor % 2 === 1) {
        lights.push({
          position: [0, y + paneHeight * 0.36, wing.depth * 0.5 + 0.048],
          scale: [wing.width * 0.76, 0.018, 0.018],
          color: "#ffd69a",
        });
      }
    }

    for (let column = 0; column <= wing.columnsFront; column += 1) {
      frames.push({
        position: [
          -wing.width * 0.5 + (wing.width / wing.columnsFront) * column,
          height * 0.5,
          wing.depth * 0.5 + 0.052,
        ],
        scale: [0.027, height, 0.035],
      });
    }
    for (let column = 0; column <= wing.columnsSide; column += 1) {
      frames.push({
        position: [
          wing.width * 0.5 + 0.052,
          height * 0.5,
          -wing.depth * 0.5 + (wing.depth / wing.columnsSide) * column,
        ],
        scale: [0.035, height, 0.027],
      });
    }
    return { windows: panes, mullions: frames, ceilingLights: lights };
  }, [height, wing]);

  return (
    <group position={wing.position}>
      <RoundedBox
        args={[wing.width, height, wing.depth]}
        castShadow
        bevelSegments={2}
        position={[0, height * 0.5, 0]}
        radius={0.22}
        receiveShadow
        smoothness={2}
      >
        <meshPhysicalMaterial
          clearcoat={0.95}
          clearcoatRoughness={0.12}
          color={COLORS.glass}
          emissive={COLORS.glassDark}
          emissiveIntensity={0.3}
          metalness={0.38}
          roughness={0.17}
        />
      </RoundedBox>
      <LuminousInstances items={windows} />
      <LuminousInstances items={ceilingLights} />
      <StaticInstances
        color={COLORS.mullion}
        items={mullions}
        metalness={0.86}
        roughness={0.26}
      />
      <FloorBands depth={wing.depth} floors={wing.floors} width={wing.width} />
    </group>
  );
}

function BrickSkin() {
  const bricks = useMemo<InstanceBox[]>(() => {
    const result: InstanceBox[] = [];
    const courseHeight = 0.105;
    const brickWidth = 0.205;
    const moduleWidth = 0.235;
    const rows = 15;

    for (let row = 0; row < rows; row += 1) {
      const offset = row % 2 === 0 ? 0 : moduleWidth * 0.5;
      for (let x = -2.82 + brickWidth * 0.5 - offset; x < 2.82; x += moduleWidth) {
        if (x - brickWidth * 0.5 < -2.86 || x + brickWidth * 0.5 > 2.86) continue;
        const shade = (row * 13 + result.length * 5) % 17;
        result.push({
          position: [x, 0.34 + row * courseHeight, 1.802],
          scale: [brickWidth, 0.068, 0.035],
          color: shade === 0 ? COLORS.brickLight : shade < 4 ? COLORS.brickDark : COLORS.brick,
        });
      }
      for (let z = -1.63 + brickWidth * 0.5 - offset; z < 1.63; z += moduleWidth) {
        if (z - brickWidth * 0.5 < -1.66 || z + brickWidth * 0.5 > 1.66) continue;
        const shade = (row * 11 + result.length * 3) % 19;
        result.push({
          position: [2.902, 0.34 + row * courseHeight, z],
          scale: [0.035, 0.068, brickWidth],
          color: shade === 0 ? COLORS.brickLight : shade < 4 ? COLORS.brickDark : COLORS.brick,
        });
      }
    }
    return result;
  }, []);

  return (
    <StaticInstances
      color="#ffffff"
      items={bricks}
      roughness={0.92}
      vertexColors
    />
  );
}

function StorefrontBay({ x, width, lit = false }: { x: number; width: number; lit?: boolean }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.94, 1.845]}>
        <boxGeometry args={[width, 1.12, 0.035]} />
        <meshPhysicalMaterial
          clearcoat={1}
          color={lit ? "#5a4634" : "#183444"}
          emissive={lit ? "#7d512e" : "#0b202c"}
          emissiveIntensity={lit ? 0.75 : 0.35}
          metalness={0.22}
          roughness={0.16}
        />
      </mesh>
      {[-width * 0.5, 0, width * 0.5].map((offset) => (
        <mesh key={offset} position={[offset, 0.94, 1.885]} raycast={() => undefined}>
          <boxGeometry args={[0.035, 1.18, 0.045]} />
          <meshStandardMaterial color="#1a272e" metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 1.884]} raycast={() => undefined}>
        <boxGeometry args={[width + 0.06, 0.055, 0.05]} />
        <meshStandardMaterial color={COLORS.limestone} roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.18, 1.889]} raycast={() => undefined}>
        <boxGeometry args={[width, 0.028, 0.05]} />
        <meshStandardMaterial color="#28363c" metalness={0.84} roughness={0.3} />
      </mesh>
      {lit ? (
        <mesh position={[0, 1.36, 1.91]} raycast={() => undefined}>
          <boxGeometry args={[width * 0.68, 0.018, 0.018]} />
          <meshBasicMaterial color={COLORS.warm} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function ModernEntrance() {
  return (
    <group position={[2.15, 0, 0]}>
      <mesh castShadow position={[0, 1.17, 1.9]} receiveShadow>
        <boxGeometry args={[1.12, 1.92, 0.08]} />
        <meshPhysicalMaterial
          clearcoat={1}
          color="#173b4e"
          emissive="#704a2e"
          emissiveIntensity={0.48}
          metalness={0.28}
          roughness={0.13}
        />
      </mesh>
      {[-0.56, -0.19, 0.19, 0.56].map((x) => (
        <mesh key={x} position={[x, 1.17, 1.955]} raycast={() => undefined}>
          <boxGeometry args={[0.035, 1.98, 0.045]} />
          <meshStandardMaterial color="#1c2a31" metalness={0.92} roughness={0.22} />
        </mesh>
      ))}
      {[0.25, 1.25, 2.16].map((y) => (
        <mesh key={y} position={[0, y, 1.954]} raycast={() => undefined}>
          <boxGeometry args={[1.18, 0.035, 0.045]} />
          <meshStandardMaterial color="#263840" metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 2.17, 2.19]}>
        <boxGeometry args={[1.42, 0.12, 0.62]} />
        <meshStandardMaterial color="#202d33" metalness={0.84} roughness={0.3} />
      </mesh>
      {[-0.51, 0.51].map((x) => (
        <Beam
          key={x}
          end={[x, 2.1, 1.9]}
          radius={0.015}
          start={[x, 2.08, 2.46]}
        />
      ))}
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[x, 0.76, 2.005]}>
          <boxGeometry args={[0.018, 0.36, 0.022]} />
          <meshStandardMaterial color="#d2d9dc" metalness={0.96} roughness={0.14} />
        </mesh>
      ))}
      <pointLight color="#ffc684" decay={2} distance={3.2} intensity={1.1} position={[0, 1.45, 2.12]} />
    </group>
  );
}

function HeritagePodium() {
  const pilasters = useMemo<InstanceBox[]>(
    () =>
      [-2.9, -2.15, -1.4, -0.65, 0.1, 0.85, 1.6, 2.9].map((x) => ({
        position: [x, 1.02, 1.845] as Vec3,
        scale: [0.14, 1.62, 0.12] as Vec3,
      })),
    [],
  );

  return (
    <group>
      <mesh castShadow position={[0, 0.96, 0.02]} receiveShadow>
        <boxGeometry args={[5.82, 1.78, 3.58]} />
        <meshStandardMaterial color={COLORS.mortar} roughness={0.94} />
      </mesh>
      <BrickSkin />
      <StaticInstances color="#674239" items={pilasters} roughness={0.9} />

      {[
        [-2.52, 0.53, false],
        [-1.82, 0.53, true],
        [-1.12, 0.53, false],
        [-0.42, 0.53, true],
        [0.28, 0.53, false],
        [0.98, 0.53, true],
        [1.6, 0.42, false],
      ].map(([x, width, lit]) => (
        <StorefrontBay key={x as number} lit={lit as boolean} width={width as number} x={x as number} />
      ))}

      <ModernEntrance />
      <mesh castShadow position={[0, 1.83, 1.83]} receiveShadow>
        <boxGeometry args={[6.02, 0.14, 0.25]} />
        <meshStandardMaterial color="#4b3935" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, 1.91, 1.87]} receiveShadow>
        <boxGeometry args={[6.12, 0.07, 0.32]} />
        <meshStandardMaterial color={COLORS.limestone} metalness={0.08} roughness={0.74} />
      </mesh>
      {[-2.55, -1.7, -0.85, 0, 0.85, 1.7, 2.55].map((x, index) => (
        <mesh key={x} castShadow position={[x, index % 2 === 0 ? 2.03 : 1.99, 1.74]}>
          <boxGeometry args={[0.28, index % 2 === 0 ? 0.3 : 0.22, 0.28]} />
          <meshStandardMaterial color={COLORS.brickDark} roughness={0.9} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.16, 2.04]} receiveShadow>
        <boxGeometry args={[6.24, 0.18, 0.62]} />
        <meshStandardMaterial color="#6f7374" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.27, 2.04]} receiveShadow>
        <boxGeometry args={[6.14, 0.035, 0.56]} />
        <meshStandardMaterial color="#9ba0a0" roughness={0.82} />
      </mesh>
    </group>
  );
}

function Planter({ position, width = 0.7 }: { position: Vec3; width?: number }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[width, 0.32, 0.36]} />
        <meshStandardMaterial color="#4d5759" metalness={0.22} roughness={0.72} />
      </mesh>
      {[-0.24, 0, 0.24].map((x, index) => (
        <group key={x} position={[x * width, 0.34, 0]}>
          <mesh rotation={[index * 0.3, 0, 0.14 - index * 0.14]}>
            <cylinderGeometry args={[0.018, 0.028, 0.42 + index * 0.05, 7]} />
            <meshStandardMaterial color="#496b58" roughness={0.94} />
          </mesh>
          <mesh position={[0, 0.22 + index * 0.025, 0]}>
            <icosahedronGeometry args={[0.14 + index * 0.02, 1]} />
            <meshStandardMaterial color={index % 2 === 0 ? "#315344" : "#3d624f"} roughness={0.96} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bicycle({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.24, 0]} raycast={() => undefined}>
          <torusGeometry args={[0.22, 0.018, 8, 20]} />
          <meshStandardMaterial color="#111719" metalness={0.58} roughness={0.46} />
        </mesh>
      ))}
      <Beam color="#48a9cc" end={[0, 0.51, 0]} radius={0.015} start={[-0.25, 0.24, 0]} />
      <Beam color="#48a9cc" end={[0.25, 0.24, 0]} radius={0.015} start={[0, 0.51, 0]} />
      <Beam color="#48a9cc" end={[-0.25, 0.24, 0]} radius={0.015} start={[0.08, 0.24, 0]} />
      <Beam color="#48a9cc" end={[0, 0.51, 0]} radius={0.015} start={[0.08, 0.24, 0]} />
      <Beam color="#a4b0b4" end={[0.3, 0.62, 0]} radius={0.012} start={[0.25, 0.24, 0]} />
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.07]} />
        <meshStandardMaterial color="#14191b" roughness={0.65} />
      </mesh>
    </group>
  );
}

function StreetDetails() {
  return (
    <group>
      <Planter position={[-2.55, 0.26, 2.02]} width={0.68} />
      <Planter position={[1.4, 0.26, 2.03]} width={0.62} />
      <Bicycle position={[-1.15, 0.27, 2.12]} rotation={0.04} />
      {[-1.58, -0.82].map((x) => (
        <group key={x} position={[x, 0.28, 2.13]}>
          <Beam color="#78858a" end={[-0.13, 0.48, 0]} radius={0.022} start={[-0.13, 0, 0]} />
          <Beam color="#78858a" end={[0.13, 0.48, 0]} radius={0.022} start={[0.13, 0, 0]} />
          <Beam color="#78858a" end={[0.13, 0.48, 0]} radius={0.022} start={[-0.13, 0.48, 0]} />
        </group>
      ))}
      {[1.72, 2.6].map((x) => (
        <mesh key={x} castShadow position={[x, 0.58, 2.18]}>
          <cylinderGeometry args={[0.065, 0.085, 0.62, 12]} />
          <meshStandardMaterial color="#25343a" metalness={0.8} roughness={0.36} />
        </mesh>
      ))}
    </group>
  );
}

function TerraceRail({ width, depth, position }: { width: number; depth: number; position: Vec3 }) {
  const y = 0.42;
  return (
    <group position={position}>
      {[-width * 0.5, width * 0.5].map((x) => (
        <Beam key={`side-${x}`} end={[x, y, depth * 0.5]} radius={0.014} start={[x, y, -depth * 0.5]} />
      ))}
      {[-depth * 0.5, depth * 0.5].map((z) => (
        <Beam key={`front-${z}`} end={[width * 0.5, y, z]} radius={0.014} start={[-width * 0.5, y, z]} />
      ))}
      {[-width * 0.5, 0, width * 0.5].map((x) =>
        [-depth * 0.5, depth * 0.5].map((z) => (
          <Beam key={`${x}-${z}`} end={[x, y, z]} radius={0.012} start={[x, 0.04, z]} />
        )),
      )}
    </group>
  );
}

function RooftopDetails() {
  return (
    <group>
      <mesh castShadow position={[-1.45, 8.2, -0.18]} receiveShadow>
        <boxGeometry args={[2.82, 0.16, 3.38]} />
        <meshStandardMaterial color="#313d43" metalness={0.68} roughness={0.42} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[-2.74 + index * 0.32, 8.105, 1.38]} raycast={() => undefined}>
          <boxGeometry args={[0.22, 0.035, 0.12]} />
          <meshStandardMaterial color="#171f23" metalness={0.58} roughness={0.5} />
        </mesh>
      ))}

      <mesh castShadow position={[0.1, 8.86, -0.42]} receiveShadow>
        <boxGeometry args={[1.28, 0.32, 1.1]} />
        <meshStandardMaterial color={COLORS.roof} metalness={0.62} roughness={0.45} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[-0.48, 8.86, -0.78 + index * 0.12]} raycast={() => undefined}>
          <boxGeometry args={[0.025, 0.2, 0.055]} />
          <meshStandardMaterial color="#65747a" metalness={0.82} roughness={0.34} />
        </mesh>
      ))}
      <mesh castShadow position={[0.72, 8.93, -0.48]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.64, 14]} />
        <meshStandardMaterial color="#78858a" metalness={0.78} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[-0.42, 9.08, -0.48]}>
        <cylinderGeometry args={[0.09, 0.12, 0.38, 12]} />
        <meshStandardMaterial color="#77848a" metalness={0.82} roughness={0.36} />
      </mesh>
      <mesh castShadow position={[-0.42, 9.29, -0.48]}>
        <cylinderGeometry args={[0.15, 0.075, 0.07, 12]} />
        <meshStandardMaterial color="#8e9a9e" metalness={0.84} roughness={0.34} />
      </mesh>

      <TerraceRail depth={2.66} position={[1.45, 7.73, 0.05]} width={2.28} />
      <Planter position={[1.45, 7.7, 1.12]} width={1.2} />
      <Planter position={[2.35, 7.7, -0.62]} width={0.65} />
    </group>
  );
}

function ShopifySMark() {
  const geometry = useMemo(() => {
    const parsed = new SVGLoader().parse(SHOPIFY_S_VECTOR);
    const shapes = parsed.paths.flatMap((path) => SVGLoader.createShapes(path));
    const result = new THREE.ExtrudeGeometry(shapes, {
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.9,
      bevelThickness: 0.75,
      curveSegments: 12,
      depth: 1.5,
      steps: 1,
    });
    result.computeBoundingBox();
    const bounds = result.boundingBox;
    if (bounds) {
      const centerX = (bounds.min.x + bounds.max.x) * 0.5;
      const centerY = (bounds.min.y + bounds.max.y) * 0.5;
      const height = Math.max(0.001, bounds.max.y - bounds.min.y);
      const scale = 0.88 / height;
      result.translate(-centerX, -centerY, -0.75);
      result.scale(scale, -scale, 0.012);
    }
    result.computeVertexNormals();
    return result;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={[-0.14, -0.16, 0.086]}>
      <mesh
        geometry={geometry}
        position={[0, 0, -0.012]}
        raycast={() => undefined}
        scale={1.22}
      >
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#43d4ff"
          depthWrite={false}
          opacity={0.2}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh geometry={geometry} position={[0, 0, -0.005]} raycast={() => undefined} scale={1.1}>
        <meshBasicMaterial color="#45ceff" toneMapped={false} />
      </mesh>
      <mesh castShadow geometry={geometry} raycast={() => undefined}>
        <meshPhysicalMaterial
          clearcoat={0.95}
          clearcoatRoughness={0.1}
          color="#ffffff"
          emissive="#d7f7ff"
          emissiveIntensity={0.52}
          metalness={0.08}
          roughness={0.16}
        />
        <Edges color="#e8fbff" threshold={8} />
      </mesh>
    </group>
  );
}

function ShopifyChannelMark() {
  const { bodyGeometry, facetGeometry, frontHandle, rearHandle } = useMemo(() => {
    const body = new THREE.Shape();
    body.moveTo(-0.76, -0.82);
    body.lineTo(0.7, -0.82);
    body.lineTo(0.6, 0.48);
    body.lineTo(0.37, 0.55);
    body.lineTo(-0.6, 0.44);
    body.closePath();

    const bodyExtrusion = new THREE.ExtrudeGeometry(body, {
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.018,
      bevelThickness: 0.012,
      curveSegments: 6,
      depth: 0.055,
      steps: 1,
    });
    bodyExtrusion.computeVertexNormals();

    const facet = new THREE.Shape();
    facet.moveTo(0.34, -0.78);
    facet.lineTo(0.68, -0.78);
    facet.lineTo(0.58, 0.44);
    facet.lineTo(0.37, 0.51);
    facet.closePath();

    return {
      bodyGeometry: bodyExtrusion,
      facetGeometry: new THREE.ShapeGeometry(facet, 3),
      frontHandle: new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.46, 0.42, 0.055),
        new THREE.Vector3(-0.39, 1.03, 0.055),
        new THREE.Vector3(0.26, 1.11, 0.055),
        new THREE.Vector3(0.38, 0.52, 0.055),
      ),
      rearHandle: new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.28, 0.48, 0.025),
        new THREE.Vector3(-0.13, 0.91, 0.025),
        new THREE.Vector3(0.44, 0.96, 0.025),
        new THREE.Vector3(0.53, 0.48, 0.025),
      ),
    };
  }, []);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      facetGeometry.dispose();
    },
    [bodyGeometry, facetGeometry],
  );

  return (
    <group scale={0.88}>
      {[-0.49, 0.49].flatMap((x) =>
        [-0.55, 0.33].map((y) => (
          <mesh
            key={`${x}-${y}`}
            castShadow
            position={[x, y, -0.018]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.028, 0.028, 0.085, 10]} />
            <meshStandardMaterial color="#7e8a8f" metalness={0.92} roughness={0.22} />
          </mesh>
        )),
      )}
      <mesh castShadow geometry={bodyGeometry} receiveShadow>
        <meshPhysicalMaterial
          clearcoat={0.86}
          clearcoatRoughness={0.16}
          color="#39baf1"
          emissive="#0b5279"
          emissiveIntensity={0.32}
          metalness={0.36}
          roughness={0.24}
        />
        <Edges color="#8ee7ff" threshold={12} />
      </mesh>
      <mesh geometry={facetGeometry} position={[0, 0, 0.074]} raycast={() => undefined}>
        <meshStandardMaterial
          color="#1689cf"
          emissive="#074d78"
          emissiveIntensity={0.28}
          metalness={0.32}
          roughness={0.26}
        />
      </mesh>
      <mesh castShadow raycast={() => undefined}>
        <tubeGeometry args={[rearHandle, 34, 0.025, 10, false]} />
        <meshStandardMaterial
          color="#1689cf"
          emissive="#074d78"
          emissiveIntensity={0.26}
          metalness={0.34}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0, -0.002]} raycast={() => undefined}>
        <tubeGeometry args={[frontHandle, 42, 0.038, 12, false]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#43d4ff"
          depthWrite={false}
          opacity={0.24}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh castShadow raycast={() => undefined}>
        <tubeGeometry args={[frontHandle, 42, 0.027, 12, false]} />
        <meshPhysicalMaterial
          clearcoat={0.88}
          color="#48c6ff"
          emissive="#0b5279"
          emissiveIntensity={0.3}
          metalness={0.34}
          roughness={0.22}
        />
      </mesh>
      <ShopifySMark />
    </group>
  );
}

function ShopifySign({ reducedMotion }: { reducedMotion: boolean }) {
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!light.current) return;
    light.current.intensity = reducedMotion
      ? 1.6
      : 1.55 + Math.sin(clock.elapsedTime * 1.35) * 0.22;
  });

  return (
    <group position={[2.02, 6.48, 1.71]}>
      <ShopifyChannelMark />
      <pointLight ref={light} color={COLORS.blue} decay={2} distance={4.8} position={[0, 0.04, -0.02]} />
    </group>
  );
}

export default function ShopifyOfficeDetailed({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const wings = useMemo<WingDefinition[]>(
    () => [
      {
        position: [-1.45, 1.84, -0.18],
        width: 2.55,
        depth: 3.1,
        floors: 11,
        columnsFront: 7,
        columnsSide: 7,
        seed: 17,
      },
      {
        position: [0.02, 1.84, -0.42],
        width: 2.55,
        depth: 2.82,
        floors: 12,
        columnsFront: 7,
        columnsSide: 6,
        seed: 43,
      },
      {
        position: [1.45, 1.84, 0.05],
        width: 2.7,
        depth: 3.25,
        floors: 10,
        columnsFront: 7,
        columnsSide: 7,
        seed: 91,
      },
    ],
    [],
  );

  return (
    <group>
      <mesh castShadow position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[6.18, 0.16, 3.7]} />
        <meshStandardMaterial color="#4a5052" metalness={0.12} roughness={0.86} />
      </mesh>
      {wings.map((wing) => (
        <CurtainWallWing key={wing.seed} wing={wing} />
      ))}
      <HeritagePodium />
      <RooftopDetails />
      <ShopifySign reducedMotion={reducedMotion} />
      <StreetDetails />
    </group>
  );
}
