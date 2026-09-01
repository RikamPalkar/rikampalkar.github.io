# Website Repository Management

## Canonical layout

All repositories are sibling clones under one parent directory:

```text
repos/
├── portfolio/   # RikamPalkar/rikampalkar.github.io.sourcecode
├── tictactoe/   # RikamPalkar/rikampalkar.github.io.TicTacToe
├── chroniyam/   # RikamPalkar/ChroNiyam
└── site/         # RikamPalkar/rikampalkar.github.io (generated output)
```

Open `portfolio/personal-website.code-workspace` to work with all four repositories in one VS Code window.

## Ownership

| Repository | Purpose | Published URL |
| --- | --- | --- |
| `portfolio` | Portfolio source | `https://rikampalkar.github.io/` |
| `tictactoe` | TicTacToe source | `https://rikampalkar.github.io/tictactoe/` |
| `chroniyam` | ChroNiyam source | `https://rikampalkar.github.io/ChroNiyam/` |
| `site` | Generated deployment only | All URLs above |

Never edit generated files in `site` by hand. Make changes in the relevant source repository, commit them there, and then assemble a deployment.

## Deploy all applications

From `portfolio`:

```bash
npm run deploy:all
```

The command requires clean source and deployment repositories. It installs locked dependencies, builds all three applications, and replaces the contents of `site` while preserving `site/.git`.

Review and publish the generated changes:

```bash
git -C ../site status
git -C ../site diff --stat
git -C ../site add --all
git -C ../site commit -m "Deploy website"
git -C ../site push origin main
```

GitHub Pages serves the `main` branch of the `site` repository. Source commits and deployment commits remain separate and auditable.

## One-time ChroNiyam cutover

ChroNiyam was previously published from the `gh-pages` branch of its own repository. After the first unified deployment has been pushed and `site/ChroNiyam/index.html` is visible on GitHub, disable GitHub Pages in the ChroNiyam repository settings so that `site` is the only deployment owner.

Do not delete the old `gh-pages` branch until `https://rikampalkar.github.io/ChroNiyam/` has been verified after the cutover.

## Daily workflow

1. Pull the repository you plan to change.
2. Develop and run its `npm run lint` and `npm run build` commands.
3. Commit and push the source change.
4. Run `npm run deploy:all` from `portfolio`.
5. Review, commit, and push the generated changes in `site`.

Old unmanaged folders may be kept temporarily as archives. Do not develop from them; remove them only after confirming that no historical files are needed.