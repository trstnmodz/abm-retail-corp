// Vercel serverless proxy: the browser talks to /api/sukicard, this forwards to your Base44 function.
// This avoids browser CORS errors. Optional: set SUKICARD_URL in Vercel > Settings > Environment Variables.
const TARGET = process.env.SUKICARD_URL || "https://abmsukicard.base44.app/functions/sukicard";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  try {
    const r = await fetch(TARGET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });
    const t = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(t);
  } catch (e) {
    return res.status(502).json({ ok: false, error: "proxy_failed" });
  }
};
