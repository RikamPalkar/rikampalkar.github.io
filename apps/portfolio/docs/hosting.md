## Hosting this site on GitHub Pages (manual deployment)

This project uses Vite + React and is developed in the repo:

- `rikampalkar.github.io.sourcecode` (source code)
- `rikampalkar.github.io` (public GitHub Pages repo)

GitHub Pages serves whatever is in the **`rikampalkar.github.io`** repo.  
The workflow below is for **simple manual deployment (no automation)**.

---

## 1. Prerequisites

- Local clone of **source repo**:
  - `rikampalkar.github.io.sourcecode`
- Local clone of **GitHub Pages repo**:
  - `rikampalkar.github.io`
- Node.js and npm installed

Example directory layout on your machine:

```text
/Users/rikam/Projects/Personal website/Source Code/
  ├─ rikampalkar.github.io.sourcecode   (this React/Vite project)
  └─ rikampalkar.github.io              (GitHub Pages repo)
```

---

## 2. Work and commit in the source repo

1. Do all development in:

   ```bash
   cd "/Users/rikam/Projects/Personal website/Source Code/rikampalkar.github.io.sourcecode"
   ```

2. Commit and push changes there as usual:

   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

This does **not** update the live site yet. The live site only changes when you deploy to `rikampalkar.github.io`.

---

## 3. Build the site

When you are ready to update the live site:

1. From the **source repo**:

   ```bash
   cd "/Users/rikam/Projects/Personal website/Source Code/rikampalkar.github.io.sourcecode"

   # First time only
   npm install

   # Every deployment
   npm run build   # creates dist/
   ```

This will generate a static site inside the `dist/` folder.

---

## 4. Copy the build to the GitHub Pages repo

1. Copy the contents of `dist/` into your local clone of `rikampalkar.github.io`:

   ```bash
   cp -R dist/* '/Users/rikam/Projects/Personal website/Hosted/rikampalkar.github.io'
   ```

   - This overwrites the previous version of the site files in the GitHub Pages repo with the latest build.

---

## 5. Commit and push from the GitHub Pages repo

1. Go to the GitHub Pages repo:

   ```bash
   cd "/Users/rikam/Projects/Personal website/Source Code/rikampalkar.github.io"
   ```

2. Commit and push the new build:

   ```bash
   git add .
   git commit -m "Deploy latest build"
   git push
   ```

GitHub Pages will now serve the updated files from `rikampalkar.github.io`.  
After a short delay (usually under a minute), your changes should be live at:

`https://rikampalkar.github.io`

