# What a Monorepo Is and How I Maintain One

A monorepo is a single Git repository that contains multiple related projects. It is not defined by its size, its build tool, or a particular vendor. It is a repository strategy: one version-control boundary contains code that would otherwise live in several repositories.

For my personal website, the repository is a monorepo because it contains three independently runnable frontend applications. The portfolio, TicTacToe, and ChroNiyam retain their own `package.json`, dependencies, build configuration, and source directories, while sharing one Git history and one deployment pipeline.

## In this series

This article explains the repository model that keeps related applications manageable in one place. Read the companion articles for the decision behind it, the deployment mechanics, CI/CD automation, and the exact implementation in this repository.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Understand the architectural decision and why one repository is the right model for a personal website.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): Learn how applications are built and published together using Vite base paths and static artifact assembly.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): See the concrete directories, commands, and daily workflow for this specific project.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Learn the concepts behind automated building and deployment so you understand what the pipeline does.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Navigate GitHub's interface to monitor and understand your workflow runs.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow the complete workflow from editing code to seeing your change live on the web.

> **Image prompt: An isometric but minimal engineering illustration of a single Git repository folder containing three distinct small React applications labelled Portfolio, TicTacToe, and ChroNiyam, all connected to one CI pipeline. Show clear folder hierarchy and Git commit nodes. Professional documentation aesthetic, off-white background, ink lines, teal, coral, and amber accents, landscape.**

## A monorepo is not a monolith

The most common misunderstanding is to equate a monorepo with a monolith. They solve different problems.

- A **monolith** describes how software is composed and deployed at runtime.
- A **monorepo** describes how code is stored and versioned.

This repository contains independent static web applications. They are not one runtime application. They are simply managed together because they are related, owned by the same person, and released to the same public domain.

## The structure of this monorepo

```text
apps/
├── portfolio/       # Main public site at /
├── tictactoe/       # Game at /tictactoe/
└── chroniyam/       # Time-management app at /ChroNiyam/
```

Each application is deliberately self-contained. That means a developer can work on an app with the familiar commands from inside that directory:

```bash
npm --prefix apps/portfolio run dev
npm --prefix apps/tictactoe run build
npm --prefix apps/chroniyam run lint
```

The root repository supplies the orchestration layer. Its job is to define how the applications are assembled into one deployable site. It should not absorb every application dependency into one enormous root package merely because the projects share a Git repository.

## Boundaries that keep the repository healthy

A useful monorepo has explicit boundaries. Without them, it turns into a large folder where unrelated changes collide. I use these rules.

### Applications own their implementation

An application owns its UI, dependencies, Vite configuration, tests, and app-specific documentation. A TicTacToe feature belongs in `apps/tictactoe`; it should not require unrelated edits in ChroNiyam.

### The root owns cross-cutting concerns

The root owns the shared repository contract: CI, deployment, high-level documentation, repository-wide scripts, editor configuration, and contribution expectations. The root `scripts/build-pages.sh` is a good example. It does not contain product logic; it coordinates builds and assembles their outputs.

### Shared code is earned, not assumed

Do not create a `packages/shared` directory after seeing two similar lines of CSS. Extract shared code when duplication is stable, meaningful, and expensive to maintain. A shared package creates its own API, versioning expectations, tests, and dependency graph. For a small personal site, duplication can be cheaper than abstraction.

### Generated files do not belong in normal commits

Each Vite application writes its build output to `dist/`. The root build writes the Pages artifact to the root `dist/`. These directories are ignored because they are reproducible. The committed truth is the source plus the exact package lockfiles and deployment instructions needed to rebuild it.

## Dependency management

Each app currently keeps a separate lockfile. That is a sensible transitional and operational choice because the apps use different React and Vite versions. Running `npm ci` in an app installs exactly the dependency graph locked for that application.

This avoids accidental upgrades caused by a shared root lockfile. It also makes it obvious which app needs attention when a dependency update is required.

The tradeoff is repeated dependency installation in CI. For three small applications, clarity is worth more than optimizing a few install seconds. If the repository grows substantially, npm workspaces, pnpm workspaces, or Nx can centralize dependency management and task orchestration. Introduce that tooling when it solves a measured problem, not as ceremony.

## Daily maintenance workflow

My normal loop is intentionally boring:

```bash
git pull --ff-only
npm --prefix apps/tictactoe run dev
# make the change
npm --prefix apps/tictactoe run lint
npm --prefix apps/tictactoe run build
npm run build
git add apps/tictactoe
git commit -m "Improve TicTacToe move feedback"
git push
```

The app-level build catches problems in the changed project quickly. The root build catches integration problems: wrong base paths, output collisions, and failures in another app that will be published together.

## Commit and branch practices

Keep commits narrow and readable. A good commit answers two questions: what changed, and why? Avoid mixing a feature, dependency upgrade, formatting sweep, and deployment repair in one commit.

Use a short-lived branch for non-trivial work. Keep `main` deployable because every push to it can publish the website. For a personal project, a lightweight convention is enough:

```text
feature/tictactoe-scoreboard
fix/chroniyam-time-allocation
chore/update-react-dependencies
docs/website-management-series
```

Review the diff before pushing. The repository contains public content, assets, and deployment configuration, so an accidental large binary or generated bundle is more costly than it first appears.

## When to reconsider the monorepo

I would split an application into its own repository if it gained a separate team, separate access controls, an independent release cadence, a public reusable SDK, or a deployment lifecycle unrelated to the personal website. A repository boundary should follow ownership and lifecycle, not folder count.

Until those forces exist, one repository is the simpler and more honest architecture.

Continue with [Deploying One Domain with GitHub Pages](03-github-pages-deployment-pipeline.md).