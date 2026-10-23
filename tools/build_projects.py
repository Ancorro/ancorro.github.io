"""Render data/projects/*.json into the project grid of index.html.

The cards are written as static HTML between the PROJECTS markers, so the page works
without JavaScript; the same data is embedded as JSON for the detail dialog
(assets/components/project-dialog.js). Cards show the uniform thumb.jpg made by
tools/make_thumbs.py; the hero and gallery media are only used in the dialog.
Run from the repo root:

    python tools/build_projects.py
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "projects"
INDEX = ROOT / "index.html"
START, END = "<!-- PROJECTS:START -->", "<!-- PROJECTS:END -->"

ICONS = {"github": "fab fa-github", "page": "fas fa-arrow-up-right-from-square",
         "pdf": "fas fa-file-pdf", "play": "fas fa-play"}


def esc(s):
    return html.escape(s or "", quote=True)


def gallery_note(p):
    gallery = p.get("gallery", [])
    videos = sum(m["type"] == "video" for m in gallery)
    images = len(gallery) - videos
    parts = [f"{n} {word}{'s' if n != 1 else ''}" for n, word in ((videos, "video"), (images, "image")) if n]
    return " · ".join(parts)


def card(p, i):
    status = p.get("status", "done")
    badge = '<span class="badge-wip">In progress</span>' if status == "wip" else ""
    links = "".join(
        f'<a href="{esc(l["href"])}" target="_blank" rel="noopener"><i class="{ICONS.get(l.get("icon"), ICONS["page"])}"></i> {esc(l["label"])}</a>'
        for l in p.get("links", []))
    note = f'<span class="note">{esc(p["note"])}</span>' if p.get("note") else ""
    dates = " · ".join(s for s in (p.get("dates"), gallery_note(p)) if s)
    loading = "eager" if i < 3 else "lazy"
    return f"""
                <article id="proj-{esc(p['slug'])}" class="work work-media" data-slug="{esc(p['slug'])}" data-status="{esc(status)}">
                    <a class="card-figure frame" href="#{esc(p['slug'])}" aria-label="Open details: {esc(p['title'])}">
                        <img class="card-media" src="{esc(p['thumb'])}" alt="{esc(p['hero'].get('alt'))}" width="960" height="600" loading="{loading}">
                    </a>
                    <div class="work-body">
                        <div class="laurel">{esc(p.get('kicker'))}</div>
                        <h3><a class="card-open" href="#{esc(p['slug'])}">{esc(p['title'])}</a></h3>
                        <div class="tools">{esc(p.get('tools'))}</div>
                        <div class="dates"><span>{esc(dates)}</span>{badge}</div>
                        <p>{p.get('blurb', '')}</p>
                        <div class="links">
                            <a class="card-open more" href="#{esc(p['slug'])}"><i class="fas fa-expand"></i> Details</a>
                            {links}{note}
                        </div>
                    </div>
                </article>"""


def main():
    projects = []
    for f in sorted(DATA.glob("*.json")):
        p = json.loads(f.read_text(encoding="utf-8"))
        if not p.get("thumb"):
            sys.exit(f"{f.name}: no thumb; run tools/make_thumbs.py")
        for m in [{"src": p["thumb"]}, p["hero"], *p.get("gallery", [])]:
            for key in ("src", "poster"):
                if m.get(key) and not (ROOT / m[key]).exists():
                    sys.exit(f"{f.name}: missing {m[key]}")
        projects.append(p)
    projects.sort(key=lambda p: (p.get("order", 100), p["title"]))

    cards = "".join(card(p, i) for i, p in enumerate(projects))
    payload = json.dumps(projects, ensure_ascii=False).replace("</", "<\\/")
    block = (f"{START}{cards}\n            "
             f'<script type="application/json" id="project-data">{payload}</script>\n            {END}')

    text = INDEX.read_text(encoding="utf-8")
    new, n = re.subn(re.escape(START) + ".*?" + re.escape(END), lambda _: block, text, flags=re.S)
    if n != 1:
        sys.exit("PROJECTS markers not found in index.html")
    INDEX.write_text(new, encoding="utf-8")
    wip = sum(p.get("status") == "wip" for p in projects)
    print(f"{len(projects)} projects ({wip} in progress) written to index.html")


if __name__ == "__main__":
    main()
