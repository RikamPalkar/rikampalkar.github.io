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

`archive/legacy-pages-output/` is a local backup of the previous generated-output repository. It is ignored and must not be edited or committed. Archive the former source repositories only after this repository has successfully deployed and all three URLs have been verified.