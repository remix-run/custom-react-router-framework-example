import { type LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  let res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Route-Id": "layout",
    },
  });
  return res.json();
}

export async function action({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  // call the server action
  let res = await fetch(url, {
    method: "POST",
    // @ts-expect-error this is valid, types are wrong
    body: new URLSearchParams(await request.formData()),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "X-Route-Id": "layout",
    },
  });
  return res.json();
}
