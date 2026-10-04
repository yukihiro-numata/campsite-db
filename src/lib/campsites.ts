import { campsites } from "@/data/campsites/index.ts";
import type { Campsite } from "@/data/types.ts";

export function listCampsites(): Campsite[] {
  return campsites;
}

export function findCampsite(id: number): Campsite | undefined {
  return campsites.find((c) => c.id === id);
}
