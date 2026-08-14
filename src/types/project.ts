// Comprehensive TypeScript types for Township Planning Maker

export type LengthUnit = 'meters' | 'feet';

export type ToolMode =
  | 'select'
  | 'site'
  | 'road'
  | 'plot'
  | 'building'
  | 'landscape'
  | 'facility'
  | 'parking'
  | 'infrastructure'
  | 'dimension'
  | 'measure'
  | 'text';

export type RoadType =
  | 'main'
  | 'secondary'
  | 'local'
  | 'service'
  | 'pedestrian'
  | 'cycle';

export type RoadDirection = 'forward' | 'reverse' | 'bidirectional';

export type LandUseType =
  | 'residential'
  | 'commercial'
  | 'mixed_use'
  | 'public'
  | 'institutional'
  | 'open_space'
  | 'industrial';

export type PlotStatus = 'available' | 'reserved' | 'allocated';

export type BuildingType =
  | 'residential'
  | 'apartment'
  | 'commercial'
  | 'school'
  | 'hospital'
  | 'community_center'
  | 'office'
  | 'public_building';

export type LandscapeType =
  | 'park'
  | 'garden'
  | 'playground'
  | 'open_space'
  | 'green_belt';

export type FacilityType =
  | 'school'
  | 'hospital'
  | 'community_center'
  | 'fire_station'
  | 'police_station'
  | 'religious_facility'
  | 'market'
  | 'office';

export type InfraType =
  | 'water_pipe'
  | 'water_tank'
  | 'water_valve'
  | 'water_pump'
  | 'drain'
  | 'manhole'
  | 'outfall';

export type DimensionType = 'linear' | 'horizontal' | 'vertical';

export type TreeType = 'canopy' | 'palm' | 'evergreen' | 'ornamental';

export type Point2D = [number, number]; // [x, y] in site meters

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Setbacks {
  front: number;
  rear: number;
  left: number;
  right: number;
}

// Entity Interfaces

export interface BaseEntity {
  id: string;
  type: string;
  name?: string;
  layer: string;
  locked?: boolean;
}

export interface SiteEntity {
  name: string;
  boundary: Point2D[]; // Polygon vertices
  units: LengthUnit;
  width?: number; // for rectangular preset
  height?: number;
}

export interface RoadEntity extends BaseEntity {
  type: 'road';
  roadType: RoadType;
  name: string;
  width: number; // in meters (e.g. 12 for main, 8 for secondary)
  points: Point2D[]; // Centerline vertices
  surface?: string;
  direction?: RoadDirection;
  laneCount?: number;
}

export interface PlotEntity extends BaseEntity {
  type: 'plot';
  number: string; // e.g. "P-01"
  landUse: LandUseType;
  polygon: Point2D[];
  status?: PlotStatus;
  frontage?: number;
  depth?: number;
  notes?: string;
}

export interface BuildingEntity extends BaseEntity {
  type: 'building';
  buildingType: BuildingType;
  position: { x: number; y: number }; // Center or top-left position
  width: number;
  depth: number;
  rotation: number; // in degrees
  floors?: number;
  height?: number;
  plotId?: string; // Associated plot ID if assigned
  setbacks?: Setbacks;
  showSetback?: boolean;
}

export interface ParkEntity extends BaseEntity {
  type: 'park';
  landscapeType: LandscapeType;
  name: string;
  polygon: Point2D[];
}

export interface FacilityEntity extends BaseEntity {
  type: 'facility';
  facilityType: FacilityType;
  name: string;
  position: { x: number; y: number };
  width: number;
  depth: number;
  rotation: number;
}

export interface ParkingEntity extends BaseEntity {
  type: 'parking';
  name: string;
  polygon: Point2D[];
  bayOrientation?: 'perpendicular' | 'angled' | 'parallel';
  capacity?: number; // Calculated or manual
}

export interface FootpathEntity extends BaseEntity {
  type: 'footpath';
  name?: string;
  width: number;
  points: Point2D[];
}

export interface TreeEntity extends BaseEntity {
  type: 'tree';
  treeType: TreeType;
  position: { x: number; y: number };
  diameter: number; // Canopy diameter in meters (e.g. 4m to 8m)
}

export interface StreetLightEntity extends BaseEntity {
  type: 'street_light';
  position: { x: number; y: number };
  height?: number;
  roadId?: string;
}

export interface InfrastructureEntity extends BaseEntity {
  type: 'infrastructure';
  infraType: InfraType;
  name: string;
  points?: Point2D[]; // for pipes and drains
  position?: { x: number; y: number }; // for tanks, valves, manholes, outfalls
  diameter?: number; // for manholes/tanks
  flowDirection?: 'forward' | 'reverse';
}

export interface TextEntity extends BaseEntity {
  type: 'text';
  text: string;
  position: Point2D;
  fontSize: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  rotation?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface DimensionEntity extends BaseEntity {
  type: 'dimension';
  dimensionType: DimensionType;
  startPoint: Point2D;
  endPoint: Point2D;
  offset: number; // Perpendicular offset from line in meters
  customLabel?: string; // Optional override, default computed distance
}

export interface NorthArrowEntity {
  position: Point2D;
  rotation: number; // in degrees (0 = north up)
  scale: number;
  visible: boolean;
}

export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  color: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  units: LengthUnit;
  north: number;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  scale?: string; // e.g. "1:500"
  page: {
    size: 'A4';
    orientation: 'landscape' | 'portrait';
  };
}

export interface TownshipProject {
  version: '1.0';
  project: ProjectMetadata;
  site: SiteEntity;
  roads: RoadEntity[];
  plots: PlotEntity[];
  buildings: BuildingEntity[];
  parks: ParkEntity[];
  facilities: FacilityEntity[];
  parking: ParkingEntity[];
  footpaths?: FootpathEntity[];
  trees?: TreeEntity[];
  streetLights?: StreetLightEntity[];
  infrastructure: InfrastructureEntity[];
  annotations: TextEntity[];
  dimensions: DimensionEntity[];
  northArrow?: NorthArrowEntity;
  layers: LayerConfig[];
}

export interface SnapTarget {
  point: Point2D;
  type: 'endpoint' | 'midpoint' | 'center' | 'grid' | 'intersection' | 'corner';
  description?: string;
}

export interface ProjectStats {
  siteArea: number;
  sitePerimeter: number;
  roadArea: number;
  roadLength: number;
  residentialArea: number;
  commercialArea: number;
  mixedUseArea: number;
  publicArea: number;
  openSpaceArea: number;
  openSpacePercentage: number;
  builtUpArea: number;
  builtUpPercentage: number;
  plotCount: number;
  buildingCount: number;
  parkingSpaces: number;
  treeCount: number;
  infraLength: number;
}
