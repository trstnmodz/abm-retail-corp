# ABM Retail Corp site (Vercel)

One site, three pages (all in `index.html`):
- `/`               landing page
- `/#downloadapk`   app download page (uses the APK link you publish under App update in the admin)
- `/#admin`         admin dashboard (PIN required)

`api/sukicard.js` forwards requests to your Base44 function. Set SUKICARD_URL in Vercel env vars only if that URL changes.

Deploy: push to GitHub, Vercel redeploys automatically.
