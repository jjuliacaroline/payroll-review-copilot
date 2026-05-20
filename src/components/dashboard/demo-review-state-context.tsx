"use client";

import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { demoAnomalies } from "@/lib/demo-data";
import { applyReviewMutation } from "@/lib/review-state/actions";
import {
  clearClientDemoReviewState,
  readClientDemoReviewState,
  subscribeToClientDemoReviewState,
  writeClientDemoReviewState,
} from "@/lib/review-state/client-state";
import type { DemoReviewState, ReviewMutationRequest } from "@/lib/review-state/types";

type DemoReviewStateContextValue = {
  reviewState: DemoReviewState;
  isUsingClientFallback: boolean;
  applyClientFallbackMutation: (request: ReviewMutationRequest) => void;
  clearClientFallbackState: () => void;
};

const DemoReviewStateContext = createContext<DemoReviewStateContextValue | null>(null);

type DemoReviewStateProviderProps = {
  initialReviewState: DemoReviewState;
  reviewerLabel: string;
  children: React.ReactNode;
};

export function DemoReviewStateProvider({
  initialReviewState,
  reviewerLabel,
  children,
}: DemoReviewStateProviderProps) {
  const [reviewState, setReviewState] = useState(initialReviewState);
  const [isUsingClientFallback, setIsUsingClientFallback] = useState(false);

  useEffect(() => {
    function syncFromStorage() {
      const storedState = readClientDemoReviewState();
      if (storedState) {
        setReviewState(storedState);
        setIsUsingClientFallback(true);
        return;
      }

      setReviewState(initialReviewState);
      setIsUsingClientFallback(false);
    }

    syncFromStorage();
    return subscribeToClientDemoReviewState(syncFromStorage);
  }, [initialReviewState]);

  function applyClientFallbackMutation(request: ReviewMutationRequest) {
    setReviewState((currentState) => {
      const nextState = applyReviewMutation({
        session: {
          reviewerLabel,
          sessionId: "client-demo-session",
        },
        currentState,
        anomalies: demoAnomalies,
        request,
      });

      writeClientDemoReviewState(nextState);
      return nextState;
    });
    setIsUsingClientFallback(true);
  }

  function clearClientFallbackState() {
    clearClientDemoReviewState();
    setReviewState(initialReviewState);
    setIsUsingClientFallback(false);
  }

  return (
    <DemoReviewStateContext.Provider
      value={{
        reviewState,
        isUsingClientFallback,
        applyClientFallbackMutation,
        clearClientFallbackState,
      }}
    >
      {children}
    </DemoReviewStateContext.Provider>
  );
}

export function useDemoReviewState() {
  const context = useContext(DemoReviewStateContext);
  if (!context) {
    throw new Error("useDemoReviewState must be used inside DemoReviewStateProvider.");
  }

  return context;
}
