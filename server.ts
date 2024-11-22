import path from "node:path";
import { createRequestListener } from "@mjackson/node-fetch-server";
import { createServer } from "http";
import { handler } from "./entry.server.js";
import fs from "fs/promises";

createServer(
  createRequestListener(async request => {
    let url = new URL(request.url, "http://localhost:4000");

    if (url.pathname.endsWith(".js")) {
      return serveJSFile(url);
    }

    return handler(request);
  }),
).listen(4000, () => {
  console.log("Listening on http://localhost:4000");
});

async function serveJSFile(url: URL) {
  let filePath = path.join(process.cwd(), "public", url.pathname);
  let src = await fs.readFile(filePath, "utf-8");
  return new Response(src, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store; must-revalidate",
    },
  });
}
