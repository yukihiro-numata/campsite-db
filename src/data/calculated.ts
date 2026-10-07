// scripts/calc が書き出すファイル。手で直さない(pnpm calc で作り直す)
import type { CalculatedValues } from "./types.ts";

export const calculatedOn = "2026-10-08";

export const calculatedValues: Record<number, CalculatedValues> = {
  1: {
    travelMinutes: 85,
    distanceTo: { expressway: null, nationalRoad: 493, railway: 338 },
  },
  2: {
    travelMinutes: 161,
    distanceTo: { expressway: null, nationalRoad: 837, railway: null },
  },
  3: {
    travelMinutes: 67,
    distanceTo: { expressway: null, nationalRoad: null, railway: null },
  },
  4: {
    travelMinutes: 69,
    distanceTo: { expressway: 572, nationalRoad: null, railway: null },
  },
  5: {
    travelMinutes: 95,
    distanceTo: { expressway: null, nationalRoad: null, railway: null },
  },
  6: {
    travelMinutes: 126,
    distanceTo: { expressway: null, nationalRoad: 60, railway: null },
  },
  7: {
    travelMinutes: 83,
    distanceTo: { expressway: null, nationalRoad: 460, railway: 287 },
  },
  8: {
    travelMinutes: 81,
    distanceTo: { expressway: null, nationalRoad: 253, railway: 220 },
  },
  9: {
    travelMinutes: 95,
    distanceTo: { expressway: null, nationalRoad: null, railway: null },
  },
  10: {
    travelMinutes: 101,
    distanceTo: { expressway: null, nationalRoad: null, railway: null },
  },
};
