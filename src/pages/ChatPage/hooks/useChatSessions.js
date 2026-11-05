import { useCallback, useEffect, useRef, useState } from "react";
import { v7 as uuidv7 } from "uuid";

const STORAGE_KEY = "dumbai:chat-sessions";
const MAX_SESSIONS = 50;
const TITLE_LENGTH = 60;
const PENDING_STATUSES = new Set(["loading", "thinking", "streaming"]);

const makeTitle = (text) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > TITLE_LENGTH
    ? `${clean.slice(0, TITLE_LENGTH).trimEnd()}…`
    : clean || "New Chat";
};

function loadSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    // A reply that was still loading/streaming when the page closed will never finish
    return parsed.map((session) => ({
      ...session,
      messages: (session.messages ?? []).map((message) =>
        PENDING_STATUSES.has(message.status)
          ? {
              ...message,
              status: "error",
              content: message.content
                ? `${message.content}\n\n> Response interrupted because the page was closed.`
                : "Response interrupted because the page was closed before it finished.",
            }
          : message,
      ),
    }));
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions.slice(0, MAX_SESSIONS)),
    );
  } catch (error) {
    console.warn("Failed to save chat history:", error);
  }
}

/**
 * Keeps a list of chat sessions next to the page's existing `messages` state.
 * `messages` stays the single source of truth for the open chat; this hook only
 * mirrors it into the active session and swaps it when another session is opened.
 */
export function useChatSessions({ messages, setMessages, isBusy = false }) {
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Mirror the open chat into its session (newest session first)
  useEffect(() => {
    if (!activeSessionId) return;

    setSessions((prev) => {
      const current = prev.find((session) => session.id === activeSessionId);
      if (!current || current.messages === messages) return prev;

      const updated = { ...current, messages, updatedAt: Date.now() };
      return [
        updated,
        ...prev.filter((session) => session.id !== activeSessionId),
      ];
    });
  }, [messages, activeSessionId]);

  // Save after a reply finishes, not on every streamed token
  useEffect(() => {
    if (!isBusy) saveSessions(sessions);
  }, [sessions, isBusy]);

  // ...and also when the tab is closed mid-stream
  const latestSessions = useRef(sessions);
  useEffect(() => {
    latestSessions.current = sessions;
  }, [sessions]);

  useEffect(() => {
    const flush = () => saveSessions(latestSessions.current);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  /** Call when the user sends a message. Creates a session for a new chat. */
  const startSession = useCallback(
    (firstPrompt) => {
      if (activeSessionId) return activeSessionId;

      const now = Date.now();
      const session = {
        id: uuidv7(),
        title: makeTitle(firstPrompt),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };

      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      return session.id;
    },
    [activeSessionId],
  );

  const selectSession = useCallback(
    (id) => {
      if (isBusy || id === activeSessionId) return;
      const session = sessions.find((item) => item.id === id);
      if (!session) return;

      setActiveSessionId(id);
      setMessages(session.messages);
    },
    [isBusy, activeSessionId, sessions, setMessages],
  );

  const newChat = useCallback(() => {
    if (isBusy) return;
    setActiveSessionId(null);
    setMessages([]);
  }, [isBusy, setMessages]);

  const deleteSession = useCallback(
    (id) => {
      if (isBusy) return;
      setSessions((prev) => prev.filter((session) => session.id !== id));
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    },
    [isBusy, activeSessionId, setMessages],
  );

  return {
    sessions,
    activeSessionId,
    startSession,
    selectSession,
    newChat,
    deleteSession,
  };
}
