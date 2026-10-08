import { lazy, Suspense } from "react";

const Agentation = lazy(() =>
  import("agentation").then((m) => ({ default: m.Agentation })),
);

export function AgentationToolbar() {
  if (import.meta.env.PROD) return null;

  return (
    <Suspense fallback={null}>
      <Agentation />
    </Suspense>
  );
}
