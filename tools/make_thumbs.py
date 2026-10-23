"""Make one uniform card thumbnail per project: assets/projects/<slug>/thumb.jpg.

Every thumbnail is the same size (960x600, 16:10), a cover crop of one detail of the
project's media, and goes through the same tone pass: mostly desaturated and remapped
between the site's ink and paper colours so sixteen unrelated screenshots and charts
read as one set of prints. The full-colour originals stay in the dialog gallery.
Run from the repo root:

    python tools/make_thumbs.py
"""
import json
import pathlib

from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 960, 600
INK = (24, 24, 23)        # darkest tone, near the masthead's #151514
PAPER = (247, 247, 245)   # lightest tone, the site's paper
KEEP_COLOUR = 0.14        # how much of the original colour survives the tone pass

# slug: (source under assets/projects/<slug>/, pre-crop box or None, focus x, focus y)
# The box picks the detail to show; the focus point says where the 16:10 crop centres.
PICKS = {
    "rlrobots": ("g1-two-hand-box.jpg", None, 0.5, 0.5),
    "gradproposal": ("team-communication.jpg", (640, 45, 1400, 520), 0.5, 0.5),
    "deck": ("pad.webp", (0, 0, 800, 500), 0.5, 0.5),
    "wec": ("plant_comparison.jpg", (0, 30, 930, 570), 0.5, 0.5),
    "computer-use-stack": ("loop-diagram.jpg", (300, 90, 1100, 590), 0.5, 0.5),
    "honesty-small": ("lies-removed.jpg", (378, 60, 1400, 699), 0.5, 0.5),
    "sinusoidal": ("head-open2.webp", (0, 0, 960, 500), 0.5, 0.45),
    "style-tune": ("pipeline-diagram.jpg", (800, 84, 1400, 459), 0.5, 0.5),
    "waste": ("app.jpg", (680, 100, 1400, 550), 0.5, 0.5),
    "esm3": ("roc_pr.jpg", (60, 40, 700, 440), 0.5, 0.5),
    "logic-expert": ("routing.jpg", (80, 70, 1160, 745), 0.5, 0.5),
    "guidance": ("example.jpg", (0, 20, 1195, 896), 0.5, 0.5),
    "ecg-beat-classifier": ("step1-raw-208.webp", (120, 55, 672, 400), 0.5, 0.5),
    "gpu-payback": ("summary.webp", (0, 0, 900, 500), 0.0, 0.0),
}


def tone(im):
    """Duotone between INK and PAPER, with a little of the original colour blended back."""
    grey = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=0.5)
    lut = []
    for c in range(3):
        lo, hi = INK[c], PAPER[c]
        lut += [round(lo + (hi - lo) * v / 255) for v in range(256)]
    duotone = grey.convert("RGB").point(lut)
    return Image.blend(duotone, im, KEEP_COLOUR)


def make(src, box, fx, fy):
    im = Image.open(src).convert("RGB")
    if box:
        im = im.crop(box)
    return tone(ImageOps.fit(im, (W, H), Image.LANCZOS, centering=(fx, fy)))


def main():
    for slug, (name, box, fx, fy) in PICKS.items():
        folder = ROOT / "assets" / "projects" / slug
        make(folder / name, box, fx, fy).save(folder / "thumb.jpg", quality=84, optimize=True)
        entry = ROOT / "data" / "projects" / f"{slug}.json"
        data = json.loads(entry.read_text(encoding="utf-8"))
        data["thumb"] = f"assets/projects/{slug}/thumb.jpg"
        entry.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(PICKS)} thumbnails written")


if __name__ == "__main__":
    main()
