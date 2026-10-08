import { Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router";

import { App } from "@/app/app-root";
import { NotFound } from "@/app/not-found";
import {
  DEFAULT_PATH,
  FEATURES,
  type FeatureRouteEntry,
} from "@/features/catalog";

function toRoute(route: FeatureRouteEntry): RouteObject {
  const path = route.path.replace(/^\//, "");
  const View = route.View;
  return {
    path,
    element: (
      <Suspense fallback={null}>
        <View />
      </Suspense>
    ),
  };
}

const routesFor = (surface: FeatureRouteEntry["surface"]) =>
  FEATURES.flatMap((f) =>
    f.routes.flatMap((r) => (r.surface === surface ? [toRoute(r)] : [])),
  );

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      ...routesFor("public"),
      ...routesFor("app"),
      ...(DEFAULT_PATH !== undefined && DEFAULT_PATH !== "/"
        ? [{ index: true, element: <Navigate to={DEFAULT_PATH} replace /> }]
        : []),
      { path: "*", element: <NotFound /> },
    ],
  },
]);
