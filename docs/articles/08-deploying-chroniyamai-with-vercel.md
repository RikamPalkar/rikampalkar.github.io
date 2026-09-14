# Deploying ChroNiyamAI with Vercel

## Abstract

The first seven articles in this series explain how this personal website is organized as a monorepo and deployed to GitHub Pages. That model works well for static applications, but ChroNiyamAI adds a new requirement: it needs a backend API route that can call OpenAI without exposing the API key in the browser.

This article continues the series by deploying ChroNiyamAI to Vercel. The goal is to keep GitHub Pages for the static portfolio apps while using Vercel for the AI-backed app that needs `/api/chat`.

Vercel is a cloud platform for frontend applications and serverless functions. It can build a Vite app, host the static frontend, run API routes, store private environment variables, create preview deployments, and show deployment logs from one project dashboard.

ChroNiyamAI should be deployed on Vercel because it is not only a static React app. It also needs the serverless `/api/chat` endpoint that safely calls OpenAI with `OPENAI_API_KEY` on the server.

GitHub Pages can continue hosting the personal portfolio and static apps. Vercel should host ChroNiyamAI because Vercel can serve both the frontend and the API function from the same deployment.

```text
User Browser
  -> ChroNiyamAI React App on Vercel
  -> /api/chat on the same Vercel deployment
  -> OpenAI API using server-side OPENAI_API_KEY
```

---

## In this series

This article extends the GitHub Pages deployment series with the Vercel path for ChroNiyamAI. Read the earlier articles for the repository structure, static deployment model, CI/CD concepts, GitHub Actions workflow, and local-to-live routine.

- [One Personal Website, One Source of Truth](01-one-personal-website-one-source-of-truth.md): Understand why the website source belongs in one active repository.
- [Monorepo Foundations for Personal Projects](02-monorepo-foundations-for-personal-projects.md): Learn the repository boundaries that keep multiple apps maintainable.
- [Deploying Static Apps with GitHub Pages](03-deploying-static-apps-with-github-pages.md): See how portfolio, TicTacToe, and ChroNiyam are assembled for static hosting.
- [Inside the Personal Website Monorepo](04-inside-the-personal-website-monorepo.md): Review the concrete folder structure and daily workflow.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Learn the concepts behind automated builds and deployments.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Learn how to inspect the GitHub Pages deployment workflow.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow the hands-on GitHub Pages deployment routine.

---

## 1. Deployment Progress

Use this section as the deployment checklist.

- [x] Added this guide as Article 08 in the main `docs/` series.
- [x] Renamed Articles 01-04 while keeping their numeric order.
- [x] Updated series links so the GitHub Pages articles point to this Vercel continuation.
- [x] Confirmed GitHub Pages is not the right final host for ChroNiyamAI API routes.
- [x] Confirmed Vercel can run `api/chat.ts` as the serverless backend.
- [x] Updated the Vite base path so Vercel builds use `/`.
- [x] Verified a Vercel-style local build with `VERCEL=1 npm --prefix apps/ChroNiyamAI run build`.
- [ ] Import `apps/ChroNiyamAI` as a Vercel project.
- [ ] Add server-side `OPENAI_API_KEY` in Vercel.
- [ ] Disable Deployment Protection for the public production deployment.
- [ ] Deploy production.
- [ ] Test the live site and `/api/chat` with curl.
- [ ] Add screenshots for Vercel settings, deployment, logs, and curl output.

---

## 2. What Vercel Is

Vercel is a deployment platform for modern web applications. It connects to a Git repository, installs dependencies, builds the app, deploys the frontend, and provides a public URL for each deployment.

For frontend frameworks such as Vite and React, Vercel behaves like a static host for the compiled frontend. Its important extra feature is that it can also run backend code through serverless functions and Edge Functions. That makes it useful when an app needs an API endpoint but does not need a full always-running server.

For ChroNiyamAI, Vercel provides four things GitHub Pages does not provide:

- A serverless `/api/chat` route.
- Private server-side environment variables.
- Function logs for debugging production requests.
- Deployment Protection controls for public production and private previews.

---

## 3. Why Vercel Instead of GitHub Pages

GitHub Pages only serves static files. It cannot run this file:

```text
apps/ChroNiyamAI/api/chat.ts
```

That endpoint is required because the frontend must not expose the OpenAI key. The browser should call `/api/chat`, and the serverless function should call OpenAI privately.

Vercel is the better host for this app because it supports:

- Vite frontend hosting
- Serverless and Edge Functions
- Private environment variables
- Deployment logs
- Preview deployments
- Production deployment protection controls

Keep these URLs conceptually separate:

```text
https://rikampalkar.github.io/                 Portfolio and static GitHub Pages apps
https://your-chroniyamai-project.vercel.app/   ChroNiyamAI frontend and /api/chat backend
```

---

## 4. Required Project Code

The Vercel project root must be:

```text
apps/ChroNiyamAI
```

Inside that folder, Vercel needs these files:

```text
apps/ChroNiyamAI/
|-- api/
|   `-- chat.ts
|-- src/
|-- package.json
|-- vercel.json
`-- vite.config.ts
```

### `vite.config.ts`

Vercel serves this app from the root of its Vercel project URL. GitHub Pages subpath builds may still need `/ChroNiyamAI/`, but Vercel builds should use `/`.

```typescript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/ChroNiyamAI/',
})
```

### `vercel.json`

Keep the API rewrite simple. This lets `/api/chat` resolve to the Vercel function.

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### `api/chat.ts`

The serverless function must read `OPENAI_API_KEY` from the server environment, not from a browser-visible `VITE_` variable.

```typescript
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  return new Response(
    JSON.stringify({ error: 'Serverless OPENAI_API_KEY is not configured.' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } },
  )
}
```

The browser calls the same-origin proxy route:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'suggest-duration',
    title,
    currentHours,
  }),
})
```

---

## 5. Local Pre-Deployment Checks

From the repository root, run:

```bash
npm --prefix apps/ChroNiyamAI install
npm --prefix apps/ChroNiyamAI run build
```

To simulate the Vercel build environment locally, run:

```bash
VERCEL=1 npm --prefix apps/ChroNiyamAI run build
```

Then check the generated asset paths:

```bash
grep -E 'src=|href=' apps/ChroNiyamAI/dist/index.html
```

For a Vercel build, the output should use root paths like this:

```html
<script type="module" crossorigin src="/assets/index-....js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-....css">
```

Also search the built output for leaked keys:

```bash
grep -R "sk-proj-" apps/ChroNiyamAI/dist/ || true
grep -R "Authorization: Bearer" apps/ChroNiyamAI/dist/ || true
```

Those commands should not find a real OpenAI key in the production bundle.

---

## 6. Import the Project in Vercel GUI

Open the Vercel dashboard:

```text
https://vercel.com
```

Then follow these steps:

1. Click **Add New**.
2. Select **Project**.
3. Import the GitHub repository that contains this monorepo.
4. Set **Root Directory** to:

```text
apps/ChroNiyamAI
```

5. Keep or set these build settings:

| Setting | Value |
| :--- | :--- |
| Framework Preset | Vite |
| Root Directory | `apps/ChroNiyamAI` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

6. Click **Deploy**.

> Screenshot placeholder: Vercel import screen with `apps/ChroNiyamAI` selected as the root directory.

> Screenshot placeholder: Vercel build settings showing Vite, `npm run build`, and `dist`.

---

## 7. Configure Environment Variables

In Vercel, open the project after import:

```text
Project -> Settings -> Environment Variables
```

Add this required variable:

| Name | Value | Environments |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | Your real OpenAI API key | Production, Preview, Development as needed |

Optionally add this variable:

| Name | Value | Environments |
| :--- | :--- | :--- |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production, Preview, Development as needed |

Do not add this variable in Vercel production:

```text
VITE_OPENAI_API_KEY
```

Any variable that starts with `VITE_` can be embedded into browser JavaScript. The deployed production app should use only the server-side `OPENAI_API_KEY`.

After saving or changing environment variables, redeploy. Already-created deployments do not automatically receive new environment variable values.

> Screenshot placeholder: Vercel Environment Variables page showing `OPENAI_API_KEY` and optional `OPENAI_MODEL` names, with secret values hidden.

---

## 8. Configure Deployment Protection

If production Deployment Protection is enabled, unauthenticated users and curl requests will receive this response before the request reaches `api/chat.ts`:

```json
{
  "error": {
    "message": "Protected deployment",
    "code": "401"
  },
  "protection": {
    "password_enabled": false,
    "vercel_auth_enabled": true
  }
}
```

For the public production app, disable Vercel Authentication:

```text
Project -> Settings -> Deployment Protection
```

Recommended setup:

| Environment | Recommendation | Reason |
| :--- | :--- | :--- |
| Production | Disable Vercel Authentication | Public users need to open the app and call `/api/chat` |
| Preview | Keep Vercel Authentication enabled | Preview URLs can stay private while testing |
| Development | Your choice | Usually used by the project owner only |

Deployment Protection is not API abuse protection. For a public app, use application-level controls later, such as rate limiting, origin checks, user auth, or CAPTCHA if needed.

> Screenshot placeholder: Vercel Deployment Protection settings for Production and Preview.

---

## 9. Deploy or Redeploy Production

After environment variables and protection settings are correct, create a fresh deployment.

From the Vercel GUI:

1. Open **Project**.
2. Open **Deployments**.
3. Select the latest deployment or trigger a new one from the connected Git branch.
4. Promote or redeploy the intended production deployment.

If using Git, push the current branch after committing the deployment prep changes:

```bash
git status
git add apps/ChroNiyamAI/vite.config.ts docs/08-deploying-chroniyamai-with-vercel.md
git commit -m "Document ChroNiyamAI Vercel deployment"
git push
```

Vercel should automatically build the connected branch if Git integration is enabled.

> Screenshot placeholder: Vercel successful production deployment page.

---

## 10. Test the Public App

Open the production Vercel URL:

```text
https://your-chroniyamai-project.vercel.app/
```

Test the UI:

1. Start a conversation.
2. Add a task.
3. Confirm the task appears in the matrix.
4. Open a task and use **AI Fill**.
5. Confirm that duration suggestions work.

Open browser DevTools and check the Network tab:

- Browser requests should go to `/api/chat`.
- Browser requests should not go directly to `https://api.openai.com`.
- Browser requests should not include `Authorization: Bearer sk-...`.

> Screenshot placeholder: Browser Network tab showing `/api/chat` without an OpenAI authorization header.

---

## 11. Test the API with curl

Use the production Vercel URL, not the GitHub Pages URL:

```bash
curl -i -X POST https://your-chroniyamai-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "action": "suggest-duration",
    "title": "Prepare a project presentation",
    "currentHours": 1
  }'
```

A healthy response should be `HTTP/2 200` and should include an OpenAI chat completion JSON response from the private serverless call.

> Screenshot placeholder: Terminal showing successful curl request to `/api/chat`.

If the response is `401 Protected deployment`, fix Deployment Protection for production as described above.

If the response is `500 Serverless OPENAI_API_KEY is not configured`, add `OPENAI_API_KEY` to the correct Vercel project and redeploy.

---

## 12. Check Vercel Logs

In Vercel:

```text
Project -> Deployments -> Select Deployment -> Logs
```

Look for requests to:

```text
/api/chat
```

Successful curl and browser tests should appear in the logs. Never log the OpenAI key, authorization headers, or full secret values.

> Screenshot placeholder: Vercel function logs showing `/api/chat` requests.

---

## 13. Optional Vercel CLI Workflow

The GUI flow is enough. If you also want CLI deployment, install and login to Vercel CLI:

```bash
npm install -g vercel
vercel login
```

From the app directory:

```bash
cd apps/ChroNiyamAI
vercel
```

For production:

```bash
vercel --prod
```

Set environment variables from the CLI only if you are comfortable handling secrets in your terminal:

```bash
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_MODEL production
```

Do not paste secrets into documentation, screenshots, commits, or chat messages.

---

## 14. Troubleshooting

### The site loads but assets are missing

Check the generated `dist/index.html`. On Vercel, assets should use `/assets/...`, not `/ChroNiyamAI/assets/...`.

Run:

```bash
VERCEL=1 npm --prefix apps/ChroNiyamAI run build
grep -E 'src=|href=' apps/ChroNiyamAI/dist/index.html
```

### `401 Protected deployment`

The request is blocked by Vercel before reaching your function.

Fix:

```text
Project -> Settings -> Deployment Protection -> Disable Vercel Authentication for Production
```

Then redeploy or retry the production deployment URL.

### `500 Serverless OPENAI_API_KEY is not configured`

The function is running, but the server-side key is missing.

Fix:

```text
Project -> Settings -> Environment Variables -> Add OPENAI_API_KEY -> Redeploy
```

### `404 /api/chat`

The project root is probably wrong or the function was not included in the deployment.

Fix:

```text
Root Directory: apps/ChroNiyamAI
```

Then confirm this file exists inside the selected root:

```text
api/chat.ts
```

### The app works locally but not in production

Check whether local development is using `VITE_OPENAI_API_KEY`. Production should not rely on that browser-visible key. Production should use only `OPENAI_API_KEY` in Vercel.

### The wrong URL is being tested

Use the Vercel app URL for ChroNiyamAI:

```text
https://your-chroniyamai-project.vercel.app/
```

Do not use the GitHub Pages URL for the AI-backed app unless the frontend is intentionally configured to call a separate Vercel API URL.

---

## 15. Final Production Checklist

- [ ] Vercel project root is `apps/ChroNiyamAI`.
- [ ] Build command is `npm run build`.
- [ ] Output directory is `dist`.
- [ ] `OPENAI_API_KEY` exists in Vercel server-side environment variables.
- [ ] `VITE_OPENAI_API_KEY` is not configured in Vercel production.
- [ ] Production Deployment Protection is disabled for public access.
- [ ] Preview Deployment Protection remains enabled if previews should stay private.
- [ ] The app loads at the production Vercel URL.
- [ ] Browser Network tab shows calls to `/api/chat`.
- [ ] Browser Network tab does not expose an OpenAI authorization header.
- [ ] Curl test to `/api/chat` returns a successful response.
- [ ] Vercel logs show `/api/chat` requests.
- [ ] Screenshots are added to this article.
