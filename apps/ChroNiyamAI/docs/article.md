# Securing API Keys in Modern Single-Page Applications: A Real-World Refactoring Guide with ChroNiyamAI

## Abstract
Single-Page Applications (SPAs) built with modern toolchains like Vite, React, and Next.js offer incredible developer velocity and client-side performance. However, when SPAs integrate third-party AI APIs (such as OpenAI, Anthropic, or Azure AI), developers frequently fall into a critical security trap: exposing secret API keys in client-side code.

This article examines a real-world application — **ChroNiyamAI** (an AI-powered conversational Eisenhower Matrix planner) — to demonstrate how client-side key exposure happens, why standard `.env` techniques fail to protect secrets in SPAs, and how to systematically refactor the application to use a Serverless Proxy architecture.

---

## 1. The Real-World Scenario: ChroNiyamAI
ChroNiyamAI is an interactive web application that allows users to talk through their daily tasks via voice or text. As the user chats, the application calls OpenAI's Chat Completions API with Structured Outputs (`json_schema`) to continuously extract tasks, estimate durations, categorize them into Eisenhower Matrix quadrants, and place them on an interactive board.

### The Initial Prototype Architecture
During early local prototyping, the client utility (`src/lib/openai.ts`) contained code similar to this:

```typescript
// ❌ INSECURE PROTOTYPE PATTERN
export const continueConversation = async (history: ChatMessage[]) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Client-side environment variable

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`, // Key exposed in HTTP request header
    },
    body: JSON.stringify({ /* payload */ }),
  });

  return response.json();
};
```

---

## 2. The Problem: Why Client-Side Secrets Are Broken by Design

### Misconception #1: "It's in `.env.local`, so it's safe"
Many developers assume that putting credentials in `.env.local` or `.env` keeps them private because `.env.local` is listed in `.gitignore`. 

While `.gitignore` prevents the file from being committed to source control (Git), **bundlers like Vite, webpack, and Rollup compile `import.meta.env.VITE_*` variables directly into static string literals inside the compiled JavaScript bundle**.

When you run `npm run build`, Vite transforms:
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
```
into:
```javascript
const apiKey = "sk-proj-a1b2c3d4e5f6...";
```

### Misconception #2: "Users won't inspect the code"
Anyone visiting your hosted application can:
1. Open Browser DevTools (`F12`).
2. Navigate to the **Network** tab and inspect any outgoing request to `api.openai.com` to read the raw `Authorization: Bearer sk-...` header.
3. Search the static JS bundle under the **Sources** tab for `sk-` or `Authorization`.

### The Consequences
- **Unlimited Financial Exposure**: Attackers can extract your key and use your API quota for their own LLM workloads.
- **Immediate Revocation**: Automated GitHub bots and credential scanners (like GitGuardian and OpenAI's secret scanner) will automatically detect and revoke leaked keys if deployed or committed.

---

## 3. The Solution: Serverless Proxy Architecture

To eliminate client-side key exposure without re-architecting the frontend into a monolithic server-rendered app, we introduce a **Serverless Proxy Endpoint**.

### Architectural Comparison

#### Before (Client-Exposed Model)
```
[ Browser / Frontend ] ───(Includes API Key in Header)───> [ OpenAI API ]
```

#### After (Serverless Proxy Model)
```
[ Browser / Frontend ] ───(Calls relative /api/chat)───> [ Serverless Function ] ───(Private Key)───> [ OpenAI API ]
```

---

## 4. Implementation Steps (Refactoring Progress)

### Step 1: Serverless Proxy Implementation (`api/chat.ts`)
We created a Serverless Edge Function in `api/chat.ts` that safely accesses `process.env.OPENAI_API_KEY` on the server:

```typescript
// Serverless handler (api/chat.ts)
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY; // Never exposed to the browser
  // ... validates payload and forwards to https://api.openai.com/v1/chat/completions
}
```

### Step 2: Client Fallback & Proxy Routing (`src/lib/openai.ts`)
The client wrapper was refactored so that if a local `VITE_OPENAI_API_KEY` is set during local development, it can use it directly; otherwise, in production, it routes requests through the relative endpoint `/api/chat`:

```typescript
// src/lib/openai.ts
if (clientKey && clientKey !== 'your-openai-api-key') {
  // Local direct mode
  return fetchDirectFromOpenAI(...);
}

// Production Serverless Proxy route
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'continue-conversation', messages: history }),
});
```

### Step 3: Vercel Rewrites Configuration (`vercel.json`)
Added a route rewrite configuration in `vercel.json` to transparently route `/api/*` calls to the serverless function handler:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### Step 4: Security Hardening & Input Bounds (`api/chat.ts`)
To prevent malicious actors from using your proxy as an arbitrary gateway or bombarding the backend with oversized payloads, we added strict input validation:

```typescript
// Payload validation inside handler (api/chat.ts)
if (action === 'suggest-duration') {
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 300) {
    return new Response(JSON.stringify({ error: 'Invalid task title provided' }), { status: 400 });
  }
} else if (action === 'continue-conversation') {
  if (!Array.isArray(messages) || messages.length > 50) {
    return new Response(JSON.stringify({ error: 'Invalid or excessive conversation history' }), { status: 400 });
  }
} else {
  return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 400 });
}
```

### Step 5: Build Artifact Auditing (`dist/`)
Before deploying, we run `npm run build` and search the resulting `dist/` directory to verify that no secret keys or `Authorization` headers appear in the static assets:

```bash
npm run build
grep -rn "sk-proj-" dist/ # Returns 0 results
```

---

## 5. Best Practices Checklist
- [x] **Never prefix secret keys with `VITE_`, `REACT_APP_`, or `NEXT_PUBLIC_`** if they belong to paid or administrative third-party APIs.
- [x] **Enforce serverless proxy authentication, payload caps, and method validation** to prevent unauthenticated users from abusing your proxy endpoint.
- [x] **Keep `.env.example` in Git as a placeholder template**, while keeping actual credentials in `.env.local` (for local dev) and serverless provider secret settings (for production).
- [x] **Audit production build artifacts** (`dist/`) before deploying.

---

## 6. Key Resolution Summary: Where Does the App Read Keys From?

Understanding how API key resolution works across environments is essential for maintaining both developer velocity and production security:

| Environment | Key Location | Mechanism | Security Profile |
| :--- | :--- | :--- | :--- |
| **Local Development** (`npm run dev`) | `.env.local` (git-ignored) | `import.meta.env.VITE_OPENAI_API_KEY` in `src/lib/openai.ts` | Safe for local machine testing; key is ignored by Git. |
| **Production Build** (`npm run build`) | Serverless Provider Environment Variables | `/api/chat` Edge Function (`process.env.OPENAI_API_KEY`) | **Zero keys baked into `dist/` bundle.** Secret lives strictly on the serverless host. |

---

## 7. Configuring Hosted Environment Variables

Once your serverless backend proxy is in place, you need to configure your secret `OPENAI_API_KEY` on your cloud provider. Here is how to configure it across major hosting platforms:

### 1. On Vercel
- Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**.
- Add:
  - **Key**: `OPENAI_API_KEY`
  - **Value**: `sk-proj-...`

---

### 2. On Netlify
- Go to **Netlify Site Configuration → Environment Variables**.
- Add:
  - **Key**: `OPENAI_API_KEY`
  - **Value**: `sk-proj-...`

---

### 3. On Azure (App Service / Azure Functions)
- Go to **Azure Portal → Your Function App → Configuration → Application Settings**.
- Add:
  - **Name**: `OPENAI_API_KEY`
  - **Value**: `sk-proj-...`

---

## 8. What's Next: Part 2 Teaser
In **Part 2** of this series, we will take a deep dive into Microsoft Azure infrastructure:
- **Step-by-Step Azure Functions Setup**: Creating an Azure Function App, setting up HTTP triggers, and configuring Azure Key Vault / Application Settings.
- **Enterprise Deployment Pipeline**: Deploying the serverless proxy to Azure Functions and wiring it with GitHub Actions CI/CD.

Check out [Part 2: Step-by-Step Azure Functions Setup & Production Deployment](./article2.md) for the complete guide.

---

## 9. Conclusion
By decoupling AI API calls from the client application and routing them through a lightweight Edge serverless function, ChroNiyamAI achieves full API key security while retaining the speed and responsiveness of a modern SPA. Developers can safely deploy to platforms like Vercel, Netlify, or Azure without risking credential leaks or financial exposure.


