# GitHub Actions Deep Dive: How Your Website Deploys

This article walks through your GitHub repository, shows where to find the deployment pipeline, how to read what is happening, and how to manually trigger a deployment if needed. It is a practical UI guide for understanding your automation.

## In this series

This article focuses on the GitHub interface and GitHub Actions specifics for your website. Read the fundamentals article for CI/CD concepts, the deployment article for technical configuration, and the workflow guide for the commands you run locally.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Understand the architectural context that makes automated deployment necessary.
- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Learn the repository structure and practices that the workflow orchestrates.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): Review the technical configuration of the workflow file and build artifact assembly.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): See the concrete source directories and daily workflow of this specific project.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Learn what CI/CD is and why it matters before diving into the GitHub implementation.
- [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md): See the exact commands to develop locally and watch your changes propagate through the GitHub workflow to the live site.

> **Image prompt: A split-screen interface mockup: Left side shows a GitHub repository page with Actions tab highlighted. Right side shows a workflow run visualization with green checkmarks on build and deploy jobs. Include labels for "Actions tab", "Workflow runs", "Build job", "Deploy job", "Status indicators". Professional documentation style, off-white background, teal and coral accents, realistic UI elements.**

## Finding your workflow on GitHub

Open your repository at `https://github.com/RikamPalkar/rikampalkar.github.io`.

Click the **Actions** tab near the top. You are now in the Actions dashboard. This is where all automated workflows run and where you can see the history of every deployment.

> The Actions tab might be between "Pull requests" and "Projects". If you do not see it, go to **Settings > Actions > General** and enable Actions on this repository.

### Reading the Actions dashboard

The Actions tab shows a list of workflow runs. Each row represents one execution of your deployment pipeline:

```
Deploy GitHub Pages          Sep 3, 2:45 PM ✅ Success
Deploy GitHub Pages          Sep 2, 11:20 AM ✅ Success
Deploy GitHub Pages          Sep 2, 9:15 AM ✅ Success (Manual trigger)
Deploy GitHub Pages          Sep 1, 8:30 PM ❌ Failed
```

Each row shows:
- The workflow name (always "Deploy GitHub Pages" for your site).
- When it ran.
- Whether it succeeded (✅) or failed (❌).
- Why it ran (automatically on push, or manually triggered).

Click any row to see the details of that run.

## Reading a successful deployment

When you push code to `main`, the Actions dashboard updates within seconds. Click the most recent workflow run to open its details.

The workflow has two jobs: **build** and **deploy**.

### The build job

Click **build** to expand it. You see the steps that ran:

```
✅ Checkout
✅ Set up Node.js
✅ Cache Node.js dependencies
✅ Install dependencies (portfolio)
✅ Install dependencies (tictactoe)
✅ Install dependencies (chroniyam)
✅ Build applications
✅ Upload artifact
```

Each checkmark means that step succeeded. If you see an ❌, that step failed, and the next steps did not run.

**Checkout** means GitHub Actions downloaded your source code from the repository.

**Set up Node.js** means the machine installed the JavaScript runtime and npm.

**Install dependencies** means npm ran `npm ci` for each application, downloading the exact packages specified in each `package-lock.json`.

**Build applications** means the workflow ran `npm run build` for the root repository, which executed your build script and produced the `dist/` artifact.

**Upload artifact** means the resulting `dist/` folder was saved so the deploy job can access it.

If all steps are green, the artifact is ready. If any step is red, something went wrong, and no artifact was created.

### The deploy job

Click **deploy** to expand it. You see:

```
✅ Deploy to GitHub Pages
```

This single step takes the artifact produced by the build job and uploads it to GitHub Pages. If this step is green, your website is live.

Click the step to see its output. Near the end, you will see a line like:

```
Deployment successful!
Artifact URL: https://github.com/RikamPalkar/rikampalkar.github.io/deployments/github-pages
Environment URL: https://rikampalkar.github.io/
```

The environment URL is your live website. Click it to verify your changes are visible.

## Reading a failed deployment

If you see a red ❌ next to a workflow run, something went wrong. Click it to see which job failed.

Common failures:

### Build failed

Click the **build** job and scroll down to see the error. Common causes:

- **npm install failed**: A dependency could not be downloaded. Check your internet connection or see if a package was removed from npm.
- **Build failed**: Your source code has a syntax error or a missing import. The build step will show the exact file and line number.
- **Asset path wrong**: An image or stylesheet could not be found during the build. Verify relative paths in your code.

To fix a build error, make the correction locally, test it with `npm run build`, commit the fix, and push to `main`. The workflow will run again automatically.

### Deploy failed

Click the **deploy** job. This is rare, but if it happens:

- Verify that your repository settings have **Settings > Pages > Source** set to **GitHub Actions**.
- Verify that the GitHub Actions workflow has the correct permissions. It needs `pages: write` and `id-token: write`.

If the workflow file is correct and deploy still fails, open an issue on GitHub's Actions documentation or check your repository's Actions settings.

## Manually triggering a deployment

You can also run the workflow by hand without pushing code. This is useful if you want to redeploy an old commit or if you made a change to the workflow file itself.

In the Actions tab, click the workflow name "Deploy GitHub Pages" on the left side. A new page opens showing the workflow definition and a button to manually trigger it.

Click **Run workflow**. A dropdown menu asks which branch to use. Keep it on `main`. Click **Run workflow** again.

The workflow starts immediately. You will see a new row in the Actions list with "(Manual trigger)" next to the timestamp. Follow the same steps as above to watch it run.

## Workflow file: Where the steps are defined

The workflow that GitHub Actions runs is defined in a file in your repository: `.github/workflows/deploy-pages.yml`.

On the repository home page, click the folder icon next to the file list (or press `.` to open the web editor), then navigate to `.github/workflows/deploy-pages.yml`. This is the workflow definition. It is a YAML file that describes each step, the order they run, and what each step does.

You do not need to edit this file often. But if you understand its structure, you can make small changes (like adding a new build step or changing the Node.js version) without leaving GitHub.

The key sections are:

- **on**: When the workflow runs (push to main, or manual trigger).
- **jobs**: A list of jobs (build, deploy).
- **steps**: Inside each job, the individual commands and actions.
- **uses**: An action from GitHub's marketplace (like "actions/checkout@v4").
- **run**: A shell command to execute (like "npm ci" or "npm run build").

For now, leave the workflow file as-is. Once you are comfortable with the flow, you can experiment with changes.

## Understanding the artifact

After a successful build, GitHub Actions creates an artifact: a copy of your `dist/` folder compressed and stored on GitHub's servers for a few days.

You can download this artifact for inspection if something looks wrong:

1. Click the successful workflow run.
2. Scroll down to the bottom.
3. Under "Artifacts", you will see a file named `github-pages`.
4. Click it to download the compressed artifact.
5. Extract it and inspect the files locally.

This is useful for debugging if your website looks wrong but you are not sure whether the problem is in the source or in the assembly. You can compare your local `npm run build` output with the GitHub Actions artifact.

## Performance and limitations

GitHub provides 2,000 free Actions minutes per month for public repositories. Your workflow takes about 2-3 minutes per run, so you can deploy roughly 600-1000 times per month before hitting any limits.

For a personal website, this is more than enough.

Each workflow run has a 6-hour timeout. If your build takes more than 6 hours (unlikely for your project), the workflow is cancelled.

## Next steps

Now you understand how to read the GitHub Actions dashboard and see your deployments happen. The next article shows the exact commands you run locally and how they relate to what GitHub Actions does.

Continue with [Local Development to Live Site: Step-by-Step Deployment Guide](07-local-and-remote-deployment-workflow.md).
