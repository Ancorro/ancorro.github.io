"""Run the agent-written project text through the style-tune pipeline (writing-workflows/PROSE.md).

  lint      flag prose-rule problems in data/projects/*.json: em dashes, acronyms used before they are defined
  export    every generated paragraph (blurb, long[], gallery captions) -> <dir>/drafts.jsonl for the tuned model
  merge     candidates*.jsonl files -> one candidates.jsonl, in the order given (first adapter preferred)
  import    checked.json (style-tune/src/check_rewrites.py output) -> the JSON entries; original kept where no
            rewrite passed; HTML lead-ins (<b>...</b>) are put back; writes <dir>/import.log

Titles, kickers, tool lists, highlights and link labels are labels, not prose, and stay as written.
Run from the repo root, e.g.  python tools/style_pass.py export --dir ../style-tune/data/docs/site_20261022
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "projects"
LEAD = re.compile(r"^\s*<b>(.+?)</b>\s*")
TAG = re.compile(r"<[^>]+>")
ACRONYM = re.compile(r"\b[A-Z][A-Z0-9-]{1,}[A-Z0-9]\b")
DEFINED = re.compile(r"\(([^()]*)\)")
# Product, company and database names are words, not acronyms to expand.
NAMES = {"NVIDIA", "MATLAB", "README", "PGT121", "VRC34", "CATNAP", "ESM3", "HIV", "OAS", "PyQt", "SciPy",
         "PyTorch", "QLoRA", "LoRA", "GitHub", "OSWorld", "MuJoCo", "GRPO", "KV"}
ALLOWED = NAMES | {"GPU", "GPUs", "CPU", "LLM", "LLMs", "AI", "ML", "PhD", "M.S.", "B.S.", "API", "USA", "OSU", "HPC",
                   "HTML", "CSS", "JSON", "PDF", "URL", "ID", "IDs", "OK", "3D", "2D", "RGB-D", "A40", "H100", "G1",
                   "SO-101", "MIT-BIH", "AAMI", "DPO", "PPO", "RL", "ROC", "AUROC", "WEC", "RM3", "PTO", "NDA",
                   "QR", "W&B", "IK", "SAM", "DINO", "SigLIP", "AMI", "RLHF", "RFT", "SFT", "GEM"}


def entries():
    for f in sorted(DATA.glob("*.json")):
        yield f, json.loads(f.read_text(encoding="utf-8"))


def paragraphs(p):
    """(brief_id, text) for every generated prose field of one entry."""
    yield f"{p['slug']}.blurb", p.get("blurb", "")
    for i, t in enumerate(p.get("long", [])):
        yield f"{p['slug']}.long.{i}", t
    for i, g in enumerate(p.get("gallery", [])):
        if g.get("caption"):
            yield f"{p['slug']}.cap.{i}", g["caption"]


def lint(args):
    bad = 0
    for f, p in entries():
        seen = set()
        for bid, text in paragraphs(p):
            plain = TAG.sub("", text)
            if "—" in plain:
                print(f"{bid}: em dash")
                bad += 1
            # An acronym counts as defined once it appears next to a parenthesis anywhere earlier in the entry.
            for m in DEFINED.finditer(plain):
                seen.update(ACRONYM.findall(m.group(1)))
                before = plain[max(0, m.start() - 40):m.start()]
                seen.update(ACRONYM.findall(before))
            for a in ACRONYM.findall(plain):
                if a not in seen and a not in ALLOWED and a.rstrip("s") not in ALLOWED:
                    print(f"{bid}: '{a}' used before it is defined")
                    seen.add(a)
                    bad += 1
    print(f"{bad} finding(s)")
    sys.exit(1 if bad else 0)


def export(args):
    args.dir.mkdir(parents=True, exist_ok=True)
    rows, layout = [], []
    for f, p in entries():
        for bid, text in paragraphs(p):
            m = LEAD.match(text)
            body = TAG.sub("", text[m.end():] if m else text).strip()
            # sample_candidates.py seeds per draft with int(brief_id[1:]), so ids must be <letter><digits>.
            sid = f"s{len(rows):03d}"
            layout.append({"id": sid, "field": bid, "lead": m.group(1) if m else None})
            rows.append({"brief_id": sid, "section": p["title"], "draft": body})
    (args.dir / "drafts.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    (args.dir / "layout.json").write_text(json.dumps(layout, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(rows)} paragraphs, {sum(len(r['draft'].split()) for r in rows)} words -> {args.dir}")


def merge(args):
    cands = {}
    for f in args.files:
        for line in f.read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            cands.setdefault(r["brief_id"], []).extend(r["candidates"])
    args.out.write_text("".join(json.dumps({"brief_id": k, "candidates": v}, ensure_ascii=False) + "\n"
                                for k, v in sorted(cands.items())), encoding="utf-8")
    print(f"{len(cands)} paragraphs, {sum(len(v) for v in cands.values())} candidates -> {args.out}")


def do_import(args):
    checked = {r["id"]: r for r in json.loads((args.dir / "checked.json").read_text(encoding="utf-8"))}
    layout = {l["field"]: l for l in json.loads((args.dir / "layout.json").read_text(encoding="utf-8"))}
    rows = {field: checked.get(l["id"]) for field, l in layout.items()}
    log, used = [], 0
    for f, p in entries():
        changed = False
        for bid, text in paragraphs(p):
            r = rows.get(bid)
            if not r or not r.get("final"):
                log.append(f"- {bid}: no usable rewrite, original kept")
                continue
            final = re.sub(r"\[\[|\]\]", "", r["final"]).strip()
            lead = layout[bid]["lead"]
            new = (f"<b>{lead}</b> " if lead else "") + final
            kind, _, idx = bid.split(".", 1)[1].partition(".")
            if kind == "blurb":
                p["blurb"] = new
            elif kind == "long":
                p["long"][int(idx)] = new
            else:
                p["gallery"][int(idx)]["caption"] = new
            changed = True
            used += 1
            log.append(f"- {bid}: {r.get('final_source')}" + (f"; unresolved: {'; '.join(r['unresolved'])}" if r.get("unresolved") else ""))
        if changed:
            f.write_text(json.dumps(p, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (args.dir / "import.log").write_text("\n".join(log) + "\n", encoding="utf-8")
    print(f"{used} paragraphs imported; log in {args.dir / 'import.log'}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("lint")
    e = sub.add_parser("export")
    e.add_argument("--dir", type=pathlib.Path, required=True)
    m = sub.add_parser("merge")
    m.add_argument("files", type=pathlib.Path, nargs="+")
    m.add_argument("--out", type=pathlib.Path, required=True)
    i = sub.add_parser("import")
    i.add_argument("--dir", type=pathlib.Path, required=True)
    args = ap.parse_args()
    {"lint": lint, "export": export, "merge": merge, "import": do_import}[args.cmd](args)


if __name__ == "__main__":
    main()
