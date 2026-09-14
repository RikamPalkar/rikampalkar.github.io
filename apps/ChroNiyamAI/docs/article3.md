# Deploying ChroNiyamAI Securely with Vercel Functions (Part 3)

## Abstract
In Part 1, we identified why exposing OpenAI API keys in a Vite frontend is unsafe. In Part 2, we explored Azure Functions as a production serverless proxy option.

This article shows how to deploy the same ChroNiyamAI proxy using **Vercel Functions**. Vercel is a practical alternative when Azure setup is blocking progress. It has a free Hobby tier for eligible personal projects, and the existing `api/chat.ts` handler is already compatible with the Vercel deployment model.

> Hosting may be free within provider limits. OpenAI API usage is separate and is not free.

---

## 1. Current ChroNiyamAI Architecture

The production request path is:

```text
Browser
  -> /api/chat
  -> Vercel Function: api/chat.ts
  -> OpenAI API
```

The browser never receives `OPENAI_API_KEY`. The key is stored as a Vercel server-side environment variable and read by the function through:

```typescript
const apiKey = process.env.OPENAI_API_KEY
```

The frontend already sends requests to `/api/chat` when a local `VITE_OPENAI_API_KEY` is not available.

---

## 2. Prerequisites

- A GitHub repository containing ChroNiyamAI
- A Vercel account
- A valid OpenAI API key
- The project builds locally with `npm run build`

Before deploying, rotate any key that was previously exposed in a browser bundle or committed file.

---

## 3. Prepare the Repository

The ChroNiyamAI app already contains the important Vercel files:

```text
apps/ChroNiyamAI/
├── api/
│   └── chat.ts
├── src/
├── package.json
├── vercel.json
└── vite.config.ts
```

The `api/chat.ts` file handles:

- Conversation extraction
- AI duration suggestions
- HTTP method validation
- Request payload validation
- Secure server-side key access
- OpenAI error forwarding

Run local checks before deployment:

```bash
cd apps/ChroNiyamAI
npm install
npm run build
npm run lint
```

---

## 4. Import the Project into Vercel

1. Open the Vercel dashboard at `https://vercel.com`.
2. Click **Add New → Project**.
3. Import the GitHub repository containing the website.
4. Configure the project root directory as:

```text
apps/ChroNiyamAI
```

5. Use these build settings:

| Setting | Value |
| :--- | :--- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> 📷 *[Screenshot Placeholder: Vercel - Import Repository and Root Directory]*

> 📷 *[Screenshot Placeholder: Vercel - Vite Build Settings]*

---

## 5. Add the Server-Side OpenAI Key

Do not add the key as a `VITE_` variable in Vercel. `VITE_` variables are intended for browser-exposed values and are embedded into the client build.

In Vercel:

1. Open **Project Settings**.
2. Select **Environment Variables**.
3. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: your real OpenAI API key
   - **Environments**: Production, Preview, and Development as needed
4. Optionally add:
   - **Name**: `OPENAI_MODEL`
   - **Value**: `gpt-4o-mini`
5. Save the variables.

> 📷 *[Screenshot Placeholder: Vercel - Environment Variables Page]*

Important distinction:

```text
.env.local                         Local only, ignored by Git
.env.example                       Safe placeholder template
VITE_OPENAI_API_KEY                Browser-visible; do not use in production
OPENAI_API_KEY                     Server-only Vercel Function secret
```

After changing environment variables, redeploy the project. Existing deployments do not automatically receive newly added variables.

---

## 6. Deploy

From the Vercel dashboard, click **Deploy**. Vercel will:

1. Install dependencies.
2. Run `npm run build`.
3. Publish the Vite `dist` directory.
4. Deploy `api/chat.ts` as a serverless Edge Function.

The resulting URLs usually include:

```text
https://your-project-name.vercel.app
```

> 📷 *[Screenshot Placeholder: Vercel - Successful Deployment]*

---

## 7. Test the Hosted Function

Open the deployed site and test:

1. Start a conversation.
2. Send a task by text or voice.
3. Confirm that the live matrix updates.
4. Open a task and click **AI Fill**.
5. Confirm that duration and free-slot suggestions work.

You can also test the endpoint directly from a terminal. Do not include an API key in this request:

```bash
curl -i -X POST https://your-project-name.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "action": "suggest-duration",
    "title": "Prepare a project presentation",
    "currentHours": 1
  }'
```

The response should come from the Vercel Function, which calls OpenAI privately.

---

## 8. Security Verification

### Check the client bundle

After building, search the static output:

```bash
npm run build
grep -R "sk-proj-" dist/
grep -R "api.openai.com" dist/
```

The first command should return no real key. The second should not show a direct frontend OpenAI request in the production client path.

### Check browser DevTools

In the browser Network tab:

- You should see requests to `/api/chat`.
- You should not see `Authorization: Bearer sk-...` in browser requests.
- OpenAI should be called only from the Vercel Function.

> 📷 *[Screenshot Placeholder: Browser DevTools - Request to /api/chat Without API Key]*

### Check Vercel logs

Open **Vercel Project → Deployments → Functions / Logs** and confirm that requests reach the function. Never log the API key or full authorization headers.

> 📷 *[Screenshot Placeholder: Vercel - Function Logs]*

---

## 9. Troubleshooting

### Error: `OPENAI_API_KEY is not configured`

Verify that:

- The variable name is exactly `OPENAI_API_KEY`.
- It was added to the correct Vercel project.
- The selected environment includes the current deployment.
- You redeployed after saving the variable.

### Error: `404 /api/chat`

Verify that:

- The Vercel project root is `apps/ChroNiyamAI`.
- `api/chat.ts` exists inside that root.
- The deployment completed successfully.

### Local development does not use the proxy

For local direct testing, `.env.local` may contain `VITE_OPENAI_API_KEY`. For production testing, remove that client variable from the Vercel project and use only `OPENAI_API_KEY` in the server environment.

### CORS errors

When the frontend and function share the same Vercel deployment, `/api/chat` is same-origin and normally avoids cross-origin configuration. If the function is deployed separately, configure the function's allowed origin for the frontend domain.

---

## 10. Final Checklist

- [ ] Rotate previously exposed keys.
- [ ] Import the repository into Vercel.
- [ ] Set root directory to `apps/ChroNiyamAI`.
- [ ] Add `OPENAI_API_KEY` as a server-side Vercel environment variable.
- [ ] Do not add `VITE_OPENAI_API_KEY` to production settings.
- [ ] Redeploy after saving environment variables.
- [ ] Verify `/api/chat` in browser DevTools.
- [ ] Confirm no secret appears in `dist/`.
- [ ] Test conversation, AI Fill, validation, and persistence.

## Conclusion
Vercel Functions provide a low-friction production path for ChroNiyamAI. The frontend remains a fast static Vite application, while the serverless function protects the OpenAI credential and preserves the existing structured AI workflow.

This approach avoids the Azure-specific setup while maintaining the essential security boundary: browser requests go to your proxy, and only the proxy talks to OpenAI with the private key.
