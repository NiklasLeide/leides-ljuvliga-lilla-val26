#!/usr/bin/env python3
"""PDF -> text for the 2026 election documents. Deterministic, zero tokens.

Regenerates the facit that scripts/verify-manifest-quotes.js greps against.
Output dir defaults to a gitignored working dir; pass one as argv[1] to override.

    python scripts/extract-manifest-text.py .manifest-text
    MANIFEST_TEXT_DIR=.manifest-text node scripts/verify-manifest-quotes.js \
        drafts/extraktion-valmanifest-2026/extraction-*.json
"""
import os
import shutil
import sys

from pypdf import PdfReader

SRC = os.path.join("sources", "manifest", "2026")
DOCS = {
    "S": "S-valmanifest-2026.pdf",
    "V": "V-valmanifest-2026.pdf",
    "L": "L-valmanifest-2026.pdf",
    "C": "C-valmanifest-2026.pdf",
    "SD": "SD-valplattform-2026.pdf",
}
# M is a campaign-page snapshot, not a PDF - copied through as-is.
M_SNAPSHOT = "M-valloften-2026_snapshot-2026-07-20.md"


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
        "MANIFEST_TEXT_DIR", ".manifest-text")
    os.makedirs(out, exist_ok=True)
    for party, fname in DOCS.items():
        reader = PdfReader(os.path.join(SRC, fname))
        pages = [
            "===== SIDA %d =====\n%s" % (i, p.extract_text() or "")
            for i, p in enumerate(reader.pages, 1)
        ]
        text = "\n".join(pages)
        with open(os.path.join(out, party + ".txt"), "w", encoding="utf-8") as fh:
            fh.write(text)
        print("%-3s %2d sidor, %6d tecken" % (party, len(reader.pages), len(text)))
    shutil.copyfile(os.path.join(SRC, M_SNAPSHOT), os.path.join(out, "M.txt"))
    print("M   (ögonblicksbild av kampanjsida, kopierad)")
    print("\ntext skriven till %s/" % out)


if __name__ == "__main__":
    main()
