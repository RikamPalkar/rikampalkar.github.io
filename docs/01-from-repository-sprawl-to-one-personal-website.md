# How I Manage My Personal Website: From Repository Sprawl to One System

For a personal website, the technical challenge is rarely writing the first component. The harder part arrives later: a portfolio grows, a small interactive project becomes public, another tool needs its own build, and every project begins accumulating a repository, a deployment branch, and a slightly different deployment ritual. The work is still small, but the operational model becomes surprisingly hard to reason about.

This article explains how I manage my personal website as one coherent engineering system. The site is available at `https://rikampalkar.github.io`, and its applications are published beneath the same domain:

- Portfolio: `https://rikampalkar.github.io/`
- TicTacToe: `https://rikampalkar.github.io/tictactoe/`
- ChroNiyam: `https://rikampalkar.github.io/ChroNiyam/`

These are path-based applications, not subdomains. A subdomain would look like `tictactoe.rikampalkar.github.io`. Keeping the distinction precise matters because URL design, DNS configuration, hosting configuration, and frontend asset paths all work differently for paths and subdomains.

## In this series

This article establishes why one personal web presence needs one clear source of truth. The companion articles provide the practices, deployment mechanics, CI/CD fundamentals, and hands-on workflow to turn that decision into a maintainable system.

- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Learn what a monorepo is, what it is not, and how application boundaries keep it maintainable.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): Follow the route from a `main` branch commit to a Pages deployment, explaining Vite base paths and artifact assembly.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): See the concrete structure, source directories, public URLs, and daily workflow for this specific project.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Learn what CI/CD is, why it matters, and how the automated pipeline works for personal projects.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Navigate the GitHub interface, read workflow logs, and understand the automation powering your deployments.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow a real example from code change to live website with every command and decision explained.

> **Image prompt: A clean editorial technical illustration showing one personal website domain, `rikampalkar.github.io`, as a central hub with three clearly labelled routes branching from it: `/`, `/tictactoe/`, and `/ChroNiyam/`. Use a restrained engineering diagram style, warm white background, charcoal text, teal and coral accents, no gradients, no generic server racks, high resolution landscape.**

## The problem with repository sprawl

The previous arrangement had a familiar shape: one repository for the public GitHub Pages output, separate repositories for the portfolio source, TicTacToe, and ChroNiyam, plus generated files that were easy to mistake for editable source. The names did not clearly express ownership, and the deployment repository looked like the website even though it mostly held build output.

That arrangement introduces several risks:

1. **There is no obvious source of truth.** A contributor can edit the generated site instead of the React source, or update an old repository that is no longer deployed.
2. **The deployment path is fragile.** Publishing requires a person to remember which repositories to pull, which projects to build, where artifacts go, and which branch actually serves Pages.
3. **Cross-project work costs too much.** Updating portfolio links after changing an application means coordinating separate clones, commits, and release steps.
4. **Repository names turn into misinformation.** Names such as `sourcecode`, `hosted site`, or an application-specific Pages repository describe a historical accident, not the current architecture.
5. **Generated output pollutes review history.** Bundled JavaScript and copied assets make commits noisy and obscure the meaningful source change.

The goal is not to force every project in the world into one repository. The goal is to make the repository boundary match the product boundary. My product is one personal web presence with several related applications. One repository is the most accurate model.

## The operating principle: one active source of truth

The active repository is:

```text
RikamPalkar/rikampalkar.github.io
```

It contains both the source code and the deployment definition. It does not commit build output as the normal deployment mechanism. GitHub Actions builds the site from source and publishes the resulting artifact to GitHub Pages.

```text
rikampalkar.github.io/
├── apps/
│   ├── portfolio/
│   ├── tictactoe/
│   └── chroniyam/
├── docs/
├── scripts/
│   └── build-pages.sh
├── .github/workflows/
│   └── deploy-pages.yml
├── package.json
└── README.md
```

The important idea is simple: source is versioned; deployment is reproducible. A production site is an artifact of a specific source commit, not a second hand-maintained copy of the project.

## Why this is a good fit for a personal website

Monorepos have real tradeoffs. They are not automatically better than multiple repositories. They fit especially well here because the applications have shared ownership, shared hosting, shared release timing, and a shared public identity.

The portfolio links to the apps. The apps are all hosted under the portfolio domain. A visitor experiences them as one website. Publishing them together is therefore a feature, not a compromise.

This design delivers practical benefits:

- One clone to set up a development environment.
- One pull request or commit can update an application and the portfolio link that introduces it.
- One CI workflow produces a consistent deployment artifact.
- One README gives new contributors the real project map.
- One issue tracker and release history capture the web presence as a whole.

## What happens to the old repositories

The former source repositories should be archived after the new deployment has been verified. Archiving is preferable to deleting for most personal projects: history, old URLs, discussions, and references remain available, while the archive status tells future readers that they are no longer the place to contribute.

The repository that serves `rikampalkar.github.io` stays active. The older source repositories become historical records:

```text
Active
└── RikamPalkar/rikampalkar.github.io

Archived after verification
├── RikamPalkar/rikampalkar.github.io.sourcecode
├── RikamPalkar/rikampalkar.github.io.TicTacToe
└── RikamPalkar/ChroNiyam
```

Before archiving, verify the root site and each application path in a browser. Also ensure GitHub Pages is configured to deploy through GitHub Actions. Archive only when the new workflow is the only deployment path you intend to maintain.

## The rule I use going forward

I make changes where the source lives, not where the site happened to be built. I validate locally, commit the source change, and push to `main`. The deployment workflow turns that commit into the published website.

That is the whole management model: one product, one active repository, one deployment pipeline, and clear ownership of every directory.

Continue with [What a Monorepo Is and How to Maintain One](02-monorepo-principles-and-maintenance.md).