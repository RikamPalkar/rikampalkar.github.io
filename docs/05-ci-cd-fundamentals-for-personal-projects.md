# Understanding CI/CD: Fundamentals for Personal Projects

CI/CD stands for **Continuous Integration** and **Continuous Deployment**. These words describe an automated system that catches bugs early and releases changes without manual hand-offs. For a personal website, CI/CD means: you push code, the system builds it, tests whether it works, and publishes it online. You do not need to run a shell script by hand every time.

This article explains the concepts behind CI/CD and why they matter for your personal website.

## In this series

This article teaches CI/CD fundamentals so you understand what is happening behind the scenes. The companion articles show the repository structure, the GitHub Actions implementation, the step-by-step workflow, and the GitHub UI.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Read the architectural decision that made automated deployment necessary and clear.
- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Understand the repository structure that CI/CD orchestrates.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): See the workflow and artifact definition that CI/CD implements.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): Learn the concrete directory layout and daily workflow of the project that uses CI/CD.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Learn the exact mechanics and GitHub UI for triggering and monitoring your deploys.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): Follow the complete commands and decisions you make from code edit to live change.

> **Image prompt: A clean diagram showing three phases side-by-side: (1) Developer at laptop pushing code, (2) Automated machine running build and tests (labeled GitHub Actions), (3) Published website in browser. Use simple icons, flow arrows connecting each stage, restrained color palette (charcoal, teal, coral), off-white background, horizontal landscape.**

## Why CI/CD matters for personal projects

Without CI/CD, publishing a website change is a manual process:

```
1. Make a code change
2. Test it locally
3. Run a build command
4. Copy the output somewhere
5. Push it to the server
6. Verify it appeared correctly
```

Each step is an opportunity to make a mistake. You might forget to build, ship an old version, or run commands in the wrong directory. Manual deployments work for a single change, but they do not scale to a routine.

With CI/CD:

```
1. Make a code change
2. Push it to the repository
3. Automated system builds it
4. Automated system publishes it
5. You verify the result
```

The machine does the repetitive work, and you do the thinking. This is an enormous win for a personal website because the build and deployment are now identical and repeatable every single time.

## The three parts of CI/CD

### Continuous Integration (CI)

**Integration** means combining all the different pieces of your project into one working whole. For a monorepo, that means taking code from the portfolio, TicTacToe, and ChroNiyam, building each one, and assembling them into a complete website.

**Continuous** means doing this frequently, usually every time someone pushes code.

In practice, CI runs:

1. **Checkout** the source code from Git.
2. **Install dependencies** (npm packages, build tools).
3. **Build** each application.
4. **Run tests** or validation steps.
5. **Report success or failure**.

If any step fails, the process stops and alerts you. You do not accidentally ship broken code to production.

### Continuous Deployment (CD)

**Deployment** means publishing your software to a place where users can access it. For a website, that means uploading it to a server so browsers can see it.

**Continuous** means doing this automatically when code passes the CI checks.

In practice, CD runs:

1. **Take the artifact** produced by the CI build.
2. **Upload it** to GitHub Pages (or another hosting platform).
3. **Verify** that the site is live and correct.

If you do this manually, you risk uploading the wrong version or forgetting a step. Automating it removes those risks.

### The pipeline

A **pipeline** is the sequence of steps from source code to live website. Think of it as a factory assembly line. Each station does one job, passes the work to the next station, and only the final product goes to the customer.

For this website, the pipeline is:

```
Developer pushes
  -> GitHub receives the push
  -> GitHub Actions is triggered
  -> Install Node.js and dependencies
  -> Build portfolio, tictactoe, chroniyam
  -> Assemble one static artifact
  -> Deploy to GitHub Pages
  -> Website is live
```

Every push to `main` runs this pipeline. No hand-offs, no mistakes, no waiting for a person to remember the commands.

## CI/CD on GitHub: GitHub Actions

GitHub is the repository hosting service (where your code lives). GitHub Actions is GitHub's CI/CD service (where your automation runs).

When you push code to your repository, GitHub can automatically run a workflow. A **workflow** is a YAML file that describes the steps to build, test, and deploy your code. GitHub provides free compute time for running these workflows.

The workflow for this website lives at `.github/workflows/deploy-pages.yml`. Every time you push to `main`, GitHub Actions:

1. Rents a machine for a few minutes.
2. Runs the workflow.
3. Builds the three applications and assembles the artifact.
4. Deploys to GitHub Pages.
5. Records the results so you can see what happened.

This all happens without you doing anything. You just push code.

## What can go wrong and how CI/CD helps

### Scenario: You forget to build before pushing

**Without CI/CD**: You realize hours later when a user visits and sees broken content.

**With CI/CD**: The workflow tries to build, fails immediately, and alerts you. The broken code never reaches production.

### Scenario: You update a dependency in one app but forget another

**Without CI/CD**: You publish the site, and one app is missing the critical update. You do not notice until a user reports a bug.

**With CI/CD**: The workflow builds all three apps in the same environment, catching any inconsistency.

### Scenario: The deployment script has a typo

**Without CI/CD**: You run it once, something odd happens, and you manually fix files on the server.

**With CI/CD**: The workflow runs identically every time. The typo is either caught in the first run, or it is not a typo because the script is never hand-edited.

## The contract: repeatability

The core promise of CI/CD is **repeatability**. Running the workflow on the same source code always produces the same result. This makes debugging easier and makes releases less scary.

For your personal website, the contract is simple:

- **Input**: A commit to `main`.
- **Output**: A live website at `https://rikampalkar.github.io`.
- **Guarantee**: If you push the same commit twice, the website is identical both times.

When something is wrong, you know the problem is in the source code or in the workflow definition, not in mysterious hand-written server state.

## Next steps

Now that you understand what CI/CD does, the next articles show how to navigate GitHub, watch your deployment happen, and make changes from your local machine to the live site.

Continue with [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md).
