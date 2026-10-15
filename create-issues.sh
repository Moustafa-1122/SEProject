#!/usr/bin/env bash
# Run from the repo folder (next to backlog.csv) after: gh auth login
# Safe to re-run: issues whose title already exists are skipped.
set -e
PY=$(command -v python3 || command -v python) || { echo "Python not found"; exit 1; }
for l in feature nfr chore bug; do gh label create "$l" --force >/dev/null; done
for m in v1 v1.1 v2 v3; do gh api repos/:owner/:repo/milestones -f title="$m" >/dev/null 2>&1 || true; done
"$PY" - <<'PY'
import csv, json, subprocess
out = subprocess.run(["gh","issue","list","--state","all","--limit","500","--json","title"],
                     capture_output=True, text=True, encoding="utf-8", check=True).stdout
existing = {i["title"] for i in json.loads(out)}
for r in csv.DictReader(open("backlog.csv", encoding="utf-8")):
    if r["title"] in existing:
        print("skip (exists):", r["title"]); continue
    subprocess.run(["gh","issue","create","--title",r["title"],"--body",r["body"],
                    "--label",r["labels"],"--milestone",r["milestone"]], check=True)
    print("created:", r["title"])
PY
