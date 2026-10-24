# Project entry schema (draft redesign)

One file per project: `data/projects/<slug>.json`. Assets live in `assets/projects/<slug>/`.
`tools/build_projects.py` merges these into the home page.

```json
{
  "slug": "rlrobots",
  "title": "Robot Arm Pick-and-Place from Camera Input",
  "status": "wip",                       // "wip" or "done"
  "dates": "Sep 2026 – present",         // from git log first/last commit
  "order": 10,                           // lower = earlier on the page; newest/most impressive first
  "kicker": "Personal Research · Robotics",   // small label above the title
  "tools": "Reinforcement Learning (PPO, MuJoCo) · Vision (Grounding DINO, SAM 2)",
  "tags": "Isaac Lab · MuJoCo · PPO",          // card tags: 2-3 short names, no expansions
  "blurb": "One-sentence card text, ~25 words, plain language, real numbers only.",
  "long": [                              // dialog body: 2-6 paragraphs, plain HTML allowed (<b>, <i>, <a>)
    "Paragraph one...",
    "Paragraph two..."
  ],
  "highlights": ["Pick + place 240/240 with exact positions", "..."],   // optional, 2-5 short bullets with numbers
  "links": [{"label": "Code", "href": "https://...", "icon": "github"}],  // icon: github | page | pdf | play
  "note": "Code private",                // optional small note shown beside links
  "thumb": "assets/projects/rlrobots/thumb.jpg",   // the card image: written by tools/make_thumbs.py, 960x600, duotone
  "hero": {"type": "video", "src": "assets/projects/rlrobots/pick.mp4", "poster": "assets/projects/rlrobots/pick.jpg", "alt": "..."},
  "gallery": [                           // shown in the dialog, 1-6 items; hero may repeat as first
    {"type": "image", "src": "assets/projects/rlrobots/cams.jpg", "alt": "...", "caption": "..."},
    {"type": "video", "src": "...mp4", "poster": "...jpg", "alt": "...", "caption": "..."}
  ]
}
```

Rules
- Facts and numbers only from the repo's own README / LOG / docs / results. No invented results.
- Define acronyms inline on first use in each field (e.g. "PPO (Proximal Policy Optimization)").
- Say "roguelike", never "roguelite".
- Images: JPG or WebP, max ~1400 px wide, ≤ 300 KB each. Videos: H.264 MP4, ≤ 720p, ≤ 3 MB, muted-friendly,
  with a poster JPG (first good frame). Use ffmpeg (on PATH) and pdftoppm (on PATH) for PDF figures.
- Only the user's own renders, figures and screenshots. Never copy third-party images
  (datasets' object textures, reference art, logos, other papers' figures, `external/` folders).
- A diagram you draw yourself is fine (SVG or matplotlib) but caption it as a diagram. A chart must plot real
  numbers from the repo; caption the source.
- All the source repos are private: no GitHub links to them (use "note": "Code private"). Do not link
  claude.ai/artifact pages.
