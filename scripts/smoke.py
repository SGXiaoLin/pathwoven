#!/usr/bin/env python3
"""Validate catalog + all registered story.json files (no Node required)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "stories" / "catalog.json"


def clamp(story: dict, key: str, value):
    defn = story.get("variables", {}).get(key) or {}
    if defn.get("type") != "number":
        return value
    n = float(value)
    if "min" in defn:
        n = max(defn["min"], n)
    if "max" in defn:
        n = min(defn["max"], n)
    return int(n) if n == int(n) else n


def validate(story: dict) -> list[str]:
    errors = []
    if not story.get("id"):
        errors.append("missing id")
    start = story.get("startNodeId")
    nodes = story.get("nodes") or {}
    if not start:
        errors.append("missing startNodeId")
    elif start not in nodes:
        errors.append(f"startNodeId missing: {start}")
    for nid, node in nodes.items():
        for choice in node.get("choices") or []:
            nxt = choice.get("next")
            targets = []
            if isinstance(nxt, str):
                targets.append(nxt)
            elif isinstance(nxt, list):
                targets.extend(b.get("goto") for b in nxt)
                if choice.get("else"):
                    targets.append(choice["else"])
            for t in targets:
                if t not in nodes:
                    errors.append(f"dead link {nid}.{choice.get('id')} -> {t}")
        if node.get("type") != "ending" and not (node.get("choices") or []):
            errors.append(f"non-ending has no choices: {nid}")
    return errors


def main() -> int:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if not catalog.get("site") or not isinstance(catalog.get("stories"), list):
        print("CATALOG FAIL: invalid shape")
        return 1
    if not catalog["stories"]:
        print("CATALOG FAIL: no stories")
        return 1

    failed = False
    for entry in catalog["stories"]:
        sid = entry.get("id")
        path = entry.get("path")
        if not sid or not path:
            print(f"CATALOG FAIL: entry missing id/path: {entry}")
            failed = True
            continue
        story_file = ROOT / "stories" / path
        if not story_file.is_file():
            print(f"MISSING: {sid} -> {path}")
            failed = True
            continue
        story = json.loads(story_file.read_text(encoding="utf-8"))
        errors = validate(story)
        if errors:
            print(f"VALIDATION FAIL: {sid}")
            for e in errors:
                print("-", e)
            failed = True
        else:
            print(f"OK: {sid} ({len(story.get('nodes') or {})} nodes)")

    if failed:
        return 1
    print("SMOKE OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
