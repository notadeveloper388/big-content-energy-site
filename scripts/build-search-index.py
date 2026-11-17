#!/usr/bin/env python3
"""Generate search/search-index.json from every HTML page in the site.

Run from the repository root:

    python3 scripts/build-search-index.py

The index stores each page's title, URL, and full plain text so the
client-side search at /search/ can match journal and other page bodies,
not just titles.
"""

from __future__ import annotations

import json
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "search" / "search-index.json"

SKIP_DIRS = {".git", "node_modules"}
# The search page itself does not need to be in the index.
SKIP_FILES = {"search/index.html"}


class PageExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip = 0
        self._in_title = False
        self._in_body = False
        self._title_parts: list[str] = []
        self._text_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"script", "style", "noscript"}:
            self._skip += 1
            return
        if tag == "title":
            self._in_title = True
            return
        if tag == "body":
            self._in_body = True
        if self._in_body and self._skip == 0 and tag in {
            "p", "div", "li", "h1", "h2", "h3", "h4", "tr", "article",
            "section", "blockquote", "br", "figcaption", "dt", "dd",
        }:
            self._text_parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"}:
            if self._skip:
                self._skip -= 1
            return
        if tag == "title":
            self._in_title = False
            return
        if self._in_body and self._skip == 0 and tag in {
            "p", "div", "li", "h1", "h2", "h3", "h4", "tr", "article",
            "section", "blockquote", "figcaption", "dt", "dd",
        }:
            self._text_parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        if self._in_title:
            self._title_parts.append(data)
        elif self._in_body:
            self._text_parts.append(data)


def clean_space(s: str) -> str:
    return " ".join(s.split())


def page_title(raw_title: str, text: str, rel: Path) -> str:
    title = clean_space(raw_title)
    for suffix in (
        " • Big Content Energy Archive",
        " • Big Content Energy",
        " | Big Content Energy",
        " - Big Content Energy",
    ):
        if title.endswith(suffix):
            title = title[: -len(suffix)].rstrip()
    if title:
        return title
    # Fall back to the first words of body text, then the filename.
    if text:
        return text[:80]
    return rel.stem.replace("-", " ")


def page_url(rel: Path) -> str:
    parts = rel.as_posix()
    if parts == "index.html":
        return "/"
    if parts.endswith("/index.html"):
        return "/" + parts[: -len("index.html")]
    return "/" + parts


def iter_html(root: Path):
    for path in sorted(root.rglob("*.html")):
        rel = path.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if rel.as_posix() in SKIP_FILES:
            continue
        yield path, rel


def extract(path: Path) -> tuple[str, str]:
    html = path.read_text(encoding="utf-8", errors="replace")
    parser = PageExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception as exc:
        print(f"warn: failed to parse {path}: {exc}", file=sys.stderr)
    title = "".join(parser._title_parts)
    text = clean_space("".join(parser._text_parts))
    return title, text


def main() -> int:
    pages = []
    for path, rel in iter_html(ROOT):
        raw_title, text = extract(path)
        title = page_title(raw_title, text, rel)
        url = page_url(rel)
        pages.append({"title": title, "url": url, "text": text})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"pages": pages}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(pages)} pages to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
