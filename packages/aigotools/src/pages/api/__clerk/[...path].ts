import type { NextApiRequest, NextApiResponse } from "next";

const clerkFrontendApi = "https://clerk.saasdance.com";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
      const lowerKey = key.toLowerCase();

      if (
        !value ||
        [
          "host",
          "content-length",
          "content-encoding",
          "accept-encoding",
        ].includes(lowerKey)
      ) {
        return;
      }

      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    });

    const rawBody =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await readRawBody(req);
    const requestInit: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
      body: rawBody?.length ? rawBody : undefined,
      redirect: "manual",
    };

    if (requestInit.body) {
      requestInit.duplex = "half";
    }

    const response = await fetch(targetUrl, requestInit);
    const body = Buffer.from(await response.arrayBuffer());
    const safeHeaders = [
      "cache-control",
      "content-type",
      "location",
      "set-cookie",
    ];

    safeHeaders.forEach((key) => {
      const value = response.headers.get(key);

      if (value) {
        res.setHeader(key, value);
      }
    });
    res.setHeader("access-control-allow-origin", "*");
    res.status(response.status).send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    res.status(502).json({
      error: "Clerk proxy failed",
      message,
    });
  }
}
