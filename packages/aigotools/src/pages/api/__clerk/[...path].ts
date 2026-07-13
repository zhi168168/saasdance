import type { NextApiRequest, NextApiResponse } from "next";

const clerkFrontendApi = "https://clerk.saasdance.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const query = { ...req.query };

  delete query.path;

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
    } else if (value) {
      searchParams.append(key, value);
    }
  });

  const targetUrl = `${clerkFrontendApi}/${path}${
    searchParams.size ? `?${searchParams.toString()}` : ""
  }`;
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (!value || key === "host" || key === "content-length") {
      return;
    }

    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : (req as any),
    redirect: "manual",
  });
  const body = Buffer.from(await response.arrayBuffer());

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "content-encoding") {
      return;
    }

    res.setHeader(key, value);
  });
  res.setHeader("access-control-allow-origin", "*");
  res.status(response.status).send(body);
}
