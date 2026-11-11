type Entry = { value: unknown; expires: number };

type ReadCache = {
  values: Map<string, Entry>;
  pending: Map<string, Promise<unknown>>;
  generation: number;
};

const globalCache = globalThis as unknown as { limeeReads?: ReadCache };

function box(): ReadCache {
  if (!globalCache.limeeReads) {
    globalCache.limeeReads = { values: new Map(), pending: new Map(), generation: 0 };
  }
  return globalCache.limeeReads;
}

export const PUBLIC_TTL_MS = 20_000;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const store = box();
  const hit = store.values.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const pending = store.pending.get(key);
  if (pending) return pending as Promise<T>;
  const generation = store.generation;
  const promise = load()
    .then((value) => {
      if (store.generation === generation) store.values.set(key, { value, expires: Date.now() + ttlMs });
      store.pending.delete(key);
      return value;
    })
    .catch((error: unknown) => {
      store.pending.delete(key);
      throw error;
    });
  store.pending.set(key, promise);
  return promise;
}

export function invalidatePublic() {
  const store = box();
  store.generation += 1;
  for (const key of store.values.keys()) {
    if (key.startsWith("public:")) store.values.delete(key);
  }
}
