import { Point2D, BoundingBox, SnapTarget } from '../types/project';

/**
 * Calculates Euclidean distance between two points in meters.
 */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates polygon area in square meters using the Shoelace formula.
 */
export function calculatePolygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates perimeter of a polygon in meters.
 */
export function calculatePolygonPerimeter(points: Point2D[]): number {
  if (points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    perimeter += distance(points[i], points[j]);
  }
  return perimeter;
}

/**
 * Calculates total length of a polyline in meters.
 */
export function calculatePolylineLength(points: Point2D[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += distance(points[i], points[i + 1]);
  }
  return length;
}

/**
 * Calculates centroid of a polygon.
 */
export function calculateCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return [0, 0];
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p[0];
    cy += p[1];
  }
  return [cx / points.length, cy / points.length];
}

/**
 * Point in polygon test using Ray-Casting algorithm.
 */
export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  if (polygon.length < 3) return false;
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Checks if polygon A is completely inside polygon B.
 */
export function isPolygonInsidePolygon(polyA: Point2D[], polyB: Point2D[]): boolean {
  for (const p of polyA) {
    if (!isPointInPolygon(p, polyB)) {
      return false;
    }
  }
  return true;
}

/**
 * Computes bounding box for a set of points.
 */
export function getBoundingBox(points: Point2D[]): BoundingBox {
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = points[0][0];
  let maxX = points[0][0];
  let minY = points[0][1];
  let maxY = points[0][1];

  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Rotates a 2D point around an origin by angle in degrees.
 */
export function rotatePoint(p: Point2D, origin: Point2D, angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p[0] - origin[0];
  const dy = p[1] - origin[1];

  return [
    origin[0] + dx * cos - dy * sin,
    origin[1] + dx * sin + dy * cos
  ];
}

/**
 * Gets 4 corner points of an oriented rectangle.
 * position is top-left when rotation is 0.
 */
export function getOrientedRectCorners(
  position: { x: number; y: number },
  width: number,
  depth: number,
  rotation: number = 0
): Point2D[] {
  const x = position.x;
  const y = position.y;
  const rawCorners: Point2D[] = [
    [x, y],
    [x + width, y],
    [x + width, y + depth],
    [x, y + depth]
  ];

  if (!rotation) return rawCorners;

  const center: Point2D = [x + width / 2, y + depth / 2];
  return rawCorners.map(p => rotatePoint(p, center, rotation));
}

/**
 * Line segment intersection check and point finder.
 */
export function lineSegmentIntersection(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  p4: Point2D
): Point2D | null {
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const x3 = p3[0];
  const y3 = p3[1];
  const x4 = p4[0];
  const y4 = p4[1];

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-9) return null; // Parallel or collinear

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return [
      x1 + ua * (x2 - x1),
      y1 + ua * (y2 - y1)
    ];
  }

  return null;
}

/**
 * Checks if two polygons intersect or overlap.
 */
export function doPolygonsIntersect(polyA: Point2D[], polyB: Point2D[]): boolean {
  // Check if any edge intersects
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];
    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];
      if (lineSegmentIntersection(a1, a2, b1, b2)) {
        return true;
      }
    }
  }

  // Check if one polygon is inside the other
  if (isPointInPolygon(polyA[0], polyB) || isPointInPolygon(polyB[0], polyA)) {
    return true;
  }

  return false;
}

/**
 * Project a point onto a line segment. Returns closest point on segment and distance.
 */
export function closestPointOnSegment(
  p: Point2D,
  a: Point2D,
  b: Point2D
): { point: Point2D; distance: number; t: number } {
  const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
  if (l2 === 0) {
    return { point: a, distance: distance(p, a), t: 0 };
  }

  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2));
  const proj: Point2D = [
    a[0] + t * (b[0] - a[0]),
    a[1] + t * (b[1] - a[1])
  ];

  return { point: proj, distance: distance(p, proj), t };
}

/**
 * Computes road corridor polygon from centerline and width.
 */
export function computeRoadCorridor(points: Point2D[], width: number): Point2D[] {
  if (points.length < 2) return [];
  const halfWidth = width / 2;
  const leftSide: Point2D[] = [];
  const rightSide: Point2D[] = [];

  for (let i = 0; i < points.length; i++) {
    let nx = 0;
    let ny = 0;

    if (i === 0) {
      const dx = points[1][0] - points[0][0];
      const dy = points[1][1] - points[0][1];
      const len = Math.hypot(dx, dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else if (i === points.length - 1) {
      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];
      const len = Math.hypot(dx, dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else {
      const dx1 = points[i][0] - points[i - 1][0];
      const dy1 = points[i][1] - points[i - 1][1];
      const len1 = Math.hypot(dx1, dy1) || 1;

      const dx2 = points[i + 1][0] - points[i][0];
      const dy2 = points[i + 1][1] - points[i][1];
      const len2 = Math.hypot(dx2, dy2) || 1;

      const n1x = -dy1 / len1;
      const n1y = dx1 / len1;
      const n2x = -dy2 / len2;
      const n2y = dx2 / len2;

      nx = (n1x + n2x) / 2;
      ny = (n1y + n2y) / 2;
      const nlen = Math.hypot(nx, ny) || 1;
      nx /= nlen;
      ny /= nlen;
    }

    leftSide.push([points[i][0] + nx * halfWidth, points[i][1] + ny * halfWidth]);
    rightSide.push([points[i][0] - nx * halfWidth, points[i][1] - ny * halfWidth]);
  }

  return [...leftSide, ...rightSide.reverse()];
}

/**
 * Calculates angle in degrees for 3 points (Angle ABC at B).
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const ab = [a[0] - b[0], a[1] - b[1]];
  const cb = [c[0] - b[0], c[1] - b[1]];

  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.hypot(ab[0], ab[1]);
  const magCB = Math.hypot(cb[0], cb[1]);

  if (magAB === 0 || magCB === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Snaps a point to grid or active snap targets.
 */
export function findSnapPoint(
  cursor: Point2D,
  targets: SnapTarget[],
  gridSpacing: number = 5,
  snapToGrid: boolean = true,
  snapTolerance: number = 2.5
): { point: Point2D; target: SnapTarget | null } {
  let closestTarget: SnapTarget | null = null;
  let minDistance = snapTolerance;

  // Check geometric targets first (higher priority)
  for (const target of targets) {
    const d = distance(cursor, target.point);
    if (d < minDistance) {
      minDistance = d;
      closestTarget = target;
    }
  }

  if (closestTarget) {
    return { point: closestTarget.point, target: closestTarget };
  }

  // Check grid snap if enabled
  if (snapToGrid && gridSpacing > 0) {
    const gridX = Math.round(cursor[0] / gridSpacing) * gridSpacing;
    const gridY = Math.round(cursor[1] / gridSpacing) * gridSpacing;
    const gridPoint: Point2D = [gridX, gridY];
    const d = distance(cursor, gridPoint);

    if (d <= snapTolerance * 1.5) {
      return {
        point: gridPoint,
        target: { point: gridPoint, type: 'grid', description: `${gridSpacing}m Grid` }
      };
    }
  }

  return { point: cursor, target: null };
}

/**
 * Automatically places points evenly spaced along a polyline (e.g. for street lights).
 */
export function placePointsAlongPolyline(points: Point2D[], spacingMeters: number): Point2D[] {
  if (points.length < 2 || spacingMeters <= 0) return [];
  const result: Point2D[] = [];
  let accumulatedDist = 0;
  let nextTargetDist = spacingMeters / 2; // Offset start slightly from beginning

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segLen = distance(p1, p2);

    while (nextTargetDist <= accumulatedDist + segLen) {
      const segOffset = nextTargetDist - accumulatedDist;
      const t = segOffset / segLen;
      result.push([
        p1[0] + t * (p2[0] - p1[0]),
        p1[1] + t * (p2[1] - p1[1])
      ]);
      nextTargetDist += spacingMeters;
    }

    accumulatedDist += segLen;
  }

  return result;
}

/**
 * Automatically generates parking bay dividers inside a rectangular parking area.
 */
export function generateParkingBays(
  corners: Point2D[],
  bayWidth: number = 2.5,
  bayDepth: number = 5.0
): { bays: { p1: Point2D; p2: Point2D }[]; count: number } {
  if (corners.length < 4) return { bays: [], count: 0 };
  const bbox = getBoundingBox(corners);
  const width = bbox.maxX - bbox.minX;
  const depth = bbox.maxY - bbox.minY;

  const bays: { p1: Point2D; p2: Point2D }[] = [];
  const countX = Math.floor(width / bayWidth);
  const countY = Math.floor(depth / bayDepth);

  if (countX >= 2) {
    for (let i = 1; i < countX; i++) {
      const x = bbox.minX + i * bayWidth;
      bays.push({
        p1: [x, bbox.minY],
        p2: [x, bbox.minY + Math.min(bayDepth, depth / 2)]
      });
      if (depth > bayDepth * 2) {
        bays.push({
          p1: [x, bbox.maxY - bayDepth],
          p2: [x, bbox.maxY]
        });
      }
    }
  }

  const totalSpaces = Math.max(1, countX * Math.max(1, countY > 1 ? 2 : 1));
  return { bays, count: totalSpaces };
}
