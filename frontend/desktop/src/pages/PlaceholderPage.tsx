import { EmptyState } from '../components/EmptyState';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page">
      <header className="page-header">
        <div><h1>{title}</h1><p>This section is ready for the next backend endpoint expansion.</p></div>
      </header>
      <EmptyState title={`${title} API pending`} message="The desktop shell is in place and connected sections will render as backend endpoints are added." />
    </div>
  );
}
