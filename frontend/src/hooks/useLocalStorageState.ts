import { useSyncExternalStore, useCallback } from "react";

type Serializer<T> = {
  serialize: (value: T) => string;
  deserialize: (value: string | null) => T;
};

// Store listeners per key to allow multiple independent stores
const listenersMap = new Map<string, Set<() => void>>();
const cacheMap = new Map<string, unknown>();

function getListeners(key: string) {
  if (!listenersMap.has(key)) {
    listenersMap.set(key, new Set());
  }
  return listenersMap.get(key)!;
}

function subscribe(key: string) {
  return (callback: () => void) => {
    const listeners = getListeners(key);
    listeners.add(callback);
    return () => listeners.delete(callback);
  };
}

function emitChange(key: string) {
  const listeners = getListeners(key);
  listeners.forEach((listener) => listener());
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  serializer: Serializer<T> = {
    serialize: JSON.stringify,
    deserialize: (v) => (v ? JSON.parse(v) : defaultValue),
  }
): [T, (value: T | ((prev: T) => T)) => void] {

  // Initialize cache if needed
  if (!cacheMap.has(key)) {
    try {
      const stored = localStorage.getItem(key);
      cacheMap.set(key, serializer.deserialize(stored));
    } catch {
      cacheMap.set(key, defaultValue);
    }
  }

  const getSnapshot = () => cacheMap.get(key) as T;
  const getServerSnapshot = () => defaultValue;

  const value = useSyncExternalStore(
    subscribe(key),
    getSnapshot,
    getServerSnapshot
  );

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const current = cacheMap.get(key) as T;
      const resolved = typeof newValue === "function"
        ? (newValue as (prev: T) => T)(current)
        : newValue;

      localStorage.setItem(key, serializer.serialize(resolved));
      cacheMap.set(key, resolved);
      emitChange(key);
    },
    [key, serializer]
  );

  return [value, setValue];
}
