# Local Development to Live Site: Step-by-Step Deployment Guide

This article is your operational handbook. It walks through a real example: you change something in TicTacToe, validate it locally, push to GitHub, and watch the change go live. Every command is shown, and every step is explained.

## In this series

This article is the practical workflow for making and releasing changes. Read the architecture and concepts articles for context, the GitHub UI guide for monitoring, and reference the technical articles as needed.

- [From Repository Sprawl to One Personal Website](01-from-repository-sprawl-to-one-personal-website.md): Understand the architectural decision behind one repository and automated deployment.
- [What a Monorepo Is and How I Maintain One](02-monorepo-principles-and-maintenance.md): Learn the boundaries and practices that make this workflow stable.
- [Deploying a Multi-App Personal Website with GitHub Pages](03-github-pages-deployment-pipeline.md): Review the build and assembly process that happens after you push.
- [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md): Reference the repository structure and daily workflow summary.
- [Understanding CI/CD: Fundamentals for Personal Projects](05-ci-cd-fundamentals-for-personal-projects.md): Understand the CI/CD principles behind the automation you trigger with `git push`.
- [GitHub Actions Deep Dive: How Your Website Deploys](06-github-actions-deep-dive.md): Learn where to look on GitHub to monitor your deployment after you push.

> **Image prompt: A detailed step-by-step workflow diagram showing: (1) Developer's laptop with code editor and terminal, (2) `git push` arrow to GitHub, (3) GitHub Actions running (with checkmarks), (4) Browser showing the live website with the change visible. Use a time-flow layout from left to right, include command examples as text callouts, professional technical style, landscape orientation.**

## Starting state: You have cloned the repository

You have the repository on your machine:

```bash
cd ~/Projects/Personal/Personal\ Website/rikampalkar.github.io
git status
```

Output:

```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Everything is committed and clean. Your local `main` matches the remote `main` on GitHub.

## Scenario: You improve the TicTacToe game feedback

You want to show a message when the game ends. This is a change to `apps/tictactoe/`.

### Step 1: Pull the latest changes

Before you start work, ensure you have the latest code:

```bash
git pull --ff-only
```

Output:

```
Already up to date.
```

In this case, nothing new arrived since your last pull. If there were changes, Git would have downloaded them. The `--ff-only` flag means "only accept fast-forward merges", which keeps the history clean and safe.

### Step 2: Start the TicTacToe dev server

Open a terminal and start the development server:

```bash
npm --prefix apps/tictactoe run dev
```

Output:

```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/tictactoe/
  ➜  press h to show help
```

Keep this terminal open. Your application is now running locally at `http://localhost:5173/tictactoe/`.

### Step 3: Make your changes

Open `apps/tictactoe/src/components/TicTacToe.tsx` in your editor. Find the section where the game ends and add a message. For example:

```tsx
// When the game ends, show a message
if (gameOver) {
  return (
    <div>
      <p className="game-over-message">
        {winner ? `You ${winner === 'X' ? 'win' : 'lose'}!` : "It's a tie!"}
      </p>
      <button onClick={() => resetGame()}>Play Again</button>
    </div>
  );
}
```

Save the file. The dev server automatically reloads the browser. You see your change immediately.

### Step 4: Test and validate locally

Play the game in your browser. Verify that the message appears when the game ends, and the "Play Again" button works. Make sure the styling looks reasonable.

Then run the linter to check for code quality issues:

```bash
npm --prefix apps/tictactoe run lint
```

Output (if there are no issues):

```
✔ eslint ./src successfully linted
```

If there are errors, fix them in your editor and run lint again.

### Step 5: Build the application alone

Build just the TicTacToe application to ensure it compiles:

```bash
npm --prefix apps/tictactoe run build
```

Output:

```
✓ built in 234ms

dist/
  ├── index.html
  ├── assets/
  │   ├── index-a1b2c3d4.js
  │   └── index-e5f6g7h8.css
```

The application was built successfully. The `dist/` folder contains the optimized code ready for production.

### Step 6: Build the entire website

Now build the entire website to ensure your change does not break the other applications or the assembly:

```bash
npm run build
```

Output:

```
Building apps/portfolio...
✓ built in 567ms

Building apps/tictactoe...
✓ built in 234ms

Building apps/chroniyam...
✓ built in 445ms

Assembling GitHub Pages artifact...
✓ artifact ready in dist/
```

All three applications built successfully, and the root build script assembled them into the final `dist/` directory. This is the exact same artifact that will be deployed to GitHub Pages.

### Step 7: Inspect the artifact locally (optional)

If you want to verify the artifact before pushing, you can inspect it:

```bash
ls -la dist/
ls -la dist/tictactoe/
```

Output:

```
dist/
  index.html          (portfolio home page)
  assets/
  tictactoe/
    index.html        (TicTacToe game)
    assets/
  ChroNiyam/
    index.html        (ChroNiyam app)
    assets/
  .nojekyll           (GitHub Pages marker)
```

This matches the structure GitHub Pages expects. The TicTacToe application is in the `dist/tictactoe/` directory, exactly where visitors will reach it at `https://rikampalkar.github.io/tictactoe/`.

### Step 8: Commit your changes

Stage the modified files:

```bash
git add apps/tictactoe/
```

Check what you are about to commit:

```bash
git diff --cached
```

Output shows the code changes you made. If everything looks correct, commit:

```bash
git commit -m "Add game-end message to TicTacToe"
```

Output:

```
[main 8c7f9e2] Add game-end message to TicTacToe
 1 file changed, 15 insertions(+)
```

Your change is now recorded in Git history. The commit hash is `8c7f9e2`.

### Step 9: Push to GitHub

Upload your commit to GitHub:

```bash
git push
```

Output:

```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression by 0.95 MiB, done.
Total 5 (delta 3), reused 0 (delta 3), pack-reused 0
To https://github.com/RikamPalkar/rikampalkar.github.io.git
   9a4b1c3..8c7f9e2  main -> main
```

Your commit has been pushed to the remote repository. GitHub receives it immediately.

### Step 10: GitHub Actions runs automatically

As soon as your push reaches GitHub, the GitHub Actions workflow is triggered automatically. You do not need to do anything.

Check the Actions dashboard:

```
Open https://github.com/RikamPalkar/rikampalkar.github.io/actions
```

You will see a new workflow run starting. It shows "Deploy GitHub Pages" with a yellow circle, meaning it is in progress.

Wait 2-3 minutes for the workflow to complete. You will see:

- The build job completes with green checkmarks.
- The deploy job completes with a green checkmark.
- The status changes to "✅ Success".

### Step 11: Verify the live change

Once the workflow is green, open your live website:

```
https://rikampalkar.github.io/tictactoe/
```

Play the game. You should see your new message when the game ends. Your change is now live for all visitors.

### Step 12: Check the workflow run details (optional)

Click the successful workflow run on the Actions tab to see the full log:

- Click **build** to see the dependency installation, compilation, and artifact assembly.
- Click **deploy** to see the upload to GitHub Pages and the confirmation message.

This log is your record of what happened. If something went wrong, the log would show exactly where it failed.

## What if something went wrong?

### The workflow failed during build

Check the error message in the **build** job log. Common causes:

- **Syntax error**: You have a typo in your code. Fix it in your editor, commit, and push again.
- **Lint error**: Your code violates the project's linting rules. Run `npm --prefix apps/tictactoe run lint` locally to see the issue and fix it.
- **Missing import**: You used a variable or component that was not imported. Check your import statements.

### The workflow failed during deploy

This is rare. Check **GitHub repository settings > Pages > Source** and verify it is set to **GitHub Actions**. If it is, check the GitHub Actions documentation or open an issue.

### The change is not visible on the live site

- **Hard refresh the browser**: Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to bypass the browser cache.
- **Check GitHub Actions**: Confirm the workflow completed successfully and shows "Deploy to GitHub Pages: Deployment successful!".
- **Check the artifact**: Download the GitHub Actions artifact and verify your file is in `tictactoe/` directory with the correct content.

## Workflow summary

Every deployment follows this pattern:

```
git pull --ff-only               (Get latest changes)
npm --prefix apps/X run dev      (Start dev server)
# Make changes and test locally
npm --prefix apps/X run lint     (Check code quality)
npm --prefix apps/X run build    (Build the changed app)
npm run build                    (Build the entire site)
git add apps/X                   (Stage changes)
git commit -m "..."              (Record the change)
git push                         (Send to GitHub)
# GitHub Actions runs automatically
# Check https://github.com/RikamPalkar/rikampalkar.github.io/actions
# Verify https://rikampalkar.github.io (or the sub-path)
```

Once you follow this sequence a few times, it becomes automatic. The workflow is the same whether you change the portfolio, TicTacToe, or ChroNiyam.

## Advanced: Reverting a bad deployment

If you pushed a change and later realize it was a mistake, you can revert it:

```bash
git log --oneline -5                        # See recent commits
git revert HEAD                             # Revert the most recent commit
git push                                    # Push the revert
```

Git creates a new commit that undoes the previous one. GitHub Actions runs again, and your site returns to the previous state. This is safer than deleting commit history because it preserves the record of what happened.

## Next steps

You now know how to develop locally, test, build, and release changes to your personal website. The next time you want to add a feature or fix a bug, follow the steps in this guide. The automation takes care of the rest.

Return to [Inside My Personal Website Monorepo](04-the-rikampalkar-github-io-monorepo.md) for a complete reference, or explore any of the other articles as you need deeper understanding.
