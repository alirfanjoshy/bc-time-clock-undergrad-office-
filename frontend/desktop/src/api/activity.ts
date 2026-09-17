// Count overlapping requests so one completed request cannot hide another.
let pending = 0;
const listeners = new Set<() => void>();
export const subscribeToActivity = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const getPendingRequests = () => pending;
export async function withActivity<T>(request: () => Promise<T>): Promise<T> {
  pending += 1;
  listeners.forEach((listener) => listener());
  try {
    return await request();
  } finally {
    pending -= 1;
    listeners.forEach((listener) => listener());
  }
}
