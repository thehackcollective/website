export type FeatureSurface = "public" | "app";

interface FeatureRoute {
  path: string;
  view?: `view${string}.tsx`;
  surface?: FeatureSurface;
}

export interface FeatureEntrypoint {
  id: string;
  label: string;
  routes: FeatureRoute[];
  surface?: FeatureSurface;
  default?: boolean;
}
