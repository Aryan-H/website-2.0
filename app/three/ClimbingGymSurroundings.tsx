"use client";

import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

type Point3 = readonly [number, number, number];

const materials = {
  asphalt: new THREE.MeshStandardMaterial({
    color: "#171c20",
    metalness: 0.08,
    roughness: 0.96,
  }),
  asphaltPatch: new THREE.MeshStandardMaterial({
    color: "#20272b",
    metalness: 0.12,
    roughness: 0.88,
  }),
  concrete: new THREE.MeshStandardMaterial({
    color: "#7d7f7d",
    metalness: 0.05,
    roughness: 0.9,
  }),
  concreteDark: new THREE.MeshStandardMaterial({
    color: "#555b5c",
    metalness: 0.08,
    roughness: 0.86,
  }),
  steel: new THREE.MeshStandardMaterial({
    color: "#455058",
    metalness: 0.82,
    roughness: 0.34,
  }),
  blackSteel: new THREE.MeshStandardMaterial({
    color: "#151b1f",
    metalness: 0.7,
    roughness: 0.42,
  }),
  galvanized: new THREE.MeshStandardMaterial({
    color: "#87939a",
    metalness: 0.74,
    roughness: 0.4,
  }),
  dumpster: new THREE.MeshStandardMaterial({
    color: "#254c3d",
    metalness: 0.38,
    roughness: 0.7,
  }),
  dumpsterDark: new THREE.MeshStandardMaterial({
    color: "#152b25",
    metalness: 0.5,
    roughness: 0.58,
  }),
  soil: new THREE.MeshStandardMaterial({
    color: "#17130f",
    metalness: 0,
    roughness: 1,
  }),
  bark: new THREE.MeshStandardMaterial({
    color: "#3e2d24",
    metalness: 0,
    roughness: 1,
  }),
  foliage: new THREE.MeshStandardMaterial({
    color: "#173827",
    metalness: 0,
    roughness: 0.92,
  }),
  foliageLight: new THREE.MeshStandardMaterial({
    color: "#28543a",
    metalness: 0,
    roughness: 0.88,
  }),
  amberGlass: new THREE.MeshStandardMaterial({
    color: "#ffd09b",
    emissive: "#ff9f43",
    emissiveIntensity: 3.2,
    metalness: 0.08,
    roughness: 0.18,
    toneMapped: false,
  }),
  reflector: new THREE.MeshStandardMaterial({
    color: "#d9e6e9",
    emissive: "#8fdcff",
    emissiveIntensity: 0.9,
    metalness: 0.18,
    roughness: 0.32,
  }),
  yellow: new THREE.MeshStandardMaterial({
    color: "#d6a83a",
    metalness: 0.18,
    roughness: 0.58,
  }),
  red: new THREE.MeshStandardMaterial({
    color: "#7d2723",
    metalness: 0.26,
    roughness: 0.6,
  }),
  bikeBlue: new THREE.MeshStandardMaterial({
    color: "#2d6f98",
    metalness: 0.58,
    roughness: 0.36,
  }),
  bikeOchre: new THREE.MeshStandardMaterial({
    color: "#b46e2f",
    metalness: 0.52,
    roughness: 0.4,
  }),
};

function Beam({
  start,
  end,
  radius = 0.018,
  material = materials.steel,
}: {
  start: Point3;
  end: Point3;
  radius?: number;
  material?: THREE.Material;
}) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const midpoint = from.clone().lerp(to, 0.5);
  const length = from.distanceTo(to);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    to.clone().sub(from).normalize(),
  );

  return (
    <mesh
      castShadow
      material={material}
      position={midpoint}
      quaternion={quaternion}
    >
      <cylinderGeometry args={[radius, radius, length, 8]} />
    </mesh>
  );
}

function Bike({
  position,
  rotation = 0,
  frameMaterial,
}: {
  position: Point3;
  rotation?: number;
  frameMaterial: THREE.Material;
}) {
  return (
    <group position={position} rotation-y={rotation}>
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} material={materials.blackSteel} position={[x, 0.225, 0]} castShadow>
          <torusGeometry args={[0.19, 0.014, 8, 24]} />
        </mesh>
      ))}
      <Beam start={[-0.24, 0.225, 0]} end={[0.02, 0.47, 0]} material={frameMaterial} />
      <Beam start={[0.02, 0.47, 0]} end={[0.24, 0.225, 0]} material={frameMaterial} />
      <Beam start={[-0.24, 0.225, 0]} end={[0.14, 0.225, 0]} material={frameMaterial} />
      <Beam start={[0.14, 0.225, 0]} end={[0.02, 0.47, 0]} material={frameMaterial} />
      <Beam start={[0.14, 0.225, 0]} end={[0.2, 0.51, 0]} material={frameMaterial} />
      <Beam start={[0.17, 0.51, -0.06]} end={[0.24, 0.51, 0.06]} material={materials.blackSteel} />
      <mesh position={[-0.005, 0.495, 0]} material={materials.blackSteel} castShadow>
        <boxGeometry args={[0.13, 0.025, 0.07]} />
      </mesh>
      <mesh position={[0.02, 0.225, 0]} rotation-x={Math.PI / 2} material={materials.steel}>
        <cylinderGeometry args={[0.035, 0.035, 0.045, 12]} />
      </mesh>
    </group>
  );
}

function BikeRack() {
  return (
    <group position={[-2.18, 0, 2.02]} rotation-y={-0.08}>
      {[-0.5, 0, 0.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Beam start={[-0.18, 0.02, 0]} end={[-0.18, 0.43, 0]} radius={0.022} material={materials.galvanized} />
          <Beam start={[0.18, 0.02, 0]} end={[0.18, 0.43, 0]} radius={0.022} material={materials.galvanized} />
          <Beam start={[-0.18, 0.43, 0]} end={[0.18, 0.43, 0]} radius={0.022} material={materials.galvanized} />
        </group>
      ))}
      <Bike position={[-0.5, 0.01, -0.05]} rotation={0.02} frameMaterial={materials.bikeBlue} />
      <Bike position={[0.47, 0.01, 0.08]} rotation={-0.04} frameMaterial={materials.bikeOchre} />
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Point3; scale?: number }) {
  const crown = [
    [-0.12, 1.28, 0.02, 0.38],
    [0.2, 1.34, 0.02, 0.34],
    [0.03, 1.58, -0.05, 0.4],
    [-0.28, 1.54, 0.03, 0.3],
    [0.3, 1.62, -0.03, 0.3],
    [0.04, 1.87, 0, 0.28],
  ] as const;

  return (
    <group position={position} scale={scale}>
      <mesh material={materials.bark} position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.105, 1.42, 9]} />
      </mesh>
      <Beam start={[0, 0.82, 0]} end={[-0.2, 1.27, 0.03]} radius={0.035} material={materials.bark} />
      <Beam start={[0.02, 0.92, 0]} end={[0.24, 1.35, -0.04]} radius={0.032} material={materials.bark} />
      {crown.map(([x, y, z, radius], index) => (
        <mesh
          key={index}
          castShadow
          material={index % 2 === 0 ? materials.foliage : materials.foliageLight}
          position={[x, y, z]}
          rotation={[index * 0.31, index * 0.47, 0]}
          scale={[1, 0.82, 0.92]}
        >
          <dodecahedronGeometry args={[radius, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Planter({ position, rotation = 0 }: { position: Point3; rotation?: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh material={materials.concreteDark} position={[0, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, 0.34, 0.55]} />
      </mesh>
      <mesh material={materials.concrete} position={[0, 0.34, 0]}>
        <boxGeometry args={[0.82, 0.055, 0.61]} />
      </mesh>
      <mesh material={materials.soil} position={[0, 0.372, 0]}>
        <boxGeometry args={[0.66, 0.025, 0.45]} />
      </mesh>
      <Tree position={[0, 0.37, 0]} scale={0.68} />
    </group>
  );
}

function Bollard({ position, lit = false }: { position: Point3; lit?: boolean }) {
  return (
    <group position={position}>
      <mesh material={materials.blackSteel} position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.068, 0.56, 12]} />
      </mesh>
      <mesh material={materials.reflector} position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.057, 0.057, 0.055, 12]} />
      </mesh>
      <mesh material={lit ? materials.amberGlass : materials.blackSteel} position={[0, 0.575, 0]}>
        <cylinderGeometry args={[0.067, 0.055, 0.075, 12]} />
      </mesh>
      {lit ? <pointLight color="#ffb86a" intensity={0.42} distance={2.2} decay={2.2} position={[0, 0.62, 0]} /> : null}
    </group>
  );
}

function Dumpster() {
  return (
    <group position={[-2.35, 0.02, -2.22]} rotation-y={0.035}>
      <mesh material={materials.dumpster} position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[1.22, 0.68, 0.46]} />
      </mesh>
      {[-0.46, -0.23, 0, 0.23, 0.46].map((x) => (
        <mesh key={x} material={materials.dumpsterDark} position={[x, 0.35, 0.238]}>
          <boxGeometry args={[0.035, 0.55, 0.025]} />
        </mesh>
      ))}
      {[-0.31, 0.31].map((x) => (
        <mesh
          key={x}
          material={materials.dumpsterDark}
          position={[x, 0.735, -0.015]}
          rotation-x={-0.1}
          castShadow
        >
          <boxGeometry args={[0.57, 0.055, 0.54]} />
        </mesh>
      ))}
      {[-0.48, 0.48].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`${x}-${z}`} material={materials.blackSteel} position={[x, 0.055, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.065, 0.065, 0.07, 10]} />
          </mesh>
        )),
      )}
      <Beam start={[-0.18, 0.37, 0.26]} end={[0.18, 0.37, 0.26]} radius={0.018} material={materials.galvanized} />
    </group>
  );
}

function Transformer() {
  return (
    <group position={[2.62, 0.015, -2.19]}>
      <mesh material={materials.galvanized} position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.82, 0.92, 0.48]} />
      </mesh>
      <mesh material={materials.steel} position={[0, 0.48, 0.247]}>
        <boxGeometry args={[0.012, 0.79, 0.02]} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => -0.25 + index * 0.071).map((y) => (
        <mesh key={y} material={materials.steel} position={[-0.22, 0.58 + y, 0.258]}>
          <boxGeometry args={[0.28, 0.018, 0.018]} />
        </mesh>
      ))}
      <mesh material={materials.yellow} position={[0.2, 0.42, 0.262]} rotation-z={Math.PI / 4}>
        <boxGeometry args={[0.12, 0.12, 0.014]} />
      </mesh>
      <Beam start={[0.29, 0.95, -0.08]} end={[0.29, 1.3, -0.08]} radius={0.022} material={materials.galvanized} />
      <Beam start={[0.29, 1.3, -0.08]} end={[0.48, 1.3, -0.08]} radius={0.022} material={materials.galvanized} />
    </group>
  );
}

function UtilityCluster() {
  return (
    <group position={[0.65, 0, -2.2]}>
      {[-0.32, 0, 0.34].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={materials.concreteDark} position={[0, 0.055, 0]} receiveShadow>
            <cylinderGeometry args={[0.19, 0.21, 0.11, 16]} />
          </mesh>
          <mesh material={materials.galvanized} position={[0, 0.22 + index * 0.035, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.14, 0.34 + index * 0.07, 14]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.4 + index * 0.07, 0]}>
            <cylinderGeometry args={[0.145, 0.11, 0.045, 14]} />
          </mesh>
        </group>
      ))}
      <Beam start={[-0.48, 0.07, 0.18]} end={[0.52, 0.07, 0.18]} radius={0.035} material={materials.steel} />
      <Beam start={[-0.48, 0.07, 0.18]} end={[-0.48, 0.42, 0.18]} radius={0.035} material={materials.steel} />
    </group>
  );
}

function FireHydrant() {
  return (
    <group position={[-3.22, 0, 2.06]}>
      <mesh material={materials.red} position={[0, 0.23, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.1, 0.43, 12]} />
      </mesh>
      <mesh material={materials.red} position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.11, 12, 8]} />
      </mesh>
      <mesh material={materials.galvanized} position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.045, 0.07, 0.035, 10]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.115, 0.3, 0]} rotation-z={Math.PI / 2}>
          <mesh material={materials.red}>
            <cylinderGeometry args={[0.068, 0.068, 0.13, 10]} />
          </mesh>
          <mesh material={materials.galvanized} position={[0, side * 0.072, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.018, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GroundPlane() {
  const seamXs = [-2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8];
  const tactileDots = [-0.18, 0, 0.18].flatMap((x) =>
    [1.94, 2.08, 2.22].map((z) => [x + 0.34, z] as const),
  );

  return (
    <group>
      <mesh material={materials.asphalt} position={[0, -0.025, 0]} receiveShadow>
        <boxGeometry args={[7, 0.05, 5]} />
      </mesh>

      <mesh material={materials.concrete} position={[0, 0.028, 2]} receiveShadow>
        <boxGeometry args={[7, 0.075, 0.52]} />
      </mesh>
      {seamXs.map((x) => (
        <mesh key={x} material={materials.concreteDark} position={[x, 0.07, 2]}>
          <boxGeometry args={[0.012, 0.008, 0.5]} />
        </mesh>
      ))}
      <mesh material={materials.concreteDark} position={[0, 0.07, 1.87]}>
        <boxGeometry args={[6.96, 0.009, 0.012]} />
      </mesh>

      <mesh material={materials.concrete} position={[-1.6, 0.105, 2.29]} receiveShadow>
        <boxGeometry args={[3.8, 0.18, 0.16]} />
      </mesh>
      <mesh material={materials.concrete} position={[2.15, 0.105, 2.29]} receiveShadow>
        <boxGeometry args={[2.7, 0.18, 0.16]} />
      </mesh>
      <mesh material={materials.concreteDark} position={[0.4, 0.075, 2.27]} rotation-x={-0.12} receiveShadow>
        <boxGeometry args={[1.08, 0.09, 0.23]} />
      </mesh>
      {tactileDots.map(([x, z], index) => (
        <mesh key={index} material={materials.yellow} position={[x, 0.13, z]}>
          <cylinderGeometry args={[0.022, 0.022, 0.018, 10]} />
        </mesh>
      ))}

      <mesh material={materials.asphaltPatch} position={[0, 0.011, 2.43]} receiveShadow>
        <boxGeometry args={[7, 0.02, 0.14]} />
      </mesh>
      {[-2.6, -0.55, 1.5].map((x) => (
        <mesh key={x} material={materials.yellow} position={[x, 0.024, 2.44]}>
          <boxGeometry args={[0.78, 0.012, 0.035]} />
        </mesh>
      ))}

      <mesh material={materials.asphaltPatch} position={[-1.25, 0.012, -1.72]} rotation-x={-Math.PI / 2} scale={[1.7, 0.6, 1]} receiveShadow>
        <circleGeometry args={[0.48, 18]} />
      </mesh>
      <mesh material={materials.asphaltPatch} position={[2.3, 0.014, 0.2]} rotation-x={-Math.PI / 2} scale={[0.85, 1.45, 1]} receiveShadow>
        <circleGeometry args={[0.34, 16]} />
      </mesh>

      <group position={[1.42, 0.035, 2.34]}>
        <mesh material={materials.blackSteel} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.54, 0.18]} />
        </mesh>
        {Array.from({ length: 8 }, (_, index) => -0.22 + index * 0.063).map((x) => (
          <mesh key={x} material={materials.galvanized} position={[x, 0.008, 0]}>
            <boxGeometry args={[0.018, 0.012, 0.16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function ClimbingGymSurroundings(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <GroundPlane />

      <BikeRack />
      <Planter position={[2.72, 0.03, 1.98]} rotation={-0.04} />
      <Planter position={[3.18, 0.03, 0.72]} rotation={Math.PI / 2} />

      <Bollard position={[-0.65, 0.07, 2.06]} lit />
      <Bollard position={[1.18, 0.07, 2.06]} lit />
      <Bollard position={[2.06, 0.07, 2.06]} />
      <FireHydrant />

      <Dumpster />
      <UtilityCluster />
      <Transformer />

      <group position={[-3.27, 0, -0.55]}>
        <Beam start={[0, 0.03, -0.72]} end={[0, 0.03, 0.72]} radius={0.025} material={materials.galvanized} />
        {[-0.56, 0, 0.56].map((z) => (
          <mesh key={z} material={materials.concreteDark} position={[0, 0.06, z]}>
            <boxGeometry args={[0.42, 0.1, 0.13]} />
          </mesh>
        ))}
      </group>

      <group position={[3.29, 0.03, -0.58]}>
        {[-0.42, 0, 0.42].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh material={materials.blackSteel} position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.56, 8]} />
            </mesh>
            <mesh material={materials.amberGlass} position={[0, 0.57, 0]}>
              <sphereGeometry args={[0.045, 10, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
