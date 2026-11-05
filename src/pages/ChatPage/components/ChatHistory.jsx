import { Plus, Trash2 } from "lucide-react";
import styles from "./ChatHistory.module.css";

const cx = (...classes) => classes.filter(Boolean).join(" ");
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
    <nav className={styles.history} aria-label="Chat history">
      <button
        type="button"
        className={styles.newChat}
        onClick={onNew}
        disabled={disabled}
        title={disabled ? "Wait for the response to finish" : undefined}
      >
        <Plus size={16} strokeWidth={2.75} aria-hidden="true" />
        New Chat
      </button>

      {groups.length === 0 ? (
        <p className={styles.empty}>No conversations yet.</p>
      ) : (
        groups.map((group) => (
          <section key={group.label} className={styles.group}>
            <h3 className={styles.groupLabel}>{group.label}</h3>
            <ul className={styles.list}>
              {group.items.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <li
                    key={session.id}
                    className={cx(styles.item, isActive && styles.active)}
                  >
                    <button
                      type="button"
                      className={styles.itemButton}
                      onClick={() => onSelect?.(session.id)}
                      disabled={disabled && !isActive}
                      aria-current={isActive ? "page" : undefined}
                      title={session.title}
                    >
                      {session.title}
                    </button>
                    <button
                      type="button"
                      className={styles.delete}
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
