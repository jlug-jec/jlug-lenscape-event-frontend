# Netlify Frontend Environment

Use this block with **Netlify → Environment variables → Add a variable → Import from a .env file**.

```env
NODE_VERSION=20

VITE_API_URL=https://lenscape-backend.onrender.com

VITE_FIREBASE_API_KEY=PASTE_FIREBASE_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=lenscape-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lenscape-2026
VITE_FIREBASE_STORAGE_BUCKET=PASTE_FIREBASE_WEB_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=PASTE_FIREBASE_WEB_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=PASTE_FIREBASE_WEB_APP_ID

VITE_GA_MEASUREMENT_ID=G-1FLVZMZWDT
```

Get the Firebase web values from:

Firebase Console → Project settings → General → Your apps → Web app config.

Do **not** add `FIREBASE_SERVICE_ACCOUNT_JSON` here. That private-key JSON belongs only in the backend/Render environment.
