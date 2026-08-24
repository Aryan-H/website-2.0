"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Point2 = readonly [number, number];
type Point3 = readonly [number, number, number];

type Placement = {
  position: Point3;
  rotationY: number;
};

type BoxInstance = Placement & {
  scale: Point3;
};

const SHORE_ANCHORS: Point2[] = [
  [-36, 12.8],
  [-32, 12],
  [-27, 11.45],
  [-22, 10.35],
  [-20, 10],
  [-14, 9.65],
  [-8, 9],
  [-3, 8.35],
  [4, 7.5],
  [10, 6.75],
  [16, 5.5],
  [22, 4.6],
  [28, 3],
  [32, 3.2],
  [36, 2.4],
];

export const WATERFRONT_STREET_X = [-34, -27, -19, -11, -3, 6, 15, 24, 32] as const;
export const COASTAL_ROAD_SETBACK = 4.35;

const COASTAL_ROAD_OFFSET = -2.62;
const COASTAL_ROAD_WIDTH = 1.68;
const JUNCTION_HALF_WIDTH = 0.82;

/** Land occupies z < shorelineZAtX(x); water occupies z > shorelineZAtX(x). */
export function shorelineZAtX(x: number): number {
  const first = SHORE_ANCHORS[0];
  const last = SHORE_ANCHORS[SHORE_ANCHORS.length - 1];
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];

  const rightIndex = SHORE_ANCHORS.findIndex(([anchorX]) => anchorX >= x);
  const leftIndex = Math.max(0, rightIndex - 1);
  const [leftX, leftZ] = SHORE_ANCHORS[leftIndex];
  const [rightX, rightZ] = SHORE_ANCHORS[rightIndex];
  const previous = SHORE_ANCHORS[Math.max(0, leftIndex - 1)];
  const next = SHORE_ANCHORS[Math.min(SHORE_ANCHORS.length - 1, rightIndex + 1)];
  const span = rightX - leftX;
  const t = (x - leftX) / span;
  const t2 = t * t;
  const t3 = t2 * t;
  const leftSlope = (rightZ - previous[1]) / (rightX - previous[0]);
  const rightSlope = (next[1] - leftZ) / (next[0] - leftX);

  return (
    (2 * t3 - 3 * t2 + 1) * leftZ +
    (t3 - 2 * t2 + t) * span * leftSlope +
    (-2 * t3 + 3 * t2) * rightZ +
    (t3 - t2) * span * rightSlope
  );
}

const SHORE_POINTS: Point2[] = Array.from({ length: 73 }, (_, index) => {
  const x = -36 + index;
  return [x, shorelineZAtX(x)];
});

const materials = {
  land: new THREE.MeshStandardMaterial({
    color: "#0b1217",
    metalness: 0.08,
    roughness: 0.94,
  }),
  road: new THREE.MeshPhysicalMaterial({
    clearcoat: 0.28,
    clearcoatRoughness: 0.5,
    color: "#060b10",
    metalness: 0.04,
    roughness: 0.55,
  }),
  concrete: new THREE.MeshStandardMaterial({
    color: "#5d6568",
    metalness: 0.09,
    roughness: 0.83,
  }),
  promenade: new THREE.MeshStandardMaterial({
    color: "#706e67",
    metalness: 0.04,
    roughness: 0.88,
  }),
  curb: new THREE.MeshStandardMaterial({
    color: "#91999a",
    metalness: 0.08,
    roughness: 0.76,
  }),
  quay: new THREE.MeshStandardMaterial({
    color: "#29343a",
    metalness: 0.46,
    roughness: 0.5,
  }),
  seawall: new THREE.MeshStandardMaterial({
    color: "#172128",
    metalness: 0.4,
    roughness: 0.58,
    side: THREE.DoubleSide,
  }),
  whiteMarking: new THREE.MeshStandardMaterial({
    color: "#aeb7b8",
    metalness: 0.04,
    roughness: 0.7,
  }),
  yellowMarking: new THREE.MeshStandardMaterial({
    color: "#c8a642",
    metalness: 0.05,
    roughness: 0.68,
  }),
  steel: new THREE.MeshStandardMaterial({
    color: "#293840",
    metalness: 0.76,
    roughness: 0.38,
  }),
  galvanized: new THREE.MeshStandardMaterial({
    color: "#77878d",
    metalness: 0.72,
    roughness: 0.4,
  }),
  wood: new THREE.MeshStandardMaterial({
    color: "#493a2d",
    metalness: 0,
    roughness: 0.88,
  }),
  soil: new THREE.MeshStandardMaterial({
    color: "#15110e",
    metalness: 0,
    roughness: 1,
  }),
  bark: new THREE.MeshStandardMaterial({
    color: "#392a22",
    metalness: 0,
    roughness: 1,
  }),
  foliage: new THREE.MeshStandardMaterial({
    color: "#173728",
    metalness: 0,
    roughness: 0.92,
  }),
  foliageLight: new THREE.MeshStandardMaterial({
    color: "#28533b",
    metalness: 0,
    roughness: 0.88,
  }),
  warmLight: new THREE.MeshStandardMaterial({
    color: "#ffd6a0",
    emissive: "#ff9a3c",
    emissiveIntensity: 3.4,
    roughness: 0.24,
    toneMapped: false,
  }),
  boatWhite: new THREE.MeshStandardMaterial({
    color: "#d5dde0",
    metalness: 0.08,
    roughness: 0.46,
  }),
  boatDark: new THREE.MeshPhysicalMaterial({
    clearcoat: 0.72,
    clearcoatRoughness: 0.2,
    color: "#163247",
    metalness: 0.36,
    roughness: 0.25,
  }),
  wake: new THREE.MeshBasicMaterial({
    color: "#70b4d0",
    opacity: 0.18,
    side: THREE.DoubleSide,
    transparent: true,
    toneMapped: false,
  }),
};

function createShoreCurve() {
  return new THREE.CatmullRomCurve3(
    SHORE_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    "centripetal",
  );
}

function samplePlacement(
  curve: THREE.CatmullRomCurve3,
  t: number,
  offset = 0,
  y = 0,
): Placement {
  const point = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
  point.addScaledVector(normal, offset);

  return {
    position: [point.x, y, point.z],
    rotationY: Math.atan2(-tangent.z, tangent.x),
  };
}

function createPolygonGeometry(points: Point2[]) {
  const contour = points.map(([x, z]) => new THREE.Vector2(x, z));
  const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  const positions = new Float32Array(points.length * 3);

  points.forEach(([x, z], index) => {
    positions[index * 3] = x;
    positions[index * 3 + 1] = 0;
    positions[index * 3 + 2] = z;
  });

  const indices = triangles.flatMap(([a, b, c]) => {
    const [ax, az] = points[a];
    const [bx, bz] = points[b];
    const [cx, cz] = points[c];
    const normalY = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    return normalY >= 0 ? [a, b, c] : [a, c, b];
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  offset: number,
  width: number,
  segments = 144,
  cutoutXs: readonly number[] = [],
  cutoutHalfWidth = 0,
) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const inner = point.clone().addScaledVector(normal, offset - width / 2);
    const outer = point.clone().addScaledVector(normal, offset + width / 2);

    vertices.push(inner.x, 0, inner.z, outer.x, 0, outer.z);
    uvs.push(t, 0, t, 1);

    if (index < segments) {
      const current = index * 2;
      const middleT = (index + 0.5) / segments;
      const middlePoint = curve.getPointAt(middleT);
      const middleTangent = curve.getTangentAt(middleT).normalize();
      const middleNormal = new THREE.Vector3(
        -middleTangent.z,
        0,
        middleTangent.x,
      );
      middlePoint.addScaledVector(middleNormal, offset);
      const cutOut = cutoutXs.some(
        (streetX) => Math.abs(middlePoint.x - streetX) < cutoutHalfWidth,
      );

      if (!cutOut) {
        indices.push(
          current,
          current + 1,
          current + 2,
          current + 1,
          current + 3,
          current + 2,
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createWallGeometry(
  curve: THREE.CatmullRomCurve3,
  offset: number,
  top: number,
  bottom: number,
  segments = 144,
) {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
    point.addScaledVector(normal, offset);
    vertices.push(point.x, top, point.z, point.x, bottom, point.z);

    if (index < segments) {
      const current = index * 2;
      indices.push(
        current,
        current + 1,
        current + 2,
        current + 2,
        current + 1,
        current + 3,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function BoxInstances({
  items,
  material,
}: {
  items: BoxInstance[];
  material: THREE.Material;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;

    items.forEach((item, index) => {
      helper.position.set(...item.position);
      helper.rotation.set(0, item.rotationY, 0);
      helper.scale.set(...item.scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [helper, items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} material={material} receiveShadow>
      <boxGeometry />
    </instancedMesh>
  );
}

function AnimatedWater({ reducedMotion }: { reducedMotion: boolean }) {
  const geometry = useRef<THREE.PlaneGeometry>(null);
  const shimmer = useRef<THREE.Group>(null);
  const frame = useRef(0);
  const initialized = useRef(false);
  const shimmerLines = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        x: -30 + ((index * 7.73) % 62),
        z: -20 + ((index * 5.47) % 42),
        length: 1.2 + (index % 5) * 0.72,
        rotation: -0.12 + (index % 4) * 0.07,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!geometry.current) return;
    if (reducedMotion && initialized.current) return;
    frame.current += 1;
    if (!reducedMotion && frame.current % 2 !== 0) return;

    const elapsed = reducedMotion ? 0.7 : clock.getElapsedTime();
    const position = geometry.current.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const height =
        Math.sin(x * 0.31 + elapsed * 0.55) * 0.038 +
        Math.sin(y * 0.47 - elapsed * 0.38) * 0.025 +
        Math.sin((x + y) * 0.16 + elapsed * 0.24) * 0.018;
      position.setZ(index, height);
    }
    position.needsUpdate = true;
    if (frame.current % 6 === 0 || reducedMotion) geometry.current.computeVertexNormals();
    if (shimmer.current && !reducedMotion) {
      shimmer.current.position.x = Math.sin(elapsed * 0.16) * 0.42;
      shimmer.current.position.z = Math.cos(elapsed * 0.12) * 0.18;
    }
    initialized.current = true;
  });

  return (
    <group>
      <mesh position={[0, -0.22, -1]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry ref={geometry} args={[78, 56, 72, 46]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#031726"
          metalness={0.52}
          roughness={0.2}
        />
      </mesh>
      <group ref={shimmer}>
        {shimmerLines.map((line, index) => (
          <mesh
            key={index}
            position={[line.x, -0.135 + (index % 3) * 0.008, line.z]}
            rotation={[-Math.PI / 2, 0, line.rotation]}
          >
            <planeGeometry args={[line.length, 0.025 + (index % 2) * 0.012]} />
            <meshBasicMaterial
              color={index % 4 === 0 ? "#76b8d2" : "#285b74"}
              opacity={index % 4 === 0 ? 0.17 : 0.11}
              transparent
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function PromenadeTree({ placement }: { placement: Placement }) {
  const crown = [
    [-0.18, 1.28, 0.03, 0.38],
    [0.18, 1.33, -0.05, 0.36],
    [0, 1.58, 0, 0.42],
    [-0.28, 1.54, -0.03, 0.3],
    [0.29, 1.62, 0.04, 0.29],
    [0.02, 1.88, 0, 0.28],
  ] as const;

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <mesh material={materials.steel} position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[0.78, 0.04, 0.78]} />
      </mesh>
      {[-0.28, -0.14, 0, 0.14, 0.28].map((x) => (
        <mesh key={x} material={materials.galvanized} position={[x, 0.052, 0]}>
          <boxGeometry args={[0.018, 0.018, 0.68]} />
        </mesh>
      ))}
      <mesh material={materials.soil} position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.028, 18]} />
      </mesh>
      <mesh material={materials.bark} position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 1.4, 9]} />
      </mesh>
      {crown.map(([x, y, z, radius], index) => (
        <mesh
          key={index}
          castShadow
          material={index % 2 === 0 ? materials.foliage : materials.foliageLight}
          position={[x, y, z]}
          rotation={[index * 0.28, index * 0.41, 0]}
          scale={[1, 0.84, 0.93]}
        >
          <dodecahedronGeometry args={[radius, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function QuayLamp({ placement, bright }: { placement: Placement; bright: boolean }) {
  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <mesh material={materials.steel} position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 1.42, 10]} />
      </mesh>
      <mesh material={materials.steel} position={[0.12, 1.39, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.022, 0.022, 0.26, 8]} />
      </mesh>
      <mesh material={materials.warmLight} position={[0.27, 1.37, 0]}>
        <sphereGeometry args={[0.065, 10, 8]} />
      </mesh>
      {bright ? (
        <pointLight color="#ffb666" distance={4.2} decay={2.2} intensity={0.55} position={[0.27, 1.34, 0]} />
      ) : null}
    </group>
  );
}

function Bench({ placement, flip }: { placement: Placement; flip: boolean }) {
  return (
    <group
      position={placement.position}
      rotation-y={placement.rotationY + (flip ? Math.PI : 0)}
    >
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} material={materials.wood} position={[x, 0.34, 0]} castShadow>
          <boxGeometry args={[0.32, 0.065, 0.56]} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={materials.steel} position={[0, 0.18, -0.18]}>
            <boxGeometry args={[0.045, 0.36, 0.045]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.18, 0.18]}>
            <boxGeometry args={[0.045, 0.36, 0.045]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.47, 0.22]} rotation-x={-0.16}>
            <boxGeometry args={[0.045, 0.4, 0.045]} />
          </mesh>
        </group>
      ))}
      <mesh material={materials.wood} position={[0, 0.57, 0.24]} rotation-x={-0.16} castShadow>
        <boxGeometry args={[1.25, 0.29, 0.06]} />
      </mesh>
    </group>
  );
}

function PromenadeDetails({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const lamps = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) =>
        samplePlacement(curve, 0.025 + index * 0.068, -0.48, 0.095),
      ),
    [curve],
  );
  const trees = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) =>
        samplePlacement(curve, 0.065 + index * 0.098, -1.26, 0.09),
      ),
    [curve],
  );
  const benches = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) =>
        samplePlacement(curve, 0.1 + index * 0.115, -0.78, 0.1),
      ),
    [curve],
  );
  const paverJoints = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 72 }, (_, index) => {
        const placement = samplePlacement(curve, index / 71, -1.02, 0.094);
        return { ...placement, scale: [0.018, 0.012, 1.46] };
      }),
    [curve],
  );

  return (
    <group>
      <BoxInstances items={paverJoints} material={materials.concrete} />
      {lamps.map((placement, index) => (
        <QuayLamp key={index} bright={index % 5 === 2} placement={placement} />
      ))}
      {trees.map((placement, index) => (
        <PromenadeTree key={index} placement={placement} />
      ))}
      {benches.map((placement, index) => (
        <Bench key={index} flip={index % 2 === 1} placement={placement} />
      ))}
    </group>
  );
}

function RoadDetails({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const laneDashes = useMemo<BoxInstance[]>(
    () =>
      Array.from({ length: 50 }, (_, index) => {
        const placement = samplePlacement(
          curve,
          0.012 + index * 0.02,
          COASTAL_ROAD_OFFSET,
          0.09,
        );
        return { ...placement, scale: [0.58, 0.018, 0.052] };
      }).filter((_, index) => index % 2 === 0),
    [curve],
  );

  return (
    <BoxInstances items={laneDashes} material={materials.yellowMarking} />
  );
}

function WaterfrontJunctions() {
  const junctions = useMemo(
    () =>
      WATERFRONT_STREET_X.map((x) => {
        const shoreline = shorelineZAtX(x);
        const start = shoreline - COASTAL_ROAD_SETBACK - 0.08;
        const end = shoreline + COASTAL_ROAD_OFFSET + COASTAL_ROAD_WIDTH / 2 + 0.06;
        const length = end - start;
        const gridSurface = 0.0675;
        const coastalSurface = 0.046;
        const connectorThickness = 0.022;
        const slope = Math.atan2(gridSurface - coastalSurface, length);
        const boulevardInlandEdge =
          shoreline + COASTAL_ROAD_OFFSET - COASTAL_ROAD_WIDTH / 2;
        return {
          x,
          start,
          end,
          center: (start + end) / 2,
          length,
          slope,
          surfaceCenterY:
            (gridSurface + coastalSurface) / 2 -
            (Math.cos(slope) * connectorThickness) / 2,
          connectorThickness,
          boulevardInlandEdge,
        };
      }),
    [],
  );

  return (
    <group>
      {junctions.map((junction) => (
        <group key={junction.x}>
          <mesh
            material={materials.road}
            position={[junction.x, junction.surfaceCenterY, junction.center]}
            rotation-x={junction.slope}
            receiveShadow
          >
            <boxGeometry
              args={[1.36, junction.connectorThickness, junction.length]}
            />
          </mesh>
          <mesh
            material={materials.yellowMarking}
            position={[
              junction.x,
              0.073,
              (junction.start + junction.boulevardInlandEdge) / 2,
            ]}
          >
            <boxGeometry
              args={[0.038, 0.012, junction.boulevardInlandEdge - junction.start]}
            />
          </mesh>
          {Array.from({ length: 6 }, (_, stripe) => stripe).map((stripe) => (
            <mesh
              key={stripe}
              material={materials.whiteMarking}
              position={[
                junction.x,
                0.064,
                junction.boulevardInlandEdge - 0.47 + stripe * 0.14,
              ]}
            >
              <boxGeometry args={[1.08, 0.012, 0.065]} />
            </mesh>
          ))}
          {[-0.7, 0.7].map((offsetX) => (
            <mesh
              key={offsetX}
              material={materials.curb}
              position={[
                junction.x + offsetX,
                0.075,
                (junction.start + junction.boulevardInlandEdge) / 2,
              ]}
            >
              <boxGeometry
                args={[0.08, 0.075, junction.boulevardInlandEdge - junction.start]}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

type WaterfrontVehicle = {
  direction: 1 | -1;
  laneOffset: number;
  phase: number;
  speed: number;
};

function WaterfrontTrafficBatch({
  color,
  curve,
  reducedMotion,
  vehicles,
}: {
  color: string;
  curve: THREE.CatmullRomCurve3;
  reducedMotion: boolean;
  vehicles: WaterfrontVehicle[];
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const elapsed = reducedMotion ? 0 : clock.getElapsedTime();

    vehicles.forEach((vehicle, index) => {
      const rawProgress = (vehicle.phase + elapsed * vehicle.speed) % 1;
      const progress = vehicle.direction === 1 ? rawProgress : 1 - rawProgress;
      curve.getPointAt(progress, point);
      curve.getTangentAt(progress, tangent).normalize();
      normal.set(-tangent.z, 0, tangent.x);
      point.addScaledVector(normal, vehicle.laneOffset);
      helper.position.set(point.x, 0.115, point.z);
      helper.rotation.set(
        0,
        Math.atan2(
          tangent.x * vehicle.direction,
          tangent.z * vehicle.direction,
        ),
        0,
      );
      helper.scale.set(0.08, 0.045, 0.28);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, vehicles.length]}
      frustumCulled={false}
    >
      <boxGeometry />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

function WaterfrontTraffic({
  curve,
  reducedMotion,
}: {
  curve: THREE.CatmullRomCurve3;
  reducedMotion: boolean;
}) {
  const vehicles = useMemo<WaterfrontVehicle[]>(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        return {
          direction,
          laneOffset: COASTAL_ROAD_OFFSET + (direction === 1 ? -0.28 : 0.28),
          phase: (index * 0.137) % 1,
          speed: 0.011 + (index % 5) * 0.0015,
        };
      }),
    [],
  );

  return (
    <group>
      <WaterfrontTrafficBatch
        color="#d8f4ff"
        curve={curve}
        reducedMotion={reducedMotion}
        vehicles={vehicles.filter((_, index) => index % 3 !== 0)}
      />
      <WaterfrontTrafficBatch
        color="#ff705f"
        curve={curve}
        reducedMotion={reducedMotion}
        vehicles={vehicles.filter((_, index) => index % 3 === 0)}
      />
    </group>
  );
}

function Pier({
  curve,
  t,
  length,
}: {
  curve: THREE.CatmullRomCurve3;
  t: number;
  length: number;
}) {
  const placement = useMemo(() => samplePlacement(curve, t, 0.08, 0), [curve, t]);

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <mesh material={materials.quay} position={[0, 0.055, length / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.22, length]} />
      </mesh>
      {Array.from({ length: Math.ceil(length / 0.32) }, (_, index) => index * 0.32 + 0.12).map((z) => (
        <mesh key={z} material={materials.galvanized} position={[0, 0.18, z]}>
          <boxGeometry args={[0.52, 0.018, 0.025]} />
        </mesh>
      ))}
      {[-0.34, 0.34].flatMap((x) =>
        [0.35, length - 0.25].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh material={materials.steel} position={[0, -0.01, 0]}>
              <cylinderGeometry args={[0.055, 0.065, 0.65, 10]} />
            </mesh>
            <mesh material={materials.warmLight} position={[0, 0.33, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

function Boat({
  position,
  rotation,
  scale,
  phase,
  sail,
  reducedMotion,
}: {
  position: Point2;
  rotation: number;
  scale: number;
  phase: number;
  sail: boolean;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const elapsed = clock.getElapsedTime();
    group.current.position.y = -0.1 + Math.sin(elapsed * 0.72 + phase) * 0.025;
    group.current.rotation.z = Math.sin(elapsed * 0.54 + phase) * 0.012;
  });

  return (
    <group
      ref={group}
      position={[position[0], -0.1, position[1]]}
      rotation-y={rotation}
      scale={scale}
    >
      <mesh material={materials.boatWhite} position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.48, 0.2, 1.35]} />
      </mesh>
      <mesh material={materials.boatWhite} position={[0, 0.12, -0.78]} rotation-x={-Math.PI / 2} castShadow>
        <coneGeometry args={[0.34, 0.66, 4]} />
      </mesh>
      <mesh material={materials.boatDark} position={[0, 0.31, 0.16]}>
        <boxGeometry args={[0.31, 0.22, 0.46]} />
      </mesh>
      <mesh material={materials.warmLight} position={[-0.25, 0.24, 0.5]}>
        <sphereGeometry args={[0.025, 8, 8]} />
      </mesh>
      {sail ? (
        <>
          <mesh material={materials.galvanized} position={[0, 0.91, 0.06]}>
            <cylinderGeometry args={[0.014, 0.019, 1.48, 8]} />
          </mesh>
          <mesh position={[0.14, 0.93, 0.05]} rotation-z={-0.1} scale={[0.25, 0.72, 0.025]}>
            <coneGeometry args={[1, 1.7, 3]} />
            <meshStandardMaterial
              color="#dfe4df"
              opacity={0.82}
              roughness={0.72}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        </>
      ) : null}
      <mesh material={materials.wake} position={[0, -0.055, 1.23]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.72, 1.55]} />
      </mesh>
    </group>
  );
}

function CoastalStructures({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const bollards = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) =>
        samplePlacement(curve, 0.012 + index * 0.039, -0.02, 0.2),
      ),
    [curve],
  );

  return (
    <group>
      {bollards.map((placement, index) => (
        <group key={index} position={placement.position}>
          <mesh material={materials.steel} position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.105, 0.24, 10]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.12, 0.08, 0.055, 10]} />
          </mesh>
        </group>
      ))}
      <Pier curve={curve} length={3.35} t={0.69} />
      <Pier curve={curve} length={2.75} t={0.78} />
    </group>
  );
}

export default function CoastalGround({ reducedMotion }: { reducedMotion: boolean }) {
  const curve = useMemo(() => createShoreCurve(), []);
  const land = useMemo(
    () =>
      createPolygonGeometry([
        [-36, -24],
        [36, -24],
        ...[...SHORE_POINTS].reverse(),
      ]),
    [],
  );
  const road = useMemo(
    () => createRibbonGeometry(curve, COASTAL_ROAD_OFFSET, COASTAL_ROAD_WIDTH),
    [curve],
  );
  const inlandSidewalk = useMemo(
    () =>
      createRibbonGeometry(
        curve,
        -3.82,
        0.62,
        144,
        WATERFRONT_STREET_X,
        JUNCTION_HALF_WIDTH,
      ),
    [curve],
  );
  const promenade = useMemo(
    () => createRibbonGeometry(curve, -0.98, 1.55),
    [curve],
  );
  const curbInland = useMemo(
    () =>
      createRibbonGeometry(
        curve,
        -3.48,
        0.12,
        144,
        WATERFRONT_STREET_X,
        JUNCTION_HALF_WIDTH,
      ),
    [curve],
  );
  const curbShore = useMemo(
    () => createRibbonGeometry(curve, -1.75, 0.12),
    [curve],
  );
  const quayCap = useMemo(() => createRibbonGeometry(curve, -0.06, 0.2), [curve]);
  const seawall = useMemo(() => createWallGeometry(curve, 0.035, 0.16, -0.42), [curve]);

  return (
    <group>
      <AnimatedWater reducedMotion={reducedMotion} />

      <mesh geometry={land} material={materials.land} position={[0, 0, 0]} receiveShadow />
      <mesh geometry={road} material={materials.road} position={[0, 0.045, 0]} receiveShadow />
      <mesh
        geometry={inlandSidewalk}
        material={materials.concrete}
        position={[0, 0.075, 0]}
        receiveShadow
      />
      <mesh
        geometry={promenade}
        material={materials.promenade}
        position={[0, 0.082, 0]}
        receiveShadow
      />
      <mesh geometry={curbInland} material={materials.curb} position={[0, 0.11, 0]} castShadow />
      <mesh geometry={curbShore} material={materials.curb} position={[0, 0.11, 0]} castShadow />
      <mesh geometry={quayCap} material={materials.quay} position={[0, 0.14, 0]} castShadow />
      <mesh geometry={seawall} material={materials.seawall} receiveShadow />

      <RoadDetails curve={curve} />
      <WaterfrontJunctions />
      <WaterfrontTraffic curve={curve} reducedMotion={reducedMotion} />
      <PromenadeDetails curve={curve} />
      <CoastalStructures curve={curve} />

      <Boat position={[8.2, 10.1]} rotation={-0.16} scale={0.78} phase={0.4} sail reducedMotion={reducedMotion} />
      <Boat position={[13.4, 9.4]} rotation={0.12} scale={0.66} phase={1.5} sail={false} reducedMotion={reducedMotion} />
      <Boat position={[18.1, 12.4]} rotation={-0.24} scale={0.82} phase={2.4} sail reducedMotion={reducedMotion} />
      <Boat position={[24.8, 9.8]} rotation={0.2} scale={0.7} phase={3.2} sail={false} reducedMotion={reducedMotion} />
      <Boat position={[28.2, 15.3]} rotation={-0.08} scale={0.88} phase={4.1} sail reducedMotion={reducedMotion} />
    </group>
  );
}
