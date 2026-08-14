import { TownshipProject, LayerConfig } from '../types/project';

export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'SITE', name: 'Site Boundary', visible: true, locked: false, opacity: 1, color: '#0f172a' },
  { id: 'ROADS', name: 'Roads & Paths', visible: true, locked: false, opacity: 1, color: '#475569' },
  { id: 'PLOTS', name: 'Plots & Land Use', visible: true, locked: false, opacity: 1, color: '#0284c7' },
  { id: 'BUILDINGS', name: 'Buildings', visible: true, locked: false, opacity: 1, color: '#e11d48' },
  { id: 'LANDSCAPE', name: 'Parks & Trees', visible: true, locked: false, opacity: 1, color: '#16a34a' },
  { id: 'FACILITIES', name: 'Public Facilities', visible: true, locked: false, opacity: 1, color: '#9333ea' },
  { id: 'PARKING', name: 'Parking Areas', visible: true, locked: false, opacity: 1, color: '#d97706' },
  { id: 'WATER', name: 'Water Supply', visible: true, locked: false, opacity: 0.9, color: '#0284c7' },
  { id: 'DRAINAGE', name: 'Drainage & Sewer', visible: true, locked: false, opacity: 0.9, color: '#7c3aed' },
  { id: 'ANNOTATIONS', name: 'Text & Labels', visible: true, locked: false, opacity: 1, color: '#1e293b' },
  { id: 'DIMENSIONS', name: 'Dimensions', visible: true, locked: false, opacity: 1, color: '#be123c' }
];

export const GREEN_VALLEY_TOWNSHIP: TownshipProject = {
  version: '1.0',
  project: {
    id: 'green-valley',
    name: 'Green Valley Township',
    units: 'meters',
    north: 0,
    author: 'Chief Urban Planner',
    createdDate: '2026-08-14',
    modifiedDate: '2026-08-14',
    scale: '1:500',
    page: {
      size: 'A4',
      orientation: 'landscape'
    }
  },
  site: {
    name: 'Green Valley Master Site',
    units: 'meters',
    width: 200,
    height: 150,
    boundary: [
      [0, 0],
      [200, 0],
      [200, 150],
      [0, 150]
    ]
  },
  roads: [
    {
      id: 'road_main_01',
      type: 'road',
      roadType: 'main',
      name: 'Grand Central Boulevard (12m)',
      width: 12,
      points: [
        [0, 75],
        [200, 75]
      ],
      direction: 'bidirectional',
      laneCount: 4,
      surface: 'Asphalt',
      layer: 'ROADS'
    },
    {
      id: 'road_sec_01',
      type: 'road',
      roadType: 'secondary',
      name: 'North Access Avenue (8m)',
      width: 8,
      points: [
        [65, 0],
        [65, 75]
      ],
      direction: 'bidirectional',
      laneCount: 2,
      surface: 'Asphalt',
      layer: 'ROADS'
    },
    {
      id: 'road_sec_02',
      type: 'road',
      roadType: 'secondary',
      name: 'South Civic Drive (8m)',
      width: 8,
      points: [
        [135, 75],
        [135, 150]
      ],
      direction: 'bidirectional',
      laneCount: 2,
      surface: 'Asphalt',
      layer: 'ROADS'
    }
  ],
  plots: [
    // North-West Sector (Residential P-01 to P-06)
    {
      id: 'plot_p01',
      type: 'plot',
      number: 'P-01',
      landUse: 'residential',
      polygon: [[10, 10], [35, 10], [35, 38], [10, 38]],
      status: 'available',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p02',
      type: 'plot',
      number: 'P-02',
      landUse: 'residential',
      polygon: [[37, 10], [60, 10], [60, 38], [37, 38]],
      status: 'reserved',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p03',
      type: 'plot',
      number: 'P-03',
      landUse: 'residential',
      polygon: [[10, 42], [35, 42], [35, 68], [10, 68]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p04',
      type: 'plot',
      number: 'P-04',
      landUse: 'residential',
      polygon: [[37, 42], [60, 42], [60, 68], [37, 68]],
      status: 'available',
      layer: 'PLOTS'
    },

    // North-East Sector (Residential P-05 to P-10)
    {
      id: 'plot_p05',
      type: 'plot',
      number: 'P-05',
      landUse: 'residential',
      polygon: [[72, 10], [98, 10], [98, 38], [72, 38]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p06',
      type: 'plot',
      number: 'P-06',
      landUse: 'residential',
      polygon: [[100, 10], [125, 10], [125, 38], [100, 38]],
      status: 'available',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p07',
      type: 'plot',
      number: 'P-07',
      landUse: 'residential',
      polygon: [[72, 42], [98, 42], [98, 68], [72, 68]],
      status: 'available',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p08',
      type: 'plot',
      number: 'P-08',
      landUse: 'residential',
      polygon: [[100, 42], [125, 42], [125, 68], [100, 68]],
      status: 'reserved',
      layer: 'PLOTS'
    },

    // Commercial & Mixed-Use East Plots
    {
      id: 'plot_p09',
      type: 'plot',
      number: 'P-09',
      landUse: 'commercial',
      polygon: [[130, 10], [160, 10], [160, 68], [130, 68]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p10',
      type: 'plot',
      number: 'P-10',
      landUse: 'mixed_use',
      polygon: [[165, 10], [192, 10], [192, 68], [165, 68]],
      status: 'available',
      layer: 'PLOTS'
    },

    // South-West Sector (Civic & Residential P-11 to P-16)
    {
      id: 'plot_p11',
      type: 'plot',
      number: 'P-11',
      landUse: 'institutional',
      polygon: [[10, 82], [55, 82], [55, 140], [10, 140]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p12',
      type: 'plot',
      number: 'P-12',
      landUse: 'public',
      polygon: [[60, 82], [95, 82], [95, 140], [60, 140]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p13',
      type: 'plot',
      number: 'P-13',
      landUse: 'residential',
      polygon: [[100, 82], [130, 82], [130, 108], [100, 108]],
      status: 'available',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p14',
      type: 'plot',
      number: 'P-14',
      landUse: 'residential',
      polygon: [[100, 112], [130, 112], [130, 140], [100, 140]],
      status: 'available',
      layer: 'PLOTS'
    },

    // South-East Sector (Residential P-15 to P-20)
    {
      id: 'plot_p15',
      type: 'plot',
      number: 'P-15',
      landUse: 'residential',
      polygon: [[140, 82], [165, 82], [165, 108], [140, 108]],
      status: 'reserved',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p16',
      type: 'plot',
      number: 'P-16',
      landUse: 'residential',
      polygon: [[168, 82], [192, 82], [192, 108], [168, 108]],
      status: 'available',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p17',
      type: 'plot',
      number: 'P-17',
      landUse: 'residential',
      polygon: [[140, 112], [165, 112], [165, 140], [140, 140]],
      status: 'allocated',
      layer: 'PLOTS'
    },
    {
      id: 'plot_p18',
      type: 'plot',
      number: 'P-18',
      landUse: 'residential',
      polygon: [[168, 112], [192, 112], [192, 140], [168, 140]],
      status: 'available',
      layer: 'PLOTS'
    }
  ],
  buildings: [
    {
      id: 'bld_res_01',
      type: 'building',
      buildingType: 'residential',
      name: 'Villa 01',
      position: { x: 15, y: 15 },
      width: 15,
      depth: 14,
      rotation: 0,
      floors: 2,
      plotId: 'plot_p01',
      setbacks: { front: 3, rear: 2, left: 2, right: 2 },
      showSetback: true,
      layer: 'BUILDINGS'
    },
    {
      id: 'bld_res_02',
      type: 'building',
      buildingType: 'residential',
      name: 'Villa 02',
      position: { x: 42, y: 15 },
      width: 14,
      depth: 14,
      rotation: 0,
      floors: 2,
      plotId: 'plot_p02',
      setbacks: { front: 3, rear: 2, left: 2, right: 2 },
      showSetback: false,
      layer: 'BUILDINGS'
    },
    {
      id: 'bld_res_03',
      type: 'building',
      buildingType: 'residential',
      name: 'Villa 03',
      position: { x: 15, y: 47 },
      width: 15,
      depth: 14,
      rotation: 0,
      floors: 2,
      plotId: 'plot_p03',
      setbacks: { front: 3, rear: 2, left: 2, right: 2 },
      showSetback: false,
      layer: 'BUILDINGS'
    },
    {
      id: 'bld_res_05',
      type: 'building',
      buildingType: 'apartment',
      name: 'Oakwood Apartments',
      position: { x: 77, y: 15 },
      width: 16,
      depth: 16,
      rotation: 0,
      floors: 4,
      plotId: 'plot_p05',
      setbacks: { front: 4, rear: 3, left: 3, right: 3 },
      showSetback: true,
      layer: 'BUILDINGS'
    },
    {
      id: 'bld_com_01',
      type: 'building',
      buildingType: 'commercial',
      name: 'Green Plaza Commercial Complex',
      position: { x: 135, y: 16 },
      width: 20,
      depth: 22,
      rotation: 0,
      floors: 3,
      plotId: 'plot_p09',
      setbacks: { front: 5, rear: 4, left: 4, right: 4 },
      showSetback: false,
      layer: 'BUILDINGS'
    },
    {
      id: 'bld_res_17',
      type: 'building',
      buildingType: 'residential',
      name: 'Garden Duplex',
      position: { x: 145, y: 118 },
      width: 15,
      depth: 14,
      rotation: 0,
      floors: 2,
      plotId: 'plot_p17',
      layer: 'BUILDINGS'
    }
  ],
  parks: [
    {
      id: 'park_central',
      type: 'park',
      landscapeType: 'park',
      name: 'Central Eco Park & Green Belt',
      polygon: [
        [165, 18],
        [188, 18],
        [188, 60],
        [165, 60]
      ],
      layer: 'LANDSCAPE'
    }
  ],
  facilities: [
    {
      id: 'fac_school_01',
      type: 'facility',
      facilityType: 'school',
      name: 'Green Valley Community Academy',
      position: { x: 16, y: 92 },
      width: 30,
      depth: 22,
      rotation: 0,
      layer: 'FACILITIES'
    },
    {
      id: 'fac_community_01',
      type: 'facility',
      facilityType: 'community_center',
      name: 'Township Civic Center & Hall',
      position: { x: 66, y: 94 },
      width: 22,
      depth: 18,
      rotation: 0,
      layer: 'FACILITIES'
    }
  ],
  parking: [
    {
      id: 'prk_civic_01',
      type: 'parking',
      name: 'Civic Center Public Parking',
      polygon: [
        [65, 118],
        [90, 118],
        [90, 136],
        [65, 136]
      ],
      bayOrientation: 'perpendicular',
      capacity: 24,
      layer: 'PARKING'
    }
  ],
  footpaths: [
    {
      id: 'fp_north_01',
      type: 'footpath',
      name: 'Boulevard North Walkway',
      width: 2,
      points: [
        [5, 68],
        [195, 68]
      ],
      layer: 'ROADS'
    },
    {
      id: 'fp_south_01',
      type: 'footpath',
      name: 'Boulevard South Walkway',
      width: 2,
      points: [
        [5, 82],
        [195, 82]
      ],
      layer: 'ROADS'
    }
  ],
  trees: [
    { id: 'tr_01', type: 'tree', treeType: 'canopy', position: { x: 168, y: 22 }, diameter: 6, layer: 'LANDSCAPE' },
    { id: 'tr_02', type: 'tree', treeType: 'canopy', position: { x: 176, y: 24 }, diameter: 7, layer: 'LANDSCAPE' },
    { id: 'tr_03', type: 'tree', treeType: 'canopy', position: { x: 184, y: 23 }, diameter: 6, layer: 'LANDSCAPE' },
    { id: 'tr_04', type: 'tree', treeType: 'canopy', position: { x: 170, y: 36 }, diameter: 8, layer: 'LANDSCAPE' },
    { id: 'tr_05', type: 'tree', treeType: 'palm', position: { x: 182, y: 38 }, diameter: 5, layer: 'LANDSCAPE' },
    { id: 'tr_06', type: 'tree', treeType: 'canopy', position: { x: 172, y: 52 }, diameter: 6.5, layer: 'LANDSCAPE' },
    { id: 'tr_07', type: 'tree', treeType: 'evergreen', position: { x: 184, y: 52 }, diameter: 6, layer: 'LANDSCAPE' },
    { id: 'tr_08', type: 'tree', treeType: 'canopy', position: { x: 30, y: 70 }, diameter: 4.5, layer: 'LANDSCAPE' },
    { id: 'tr_09', type: 'tree', treeType: 'canopy', position: { x: 90, y: 70 }, diameter: 4.5, layer: 'LANDSCAPE' },
    { id: 'tr_10', type: 'tree', treeType: 'canopy', position: { x: 150, y: 70 }, diameter: 4.5, layer: 'LANDSCAPE' }
  ],
  streetLights: [
    { id: 'sl_01', type: 'street_light', position: { x: 20, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_02', type: 'street_light', position: { x: 50, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_03', type: 'street_light', position: { x: 80, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_04', type: 'street_light', position: { x: 110, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_05', type: 'street_light', position: { x: 140, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_06', type: 'street_light', position: { x: 170, y: 69 }, roadId: 'road_main_01', layer: 'ROADS' },
    { id: 'sl_07', type: 'street_light', position: { x: 61, y: 20 }, roadId: 'road_sec_01', layer: 'ROADS' },
    { id: 'sl_08', type: 'street_light', position: { x: 61, y: 50 }, roadId: 'road_sec_01', layer: 'ROADS' },
    { id: 'sl_09', type: 'street_light', position: { x: 131, y: 95 }, roadId: 'road_sec_02', layer: 'ROADS' },
    { id: 'sl_10', type: 'street_light', position: { x: 131, y: 125 }, roadId: 'road_sec_02', layer: 'ROADS' }
  ],
  infrastructure: [
    {
      id: 'infra_tank_01',
      type: 'infrastructure',
      infraType: 'water_tank',
      name: 'Elevated Water Reservoir (500kL)',
      position: { x: 185, y: 8 },
      diameter: 8,
      layer: 'WATER'
    },
    {
      id: 'infra_pipe_main',
      type: 'infrastructure',
      infraType: 'water_pipe',
      name: 'Main Potable Water Trunk Ø250mm',
      points: [
        [185, 8],
        [185, 71],
        [10, 71]
      ],
      flowDirection: 'forward',
      layer: 'WATER'
    },
    {
      id: 'infra_drain_main',
      type: 'infrastructure',
      infraType: 'drain',
      name: 'Stormwater Collector Drain 1200mm',
      points: [
        [10, 79],
        [195, 79]
      ],
      flowDirection: 'forward',
      layer: 'DRAINAGE'
    },
    {
      id: 'infra_mh_01',
      type: 'infrastructure',
      infraType: 'manhole',
      name: 'Storm Manhole MH-01',
      position: { x: 30, y: 79 },
      diameter: 1.5,
      layer: 'DRAINAGE'
    },
    {
      id: 'infra_mh_02',
      type: 'infrastructure',
      infraType: 'manhole',
      name: 'Storm Manhole MH-02',
      position: { x: 100, y: 79 },
      diameter: 1.5,
      layer: 'DRAINAGE'
    },
    {
      id: 'infra_mh_03',
      type: 'infrastructure',
      infraType: 'manhole',
      name: 'Storm Manhole MH-03',
      position: { x: 170, y: 79 },
      diameter: 1.5,
      layer: 'DRAINAGE'
    }
  ],
  annotations: [
    {
      id: 'txt_01',
      type: 'text',
      text: 'GRAND CENTRAL BOULEVARD (12m ROW)',
      position: [100, 75],
      fontSize: 10,
      fontFamily: 'Helvetica, Arial, sans-serif',
      bold: true,
      color: '#ffffff',
      alignment: 'center',
      layer: 'ANNOTATIONS'
    },
    {
      id: 'txt_02',
      type: 'text',
      text: 'RESIDENTIAL SECTOR A',
      position: [35, 6],
      fontSize: 9,
      fontFamily: 'Helvetica, Arial, sans-serif',
      bold: true,
      color: '#0369a1',
      alignment: 'center',
      layer: 'ANNOTATIONS'
    },
    {
      id: 'txt_03',
      type: 'text',
      text: 'CIVIC & EDUCATION ZONE',
      position: [50, 86],
      fontSize: 9,
      fontFamily: 'Helvetica, Arial, sans-serif',
      bold: true,
      color: '#7e22ce',
      alignment: 'center',
      layer: 'ANNOTATIONS'
    }
  ],
  dimensions: [
    {
      id: 'dim_site_w',
      type: 'dimension',
      dimensionType: 'horizontal',
      name: 'Site Width',
      startPoint: [0, 0],
      endPoint: [200, 0],
      offset: -6,
      layer: 'DIMENSIONS'
    },
    {
      id: 'dim_site_h',
      type: 'dimension',
      dimensionType: 'vertical',
      name: 'Site Depth',
      startPoint: [0, 0],
      endPoint: [0, 150],
      offset: -6,
      layer: 'DIMENSIONS'
    },
    {
      id: 'dim_road_w',
      type: 'dimension',
      dimensionType: 'vertical',
      name: 'Main Road ROW',
      startPoint: [195, 69],
      endPoint: [195, 81],
      offset: 4,
      layer: 'DIMENSIONS'
    }
  ],
  northArrow: {
    position: [188, 140],
    rotation: 0,
    scale: 1,
    visible: true
  },
  layers: DEFAULT_LAYERS
};
