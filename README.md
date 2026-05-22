# portfolio

Personal portfolio site for [Fabio Kim](https://fabioo2.github.io/portfolio/).

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- react-three-fiber (CRT monitor in hero)
- React Router (HashRouter for GitHub Pages compat)
- react-markdown for Lab entries

## Development

```bash
npm install
npm run dev      # → http://localhost:5173/portfolio/
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Adding a Lab entry

1. Drop a `.md` file in `src/data/lab/`
2. Append the entry metadata to `src/data/lab/index.ts` (slug, title, type, date, excerpt, tags, body)

## Deployment

On every push to `main`, GitHub Actions builds and deploys to GitHub Pages.

Repo settings → Pages → Source: **GitHub Actions**.
