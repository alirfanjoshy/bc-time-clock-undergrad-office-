export function formatMinutes(totalMinutes: number | null | undefined) {
  const safeMinutes = Math.max(0, totalMinutes ?? 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatElapsedSeconds(clockIn: string | null | undefined, now = Date.now()) {
  if (!clockIn) return '00:00:00';
  const elapsed = Math.max(0, Math.floor((now - new Date(clockIn).getTime()) / 1000));
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}
