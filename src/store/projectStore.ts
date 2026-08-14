import { create } from 'zustand';
import {
  TownshipProject,
  ToolMode,
  Point2D,
  RoadType,
  LandUseType,
  BuildingType,
  LandscapeType,
  FacilityType,
  InfraType,
  DimensionType,
  TreeType,
  RoadEntity,
  PlotEntity,
  BuildingEntity,
  ParkEntity,
  FacilityEntity,
  ParkingEntity,
  InfrastructureEntity,
  TextEntity,
  DimensionEntity,
  TreeEntity,
  StreetLightEntity
} from '../types/project';
import { GREEN_VALLEY_TOWNSHIP, DEFAULT_LAYERS } from '../data/exampleProject';
import { getBoundingBox, placePointsAlongPolyline } from '../utils/geometry';

interface ViewTransform {
  zoom: number;
  panX: number;
  panY: number;
}

interface ProjectStoreState {
  project: TownshipProject;
  activeMode: ToolMode;
  selectedId: string | null;
  selectedType: string | null;

  // Tool sub-selections
  subTypeRoad: RoadType;
  subTypeLandUse: LandUseType;
  subTypeBuilding: BuildingType;
  subTypeLandscape: LandscapeType;
  subTypeFacility: FacilityType;
  subTypeInfra: InfraType;
  subTypeDimension: DimensionType;
  subTypeTree: TreeType;

  // Viewport & Editor settings
  transform: ViewTransform;
  showGrid: boolean;
  gridSpacing: number; // 1, 5, 10
  snapToGrid: boolean;
  snapToGeometry: boolean;
  snapTolerance: number;
  showPlotLabels: boolean;
  showDimensions: boolean;

  // Draft drawing state
  draftPoints: Point2D[];
  cursorPos: Point2D;
  measurePoints: Point2D[];

  // Undo / Redo history
  past: TownshipProject[];
  future: TownshipProject[];

  // Actions
  setMode: (mode: ToolMode) => void;
  setSelected: (id: string | null, type: string | null) => void;
  setSubTypeRoad: (t: RoadType) => void;
  setSubTypeLandUse: (t: LandUseType) => void;
  setSubTypeBuilding: (t: BuildingType) => void;
  setSubTypeLandscape: (t: LandscapeType) => void;
  setSubTypeFacility: (t: FacilityType) => void;
  setSubTypeInfra: (t: InfraType) => void;
  setSubTypeDimension: (t: DimensionType) => void;
  setSubTypeTree: (t: TreeType) => void;

  setTransform: (transform: Partial<ViewTransform>) => void;
  resetView: () => void;
  fitToSite: () => void;
  fitToPlan: () => void;

  toggleGrid: () => void;
  setGridSpacing: (spacing: number) => void;
  toggleSnapToGrid: () => void;
  toggleSnapToGeometry: () => void;
  togglePlotLabels: () => void;
  toggleDimensions: () => void;

  setCursorPos: (pos: Point2D) => void;
  addDraftPoint: (point: Point2D) => void;
  setDraftPoints: (points: Point2D[]) => void;
  clearDraft: () => void;
  addMeasurePoint: (point: Point2D) => void;
  clearMeasure: () => void;

  // Project state mutators (with automatic history recording)
  recordHistory: () => void;
  undo: () => void;
  redo: () => void;

  setProject: (project: TownshipProject) => void;
  loadSampleProject: () => void;
  createNewProject: (name?: string, width?: number, height?: number) => void;

  updateProjectMetadata: (meta: Partial<TownshipProject['project']>) => void;
  updateSite: (site: Partial<TownshipProject['site']>) => void;

  // Entity CRUD
  addRoad: (road: Omit<RoadEntity, 'id' | 'type' | 'layer'>) => void;
  updateRoad: (id: string, updates: Partial<RoadEntity>) => void;
  deleteRoad: (id: string) => void;

  addPlot: (plot: Omit<PlotEntity, 'id' | 'type' | 'layer'>) => void;
  updatePlot: (id: string, updates: Partial<PlotEntity>) => void;
  deletePlot: (id: string) => void;
  generatePlotGrid: (rows: number, cols: number, startX: number, startY: number, plotW: number, plotH: number) => void;

  addBuilding: (bld: Omit<BuildingEntity, 'id' | 'type' | 'layer'>) => void;
  updateBuilding: (id: string, updates: Partial<BuildingEntity>) => void;
  deleteBuilding: (id: string) => void;

  addPark: (park: Omit<ParkEntity, 'id' | 'type' | 'layer'>) => void;
  updatePark: (id: string, updates: Partial<ParkEntity>) => void;
  deletePark: (id: string) => void;

  addFacility: (fac: Omit<FacilityEntity, 'id' | 'type' | 'layer'>) => void;
  updateFacility: (id: string, updates: Partial<FacilityEntity>) => void;
  deleteFacility: (id: string) => void;

  addParking: (prk: Omit<ParkingEntity, 'id' | 'type' | 'layer'>) => void;
  updateParking: (id: string, updates: Partial<ParkingEntity>) => void;
  deleteParking: (id: string) => void;

  addTree: (tree: Omit<TreeEntity, 'id' | 'type' | 'layer'>) => void;
  updateTree: (id: string, updates: Partial<TreeEntity>) => void;
  deleteTree: (id: string) => void;

  addStreetLight: (light: Omit<StreetLightEntity, 'id' | 'type' | 'layer'>) => void;
  autoPlaceStreetLightsAlongRoad: (roadId: string, spacing?: number) => void;
  deleteStreetLight: (id: string) => void;

  addInfrastructure: (infra: Omit<InfrastructureEntity, 'id' | 'type' | 'layer'>) => void;
  updateInfrastructure: (id: string, updates: Partial<InfrastructureEntity>) => void;
  deleteInfrastructure: (id: string) => void;

  addAnnotation: (ann: Omit<TextEntity, 'id' | 'type' | 'layer'>) => void;
  updateAnnotation: (id: string, updates: Partial<TextEntity>) => void;
  deleteAnnotation: (id: string) => void;

  addDimension: (dim: Omit<DimensionEntity, 'id' | 'type' | 'layer'>) => void;
  updateDimension: (id: string, updates: Partial<DimensionEntity>) => void;
  deleteDimension: (id: string) => void;

  updateNorthArrow: (updates: Partial<NonNullable<TownshipProject['northArrow']>>) => void;

  // Layer toggles
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerLocked: (layerId: string, locked: boolean) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;

  // Selected item generic actions
  deleteSelected: () => void;
  duplicateSelected: () => void;
  autoArrangeSite: () => void;
}

const STORAGE_KEY = 'township_planning_project_v1';

function loadInitialProject(): TownshipProject {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.site && parsed.roads && parsed.plots) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not load cached project:', e);
  }
  return GREEN_VALLEY_TOWNSHIP;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  project: loadInitialProject(),
  activeMode: 'select',
  selectedId: null,
  selectedType: null,

  subTypeRoad: 'main',
  subTypeLandUse: 'residential',
  subTypeBuilding: 'residential',
  subTypeLandscape: 'park',
  subTypeFacility: 'community_center',
  subTypeInfra: 'water_pipe',
  subTypeDimension: 'linear',
  subTypeTree: 'canopy',

  transform: { zoom: 1, panX: 0, panY: 0 },
  showGrid: true,
  gridSpacing: 5,
  snapToGrid: true,
  snapToGeometry: true,
  snapTolerance: 2.5,
  showPlotLabels: true,
  showDimensions: true,

  draftPoints: [],
  cursorPos: [0, 0],
  measurePoints: [],

  past: [],
  future: [],

  setMode: mode => {
    set({
      activeMode: mode,
      draftPoints: [],
      measurePoints: [],
      selectedId: mode === 'select' ? get().selectedId : null
    });
  },

  setSelected: (id, type) => set({ selectedId: id, selectedType: type }),

  setSubTypeRoad: t => set({ subTypeRoad: t }),
  setSubTypeLandUse: t => set({ subTypeLandUse: t }),
  setSubTypeBuilding: t => set({ subTypeBuilding: t }),
  setSubTypeLandscape: t => set({ subTypeLandscape: t }),
  setSubTypeFacility: t => set({ subTypeFacility: t }),
  setSubTypeInfra: t => set({ subTypeInfra: t }),
  setSubTypeDimension: t => set({ subTypeDimension: t }),
  setSubTypeTree: t => set({ subTypeTree: t }),

  setTransform: updates =>
    set(state => ({ transform: { ...state.transform, ...updates } })),

  resetView: () => set({ transform: { zoom: 1, panX: 0, panY: 0 } }),

  fitToSite: () => {
    const { site } = get().project;
    const bbox = getBoundingBox(site.boundary);
    const w = bbox.maxX - bbox.minX || 200;
    const h = bbox.maxY - bbox.minY || 150;
    set({
      transform: {
        zoom: Math.min(800 / (w * 1.2), 600 / (h * 1.2)),
        panX: 0,
        panY: 0
      }
    });
  },

  fitToPlan: () => {
    get().fitToSite();
  },

  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  setGridSpacing: spacing => set({ gridSpacing: spacing }),
  toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
  toggleSnapToGeometry: () => set(state => ({ snapToGeometry: !state.snapToGeometry })),
  togglePlotLabels: () => set(state => ({ showPlotLabels: !state.showPlotLabels })),
  toggleDimensions: () => set(state => ({ showDimensions: !state.showDimensions })),

  setCursorPos: pos => set({ cursorPos: pos }),
  addDraftPoint: pt => set(state => ({ draftPoints: [...state.draftPoints, pt] })),
  setDraftPoints: pts => set({ draftPoints: pts }),
  clearDraft: () => set({ draftPoints: [] }),

  addMeasurePoint: pt => {
    const current = get().measurePoints;
    if (current.length >= 3) {
      set({ measurePoints: [pt] });
    } else {
      set({ measurePoints: [...current, pt] });
    }
  },
  clearMeasure: () => set({ measurePoints: [] }),

  recordHistory: () => {
    const current = get().project;
    set(state => ({
      past: [...state.past.slice(-25), JSON.parse(JSON.stringify(current))],
      future: []
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  },

  undo: () => {
    const { past, future, project } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    set({
      project: previous,
      past: newPast,
      future: [JSON.parse(JSON.stringify(project)), ...future],
      selectedId: null
    });
  },

  redo: () => {
    const { past, future, project } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      project: next,
      past: [...past, JSON.parse(JSON.stringify(project))],
      future: newFuture,
      selectedId: null
    });
  },

  setProject: newProj => {
    get().recordHistory();
    set({ project: newProj, selectedId: null, selectedType: null });
  },

  loadSampleProject: () => {
    get().recordHistory();
    set({
      project: JSON.parse(JSON.stringify(GREEN_VALLEY_TOWNSHIP)),
      selectedId: null,
      selectedType: null
    });
  },

  createNewProject: (name = 'New Township Plan', width = 200, height = 150) => {
    get().recordHistory();
    const newProj: TownshipProject = {
      version: '1.0',
      project: {
        id: `township_${Date.now()}`,
        name,
        units: 'meters',
        north: 0,
        scale: '1:500',
        page: { size: 'A4', orientation: 'landscape' }
      },
      site: {
        name: 'Site Boundary',
        units: 'meters',
        width,
        height,
        boundary: [
          [0, 0],
          [width, 0],
          [width, height],
          [0, height]
        ]
      },
      roads: [],
      plots: [],
      buildings: [],
      parks: [],
      facilities: [],
      parking: [],
      footpaths: [],
      trees: [],
      streetLights: [],
      infrastructure: [],
      annotations: [],
      dimensions: [],
      northArrow: { position: [width - 15, height - 15], rotation: 0, scale: 1, visible: true },
      layers: DEFAULT_LAYERS
    };
    set({ project: newProj, selectedId: null, selectedType: null });
  },

  updateProjectMetadata: meta => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        project: { ...state.project.project, ...meta }
      }
    }));
  },

  updateSite: siteUpdates => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        site: { ...state.project.site, ...siteUpdates }
      }
    }));
  },

  // Road CRUD
  addRoad: roadData => {
    get().recordHistory();
    const newRoad: RoadEntity = {
      ...roadData,
      id: `road_${Date.now()}`,
      type: 'road',
      layer: 'ROADS'
    };
    set(state => ({
      project: {
        ...state.project,
        roads: [...state.project.roads, newRoad]
      },
      selectedId: newRoad.id,
      selectedType: 'road'
    }));
  },

  updateRoad: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        roads: state.project.roads.map(r => (r.id === id ? { ...r, ...updates } : r))
      }
    }));
  },

  deleteRoad: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        roads: state.project.roads.filter(r => r.id !== id),
        streetLights: (state.project.streetLights || []).filter(sl => sl.roadId !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Plot CRUD
  addPlot: plotData => {
    get().recordHistory();
    const count = get().project.plots.length + 1;
    const num = `P-${count < 10 ? '0' + count : count}`;
    const newPlot: PlotEntity = {
      ...plotData,
      id: `plot_${Date.now()}`,
      type: 'plot',
      number: plotData.number || num,
      layer: 'PLOTS'
    };
    set(state => ({
      project: {
        ...state.project,
        plots: [...state.project.plots, newPlot]
      },
      selectedId: newPlot.id,
      selectedType: 'plot'
    }));
  },

  updatePlot: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        plots: state.project.plots.map(p => (p.id === id ? { ...p, ...updates } : p))
      }
    }));
  },

  deletePlot: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        plots: state.project.plots.filter(p => p.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  generatePlotGrid: (rows, cols, startX, startY, plotW, plotH) => {
    get().recordHistory();
    const newPlots: PlotEntity[] = [];
    let counter = get().project.plots.length + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (plotW + 2);
        const y = startY + r * (plotH + 2);
        const num = `P-${counter < 10 ? '0' + counter : counter}`;
        newPlots.push({
          id: `plot_${Date.now()}_${r}_${c}`,
          type: 'plot',
          number: num,
          landUse: 'residential',
          polygon: [
            [x, y],
            [x + plotW, y],
            [x + plotW, y + plotH],
            [x, y + plotH]
          ],
          status: 'available',
          layer: 'PLOTS'
        });
        counter++;
      }
    }

    set(state => ({
      project: {
        ...state.project,
        plots: [...state.project.plots, ...newPlots]
      }
    }));
  },

  // Building CRUD
  addBuilding: bldData => {
    get().recordHistory();
    const newBld: BuildingEntity = {
      ...bldData,
      id: `bld_${Date.now()}`,
      type: 'building',
      layer: 'BUILDINGS'
    };
    set(state => ({
      project: {
        ...state.project,
        buildings: [...state.project.buildings, newBld]
      },
      selectedId: newBld.id,
      selectedType: 'building'
    }));
  },

  updateBuilding: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        buildings: state.project.buildings.map(b => (b.id === id ? { ...b, ...updates } : b))
      }
    }));
  },

  deleteBuilding: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        buildings: state.project.buildings.filter(b => b.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Park CRUD
  addPark: parkData => {
    get().recordHistory();
    const newPark: ParkEntity = {
      ...parkData,
      id: `park_${Date.now()}`,
      type: 'park',
      layer: 'LANDSCAPE'
    };
    set(state => ({
      project: {
        ...state.project,
        parks: [...state.project.parks, newPark]
      },
      selectedId: newPark.id,
      selectedType: 'park'
    }));
  },

  updatePark: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        parks: state.project.parks.map(p => (p.id === id ? { ...p, ...updates } : p))
      }
    }));
  },

  deletePark: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        parks: state.project.parks.filter(p => p.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Facility CRUD
  addFacility: facData => {
    get().recordHistory();
    const newFac: FacilityEntity = {
      ...facData,
      id: `fac_${Date.now()}`,
      type: 'facility',
      layer: 'FACILITIES'
    };
    set(state => ({
      project: {
        ...state.project,
        facilities: [...state.project.facilities, newFac]
      },
      selectedId: newFac.id,
      selectedType: 'facility'
    }));
  },

  updateFacility: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        facilities: state.project.facilities.map(f => (f.id === id ? { ...f, ...updates } : f))
      }
    }));
  },

  deleteFacility: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        facilities: state.project.facilities.filter(f => f.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Parking CRUD
  addParking: prkData => {
    get().recordHistory();
    const newPrk: ParkingEntity = {
      ...prkData,
      id: `prk_${Date.now()}`,
      type: 'parking',
      layer: 'PARKING'
    };
    set(state => ({
      project: {
        ...state.project,
        parking: [...state.project.parking, newPrk]
      },
      selectedId: newPrk.id,
      selectedType: 'parking'
    }));
  },

  updateParking: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        parking: state.project.parking.map(p => (p.id === id ? { ...p, ...updates } : p))
      }
    }));
  },

  deleteParking: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        parking: state.project.parking.filter(p => p.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Tree CRUD
  addTree: treeData => {
    get().recordHistory();
    const newTree: TreeEntity = {
      ...treeData,
      id: `tree_${Date.now()}`,
      type: 'tree',
      layer: 'LANDSCAPE'
    };
    set(state => ({
      project: {
        ...state.project,
        trees: [...(state.project.trees || []), newTree]
      },
      selectedId: newTree.id,
      selectedType: 'tree'
    }));
  },

  updateTree: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        trees: (state.project.trees || []).map(t => (t.id === id ? { ...t, ...updates } : t))
      }
    }));
  },

  deleteTree: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        trees: (state.project.trees || []).filter(t => t.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Street Light CRUD & Auto-Placement
  addStreetLight: lightData => {
    get().recordHistory();
    const newLight: StreetLightEntity = {
      ...lightData,
      id: `sl_${Date.now()}`,
      type: 'street_light',
      layer: 'ROADS'
    };
    set(state => ({
      project: {
        ...state.project,
        streetLights: [...(state.project.streetLights || []), newLight]
      }
    }));
  },

  autoPlaceStreetLightsAlongRoad: (roadId, spacing = 20) => {
    get().recordHistory();
    const road = get().project.roads.find(r => r.id === roadId);
    if (!road) return;

    const points = placePointsAlongPolyline(road.points, spacing);
    const newLights: StreetLightEntity[] = points.map((p, idx) => ({
      id: `sl_auto_${Date.now()}_${idx}`,
      type: 'street_light',
      position: { x: p[0], y: p[1] - road.width / 2 - 1 }, // Offset to road verge
      roadId,
      layer: 'ROADS'
    }));

    set(state => ({
      project: {
        ...state.project,
        streetLights: [...(state.project.streetLights || []).filter(sl => sl.roadId !== roadId), ...newLights]
      }
    }));
  },

  deleteStreetLight: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        streetLights: (state.project.streetLights || []).filter(sl => sl.id !== id)
      }
    }));
  },

  // Infrastructure CRUD
  addInfrastructure: infraData => {
    get().recordHistory();
    const newInfra: InfrastructureEntity = {
      ...infraData,
      id: `infra_${Date.now()}`,
      type: 'infrastructure',
      layer: infraData.infraType.startsWith('drain') || infraData.infraType === 'manhole' ? 'DRAINAGE' : 'WATER'
    };
    set(state => ({
      project: {
        ...state.project,
        infrastructure: [...state.project.infrastructure, newInfra]
      },
      selectedId: newInfra.id,
      selectedType: 'infrastructure'
    }));
  },

  updateInfrastructure: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        infrastructure: state.project.infrastructure.map(inf => (inf.id === id ? { ...inf, ...updates } : inf))
      }
    }));
  },

  deleteInfrastructure: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        infrastructure: state.project.infrastructure.filter(inf => inf.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Annotations CRUD
  addAnnotation: annData => {
    get().recordHistory();
    const newAnn: TextEntity = {
      ...annData,
      id: `txt_${Date.now()}`,
      type: 'text',
      layer: 'ANNOTATIONS'
    };
    set(state => ({
      project: {
        ...state.project,
        annotations: [...state.project.annotations, newAnn]
      },
      selectedId: newAnn.id,
      selectedType: 'text'
    }));
  },

  updateAnnotation: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        annotations: state.project.annotations.map(a => (a.id === id ? { ...a, ...updates } : a))
      }
    }));
  },

  deleteAnnotation: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        annotations: state.project.annotations.filter(a => a.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  // Dimensions CRUD
  addDimension: dimData => {
    get().recordHistory();
    const newDim: DimensionEntity = {
      ...dimData,
      id: `dim_${Date.now()}`,
      type: 'dimension',
      layer: 'DIMENSIONS'
    };
    set(state => ({
      project: {
        ...state.project,
        dimensions: [...state.project.dimensions, newDim]
      },
      selectedId: newDim.id,
      selectedType: 'dimension'
    }));
  },

  updateDimension: (id, updates) => {
    set(state => ({
      project: {
        ...state.project,
        dimensions: state.project.dimensions.map(d => (d.id === id ? { ...d, ...updates } : d))
      }
    }));
  },

  deleteDimension: id => {
    get().recordHistory();
    set(state => ({
      project: {
        ...state.project,
        dimensions: state.project.dimensions.filter(d => d.id !== id)
      },
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  updateNorthArrow: updates => {
    set(state => ({
      project: {
        ...state.project,
        northArrow: {
          position: [180, 20],
          rotation: 0,
          scale: 1,
          visible: true,
          ...(state.project.northArrow || {}),
          ...updates
        }
      }
    }));
  },

  // Layer Visibility & Controls
  setLayerVisibility: (layerId, visible) => {
    set(state => ({
      project: {
        ...state.project,
        layers: state.project.layers.map(l => (l.id === layerId ? { ...l, visible } : l))
      }
    }));
  },

  setLayerLocked: (layerId, locked) => {
    set(state => ({
      project: {
        ...state.project,
        layers: state.project.layers.map(l => (l.id === layerId ? { ...l, locked } : l))
      }
    }));
  },

  setLayerOpacity: (layerId, opacity) => {
    set(state => ({
      project: {
        ...state.project,
        layers: state.project.layers.map(l => (l.id === layerId ? { ...l, opacity } : l))
      }
    }));
  },

  // Selection actions
  deleteSelected: () => {
    const { selectedId, selectedType } = get();
    if (!selectedId) return;

    if (selectedType === 'road') get().deleteRoad(selectedId);
    else if (selectedType === 'plot') get().deletePlot(selectedId);
    else if (selectedType === 'building') get().deleteBuilding(selectedId);
    else if (selectedType === 'park') get().deletePark(selectedId);
    else if (selectedType === 'facility') get().deleteFacility(selectedId);
    else if (selectedType === 'parking') get().deleteParking(selectedId);
    else if (selectedType === 'tree') get().deleteTree(selectedId);
    else if (selectedType === 'infrastructure') get().deleteInfrastructure(selectedId);
    else if (selectedType === 'text') get().deleteAnnotation(selectedId);
    else if (selectedType === 'dimension') get().deleteDimension(selectedId);
  },

  duplicateSelected: () => {
    const { selectedId, selectedType, project } = get();
    if (!selectedId || !selectedType) return;
    const offset = 4; // 4m offset

    if (selectedType === 'building') {
      const bld = project.buildings.find(b => b.id === selectedId);
      if (bld) {
        get().addBuilding({
          ...bld,
          name: `${bld.name || 'Building'} (Copy)`,
          position: { x: bld.position.x + offset, y: bld.position.y + offset },
          plotId: undefined
        });
      }
    } else if (selectedType === 'plot') {
      const plot = project.plots.find(p => p.id === selectedId);
      if (plot) {
        get().addPlot({
          ...plot,
          number: `${plot.number}-B`,
          polygon: plot.polygon.map(pt => [pt[0] + offset, pt[1] + offset])
        });
      }
    } else if (selectedType === 'tree') {
      const tree = (project.trees || []).find(t => t.id === selectedId);
      if (tree) {
        get().addTree({
          ...tree,
          position: { x: tree.position.x + offset, y: tree.position.y + offset }
        });
      }
    } else if (selectedType === 'facility') {
      const fac = project.facilities.find(f => f.id === selectedId);
      if (fac) {
        get().addFacility({
          ...fac,
          name: `${fac.name} (Copy)`,
          position: { x: fac.position.x + offset, y: fac.position.y + offset }
        });
      }
    } else if (selectedType === 'text') {
      const txt = project.annotations.find(t => t.id === selectedId);
      if (txt) {
        get().addAnnotation({
          ...txt,
          position: [txt.position[0] + offset, txt.position[1] + offset]
        });
      }
    }
  },

  autoArrangeSite: () => {
    get().recordHistory();
    // Align buildings squarely inside their assigned plots
    const { plots, buildings } = get().project;
    const updatedBuildings = buildings.map(bld => {
      if (!bld.plotId) return bld;
      const plot = plots.find(p => p.id === bld.plotId);
      if (!plot || plot.polygon.length < 4) return bld;
      const bbox = getBoundingBox(plot.polygon);
      const plotCenterX = (bbox.minX + bbox.maxX) / 2;
      const plotCenterY = (bbox.minY + bbox.maxY) / 2;
      return {
        ...bld,
        position: {
          x: plotCenterX - bld.width / 2,
          y: plotCenterY - bld.depth / 2
        },
        rotation: 0
      };
    });

    set(state => ({
      project: {
        ...state.project,
        buildings: updatedBuildings
      }
    }));
  }
}));
