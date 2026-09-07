# Museu TCH

*[Português](README.pt-BR.md) · **English***

**A friend group's memory archive.** Museu TCH collects, catalogues and celebrates the
most iconic lines, voice notes and images the group has produced since 2020 — the
*pérolas* ("pearls"). It's a personal project, made for the people who lived these
stories.

> 🔒 The archive is private and password-protected. This repository holds only the
> application code — no content, data or credentials.

## What's inside

| Section | What it is |
|---|---|
| **Acervo** (Collection) | The full set of pearls, with search and filters (person, year, type, group) and date sorting. Every pearl has a direct link (`/#grupo_id`). |
| **Jogo dos Cônjuges** (Spouses' Game) | A guessing game: a line appears, you try to remember who said it. |
| **Ranking** | People ranked by how many pearls they have in the archive. |
| **Hall da Fama** (Hall of Fame) | A detailed profile per person — share of the archive, active years, most frequent pearl type, timeline. |
| **Bracket** | A single-elimination bracket to crown the best pearl by vote. |

## Stack

- **[React 19](https://react.dev/)** + **[Vite 8](https://vite.dev/)**
- **[Tailwind CSS 3](https://tailwindcss.com/)** for styling
- **[lucide-react](https://lucide.dev/)** (icons) and **[react-force-graph-2d](https://github.com/vasturiano/react-force-graph)** (visualisations)
- **GitHub Actions → GitHub Pages** for deployment
- Data ships as a bundle **encrypted at build time** (AES-GCM), decrypted in the
  browser with the site password. The password never leaves the device and is not in
  the code.

## Running locally

Requires Node 24+.

```bash
npm install
```

Create a `.env` file at the root (untracked) with the archive credentials:

```
SHEET_ID=...
SITE_PASSWORD=...
```

```bash
npm run dev
```

The `predev` / `prebuild` script (`scripts/build-data.mjs`) fetches the entries,
encrypts the JSON with `SITE_PASSWORD` and writes `public/museu-data.enc.json`. Vite
serves/bundles that file; the plaintext never touches disk.

## Deploy

A `git push` to `main` triggers the [`deploy.yml`](.github/workflows/deploy.yml)
workflow, which rebuilds the encrypted bundle and publishes to GitHub Pages. An hourly
schedule keeps the archive up to date with new entries without needing a push. Required
repository secrets (*Settings → Secrets and variables → Actions*): `SHEET_ID`,
`SITE_PASSWORD`.

## License

No license. All rights reserved — the code is public for reference only; it is not open
source and grants no permission to reuse, copy or distribute.
