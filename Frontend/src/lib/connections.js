import { useSyncExternalStore } from "react";
import { getToken, saveConnectionsToDatabase } from "./backend";

/**
 * Connections store — one GitHub profile and one LeetCode profile (both optional).
 * Cached in localStorage for instant UI; when signed in, every change is also
 * written to the user's MongoDB document via PATCH /api/v1/users/connections.
 *
 * Shape: { github: string|null, leetcode: string|null }
 */

const KEY = "devdash.connections.v2";
const V1_KEY = "devdash.connections.v1";
const LEGACY_LC_KEY = "leetcode_users";

const listeners = new Set();
let snapshot = load();

function normalize(raw) {
  return {
    github: typeof raw?.github === "string" && raw.github.trim() ? raw.github.trim() : null,
    leetcode:
      typeof raw?.leetcode === "string" && raw.leetcode.trim() ? raw.leetcode.trim() : null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* corrupted storage */
  }

  let github = null;
  let leetcode = null;
  try {
    const v1 = JSON.parse(localStorage.getItem(V1_KEY));
    if (v1) {
      github = typeof v1.github === "string" ? v1.github : null;
      leetcode = Array.isArray(v1.leetcode) ? v1.leetcode[0] ?? null : null;
    }
  } catch {
    /* no v1 data */
  }
  if (!leetcode) {
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_LC_KEY));
      if (Array.isArray(legacy)) leetcode = legacy[0] ?? null;
    } catch {
      /* no legacy data */
    }
  }

  const initial = normalize({ github, leetcode });
  if (initial.github || initial.leetcode) persist(initial);
  return initial;
}

function persist(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

function applyLocal(next) {
  snapshot = normalize(next);
  persist(snapshot);
  listeners.forEach((fn) => fn());
  return snapshot;
}

/** Link a GitHub username — validates caller-side, saves locally + to DB when signed in. */
export async function connectGitHub(username) {
  const next = { ...snapshot, github: username.trim().replace(/^@/, "") };
  applyLocal(next);
  if (getToken()) await saveConnectionsToDatabase(next);
  return next;
}

export async function disconnectGitHub() {
  const next = { ...snapshot, github: null };
  applyLocal(next);
  if (getToken()) await saveConnectionsToDatabase(next);
  return next;
}

export async function connectLeetCode(username) {
  const next = { ...snapshot, leetcode: username.trim().replace(/^@/, "") };
  applyLocal(next);
  if (getToken()) await saveConnectionsToDatabase(next);
  return next;
}

export async function disconnectLeetCode() {
  const next = { ...snapshot, leetcode: null };
  applyLocal(next);
  if (getToken()) await saveConnectionsToDatabase(next);
  return next;
}

/** Hydrates from the backend after sign-in (does not write back). */
export function replaceConnections(connections) {
  applyLocal(connections ?? { github: null, leetcode: null });
}

export function getConnections() {
  return snapshot;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useConnections() {
  return useSyncExternalStore(subscribe, getConnections);
}
