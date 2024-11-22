import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import routes from "./app/routes.js";
import { createBrowserRouter } from "react-router";

let router = createBrowserRouter(routes, {
  // need to ensure this script runs AFTER <StaticRouterProvider> in
  // entry.server.tsx so that window.__staticRouterHydrationData is available
  hydrationData: window.__staticRouterHydrationData,
});

hydrateRoot(
  document,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// type stuff
declare global {
  interface Window {
    __staticRouterHydrationData: any;
  }
}
