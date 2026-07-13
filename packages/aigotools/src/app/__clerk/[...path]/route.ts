import { NextRequest } from "next/server";

const clerkFrontendApi = "https://clerk.saasdance.com";

async function proxyClerkRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const targetUrl = new URL(
    `${clerkFrontendApi}/${params.path.join("/")}${request.nextUrl.search}`
  );
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const GET = proxyClerkRequest;
export const POST = proxyClerkRequest;
export const PUT = proxyClerkRequest;
export const PATCH = proxyClerkRequest;
export const DELETE = proxyClerkRequest;
