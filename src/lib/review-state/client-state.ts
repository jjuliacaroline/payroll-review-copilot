"use client";

import type { DemoReviewState } from "./types";

const CLIENT_DEMO_REVIEW_STATE_KEY = "payroll_review_demo_client_state_v1";
const CLIENT_DEMO_REVIEW_STATE_EVENT = "payroll-review-demo-state-updated";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDemoReviewState(value: unknown): value is DemoReviewState {
  if (!isObject(value)) {
    return false;
  }

  return isObject(value.anomalyStates) && Array.isArray(value.auditEvents);
}

export function readClientDemoReviewState() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CLIENT_DEMO_REVIEW_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isDemoReviewState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeClientDemoReviewState(reviewState: DemoReviewState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLIENT_DEMO_REVIEW_STATE_KEY, JSON.stringify(reviewState));
  window.dispatchEvent(new CustomEvent(CLIENT_DEMO_REVIEW_STATE_EVENT));
}

export function clearClientDemoReviewState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CLIENT_DEMO_REVIEW_STATE_KEY);
  window.dispatchEvent(new CustomEvent(CLIENT_DEMO_REVIEW_STATE_EVENT));
}

export function subscribeToClientDemoReviewState(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CLIENT_DEMO_REVIEW_STATE_KEY) {
      onChange();
    }
  };

  window.addEventListener(CLIENT_DEMO_REVIEW_STATE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CLIENT_DEMO_REVIEW_STATE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}
