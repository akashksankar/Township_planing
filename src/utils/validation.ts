import { z } from 'zod';
import { TownshipProject } from '../types/project';

export const Point2DSchema = z.tuple([z.number(), z.number()]);

export const LengthUnitSchema = z.enum(['meters', 'feet']);

export const RoadTypeSchema = z.enum([
  'main',
  'secondary',
  'local',
  'service',
  'pedestrian',
  'cycle'
]);

export const LandUseTypeSchema = z.enum([
  'residential',
  'commercial',
  'mixed_use',
  'public',
  'institutional',
  'open_space',
  'industrial'
]);

export const BuildingTypeSchema = z.enum([
  'residential',
  'apartment',
  'commercial',
  'school',
  'hospital',
  'community_center',
  'office',
  'public_building'
]);

export const LandscapeTypeSchema = z.enum([
  'park',
  'garden',
  'playground',
  'open_space',
  'green_belt'
]);

export const FacilityTypeSchema = z.enum([
  'school',
  'hospital',
  'community_center',
  'fire_station',
  'police_station',
  'religious_facility',
  'market',
  'office'
]);

export const InfraTypeSchema = z.enum([
  'water_pipe',
  'water_tank',
  'water_valve',
  'water_pump',
  'drain',
  'manhole',
  'outfall'
]);

export const DimensionTypeSchema = z.enum(['linear', 'horizontal', 'vertical']);

export const TreeTypeSchema = z.enum(['canopy', 'palm', 'evergreen', 'ornamental']);

export const SetbacksSchema = z.object({
  front: z.number().min(0).default(0),
  rear: z.number().min(0).default(0),
  left: z.number().min(0).default(0),
  right: z.number().min(0).default(0)
});

export const ProjectMetadataSchema = z.object({
  id: z.string().default('township_project'),
  name: z.string().min(1).default('Green Valley Township'),
  units: LengthUnitSchema.default('meters'),
  north: z.number().default(0),
  author: z.string().optional(),
  createdDate: z.string().optional(),
  modifiedDate: z.string().optional(),
  scale: z.string().default('1:500'),
  page: z.object({
    size: z.literal('A4').default('A4'),
    orientation: z.enum(['landscape', 'portrait']).default('landscape')
  }).default({ size: 'A4', orientation: 'landscape' })
});

export const SiteEntitySchema = z.object({
  name: z.string().default('Site Boundary'),
  boundary: z.array(Point2DSchema).min(3),
  units: LengthUnitSchema.default('meters'),
  width: z.number().optional(),
  height: z.number().optional()
});

export const RoadEntitySchema = z.object({
  id: z.string(),
  type: z.literal('road'),
  roadType: RoadTypeSchema.default('local'),
  name: z.string().default('Road'),
  width: z.number().positive().default(6),
  points: z.array(Point2DSchema).min(2),
  surface: z.string().optional(),
  direction: z.enum(['forward', 'reverse', 'bidirectional']).default('bidirectional'),
  laneCount: z.number().int().min(1).default(2),
  layer: z.string().default('ROADS'),
  locked: z.boolean().optional()
});

export const PlotEntitySchema = z.object({
  id: z.string(),
  type: z.literal('plot'),
  number: z.string().default('P-01'),
  landUse: LandUseTypeSchema.default('residential'),
  polygon: z.array(Point2DSchema).min(3),
  status: z.enum(['available', 'reserved', 'allocated']).default('available'),
  frontage: z.number().optional(),
  depth: z.number().optional(),
  notes: z.string().optional(),
  layer: z.string().default('PLOTS'),
  locked: z.boolean().optional()
});

export const BuildingEntitySchema = z.object({
  id: z.string(),
  type: z.literal('building'),
  buildingType: BuildingTypeSchema.default('residential'),
  name: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  width: z.number().positive().default(15),
  depth: z.number().positive().default(10),
  rotation: z.number().default(0),
  floors: z.number().int().min(1).default(1),
  height: z.number().optional(),
  plotId: z.string().optional(),
  setbacks: SetbacksSchema.optional(),
  showSetback: z.boolean().optional(),
  layer: z.string().default('BUILDINGS'),
  locked: z.boolean().optional()
});

export const ParkEntitySchema = z.object({
  id: z.string(),
  type: z.literal('park'),
  landscapeType: LandscapeTypeSchema.default('park'),
  name: z.string().default('Park'),
  polygon: z.array(Point2DSchema).min(3),
  layer: z.string().default('LANDSCAPE'),
  locked: z.boolean().optional()
});

export const FacilityEntitySchema = z.object({
  id: z.string(),
  type: z.literal('facility'),
  facilityType: FacilityTypeSchema.default('community_center'),
  name: z.string().default('Public Facility'),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  width: z.number().positive().default(20),
  depth: z.number().positive().default(15),
  rotation: z.number().default(0),
  layer: z.string().default('FACILITIES'),
  locked: z.boolean().optional()
});

export const ParkingEntitySchema = z.object({
  id: z.string(),
  type: z.literal('parking'),
  name: z.string().default('Parking Area'),
  polygon: z.array(Point2DSchema).min(3),
  bayOrientation: z.enum(['perpendicular', 'angled', 'parallel']).default('perpendicular'),
  capacity: z.number().int().optional(),
  layer: z.string().default('PARKING'),
  locked: z.boolean().optional()
});

export const FootpathEntitySchema = z.object({
  id: z.string(),
  type: z.literal('footpath'),
  name: z.string().optional(),
  width: z.number().positive().default(1.8),
  points: z.array(Point2DSchema).min(2),
  layer: z.string().default('ROADS'),
  locked: z.boolean().optional()
});

export const TreeEntitySchema = z.object({
  id: z.string(),
  type: z.literal('tree'),
  treeType: TreeTypeSchema.default('canopy'),
  name: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  diameter: z.number().positive().default(5),
  layer: z.string().default('LANDSCAPE'),
  locked: z.boolean().optional()
});

export const StreetLightEntitySchema = z.object({
  id: z.string(),
  type: z.literal('street_light'),
  name: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  height: z.number().optional(),
  roadId: z.string().optional(),
  layer: z.string().default('ROADS'),
  locked: z.boolean().optional()
});

export const InfrastructureEntitySchema = z.object({
  id: z.string(),
  type: z.literal('infrastructure'),
  infraType: InfraTypeSchema.default('water_pipe'),
  name: z.string().default('Utility Line'),
  points: z.array(Point2DSchema).min(2).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  diameter: z.number().optional(),
  flowDirection: z.enum(['forward', 'reverse']).optional(),
  layer: z.string().default('WATER'),
  locked: z.boolean().optional()
});

export const TextEntitySchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  text: z.string().min(1).default('Label'),
  position: Point2DSchema,
  fontSize: z.number().positive().default(12),
  fontFamily: z.string().default('Times New Roman'),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  color: z.string().default('#1e293b'),
  rotation: z.number().default(0),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  layer: z.string().default('ANNOTATIONS'),
  locked: z.boolean().optional()
});

export const DimensionEntitySchema = z.object({
  id: z.string(),
  type: z.literal('dimension'),
  dimensionType: DimensionTypeSchema.default('linear'),
  name: z.string().optional(),
  startPoint: Point2DSchema,
  endPoint: Point2DSchema,
  offset: z.number().default(4),
  customLabel: z.string().optional(),
  layer: z.string().default('DIMENSIONS'),
  locked: z.boolean().optional()
});

export const LayerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1),
  color: z.string().default('#3b82f6')
});

export const NorthArrowEntitySchema = z.object({
  position: Point2DSchema.default([180, 20]),
  rotation: z.number().default(0),
  scale: z.number().default(1),
  visible: z.boolean().default(true)
});

export const TownshipProjectSchema = z.object({
  version: z.literal('1.0').default('1.0'),
  project: ProjectMetadataSchema,
  site: SiteEntitySchema,
  roads: z.array(RoadEntitySchema).default([]),
  plots: z.array(PlotEntitySchema).default([]),
  buildings: z.array(BuildingEntitySchema).default([]),
  parks: z.array(ParkEntitySchema).default([]),
  facilities: z.array(FacilityEntitySchema).default([]),
  parking: z.array(ParkingEntitySchema).default([]),
  footpaths: z.array(FootpathEntitySchema).optional().default([]),
  trees: z.array(TreeEntitySchema).optional().default([]),
  streetLights: z.array(StreetLightEntitySchema).optional().default([]),
  infrastructure: z.array(InfrastructureEntitySchema).default([]),
  annotations: z.array(TextEntitySchema).default([]),
  dimensions: z.array(DimensionEntitySchema).default([]),
  northArrow: NorthArrowEntitySchema.optional(),
  layers: z.array(LayerConfigSchema).default([])
});

/**
 * Validates raw JSON string or object against TownshipProject schema.
 */
export function validateTownshipProject(raw: unknown): {
  success: boolean;
  data?: TownshipProject;
  error?: string;
} {
  try {
    const parsed = TownshipProjectSchema.safeParse(raw);
    if (parsed.success) {
      return { success: true, data: parsed.data as TownshipProject };
    } else {
      const errorMsg = parsed.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      return { success: false, error: errorMsg };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown validation error' };
  }
}
