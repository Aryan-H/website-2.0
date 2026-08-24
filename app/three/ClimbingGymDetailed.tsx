"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

const COLORS = {
  brick: "#563b34",
  brickDark: "#302725",
  brickLight: "#795247",
  mortar: "#332d2b",
  concrete: "#74787a",
  concreteDark: "#42484b",
  steel: "#18232a",
  steelEdge: "#36464e",
  glass: "#163c50",
  glassWarm: "#8c6039",
  roof: "#263036",
  warm: "#ffc477",
};

function pseudoRandom(seed: number, index: number, channel: number) {
  const value = Math.sin(seed * 17.173 + index * 53.731 + channel * 91.913) * 43758.5453;
  return value - Math.floor(value);
}

function Beam({
  start,
  end,
  radius = 0.018,
  color = COLORS.steelEdge,
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
    <mesh
      castShadow
      position={midpoint}
      quaternion={quaternion}
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial
        color={color}
        metalness={0.82}
        roughness={0.3}
      />
    </mesh>
  );
}

function BrickPanel({
  position,
  width,
  height,
  facing = "front",
}: {
  position: Vec3;
  width: number;
  height: number;
  facing?: "front" | "side";
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const bricks = useMemo(() => {
    const course = 0.125;
    const brickWidth = 0.215;
    const moduleWidth = 0.255;
    const rows = Math.max(1, Math.floor((height - 0.055) / course));
    const values: Array<{ along: number; y: number; shade: number }> = [];

    for (let row = 0; row < rows; row += 1) {
      const offset = row % 2 === 0 ? 0 : moduleWidth * 0.5;
      for (
        let along = -width * 0.5 + brickWidth * 0.5 - offset;
        along < width * 0.5;
        along += moduleWidth
      ) {
        if (along - brickWidth * 0.5 < -width * 0.5 + 0.025) continue;
        if (along + brickWidth * 0.5 > width * 0.5 - 0.025) continue;
        values.push({
          along,
          y: -height * 0.5 + 0.075 + row * course,
          shade: (row * 7 + values.length * 3) % 11,
        });
      }
    }

    return values;
  }, [height, width]);

  useLayoutEffect(() => {
    if (!mesh.current) return;

    const transform = new THREE.Object3D();
    const baseColor = new THREE.Color(COLORS.brick);
    const darkColor = new THREE.Color(COLORS.brickDark);
    const lightColor = new THREE.Color(COLORS.brickLight);

    bricks.forEach((brick, index) => {
      transform.position.set(
        facing === "front" ? brick.along : 0.071,
        brick.y,
        facing === "front" ? 0.071 : brick.along,
      );
      transform.scale.set(
        facing === "front" ? 0.215 : 0.034,
        0.078,
        facing === "front" ? 0.034 : 0.215,
      );
      transform.updateMatrix();
      mesh.current?.setMatrixAt(index, transform.matrix);
      mesh.current?.setColorAt(
        index,
        brick.shade === 0
          ? lightColor
          : brick.shade < 3
            ? darkColor
            : baseColor,
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [bricks, facing]);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={
            facing === "front"
              ? [width, height, 0.11]
              : [0.11, height, width]
          }
        />
        <meshStandardMaterial
          color={COLORS.mortar}
          metalness={0.04}
          roughness={0.98}
        />
      </mesh>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, bricks.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          metalness={0.03}
          roughness={0.92}
          vertexColors
        />
      </instancedMesh>
    </group>
  );
}

function SteelColumn({ position, height = 2.55 }: { position: Vec3; height?: number }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.045, height, 0.17]} />
        <meshStandardMaterial color={COLORS.steel} metalness={0.88} roughness={0.28} />
      </mesh>
      {[-0.085, 0.085].map((x) => (
        <mesh key={x} castShadow position={[x, 0, 0]} receiveShadow>
          <boxGeometry args={[0.05, height, 0.21]} />
          <meshStandardMaterial
            color={COLORS.steelEdge}
            metalness={0.9}
            roughness={0.24}
          />
        </mesh>
      ))}
      <mesh castShadow position={[0, -height * 0.5 + 0.025, 0.02]}>
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial color="#556168" metalness={0.68} roughness={0.42} />
      </mesh>
    </group>
  );
}

function GlazedBay({
  position,
  width,
  height,
  columns,
  rows,
  facing = "front",
}: {
  position: Vec3;
  width: number;
  height: number;
  columns: number;
  rows: number;
  facing?: "front" | "side";
}) {
  const verticals = Array.from({ length: columns + 1 }, (_, index) =>
    THREE.MathUtils.lerp(-width * 0.5, width * 0.5, index / columns),
  );
  const horizontals = Array.from({ length: rows + 1 }, (_, index) =>
    THREE.MathUtils.lerp(-height * 0.5, height * 0.5, index / rows),
  );

  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry
          args={facing === "front" ? [width, height, 0.038] : [0.038, height, width]}
        />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.08}
          color={COLORS.glass}
          depthWrite={false}
          emissive="#0b2330"
          emissiveIntensity={0.48}
          metalness={0.28}
          opacity={0.42}
          roughness={0.12}
          transparent
        />
      </mesh>
      {verticals.map((along) => (
        <mesh
          key={`v-${along}`}
          castShadow
          position={facing === "front" ? [along, 0, 0.035] : [0.035, 0, along]}
        >
          <boxGeometry
            args={facing === "front" ? [0.035, height + 0.08, 0.045] : [0.045, height + 0.08, 0.035]}
          />
          <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
      {horizontals.map((y) => (
        <mesh
          key={`h-${y}`}
          castShadow
          position={facing === "front" ? [0, y, 0.035] : [0.035, y, 0]}
        >
          <boxGeometry
            args={facing === "front" ? [width + 0.08, 0.035, 0.045] : [0.045, 0.035, width + 0.08]}
          />
          <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function HoldField({ position, width, height, count, seed }: {
  position: Vec3;
  width: number;
  height: number;
  count: number;
  seed: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const holds = useMemo(() =>
    Array.from({ length: count }, (_, index) => ({
      x: (pseudoRandom(seed, index, 0) - 0.5) * width,
      y: (pseudoRandom(seed, index, 1) - 0.5) * height,
      scale: 0.035 + pseudoRandom(seed, index, 2) * 0.045,
      rotation: pseudoRandom(seed, index, 3) * Math.PI,
      color: index % 5,
    })), [count, height, seed, width]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new THREE.Object3D();
    const palette = ["#ff7c5c", "#ffbe4f", "#4dc8e8", "#9bd56e", "#c798ff"].map(
      (color) => new THREE.Color(color),
    );

    holds.forEach((hold, index) => {
      transform.position.set(hold.x, hold.y, 0);
      transform.rotation.set(hold.rotation * 0.3, hold.rotation, hold.rotation * 0.6);
      transform.scale.set(hold.scale * 1.2, hold.scale * 0.65, hold.scale * 0.72);
      transform.updateMatrix();
      mesh.current?.setMatrixAt(index, transform.matrix);
      mesh.current?.setColorAt(index, palette[hold.color]);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [holds]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, holds.length]}
      castShadow
      position={position}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial metalness={0.08} roughness={0.48} vertexColors />
    </instancedMesh>
  );
}

function ClimbingFacet({
  position,
  rotation = [0, 0, 0],
  points,
  color,
}: {
  position: Vec3;
  rotation?: Vec3;
  points: Array<[number, number]>;
  color: string;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: 0.08,
      steps: 1,
    });
  }, [points]);

  return (
    <mesh
      castShadow
      geometry={geometry}
      position={position}
      receiveShadow
      rotation={rotation}
    >
      <meshStandardMaterial color={color} metalness={0.03} roughness={0.88} />
    </mesh>
  );
}

function ClimbingInterior() {
  return (
    <group>
      <mesh position={[-0.35, 1.52, 1.17]} receiveShadow>
        <boxGeometry args={[3.25, 2.55, 0.1]} />
        <meshStandardMaterial color="#272a2b" roughness={0.96} />
      </mesh>
      <ClimbingFacet
        color="#c4b092"
        points={[
          [-0.74, -1.08],
          [0.45, -1.08],
          [0.63, 0.34],
          [0.28, 1.08],
          [-0.65, 0.84],
        ]}
        position={[-1.05, 1.53, 1.25]}
        rotation={[0.02, -0.06, -0.025]}
      />
      <ClimbingFacet
        color="#69787c"
        points={[
          [-0.62, -1.1],
          [0.67, -1.1],
          [0.58, 0.92],
          [0.02, 1.2],
          [-0.7, 0.58],
        ]}
        position={[0.27, 1.5, 1.29]}
        rotation={[-0.01, 0.07, 0.018]}
      />
      <ClimbingFacet
        color="#8d5e4b"
        points={[
          [-0.48, -0.98],
          [0.47, -0.98],
          [0.62, 0.52],
          [0.1, 1.02],
          [-0.5, 0.7],
        ]}
        position={[1.12, 1.43, 0.77]}
        rotation={[0, 0.45, -0.02]}
      />
      <HoldField count={26} height={1.85} position={[-1.05, 1.52, 1.37]} seed={17} width={1.05} />
      <HoldField count={28} height={1.9} position={[0.25, 1.5, 1.41]} seed={43} width={1.08} />
      <HoldField count={18} height={1.55} position={[1.19, 1.4, 0.96]} seed={91} width={0.7} />

      {[-1.73, -0.58, 0.6, 1.66].map((x) => (
        <SteelColumn key={x} height={2.55} position={[x, 1.43, 0.78]} />
      ))}
      <Beam start={[-1.83, 2.72, 0.83]} end={[1.76, 2.72, 0.83]} radius={0.035} />
      {[-1.7, -0.55, 0.6].map((x) => (
        <group key={x}>
          <Beam start={[x, 2.7, 0.83]} end={[x + 0.57, 2.26, 0.83]} />
          <Beam start={[x + 0.57, 2.26, 0.83]} end={[x + 1.12, 2.7, 0.83]} />
        </group>
      ))}
      {[-1.35, -0.35, 0.65].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.71, 1.02]}>
            <boxGeometry args={[0.62, 0.026, 0.08]} />
            <meshBasicMaterial color={COLORS.warm} toneMapped={false} />
          </mesh>
          <pointLight
            color="#ffc987"
            decay={2}
            distance={2.5}
            intensity={0.42}
            position={[x, 2.58, 1.02]}
          />
        </group>
      ))}
      <mesh position={[-0.2, 0.34, 0.98]} receiveShadow>
        <boxGeometry args={[3.55, 0.13, 0.72]} />
        <meshStandardMaterial color="#292e30" roughness={0.98} />
      </mesh>
      {[-1.42, -0.72, 0.07, 0.78].map((x) => (
        <mesh key={x} castShadow position={[x, 0.43, 1.23]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.055, 0.07, 0.3, 10]} />
          <meshStandardMaterial color="#b7aa93" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function SawtoothRoof() {
  const bayCount = 5;
  const low = 3.04;
  const high = 3.56;
  const step = 0.645;
  const angle = Math.atan2(high - low, step);
  const panelLength = Math.hypot(step, high - low);

  return (
    <group>
      {Array.from({ length: bayCount }, (_, index) => {
        const zLow = -1.61 + index * step;
        const zHigh = zLow + step;
        return (
          <group key={index}>
            <mesh
              castShadow
              position={[0, (low + high) * 0.5, (zLow + zHigh) * 0.5]}
              receiveShadow
              rotation={[-angle, 0, 0]}
            >
              <boxGeometry args={[5.38, 0.065, panelLength]} />
              <meshStandardMaterial color={COLORS.roof} metalness={0.58} roughness={0.56} />
            </mesh>
            <mesh position={[0, (low + high) * 0.5, zHigh + 0.012]}>
              <boxGeometry args={[5.27, high - low - 0.035, 0.035]} />
              <meshPhysicalMaterial
                clearcoat={0.82}
                color="#28566b"
                depthWrite={false}
                emissive="#112e3e"
                emissiveIntensity={0.45}
                metalness={0.25}
                opacity={0.62}
                roughness={0.18}
                transparent
              />
            </mesh>
            {[-2.62, -1.3, 0, 1.3, 2.62].map((x) => (
              <mesh key={x} castShadow position={[x, (low + high) * 0.5, zHigh + 0.035]}>
                <boxGeometry args={[0.035, high - low + 0.03, 0.04]} />
                <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.24} />
              </mesh>
            ))}
            <mesh castShadow position={[0, high + 0.01, zHigh + 0.025]}>
              <boxGeometry args={[5.44, 0.055, 0.08]} />
              <meshStandardMaterial color={COLORS.steelEdge} metalness={0.82} roughness={0.34} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function RooftopEquipment() {
  return (
    <group>
      <mesh castShadow position={[1.62, 3.72, -0.96]} receiveShadow>
        <boxGeometry args={[1.02, 0.08, 0.76]} />
        <meshStandardMaterial color="#515b60" metalness={0.68} roughness={0.48} />
      </mesh>
      <mesh castShadow position={[1.62, 3.93, -0.96]} receiveShadow>
        <boxGeometry args={[0.88, 0.36, 0.62]} />
        <meshStandardMaterial color="#667076" metalness={0.72} roughness={0.45} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[1.18, 3.92, -1.2 + index * 0.08]}>
          <boxGeometry args={[0.018, 0.25, 0.038]} />
          <meshStandardMaterial color="#202a2f" metalness={0.86} roughness={0.28} />
        </mesh>
      ))}
      <mesh castShadow position={[0.72, 3.75, -0.94]} receiveShadow>
        <boxGeometry args={[0.72, 0.22, 0.34]} />
        <meshStandardMaterial color="#737b7e" metalness={0.72} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0.22, 3.63, -0.94]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.85, 16]} />
        <meshStandardMaterial color="#7e8587" metalness={0.76} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[-1.74, 3.78, -1.08]}>
        <cylinderGeometry args={[0.16, 0.2, 0.42, 16]} />
        <meshStandardMaterial color="#626c70" metalness={0.8} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[-1.74, 4.02, -1.08]}>
        <cylinderGeometry args={[0.24, 0.13, 0.09, 16]} />
        <meshStandardMaterial color="#788286" metalness={0.82} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[-2.18, 3.68, 0.15]}>
        <cylinderGeometry args={[0.09, 0.11, 0.48, 14]} />
        <meshStandardMaterial color="#778084" metalness={0.84} roughness={0.36} />
      </mesh>
      <mesh castShadow position={[-2.18, 3.95, 0.15]}>
        <cylinderGeometry args={[0.15, 0.07, 0.08, 14]} />
        <meshStandardMaterial color="#8b9294" metalness={0.84} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Entrance() {
  return (
    <group>
      <mesh castShadow position={[2.02, 1.33, 1.685]} receiveShadow>
        <boxGeometry args={[1.04, 2.18, 0.07]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.08}
          color="#17384a"
          depthWrite={false}
          emissive="#593d29"
          emissiveIntensity={0.38}
          metalness={0.3}
          opacity={0.52}
          roughness={0.12}
          transparent
        />
      </mesh>
      {[-0.52, 0, 0.52].map((x) => (
        <mesh key={x} castShadow position={[2.02 + x, 1.33, 1.735]}>
          <boxGeometry args={[0.035, 2.24, 0.04]} />
          <meshStandardMaterial color={COLORS.steel} metalness={0.92} roughness={0.22} />
        </mesh>
      ))}
      <mesh castShadow position={[2.02, 2.45, 1.75]}>
        <boxGeometry args={[1.28, 0.05, 0.06]} />
        <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.24} />
      </mesh>
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[2.02 + x, 1.28, 1.79]}>
          <boxGeometry args={[0.022, 0.42, 0.025]} />
          <meshStandardMaterial color="#aeb9bc" metalness={0.94} roughness={0.18} />
        </mesh>
      ))}
      <mesh castShadow position={[2.02, 2.5, 1.99]} receiveShadow>
        <boxGeometry args={[1.55, 0.12, 0.58]} />
        <meshStandardMaterial color="#202b31" metalness={0.82} roughness={0.34} />
      </mesh>
      {[-0.58, 0.58].map((x) => (
        <Beam
          key={x}
          end={[2.02 + x, 2.42, 1.7]}
          radius={0.018}
          start={[2.02 + x, 2.36, 2.25]}
        />
      ))}
      <mesh castShadow position={[2.02, 0.19, 1.88]} receiveShadow>
        <boxGeometry args={[1.48, 0.16, 0.42]} />
        <meshStandardMaterial color="#6f7374" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[2.02, 0.075, 2.1]} receiveShadow>
        <boxGeometry args={[1.72, 0.1, 0.38]} />
        <meshStandardMaterial color="#656a6c" roughness={0.9} />
      </mesh>
      {[-0.46, 0.46].map((x) => (
        <group key={x} position={[2.02 + x, 2.34, 1.82]}>
          <mesh>
            <boxGeometry args={[0.13, 0.2, 0.08]} />
            <meshStandardMaterial color="#222d31" metalness={0.84} roughness={0.34} />
          </mesh>
          <mesh position={[0, -0.02, 0.055]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshBasicMaterial color={COLORS.warm} toneMapped={false} />
          </mesh>
          <pointLight color="#ffd29b" decay={2} distance={1.35} intensity={0.35} position={[0, -0.06, 0.11]} />
        </group>
      ))}
    </group>
  );
}

function Bicycle({ position, color, rotation = 0 }: { position: Vec3; color: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.29, 0.29].map((x) => (
        <group key={x} position={[x, 0.27, 0]}>
          <mesh castShadow rotation={[0, 0, 0]}>
            <torusGeometry args={[0.25, 0.018, 8, 24]} />
            <meshStandardMaterial color="#101518" metalness={0.62} roughness={0.48} />
          </mesh>
          {Array.from({ length: 6 }, (_, index) => {
            const angle = (index / 6) * Math.PI;
            return (
              <Beam
                key={index}
                color="#788286"
                end={[Math.cos(angle) * 0.235, Math.sin(angle) * 0.235, 0]}
                radius={0.004}
                start={[-Math.cos(angle) * 0.235, -Math.sin(angle) * 0.235, 0]}
              />
            );
          })}
        </group>
      ))}
      <Beam color={color} end={[0, 0.55, 0]} radius={0.018} start={[-0.29, 0.27, 0]} />
      <Beam color={color} end={[0.29, 0.27, 0]} radius={0.018} start={[0, 0.55, 0]} />
      <Beam color={color} end={[-0.29, 0.27, 0]} radius={0.018} start={[0.1, 0.27, 0]} />
      <Beam color={color} end={[0, 0.55, 0]} radius={0.018} start={[0.1, 0.27, 0]} />
      <Beam color={color} end={[0.22, 0.69, 0]} radius={0.015} start={[0.29, 0.27, 0]} />
      <Beam color="#aab2b4" end={[0.34, 0.69, 0]} radius={0.012} start={[0.12, 0.69, 0]} />
      <mesh castShadow position={[-0.02, 0.59, 0]}>
        <boxGeometry args={[0.19, 0.035, 0.08]} />
        <meshStandardMaterial color="#15191b" metalness={0.32} roughness={0.62} />
      </mesh>
    </group>
  );
}

function BikeRack() {
  return (
    <group position={[-1.78, 0, 2.03]}>
      {[-0.62, 0, 0.62].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Beam color="#747e82" end={[-0.16, 0.52, 0]} radius={0.025} start={[-0.16, 0.04, 0]} />
          <Beam color="#747e82" end={[0.16, 0.52, 0]} radius={0.025} start={[0.16, 0.04, 0]} />
          <Beam color="#747e82" end={[0.16, 0.52, 0]} radius={0.025} start={[-0.16, 0.52, 0]} />
        </group>
      ))}
      <Bicycle color="#d3674f" position={[-0.34, 0.02, 0.02]} rotation={0.04} />
      <Bicycle color="#3a829f" position={[0.42, 0.02, -0.03]} rotation={-0.06} />
    </group>
  );
}

function StreetTree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const foliage = [
    [-0.18, 1.42, 0.03, 0.38],
    [0.14, 1.55, 0.02, 0.42],
    [0, 1.82, -0.04, 0.45],
    [-0.29, 1.78, -0.05, 0.32],
    [0.28, 1.86, 0.04, 0.34],
    [-0.05, 2.12, 0, 0.32],
  ] as const;

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[0.72, 0.36, 0.72]} />
        <meshStandardMaterial color="#3e4748" metalness={0.24} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshStandardMaterial color="#252827" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.075, 0.12, 1.45, 10]} />
        <meshStandardMaterial color="#51433a" roughness={0.98} />
      </mesh>
      <Beam color="#51433a" end={[-0.28, 1.65, 0]} radius={0.04} start={[0, 1.25, 0]} />
      <Beam color="#51433a" end={[0.27, 1.72, 0.02]} radius={0.04} start={[0, 1.32, 0]} />
      {foliage.map(([x, y, z, size], index) => (
        <mesh
          key={index}
          castShadow
          position={[x, y, z]}
          rotation={[index * 0.37, index * 0.71, index * 0.23]}
        >
          <icosahedronGeometry args={[size, 2]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? "#28413b" : index % 3 === 1 ? "#345149" : "#203932"}
            roughness={0.96}
          />
        </mesh>
      ))}
    </group>
  );
}

function StreetDetails() {
  return (
    <group>
      <BikeRack />
      <StreetTree position={[-2.72, 0, 1.97]} scale={0.82} />
      <group position={[2.72, 0, 0.86]}>
        <mesh castShadow position={[0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[0.38, 0.36, 1.12]} />
          <meshStandardMaterial color="#424a4b" metalness={0.18} roughness={0.8} />
        </mesh>
        {[-0.34, -0.1, 0.14, 0.38].map((z) => (
          <group key={z} position={[0, 0.38, z]}>
            {[-0.08, 0, 0.08].map((x) => (
              <mesh key={x} castShadow position={[x, 0.23, 0]} rotation={[0.08 + x, 0, x * 2]}>
                <cylinderGeometry args={[0.012, 0.018, 0.5, 6]} />
                <meshStandardMaterial color="#5c7a62" roughness={0.94} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {[1.48, 2.58].map((x) => (
        <group key={x} position={[x, 0, 2.18]}>
          <mesh castShadow position={[0, 0.34, 0]} receiveShadow>
            <cylinderGeometry args={[0.075, 0.095, 0.68, 12]} />
            <meshStandardMaterial color="#263238" metalness={0.78} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.09, 0.075, 0.06, 12]} />
            <meshStandardMaterial color="#45535a" metalness={0.8} roughness={0.32} />
          </mesh>
        </group>
      ))}
      <group position={[-2.69, 1.45, 1.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.035, 2.72, 10]} />
          <meshStandardMaterial color="#313c40" metalness={0.8} roughness={0.38} />
        </mesh>
        {[0.8, 0, -0.8].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.009, 6, 12]} />
            <meshStandardMaterial color="#526066" metalness={0.84} roughness={0.32} />
          </mesh>
        ))}
      </group>
      <group position={[2.69, 1.4, -0.55]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.028, 0.028, 2.5, 8]} />
          <meshStandardMaterial color="#677277" metalness={0.84} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.55, 8]} />
          <meshStandardMaterial color="#677277" metalness={0.84} roughness={0.32} />
        </mesh>
      </group>
    </group>
  );
}

function WarehouseShell() {
  return (
    <group>
      <mesh castShadow position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[5.72, 0.16, 3.66]} />
        <meshStandardMaterial color={COLORS.concreteDark} metalness={0.08} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.35, 3.4]} />
        <meshStandardMaterial color={COLORS.concrete} metalness={0.08} roughness={0.86} />
      </mesh>

      <BrickPanel height={2.58} position={[-2.48, 1.69, 1.66]} width={0.48} />
      <BrickPanel height={2.58} position={[1.43, 1.69, 1.66]} width={0.24} />
      <BrickPanel height={2.58} position={[2.6, 1.69, 1.66]} width={0.22} />
      <BrickPanel height={0.48} position={[0.06, 2.86, 1.66]} width={4.55} />
      <BrickPanel height={2.62} position={[-2.69, 1.7, 0]} facing="side" width={3.32} />
      <BrickPanel height={0.7} position={[2.69, 2.67, 0]} facing="side" width={3.32} />
      <BrickPanel height={2.62} position={[0, 1.7, -1.66]} width={5.38} />

      {[-2.69, -1.36, 0, 1.36, 2.69].map((x) => (
        <mesh key={x} castShadow position={[x, 1.72, 1.74]} receiveShadow>
          <boxGeometry args={[0.13, 2.78, 0.18]} />
          <meshStandardMaterial color="#68473d" roughness={0.9} />
        </mesh>
      ))}
      {[-1.58, -0.55, 0.52, 1.58].map((z) => (
        <mesh key={z} castShadow position={[2.76, 1.68, z]} receiveShadow>
          <boxGeometry args={[0.18, 2.66, 0.13]} />
          <meshStandardMaterial color="#62433a" roughness={0.92} />
        </mesh>
      ))}
      {[0.47, 2.99, 3.12].map((y, index) => (
        <mesh key={y} castShadow position={[0, y, 1.78 + index * 0.018]} receiveShadow>
          <boxGeometry args={[5.62 + index * 0.08, index === 0 ? 0.18 : 0.1, 0.18]} />
          <meshStandardMaterial
            color={index === 0 ? "#6b6963" : index === 1 ? "#443633" : "#6f5046"}
            metalness={index === 0 ? 0.12 : 0.04}
            roughness={index === 0 ? 0.78 : 0.9}
          />
        </mesh>
      ))}
      <mesh castShadow position={[2.78, 2.98, 0]} receiveShadow>
        <boxGeometry args={[0.18, 0.12, 3.5]} />
        <meshStandardMaterial color="#6f5046" roughness={0.9} />
      </mesh>

      <ClimbingInterior />
      <GlazedBay columns={5} height={2.26} position={[-0.43, 1.63, 1.705]} rows={3} width={3.48} />
      <GlazedBay columns={3} facing="side" height={1.82} position={[2.715, 1.66, 0.55]} rows={2} width={1.82} />
      <GlazedBay columns={2} facing="side" height={1.82} position={[2.715, 1.66, -1.02]} rows={2} width={0.92} />
      <Entrance />
      <SawtoothRoof />
      <RooftopEquipment />
    </group>
  );
}

export default function ClimbingGymDetailed({
  includeStreetDetails = true,
}: {
  includeStreetDetails?: boolean;
}) {
  return (
    <group>
      <WarehouseShell />
      {includeStreetDetails ? <StreetDetails /> : null}
    </group>
  );
}
