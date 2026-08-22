import {
  CALM_LAB_CYAN,
  CALM_LAB_GLASS_EDGE,
  CALM_LAB_GLASS_FILL,
  CALM_LAB_INTAKE_BG,
  CALM_LAB_INTAKE_BIN,
  CALM_LAB_INTAKE_SHEET,
  CALM_LAB_LABEL,
  CALM_LAB_LANE_LABEL,
  CALM_LAB_LANE_WASH,
  CALM_LAB_PLANNER_WASH,
  CALM_LAB_SAFETY,
  CALM_LAB_SHARED_WASH,
} from '../../constants.js';
import { TILE_SIZE } from '../types.js';

const PLANNER_GLASS_COL = 7;
const PLANNER_DOOR_ROW = 18;
const FIRST_ROOM_ROW = 11;
const LAST_ROOM_ROW = 21;

function drawPixelLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  zoom: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.font = `600 ${Math.max(9, 4 * zoom).toString()}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

/**
 * Temporary graybox accents for the approved Calm Data Lab direction.
 * Geometry is intentionally simple so final pixel assets can replace this
 * layer without changing the map, seats, or choreography coordinates.
 */
export function renderCalmDataLabTheme(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
): void {
  const s = TILE_SIZE * zoom;
  const x = (col: number) => offsetX + col * s;
  const y = (row: number) => offsetY + row * s;

  ctx.save();

  // Quiet blue-gray zoning washes.
  ctx.fillStyle = CALM_LAB_PLANNER_WASH;
  ctx.fillRect(x(1), y(FIRST_ROOM_ROW), s * 6, s * 11);
  ctx.fillStyle = CALM_LAB_LANE_WASH;
  ctx.fillRect(x(8), y(FIRST_ROOM_ROW), s * 3, s * 11);
  ctx.fillStyle = CALM_LAB_SHARED_WASH;
  ctx.fillRect(x(11), y(FIRST_ROOM_ROW), s * 12, s * 11);

  // Cyan glass partition. The wall tiles remain the collision source.
  for (let row = FIRST_ROOM_ROW; row <= LAST_ROOM_ROW; row++) {
    if (row === PLANNER_DOOR_ROW) continue;
    ctx.fillStyle = CALM_LAB_GLASS_FILL;
    ctx.fillRect(x(PLANNER_GLASS_COL), y(row), s, s);
    ctx.strokeStyle = CALM_LAB_GLASS_EDGE;
    ctx.lineWidth = Math.max(1, zoom);
    ctx.strokeRect(x(PLANNER_GLASS_COL) + 0.5, y(row) + 0.5, s - 1, s - 1);
  }
  ctx.strokeStyle = CALM_LAB_CYAN;
  ctx.lineWidth = Math.max(2, zoom);
  ctx.strokeRect(x(PLANNER_GLASS_COL), y(PLANNER_DOOR_ROW), s, s);

  // Analysis lane safety marks.
  const stripeWidth = Math.max(2, zoom * 2);
  for (let row = FIRST_ROOM_ROW; row <= LAST_ROOM_ROW; row++) {
    if ((row - FIRST_ROOM_ROW) % 2 !== 0) continue;
    ctx.fillStyle = CALM_LAB_SAFETY;
    ctx.fillRect(x(8) + zoom, y(row) + zoom, stripeWidth, Math.max(4, s * 0.42));
    ctx.fillRect(x(11) - stripeWidth - zoom, y(row) + s * 0.52, stripeWidth, Math.max(4, s * 0.42));
  }

  // Wall-mounted Data Intake placeholder.
  ctx.fillStyle = CALM_LAB_INTAKE_BG;
  ctx.fillRect(x(22) + s * 0.08, y(15) + s * 0.08, s * 0.84, s * 4.84);
  ctx.strokeStyle = CALM_LAB_CYAN;
  ctx.lineWidth = Math.max(1, zoom);
  ctx.strokeRect(x(22) + s * 0.16, y(16) + s * 0.2, s * 0.68, s * 0.55);
  ctx.fillStyle = CALM_LAB_INTAKE_SHEET;
  ctx.fillRect(x(22) + s * 0.27, y(16) + s * 0.43, s * 0.46, Math.max(2, zoom));
  ctx.fillStyle = CALM_LAB_INTAKE_BIN;
  ctx.fillRect(x(22) + s * 0.18, y(18), s * 0.64, s * 1.45);

  drawPixelLabel(ctx, 'PLANNER LAB', x(1.45), y(11.35), zoom, CALM_LAB_LABEL);
  drawPixelLabel(ctx, 'ANALYSIS LANE', x(8.15), y(20.65), zoom, CALM_LAB_LANE_LABEL);
  drawPixelLabel(ctx, 'DEEP / QUICK LAB', x(11.45), y(20.65), zoom, CALM_LAB_LABEL);
  drawPixelLabel(ctx, 'DATA', x(22.14), y(15.28), zoom, CALM_LAB_INTAKE_SHEET);
  drawPixelLabel(ctx, 'INTAKE', x(22.04), y(15.62), zoom, CALM_LAB_CYAN);

  ctx.restore();
}
