/**
 * Thin wrapper around the public DummyJSON API. We map generic product
 * fields onto cluster-shaped data so the network panel shows real HTTP
 * traffic without us having to stand up a backend.
 *
 * The mapping (product → cluster) lives in `src/lib/mappers.ts`.
 */

const BASE_URL = "https://dummyjson.com";

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status);
  }
  return res.json() as Promise<T>;
}
