'use client';

interface QuickActionsProps { canvasUrl: string; notesUrl: string; }

export default function QuickActions({ canvasUrl, notesUrl }: QuickActionsProps) {
  return (
    <section className="quick-actions" aria-labelledby="quick-actions-heading">
      <header className="quick-actions-header">
        <h2 id="quick-actions-heading" className="section-kicker">Quick actions</h2>
      </header>
      <div className="quick-actions-grid">
        <a href={canvasUrl} target="_blank" rel="noopener noreferrer" className="quick-action">
          <span className="quick-action-symbol" aria-hidden="true">↗</span>
          <span><strong>Open Canvas</strong><small>Make something together</small></span>
        </a>
        <a href={notesUrl} target="_blank" rel="noopener noreferrer" className="quick-action">
          <span className="quick-action-symbol" aria-hidden="true">≡</span>
          <span><strong>Open Notes</strong><small>Leave something for later</small></span>
        </a>
        <button type="button" disabled className="quick-action quick-action-disabled">
          <span className="quick-action-symbol" aria-hidden="true">+</span>
          <span><strong>New Task</strong><small>Coming soon</small></span>
        </button>
        <button type="button" disabled className="quick-action quick-action-disabled">
          <span className="quick-action-symbol" aria-hidden="true">+</span>
          <span><strong>New Event</strong><small>Coming soon</small></span>
        </button>
      </div>
    </section>
  );
}
