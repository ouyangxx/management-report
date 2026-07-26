import app from "../dist/server/ssr/index.js";

const DEPLOY_MARKER = "2026-07-26-sticky-progress";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    void DEPLOY_MARKER;
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/") && (request.method === "GET" || request.method === "HEAD")) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    return app.fetch(request, env, ctx);
  },
};

export default worker;
