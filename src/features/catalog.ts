import { type ComponentType, type LazyExoticComponent, lazy } from "react";

import type { FeatureEntrypoint, FeatureSurface } from "@/features/entrypoint";

type EntrypointModule = { entrypoint?: FeatureEntrypoint };
type ViewModule = { View?: ComponentType };

const entrypoints = import.meta.glob<EntrypointModule>("./*/entrypoint.ts", {
  eager: true,
});
const views = import.meta.glob<ViewModule>("./*/workspace/view*.tsx");

export interface FeatureRouteEntry {
  path: string;
  surface: FeatureSurface;
  View: LazyExoticComponent<ComponentType>;
}

export interface Feature {
  id: string;
  label: string;
  isDefault: boolean;
  routes: FeatureRouteEntry[];
}

function fail(message: string): never {
  throw new Error(`[features] ${message}`);
}

function resolveFeature(dir: string, mod: EntrypointModule): Feature {
  const declared = mod.entrypoint;
  if (declared === undefined) {
    fail(
      `features/${dir}/entrypoint.ts must export 'entrypoint' (see features/entrypoint.ts)`,
    );
  }
  if (declared.id !== dir) {
    fail(
      `features/${dir}/entrypoint.ts declares id '${declared.id}' — the id is the folder name; set it to '${dir}' or rename the folder`,
    );
  }
  const routes = declared.routes.map((route): FeatureRouteEntry => {
    const surface = route.surface ?? declared.surface ?? "app";
    const file = route.view ?? "view.tsx";
    const load = views[`./${dir}/workspace/${file}`];
    if (load === undefined) {
      fail(
        `features/${dir} declares route '${route.path}' but workspace/${file} does not exist — add the view or fix the entrypoint`,
      );
    }
    const View = lazy(async () => {
      const loaded = await load();
      if (loaded.View === undefined) {
        fail(
          `features/${dir}/workspace/${file} must export a component named 'View'`,
        );
      }
      return { default: loaded.View };
    });
    return { path: route.path, surface, View };
  });
  return {
    id: declared.id,
    label: declared.label,
    isDefault: declared.default === true,
    routes,
  };
}

function buildCatalog(): readonly Feature[] {
  const features = Object.entries(entrypoints).map(([path, mod]) =>
    resolveFeature(path.split("/")[1] ?? path, mod),
  );
  const owners = new Map<string, string>();
  for (const feature of features) {
    for (const route of feature.routes) {
      const key = `${route.surface}:${route.path}`;
      const owner = owners.get(key);
      if (owner !== undefined) {
        fail(
          `route path '${route.path}' is claimed by both '${owner}' and '${feature.id}' — a path has one owner`,
        );
      }
      owners.set(key, feature.id);
    }
  }
  if (features.filter((f) => f.isDefault).length > 1) {
    fail(
      "more than one entrypoint claims `default: true` — the index has one owner",
    );
  }
  return Object.freeze(features);
}

export const FEATURES: readonly Feature[] = buildCatalog();
export const DEFAULT_PATH: string | undefined = FEATURES.find(
  (f) => f.isDefault,
)?.routes[0]?.path;
