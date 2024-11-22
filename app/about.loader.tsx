import { data } from "react-router";

export default async function load() {
  await new Promise(resolve => setTimeout(resolve, 200));

  let isServer = typeof document === "undefined";
  let env = isServer ? "server" : "client";

  return data(
    { message: `About loader from ${env} loader` },
    {
      headers: { "X-Custom": "Hello" },
    },
  );
}
