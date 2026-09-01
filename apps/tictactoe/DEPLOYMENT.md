# 🚀 Deployment Guide

This app is deployed at **https://rikampalkar.github.io/tictactoe**

## Quick Deploy

```bash
# 1. Build
npm run build

# 2. Copy to live site repo
rm -rf "/Users/rikam/Projects/Personal/Personal Website/Hosted/rikampalkar.github.io/tictactoe"
cp -r dist "/Users/rikam/Projects/Personal/Personal Website/Hosted/rikampalkar.github.io/tictactoe"

# 3. Push from live site repo
cd "/Users/rikam/Projects/Personal/Personal Website/Hosted/rikampalkar.github.io"
git add tictactoe/
git commit -m "Update Tic-Tac-Toe app"
git push
```

## Important Notes

- **Base Path**: `vite.config.ts` has `base: '/tictactoe/'` - don't change this
- **Icon Name**: Uses `tictactoe-icon.svg` to avoid conflicts with parent site's favicon
- **Live in 1-5 minutes**: GitHub Pages takes a few minutes to deploy

## Repositories

- **Source**: https://github.com/RikamPalkar/rikampalkar.github.io.TicTacToe
- **Live Site**: https://github.com/RikamPalkar/rikampalkar.github.io
