# ancorro.github.io

Source for my personal portfolio home page, live at **[ancorro.github.io](https://ancorro.github.io/)**.

A single static page (no build step — served verbatim via `.nojekyll`) introducing me and
linking to my featured projects, experience, and skills.

## Linked projects
- **[Parallel Logic Expert with Operator Routing](https://ancorro.github.io/logic-expert/)** — interactive project page ([code](https://github.com/Ancorro/logic-expert-public)).
- **Guidance — Agentic Field Technician Assistant** — 1st place, BeaverHacks 2026 ([code](https://github.com/ekanshArora123/beaverhacks2026)).
- **Waste Treatment Completion Company** — leading software engineer, senior capstone project ([project page](https://hlwa-portfolio.github.io/)).
- **[AI Modeling for HIV Antibody Research](https://ancorro.github.io/esm3-banb/)** — ESM3 / LoRA / VAE course project with a full write-up.
- **Deck — Multi-Agent Orchestration and Control Panel** — parallel LLM coding agents and a phone control panel for them ([code](https://github.com/Ancorro/deck-public)).

## Projects grid
Project cards and their detail dialogs come from `data/projects/<slug>.json` (format in
`data/projects/SCHEMA.md`), with media in `assets/projects/<slug>/`. Each card shows one uniform
thumbnail (`thumb.jpg`, a 16:10 duotone crop) made by `python tools/make_thumbs.py`; the full-colour
hero and gallery media appear only in the dialog. After editing an entry run
`python tools/build_projects.py`; it writes static cards into `index.html` (works without JavaScript)
and embeds the data for `assets/components/project-dialog.js`.

## Structure
- `index.html` — the portfolio page
- `index.css` — styles (Eggshell & Bitter-Orange theme)
- `assets/images/favicon.png` — site icon
