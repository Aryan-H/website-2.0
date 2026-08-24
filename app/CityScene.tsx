"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import type { DestinationId } from "./portfolio-data";

type CitySceneProps = {
  selected: DestinationId | null;
  hovered: DestinationId | null;
  onSelect: (id: DestinationId) => void;
  onHover: (id: DestinationId | null) => void;
  reducedMotion: boolean;
};

type Point = readonly [number, number, number];

type LandmarkDefinition = {
  position: Point;
  labelPosition: Point;
  number: string;
  title: string;
  landmark: string;
};

const LANDMARKS: Record<DestinationId, LandmarkDefinition> = {
  about: {
    position: [11.1, 0, -10.2],
    labelPosition: [0, 9, 0],
    number: "01",
    title: "About me",
    landmark: "My apartment",
  },
  education: {
    position: [-0.6, 0, -11.5],
    labelPosition: [0, 5.5, 0],
    number: "02",
    title: "Education",
    landmark: "UofT campus",
  },
  experience: {
    position: [-13.2, 0, -2.8],
    labelPosition: [0, 9.7, 0],
    number: "03",
    title: "Experience",
    landmark: "Shopify office",
  },
  market: {
    position: [6.8, 0, -4.2],
    labelPosition: [0, 4.1, 0],
    number: "04",
    title: "UofTMarket",
    landmark: "Eaton Centre",
  },
  projects: {
    position: [12.4, 0, 7.7],
    labelPosition: [-1.2, 3.45, 0],
    number: "05",
    title: "Selected projects",
    landmark: "Harbourfront marina",
  },
  hobbies: {
    position: [-8.5, 0, -8.2],
    labelPosition: [0, 4.05, 0],
    number: "06",
    title: "Beyond work",
    landmark: "Climbing gym",
  },
  contact: {
    position: [4.2, 0, 2.5],
    labelPosition: [0, 3.75, 0],
    number: "07",
    title: "Contact",
    landmark: "Union Station",
  },
  overview: {
    position: [-2.2, 0, 1.15],
    labelPosition: [0, 12.8, 0],
    number: "08",
    title: "Quick view",
    landmark: "CN Tower",
  },
};

const DEFAULT_VIEW = {
  position: [0, 22.5, 35] as Point,
  target: [0, 2.4, -1.8] as Point,
};

const CAMERA_VIEWS: Record<DestinationId, { position: Point; target: Point }> = {
  about: {
    position: [18.8, 13, 7],
    target: [11.1, 5, -10.2],
  },
  education: {
    position: [4.8, 8.2, -1.5],
    target: [-0.6, 2.1, -11.5],
  },
  experience: {
    position: [-3.5, 14.5, 14],
    target: [-13.2, 5.5, -2.8],
  },
  market: {
    position: [12.8, 6.6, 5.1],
    target: [6.8, 1.75, -4.2],
  },
  projects: {
    position: [18.4, 7.1, 17.6],
    target: [12.4, 1.2, 7.7],
  },
  hobbies: {
    position: [-2.4, 6.9, 1.8],
    target: [-8.5, 1.7, -8.2],
  },
  contact: {
    position: [10.6, 6.2, 12.8],
    target: [4.2, 1.55, 2.5],
  },
  overview: {
    position: [7.6, 17.8, 22.2],
    target: [-2.2, 5.8, 1.15],
  },
};

const BLUE = "#48c6ff";
const BLUE_GLOW = "#1677ff";
const MIDNIGHT = "#020711";

function CameraRig({
  selected,
  reducedMotion,
}: Pick<CitySceneProps, "selected" | "reducedMotion">) {
  const { camera, pointer } = useThree();
  const currentTarget = useRef(new THREE.Vector3(...DEFAULT_VIEW.target));
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!reducedMotion) return;

    const view = selected ? CAMERA_VIEWS[selected] : DEFAULT_VIEW;
    camera.position.fromArray(view.position);
    currentTarget.current.fromArray(view.target);
    camera.lookAt(currentTarget.current);
    camera.updateMatrixWorld();
  }, [camera, reducedMotion, selected]);

  useFrame(({ clock }, delta) => {
    const view = selected ? CAMERA_VIEWS[selected] : DEFAULT_VIEW;

    if (reducedMotion) {
      camera.position.fromArray(view.position);
      currentTarget.current.fromArray(view.target);
      camera.lookAt(currentTarget.current);
      return;
    }

    const time = clock.getElapsedTime();
    const driftStrength = selected ? 0.08 : 0.28;
    const pointerStrength = selected ? 0.35 : 0.72;

    desiredPosition.current
      .fromArray(view.position)
      .add(
        new THREE.Vector3(
          pointer.x * pointerStrength + Math.sin(time * 0.12) * driftStrength,
          pointer.y * pointerStrength * 0.34 + Math.sin(time * 0.09) * driftStrength * 0.35,
          Math.cos(time * 0.1) * driftStrength,
        ),
      );
    desiredTarget.current
      .fromArray(view.target)
      .add(new THREE.Vector3(pointer.x * 0.18, pointer.y * 0.1, 0));

    const positionDamping = selected ? 2.35 : 1.75;
    camera.position.set(
      THREE.MathUtils.damp(
        camera.position.x,
        desiredPosition.current.x,
        positionDamping,
        delta,
      ),
      THREE.MathUtils.damp(
        camera.position.y,
        desiredPosition.current.y,
        positionDamping,
        delta,
      ),
      THREE.MathUtils.damp(
        camera.position.z,
        desiredPosition.current.z,
        positionDamping,
        delta,
      ),
    );
    currentTarget.current.set(
      THREE.MathUtils.damp(
        currentTarget.current.x,
        desiredTarget.current.x,
        positionDamping,
        delta,
      ),
      THREE.MathUtils.damp(
        currentTarget.current.y,
        desiredTarget.current.y,
        positionDamping,
        delta,
      ),
      THREE.MathUtils.damp(
        currentTarget.current.z,
        desiredTarget.current.z,
        positionDamping,
        delta,
      ),
    );
    camera.lookAt(currentTarget.current);
  });

  return null;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

type Building = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  tone: number;
};

type WindowLight = {
  position: Point;
  scale: Point;
  color: string;
};

type CityData = {
  buildings: Building[];
  steadyWindows: WindowLight[];
  changingWindows: WindowLight[];
};

const ROAD_Z = [-13.8, -7.1, -1.2, 4.8] as const;
const ROAD_X = [-10.3, -4.5, 2.6, 8.55] as const;

const CLEARINGS = (
  Object.entries(LANDMARKS) as Array<[DestinationId, LandmarkDefinition]>
).map(([id, { position }]) => ({
  x: position[0],
  z: position[2],
  radius: id === "projects" ? 4.1 : id === "overview" ? 2.45 : 2.8,
}));

function createCityData(): CityData {
  const random = mulberry32(8142027);
  const buildings: Building[] = [];
  const steadyWindows: WindowLight[] = [];
  const changingWindows: WindowLight[] = [];

  for (let z = -19; z <= 8; z += 2.25) {
    for (let x = -22; x <= 21; x += 2.25) {
      const px = x + (random() - 0.5) * 0.62;
      const pz = z + (random() - 0.5) * 0.62;
      const isClear = CLEARINGS.some(
        (clearing) =>
          Math.hypot(px - clearing.x, pz - clearing.z) < clearing.radius,
      );
      const streetGap =
        ROAD_X.some((road) => Math.abs(px - road) < 0.66) ||
        ROAD_Z.some((road) => Math.abs(pz - road) < 0.62);
      const harbourWater = px > 6.1 && pz > 4.1;
      const shoreline = pz > 6.7 && px > 2.2;

      if (
        isClear ||
        streetGap ||
        shoreline ||
        (harbourWater && random() < 0.94) ||
        random() < 0.12
      ) {
        continue;
      }

      const downtownBias = Math.max(
        0,
        1 - Math.hypot(px - 1.5, pz + 4) / 23,
      );
      const width = 0.95 + random() * 0.9;
      const depth = 0.9 + random() * 0.92;
      const height =
        1.25 + random() * 4.15 + downtownBias * downtownBias * random() * 5.1;
      const building: Building = {
        x: px,
        z: pz,
        width,
        depth,
        height,
        tone: random(),
      };
      buildings.push(building);

      const floorCount = Math.max(2, Math.floor((height - 0.4) / 0.49));
      const frontColumns = Math.max(2, Math.floor(width / 0.34));
      const sideColumns = Math.max(2, Math.floor(depth / 0.34));

      for (let floor = 0; floor < floorCount; floor += 1) {
        const y = 0.49 + floor * 0.49;

        for (let column = 0; column < frontColumns; column += 1) {
          if (random() < 0.38) continue;
          const light: WindowLight = {
            position: [
              px +
                ((column + 0.5) / frontColumns - 0.5) * (width - 0.25),
              y,
              pz + depth / 2 + 0.012,
            ],
            scale: [0.095, 0.135, 0.012],
            color: random() > 0.24 ? "#f3ba72" : "#72add4",
          };
          (random() < 0.12 ? changingWindows : steadyWindows).push(light);
        }

        for (let column = 0; column < sideColumns; column += 1) {
          if (random() < 0.46) continue;
          const light: WindowLight = {
            position: [
              px + width / 2 + 0.012,
              y,
              pz +
                ((column + 0.5) / sideColumns - 0.5) * (depth - 0.25),
            ],
            scale: [0.012, 0.135, 0.095],
            color: random() > 0.26 ? "#f5c17a" : "#6da7ce",
          };
          (random() < 0.12 ? changingWindows : steadyWindows).push(light);
        }
      }
    }
  }

  return { buildings, steadyWindows, changingWindows };
}

function SkylineBuildings({ buildings }: { buildings: Building[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const baseColor = useMemo(() => new THREE.Color("#07111f"), []);
  const highColor = useMemo(() => new THREE.Color("#102945"), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;

    buildings.forEach((building, index) => {
      helper.position.set(building.x, building.height / 2, building.z);
      helper.scale.set(building.width, building.height, building.depth);
      helper.rotation.set(0, 0, 0);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
      mesh.current?.setColorAt(
        index,
        baseColor.clone().lerp(highColor, building.tone * 0.75),
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [baseColor, buildings, helper, highColor]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, buildings.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.58}
        roughness={0.36}
      />
    </instancedMesh>
  );
}

function WindowBatch({
  lights,
  changing = false,
  reducedMotion,
}: {
  lights: WindowLight[];
  changing?: boolean;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;

    lights.forEach((light, index) => {
      helper.position.fromArray(light.position);
      helper.scale.fromArray(light.scale);
      helper.rotation.set(0, 0, 0);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
      mesh.current?.setColorAt(index, new THREE.Color(light.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [helper, lights]);

  useFrame(({ clock }) => {
    if (!changing || reducedMotion || !material.current) return;
    const time = clock.getElapsedTime();
    material.current.opacity =
      0.62 + Math.sin(time * 1.3) * 0.12 + Math.sin(time * 0.37) * 0.08;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, lights.length]}
      frustumCulled={false}
    >
      <boxGeometry />
      <meshBasicMaterial
        ref={material}
        color="#ffffff"
        opacity={changing ? 0.7 : 0.88}
        transparent
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function ProceduralSkyline({ reducedMotion }: { reducedMotion: boolean }) {
  const data = useMemo(() => createCityData(), []);

  return (
    <group>
      <SkylineBuildings buildings={data.buildings} />
      <SkylineArchitecture buildings={data.buildings} />
      <WindowBatch lights={data.steadyWindows} reducedMotion={reducedMotion} />
      <WindowBatch
        lights={data.changingWindows}
        changing
        reducedMotion={reducedMotion}
      />
    </group>
  );
}

type InstanceTransform = {
  position: Point;
  scale: Point;
};

function DetailInstances({
  items,
  color,
  opacity = 1,
}: {
  items: InstanceTransform[];
  color: string;
  opacity?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    items.forEach((item, index) => {
      helper.position.fromArray(item.position);
      helper.scale.fromArray(item.scale);
      helper.rotation.set(0, 0, 0);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [helper, items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]}>
      <boxGeometry />
      <meshBasicMaterial
        color={color}
        opacity={opacity}
        transparent={opacity < 1}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function SkylineArchitecture({ buildings }: { buildings: Building[] }) {
  const crownMesh = useRef<THREE.InstancedMesh>(null);
  const roundCrownMesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const crownBuildings = useMemo(
    () =>
      buildings.filter(
        (building) => building.tone > 0.43 && building.tone <= 0.88,
      ),
    [buildings],
  );
  const roundCrownBuildings = useMemo(
    () => buildings.filter((building) => building.tone > 0.88),
    [buildings],
  );
  const roofEquipment = useMemo<InstanceTransform[]>(
    () =>
      buildings.flatMap((building) => {
        const equipment: InstanceTransform[] = [
          {
            position: [
              building.x + (building.tone - 0.5) * building.width * 0.28,
              building.height + 0.09,
              building.z - building.depth * 0.08,
            ],
            scale: [
              Math.max(0.14, building.width * 0.17),
              0.09,
              Math.max(0.14, building.depth * 0.18),
            ],
          },
        ];

        if (building.tone > 0.72) {
          equipment.push({
            position: [
              building.x - building.width * 0.2,
              building.height + 0.15,
              building.z + building.depth * 0.18,
            ],
            scale: [building.width * 0.12, 0.15, building.depth * 0.1],
          });
        }
        return equipment;
      }),
    [buildings],
  );
  const antennas = useMemo<InstanceTransform[]>(
    () =>
      buildings
        .filter((building) => building.tone > 0.84 && building.height > 4.2)
        .map((building) => ({
          position: [building.x, building.height + 0.48, building.z] as Point,
          scale: [0.018, 0.48, 0.018] as Point,
        })),
    [buildings],
  );
  const antennaBeacons = useMemo<InstanceTransform[]>(
    () =>
      antennas.map((antenna) => ({
        position: [
          antenna.position[0],
          antenna.position[1] + antenna.scale[1] + 0.035,
          antenna.position[2],
        ],
        scale: [0.035, 0.035, 0.035],
      })),
    [antennas],
  );
  const facadeFins = useMemo<InstanceTransform[]>(
    () =>
      buildings
        .filter((building) => building.tone > 0.66 && building.height > 3)
        .flatMap((building) => [
          {
            position: [
              building.x - building.width * 0.29,
              building.height * 0.53,
              building.z + building.depth / 2 + 0.018,
            ] as Point,
            scale: [0.012, building.height * 0.46, 0.018] as Point,
          },
          {
            position: [
              building.x + building.width * 0.29,
              building.height * 0.53,
              building.z + building.depth / 2 + 0.018,
            ] as Point,
            scale: [0.012, building.height * 0.46, 0.018] as Point,
          },
        ]),
    [buildings],
  );

  useLayoutEffect(() => {
    if (!crownMesh.current) return;
    crownBuildings.forEach((building, index) => {
      const crownHeight = 0.25 + building.tone * 0.5;
      helper.position.set(
        building.x,
        building.height + crownHeight / 2,
        building.z,
      );
      helper.scale.set(
        building.width * (0.64 + building.tone * 0.14),
        crownHeight,
        building.depth * (0.62 + building.tone * 0.16),
      );
      helper.rotation.set(0, 0, 0);
      helper.updateMatrix();
      crownMesh.current?.setMatrixAt(index, helper.matrix);
    });
    crownMesh.current.instanceMatrix.needsUpdate = true;
    crownMesh.current.computeBoundingSphere();
  }, [crownBuildings, helper]);

  useLayoutEffect(() => {
    if (!roundCrownMesh.current) return;
    roundCrownBuildings.forEach((building, index) => {
      const crownHeight = 0.42 + building.tone * 0.38;
      helper.position.set(
        building.x,
        building.height + crownHeight / 2,
        building.z,
      );
      helper.scale.set(
        building.width * 0.34,
        crownHeight,
        building.depth * 0.34,
      );
      helper.rotation.set(0, 0, 0);
      helper.updateMatrix();
      roundCrownMesh.current?.setMatrixAt(index, helper.matrix);
    });
    roundCrownMesh.current.instanceMatrix.needsUpdate = true;
    roundCrownMesh.current.computeBoundingSphere();
  }, [helper, roundCrownBuildings]);

  return (
    <group>
      <instancedMesh
        ref={crownMesh}
        args={[undefined, undefined, crownBuildings.length]}
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="#0c1b2b" metalness={0.66} roughness={0.31} />
      </instancedMesh>
      <instancedMesh
        ref={roundCrownMesh}
        args={[undefined, undefined, roundCrownBuildings.length]}
        castShadow
      >
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#102332" metalness={0.7} roughness={0.28} />
      </instancedMesh>
      <DetailInstances items={roofEquipment} color="#192638" opacity={0.96} />
      <DetailInstances items={antennas} color="#6c8293" opacity={0.72} />
      <DetailInstances items={antennaBeacons} color="#ff7669" opacity={0.78} />
      <DetailInstances items={facadeFins} color="#36536c" opacity={0.5} />
    </group>
  );
}

function Streets() {
  const roadMarkings = useMemo<InstanceTransform[]>(() => {
    const markings: InstanceTransform[] = [];
    ROAD_Z.forEach((z) => {
      for (let x = -24; x <= 24; x += 1.6) {
        if (z === 4.8 && x > 2.7) continue;
        markings.push({
          position: [x, 0.037, z],
          scale: [0.46, 0.012, 0.014],
        });
      }
    });
    ROAD_X.forEach((x) => {
      for (let z = -19; z <= 9; z += 1.6) {
        if (x === 8.55 && z > 3.8) continue;
        markings.push({
          position: [x, 0.039, z],
          scale: [0.014, 0.012, 0.46],
        });
      }
    });
    return markings;
  }, []);
  const curbLines = useMemo<InstanceTransform[]>(
    () => [
      ...ROAD_Z.flatMap((z) => [
        {
          position: [z === 4.8 ? -11.5 : 0, 0.048, z - 0.56] as Point,
          scale: [z === 4.8 ? 29 : 51, 0.012, 0.018] as Point,
        },
        {
          position: [z === 4.8 ? -11.5 : 0, 0.048, z + 0.56] as Point,
          scale: [z === 4.8 ? 29 : 51, 0.012, 0.018] as Point,
        },
      ]),
      ...ROAD_X.flatMap((x) => [
        {
          position: [x - 0.56, 0.049, x === 8.55 ? -7.6 : -5] as Point,
          scale: [0.018, 0.012, x === 8.55 ? 22.8 : 29] as Point,
        },
        {
          position: [x + 0.56, 0.049, x === 8.55 ? -7.6 : -5] as Point,
          scale: [0.018, 0.012, x === 8.55 ? 22.8 : 29] as Point,
        },
      ]),
    ],
    [],
  );
  const crosswalks = useMemo<InstanceTransform[]>(
    () =>
      ROAD_X.flatMap((x) =>
        ROAD_Z.flatMap((z) =>
          x === 8.55 && z === 4.8
            ? []
            : Array.from({ length: 5 }, (_, index) => ({
                position: [x - 0.42 + index * 0.21, 0.052, z + 0.76] as Point,
                scale: [0.055, 0.012, 0.22] as Point,
              })),
        ),
      ),
    [],
  );
  const lampPoles = useMemo<InstanceTransform[]>(() => {
    const poles: InstanceTransform[] = [];
    ROAD_Z.forEach((z, roadIndex) => {
      for (let x = -20; x <= 20; x += 4.2) {
        if (z === 4.8 && x > 2.7) continue;
        const side = (Math.round(x / 4.2) + roadIndex) % 2 === 0 ? -1 : 1;
        poles.push({
          position: [x, 0.5, z + side * 0.72],
          scale: [0.018, 0.5, 0.018],
        });
      }
    });
    return poles;
  }, []);
  const lampHeads = useMemo<InstanceTransform[]>(
    () =>
      lampPoles.map((pole) => ({
        position: [pole.position[0], 1.02, pole.position[2]],
        scale: [0.055, 0.025, 0.055],
      })),
    [lampPoles],
  );

  return (
    <group>
      {ROAD_Z.map((z) => (
        <mesh
          key={`road-z-${z}`}
          position={[z === 4.8 ? -11.5 : 0, 0.006, z]}
          receiveShadow
        >
          <boxGeometry args={[z === 4.8 ? 29 : 52, 0.035, 1.2]} />
          <meshStandardMaterial color="#02060c" roughness={0.22} metalness={0.56} />
        </mesh>
      ))}
      {ROAD_X.map((x) => (
        <mesh
          key={`road-x-${x}`}
          position={[x, 0.008, x === 8.55 ? -7.6 : -5]}
          receiveShadow
        >
          <boxGeometry args={[1.2, 0.038, x === 8.55 ? 22.8 : 30]} />
          <meshStandardMaterial color="#02060c" roughness={0.22} metalness={0.56} />
        </mesh>
      ))}
      <DetailInstances items={roadMarkings} color="#466076" opacity={0.45} />
      <DetailInstances items={curbLines} color="#64717a" opacity={0.38} />
      <DetailInstances items={crosswalks} color="#80909a" opacity={0.42} />
      <DetailInstances items={lampPoles} color="#182937" opacity={0.95} />
      <DetailInstances items={lampHeads} color="#ffd095" opacity={0.9} />
    </group>
  );
}

const HARBOUR_BOATS = [
  [7.1, 9.7, -0.18, 0.82, true],
  [9.2, 12.1, 0.24, 0.7, false],
  [11.2, 10.5, -0.08, 0.62, true],
  [14.2, 13.4, 0.18, 0.78, true],
  [16.8, 9.4, -0.34, 0.66, false],
  [19.5, 15.5, 0.08, 0.9, true],
  [21.2, 11.8, -0.12, 0.56, false],
  [8.2, 16.8, 0.16, 0.68, true],
] as const;

function MarinaBoat({
  position,
  rotation = 0,
  scale = 1,
  sail = false,
}: {
  position: Point;
  rotation?: number;
  scale?: number;
  sail?: boolean;
}) {
  return (
    <group position={position} rotation-y={rotation} scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.42, 0.18, 1.16]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, -0.67]} rotation-x={-Math.PI / 2} castShadow>
        <coneGeometry args={[0.3, 0.62, 4]} />
        <meshStandardMaterial color="#cbd3d8" roughness={0.52} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.27, 0.12]}>
        <boxGeometry args={[0.28, 0.2, 0.42]} />
        <meshPhysicalMaterial
          clearcoat={0.65}
          color="#173248"
          metalness={0.36}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[-0.23, 0.2, 0.43]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#f16e64" toneMapped={false} />
      </mesh>
      <mesh position={[0.23, 0.2, 0.43]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#68d8a1" toneMapped={false} />
      </mesh>
      {sail && (
        <>
          <mesh position={[0, 0.82, 0.08]}>
            <cylinderGeometry args={[0.014, 0.018, 1.35, 8]} />
            <meshStandardMaterial color="#aeb8bd" metalness={0.45} roughness={0.42} />
          </mesh>
          <mesh position={[0.13, 0.88, 0.07]} rotation-z={-0.12} scale={[0.22, 0.68, 0.025]}>
            <coneGeometry args={[1, 1.7, 3]} />
            <meshStandardMaterial
              color="#e7e1d5"
              opacity={0.88}
              roughness={0.74}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        </>
      )}
      <mesh position={[-0.18, 0.025, 0.9]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.015, 1.15]} />
        <meshBasicMaterial color="#86cce8" opacity={0.24} transparent />
      </mesh>
      <mesh position={[0.18, 0.025, 0.9]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.015, 1.15]} />
        <meshBasicMaterial color="#86cce8" opacity={0.24} transparent />
      </mesh>
    </group>
  );
}

function WaterSurface({ reducedMotion }: { reducedMotion: boolean }) {
  const shimmer = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!shimmer.current) return;
    shimmer.current.position.x = reducedMotion
      ? 0
      : Math.sin(clock.getElapsedTime() * 0.16) * 1.1;
  });

  return (
    <group>
      <mesh position={[15, 0.012, 12.3]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 17]} />
        <meshPhysicalMaterial
          color="#031526"
          clearcoat={1}
          clearcoatRoughness={0.11}
          metalness={0.62}
          roughness={0.17}
        />
      </mesh>
      <group ref={shimmer} position={[0, 0.032, 0]}>
        {Array.from({ length: 13 }, (_, index) => (
          <mesh
            key={index}
            position={[
              5.4 + (index % 4) * 5.4,
              0.008,
              5.8 + Math.floor(index / 4) * 3.9 + (index % 2) * 0.45,
            ]}
            rotation-x={-Math.PI / 2}
          >
            <planeGeometry args={[2.7 + (index % 3) * 1.2, 0.022]} />
            <meshBasicMaterial
              color={index % 3 === 0 ? "#4a8eb3" : "#1f5272"}
              opacity={0.34}
              transparent
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[15, 0.085, 4.05]}>
        <boxGeometry args={[23.6, 0.15, 0.34]} />
        <meshStandardMaterial color="#27333c" metalness={0.54} roughness={0.44} />
      </mesh>
      <mesh position={[15, 0.14, 4.25]}>
        <boxGeometry args={[23.6, 0.035, 0.045]} />
        <meshBasicMaterial color="#6ca5c1" opacity={0.42} transparent />
      </mesh>
      {HARBOUR_BOATS.map(([x, z, rotation, scale, sail], index) => (
        <MarinaBoat
          key={index}
          position={[x, 0.04, z]}
          rotation={rotation}
          sail={sail}
          scale={scale}
        />
      ))}
    </group>
  );
}

type TrafficLight = {
  axis: "x" | "z";
  lane: number;
  direction: 1 | -1;
  phase: number;
  speed: number;
  red: boolean;
};

function TrafficBatch({
  lights,
  reducedMotion,
  color,
}: {
  lights: TrafficLight[];
  reducedMotion: boolean;
  color: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const elapsed = reducedMotion ? 0 : clock.getElapsedTime();

    lights.forEach((light, index) => {
      const progress = (light.phase + elapsed * light.speed) % 1;
      const value = THREE.MathUtils.lerp(-23, 23, light.direction === 1 ? progress : 1 - progress);
      const verticalPosition = THREE.MathUtils.lerp(
        -18,
        8,
        value / 46 + 0.5,
      );
      const overHarbour =
        (light.axis === "x" && light.lane > 4 && value > 3) ||
        (light.axis === "z" && light.lane > 8 && verticalPosition > 3.8);
      helper.position.set(
        light.axis === "x" ? value : light.lane,
        0.12,
        light.axis === "x" ? light.lane : verticalPosition,
      );
      helper.rotation.set(0, light.axis === "x" ? 0 : Math.PI / 2, 0);
      helper.scale.set(
        overHarbour ? 0 : 0.08,
        overHarbour ? 0 : 0.045,
        overHarbour ? 0 : 0.28,
      );
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, lights.length]}
      frustumCulled={false}
    >
      <boxGeometry />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

function Traffic({ reducedMotion }: { reducedMotion: boolean }) {
  const lights = useMemo<TrafficLight[]>(() => {
    const lanes: TrafficLight[] = [];
    const roadLanes = [
      ...ROAD_Z.flatMap((road) => [
        { axis: "x" as const, lane: road - 0.25 },
        { axis: "x" as const, lane: road + 0.25 },
      ]),
      ...ROAD_X.flatMap((road) => [
        { axis: "z" as const, lane: road - 0.25 },
        { axis: "z" as const, lane: road + 0.25 },
      ]),
    ];
    for (let index = 0; index < 48; index += 1) {
      const road = roadLanes[index % roadLanes.length];
      lanes.push({
        ...road,
        direction: index % 2 === 0 ? 1 : -1,
        phase: (index * 0.173) % 1,
        speed: 0.025 + (index % 5) * 0.004,
        red: index % 3 === 0,
      });
    }
    return lanes;
  }, []);

  return (
    <group>
      <TrafficBatch
        lights={lights.filter((light) => !light.red)}
        reducedMotion={reducedMotion}
        color="#d8f4ff"
      />
      <TrafficBatch
        lights={lights.filter((light) => light.red)}
        reducedMotion={reducedMotion}
        color="#ff705f"
      />
    </group>
  );
}

type RouteAsset = {
  id: DestinationId;
  curve: THREE.CatmullRomCurve3;
  core: THREE.TubeGeometry;
  glow: THREE.TubeGeometry;
};

const ROUTE_BENDS: Record<Exclude<DestinationId, "overview">, Point> = {
  about: [4.5, 0.13, -4.7],
  education: [-1.4, 0.13, -5.8],
  experience: [-7.4, 0.13, -0.7],
  market: [2.7, 0.13, -2.2],
  projects: [6.1, 0.13, 4.2],
  hobbies: [-5.4, 0.13, -3.7],
  contact: [1.1, 0.13, 2.15],
};

function createRoutes(): RouteAsset[] {
  const origin = new THREE.Vector3(
    LANDMARKS.overview.position[0],
    0.13,
    LANDMARKS.overview.position[2],
  );
  return (Object.keys(ROUTE_BENDS) as Array<Exclude<DestinationId, "overview">>).map(
    (id) => {
      const destination = LANDMARKS[id].position;
      const bend = ROUTE_BENDS[id];
      const curve = new THREE.CatmullRomCurve3(
        [
          origin.clone(),
          new THREE.Vector3(...bend),
          new THREE.Vector3(
            THREE.MathUtils.lerp(bend[0], destination[0], 0.55),
            0.13,
            THREE.MathUtils.lerp(bend[2], destination[2], 0.55),
          ),
          new THREE.Vector3(destination[0], 0.13, destination[2]),
        ],
        false,
        "centripetal",
      );
      return {
        id,
        curve,
        core: new THREE.TubeGeometry(curve, 72, 0.026, 6, false),
        glow: new THREE.TubeGeometry(curve, 72, 0.085, 6, false),
      };
    },
  );
}

function RouteSignals({
  routes,
  selected,
  hovered,
  reducedMotion,
}: {
  routes: RouteAsset[];
  selected: DestinationId | null;
  hovered: DestinationId | null;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const signals = useMemo(
    () =>
      routes.flatMap((route, routeIndex) => [
        { route, routeIndex, phase: (routeIndex * 0.137) % 1, speed: 0.055 },
        { route, routeIndex, phase: (0.47 + routeIndex * 0.091) % 1, speed: 0.038 },
      ]),
    [routes],
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const elapsed = reducedMotion ? 0 : clock.getElapsedTime();
    signals.forEach((signal, index) => {
      const progress = (signal.phase + elapsed * signal.speed) % 1;
      signal.route.curve.getPointAt(progress, point);
      const active = selected === signal.route.id || hovered === signal.route.id;
      helper.position.copy(point);
      helper.position.y += 0.025;
      helper.rotation.set(0, 0, 0);
      helper.scale.setScalar(active ? 0.105 : 0.075);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, signals.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color="#b6efff" toneMapped={false} />
    </instancedMesh>
  );
}

function RouteNetwork({
  selected,
  hovered,
  reducedMotion,
}: Pick<CitySceneProps, "selected" | "hovered" | "reducedMotion">) {
  const routes = useMemo(() => createRoutes(), []);

  useEffect(
    () => () => {
      routes.forEach((route) => {
        route.core.dispose();
        route.glow.dispose();
      });
    },
    [routes],
  );

  return (
    <group>
      {routes.map((route) => {
        const active = selected === route.id || hovered === route.id;
        return (
          <group key={route.id}>
            <mesh geometry={route.glow} renderOrder={2}>
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={active ? "#43cfff" : "#0d5fa4"}
                depthWrite={false}
                opacity={active ? 0.34 : 0.16}
                transparent
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={route.core} renderOrder={3}>
              <meshBasicMaterial
                color={active ? "#9ceaff" : BLUE_GLOW}
                opacity={active ? 1 : 0.68}
                transparent
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
      <RouteSignals
        routes={routes}
        selected={selected}
        hovered={hovered}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}

function FogBanks({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.x = reducedMotion
      ? 0
      : Math.sin(clock.getElapsedTime() * 0.075) * 2.2;
    group.current.position.z = reducedMotion
      ? 0
      : Math.cos(clock.getElapsedTime() * 0.055) * 0.7;
  });

  return (
    <group ref={group}>
      {[
        [-11, 1.1, 1, 9, 0.55, 2.5],
        [10, 0.8, -8, 12, 0.45, 3],
        [-3, 1.8, -14, 14, 0.6, 2.7],
        [6, 0.45, 10, 10, 0.34, 2.2],
      ].map(([x, y, z, sx, sy, sz], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          raycast={() => undefined}
        >
          <sphereGeometry args={[1, 16, 8]} />
          <meshBasicMaterial
            color="#6e93b5"
            depthWrite={false}
            opacity={0.022}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function LocationMarker({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const marker = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!marker.current || !material.current) return;
    const pulse = reducedMotion
      ? 1
      : 1 + Math.sin(clock.getElapsedTime() * 2.25) * 0.08;
    marker.current.scale.setScalar(active ? pulse * 1.18 : pulse);
    material.current.opacity = active ? 0.95 : 0.56;
  });

  return (
    <group ref={marker} position={[0, 0.11, 0]}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.42, 0.035, 8, 32]} />
        <meshBasicMaterial
          ref={material}
          color={active ? "#9ceaff" : BLUE}
          opacity={active ? 0.95 : 0.56}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[active ? 0.09 : 0.065, 12, 12]} />
        <meshBasicMaterial color="#d6f7ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function LandmarkLabel({
  definition,
  active,
}: {
  definition: LandmarkDefinition;
  active: boolean;
}) {
  return (
    <Html
      center
      position={definition.labelPosition}
      style={{ pointerEvents: "none", userSelect: "none" }}
      zIndexRange={[20, 0]}
    >
      <div style={{ display: "grid", justifyItems: "center" }}>
        <div
          style={{
            width: 152,
            border: `1px solid ${active ? "rgba(125, 222, 255, 0.78)" : "rgba(109, 181, 219, 0.34)"}`,
            background: active ? "rgba(2, 12, 25, 0.94)" : "rgba(2, 9, 20, 0.78)",
            boxShadow: active
              ? "0 0 26px rgba(33, 149, 255, 0.22), 0 12px 38px rgba(0, 0, 0, 0.48)"
              : "0 10px 30px rgba(0, 0, 0, 0.3)",
            clipPath: "polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)",
            color: "#f3f2ed",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            padding: "7px 14px 8px",
            textAlign: "center",
            textTransform: "uppercase",
            opacity: active ? 1 : 0.78,
            backdropFilter: "blur(9px)",
            transition: "opacity 180ms ease, border-color 180ms ease",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.1em", lineHeight: 1.2 }}>
            {definition.title}
          </div>
          <div
            style={{
              color: active ? "#7fdcff" : "#7ea7bd",
              fontSize: 7,
              letterSpacing: "0.12em",
              marginTop: 3,
            }}
          >
            {definition.number} · {definition.landmark}
          </div>
        </div>
        <span
          style={{
            width: 1,
            height: active ? 25 : 17,
            background: active ? "#7fdcff" : "rgba(83, 158, 196, 0.5)",
            boxShadow: active ? "0 0 9px #3baeff" : "none",
          }}
        />
        <span
          style={{
            width: active ? 5 : 3,
            height: active ? 5 : 3,
            borderRadius: "50%",
            background: active ? "#d6f7ff" : "#6395ae",
            boxShadow: active ? "0 0 11px #57caff" : "none",
          }}
        />
      </div>
    </Html>
  );
}

function InteractiveLandmark({
  id,
  selected,
  hovered,
  onSelect,
  onHover,
  reducedMotion,
  children,
}: CitySceneProps & { id: DestinationId; children: ReactNode }) {
  const definition = LANDMARKS[id];
  const active = selected === id || hovered === id;

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(id);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  };

  return (
    <group
      position={definition.position}
      onClick={handleClick}
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
    >
      <LocationMarker active={active} reducedMotion={reducedMotion} />
      {children}
      <LandmarkLabel active={active} definition={definition} />
    </group>
  );
}

function Beam({
  start,
  end,
  radius,
  color,
}: {
  start: Point;
  end: Point;
  radius: number;
  color: string;
}) {
  const transform = useMemo(() => {
    const startVector = new THREE.Vector3(...start);
    const endVector = new THREE.Vector3(...end);
    const direction = endVector.clone().sub(startVector);
    return {
      position: startVector.add(endVector).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [end, start]);

  return (
    <mesh position={transform.position} quaternion={transform.quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, transform.length, 10]} />
      <meshStandardMaterial color={color} metalness={0.25} roughness={0.55} />
    </mesh>
  );
}

function Beacon({ reducedMotion }: { reducedMotion: boolean }) {
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!material.current || reducedMotion) return;
    material.current.opacity =
      0.55 + Math.max(0, Math.sin(clock.getElapsedTime() * 2.4)) * 0.45;
  });

  return (
    <mesh position={[0, 12.52, 0]}>
      <sphereGeometry args={[0.085, 12, 12]} />
      <meshBasicMaterial
        ref={material}
        color="#ff7669"
        opacity={0.9}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

function CnTower({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <Beam start={[-0.72, 0.05, -0.58]} end={[0, 4.8, 0]} radius={0.19} color="#a7adb2" />
      <Beam start={[0.72, 0.05, -0.58]} end={[0, 4.8, 0]} radius={0.19} color="#a7adb2" />
      <Beam start={[0, 0.05, 0.76]} end={[0, 4.8, 0]} radius={0.19} color="#9da5ab" />
      <mesh position={[0, 5.55, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.43, 5.7, 18]} />
        <meshStandardMaterial color="#b7bdc1" metalness={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[0, 7.88, 0]} castShadow>
        <cylinderGeometry args={[1.08, 0.78, 0.58, 28]} />
        <meshStandardMaterial color="#b8bdc2" metalness={0.26} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7.85, 0]}>
        <cylinderGeometry args={[0.88, 0.9, 0.2, 28]} />
        <meshBasicMaterial color="#62c8f6" toneMapped={false} />
      </mesh>
      <mesh position={[0, 8.26, 0]}>
        <cylinderGeometry args={[0.58, 0.72, 0.32, 24]} />
        <meshStandardMaterial color="#9ea6ad" metalness={0.24} roughness={0.45} />
      </mesh>
      <mesh position={[0, 8.48, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.2, 24]} />
        <meshBasicMaterial color="#ffc16c" opacity={0.9} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 10.39, 0]}>
        <cylinderGeometry args={[0.028, 0.13, 4.06, 12]} />
        <meshStandardMaterial color="#c8cdd0" metalness={0.35} roughness={0.4} />
      </mesh>
      <Beacon reducedMotion={reducedMotion} />
    </group>
  );
}

function ApartmentTower() {
  const windows = useMemo<InstanceTransform[]>(() => {
    const result: InstanceTransform[] = [];
    for (let floor = 0; floor < 9; floor += 1) {
      for (let column = 0; column < 4; column += 1) {
        if (floor === 6 && column === 2) continue;
        result.push({
          position: [-0.9 + column * 0.6, 0.7 + floor * 0.63, 1.23],
          scale: [0.19, 0.2, 0.022],
        });
      }
      for (let column = 0; column < 3; column += 1) {
        result.push({
          position: [
            1.515,
            0.7 + floor * 0.63,
            -0.72 + column * 0.72,
          ],
          scale: [0.022, 0.2, 0.16],
        });
      }
    }
    return result;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.38, 0.15]} castShadow>
        <boxGeometry args={[4.1, 0.76, 3]} />
        <meshStandardMaterial color="#17212c" metalness={0.48} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[3, 6.7, 2.4]} />
        <meshPhysicalMaterial
          clearcoat={0.76}
          clearcoatRoughness={0.19}
          color="#0c1927"
          metalness={0.62}
          roughness={0.28}
        />
      </mesh>
      <DetailInstances items={windows} color="#547594" opacity={0.5} />
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} position={[0, 0.72 + index * 0.92, 1.36]}>
          <boxGeometry args={[3.18, 0.055, 0.34]} />
          <meshStandardMaterial color="#1b2938" roughness={0.42} metalness={0.55} />
        </mesh>
      ))}
      <mesh position={[0.6, 4.49, 1.235]}>
        <boxGeometry args={[0.43, 0.48, 0.034]} />
        <meshBasicMaterial color="#ffd08a" toneMapped={false} />
      </mesh>
      <mesh position={[0.6, 4.49, 1.18]}>
        <planeGeometry args={[0.92, 0.95]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#ffac54"
          depthWrite={false}
          opacity={0.13}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 6.79, 0]}>
        <boxGeometry args={[2.3, 0.18, 1.9]} />
        <meshStandardMaterial color="#17293d" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[0.5, 7.08, -0.18]}>
        <boxGeometry args={[0.62, 0.42, 0.52]} />
        <meshStandardMaterial color="#263340" metalness={0.48} roughness={0.45} />
      </mesh>
      <mesh position={[-0.42, 7.56, 0]}>
        <cylinderGeometry args={[0.018, 0.025, 1.45, 8]} />
        <meshStandardMaterial color="#73818a" metalness={0.62} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.49, 1.54]}>
        <boxGeometry args={[1.5, 0.64, 0.045]} />
        <meshBasicMaterial color="#d6b574" opacity={0.68} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function CareerTower() {
  const bands = useMemo<InstanceTransform[]>(() => {
    const result: InstanceTransform[] = [];
    for (let floor = 0; floor < 14; floor += 1) {
      result.push({
        position: [0, 0.78 + floor * 0.55, 1.63],
        scale: [1.52, 0.018, 0.018],
      });
      result.push({
        position: [1.63, 0.78 + floor * 0.55, 0],
        scale: [0.018, 0.018, 1.52],
      });
    }
    return result;
  }, []);
  const mullions = useMemo<InstanceTransform[]>(
    () =>
      [-1.18, -0.6, 0, 0.6, 1.18].flatMap((x) => [
        {
          position: [x, 4.3, 1.635] as Point,
          scale: [0.014, 3.75, 0.018] as Point,
        },
      ]),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.62, 0.15]} castShadow>
        <boxGeometry args={[4.7, 1.24, 3.65]} />
        <meshStandardMaterial color="#111a22" metalness={0.58} roughness={0.36} />
      </mesh>
      <mesh position={[0, 4.25, 0]} castShadow>
        <boxGeometry args={[3.2, 7.3, 3.2]} />
        <meshPhysicalMaterial
          clearcoat={0.88}
          clearcoatRoughness={0.14}
          color="#071723"
          metalness={0.78}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.42, 8.18, -0.14]} castShadow>
        <boxGeometry args={[2.25, 0.58, 2.3]} />
        <meshStandardMaterial color="#0c1f2a" metalness={0.67} roughness={0.29} />
      </mesh>
      <DetailInstances items={bands} color="#5fa9d0" opacity={0.62} />
      <DetailInstances items={mullions} color="#365f78" opacity={0.68} />
      <mesh position={[0, 8.62, 0]}>
        <boxGeometry args={[2.65, 0.19, 2.65]} />
        <meshBasicMaterial color="#78be43" opacity={0.82} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 7.45, 1.66]}>
        <boxGeometry args={[2.72, 0.98, 0.1]} />
        <meshStandardMaterial color="#071016" metalness={0.48} roughness={0.4} />
      </mesh>
      <Html
        center
        distanceFactor={3.8}
        position={[0, 7.45, 1.73]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        transform
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            width: 180,
            padding: "15px 18px",
            background: "#071016",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <span
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "304.18 / 86.73",
              background: "center / contain no-repeat url('/shopify-logo-inverted.svg')",
            }}
          />
        </div>
      </Html>
      {[-1.45, -0.48, 0.48, 1.45].map((x) => (
        <mesh key={x} position={[x, 0.62, 2.005]}>
          <boxGeometry args={[0.58, 0.72, 0.035]} />
          <meshBasicMaterial color="#9bd5ef" opacity={0.58} transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function UofTCampus() {
  const windows = useMemo<InstanceTransform[]>(
    () =>
      [-2.12, -1.52, -0.92, 0.92, 1.52, 2.12].flatMap((x) => [
        {
          position: [x, 0.72, 1.385] as Point,
          scale: [0.11, 0.27, 0.025] as Point,
        },
        {
          position: [x, 1.22, 1.385] as Point,
          scale: [0.11, 0.22, 0.025] as Point,
        },
      ]),
    [],
  );
  const buttresses = useMemo<InstanceTransform[]>(
    () =>
      [-2.5, -1.75, -1, 1, 1.75, 2.5].map((x) => ({
        position: [x, 0.72, 1.48] as Point,
        scale: [0.08, 0.72, 0.13] as Point,
      })),
    [],
  );

  return (
    <group>
      <mesh position={[0, 0.08, 1.95]}>
        <boxGeometry args={[5.8, 0.12, 1.1]} />
        <meshStandardMaterial color="#27323a" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[5.5, 1.64, 2.75]} />
        <meshStandardMaterial color="#625648" roughness={0.86} />
      </mesh>
      <mesh position={[-1.65, 1.78, 0]} castShadow>
        <coneGeometry args={[1.28, 1.16, 4]} />
        <meshStandardMaterial color="#202c31" roughness={0.78} metalness={0.16} />
      </mesh>
      <mesh position={[1.65, 1.78, 0]} castShadow>
        <coneGeometry args={[1.28, 1.16, 4]} />
        <meshStandardMaterial color="#202c31" roughness={0.78} metalness={0.16} />
      </mesh>
      <mesh position={[0, 1.73, 0.15]} castShadow>
        <boxGeometry args={[1.28, 3.46, 1.55]} />
        <meshStandardMaterial color="#756755" roughness={0.86} />
      </mesh>
      <mesh position={[0, 3.64, 0.15]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[0.92, 1.72, 4]} />
        <meshStandardMaterial color="#17262c" roughness={0.73} metalness={0.14} />
      </mesh>
      <mesh position={[0, 2.27, 0.94]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.27, 0.27, 0.055, 24]} />
        <meshStandardMaterial color="#d0bd96" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.18, 0.94]}>
        <boxGeometry args={[0.42, 0.82, 0.045]} />
        <meshBasicMaterial color="#64a5c5" opacity={0.72} transparent toneMapped={false} />
      </mesh>
      <DetailInstances items={windows} color="#eab978" opacity={0.75} />
      <DetailInstances items={buttresses} color="#83745f" opacity={1} />
      {[-2.7, 2.7].map((x) => (
        <group key={x} position={[x, 0, 1.85]}>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.055, 0.08, 0.56, 8]} />
            <meshStandardMaterial color="#4d3726" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.73, 0]}>
            <coneGeometry args={[0.36, 0.88, 10]} />
            <meshStandardMaterial color="#17372f" roughness={0.88} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EatonCentre() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[5.8, 0.14, 3.65]} />
        <meshStandardMaterial color="#394049" metalness={0.42} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[5.2, 1.45, 3.2]} />
        <meshStandardMaterial color="#202838" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.48, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[1.03, 1.03, 4.7, 18, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#1d4b63"
          metalness={0.28}
          opacity={0.72}
          roughness={0.18}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      {[-2.05, -1.35, -0.68, 0, 0.68, 1.35, 2.05].map((x) => (
        <mesh key={x} position={[x, 1.48, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[1.03, 0.025, 7, 20, Math.PI]} />
          <meshStandardMaterial color="#9aaeb9" metalness={0.52} roughness={0.36} />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 1.62]}>
        <boxGeometry args={[4.5, 0.1, 0.06]} />
        <meshBasicMaterial color="#ff7766" opacity={0.88} transparent toneMapped={false} />
      </mesh>
      {[-1.7, -0.85, 0, 0.85, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.54, 1.64]}>
          <boxGeometry args={[0.56, 0.62, 0.04]} />
          <meshBasicMaterial color={x === 0 ? "#ff9b6b" : "#79c9e9"} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.4, 2.15]} />
        <meshBasicMaterial color="#f3b86b" opacity={0.08} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.92, 0]}>
        <boxGeometry args={[4.8, 0.035, 0.06]} />
        <meshBasicMaterial color="#7cc9e8" opacity={0.72} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function HarbourfrontMarina({ reducedMotion }: { reducedMotion: boolean }) {
  const boats = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!boats.current) return;
    boats.current.position.y = reducedMotion
      ? 0
      : Math.sin(clock.getElapsedTime() * 0.75) * 0.025;
  });

  return (
    <group>
      <mesh position={[0, 0.15, -1.8]} castShadow>
        <boxGeometry args={[5.8, 0.3, 1.1]} />
        <meshStandardMaterial color="#343c40" metalness={0.34} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.58, -1.78]} castShadow>
        <boxGeometry args={[2.7, 0.58, 0.72]} />
        <meshPhysicalMaterial
          clearcoat={0.82}
          color="#0c2a3b"
          metalness={0.42}
          opacity={0.78}
          roughness={0.2}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.93, -1.78]}>
        <boxGeometry args={[3.05, 0.08, 0.94]} />
        <meshStandardMaterial color="#cad1d2" metalness={0.25} roughness={0.48} />
      </mesh>
      {[-1.7, 0, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.09, 0.4]} castShadow>
          <boxGeometry args={[0.22, 0.18, 3.35]} />
          <meshStandardMaterial color="#6c5945" metalness={0.12} roughness={0.8} />
        </mesh>
      ))}
      {[-2.55, -1.7, 0, 1.7, 2.55].map((x) => (
        <group key={x} position={[x, 0, -1.28]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.84, 8]} />
            <meshStandardMaterial color="#263642" metalness={0.55} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.87, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color="#ffd39c" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <group ref={boats}>
        <MarinaBoat position={[-2.25, 0.03, 0.15]} rotation={0.08} scale={0.72} sail />
        <MarinaBoat position={[-1.08, 0.03, 1.22]} rotation={-0.06} scale={0.58} />
        <MarinaBoat position={[0.62, 0.03, 0.35]} rotation={0.12} scale={0.76} sail />
        <MarinaBoat position={[1.16, 0.03, 1.55]} rotation={-0.09} scale={0.6} />
        <MarinaBoat position={[2.35, 0.03, 0.25]} rotation={0.05} scale={0.66} sail />
      </group>
      <mesh position={[2.72, 0.19, 2.1]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshBasicMaterial color="#f36f5e" toneMapped={false} />
      </mesh>
      <mesh position={[2.72, 0.43, 2.1]}>
        <cylinderGeometry args={[0.018, 0.025, 0.48, 8]} />
        <meshStandardMaterial color="#a9b3b8" metalness={0.42} roughness={0.48} />
      </mesh>
    </group>
  );
}

function ClimbingGym() {
  const holds = [
    [-1.55, 0.65, "#ffba55"],
    [-1.05, 1.15, "#58c9ff"],
    [-0.62, 0.48, "#ef6f62"],
    [-0.25, 1.52, "#ffba55"],
    [0.2, 0.82, "#58c9ff"],
    [0.65, 1.7, "#ef6f62"],
    [1.05, 1.05, "#ffba55"],
    [1.48, 0.52, "#58c9ff"],
  ] as const;

  return (
    <group>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[4.1, 2.35, 2.7]} />
        <meshStandardMaterial color="#342c2b" roughness={0.7} metalness={0.18} />
      </mesh>
      <mesh position={[0, 2.43, 0]} rotation-y={Math.PI / 4} scale={[1.85, 0.62, 1.85]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#171e25" roughness={0.62} metalness={0.42} />
      </mesh>
      <mesh position={[0, 1.2, 1.39]} rotation-x={-0.12}>
        <planeGeometry args={[3.6, 1.95]} />
        <meshStandardMaterial color="#5d4f43" roughness={0.88} />
      </mesh>
      {holds.map(([x, y, color], index) => (
        <mesh key={index} position={[x, y, 1.46]} scale={[1.2, 0.78, 0.5]}>
          <sphereGeometry args={[0.105, 8, 6]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function UnionStation() {
  const columns = useMemo(
    () => Array.from({ length: 12 }, (_, index) => -2.65 + index * 0.48),
    [],
  );

  return (
    <group>
      {[-1.55, -1.9, -2.25].map((z) => (
        <group key={z} position={[0, 0.04, z]}>
          <mesh position={[0, 0, -0.055]}>
            <boxGeometry args={[8.9, 0.035, 0.026]} />
            <meshStandardMaterial color="#7a8082" metalness={0.78} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[8.9, 0.035, 0.026]} />
            <meshStandardMaterial color="#7a8082" metalness={0.78} roughness={0.38} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.27, -1.94]}>
        <boxGeometry args={[7.8, 0.09, 1.04]} />
        <meshPhysicalMaterial
          clearcoat={0.8}
          color="#173247"
          metalness={0.38}
          opacity={0.54}
          roughness={0.2}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[6.5, 1.45, 2.45]} />
        <meshStandardMaterial color="#706659" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[6.9, 0.22, 2.75]} />
        <meshStandardMaterial color="#514c46" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0, 2.02, 0]}>
        <boxGeometry args={[3.1, 0.72, 2.15]} />
        <meshStandardMaterial color="#756c5f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.45, 0]} rotation-y={Math.PI / 4} scale={[1.46, 0.48, 1.46]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#343b3e" roughness={0.66} metalness={0.3} />
      </mesh>
      {columns.map((x) => (
        <mesh key={x} position={[x, 0.72, 1.32]}>
          <cylinderGeometry args={[0.075, 0.09, 1.2, 10]} />
          <meshStandardMaterial color="#aaa08f" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 2.08, 1.1]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.27, 0.27, 0.04, 20]} />
        <meshBasicMaterial color="#f3c378" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.56, 1.24]}>
        <boxGeometry args={[0.62, 0.82, 0.05]} />
        <meshBasicMaterial color="#4da5c7" opacity={0.64} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.2, 1.34]}>
        <boxGeometry args={[5.72, 0.035, 0.035]} />
        <meshBasicMaterial color="#e0b978" opacity={0.52} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Landmarks(props: CitySceneProps) {
  return (
    <group>
      <InteractiveLandmark id="about" {...props}>
        <ApartmentTower />
      </InteractiveLandmark>
      <InteractiveLandmark id="education" {...props}>
        <UofTCampus />
      </InteractiveLandmark>
      <InteractiveLandmark id="experience" {...props}>
        <CareerTower />
      </InteractiveLandmark>
      <InteractiveLandmark id="market" {...props}>
        <EatonCentre />
      </InteractiveLandmark>
      <InteractiveLandmark id="projects" {...props}>
        <HarbourfrontMarina reducedMotion={props.reducedMotion} />
      </InteractiveLandmark>
      <InteractiveLandmark id="hobbies" {...props}>
        <ClimbingGym />
      </InteractiveLandmark>
      <InteractiveLandmark id="contact" {...props}>
        <UnionStation />
      </InteractiveLandmark>
      <InteractiveLandmark id="overview" {...props}>
        <CnTower reducedMotion={props.reducedMotion} />
      </InteractiveLandmark>
    </group>
  );
}

function CityWorld(props: CitySceneProps) {
  return (
    <>
      <color attach="background" args={[MIDNIGHT]} />
      <fog attach="fog" args={["#030a15", 23, 64]} />
      <ambientLight color="#6e8eae" intensity={0.34} />
      <hemisphereLight args={["#5b80aa", "#020408", 0.66]} />
      <directionalLight
        castShadow
        color="#b8d5ed"
        intensity={1.25}
        position={[-11, 20, 14]}
        shadow-bias={-0.00035}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <pointLight color="#247fc7" distance={25} intensity={38} position={[-1, 5, 1]} />
      <pointLight color="#e7a45b" distance={13} intensity={22} position={[-0.6, 4.5, -11.5]} />
      <pointLight color="#78be43" distance={11} intensity={17} position={[-13.2, 5.5, -2.8]} />
      <pointLight color="#e2a45c" distance={11} intensity={18} position={[11.1, 5.6, -10.2]} />
      <pointLight color="#378fbc" distance={14} intensity={20} position={[12.4, 2.2, 7.7]} />

      <mesh position={[0, -0.025, -5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[56, 29]} />
        <meshPhysicalMaterial
          clearcoat={0.82}
          clearcoatRoughness={0.2}
          color="#050a11"
          metalness={0.62}
          roughness={0.27}
        />
      </mesh>

      <Streets />
      <WaterSurface reducedMotion={props.reducedMotion} />
      <ProceduralSkyline reducedMotion={props.reducedMotion} />
      <RouteNetwork
        hovered={props.hovered}
        reducedMotion={props.reducedMotion}
        selected={props.selected}
      />
      <Traffic reducedMotion={props.reducedMotion} />
      <Landmarks {...props} />
      <FogBanks reducedMotion={props.reducedMotion} />
      <CameraRig selected={props.selected} reducedMotion={props.reducedMotion} />
    </>
  );
}

export default function CityScene(props: CitySceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{
        far: 100,
        fov: 37,
        near: 0.1,
        position: [...DEFAULT_VIEW.position],
      }}
      dpr={[1, 1.7]}
      frameloop={props.reducedMotion ? "demand" : "always"}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.06;
      }}
      onPointerLeave={() => props.onHover(null)}
      onPointerMissed={() => props.onHover(null)}
      performance={{ min: 0.55 }}
      shadows
    >
      <CityWorld {...props} />
    </Canvas>
  );
}
