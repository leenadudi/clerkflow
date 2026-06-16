# Clerkflow

Route skeleton for the Clerkflow marketing site, clerk app, and resident hub.

## Run locally

```bash
cd ~/clerkflow
npm install
npm run dev
```

Open http://localhost:3000

## Deploy + domain (clerkflow.software)

1. Push this repo to GitHub.
2. Sign up at https://vercel.com and import the repo.
3. Deploy (Vercel auto-detects Next.js).
4. In Vercel → Project → Settings → Domains → add `clerkflow.software` and `www.clerkflow.software`.
5. Vercel shows DNS records. In name.com → clerkflow.software → DNS:
   - **A** record `@` → Vercel IP (shown in dashboard), or
   - **CNAME** `www` → `cname.vercel-dns.com`
6. Wait 5–60 minutes for DNS. Vercel will issue HTTPS automatically.

Email forwarding (MX records) can stay as-is on name.com — website DNS and email DNS coexist.
