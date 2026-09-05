# Inside My Personal Website Monorepo

This is how I manage my personal website: one repository, one public domain, several independent applications, and a deployment pipeline that builds the final site from source on every push to `main`.

The repository is `RikamPalkar/rikampalkar.github.io`. It is both the engineering workspace and the deployment definition for `https://rikampalkar.github.io`.

## In this series

This article is the practical map of the repository and the daily routine for maintaining it. The companion articles provide the migration decision, broader monorepo concepts, pipeline mechanics, CI/CD fundamentals, GitHub interface reference, and hands-on workflow guidance.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Understand the architectural decision that made this structure necessary.
- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Learn the general monorepo practices and ownership boundaries that this structure follows.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): Review the static artifact assembly and Vite configuration that turn source into deployed output.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Grasp the CI/CD concepts that automate your deployments.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Learn where to look on GitHub to monitor your automated deployments.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow the exact commands and workflow you use every day to make and release changes.

> **Image prompt: A premium developer-portfolio architecture illustration titled conceptually "One Website, Many Experiences". Show a browser window for Rikam Palkar's portfolio connected to a TicTacToe game screen and a ChroNiyam productivity dashboard, all sitting inside one repository folder and deploying to GitHub Pages. Use an editorial software architecture style, realistic UI thumbnails but no readable filler text, charcoal, teal, coral, and light amber palette, clean white background, horizontal composition.**

## The product map

The public site is intentionally organized around one identity. Visitors start at the portfolio and can move into a game or a productivity application without leaving the domain.

| Application | Source directory | Public URL | Role |
| --- | --- | --- | --- |
| Portfolio | `apps/portfolio` | `https://rikampalkar.github.io/` | Professional profile, work, and project discovery |
| TicTacToe | `apps/tictactoe` | `https://rikampalkar.github.io/tictactoe/` | Interactive Minimax-based game |
| ChroNiyam | `apps/chroniyam` | `https://rikampalkar.github.io/ChroNiyam/` | Eisenhower Matrix time-management application |

The URL capitalization for `ChroNiyam` is deliberate because GitHub Pages path matching is case-sensitive. Do not casually rename that deployment directory without adding redirects or updating every public link.

## Repository layout and ownership

```text
rikampalkar.github.io/
├── apps/
│   ├── portfolio/             # Portfolio source, assets, and app tooling
│   ├── tictactoe/             # Game source, assets, and app tooling
│   └── chroniyam/             # Productivity app source, tests, and docs
├── docs/                      # Architecture and operational documentation
├── scripts/
│   └── build-pages.sh         # Builds and assembles the static Pages artifact
├── .github/workflows/
│   └── deploy-pages.yml       # CI/CD definition
├── dist/                      # Generated artifact; ignored by Git
├── archive/                   # Ignored local historical backup material
├── package.json               # Root orchestration commands
└── README.md                  # Entry point for developers
```

The root has a narrow responsibility: coordinate, document, and deploy. The applications own their product behavior. This separation makes the repository easier to navigate and prevents the root from becoming a dumping ground for unrelated code.

## How I work on each application

When I am working on a single experience, I start its local Vite server from the corresponding app directory:

```bash
npm --prefix apps/portfolio run dev
npm --prefix apps/tictactoe run dev
npm --prefix apps/chroniyam run dev
```

I keep local changes close to the owning application. A change to TicTacToe game logic should normally affect `apps/tictactoe`; a new ChroNiyam planning view should normally affect `apps/chroniyam`. This makes review and future debugging much faster.

Before I publish, I validate at two levels:

```bash
# Validate the application I changed
npm --prefix apps/tictactoe run lint
npm --prefix apps/tictactoe run build

# Validate the deployed website composition
npm run build
```

The final command is important. It validates the URLs and filesystem layout GitHub Pages will receive, not only whether one application can compile in isolation.

## How a change reaches production

```text
edit source
  -> run app checks
  -> run root build
  -> commit focused change
  -> push main
  -> GitHub Actions builds the complete artifact
  -> GitHub Pages deploys it
```

The standard release command sequence is:

```bash
git pull --ff-only
npm --prefix apps/chroniyam run lint
npm run build
git add apps/chroniyam
git commit -m "Improve ChroNiyam weekly planning"
git push
```

For substantial work, I create a branch and open a pull request before merging to `main`. The target remains the same: `main` must be a deployable branch because it is the release trigger.

## Asset and link conventions

Path-hosted applications must be intentional about links and assets. Inside an app, use Vite's `import.meta.env.BASE_URL` for runtime asset references when the asset must respect the deployment base path. Configure each app's Vite `base` setting to match its published route.

From the portfolio, link to applications with their deployed paths. Keep these links centralized where practical, and test them after changing a path. External references to old source repositories should point to the relevant directory in the active monorepo or be removed if they no longer serve a visitor.

## Documentation is part of the architecture

The `docs/` directory records decisions that are otherwise easy to forget: why the repo is structured this way, what a monorepo means here, how deployment works, and how to work on each app. This matters even in a personal repository. Future-you is a real maintainer with incomplete context.

Keep the README concise as the front door. Put durable, detailed explanations in `docs/`. Update both when an operational contract changes, such as a new app path, a new deploy mechanism, or a change in ownership.

## What I will not do

I will not manually edit files in the Pages artifact, maintain a second active generated-site repository, or create a new repository for every small site feature. Those approaches trade a few minutes of apparent convenience for long-term uncertainty.

I will create a separate repository only when a project has a genuinely independent life: a different owner, separate collaborators and permissions, its own release cadence, or a reusable product identity beyond this website.

## The management standard

The repository should always answer these questions without guesswork:

1. Where do I make a change?
2. How do I validate it?
3. What command produces production output?
4. What deployment system publishes that output?
5. Which URL will the change affect?

This monorepo answers all five. That is the standard I want for a personal website: not maximum tooling, but a system that is clear, repeatable, and calm to maintain.