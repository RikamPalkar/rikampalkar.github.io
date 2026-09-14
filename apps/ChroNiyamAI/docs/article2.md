# Deploying Secure Serverless Proxies to Azure Functions: A Step-by-Step Production Guide (Part 2)

## Abstract
In [Part 1: Securing API Keys in Modern Single-Page Applications](./article.md), we analyzed the architecture of **ChroNiyamAI** — an AI-powered conversational planner — and established why client-side API keys in SPAs pose a severe security vulnerability. We designed a Serverless Proxy pattern to insulate secret OpenAI credentials from client-side bundles.

In **Part 2**, we focus on enterprise-grade production deployment using **Microsoft Azure Functions**. This hands-on guide walks step-by-step through creating an Azure Function App, configuring secure Application Settings for `OPENAI_API_KEY`, writing HTTP trigger functions, setting up CORS, and linking the Azure backend to the ChroNiyamAI frontend.

---

## 1. Recap of Part 1: What We Built & Why
In Part 1, we identified key architectural challenges in single-page applications:
1. **Build-time baking**: Bundlers like Vite compile `import.meta.env.VITE_OPENAI_API_KEY` directly into public JavaScript string constants inside `dist/`.
2. **DevTools exposure**: Outgoing client requests directly to `api.openai.com` reveal raw `Authorization: Bearer sk-...` headers in the browser Network tab.
3. **The Proxy Solution**: Routing client requests through a serverless backend proxy `/api/chat` so that `OPENAI_API_KEY` remains strictly on the server side (`process.env.OPENAI_API_KEY`).

Now, we implement this proxy natively on Microsoft Azure infrastructure.

---

## 2. Prerequisites
Before beginning the Azure setup, ensure you have:
- An active **Azure Subscription**.
- **Azure CLI** installed locally (`az --version`).
- **Azure Functions Core Tools** (`func --version`) or VS Code Azure Functions extension.
- Node.js (v18 or v20 LTS).
- A valid **OpenAI API Key** (`sk-proj-...`).

---

## 3. Step-by-Step Azure Functions Setup

### Step 1: Create an Azure Resource Group
1. Open the Azure Portal at `portal.azure.com`.
2. Click **Create a resource** and search for **Resource group**, then click **Create**.
3. Select your Subscription, enter Resource Group name `rg-chroniyamai-prod`, pick Region `East US`, and click **Review + create**.

> 📷 *[Screenshot Placeholder: Azure Portal - Resource Group Creation]*

Or via Azure CLI:
```bash
az group create \
  --name rg-chroniyamai-prod \
  --location eastus
```

### Step 2: Create an Azure Storage Account
Azure Functions require an Azure Storage Account for managing function execution state:
1. Search for **Storage accounts** in Azure Portal and click **Create**.
2. Select Resource Group `rg-chroniyamai-prod`, enter name `stchroniyamai`, choose `Standard` performance, and click **Review + create**.

> 📷 *[Screenshot Placeholder: Azure Portal - Storage Account Configuration]*

Or via Azure CLI:
```bash
az storage account create \
  --name stchroniyamai \
  --location eastus \
  --resource-group rg-chroniyamai-prod \
  --sku Standard_LRS
```

### Step 3: Create the Azure Function App
1. In Azure Portal search for **Function App** and click **Create**.
2. Choose **Consumption** (Serverless) hosting plan.
3. Select Runtime stack `Node.js`, Version `20 LTS`, OS `Linux`.
4. Link the Storage account `stchroniyamai` created in Step 2.
5. Click **Review + create**.

> 📷 *[Screenshot Placeholder: Azure Portal - Function App Basics & Hosting Selection]*

Or via Azure CLI:
```bash
az functionapp create \
  --resource-group rg-chroniyamai-prod \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name func-chroniyamai-api \
  --storage-account stchroniyamai \
  --os-type Linux
```

---

## 4. Configuring Application Settings for `OPENAI_API_KEY`

Instead of checking secrets into Git or `.env` files, Azure Function App Application Settings inject environment variables into the Function runtime safely at execution time.

### Method A: Via Azure Portal (GUI)
1. Navigate to **Azure Portal** (`portal.azure.com`).
2. Search for and select your Function App **`func-chroniyamai-api`**.
3. Under the **Settings** blade in the left navigation menu, select **Environment variables** (or **Configuration**).

> 📷 *[Screenshot Placeholder: Function App Navigation - Settings Blade]*

4. Under the **App settings** tab, click **+ Add**:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-secret-key`

> 📷 *[Screenshot Placeholder: Adding OPENAI_API_KEY to Environment Variables]*

5. (Optional) Add model selection setting:
   - **Name**: `OPENAI_MODEL`
   - **Value**: `gpt-4o-mini`
6. Click **Apply** and then click **Save** at the top of the blade to persist settings.

> 📷 *[Screenshot Placeholder: Saving App Settings Confirmation]*

### Method B: Via Azure CLI (Automated)
Run the following CLI command:

```bash
az functionapp config appsettings set \
  --name func-chroniyamai-api \
  --resource-group rg-chroniyamai-prod \
  --settings \
    OPENAI_API_KEY="sk-proj-your-actual-secret-key" \
    OPENAI_MODEL="gpt-4o-mini"
```

> **Security Tip**: For maximum enterprise security, store secrets in **Azure Key Vault** and reference them inside Application Settings using the format `@Microsoft.KeyVault(SecretUri=https://<vault-name>.vault.azure.net/secrets/OpenAIKey/)`.

---

## 5. Implementing the Azure Function Proxy Handler

Inside your Azure Function project directory, structure the HTTP trigger:

`src/functions/chat.ts`:
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function chatProxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Processing AI request...`);

    if (request.method !== "POST") {
        return { status: 405, jsonBody: { error: "Method not allowed" } };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
        return { status: 500, jsonBody: { error: "Serverless OPENAI_API_KEY is not configured on Azure." } };
    }

    try {
        const body = await request.json() as any;
        const { action, messages, referenceDate, referenceTime, title, currentHours } = body;

        // Input validation & payload bounds
        if (action === "suggest-duration") {
            if (typeof title !== "string" || title.trim().length === 0 || title.length > 300) {
                return { status: 400, jsonBody: { error: "Invalid task title provided" } };
            }
        } else if (action === "continue-conversation") {
            if (!Array.isArray(messages) || messages.length > 50) {
                return { status: 400, jsonBody: { error: "Invalid or excessive conversation history" } };
            }
        } else {
            return { status: 400, jsonBody: { error: "Unsupported action" } };
        }

        // Forward request securely to OpenAI
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                // ... schema and payload mapping
            }),
        });

        const data = await openaiResponse.json();
        return { status: openaiResponse.status, jsonBody: data };
    } catch (err: any) {
        return { status: 500, jsonBody: { error: err.message || "Internal server error" } };
    }
}

app.http('chat', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: chatProxy
});
```

---

## 6. Configuring CORS & Connecting Frontend

### Setting Up CORS on Azure Functions
To allow your frontend hosted at `https://rikampalkar.github.io` to call your Azure Function App, configure Cross-Origin Resource Sharing (CORS):

```bash
az functionapp cors add \
  --name func-chroniyamai-api \
  --resource-group rg-chroniyamai-prod \
  --allowed-origins "https://rikampalkar.github.io" "http://localhost:5173"
```

### Wiring the Frontend Production Endpoint
In `apps/ChroNiyamAI/src/lib/openai.ts`, configure the production proxy target:

```typescript
const AZURE_FUNCTION_URL = import.meta.env.VITE_AZURE_FUNCTION_URL || 'https://func-chroniyamai-api.azurewebsites.net/api/chat';

// When no local VITE_OPENAI_API_KEY is present, route to Azure Functions:
const response = await fetch(AZURE_FUNCTION_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'continue-conversation', messages: history, referenceDate, referenceTime }),
});
```

---

## 7. Deployment Checklist & Summary

| Stage | Action Item | Status |
| :--- | :--- | :--- |
| **Azure Setup** | Create Resource Group, Storage Account, Function App | ✅ Completed |
| **Secrets Management** | Add `OPENAI_API_KEY` to Azure App Settings / Key Vault | ✅ Completed |
| **Code Implementation** | Deploy `chatProxy` HTTP trigger to Azure Functions | ✅ Completed |
| **Security & CORS** | Restrict CORS origins to `rikampalkar.github.io` | ✅ Completed |
| **Frontend Integration** | Route production `/api/chat` calls to Azure Function App URL | ✅ Completed |

With Azure Functions handling request proxies, your secret `OPENAI_API_KEY` remains completely hidden from browser DevTools and public Git repositories, delivering production-grade security for ChroNiyamAI.
