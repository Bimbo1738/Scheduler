# Deploying Mika Scheduler (Static Site)

Your project is a static website: just `index.html`, `styles.css`, `script.js` (plus README). No backend required. Below are several quick ways to publish so you can open it on any device.

---
## Option 1: GitHub Pages (Free)
**Prerequisites:** GitHub account, Git installed.
1. Create a new GitHub repository (e.g., `mika-scheduler`). Leave it Public.
2. On your computer inside this project folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial Barbie scheduler"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mika-scheduler.git
   git push -u origin main
   ```
3. In the GitHub repo: Settings > Pages.
4. Build & deployment: Source = "Deploy from a branch".
5. Branch = `main` / root (`/`), Save.
6. Wait ~1 minute; site URL will appear like: `https://<your-username>.github.io/mika-scheduler/`.
7. Share that URL.

### Update Later
Edit files locally, then:
```bash
git add .
git commit -m "Update"
git push
```
Changes redeploy automatically.

---
## Option 2: Netlify (Drag & Drop)
1. Go to https://app.netlify.com and log in (GitHub or email).
2. Drag the whole project folder onto the Netlify dashboard "Sites" area.
3. Netlify assigns a random subdomain like `sparkly-name.netlify.app`.
4. Click Site settings > Change site name (optional) to personalize.
5. Add a custom domain under Domains if you have one.

### Continuous Deployment via GitHub
- Click "Add new site" > "Import an existing project".
- Choose repo, keep build command blank, publish directory = `./`.
- Deploy.

---
## Option 3: Vercel (Fast Git Deploy)
1. Visit https://vercel.com, sign in with GitHub.
2. Import your repository.
3. Framework preset: "Other" (no build step).
4. Root directory = `./`.
5. Deploy. URL like `https://mika-scheduler.vercel.app`.

---
## Option 4: Static Hosting with Cloudflare Pages
1. Create a GitHub repo (as above) and push code.
2. Go to Cloudflare Pages > Create project > Connect to Git.
3. Select repo, no build command, output directory = `.`.
4. Deploy; URL like `https://<project>.pages.dev`.

---
## Option 5: Direct File Hosting (Temporary)
- Upload the files into a folder on Google Drive / OneDrive and create a sharing link will NOT properly serve due to CORS/mime sometimes.
- Prefer a real static host (Pages/Netlify/Vercel).

---
## Optional: Custom Domain
1. Buy domain (Namecheap, Cloudflare, etc.).
2. For GitHub Pages: add `CNAME` file containing your domain (e.g., `schedule.example.com`) and configure DNS with CNAME pointing to `<username>.github.io`.
3. For Netlify/Vercel: Add domain in dashboard; follow DNS instructions (CNAME to provided target). Wait for propagation and HTTPS auto-config.

---
## Mobile Usage & App-Like Feel (PWA Lite)
You can add a simple manifest to allow "Add to Home Screen". (Not yet implemented.) Quick steps if desired:
1. Create `manifest.webmanifest` with:
   ```json
   {
     "name": "Mika Scheduler",
     "short_name": "Scheduler",
     "start_url": ".",
     "display": "standalone",
     "background_color": "#ff5fbf",
     "theme_color": "#ff5fbf",
     "icons": []
   }
   ```
2. Add `<link rel="manifest" href="manifest.webmanifest">` inside `head` in `index.html`.
3. (Optional) Add icons (192x192, 512x512). 

Let me know if you want me to implement the PWA manifest or an automatic GitHub Pages workflow file.

---
## Quick Checklist Before Publishing
- [ ] Confirm no confidential data inside notes.
- [ ] Commit and push.
- [ ] Enable hosting (Pages/Netlify/Vercel).
- [ ] Test on mobile (orientation, scroll, print PDF).
- [ ] Print to PDF sample for archival.

Reach out if you'd like an automated CI workflow or PWA enhancement next.
