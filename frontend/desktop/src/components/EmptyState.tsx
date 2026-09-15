export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
