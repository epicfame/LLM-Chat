import { useSyncExternalStore } from "react";

const query = "(max-width: 767px)";
const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => false;

function subscribe(callback) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
