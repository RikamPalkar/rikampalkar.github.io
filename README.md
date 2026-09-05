# Rikam Palkar Website

This repository is the source and deployment definition for `https://rikampalkar.github.io`.

## Applications

| Source | Published path |
| --- | --- |
| `apps/portfolio` | `/` |
| `apps/tictactoe` | `/tictactoe/` |
| `apps/chroniyam` | `/ChroNiyam/` |

## Development and deployment

Run an application locally from its directory with `npm run dev`. To build the complete Pages artifact, run:

```bash
npm run build
```

The `main` branch deploys through `.github/workflows/deploy-pages.yml`. In GitHub repository settings, select **GitHub Actions** under **Settings > Pages > Build and deployment**.

## Learn more

This repository is organized as a monorepo with an automated CI/CD pipeline. Read the documentation series in `docs/` to understand the architecture, practices, and workflow:

1. [From Repository Sprawl to One Personal Website](docs/01-from-repository-sprawl-to-one-personal-website.md): Why this repository structure makes sense for a personal website.
2. [What a Monorepo Is and How I Maintain One](docs/02-monorepo-principles-and-maintenance.md): Monorepo principles, application boundaries, and dependency management.
3. [Deploying a Multi-App Personal Website with GitHub Pages](docs/03-github-pages-deployment-pipeline.md): Vite configuration, static artifact assembly, and Pages hosting.
4. [Inside My Personal Website Monorepo](docs/04-the-rikampalkar-github-io-monorepo.md): The concrete structure, directories, and daily workflow.
5. [Understanding CI/CD: Fundamentals for Personal Projects](docs/05-ci-cd-fundamentals-for-personal-projects.md): What CI/CD is and why it matters for automation.
6. [GitHub Actions Deep Dive: How Your Website Deploys](docs/06-github-actions-deep-dive.md): GitHub interface walkthrough and workflow monitoring.
7. [Local Development to Live Site: Step-by-Step Deployment Guide](docs/07-local-and-remote-deployment-workflow.md): Real example with every command and GitHub step explained.

## Notes

`archive/legacy-pages-output/` is a local backup of the previous generated-output repository. It is ignored and must not be edited or committed.