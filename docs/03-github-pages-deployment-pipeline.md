# Deploying a Multi-App Personal Website with GitHub Pages

The repository is the source of truth; GitHub Pages is the delivery mechanism. The deployment design has one job: take a commit from `main`, build all applications deterministically, assemble them at their public paths, and publish the result without manually committing generated bundles.

## In this series

This article focuses on the deployment pipeline and artifact assembly that turns source code into a live website. Other articles provide the architectural context, monorepo practices, CI/CD concepts, GitHub interface guidance, and hands-on workflow.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Understand why one active repository makes deployment clear and repeatable.
- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Learn the repository structure and boundaries that this deployment pipeline orchestrates.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): See the source directories, build configuration, and daily development workflow.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Learn the CI/CD concepts that make automated deployment reliable.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Navigate the GitHub interface to watch your deployment pipeline run.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow the complete workflow from local development to live website.

> **Image prompt: A polished technical pipeline diagram showing a Git push to main flowing through GitHub Actions: checkout, install dependencies for three apps, build three Vite apps, assemble one static dist artifact, deploy to GitHub Pages, then browser routes for `/`, `/tictactoe/`, and `/ChroNiyam/`. Clean flat vector style, high legibility, off-white canvas, charcoal text, teal and orange accents, no gradients, wide landscape.**

## One domain, multiple application paths

Everything is hosted beneath one GitHub Pages site:

```text
https://rikampalkar.github.io/
https://rikampalkar.github.io/tictactoe/
https://rikampalkar.github.io/ChroNiyam/
```

This is path-based hosting. GitHub Pages serves a static file tree, so the artifact must match the desired URLs:

```text
dist/
├── index.html
├── assets/
├── tictactoe/
│   ├── index.html
│   └── assets/
└── ChroNiyam/
    ├── index.html
    └── assets/
```

When a browser requests `/tictactoe/`, GitHub Pages resolves that request to `dist/tictactoe/index.html`. The directory structure is therefore part of the deployment contract.

## Vite base paths are non-negotiable

Vite needs to know the public base URL of each application so it emits correct asset URLs. The root portfolio can use the default `/` base. The applications under paths must specify their own base:

```ts
// apps/tictactoe/vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/tictactoe/',
})
```

```ts
// apps/chroniyam/vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/ChroNiyam/',
})
```

Without this setting, Vite may emit asset references such as `/assets/index.js`. That points to the root portfolio assets, not the app's assets, and results in blank pages or missing styles after deployment. Local development can hide this issue because the development server handles paths differently.

## The build assembly script

The root command is:

```bash
npm run build
```

It invokes `scripts/build-pages.sh`, which follows a deterministic sequence:

1. Build the portfolio.
2. Build TicTacToe.
3. Build ChroNiyam.
4. Remove the previous root artifact directory.
5. Copy portfolio output to the artifact root.
6. Copy TicTacToe output to `dist/tictactoe/`.
7. Copy ChroNiyam output to `dist/ChroNiyam/`.
8. Add `.nojekyll` so GitHub Pages serves static assets exactly as generated.

The output is disposable. The script always rebuilds it from source, which makes a build repeatable and prevents stale files from an earlier deployment from leaking into production.

## The GitHub Actions workflow

The workflow at `.github/workflows/deploy-pages.yml` runs for every push to `main` and can also be started manually with `workflow_dispatch`.

Its core stages are:

```text
checkout source
  -> install Node.js
  -> npm ci for each application
  -> npm run build
  -> upload dist as a Pages artifact
  -> deploy the artifact to GitHub Pages
```

`npm ci` matters. It installs from the committed lockfile and fails if the lockfile does not agree with `package.json`. This makes CI more reproducible than `npm install`, which can update the lockfile or choose newer compatible versions.

The workflow has only the permissions needed to read repository contents and deploy a Pages artifact: `contents: read`, `pages: write`, and `id-token: write`. Treat deployment permissions as production access, even for a personal site.

## The one-time GitHub Pages configuration

In the `RikamPalkar/rikampalkar.github.io` repository, open **Settings > Pages**. Under **Build and deployment**, select **GitHub Actions** as the source.

This is essential. The old branch-based publishing model expects a directory or branch to contain ready-to-serve files. The new model publishes the workflow artifact. Do not configure both as competing deployment sources.

After the first push, check the Actions tab. A successful workflow produces a deployment URL in the `deploy` job. Test the three public routes in a browser, including a hard refresh, before archiving old repositories.

## Deployment troubleshooting

### The root site works but an app is blank

Check the app's Vite `base` setting and inspect the generated HTML asset URLs. They must begin with the app's path, including the trailing slash.

### The workflow fails during install

Run the same command locally: `npm ci --prefix apps/<app-name>`. Commit an updated lockfile only when the dependency change is deliberate.

### The app works locally but not after deployment

Run `npm run build` at the repository root and inspect the root `dist/` structure. This catches assembly errors that individual app builds cannot see.

### A previously deployed file remains visible

The assembly script clears the root artifact before copying output. If content is still stale, check the workflow run and browser cache, then verify the correct commit was deployed.

## Deployment as a contract

The deployment system is intentionally small, but it is production infrastructure. Changing a public path, a Vite base setting, the assembly script, or the workflow is an API change for website visitors. Build locally, inspect the artifact, and confirm the published URLs after any deployment-related change.

Continue with [The Concrete Architecture of My Personal Website](04-the-rikampalkar-github-io-monorepo.md).