import type { FeatureEntrypoint } from "@/features/entrypoint";

export const entrypoint: FeatureEntrypoint = {
  id: "website",
  label: "The Hack Collective",
  surface: "public",
  default: true,
  routes: [{ path: "/" }],
};
