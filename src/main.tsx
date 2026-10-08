import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import "@/app/globals.css";
import { router } from "@/app/router";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("missing #root");
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
