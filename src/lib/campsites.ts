import { campsites } from "@/data/campsites";
import type { Campsite } from "@/data/types";

export function listCampsites(): Campsite[] {
  return campsites;
}

export function findCampsite(id: number): Campsite | undefined {
  return campsites.find((c) => c.id === id);
}
