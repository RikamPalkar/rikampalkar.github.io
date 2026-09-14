# Architectural Plan: Securing Client-Exposed API Keys via Serverless Proxy

## Executive Summary
ChroNiyamAI is a Vite + React application that provides a real-time conversational planning experience backed by OpenAI's structured JSON chat completions. In its initial prototype phase, the frontend made direct `fetch` requests to `https://api.openai.com/v1/chat/completions` using an environment variable (`VITE_OPENAI_API_KEY`).

While suitable for local prototyping, this architecture bakes secret credentials into the static client bundle, exposing them in DevTools and making them vulnerable to extraction, quota abuse, and financial loss.

This document outlines the step-by-step implementation plan to refactor ChroNiyamAI into a secure architecture using a Serverless Backend Proxy.

---

## 1. Problem Definition & Threat Vector
- **Client Exposure**: Vite replaces `import.meta.env.VITE_*` variables at build time with literal string constants. Any client viewing `dist/assets/index-*.js` or inspecting browser Network traffic can view the raw API key.
- **Lack of Rate Limiting & Abuse Protection**: Unauthenticated clients can invoke OpenAI endpoints directly on behalf of the application owner.
- **Deployment Insecurity**: Pushing build artifacts or configuring static site environment variables in public/semi-public CI/CD pipelines exposes secret keys to static asset hosts.

---

## 2. Target Architecture
```
┌───────────────────────────┐           ┌────────────────────────────────┐           ┌───────────────────┐
│                           │           │  Serverless Proxy Function     │           │                   │
│   ChroNiyamAI Frontend    │  HTTP     │  (Netlify / Vercel / Azure)    │  HTTP     │   OpenAI API      │
│   (Vite + React Static)   │ ────────> │                                │ ────────> │                   │
│                           │  /api/chat│  - Holds private OPENAI_API_KEY│  Bearer   │   /v1/chat/...    │
│   No API Keys in Client   │           │  - Validates request payload   │  Secret   │                   │
└───────────────────────────┘           └────────────────────────────────┘           └───────────────────┘
```

---

## 3. Implementation Phases

### Phase 1: Environment & Client Refactoring
- [x] Remove `VITE_OPENAI_API_KEY` references from production client code (`src/lib/openai.ts`).
- [x] Refactor client API utilities to point to a relative API endpoint (`/api/chat`).
- [x] Maintain a local development proxy / fallback mechanism.

### Phase 2: Serverless Proxy Endpoint Implementation
- [x] Create serverless function handler (`api/chat.ts`).
- [x] Read `OPENAI_API_KEY` exclusively from secure server-side environment variables (`process.env.OPENAI_API_KEY`).
- [x] Forward structured JSON requests to OpenAI Chat Completions API with proper error handling and status code propagation.
- [x] Implement structured payload pass-through to support both conversation classification and AI duration estimation.


### Phase 3: Security Hardening & Rate Limiting
- [x] Implement payload bounds & method enforcement (`api/chat.ts`).
- [x] Enforce request schema validation and input length limits on the serverless proxy.
- [x] Return structured JSON error responses with appropriate HTTP status codes (400, 405, 500).

### Phase 4: Local Emulation & Deployment Readiness
- [x] Configure deployment configuration (`vercel.json`).
- [x] Update environment templates (`.env.example`) and local storage strategies.
- [x] Audit client build artifacts to ensure zero secret key leakage in `dist/`.

---

## 4. Verification & Testing Strategy
1. **DevTools Audit**: Verify that searching the production JS bundle for key patterns (`sk-proj-`, `Authorization`, etc.) yields zero matches.
2. **Network Tab Inspection**: Verify that client requests are sent strictly to `/api/chat` and no header contains `Authorization: Bearer sk-...`.
3. **End-to-End Chat Verification**: Verify that conversational planning, duration estimation, and live matrix task updates function identically through the proxy.
