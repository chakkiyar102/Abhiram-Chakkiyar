const OPENAI_BASE_URL = "https://api.openai.com/v1";

function getPathSegments(pathParam: string | string[] | undefined) {
  if (!pathParam) return [];
  if (Array.isArray(pathParam)) return pathParam;
  return [pathParam];
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST,OPTIONS");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      error:
        "Server misconfiguration: OPENAI_API_KEY is not set. Add it in Vercel project environment variables.",
    });
    return;
  }

  const path = getPathSegments(req.query.path).join("/");

  if (path !== "chat/completions") {
    res.status(404).json({ error: "Only /chat/completions is supported" });
    return;
  }

  const upstreamURL = `${OPENAI_BASE_URL}/${path}`;
  const requestBody =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});

  try {
    const upstreamResponse = await fetch(upstreamURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });

    const responseText = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";

    res.status(upstreamResponse.status);
    res.setHeader("Content-Type", contentType);
    res.send(responseText);
  } catch (error) {
    res.status(502).json({
      error: "Failed to reach OpenAI upstream",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
