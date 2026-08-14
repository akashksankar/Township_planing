import {
  Point2D,
  BuildingEntity,
  PlotEntity,
  FacilityEntity,
  SiteEntity,
  RoadEntity
} from '../types/project';
import {
  getOrientedRectCorners,
  isPolygonInsidePolygon,
  doPolygonsIntersect,
  isPointInPolygon
} from './geometry';

export interface ValidationIssue {
  type: 'error' | 'warning';
  entityId: string;
  message: string;
}

/**
 * Checks if a building stays within the site boundary.
 */
export function isBuildingInsideSite(
  building: BuildingEntity,
  siteBoundary: Point2D[]
): boolean {
  const corners = getOrientedRectCorners(
    building.position,
    building.width,
    building.depth,
    building.rotation
  );
  return isPolygonInsidePolygon(corners, siteBoundary);
}

/**
 * Checks if a building stays inside its associated plot.
 */
export function isBuildingInsidePlot(
  building: BuildingEntity,
  plot: PlotEntity
): boolean {
  const corners = getOrientedRectCorners(
    building.position,
    building.width,
    building.depth,
    building.rotation
  );
  return isPolygonInsidePolygon(corners, plot.polygon);
}

/**
 * Calculates setback boundary polygon inside a rectangular plot.
 */
export function getSetbackBoundary(
  plotPolygon: Point2D[],
  setbacks: { front: number; rear: number; left: number; right: number }
): Point2D[] {
  if (plotPolygon.length < 4) return plotPolygon;
  // Simple offset for standard 4-point plots
  const [p1, p2, p3, p4] = plotPolygon;
  // p1=top-left, p2=top-right, p3=bottom-right, p4=bottom-left
  return [
    [p1[0] + setbacks.left, p1[1] + setbacks.rear],
    [p2[0] - setbacks.right, p2[1] + setbacks.rear],
    [p3[0] - setbacks.right, p3[1] - setbacks.front],
    [p4[0] + setbacks.left, p4[1] - setbacks.front]
  ];
}

/**
 * Runs comprehensive collision and containment checks on project state.
 */
export function validateCollisions(
  site: SiteEntity,
  buildings: BuildingEntity[],
  plots: PlotEntity[],
  facilities: FacilityEntity[],
  _roads: RoadEntity[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check buildings against site and plots
  for (const bld of buildings) {
    const bldCorners = getOrientedRectCorners(
      bld.position,
      bld.width,
      bld.depth,
      bld.rotation
    );

    // Site boundary check
    if (!isPolygonInsidePolygon(bldCorners, site.boundary)) {
      issues.push({
        type: 'error',
        entityId: bld.id,
        message: `Building "${bld.name || bld.id}" extends beyond the site boundary.`
      });
    }

    // Plot association check
    if (bld.plotId) {
      const associatedPlot = plots.find(p => p.id === bld.plotId);
      if (associatedPlot) {
        if (!isPolygonInsidePolygon(bldCorners, associatedPlot.polygon)) {
          issues.push({
            type: 'warning',
            entityId: bld.id,
            message: `Building "${bld.name || bld.id}" extends outside Plot ${associatedPlot.number}.`
          });
        }
      }
    } else {
      // Find if building is in any plot
      const inAnyPlot = plots.some(p => isPolygonInsidePolygon(bldCorners, p.polygon));
      if (!inAnyPlot && plots.length > 0) {
        // Just an info/warning
        issues.push({
          type: 'warning',
          entityId: bld.id,
          message: `Building "${bld.name || bld.id}" is not inside any designated plot.`
        });
      }
    }

    // Building vs Building overlap check
    for (const otherBld of buildings) {
      if (bld.id === otherBld.id) continue;
      const otherCorners = getOrientedRectCorners(
        otherBld.position,
        otherBld.width,
        otherBld.depth,
        otherBld.rotation
      );
      if (doPolygonsIntersect(bldCorners, otherCorners)) {
        issues.push({
          type: 'error',
          entityId: bld.id,
          message: `Building "${bld.name || bld.id}" overlaps with "${otherBld.name || otherBld.id}".`
        });
      }
    }

    // Building vs Facility overlap check
    for (const fac of facilities) {
      const facCorners = getOrientedRectCorners(
        fac.position,
        fac.width,
        fac.depth,
        fac.rotation
      );
      if (doPolygonsIntersect(bldCorners, facCorners)) {
        issues.push({
          type: 'error',
          entityId: bld.id,
          message: `Building "${bld.name || bld.id}" overlaps with Facility "${fac.name}".`
        });
      }
    }
  }

  return issues;
}
