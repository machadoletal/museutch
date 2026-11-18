# Museu TCH

*[Português](README.pt-BR.md) · **English***

**A friend group's memory archive.** Museu TCH collects, catalogues and celebrates the
most iconic lines, voice notes and images the group has produced since 2020 — the
*pérolas* (entries). It's a personal project, made for the people who lived these
stories.

> 🔒 The archive is private and password-protected. This repository holds only the
> application code — no content, data or credentials.

## What's inside

| Section | What it is |
|---|---|
| **Acervo** (Collection) | The full set of entries, with search and filters (person, year, type, group) and date sorting. Every entry has a direct link (`/#grupo_id`). |
| **Jogo dos Cônjuges** (Spouses' Game) | A guessing game: a line appears, you try to remember who said it. |
| **Ranking** | People ranked by how many entries they have in the archive. |
| **Hall da Fama** (Hall of Fame) | A detailed profile per person — share of the archive, active years, most frequent entry type, timeline. |
| **Bracket** | A single-elimination bracket to crown the best entry by vote. |

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

## Secret Santa

The **Amigo Secreto** page handles sign-up and the draw. Since the site is static, the backend is a
Google Apps Script ([`apps-script/amigo-secreto.gs`](apps-script/amigo-secreto.gs)): sign-ups live in
a spreadsheet; the draw only stores a random seed, and each person's match is recomputed when they
enter name + PIN. No match is readable anywhere, not even by the organiser. Anyone who gave an e-mail
gets their match by e-mail at draw time. The candidate list is `PERMITIDOS` in the `.gs`.

One-time setup:

1. Create a new spreadsheet → *Extensions → Apps Script* and paste `amigo-secreto.gs`.
2. *Project settings → Script properties*: add `ADMIN_KEY` (organiser key) and optionally
   `REGRAS_FIXAS` (JSON like `{"A":"B"}`: A draws B if both take part; kept only here, never in the public repo).
3. *Deploy → New deployment → Web app*: execute as **you**, access **anyone**; authorise e-mail sending
   when asked. Copy the `/exec` URL.
4. Local: `VITE_AMIGO_SECRETO_URL=<url>` in `.env`. Deploy: repository secret `AMIGO_SECRETO_URL`.
5. To draw: Amigo Secreto page → *Área do organizador* → key → *Realizar sorteio*.

Spouses can draw each other; the only restriction is the fixed rule (`REGRAS_FIXAS`).
Nobody draws themselves. Logic test: `node scripts/test-sorteio.mjs`. Note: the Apps Script owner has
technical access and could deliberately compute the matches from the `SORTEIO` seed — don't open it.

## Deploy

A `git push` to `main` triggers the [`deploy.yml`](.github/workflows/deploy.yml)
workflow, which rebuilds the encrypted bundle and publishes to GitHub Pages. An hourly
schedule keeps the archive up to date with new entries without needing a push. Required
repository secrets (*Settings → Secrets and variables → Actions*): `SHEET_ID`,
`SITE_PASSWORD`.

## License

No license. All rights reserved — the code is public for reference only; it is not open
source and grants no permission to reuse, copy or distribute.
