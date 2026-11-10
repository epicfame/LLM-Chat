import { Plus, Trash2 } from "lucide-react";

const DAY = 24 * 60 * 60 * 1000;

function groupLabel(timestamp) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday) return "Today";
  if (timestamp >= startOfToday - DAY) return "Yesterday";
  if (timestamp >= startOfToday - 7 * DAY) return "Previous 7 days";
  if (timestamp >= startOfToday - 30 * DAY) return "Previous 30 days";
  return "Older";
}

function groupSessions(sessions) {
  const groups = [];
  [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((session) => {
      const label = groupLabel(session.updatedAt);
      const last = groups[groups.length - 1];
      if (last?.label === label) last.items.push(session);
      else groups.push({ label, items: [session] });
    });
  return groups;
}

export function ChatHistory({
  sessions = [],
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
  disabled = false,
}) {
  const groups = groupSessions(sessions);

  const handleDelete = (session) => {
    if (window.confirm(`Delete "${session.title}"?`)) onDelete?.(session.id);
  };

  return (
    <nav className="flex min-h-0 flex-col gap-3.5" aria-label="Chat history">
      <button
        type="button"
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-linear-[135deg,var(--color-primary),var(--color-secondary)] px-3.5 text-sm font-extrabold text-text shadow-[0_6px_16px_-8px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] transition-[transform,filter,opacity] duration-150 hover:brightness-105 active:scale-98 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onNew}
        disabled={disabled}
        title={disabled ? "Wait for the response to finish" : undefined}
      >
        <Plus size={16} strokeWidth={2.75} aria-hidden="true" />
        New Chat
      </button>

      {groups.length === 0 ? (
        <p className="mx-1 my-2 text-[13px] text-text-muted">No conversations yet.</p>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="[&+section]:mt-1">
            <h3 className="mb-1 px-2.5 text-[11px] font-extrabold tracking-[0.04em] text-text-muted uppercase">{group.label}</h3>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <li
                    key={session.id}
                    className="group relative flex items-center rounded-md transition-colors duration-150 hover:bg-secondary/10 data-[active=true]:bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))]"
                    data-active={isActive}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer truncate rounded-[inherit] border-0 bg-transparent py-[9px] pr-9 pl-2.5 text-left text-sm font-semibold text-text group-data-[active=true]:font-extrabold group-data-[active=true]:text-[color-mix(in_srgb,var(--color-primary)_65%,var(--color-text))] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => onSelect?.(session.id)}
                      disabled={disabled && !isActive}
                      aria-current={isActive ? "page" : undefined}
                      title={session.title}
                    >
                      {session.title}
                    </button>
                    <button
                      type="button"
                      className="absolute right-1 grid size-7 cursor-pointer place-items-center rounded-sm border-0 bg-transparent text-text-muted opacity-0 transition-[opacity,color,background-color] duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-data-[active=true]:opacity-100 hover:bg-primary/14 hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0! [@media(hover:none)]:opacity-100"
                      onClick={() => handleDelete(session)}
                      disabled={disabled}
                      aria-label={`Delete conversation ${session.title}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </nav>
  );
}
