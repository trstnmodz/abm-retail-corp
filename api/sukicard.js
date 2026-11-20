// Vercel serverless proxy: the browser talks to /api/sukicard, this forwards to your Supabase Edge Function.
// This avoids browser CORS errors. Optional env vars in Vercel > Settings > Environment Variables:
//   SUKICARD_URL  (only if the function URL changes)
//   SUPABASE_KEY  (only if you rotate the publishable key)
const TARGET = process.env.SUKICARD_URL || "https://battnrlnxmtqeyhdtlab.supabase.co/functions/v1/sukicard";
// Publishable key: safe to keep here. NEVER put a secret / service_role key in this file.
const KEY = process.env.SUPABASE_KEY || "sb_publishable_6hCB7QKkiuCgNLRM362aqA_gAVJs4Cn";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  try {
    const r = await fetch(TARGET, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": KEY },
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
