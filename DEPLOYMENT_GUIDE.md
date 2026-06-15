# Lenscape — Deployment Guide

Deploy the **backend on Render** and the **frontend on Vercel**.

The order matters: deploy the **backend first** so you get its public URL, then
plug that URL into the frontend before deploying it.

---

## Prerequisites

- [ ] Code pushed to GitHub (two repos or one monorepo with both folders)
- [ ] A [Render](https://render.com) account
- [ ] A [Vercel](https://vercel.com) account
- [ ] Firebase project (`lenscape-25955`) with Firestore + Auth enabled
- [ ] The Firebase **service account JSON** file contents handy
- [ ] Gmail App Password, Cloudinary credentials

> Make sure `*firebase-adminsdk*.json` and `.env` are in `.gitignore`
> (they already are). Never commit secrets.

---

## PART 1 — Backend on Render

### 1.1 Create the Web Service
1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo, pick the repo containing `Lenscape_Backend`
3. Configure:
   - **Name:** `lenscape-api` (any name)
   - **Root Directory:** `Lenscape_Backend` (only if it's inside a monorepo; leave blank if the backend is the repo root)
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -c gunicorn_config.py wsgi:app`
   - **Instance Type:** Free (or paid for no cold starts)

### 1.2 Set Environment Variables
In the service → **Environment** tab, add each key:

| Key | Value |
|---|---|
| `FLASK_ENV` | `production` |
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` *(fill after Part 2, see 3.1)* |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | *paste the entire service-account JSON on one line* |
| `ADMIN_SECRET_KEY` | your master admin key |
| `ADMIN_JWT_SECRET` | a long random string |
| `USER_JWT_SECRET` | a long random string |
| `OTP_SECRET` | a long random string |
| `MAIL_SERVER` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | your Gmail address |
| `MAIL_PASSWORD` | your 16-char Gmail App Password |
| `MAIL_DEFAULT_SENDER` | your Gmail address |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |

> **Firebase credentials on Render:** Render has no file system for uploads, so
> use `FIREBASE_SERVICE_ACCOUNT_JSON` (the full JSON string) instead of the file
> path. The backend already supports this. To get a single-line value, open the
> JSON file, copy everything, and paste it as the value — Render handles
> multi-line values fine, but if it complains, minify the JSON first.

> Do **not** set `PORT` — Render injects it automatically and
> `gunicorn_config.py` reads it.

### 1.3 Deploy
- Click **Create Web Service**. Render runs the build + start commands.
- When live, you get a URL like `https://lenscape-api.onrender.com`.
- Test it: open `https://lenscape-api.onrender.com/api/health` → should return
  `{"status":"healthy","service":"lenscape-api"}`.

**Copy this backend URL — you need it for the frontend.**

---

## PART 2 — Frontend on Vercel

### 2.1 Import the Project
1. Vercel Dashboard → **Add New** → **Project**
2. Import the repo containing `Lenscape_frontend`
3. Configure:
   - **Root Directory:** `Lenscape_frontend` (only if monorepo)
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

### 2.2 Set Environment Variables
In **Settings → Environment Variables**, add (Production scope):

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://lenscape-api.onrender.com` *(your Render URL, no trailing slash)* |
| `VITE_FIREBASE_API_KEY` | from Firebase web config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `lenscape-25955.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `lenscape-25955` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `lenscape-25955.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase web config |
| `VITE_FIREBASE_APP_ID` | from Firebase web config |

> Vite inlines `VITE_*` vars at **build time**, so after changing any of these
> you must **redeploy** (not just restart).

### 2.3 Deploy
- Click **Deploy**. Vercel builds and serves `dist/`.
- You get a URL like `https://lenscape.vercel.app`.
- The included `vercel.json` rewrites all routes to `index.html`, so deep links
  (`/admin`, `/profile`, `/gallery`) work correctly.

---

## PART 3 — Connect the two

### 3.1 Allow the frontend origin on the backend
1. Go back to Render → your service → **Environment**
2. Set `CORS_ORIGINS` to your exact Vercel URL, e.g.
   `https://lenscape.vercel.app`
   - For multiple domains, comma-separate:
     `https://lenscape.vercel.app,https://www.lenscape.com`
3. Save — Render redeploys automatically.

### 3.2 Authorize the domain in Firebase
1. Firebase Console → **Authentication → Settings → Authorized domains**
2. Add your Vercel domain: `lenscape.vercel.app`
   (and any custom domain). This is required for Google Sign-In popups to work.

### 3.3 Create the first admin
With both deployed, register an admin by visiting `/admin/login` on your live
site and submitting **name + email + password + the `ADMIN_SECRET_KEY`** you set
on Render. The first valid submission creates the admin account.

---

## PART 4 — Verify everything

- [ ] `GET https://lenscape-api.onrender.com/api/health` returns healthy
- [ ] Frontend loads at the Vercel URL
- [ ] Google Sign-In works (popup completes, redirects to profile setup)
- [ ] Email signup sends an OTP and verifies
- [ ] A submission uploads to Cloudinary and appears in the admin queue
- [ ] Admin can approve/reject; approved art shows in the gallery
- [ ] Voting and comments work while logged in

---

## Updating after deploy

- **Push to GitHub** → both Render and Vercel auto-redeploy from the connected
  branch (usually `main`).
- Changed a `VITE_*` env var? Trigger a fresh Vercel deploy so it gets baked in.
- Changed a backend env var? Render redeploys automatically on save.

---

## Common issues

| Symptom | Fix |
|---|---|
| CORS error in browser console | `CORS_ORIGINS` on Render must exactly match the Vercel URL (scheme + host, no trailing slash) |
| Google Sign-In popup error | Add the Vercel domain to Firebase Authorized domains |
| `Firebase ... credential` error on Render | `FIREBASE_SERVICE_ACCOUNT_JSON` missing or malformed — paste the full JSON |
| API calls hit `localhost:5000` in production | `VITE_API_URL` not set on Vercel, or you didn't redeploy after setting it |
| First request very slow | Render Free tier cold-start (~30s). Upgrade instance to avoid sleeping |
| OTP email never arrives | Use a Gmail **App Password**, not your account password; check spam |
| Deep link 404 on refresh | Ensure `vercel.json` is committed (handles SPA rewrites) |

---

## Quick reference

**Backend start command (Render):**
```
gunicorn -c gunicorn_config.py wsgi:app
```

**Local dev:**
```bash
# backend
cd Lenscape_Backend && python app.py        # http://localhost:5000

# frontend
cd Lenscape_frontend && npm run dev          # http://localhost:5173
```
