import type { SimulationSnapshot } from "@/lib/types";

const DATE_KEYS = new Set([
  "timestamp",
  "createdAt",
  "weekStart",
  "weekEnd",
]);

function toValidDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function reviveValue(key: string, value: unknown): unknown {
  if (DATE_KEYS.has(key)) {
    return toValidDate(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => reviveDeep(item));
  }
  if (value && typeof value === "object") {
    return reviveDeep(value as Record<string, unknown>);
  }
  return value;
}

function reviveDeep<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => reviveDeep(item)) as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = reviveValue(key, value);
  }
  return result as T;
}

export function reviveSimulationState(
  state: Partial<SimulationSnapshot>
): Partial<SimulationSnapshot> {
  if (!state || !state.data) return state;
  return reviveDeep(state);
}

export function isValidSimulationState(state: Partial<SimulationSnapshot>): boolean {
  if (!state?.data?.inventory?.length) return false;
  const firstEvent = state.data.events?.[0];
  if (firstEvent?.timestamp) {
    const t = toValidDate(firstEvent.timestamp);
    if (Number.isNaN(t.getTime())) return false;
  }
  return true;
}
