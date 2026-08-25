"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type BoxInstance = {
  position: Vec3;
  scale: Vec3;
  rotationY?: number;
};

const TRACK_Z = [-0.58, 0.58] as const;
const CENTERLINE_CONTROLS: Vec3[] = [
  [3.55, 0, 0],
  [4.85, 0, 0.08],
  [9, 0, -0.05],
  [13.5, 0, -0.7],
  [22.5, 0, -1.8],
  [33, 0, -2.45],
  [40.5, 0, -2.85],
];

const COLORS = {
  ballast: "#354149",
  ballastEdge: "#222d35",
  bridge: "#273640",
  bridgeDark: "#121d25",
  bridgeSteel: "#50616b",
  rightOfWay: "#111a20",
  fence: "#607783",
  rail: "#a5b2b8",
  sleeper: "#55524b",
  sleeperEdge: "#292d30",
  blue: "#40c8ff",
  blueDeep: "#0877b9",
  signalRed: "#ff665d",
  signalGreen: "#62f1b0",
  trainBody: "#9aabb4",
  trainLower: "#263a48",
  trainDark: "#101d27",
  trainWindow: "#66d8ff",
};

const PORTAL_COLUMNS: BoxInstance[] = [-1.12, 0, 1.12].map((z) => ({
  position: [0.27, 0.96, z],
  scale: [0.78, 1.32, 0.16],
}));

const SIGNAL_STEEL: BoxInstance[] = [
  { position: [0, 1.22, -1.12], scale: [0.1, 1.45, 0.1] },
  { position: [0, 1.22, 1.12], scale: [0.1, 1.45, 0.1] },
  { position: [0, 1.9, 0], scale: [0.1, 0.1, 2.34] },
];

const SIGNAL_HOUSINGS: BoxInstance[] = TRACK_Z.map((trackZ) => ({
  position: [0.06, 1.7, trackZ],
  scale: [0.1, 0.34, 0.28],
}));

function makeCenterline() {
  return new THREE.CatmullRomCurve3(
    CENTERLINE_CONTROLS.map((point) => new THREE.Vector3(...point)),
    false,
    "centripetal",
  );
}

function sampleOffset(
  centerline: THREE.CatmullRomCurve3,
  progress: number,
  offset: number,
  target = new THREE.Vector3(),
  tangentTarget = new THREE.Vector3(),
) {
  centerline.getPointAt(progress, target);
  centerline.getTangentAt(progress, tangentTarget).normalize();
  target.x -= tangentTarget.z * offset;
  target.z += tangentTarget.x * offset;
  return target;
}

function makeOffsetCurve(
  centerline: THREE.CatmullRomCurve3,
  offset: number,
  y: number,
  samples = 48,
) {
  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const point = sampleOffset(centerline, index / samples, offset);
    point.y = y;
    return point;
  });
  return new THREE.CatmullRomCurve3(points, false, "centripetal");
}

function makeCurveBoxes({
  centerline,
  offset,
  y,
  height,
  width,
  segments = 42,
}: {
  centerline: THREE.CatmullRomCurve3;
  offset: number;
  y: number;
  height: number;
  width: number;
  segments?: number;
}) {
  const boxes: BoxInstance[] = [];
  for (let index = 0; index < segments; index += 1) {
    const start = sampleOffset(centerline, index / segments, offset);
    const end = sampleOffset(centerline, (index + 1) / segments, offset);
    const deltaX = end.x - start.x;
    const deltaZ = end.z - start.z;
    boxes.push({
      position: [(start.x + end.x) * 0.5, y, (start.z + end.z) * 0.5],
      scale: [Math.hypot(deltaX, deltaZ) + 0.035, height, width],
      rotationY: -Math.atan2(deltaZ, deltaX),
    });
  }
  return boxes;
}

function BoxInstances({
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.15,
  roughness = 0.68,
}: {
  items: BoxInstance[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();

    items.forEach((item, index) => {
      helper.position.set(...item.position);
      helper.rotation.set(0, item.rotationY ?? 0, 0);
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
      raycast={() => undefined}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
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

function BridgeDeck({ centerline }: { centerline: THREE.CatmullRomCurve3 }) {
  const assets = useMemo(() => {
    const rightOfWay = makeCurveBoxes({
      centerline,
      offset: 0,
      y: 0.095,
      height: 0.19,
      width: 2.8,
    });
    const deck = makeCurveBoxes({
      centerline,
      offset: 0,
      y: 0.315,
      height: 0.22,
      width: 2.34,
    });
    const ballast = TRACK_Z.flatMap((trackZ) =>
      makeCurveBoxes({
        centerline,
        offset: trackZ,
        y: 0.432,
        height: 0.075,
        width: 0.94,
      }),
    );
    const edgeWebs = [-1.18, 1.18].flatMap((offset) =>
      makeCurveBoxes({
        centerline,
        offset,
        y: 0.28,
        height: 0.34,
        width: 0.1,
      }),
    );
    const edgeFlanges = [-1.18, 1.18].flatMap((offset) =>
      makeCurveBoxes({
        centerline,
        offset,
        y: 0.465,
        height: 0.055,
        width: 0.16,
      }),
    );

    const sleeperCount = 56;
    const sleepers: BoxInstance[] = TRACK_Z.flatMap((trackZ) =>
      Array.from({ length: sleeperCount + 1 }, (_, index) => {
        const progress = index / sleeperCount;
        const point = sampleOffset(centerline, progress, trackZ);
        const tangent = centerline.getTangentAt(progress);
        return {
          position: [point.x, 0.456, point.z] as Vec3,
          scale: [0.105, 0.055, 0.88] as Vec3,
          rotationY: -Math.atan2(tangent.z, tangent.x),
        };
      }),
    );

    // Pair piers on either side of the x=15, x=24, and x=32 streets so the
    // elevated trains span the live traffic lanes instead of landing in them.
    const pierProgress = [0.107, 0.189, 0.352, 0.433, 0.595, 0.649, 0.838, 0.919];
    const pierColumns: BoxInstance[] = [];
    const pierCaps: BoxInstance[] = [];
    pierProgress.forEach((progress) => {
      const point = centerline.getPointAt(progress);
      const tangent = centerline.getTangentAt(progress);
      const rotationY = -Math.atan2(tangent.z, tangent.x);
      [-0.96, 0.96].forEach((offset) => {
        const columnPoint = sampleOffset(centerline, progress, offset);
        pierColumns.push({
          position: [columnPoint.x, 0.125, columnPoint.z],
          scale: [0.24, 0.25, 0.24],
          rotationY,
        });
      });
      pierCaps.push({
        position: [point.x, 0.255, point.z],
        scale: [0.34, 0.12, 2.16],
        rotationY,
      });
    });

    const guardPosts: BoxInstance[] = [];
    for (let index = 1; index <= 15; index += 1) {
      const progress = index / 16;
      [-1.17, 1.17].forEach((offset) => {
        const point = sampleOffset(centerline, progress, offset);
        guardPosts.push({
          position: [point.x, 0.67, point.z],
          scale: [0.055, 0.48, 0.055],
        });
      });
    }

    const perimeterFencePosts: BoxInstance[] = [];
    for (let index = 0; index <= 28; index += 1) {
      const progress = index / 28;
      const tangent = centerline.getTangentAt(progress);
      [-1.38, 1.38].forEach((offset) => {
        const point = sampleOffset(centerline, progress, offset);
        perimeterFencePosts.push({
          position: [point.x, 0.56, point.z],
          rotationY: -Math.atan2(tangent.z, tangent.x),
          scale: [0.055, 0.92, 0.055],
        });
      });
    }

    const perimeterFenceRails = [-1.38, 1.38].flatMap((offset) =>
      [0.3, 0.61, 0.93].flatMap((y) =>
        makeCurveBoxes({
          centerline,
          offset,
          y,
          height: 0.028,
          width: 0.028,
        }),
      ),
    );

    const boundaryCurbs = [-1.38, 1.38].flatMap((offset) =>
      makeCurveBoxes({
        centerline,
        offset,
        y: 0.16,
        height: 0.22,
        width: 0.12,
      }),
    );

    const railCurves = TRACK_Z.flatMap((trackZ) =>
      [-0.19, 0.19].map((railOffset) => ({
        support: makeOffsetCurve(centerline, trackZ + railOffset, 0.47),
        rail: makeOffsetCurve(centerline, trackZ + railOffset, 0.508),
      })),
    );
    const guardCurves = [-1.17, 1.17].flatMap((offset) =>
      [0.62, 0.81].map((y) => makeOffsetCurve(centerline, offset, y)),
    );
    const edgeGlowCurves = [-1.176, 1.176].map((offset) =>
      makeOffsetCurve(centerline, offset, 0.505),
    );

    return {
      ballast,
      boundaryCurbs,
      deck,
      edgeFlanges,
      edgeGlowCurves,
      edgeWebs,
      guardCurves,
      guardPosts,
      perimeterFencePosts,
      perimeterFenceRails,
      pierCaps,
      pierColumns,
      railCurves,
      rightOfWay,
      sleepers,
    };
  }, [centerline]);

  return (
    <group>
      <BoxInstances
        items={assets.rightOfWay}
        color={COLORS.rightOfWay}
        roughness={0.98}
      />
      <BoxInstances
        items={assets.boundaryCurbs}
        color={COLORS.bridgeDark}
        metalness={0.2}
        roughness={0.76}
      />
      <BoxInstances
        items={assets.perimeterFencePosts}
        color={COLORS.fence}
        metalness={0.72}
        roughness={0.38}
      />
      <BoxInstances
        items={assets.perimeterFenceRails}
        color={COLORS.fence}
        metalness={0.72}
        roughness={0.38}
      />
      <BoxInstances
        items={assets.deck}
        color={COLORS.bridge}
        metalness={0.28}
        roughness={0.68}
      />
      <BoxInstances
        items={assets.ballast}
        color={COLORS.ballast}
        roughness={0.94}
      />
      <BoxInstances
        items={assets.edgeWebs}
        color={COLORS.bridgeDark}
        metalness={0.45}
        roughness={0.52}
      />
      <BoxInstances
        items={assets.edgeFlanges}
        color={COLORS.bridgeSteel}
        metalness={0.72}
        roughness={0.34}
      />
      <BoxInstances
        items={assets.sleepers}
        color={COLORS.sleeper}
        metalness={0.16}
        roughness={0.88}
      />
      <BoxInstances
        items={assets.pierColumns}
        color={COLORS.bridgeDark}
        metalness={0.45}
        roughness={0.58}
      />
      <BoxInstances
        items={assets.pierCaps}
        color={COLORS.bridgeSteel}
        metalness={0.56}
        roughness={0.46}
      />
      <BoxInstances
        items={assets.guardPosts}
        color={COLORS.bridgeSteel}
        metalness={0.68}
        roughness={0.4}
      />

      {assets.railCurves.map(({ rail, support }, index) => (
        <group key={index}>
          <mesh raycast={() => undefined}>
            <tubeGeometry args={[support, 52, 0.047, 4, false]} />
            <meshStandardMaterial
              color={COLORS.ballastEdge}
              metalness={0.35}
              roughness={0.62}
            />
          </mesh>
          <mesh castShadow raycast={() => undefined}>
            <tubeGeometry args={[rail, 56, 0.035, 5, false]} />
            <meshStandardMaterial
              color={COLORS.rail}
              metalness={0.93}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {assets.guardCurves.map((curve, index) => (
        <mesh key={index} raycast={() => undefined}>
          <tubeGeometry args={[curve, 44, 0.018, 4, false]} />
          <meshStandardMaterial
            color={COLORS.bridgeSteel}
            metalness={0.82}
            roughness={0.32}
          />
        </mesh>
      ))}
      {assets.edgeGlowCurves.map((curve, index) => (
        <mesh key={index} raycast={() => undefined}>
          <tubeGeometry args={[curve, 40, 0.012, 3, false]} />
          <meshBasicMaterial
            color={COLORS.blue}
            opacity={0.52}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function StationPortal({ centerline }: { centerline: THREE.CatmullRomCurve3 }) {
  const placement = useMemo(() => {
    const point = centerline.getPointAt(0);
    const tangent = centerline.getTangentAt(0);
    return {
      position: [point.x, 0, point.z] as Vec3,
      rotationY: -Math.atan2(tangent.z, tangent.x),
    };
  }, [centerline]);

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <mesh
        castShadow
        position={[0.27, 1.5, 0]}
        raycast={() => undefined}
      >
        <boxGeometry args={[0.78, 0.25, 2.34]} />
        <meshStandardMaterial
          color={COLORS.bridgeSteel}
          metalness={0.34}
          roughness={0.58}
        />
      </mesh>
      <BoxInstances
        items={PORTAL_COLUMNS}
        color={COLORS.bridgeSteel}
        metalness={0.32}
        roughness={0.62}
      />
      <mesh position={[0.67, 1.34, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.045, 0.08, 2.03]} />
        <meshBasicMaterial color={COLORS.blue} toneMapped={false} />
      </mesh>
      {TRACK_Z.map((trackZ) => (
        <group key={trackZ}>
          <mesh position={[0.675, 1.05, trackZ]} raycast={() => undefined}>
            <boxGeometry args={[0.035, 0.56, 0.78]} />
            <meshBasicMaterial
              blending={THREE.AdditiveBlending}
              color={COLORS.blueDeep}
              depthWrite={false}
              opacity={0.12}
              toneMapped={false}
              transparent
            />
          </mesh>
        </group>
      ))}
      <pointLight
        color={COLORS.blue}
        distance={2.8}
        intensity={0.9}
        position={[0.8, 1.1, 0]}
      />
    </group>
  );
}

function SignalGantry({
  centerline,
  progress,
  greenTrack,
}: {
  centerline: THREE.CatmullRomCurve3;
  progress: number;
  greenTrack: 0 | 1;
}) {
  const placement = useMemo(() => {
    const point = centerline.getPointAt(progress);
    const tangent = centerline.getTangentAt(progress);
    return {
      position: [point.x, 0, point.z] as Vec3,
      rotationY: -Math.atan2(tangent.z, tangent.x),
    };
  }, [centerline, progress]);

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <BoxInstances
        items={SIGNAL_STEEL}
        color={COLORS.bridgeSteel}
        metalness={0.78}
        roughness={0.32}
      />
      <BoxInstances
        items={SIGNAL_HOUSINGS}
        color={COLORS.trainDark}
        metalness={0.45}
        roughness={0.48}
      />
      {TRACK_Z.map((trackZ, trackIndex) => {
        const signalColor = trackIndex === greenTrack ? COLORS.signalGreen : COLORS.signalRed;
        return (
          <group key={trackZ} position={[0.06, 1.7, trackZ]}>
            <mesh
              position={[0.058, trackIndex === greenTrack ? -0.075 : 0.075, 0]}
              raycast={() => undefined}
              rotation-y={Math.PI / 2}
            >
              <circleGeometry args={[0.062, 12]} />
              <meshBasicMaterial color={signalColor} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const TRAIN_CAR_OFFSETS = [0, -2.08, -4.16] as const;
const TRAIN_WINDOW_X = [-0.58, -0.19, 0.2, 0.59] as const;

const TRAIN_LOWER_BOXES: BoxInstance[] = TRAIN_CAR_OFFSETS.map((offset) => ({
  position: [offset, 0.615, 0],
  scale: [1.92, 0.24, 0.72],
}));

const TRAIN_DARK_BOXES: BoxInstance[] = [
  ...TRAIN_CAR_OFFSETS.map((offset) => ({
    position: [offset, 1.117, 0] as Vec3,
    scale: [1.45, 0.07, 0.58] as Vec3,
  })),
  { position: [-1.04, 0.65, 0], scale: [0.22, 0.11, 0.18] },
  { position: [-3.12, 0.65, 0], scale: [0.22, 0.11, 0.18] },
];

const TRAIN_GLOWING_WINDOWS: BoxInstance[] = [
  ...TRAIN_CAR_OFFSETS.flatMap((carOffset) =>
    [-1, 1].flatMap((side) =>
      TRAIN_WINDOW_X.map((windowX) => ({
        position: [carOffset + windowX, 0.905, side * 0.366] as Vec3,
        scale: [0.31, 0.22, 0.014] as Vec3,
      })),
    ),
  ),
  { position: [0.972, 0.88, 0], scale: [0.02, 0.22, 0.4] },
  { position: [0.99, 0.7, -0.22], scale: [0.025, 0.09, 0.09] },
  { position: [0.99, 0.7, 0.22], scale: [0.025, 0.09, 0.09] },
];

const TRAIN_BLUE_STRIPS: BoxInstance[] = TRAIN_CAR_OFFSETS.flatMap((carOffset) =>
  [-1, 1].map((side) => ({
    position: [carOffset, 0.71, side * 0.373] as Vec3,
    scale: [1.52, 0.035, 0.014] as Vec3,
  })),
);

const TRAIN_WHEEL_POSITIONS: Vec3[] = TRAIN_CAR_OFFSETS.flatMap((carOffset) =>
  [-0.62, 0.62].flatMap((wheelX) =>
    [-0.29, 0.29].map(
      (wheelZ) => [carOffset + wheelX, 0.555, wheelZ] as Vec3,
    ),
  ),
);

function TrainBodyInstances() {
  const bodies = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!bodies.current) return;
    const helper = new THREE.Object3D();
    TRAIN_CAR_OFFSETS.forEach((offset, index) => {
      helper.position.set(offset, 0.85, 0);
      helper.rotation.set(0, 0, Math.PI / 2);
      helper.scale.set(1, 1, 1.08);
      helper.updateMatrix();
      bodies.current?.setMatrixAt(index, helper.matrix);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    bodies.current.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh
      ref={bodies}
      args={[undefined, undefined, TRAIN_CAR_OFFSETS.length]}
      castShadow
      raycast={() => undefined}
    >
      <capsuleGeometry args={[0.33, 1.22, 3, 8]} />
      <meshStandardMaterial
        color={COLORS.trainBody}
        emissive={COLORS.blueDeep}
        emissiveIntensity={0.12}
        metalness={0.66}
        roughness={0.3}
      />
    </instancedMesh>
  );
}

function TrainWheelInstances() {
  const wheels = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!wheels.current) return;
    const helper = new THREE.Object3D();
    TRAIN_WHEEL_POSITIONS.forEach((position, index) => {
      helper.position.set(...position);
      helper.rotation.set(Math.PI / 2, 0, 0);
      helper.scale.set(1, 1, 1);
      helper.updateMatrix();
      wheels.current?.setMatrixAt(index, helper.matrix);
    });
    wheels.current.instanceMatrix.needsUpdate = true;
    wheels.current.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh
      ref={wheels}
      args={[undefined, undefined, TRAIN_WHEEL_POSITIONS.length]}
      raycast={() => undefined}
    >
      <cylinderGeometry args={[0.115, 0.115, 0.065, 8]} />
      <meshStandardMaterial
        color={COLORS.trainDark}
        metalness={0.72}
        roughness={0.42}
      />
    </instancedMesh>
  );
}

function RailTrain() {
  return (
    <group>
      <TrainBodyInstances />
      <BoxInstances
        items={TRAIN_LOWER_BOXES}
        color={COLORS.trainLower}
        metalness={0.62}
        roughness={0.36}
      />
      <BoxInstances
        items={TRAIN_DARK_BOXES}
        color={COLORS.trainDark}
        metalness={0.6}
        roughness={0.4}
      />
      <BoxInstances
        items={TRAIN_GLOWING_WINDOWS}
        color="#2c718b"
        emissive={COLORS.trainWindow}
        emissiveIntensity={1.75}
        metalness={0.12}
        roughness={0.24}
      />
      <BoxInstances
        items={TRAIN_BLUE_STRIPS}
        color={COLORS.blueDeep}
        emissive={COLORS.blue}
        emissiveIntensity={2.4}
        metalness={0.18}
        roughness={0.22}
      />
      <TrainWheelInstances />
      <mesh position={[-1.94, 0.535, 0]} raycast={() => undefined}>
        <boxGeometry args={[6.12, 0.025, 0.76]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={COLORS.blue}
          depthWrite={false}
          opacity={0.16}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function MovingTrain({
  active,
  centerline,
  laneZ,
  phase,
}: {
  active: boolean;
  centerline: THREE.CatmullRomCurve3;
  laneZ: number;
  phase: number;
}) {
  const train = useRef<THREE.Group>(null);
  const motionSamples = useMemo(() => {
    const sampleCount = 160;
    return Array.from({ length: sampleCount + 1 }, (_, index) => {
      const progress = index / sampleCount;
      const point = sampleOffset(centerline, progress, laneZ);
      const tangent = centerline.getTangentAt(progress);
      return {
        rotationY: -Math.atan2(tangent.z, tangent.x),
        x: point.x,
        z: point.z,
      };
    });
  }, [centerline, laneZ]);
  const initialSample = motionSamples[0];

  useFrame(({ clock }) => {
    if (!active || !train.current) return;
    const cycleDuration = 31;
    const travelDuration = 23;
    const cycleTime = (clock.getElapsedTime() + phase) % cycleDuration;
    const visible = cycleTime <= travelDuration;

    train.current.visible = visible;
    if (!visible) return;
    const progress = cycleTime / travelDuration;
    const scaledIndex = progress * (motionSamples.length - 1);
    const startIndex = Math.min(Math.floor(scaledIndex), motionSamples.length - 2);
    const mix = scaledIndex - startIndex;
    const start = motionSamples[startIndex];
    const end = motionSamples[startIndex + 1];
    train.current.position.set(
      THREE.MathUtils.lerp(start.x, end.x, mix),
      0,
      THREE.MathUtils.lerp(start.z, end.z, mix),
    );
    train.current.rotation.y = THREE.MathUtils.lerp(
      start.rotationY,
      end.rotationY,
      mix,
    );
  });

  return (
    <group
      ref={train}
      position={[initialSample.x, 0, initialSample.z]}
      rotation-y={initialSample.rotationY}
      visible={active && phase <= 23}
    >
      <RailTrain />
    </group>
  );
}

function ParkedTrain({
  centerline,
  laneZ,
}: {
  centerline: THREE.CatmullRomCurve3;
  laneZ: number;
}) {
  const placement = useMemo(() => {
    const progress = 0.22;
    const point = sampleOffset(centerline, progress, laneZ);
    const tangent = centerline.getTangentAt(progress);
    return {
      position: [point.x, 0, point.z] as Vec3,
      rotationY: -Math.atan2(tangent.z, tangent.x),
    };
  }, [centerline, laneZ]);

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <RailTrain />
    </group>
  );
}

export default function UnionRailCorridor({
  active = true,
  reducedMotion,
}: {
  active?: boolean;
  reducedMotion: boolean;
}) {
  const centerline = useMemo(() => makeCenterline(), []);

  return (
    <group>
      <BridgeDeck centerline={centerline} />
      <StationPortal centerline={centerline} />
      <SignalGantry centerline={centerline} greenTrack={0} progress={0.17} />
      <SignalGantry centerline={centerline} greenTrack={1} progress={0.5} />
      <SignalGantry centerline={centerline} greenTrack={0} progress={0.82} />

      {reducedMotion ? (
        <ParkedTrain centerline={centerline} laneZ={TRACK_Z[0]} />
      ) : (
        <MovingTrain
          active={active}
          centerline={centerline}
          laneZ={TRACK_Z[0]}
          phase={0}
        />
      )}
    </group>
  );
}
