"use client";

import { Html, PerformanceMonitor } from "@react-three/drei";
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
import ClimbingGymDetailed from "./three/ClimbingGymDetailed";
import ClimbingGymSurroundings from "./three/ClimbingGymSurroundings";
import BrickHouseStreet from "./three/BrickHouseStreet";
import ChinatownBuilding from "./three/ChinatownBuilding";
import {
  CNRogersPlaza,
  CNTowerDetailed,
  RogersCentreDetailed,
} from "./three/CNTowerRogersCentreDetailed";
import CoastalGround, {
  CN_ROGERS_DIVIDER_X,
  COASTAL_ROAD_SETBACK,
  WATERFRONT_STREET_X,
  shorelineZAtX,
} from "./three/CoastalGround";
import EatonCentreDetailed from "./three/EatonCentreDetailed";
import GlassApartmentDetailed from "./three/GlassApartmentDetailed";
import McDonaldsDetailed from "./three/McDonaldsDetailed";
import NeighbourApartmentTTC from "./three/NeighbourApartmentTTC";
import ShopifyFrontPark from "./three/ShopifyFrontPark";
import ShopifyOfficeDetailed from "./three/ShopifyOfficeDetailed";
import UofTCampusDetailed from "./three/UofTCampusDetailed";
import UnionRailCorridor from "./three/UnionRailCorridor";
import UnionStationDetailed from "./three/UnionStationDetailed";
import YongeDundasCineplex from "./three/YongeDundasCineplex";

type CitySceneProps = {
  selected: DestinationId | null;
  hovered: DestinationId | null;
  onSelect: (id: DestinationId) => void;
  onHover: (id: DestinationId | null) => void;
  reducedMotion: boolean;
};

type Point = readonly [number, number, number];
type Point2 = readonly [number, number];

const MAX_SCENE_DPR = 1.45;

function ScenePerformanceGovernor() {
  const setDpr = useThree((state) => state.setDpr);
  const initialDpr = useThree((state) => state.viewport.initialDpr);

  return (
    <PerformanceMonitor
      factor={1}
      iterations={6}
      ms={300}
      step={0.25}
      onChange={({ factor }) => setDpr(1 + (initialDpr - 1) * factor)}
    />
  );
}

const ROGERS_CENTRE_POSITION: Point = [-14.7, 0, 4.65];
const CN_ROGERS_PLAZA_POSITION: Point = [-11, 0, 4.535];
const APARTMENT_POSITION: Point = [1.5, 0, -15.25];
const FORMER_APARTMENT_POSITION: Point = [19, 0, -15.25];
const NEIGHBOUR_APARTMENT_TTC_POSITION: Point = [10.5, 0, -15.25];
const BRICK_HOUSE_STREET_POSITION: Point = [-30.5, 0, -5.5];
const CINEPLEX_POSITION: Point = [1.5, 0, -2.25];
const MCDONALDS_POSITION: Point = [-23, 0, -8.75];
const CHINATOWN_BUILDING_POSITION: Point = [-15, 0, -2.25];
const CLIMBING_GYM_POSITION: Point = [-15, 0, -8.75];
const FORMER_CLIMBING_GYM_POSITION: Point = [-15, 0, -15.25];
const CLIMBING_GYM_BLOCK_DEPTH = 6.5;
const UNION_STATION_POSITION: Point = [1.5, 0, 4.9];
const FORMER_UNION_STATION_POSITION: Point = [1.5, 0, 4.25];
const UNION_RAIL_CORRIDOR_HALF_WIDTH = 1.42;
const UNION_RAIL_CENTERLINE: readonly Point2[] = [
  [5.05, 4.9],
  [6.35, 4.98],
  [10.5, 4.85],
  [15, 4.2],
  [24, 3.1],
  [34.5, 2.45],
  [42, 2.05],
];

type LandmarkDefinition = {
  position: Point;
  labelPosition: Point;
  number: string;
  title: string;
  landmark: string;
};

const LANDMARKS: Record<DestinationId, LandmarkDefinition> = {
  about: {
    position: APARTMENT_POSITION,
    labelPosition: [0, 9, 0],
    number: "01",
    title: "About me",
    landmark: "My apartment",
  },
  education: {
    position: [-7, 0, -15.25],
    labelPosition: [0, 6.15, 0],
    number: "02",
    title: "Education",
    landmark: "UofT campus",
  },
  experience: {
    position: [-23, 0, -2.25],
    labelPosition: [0, 10.15, 0],
    number: "03",
    title: "Experience",
    landmark: "Shopify office",
  },
  market: {
    position: [10.5, 0, -2.25],
    labelPosition: [4.5, 4.1, 0],
    number: "04",
    title: "UofTMarket",
    landmark: "Eaton Centre",
  },
  projects: {
    position: [6, 0, 11.8],
    labelPosition: [0, 3, 1.7],
    number: "05",
    title: "Projects",
    landmark: "Harbourfront",
  },
  hobbies: {
    position: CLIMBING_GYM_POSITION,
    labelPosition: [0, 4.15, 0],
    number: "06",
    title: "Beyond work",
    landmark: "Climbing gym",
  },
  contact: {
    position: UNION_STATION_POSITION,
    labelPosition: [0, 4.5, 0],
    number: "07",
    title: "Contact",
    landmark: "Union Station",
  },
  overview: {
    position: [-7, 0, 4.25],
    labelPosition: [3.5, 12.8, 0],
    number: "08",
    title: "Quick view",
    landmark: "CN Tower",
  },
};

const CINEMATIC_VIEW_DIRECTION = [0.625, 0.403, 0.665] as Point;

function createCinematicView(
  target: Point,
  distance: number,
): { position: Point; target: Point } {
  return {
    position: [
      target[0] + CINEMATIC_VIEW_DIRECTION[0] * distance,
      target[1] + CINEMATIC_VIEW_DIRECTION[1] * distance,
      target[2] + CINEMATIC_VIEW_DIRECTION[2] * distance,
    ],
    target,
  };
}

const DEFAULT_VIEW = {
  position: [31.25, 21.65, 31.25] as Point,
  target: [0, 1.5, -2] as Point,
};

const CAMERA_VIEWS: Record<DestinationId, { position: Point; target: Point }> = {
  about: createCinematicView(
    [APARTMENT_POSITION[0], 4.5, APARTMENT_POSITION[2]],
    18,
  ),
  education: createCinematicView([-7, 2.1, -15.25], 14.5),
  experience: createCinematicView([-23, 4.9, -2.25], 20),
  market: createCinematicView([15, 1.85, -2.25], 20),
  projects: createCinematicView([6, 1.4, 11.8], 13),
  hobbies: createCinematicView(
    [CLIMBING_GYM_POSITION[0], 1.65, CLIMBING_GYM_POSITION[2]],
    11.5,
  ),
  contact: createCinematicView(
    [4, 1.55, 4.35],
    16,
  ),
  overview: createCinematicView([-10.25, 6, 4.45], 24),
};

const BLUE = "#48c6ff";
const MIDNIGHT = "#020711";

function CameraRig({
  selected,
  reducedMotion,
}: Pick<CitySceneProps, "selected" | "reducedMotion">) {
  const { camera, pointer } = useThree();
  const currentTarget = useRef(new THREE.Vector3(...DEFAULT_VIEW.target));
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const panOffset = useRef(new THREE.Vector3());

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
    const driftStrength = selected ? 0.025 : 0.085;
    const pointerStrength = selected ? 0.055 : 0.12;

    // Pan camera and target together. This preserves the architectural
    // 45-degree view instead of making the city orbit like a game board.
    panOffset.current.set(
      pointer.x * pointerStrength + Math.sin(time * 0.12) * driftStrength,
      pointer.y * pointerStrength * 0.42 +
        Math.sin(time * 0.09) * driftStrength * 0.24,
      pointer.x * pointerStrength * 0.78 +
        Math.sin(time * 0.12) * driftStrength * 0.78,
    );
    desiredPosition.current.fromArray(view.position).add(panOffset.current);
    desiredTarget.current.fromArray(view.target).add(panOffset.current);

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
  protectedSightline: boolean;
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

const ROAD_Z = [-18.5, -12, -5.5, 1] as const;
const ROAD_X = WATERFRONT_STREET_X;
const RAIL_DISTRICT_INLAND_EDGE_Z = ROAD_Z[ROAD_Z.length - 1] + 0.66;
const UOFT_FIELD_ROAD_Z = -12;
const UOFT_FIELD_MIN_X = -10.34;
const UOFT_FIELD_MAX_X = -3.66;
const SHOPIFY_PARK_MIN_X = -26.35;
const SHOPIFY_PARK_MAX_X = -19.65;
const SHOPIFY_PARK_MIN_Z = 1.55;
const SHOPIFY_PARK_MAX_Z = 10.05;
const EATON_CENTRE_MIN_X = 6.65;
const EATON_CENTRE_MAX_X = 23.35;
const EATON_CENTRE_MIN_Z = -5.2;
const EATON_CENTRE_MAX_Z = 0.45;
const EATON_DIVIDER_X = 15;
// Stop at the coastal edge of the z=-5.5 perimeter street so the remaining
// inland road still forms a complete intersection without entering the mall.
const EATON_DIVIDER_ROAD_END_Z = -4.84;
const APARTMENT_BLOCK_MIN_X = -2.55;
const APARTMENT_BLOCK_MAX_X = 5.55;
const APARTMENT_BLOCK_MIN_Z = -18.05;
const APARTMENT_BLOCK_MAX_Z = -5.95;
const NEIGHBOUR_BLOCK_MIN_X = 6.45;
const NEIGHBOUR_BLOCK_MAX_X = 14.55;
const NEIGHBOUR_BLOCK_MIN_Z = -18.05;
const NEIGHBOUR_BLOCK_MAX_Z = -12.45;
const BRICK_HOUSE_BLOCK_MIN_X = -33.55;
const BRICK_HOUSE_BLOCK_MAX_X = -27.45;
const BRICK_HOUSE_BLOCK_CENTERS_Z = [8.45, 4.25, -2.25, -8.75, -15.25] as const;
const CINEPLEX_MIN_X = -1.75;
const CINEPLEX_MAX_X = 4.75;
const CINEPLEX_MIN_Z = -4.75;
const CINEPLEX_MAX_Z = 0.35;
const MCDONALDS_MIN_X = -26.35;
const MCDONALDS_MAX_X = -19.65;
const MCDONALDS_MIN_Z = -11.35;
const MCDONALDS_MAX_Z = -6.15;
const CHINATOWN_BUILDING_MIN_X = -18.35;
const CHINATOWN_BUILDING_MAX_X = -11.65;
const CHINATOWN_BUILDING_MIN_Z = -4.85;
const CHINATOWN_BUILDING_MAX_Z = 0.35;
const CITY_MIN_X = -35;
const CITY_MAX_X = 35;
const CITY_MIN_Z = -22;
const CN_ROGERS_DIVIDER_END_Z = 1.66;
const UNION_RAIL_ROAD_CLEARANCE = 1.72;

function inlandRoadEndX(z: number) {
  let end = CITY_MIN_X;
  for (let x = CITY_MIN_X; x <= CITY_MAX_X; x += 0.25) {
    if (z < shorelineZAtX(x) - COASTAL_ROAD_SETBACK) end = x;
  }
  return end;
}

function horizontalRoadEnd(z: number) {
  // Complete the street across both Eaton Centre blocks and terminate it at
  // the outer edge of the x=24 intersection, immediately before the rail lot.
  return z === 1 ? 24.66 : inlandRoadEndX(z);
}

function horizontalRoadSpans(z: number) {
  const end = horizontalRoadEnd(z);
  if (z !== UOFT_FIELD_ROAD_Z) return [{ start: CITY_MIN_X, end }];

  return [
    { start: CITY_MIN_X, end: UOFT_FIELD_MIN_X },
    { start: UOFT_FIELD_MAX_X, end },
  ].filter((span) => span.end - span.start > 0.5);
}

function verticalRoadEnd(x: number) {
  if (x === CN_ROGERS_DIVIDER_X) return CN_ROGERS_DIVIDER_END_Z;
  return shorelineZAtX(x) - COASTAL_ROAD_SETBACK;
}

function unionRailZAtX(x: number) {
  for (let index = 0; index < UNION_RAIL_CENTERLINE.length - 1; index += 1) {
    const [startX, startZ] = UNION_RAIL_CENTERLINE[index];
    const [endX, endZ] = UNION_RAIL_CENTERLINE[index + 1];
    if (x < Math.min(startX, endX) || x > Math.max(startX, endX)) continue;

    const progress = (x - startX) / (endX - startX);
    return THREE.MathUtils.lerp(startZ, endZ, progress);
  }

  return null;
}

function verticalRoadSpans(x: number) {
  const roadEnd = verticalRoadEnd(x);
  if (x === EATON_DIVIDER_X) {
    const end = Math.min(roadEnd, EATON_DIVIDER_ROAD_END_Z);
    return end - CITY_MIN_Z > 0.5 ? [{ start: CITY_MIN_Z, end }] : [];
  }

  const railZ = unionRailZAtX(x);
  if (railZ === null || railZ <= CITY_MIN_Z || railZ >= roadEnd) {
    return [{ start: CITY_MIN_Z, end: roadEnd }];
  }

  const end = Math.min(
    railZ - UNION_RAIL_ROAD_CLEARANCE,
    RAIL_DISTRICT_INLAND_EDGE_Z,
  );
  return end - CITY_MIN_Z > 0.5 ? [{ start: CITY_MIN_Z, end }] : [];
}

type ProtectionProfile = {
  disk: number;
  corridor: number;
  sightY: number;
  edgeHeight: number;
};

const PROTECTION: Record<DestinationId, ProtectionProfile> = {
  about: { disk: 3.8, corridor: 1.7, sightY: 0.45, edgeHeight: 3 },
  education: { disk: 4.3, corridor: 2.2, sightY: 0.35, edgeHeight: 2 },
  experience: { disk: 4.2, corridor: 1.6, sightY: 0.55, edgeHeight: 3.1 },
  market: { disk: 4.4, corridor: 2, sightY: 0.35, edgeHeight: 1.8 },
  projects: { disk: 5.8, corridor: 2.7, sightY: 0.18, edgeHeight: 0.8 },
  hobbies: { disk: 4.1, corridor: 2.1, sightY: 0.3, edgeHeight: 2 },
  contact: { disk: 5.3, corridor: 2.6, sightY: 0.3, edgeHeight: 1.5 },
  overview: { disk: 3.2, corridor: 1.3, sightY: 0.45, edgeHeight: 1.7 },
};

const CLEARINGS = [
  ...(
    Object.entries(LANDMARKS) as Array<[DestinationId, LandmarkDefinition]>
  ).map(([id, { position }]) => {
    // Keep the procedural skyline anchored to the two former landmark
    // centres. Their deliberate block moves are handled explicitly below so
    // unrelated random buildings do not reshuffle.
    const clearingPosition =
      id === "about"
        ? FORMER_APARTMENT_POSITION
        : id === "hobbies"
        ? FORMER_CLIMBING_GYM_POSITION
        : id === "contact"
          ? FORMER_UNION_STATION_POSITION
          : position;
    return {
      id,
      x: clearingPosition[0],
      z: clearingPosition[2],
      radius: PROTECTION[id].disk,
    };
  }),
  {
    id: "overview" as const,
    x: ROGERS_CENTRE_POSITION[0],
    z: ROGERS_CENTRE_POSITION[2],
    radius: 4.8,
  },
];

function districtProfile(x: number, z: number) {
  const shoreDistance = shorelineZAtX(x) - z;
  if (shoreDistance < 7) return { density: 0.34, maxHeight: 2.15 };
  if (z < -14 || x < -24) return { density: 0.72, maxHeight: 5.4 };
  if (z < -7.6 && x >= -12 && x <= 1) {
    return { density: 0.58, maxHeight: 3 };
  }
  if (x < -12 && z < -5.2) return { density: 0.66, maxHeight: 3.4 };
  if (z >= -5.5 && x >= -12 && x <= 6) {
    return { density: 0.58, maxHeight: 3 };
  }
  if (x > 6 && z < 1.5) return { density: 0.62, maxHeight: 4 };
  if (x > -4.5 && x < 8 && z > -7.8 && z < -0.5) {
    return { density: 0.75, maxHeight: 5.5 };
  }
  return { density: 0.64, maxHeight: 4.7 };
}

function sightlineBodyCap(
  id: DestinationId,
  x: number,
  z: number,
  width: number,
  depth: number,
  rawHeight: number,
  tone: number,
) {
  const landmark =
    id === "hobbies"
      ? FORMER_CLIMBING_GYM_POSITION
      : id === "contact"
        ? FORMER_UNION_STATION_POSITION
        : LANDMARKS[id].position;
  const camera = DEFAULT_VIEW.position;
  const viewX = camera[0] - landmark[0];
  const viewZ = camera[2] - landmark[2];
  const viewLengthSquared = viewX * viewX + viewZ * viewZ;
  const viewLength = Math.sqrt(viewLengthSquared);
  const candidateX = x - landmark[0];
  const candidateZ = z - landmark[2];
  const progress =
    (candidateX * viewX + candidateZ * viewZ) / viewLengthSquared;

  if (progress <= 0 || progress >= 0.88) return Number.POSITIVE_INFINITY;

  const radius = Math.hypot(width, depth) * 0.5;
  const lateralDistance =
    Math.abs(candidateX * viewZ - candidateZ * viewX) / viewLength;
  if (lateralDistance > PROTECTION[id].corridor + radius + 0.32) {
    return Number.POSITIVE_INFINITY;
  }

  const nearestProgress = Math.max(0, progress - radius / viewLength);
  const rayHeight = THREE.MathUtils.lerp(
    PROTECTION[id].sightY,
    camera[1],
    nearestProgress,
  );
  const crownAllowance = tone > 0.88 ? 0.8 : tone > 0.43 ? 0.25 + tone * 0.5 : 0.16;
  const antennaAllowance = tone > 0.84 && rawHeight > 4.2 ? 0.98 : 0;
  return rayHeight - 0.7 - crownAllowance - antennaAllowance;
}

function addBuildingWindows(
  building: Building,
  random: () => number,
  steadyWindows: WindowLight[],
  changingWindows: WindowLight[],
) {
  const { depth, height, width, x, z } = building;
  const floorCount = Math.max(2, Math.floor((height - 0.4) / 0.49));
  const frontColumns = Math.max(2, Math.floor(width / 0.34));
  const sideColumns = Math.max(2, Math.floor(depth / 0.34));

  for (let floor = 0; floor < floorCount; floor += 1) {
    const y = 0.49 + floor * 0.49;

    for (let column = 0; column < frontColumns; column += 1) {
      if (random() < 0.52) continue;
      const light: WindowLight = {
        position: [
          x + ((column + 0.5) / frontColumns - 0.5) * (width - 0.25),
          y,
          z + depth / 2 + 0.012,
        ],
        scale: [0.095, 0.135, 0.012],
        color: random() > 0.24 ? "#f3ba72" : "#72add4",
      };
      (random() < 0.12 ? changingWindows : steadyWindows).push(light);
    }

    for (let column = 0; column < sideColumns; column += 1) {
      if (random() < 0.58) continue;
      const light: WindowLight = {
        position: [
          x + width / 2 + 0.012,
          y,
          z + ((column + 0.5) / sideColumns - 0.5) * (depth - 0.25),
        ],
        scale: [0.012, 0.135, 0.095],
        color: random() > 0.26 ? "#f5c17a" : "#6da7ce",
      };
      (random() < 0.12 ? changingWindows : steadyWindows).push(light);
    }
  }
}

function blocksUnionRailCorridor(building: Building) {
  const buildingRadius = Math.hypot(building.width, building.depth) * 0.5;

  for (let index = 0; index < UNION_RAIL_CENTERLINE.length - 1; index += 1) {
    const [startX, startZ] = UNION_RAIL_CENTERLINE[index];
    const [endX, endZ] = UNION_RAIL_CENTERLINE[index + 1];
    const segmentX = endX - startX;
    const segmentZ = endZ - startZ;
    const segmentLengthSquared = segmentX * segmentX + segmentZ * segmentZ;
    const projection = THREE.MathUtils.clamp(
      ((building.x - startX) * segmentX +
        (building.z - startZ) * segmentZ) /
        segmentLengthSquared,
      0,
      1,
    );
    const nearestX = startX + segmentX * projection;
    const nearestZ = startZ + segmentZ * projection;

    if (
      Math.hypot(building.x - nearestX, building.z - nearestZ) <
      UNION_RAIL_CORRIDOR_HALF_WIDTH + buildingRadius
    ) {
      return true;
    }
  }

  return false;
}

function blocksUofTFrontField(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > UOFT_FIELD_MIN_X &&
    building.x - halfWidth < UOFT_FIELD_MAX_X &&
    building.z + halfDepth > -12.2 &&
    building.z - halfDepth < -6.15
  );
}

function blocksApartmentBlock(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > APARTMENT_BLOCK_MIN_X &&
    building.x - halfWidth < APARTMENT_BLOCK_MAX_X &&
    building.z + halfDepth > APARTMENT_BLOCK_MIN_Z &&
    building.z - halfDepth < APARTMENT_BLOCK_MAX_Z
  );
}

function blocksNeighbourApartmentTTC(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > NEIGHBOUR_BLOCK_MIN_X &&
    building.x - halfWidth < NEIGHBOUR_BLOCK_MAX_X &&
    building.z + halfDepth > NEIGHBOUR_BLOCK_MIN_Z &&
    building.z - halfDepth < NEIGHBOUR_BLOCK_MAX_Z
  );
}

function blocksBrickHouseStreet(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  const overlapsX =
    building.x + halfWidth > BRICK_HOUSE_BLOCK_MIN_X &&
    building.x - halfWidth < BRICK_HOUSE_BLOCK_MAX_X;
  return (
    overlapsX &&
    BRICK_HOUSE_BLOCK_CENTERS_Z.some(
      (blockZ) => Math.abs(building.z - blockZ) < 2.72 + halfDepth,
    )
  );
}

function blocksShopifyFrontPark(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > SHOPIFY_PARK_MIN_X &&
    building.x - halfWidth < SHOPIFY_PARK_MAX_X &&
    building.z + halfDepth > SHOPIFY_PARK_MIN_Z &&
    building.z - halfDepth < SHOPIFY_PARK_MAX_Z
  );
}

function blocksCineplexBlock(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > CINEPLEX_MIN_X &&
    building.x - halfWidth < CINEPLEX_MAX_X &&
    building.z + halfDepth > CINEPLEX_MIN_Z &&
    building.z - halfDepth < CINEPLEX_MAX_Z
  );
}

function blocksMcDonaldsBlock(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > MCDONALDS_MIN_X &&
    building.x - halfWidth < MCDONALDS_MAX_X &&
    building.z + halfDepth > MCDONALDS_MIN_Z &&
    building.z - halfDepth < MCDONALDS_MAX_Z
  );
}

function blocksChinatownBuildingBlock(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > CHINATOWN_BUILDING_MIN_X &&
    building.x - halfWidth < CHINATOWN_BUILDING_MAX_X &&
    building.z + halfDepth > CHINATOWN_BUILDING_MIN_Z &&
    building.z - halfDepth < CHINATOWN_BUILDING_MAX_Z
  );
}

function blocksEatonCentreExpansion(building: Building) {
  const halfWidth = building.width * 0.5;
  const halfDepth = building.depth * 0.5;
  return (
    building.x + halfWidth > EATON_CENTRE_MIN_X &&
    building.x - halfWidth < EATON_CENTRE_MAX_X &&
    building.z + halfDepth > EATON_CENTRE_MIN_Z &&
    building.z - halfDepth < EATON_CENTRE_MAX_Z
  );
}

function createCityData(): CityData {
  const random = mulberry32(8142027);
  const buildings: Building[] = [];
  const steadyWindows: WindowLight[] = [];
  const changingWindows: WindowLight[] = [];
  const discardedRailWindows: WindowLight[] = [];

  for (let z = -22; z <= 9; z += 2.4) {
    for (let x = -34; x <= 32; x += 2.4) {
      const px = x + (random() - 0.5) * 0.72;
      const pz = z + (random() - 0.5) * 0.72;
      const width = 0.82 + random() * 0.78;
      const depth = 0.8 + random() * 0.82;
      const tone = random();
      const candidateRadius = Math.hypot(width, depth) * 0.5;
      const isClear = CLEARINGS.some(
        (clearing) =>
          Math.hypot(px - clearing.x, pz - clearing.z) <
          clearing.radius + candidateRadius + 0.18,
      );
      const streetGap =
        ROAD_X.some((road) => Math.abs(px - road) < 0.78 + width * 0.5) ||
        ROAD_Z.some((road) => Math.abs(pz - road) < 0.76 + depth * 0.5);
      const coastalSetback = pz > shorelineZAtX(px) - 4.65;
      const district = districtProfile(px, pz);

      if (
        isClear ||
        streetGap ||
        coastalSetback ||
        random() > district.density
      ) {
        continue;
      }

      const downtownBias = Math.max(
        0,
        1 - Math.hypot(px + 1, pz + 5) / 28,
      );
      const rawHeight =
        1.15 + random() * 3.85 + downtownBias * downtownBias * random() * 4.8;
      let height = Math.min(
        rawHeight,
        district.maxHeight * THREE.MathUtils.lerp(0.78, 1, tone),
      );

      for (const clearing of CLEARINGS) {
        const distance = Math.hypot(px - clearing.x, pz - clearing.z);
        const ringEnd = clearing.radius + 4.2;
        if (distance < ringEnd) {
          const ringMix = THREE.MathUtils.smoothstep(
            distance,
            clearing.radius,
            ringEnd,
          );
          height = Math.min(
            height,
            THREE.MathUtils.lerp(
              PROTECTION[clearing.id].edgeHeight,
              height,
              ringMix,
            ),
          );
        }
      }

      let protectedSightline = false;
      for (const id of Object.keys(LANDMARKS) as DestinationId[]) {
        const cap = sightlineBodyCap(
          id,
          px,
          pz,
          width,
          depth,
          rawHeight,
          tone,
        );
        if (Number.isFinite(cap) && cap < height) {
          height = cap;
          protectedSightline = true;
        }
      }

      if (height < 1.12) continue;

      const belongsToNewGymBlock =
        px > -18.3 && px < -11.7 && pz > -11.3 && pz < -6.2;
      const building: Building = {
        x: px,
        z: belongsToNewGymBlock ? pz - CLIMBING_GYM_BLOCK_DEPTH : pz,
        width,
        depth,
        height,
        tone,
        protectedSightline,
      };
      if (
        blocksUnionRailCorridor(building) ||
        blocksUofTFrontField(building) ||
        blocksApartmentBlock(building) ||
        blocksNeighbourApartmentTTC(building) ||
        blocksBrickHouseStreet(building) ||
        blocksShopifyFrontPark(building) ||
        blocksCineplexBlock(building) ||
        blocksMcDonaldsBlock(building) ||
        blocksChinatownBuildingBlock(building) ||
        blocksEatonCentreExpansion(building)
      ) {
        // Consume the same deterministic window RNG as before so removing the
        // rail obstructions cannot reshuffle unrelated skyline buildings.
        addBuildingWindows(
          building,
          random,
          discardedRailWindows,
          discardedRailWindows,
        );
        continue;
      }
      buildings.push(building);
      addBuildingWindows(building, random, steadyWindows, changingWindows);
    }
  }

  // These are the three neighboring buildings displaced by the gym's earlier
  // eastward block move. Keeping their original proportions preserves that
  // first swap while the foreground/back-block swap above changes only z.
  const relocatedGymBlock: Building[] = [
    {
      x: -25.24,
      z: -17.16,
      width: 1.24,
      depth: 1.11,
      height: 2.18,
      tone: 0.35,
      protectedSightline: false,
    },
    {
      x: -23.15,
      z: -17.01,
      width: 1.48,
      depth: 0.93,
      height: 1.69,
      tone: 0.624,
      protectedSightline: false,
    },
    {
      x: -22.89,
      z: -15.04,
      width: 0.86,
      depth: 1.5,
      height: 4.76,
      tone: 0.618,
      protectedSightline: false,
    },
  ];
  relocatedGymBlock.forEach((building) => {
    if (blocksUnionRailCorridor(building)) {
      addBuildingWindows(
        building,
        random,
        discardedRailWindows,
        discardedRailWindows,
      );
      return;
    }
    buildings.push(building);
    addBuildingWindows(building, random, steadyWindows, changingWindows);
  });

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
        (building) =>
          !building.protectedSightline &&
          building.tone > 0.43 &&
          building.tone <= 0.88,
      ),
    [buildings],
  );
  const roundCrownBuildings = useMemo(
    () =>
      buildings.filter(
        (building) => !building.protectedSightline && building.tone > 0.88,
      ),
    [buildings],
  );
  const roofEquipment = useMemo<InstanceTransform[]>(
    () =>
      buildings.flatMap((building) => {
        if (building.protectedSightline) return [];
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
        .filter(
          (building) =>
            !building.protectedSightline &&
            building.tone > 0.84 &&
            building.height > 4.2,
        )
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
        .filter(
          (building) =>
            !building.protectedSightline &&
            building.tone > 0.66 &&
            building.height > 3,
        )
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
  const horizontalRoads = useMemo(
    () =>
      ROAD_Z.flatMap((z) =>
        horizontalRoadSpans(z).map(({ end, start }) => ({
          axis: "x" as const,
          center: (start + end) * 0.5,
          fixed: z,
          length: Math.max(0, end - start),
          start,
          end,
        })),
      ),
    [],
  );
  const verticalRoads = useMemo(
    () =>
      ROAD_X.flatMap((x) =>
        verticalRoadSpans(x).map(({ end, start }) => ({
          axis: "z" as const,
          center: (start + end) * 0.5,
          fixed: x,
          length: end - start,
          start,
          end,
        })),
      ),
    [],
  );
  const roadMarkings = useMemo<InstanceTransform[]>(() => {
    const markings: InstanceTransform[] = [];
    horizontalRoads.forEach((road) => {
      for (let x = road.start + 0.8; x <= road.end; x += 1.8) {
        markings.push({
          position: [x, 0.071, road.fixed],
          scale: [0.48, 0.012, 0.015],
        });
      }
    });
    verticalRoads.forEach((road) => {
      for (let z = road.start + 0.8; z <= road.end; z += 1.8) {
        markings.push({
          position: [road.fixed, 0.072, z],
          scale: [0.015, 0.012, 0.48],
        });
      }
    });
    return markings;
  }, [horizontalRoads, verticalRoads]);
  const curbLines = useMemo<InstanceTransform[]>(
    () => [
      ...horizontalRoads.flatMap((road) => [
        {
          position: [road.center, 0.075, road.fixed - 0.66] as Point,
          scale: [road.length, 0.075, 0.08] as Point,
        },
        {
          position: [road.center, 0.075, road.fixed + 0.66] as Point,
          scale: [road.length, 0.075, 0.08] as Point,
        },
      ]),
      ...verticalRoads.flatMap((road) => {
        const curbEnd =
          road.fixed === CN_ROGERS_DIVIDER_X ? 0.34 : road.end;
        const curbLength = curbEnd - road.start;
        const curbCenter = (road.start + curbEnd) * 0.5;
        return [
          {
            position: [road.fixed - 0.66, 0.075, curbCenter] as Point,
            scale: [0.08, 0.075, curbLength] as Point,
          },
          {
            position: [road.fixed + 0.66, 0.075, curbCenter] as Point,
            scale: [0.08, 0.075, curbLength] as Point,
          },
        ];
      }),
    ],
    [horizontalRoads, verticalRoads],
  );
  const crosswalks = useMemo<InstanceTransform[]>(
    () =>
      ROAD_X.flatMap((x) =>
        ROAD_Z.flatMap((z) =>
          z < shorelineZAtX(x) - 4.5 &&
          x <= horizontalRoadEnd(z) &&
          unionRailZAtX(x) === null &&
          !(x === CN_ROGERS_DIVIDER_X && z === 1)
            ? Array.from({ length: 6 }, (_, index) => ({
                position: [x - 0.47 + index * 0.19, 0.094, z + 0.82] as Point,
                scale: [0.055, 0.012, 0.24] as Point,
              }))
            : [],
        ),
      ),
    [],
  );
  const lampPoles = useMemo<InstanceTransform[]>(() => {
    const poles: InstanceTransform[] = [];
    horizontalRoads.forEach((road, roadIndex) => {
      for (let x = road.start + 2; x <= road.end - 1; x += 4.4) {
        const side = (Math.round(x / 4.4) + roadIndex) % 2 === 0 ? -1 : 1;
        poles.push({
          position: [x, 0.56, road.fixed + side * 0.82],
          scale: [0.018, 0.56, 0.018],
        });
      }
    });
    return poles;
  }, [horizontalRoads]);
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
      {horizontalRoads.map((road) => (
        <mesh
          key={`road-z-${road.fixed}-${road.start}`}
          position={[road.center, 0.04, road.fixed]}
          receiveShadow
        >
          <boxGeometry args={[road.length, 0.055, 1.32]} />
          <meshPhysicalMaterial
            clearcoat={0.42}
            clearcoatRoughness={0.3}
            color="#02060c"
            metalness={0}
            roughness={0.38}
          />
        </mesh>
      ))}
      {verticalRoads.map((road) => (
        <mesh
          key={`road-x-${road.fixed}-${road.start}`}
          position={[road.fixed, 0.041, road.center]}
          receiveShadow
        >
          <boxGeometry args={[1.32, 0.055, road.length]} />
          <meshPhysicalMaterial
            clearcoat={0.42}
            clearcoatRoughness={0.3}
            color="#02060c"
            metalness={0}
            roughness={0.38}
          />
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

function MarinaBoat({
  position,
  rotation = 0,
  scale = 1,
  sail = false,
  passengers = false,
}: {
  position: Point;
  rotation?: number;
  scale?: number;
  sail?: boolean;
  passengers?: boolean;
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
      {passengers && (
        <group>
          {[
            { x: -0.11, z: -0.12, shirt: "#4ca6d2" },
            { x: 0.12, z: 0.03, shirt: "#dbe9ee" },
          ].map((person) => (
            <group key={person.x} position={[person.x, 0, person.z]}>
              <mesh position={[0, 0.46, 0]} raycast={() => undefined}>
                <cylinderGeometry args={[0.045, 0.055, 0.18, 8]} />
                <meshStandardMaterial color={person.shirt} roughness={0.72} />
              </mesh>
              <mesh position={[0, 0.59, 0]} raycast={() => undefined}>
                <sphereGeometry args={[0.048, 8, 8]} />
                <meshStandardMaterial color="#b98365" roughness={0.84} />
              </mesh>
            </group>
          ))}
        </group>
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

type TrafficLight = {
  axis: "x" | "z";
  lane: number;
  start: number;
  end: number;
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
      const cycle = (light.phase * 2 + elapsed * light.speed * 2) % 2;
      const progress = cycle <= 1 ? cycle : 2 - cycle;
      const directedProgress = light.direction === 1 ? progress : 1 - progress;
      const horizontalPosition = THREE.MathUtils.lerp(
        light.start,
        light.end,
        directedProgress,
      );
      const verticalPosition = THREE.MathUtils.lerp(
        light.start,
        light.end,
        directedProgress,
      );
      helper.position.set(
        light.axis === "x" ? horizontalPosition : light.lane,
        0.12,
        light.axis === "x" ? light.lane : verticalPosition,
      );
      helper.rotation.set(0, light.axis === "x" ? Math.PI / 2 : 0, 0);
      helper.scale.set(0.08, 0.045, 0.28);
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
      ...ROAD_Z.flatMap((road) =>
        horizontalRoadSpans(road).flatMap(({ end, start }) => [
          {
            axis: "x" as const,
            lane: road - 0.25,
            start: start + 0.55,
            end: end - 0.55,
          },
          {
            axis: "x" as const,
            lane: road + 0.25,
            start: start + 0.55,
            end: end - 0.55,
          },
        ]),
      ),
      ...ROAD_X.filter((x) => x !== CN_ROGERS_DIVIDER_X).flatMap((x) =>
        verticalRoadSpans(x).flatMap(({ end, start }) => [
          {
            axis: "z" as const,
            lane: x - 0.25,
            start: start + 0.55,
            end: end - 0.55,
          },
          {
            axis: "z" as const,
            lane: x + 0.25,
            start: start + 0.55,
            end: end - 0.55,
          },
        ]),
      ),
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
        [-11, 1.1, 1, 7, 0.4, 2],
        [11, 0.8, -6, 8, 0.32, 2.4],
        [8, 0.45, 11, 7, 0.25, 1.8],
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
            opacity={0.006}
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

function Harbourfront({ reducedMotion }: { reducedMotion: boolean }) {
  const boats = useRef<THREE.Group>(null);
  const dockPlankSeams = useMemo<InstanceTransform[]>(
    () => [
      ...Array.from({ length: 14 }, (_, index) => ({
        position: [-2.65 + index * 0.41, 0.307, -1.8] as Point,
        scale: [0.018, 0.014, 1.02] as Point,
      })),
      ...[-1.7, 0, 1.7].flatMap((x) =>
        Array.from({ length: 10 }, (_, index) => ({
          position: [x, 0.187, -1.08 + index * 0.34] as Point,
          scale: [0.29, 0.014, 0.018] as Point,
        })),
      ),
    ],
    [],
  );
  const dockEdgeTrim = useMemo<InstanceTransform[]>(
    () => [
      { position: [0, 0.22, -2.34], scale: [5.82, 0.12, 0.06] },
      { position: [0, 0.22, -1.26], scale: [5.82, 0.12, 0.06] },
      ...[-1.7, 0, 1.7].flatMap((x) => [
        { position: [x - 0.16, 0.115, 0.4] as Point, scale: [0.045, 0.13, 3.35] as Point },
        { position: [x + 0.16, 0.115, 0.4] as Point, scale: [0.045, 0.13, 3.35] as Point },
      ]),
    ],
    [],
  );
  const canopyPosts = useMemo<InstanceTransform[]>(
    () =>
      [-1.18, 1.18].flatMap((x) =>
        [-2.05, -1.52].map((z) => ({
          position: [x, 0.61, z] as Point,
          scale: [0.055, 0.61, 0.055] as Point,
        })),
      ),
    [],
  );
  const mooringCleats = useMemo<InstanceTransform[]>(
    () =>
      [-1.7, 0, 1.7].flatMap((x) => [
        { position: [x - 0.11, 0.27, 1.9] as Point, scale: [0.12, 0.08, 0.05] as Point },
        { position: [x + 0.11, 0.27, 1.9] as Point, scale: [0.12, 0.08, 0.05] as Point },
      ]),
    [],
  );

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
        <meshStandardMaterial color="#5a5147" metalness={0.16} roughness={0.76} />
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
      <mesh position={[0, 0.865, -1.78]} raycast={() => undefined}>
        <boxGeometry args={[2.42, 0.035, 0.08]} />
        <meshBasicMaterial color="#8bdfff" opacity={0.72} transparent toneMapped={false} />
      </mesh>
      <DetailInstances items={canopyPosts} color="#77909b" opacity={0.94} />
      {[-1.7, 0, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.09, 0.4]} castShadow>
          <boxGeometry args={[0.3, 0.18, 3.35]} />
          <meshStandardMaterial color="#665548" metalness={0.1} roughness={0.84} />
        </mesh>
      ))}
      <DetailInstances items={dockPlankSeams} color="#2d3132" opacity={0.56} />
      <DetailInstances items={dockEdgeTrim} color="#182830" opacity={0.94} />
      <DetailInstances items={mooringCleats} color="#91a5ad" opacity={0.94} />
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
        <MarinaBoat position={[-2.3, 0.03, 0.18]} rotation={0.08} scale={0.72} sail />
        <MarinaBoat position={[-1.1, 0.03, 1.3]} rotation={-0.06} scale={0.58} />
        <MarinaBoat position={[0.58, 0.03, 0.42]} rotation={0.12} scale={0.76} sail passengers />
        <MarinaBoat position={[1.2, 0.03, 1.48]} rotation={-0.09} scale={0.6} />
        <MarinaBoat position={[2.35, 0.03, 0.22]} rotation={0.05} scale={0.66} sail />
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

function ClimbingGymDistrict() {
  return (
    <group scale={0.66}>
      <ClimbingGymSurroundings />
      <ClimbingGymDetailed includeStreetDetails={false} />
    </group>
  );
}

function UnionStationDistrict({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  return (
    <group>
      <UnionStationDetailed />
      <UnionRailCorridor active={active} reducedMotion={reducedMotion} />
    </group>
  );
}

function Landmarks(props: CitySceneProps) {
  return (
    <group>
      <group position={BRICK_HOUSE_STREET_POSITION}>
        <BrickHouseStreet />
      </group>
      <group position={CINEPLEX_POSITION}>
        <YongeDundasCineplex />
      </group>
      <group position={MCDONALDS_POSITION}>
        <McDonaldsDetailed />
      </group>
      <group position={CHINATOWN_BUILDING_POSITION}>
        <ChinatownBuilding />
      </group>
      <group position={NEIGHBOUR_APARTMENT_TTC_POSITION}>
        <NeighbourApartmentTTC />
      </group>
      <group position={CN_ROGERS_PLAZA_POSITION}>
        <CNRogersPlaza />
      </group>
      <group position={ROGERS_CENTRE_POSITION}>
        <RogersCentreDetailed
          active={!props.selected || props.selected === "overview"}
          reducedMotion={props.reducedMotion}
        />
      </group>
      <InteractiveLandmark id="about" {...props}>
        <GlassApartmentDetailed />
      </InteractiveLandmark>
      <InteractiveLandmark id="education" {...props}>
        <UofTCampusDetailed />
      </InteractiveLandmark>
      <InteractiveLandmark id="experience" {...props}>
        <ShopifyFrontPark />
        <ShopifyOfficeDetailed reducedMotion={props.reducedMotion} />
      </InteractiveLandmark>
      <InteractiveLandmark id="market" {...props}>
        <EatonCentreDetailed />
      </InteractiveLandmark>
      <InteractiveLandmark id="projects" {...props}>
        <Harbourfront reducedMotion={props.reducedMotion} />
      </InteractiveLandmark>
      <InteractiveLandmark id="hobbies" {...props}>
        <ClimbingGymDistrict />
      </InteractiveLandmark>
      <InteractiveLandmark id="contact" {...props}>
        <UnionStationDistrict
          active={!props.selected || props.selected === "contact"}
          reducedMotion={props.reducedMotion}
        />
      </InteractiveLandmark>
      <InteractiveLandmark id="overview" {...props}>
        <CNTowerDetailed
          active={!props.selected || props.selected === "overview"}
          reducedMotion={props.reducedMotion}
        />
      </InteractiveLandmark>
    </group>
  );
}

function CityWorld(props: CitySceneProps) {
  return (
    <>
      {!props.reducedMotion && <ScenePerformanceGovernor />}
      <color attach="background" args={[MIDNIGHT]} />
      <fog attach="fog" args={["#030a15", 60, 135]} />
      <ambientLight color="#6e8eae" intensity={0.34} />
      <hemisphereLight args={["#5b80aa", "#020408", 0.66]} />
      <directionalLight
        castShadow
        color="#b8d5ed"
        intensity={1.25}
        position={[-11, 20, 14]}
        shadow-bias={-0.00035}
        shadow-camera-bottom={-30}
        shadow-camera-far={75}
        shadow-camera-left={-30}
        shadow-camera-near={1}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-mapSize-height={1536}
        shadow-mapSize-width={1536}
        shadow-normalBias={0.035}
      />
      <pointLight color="#247fc7" distance={25} intensity={38} position={[-1, 5, 4.25]} />
      <pointLight color="#e7a45b" distance={13} intensity={22} position={[-7, 4.5, -15.25]} />
      <pointLight color="#48c6ff" distance={14} intensity={21} position={[-23, 5.8, -2.25]} />
      <pointLight
        color="#e2a45c"
        distance={12}
        intensity={18}
        position={[APARTMENT_POSITION[0], 5.6, APARTMENT_POSITION[2]]}
      />
      <pointLight color="#378fbc" distance={16} intensity={20} position={[6, 2.2, 11.8]} />
      <pointLight color="#f0b66f" decay={2} distance={10} intensity={13} position={[-15, 3.2, -14.1]} />

      <CoastalGround reducedMotion={props.reducedMotion} />
      <Streets />
      <ProceduralSkyline reducedMotion={props.reducedMotion} />
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
        far: 140,
        fov: 32,
        near: 0.1,
        position: [...DEFAULT_VIEW.position],
      }}
      dpr={[1, MAX_SCENE_DPR]}
      frameloop={props.reducedMotion ? "demand" : "always"}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
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
