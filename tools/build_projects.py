"""Render data/projects/*.json into the project grid of index.html.

The cards are written as static HTML between the PROJECTS markers, so the page works
without JavaScript; the same data is embedded as JSON for the detail dialog
(assets/components/project-dialog.js). Run from the repo root:

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


def media(m, eager=False):
    if m["type"] == "video":
        poster = f' poster="{esc(m["poster"])}"' if m.get("poster") else ""
        return (f'<video class="card-media" src="{esc(m["src"])}"{poster} muted loop playsinline '
                f'preload="none" aria-label="{esc(m.get("alt"))}"></video>')
    loading = "eager" if eager else "lazy"
    fit = " fit-contain" if m.get("fit") == "contain" else ""
    return f'<img class="card-media{fit}" src="{esc(m["src"])}" alt="{esc(m.get("alt"))}" loading="{loading}">'


def card(p, i):
    status = p.get("status", "done")
    badge = '<span class="badge-wip">In progress</span>' if status == "wip" else ""
    links = "".join(
        f'<a href="{esc(l["href"])}" target="_blank" rel="noopener"><i class="{ICONS.get(l.get("icon"), ICONS["page"])}"></i> {esc(l["label"])}</a>'
        for l in p.get("links", []))
    note = f'<span class="note">{esc(p["note"])}</span>' if p.get("note") else ""
    count = len(p.get("gallery", []))
    more = f'<span class="media-count"><i class="fas fa-images"></i> {count}</span>' if count > 1 else ""
    feat = " work-featured" if p.get("featured") else ""
    return f"""
                <article id="proj-{esc(p['slug'])}" class="work work-media{feat}" data-slug="{esc(p['slug'])}" data-status="{esc(status)}">
                    <a class="card-figure" href="#{esc(p['slug'])}" aria-label="Open details: {esc(p['title'])}">
                        {media(p['hero'], eager=i < 3)}
                        {badge}{more}
                    </a>
                    <div class="work-body">
                        <div class="laurel">{esc(p.get('kicker'))}</div>
                        <h3><a class="card-open" href="#{esc(p['slug'])}">{esc(p['title'])}</a></h3>
                        <div class="tools">{esc(p.get('tools'))}</div>
                        <div class="dates">{esc(p.get('dates'))}</div>
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
        for m in [p["hero"], *p.get("gallery", [])]:
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
