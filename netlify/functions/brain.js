// SBU Command brain. Netlify serverless function.
// Holds your Anthropic API key on the server so the browser never sees it.
// Setup: in Netlify, add an environment variable named ANTHROPIC_API_KEY.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const incoming = JSON.parse(event.body || "{}");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: incoming.model || "claude-sonnet-4-6",
        max_tokens: incoming.max_tokens || 1000,
        system: incoming.system,
        messages: incoming.messages,
        tools: incoming.tools
      })
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Brain call failed", detail: String(err) })
    };
  }
};
