#!/usr/bin/env python3
# verify-citat-verbatim.py <omrade> — deterministisk ordagrann-verifiering av
# sources/discourse/citat-<omrade>.json mot hämtad rå-HTML (0 tokens).
# v3-mönstret: grep är facit för ordagrannhet; evaluatorn bedömer sedan
# endast relevans/täckning.
#
# Per citat: hämta url (cache per URL) eller läs lokal_fil; strippa taggar;
# normalisera whitespace + typografiska tecken; kräv att varje "…"-segment
# av citatet förekommer ordagrant. Exit 0 = alla verifierade; exit 1 = minst
# ett citat utan källstöd (tabell på stdout i båda fallen).
import json, re, ssl, sys, html, urllib.request, unicodedata

if len(sys.argv) != 2 or not re.fullmatch(r"[a-z]+", sys.argv[1]):
    print("usage: verify-citat-verbatim.py <omrade>"); sys.exit(2)
AREA = sys.argv[1]
PATH = f"sources/discourse/citat-{AREA}.json"

def normalize(s):
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"\s*­\s*", "", s.replace(" ", " "))
    s = s.replace("’", "'").replace("‘", "'")
    s = s.replace("”", '"').replace("“", '"')
    return re.sub(r"\s+", " ", s).strip()

def page_text(raw):
    raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.S | re.I)
    whole = normalize(html.unescape(re.sub(r"<[^>]+>", " ", raw)))
    # Elementvis fallback: vissa sidor (t.ex. mp.se) interfolierar dolda
    # textnoder i flödet — sök då även inom varje p/li/hN-elements egna text.
    parts = [normalize(html.unescape(re.sub(r"<[^>]+>", " ", m)))
             for m in re.findall(r"<(?:p|li|h[1-6])[^>]*>(.*?)</(?:p|li|h[1-6])>", raw, flags=re.S | re.I)]
    return whole + " ⁋ " + " ⁋ ".join(parts)

def pdf_text(data):
    import io as _io
    from pypdf import PdfReader
    r = PdfReader(_io.BytesIO(data))
    return normalize(" ".join((p.extract_text() or "") for p in r.pages))

CACHE = {}
CTX = ssl.create_default_context()
def fetch(url):
    if url in CACHE: return CACHE[url]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "val26-verify/1.0"})
        with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
            data = r.read()
        if data[:5] == b"%PDF-" or url.lower().endswith(".pdf"):
            CACHE[url] = pdf_text(data)
        else:
            CACHE[url] = page_text(data.decode("utf-8", errors="replace"))
    except Exception as e:
        CACHE[url] = None
        CACHE[url + "#err"] = str(e)[:80]
    return CACHE[url]

cat = json.load(open(PATH, encoding="utf-8"))
rows, fails = [], 0
for parti, entry in cat["partier"].items():
    for i, c in enumerate(entry["citat"]):
        src = c.get("lokal_fil") or c["url"]
        if c.get("lokal_fil"):
            try:
                if c["lokal_fil"].lower().endswith(".pdf"):
                    text = pdf_text(open(c["lokal_fil"], "rb").read())
                else:
                    text = normalize(open(c["lokal_fil"], encoding="utf-8", errors="replace").read())
            except Exception as e:
                text, CACHE[src + "#err"] = None, str(e)[:80]
        else:
            text = fetch(c["url"])
        if text is None:
            rows.append((f"{parti}[{i}]", "NEJ", f"källan kunde inte hämtas: {CACHE.get(src + '#err', '?')}")); fails += 1
            continue
        # PDF-radbrytningsavstavning: källextraktion kan innehålla
        # "marknads- misslyckanden" där löptexten är "marknadsmisslyckanden".
        dehyph = re.sub(r"([A-Za-zÅÄÖåäö])- ([a-zåäö])", r"\1\2", text)
        segs = [normalize(s) for s in c["citat"].split("…") if normalize(s)]
        missing = [s for s in segs if s not in text and s not in dehyph]
        if missing:
            rows.append((f"{parti}[{i}]", "NEJ", f"segment saknas i källan: ”{missing[0][:70]}…”")); fails += 1
        else:
            rows.append((f"{parti}[{i}]", "ja", "ordagrant (grep)"))

print("| Citat | Verifierad | Anteckning |")
print("|---|---|---|")
for r in rows: print(f"| {r[0]} | {r[1]} | {r[2]} |")
print(f"\n{len(rows) - fails}/{len(rows)} ordagrant verifierade (deterministiskt).")
sys.exit(1 if fails else 0)
