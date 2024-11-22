import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import routes from "./app/routes.js";
import { StrictMode } from "react";

let { query, dataRoutes, queryRoute } = createStaticHandler(routes);

export async function handler(request: Request) {
  // Decide if this is a request for data from our client loaders or the initial
  // document request for HTML. React Router Vite uses [path].data to make this
  // decision, headers could cause problems with a CDN, but it's good for
  // illustration here
  if (request.headers.get("Accept")?.includes("application/json")) {
    return handleDataRequest(request);
  } else {
    return handleDocumentRequest(request);
  }
}

export async function handleDocumentRequest(request: Request) {
  // 1. Run action/loaders to get the routing context with `query`
  let context = await query(request);

  // If `query` returns a Response, send it raw (a route probably a redirected)
  if (context instanceof Response) {
    return context;
  }

  // 2. Create a static router for SSR
  let router = createStaticRouter(dataRoutes, context);

  // 3. Render everything with StaticRouterProvider
  let html = renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );

  // Setup headers from action and loaders from deepest match
  let deepestMatch = context.matches[context.matches.length - 1];
  let actionHeaders = context.actionHeaders[deepestMatch.route.id];
  let loaderHeaders = context.loaderHeaders[deepestMatch.route.id];

  let headers = new Headers(actionHeaders);

  if (loaderHeaders) {
    for (let [key, value] of loaderHeaders.entries()) {
      headers.append(key, value);
    }
  }

  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(`<!DOCTYPE html>${html}`, {
    status: context.statusCode,
    // 4. send proper headers
    headers,
  });
}

export async function handleDataRequest(request: Request) {
  // 1. we don't want to proxy the browser request directly to our router, so we
  // make a new one.
  let newRequest =
    request.method === "POST"
      ? new Request(request.url, {
          method: request.method,
          headers: request.headers,
          // @ts-expect-error this is valid, types are wrong
          body: new URLSearchParams(await request.formData()),
        })
      : new Request(request.url, { headers: request.headers });

  // 2. get data from our router, queryRoute knows to call the action or loader
  // of the leaf route that matches
  let data = await queryRoute(newRequest);

  // 3. send the response
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
