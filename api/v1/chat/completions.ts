const OPENAI_BASE_URL = "https://api.openai.com/v1";

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
    res.status(503).json({
      error: "Ask AI is temporarily unavailable while the server is being configured.",
      code: "AI_NOT_CONFIGURED",
    });
    return;
  }

  const upstreamURL = `${OPENAI_BASE_URL}/chat/completions`;
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
