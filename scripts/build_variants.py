#!/usr/bin/env python3
"""Generate Fragrantica-style variant pages from Data/Tjoomde.xlsx.

Usage: python3 scripts/build_variants.py
Reads : Data/Tjoomde.xlsx (Sheet1)
Writes: assets/variants.js + <Slug>/index.html (35 pages)

Heuristic fields (longevity, sillage, gender, day/night, seasons,
accords, descriptions) are DERIVED from notes and labelled "Estimasi"
on-page. Override any variant via Data/overrides.json:
  { "Marshmallow": { "longevity_h": "8-10", "sillage": 3, ... } }
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "Data" / "Tjoomde.xlsx"
OVERRIDES = ROOT / "Data" / "overrides.json"
WA_NUMBER = "6281384812214"

# note -> [(accord, weight)]; vocabulary mirrors Fragrantica accord names.
NOTE_ACCORDS = {
    "bergamot": [("citrus", 1.0)], "calabrian bergamot": [("citrus", 1.0)],
    "bitter orange": [("citrus", .8), ("aromatic", .2)], "citron": [("citrus", 1.0)],
    "grapefruit": [("citrus", .9), ("fruity", .1)], "italian lemon": [("citrus", 1.0)],
    "lemon": [("citrus", 1.0)], "mandarin": [("citrus", .9), ("fruity", .1)],
    "mandarin orange": [("citrus", .9), ("fruity", .1)], "orange": [("citrus", .8), ("fruity", .2)],
    "orange peel": [("citrus", 1.0)], "sicilian mandarin": [("citrus", .9), ("fruity", .1)],
    "sicilian orange": [("citrus", .9), ("fruity", .1)], "litsea cubeba": [("citrus", .7), ("fresh", .3)],
    "rhubarb": [("green", .5), ("fruity", .3), ("fresh", .2)],
    "apple": [("fruity", .9), ("sweet", .1)], "apricot": [("fruity", .8), ("sweet", .2)],
    "black currant": [("fruity", .8), ("green", .2)], "blackcurrant": [("fruity", .8), ("green", .2)],
    "cassis": [("fruity", .7), ("green", .3)], "candy apple": [("sweet", .6), ("fruity", .4)],
    "coconut": [("lactonic", .5), ("sweet", .3), ("tropical", .2)],
    "fig": [("green", .5), ("fruity", .3), ("woody", .2)], "grapes": [("fruity", .9), ("sweet", .1)],
    "granny smith apple": [("fruity", .9), ("green", .1)], "litchi": [("fruity", .8), ("floral", .2)],
    "lychee": [("fruity", .8), ("floral", .2)], "melon": [("fruity", .7), ("aquatic", .3)],
    "nectarine blossom": [("floral", .5), ("fruity", .5)], "passionfruit": [("fruity", .8), ("tropical", .2)],
    "peach": [("fruity", .8), ("sweet", .2)], "pear": [("fruity", .9), ("green", .1)],
    "pineapple": [("fruity", .8), ("tropical", .2)], "pitahaya": [("fruity", .7), ("tropical", .3)],
    "raspberry": [("fruity", .8), ("sweet", .2)], "strawberry": [("fruity", .7), ("sweet", .3)],
    "damask rose": [("floral", 1.0)], "rose": [("floral", 1.0)],
    "carnation": [("floral", .7), ("warm spicy", .3)], "freesia": [("floral", .8), ("fresh", .2)],
    "frangipani": [("floral", .7), ("sweet", .3)], "geranium": [("floral", .6), ("green", .4)],
    "heliotrope": [("powdery", .6), ("floral", .4)], "iris": [("powdery", .7), ("floral", .3)],
    "orris root": [("powdery", .8), ("earthy", .2)], "jasmine": [("white floral", .9), ("floral", .1)],
    "jasmine sambac": [("white floral", 1.0)], "lavender": [("aromatic", .7), ("floral", .3)],
    "lily-of-the-valley": [("white floral", .8), ("green", .2)], "magnolia": [("floral", .7), ("citrus", .3)],
    "mimosa absolute": [("powdery", .5), ("floral", .5)], "orange blossom": [("white floral", .9), ("citrus", .1)],
    "tunisian orange blossom": [("white floral", .9), ("citrus", .1)],
    "pink peony": [("floral", .9), ("fresh", .1)], "tuberose": [("white floral", .9), ("sweet", .1)],
    "violet": [("powdery", .5), ("floral", .5)], "violet leaf": [("green", .8), ("powdery", .2)],
    "benzoin": [("balsamic", .7), ("sweet", .3)], "caramel": [("sweet", 1.0)],
    "coumarin": [("sweet", .6), ("powdery", .4)], "gourmand accord": [("sweet", 1.0)],
    "honey": [("honey", .8), ("sweet", .2)], "marshmallow": [("sweet", .6), ("powdery", .4)],
    "praline": [("sweet", .8), ("nutty", .2)], "sugar": [("sweet", 1.0)],
    "toffee": [("sweet", .9), ("balsamic", .1)], "tonka": [("sweet", .6), ("powdery", .4)],
    "tonka bean": [("sweet", .6), ("powdery", .4)], "vanilla": [("sweet", .6), ("powdery", .4)],
    "bourbon vanilla": [("sweet", .6), ("powdery", .4)], "madagascar vanilla": [("sweet", .6), ("powdery", .4)],
    "whipped cream": [("lactonic", .6), ("sweet", .4)],
    "akigalawood": [("woody", .8), ("warm spicy", .2)], "cashmeran": [("woody", .6), ("musky", .4)],
    "cedar": [("woody", 1.0)], "cedarwood": [("woody", 1.0)], "dry wood": [("woody", 1.0)],
    "evernyl": [("woody", .6), ("earthy", .4)], "guaiac wood": [("woody", .7), ("smoky", .3)],
    "oakmoss": [("earthy", .8), ("green", .2)], "patchouli": [("earthy", .6), ("woody", .4)],
    "sandalwood": [("woody", .8), ("lactonic", .2)], "teak wood": [("woody", 1.0)],
    "vetiver": [("woody", .6), ("green", .4)], "haitian vetiver": [("woody", .6), ("green", .4)],
    "woody notes": [("woody", 1.0)], "woodsy notes": [("woody", .8), ("green", .2)],
    "sand": [("aquatic", .5), ("musky", .5)],
    "amber": [("amber", 1.0)], "ambergris": [("amber", .6), ("musky", .4)],
    "amberwood": [("amber", .6), ("woody", .4)], "ambrette": [("musky", .8), ("sweet", .2)],
    "ambrofix": [("musky", .5), ("woody", .3), ("amber", .2)],
    "ambroxan": [("musky", .5), ("woody", .3), ("amber", .2)],
    "black amber": [("amber", .8), ("smoky", .2)], "labdanum": [("amber", .6), ("balsamic", .4)],
    "mahonial": [("woody", .6), ("amber", .4)], "musk": [("musky", 1.0)],
    "white musk": [("musky", 1.0)], "white amber": [("amber", .7), ("musky", .3)],
    "cardamom": [("warm spicy", .8), ("aromatic", .2)], "caraway": [("warm spicy", .7), ("green", .3)],
    "cinnamon": [("warm spicy", 1.0)], "cloves": [("warm spicy", 1.0)],
    "coriander": [("fresh spicy", .7), ("green", .3)], "ginger": [("fresh spicy", .7), ("citrus", .3)],
    "nutmeg": [("warm spicy", .8), ("sweet", .2)], "pepper": [("warm spicy", .8), ("fresh spicy", .2)],
    "pink pepper": [("fresh spicy", .6), ("fruity", .4)], "saffron": [("warm spicy", .6), ("leathery", .4)],
    "timur": [("fresh spicy", .7), ("citrus", .3)], "fennel": [("aromatic", .6), ("sweet", .4)],
    "licorice": [("sweet", .6), ("aromatic", .4)], "celery seeds": [("green", .7), ("fresh spicy", .3)],
    "bay leaf": [("aromatic", .6), ("fresh spicy", .4)], "basil": [("aromatic", .7), ("green", .3)],
    "rosemary": [("aromatic", .8), ("fresh", .2)],
    "aquatic notes": [("aquatic", 1.0)], "green notes": [("green", 1.0)],
    "green tea": [("green", .6), ("fresh", .4)], "mint": [("fresh", .7), ("green", .3)],
    "oolong tea": [("green", .5), ("floral", .3), ("smoky", .2)],
    "white tea": [("green", .4), ("white floral", .4), ("fresh", .2)],
    "solar notes": [("floral", .5), ("sweet", .3), ("fresh", .2)],
    "hay": [("green", .4), ("sweet", .3), ("powdery", .3)],
    "cognac": [("sweet", .5), ("warm spicy", .3), ("smoky", .2)],
    "rum": [("sweet", .7), ("warm spicy", .3)], "tobacco": [("smoky", .5), ("sweet", .3), ("leathery", .2)],
    "tobacco leaf": [("smoky", .5), ("sweet", .3), ("leathery", .2)],
    "leather": [("leathery", 1.0)], "suede": [("leathery", .7), ("powdery", .3)],
    "incense": [("smoky", .7), ("balsamic", .3)],
}

# base notes linger longest -> weighted heaviest (mirrors overall impression)
TIER_W = {"top": 1.0, "heart": 1.2, "base": 1.4}

FEM = ["rose", "jasmine", "peony", "tuberose", "vanilla", "caramel", "strawberry", "coconut", "candy", "praline", "frangipani", "mimosa", "freesia", "lychee", "peach", "apricot", "white musk", "powdery"]
MASC = ["vetiver", "leather", "tobacco", "oud", "cedar", "lavender", "aquatic", "marine", "rum", "cognac", "pepper", "cypress", "oakmoss", "smoke", "suede"]


def esc(s):
    return html.escape(s or "", quote=True)


def split_notes(cell):
    if not cell:
        return []
    return [n.strip() for n in str(cell).split(",") if n.strip()]


def accords_for(tiers):
    """tiers = [(tier_name, [notes])]; score weighted by tier, scaled to max=100."""
    scores = {}
    for tier_name, notes in tiers:
        w = TIER_W.get(tier_name, 1.0)
        for n in notes:
            for accord, aw in NOTE_ACCORDS.get(n.strip().lower(), [("musky", 0.3)]):
                scores[accord] = scores.get(accord, 0) + aw * w
    if not scores:
        return []
    mx = max(scores.values())
    return sorted(((a, round(s / mx * 100)) for a, s in scores.items()),
                  key=lambda x: -x[1])[:5]


def primary_accord(accords):
    return accords[0][0] if accords else "musky"


def estimate(notes, ov):
    low = " ".join(notes).lower()
    heavy = sum(1 for k in ["amber", "oud", "leather", "tobacco", "patchouli", "musk", "vanilla", "benzoin", "tonka", "sandalwood", "oakmoss"] if k in low)
    fresh = sum(1 for k in ["citrus", "lemon", "bergamot", "aquatic", "marine", "green tea", "mint", "orange", "grapefruit"] if k in low)
    fem = sum(1 for k in FEM if k in low)
    masc = sum(1 for k in MASC if k in low)

    longevity = "8-10" if heavy >= 4 else ("6-8" if heavy >= 2 else "4-6")
    sillage = 4 if heavy >= 4 else (3 if heavy >= 2 else 2)
    if fem - masc >= 3:
        gender = ("Women", "Wanita")
    elif masc - fem >= 3:
        gender = ("Men", "Pria")
    else:
        gender = ("Unisex", "Unisex")

    night_keys = ["amber", "tobacco", "leather", "oud", "vanilla", "tonka", "boozy", "cognac", "rum", "suede", "incense"]
    night = sum(1 for k in night_keys if k in low)
    daytime = ("Night", "Malam") if night >= 3 and fresh < 2 else (("Day", "Siang") if fresh >= 3 and night < 2 else ("Day & Night", "Siang & Malam"))

    if fresh >= 3 and heavy < 2:
        seasons = ("Spring & Summer", "Semi & Panas")
    elif heavy >= 3:
        seasons = ("Fall & Winter", "Gugur & Dingin")
    else:
        seasons = ("All Year", "Sepanjang Tahun")

    out = {"longevity_h": longevity, "sillage": sillage, "gender": gender,
           "daytime": daytime, "seasons": seasons}
    out.update(ov or {})
    return out


def sillage_label(v):
    return {1: ("Intimate", "Sangat dekat"), 2: ("Polite · ~1m", "Sopan · ~1m"),
            3: ("Moderate", "Moderat"), 4: ("Strong", "Kuat"),
            5: ("Enormous", "Menyengat")}.get(int(v), ("Moderate", "Moderat"))


def describe_id(name, insp, top, mid, base):
    parts = []
    if insp:
        parts.append(f"{name} adalah interpretasi Tjoomde dari {insp}.")
    else:
        parts.append(f"{name} adalah kreasi orisinal Tjoomde.")
    if top:
        parts.append(f"Dibuka dengan {', '.join(top[:3]).lower()}.")
    if mid:
        parts.append(f"Jantungnya {', '.join(mid[:3]).lower()}.")
    if base:
        parts.append(f"Mengering menjadi {', '.join(base[:4]).lower()} yang tahan lama.")
    return " ".join(parts)


def describe_en(name, insp, top, mid, base):
    parts = []
    if insp:
        parts.append(f"{name} is Tjoomde's take on {insp}.")
    else:
        parts.append(f"{name} is an original Tjoomde creation.")
    if top:
        parts.append(f"It opens with {', '.join(top[:3]).lower()}.")
    if mid:
        parts.append(f"The heart is {', '.join(mid[:3]).lower()}.")
    if base:
        parts.append(f"It dries down to long-lasting {', '.join(base[:4]).lower()}.")
    return " ".join(parts)


PAGE_TPL = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{name} by Tjoomde | tjoomde.my.id</title>
  <meta name="description" content="{name} by Tjoomde — {accord_list}. {pyr_short}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,0,500;9..144,1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23111111'/><text x='50' y='68' font-size='55' text-anchor='middle' fill='white' font-family='serif'>T</text></svg>" />
</head>
<body>
  <div class="announce"><span>TJOOMDE • EDP 50ML</span></div>
  <header class="nav"><div class="wrap nav-inner">
    <a href="../" class="logo">TJOOMDE<span class="dot">.</span></a>
    <nav class="links" id="navLinks">
      <a href="../#collection" data-id="Koleksi" data-en="Collection">Koleksi</a>
      <a href="../#about" data-id="Tentang" data-en="About">Tentang</a>
      <a href="../#contact" data-id="Kontak" data-en="Contact">Kontak</a>
    </nav>
    <div class="nav-cta">
      <div class="lang"><button id="btnID" class="lang-btn active">ID</button><button id="btnEN" class="lang-btn">EN</button></div>
      <button class="burger" id="burger" aria-label="menu">☰</button>
    </div>
  </div></header>

  <main class="wrap vpage">
    <p class="crumb"><a href="../">Home</a> / {name}</p>
    <p class="eyebrow">TJOOMDE • EAU DE PARFUM 50ML</p>
    <h1>{name}</h1>
    {insp_html}

    <p class="sub" data-id="{desc_id}" data-en="{desc_en}">{desc_id}</p>

    <div class="vgrid">
      <section class="vcard">
        <h2 data-id="Main Accords" data-en="Main Accords">Main Accords</h2>
        {accords_html}
        <p class="est" data-id="* Interpretasi accords oleh Tjoomde dari komposisi notes." data-en="* Accord interpretation by Tjoomde from the note composition.">* Interpretasi accords oleh Tjoomde dari komposisi notes.</p>
      </section>
      <section class="vcard">
        <h2 data-id="Performa" data-en="Performance">Performa</h2>
        <div class="perf"><div><strong data-id="Daya tahan" data-en="Longevity">Daya tahan</strong><span>{long_h} jam • EDP</span></div>
        <div class="bar"><i style="width:{long_pct}%"></i></div></div>
        <div class="perf"><div><strong>Sillage</strong><span>{sil_en} / {sil_id}</span></div>
        <div class="dots">{dots}</div></div>
        <p class="est" data-id="* Estimasi Tjoomde dari komposisi notes." data-en="* Tjoomde estimate from the note composition.">* Estimasi Tjoomde dari komposisi notes.</p>
      </section>
    </div>

    <section class="vcard">
      <h2 data-id="Piramida Parfum" data-en="Perfume Pyramid">Piramida Parfum</h2>
      <div class="pyr-stack">
        {tiers_html}
      </div>
    </section>

    <section class="vcard">
      <h2 data-id="Fakta" data-en="Facts">Fakta</h2>
      <div class="facts">
        <div><span data-id="Gender" data-en="Gender">Gender</span><strong>{gender_id} / {gender_en}</strong></div>
        <div><span data-id="Waktu" data-en="Time">Waktu</span><strong>{day_id} / {day_en}</strong></div>
        <div><span data-id="Musim" data-en="Season">Musim</span><strong>{sea_id} / {sea_en}</strong></div>
        <div><span data-id="Konsentrasi" data-en="Strength">Konsentrasi</span><strong>EDP 50ml</strong></div>
      </div>
      {frag_html}
    </section>

    <div class="vorder">
      <button class="btn btn-dark" id="orderBtn"><span data-id="Order {name} via WhatsApp" data-en="Order {name} via WhatsApp">Order {name} via WhatsApp</span> →</button>
      <a class="btn btn-ghost" href="../#collection"><span data-id="← Semua varian" data-en="← All variants">← Semua varian</span></a>
    </div>

    {related_html}
  </main>

  <footer><div class="wrap foot">
    <div class="logo">TJOOMDE<span class="dot">.</span></div>
    <p class="muted">© <span id="year"></span> Tjoomde.</p>
  </div></footer>

  <script src="../assets/notes-db.js"></script>
  <script src="../assets/note-images.js"></script>
  <script>
    const WA = "{wa}", NAME = "{js_name}";
    let lang = localStorage.getItem("tjoomde-lang") || "id";
    function applyLang() {{
      document.documentElement.lang = lang;
      document.querySelectorAll("[data-id]").forEach(el => {{
        el.textContent = lang === "id" ? el.dataset.id : el.dataset.en;
      }});
      document.getElementById("btnID").classList.toggle("active", lang === "id");
      document.getElementById("btnEN").classList.toggle("active", lang === "en");
      localStorage.setItem("tjoomde-lang", lang);
    }}
    document.getElementById("btnID").onclick = () => {{ lang = "id"; applyLang(); }};
    document.getElementById("btnEN").onclick = () => {{ lang = "en"; applyLang(); }};
    document.getElementById("burger").onclick = () => document.getElementById("navLinks").classList.toggle("open");
    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("orderBtn").onclick = () => {{
      const msg = lang === "id"
        ? "Halo Tjoomde! Saya mau order " + NAME + " 50ml EDP. Apakah masih ready?"
        : "Hi Tjoomde! I'd like to order " + NAME + " 50ml EDP. Is it available?";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank");
    }};
    applyLang();
  </script>
</body>
</html>
"""


def slug_of(link):
    m = re.search(r"/([^/]+)/?$", (link or "").strip())
    return m.group(1) if m else None


def main():
    import openpyxl
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Sheet1"]
    rows = list(ws.iter_rows(values_only=True))[1:]
    overrides = json.loads(OVERRIDES.read_text()) if OVERRIDES.exists() else {}

    variants = []
    for r in rows:
        insp, name, frag, top_c, mid_c, base_c, link = r
        if not name:
            continue
        name = str(name).strip()
        slug = slug_of(link)
        if not slug:
            continue
        top, mid, base = split_notes(top_c), split_notes(mid_c), split_notes(base_c)
        notes = top + mid + base
        acc = accords_for([("top", top), ("heart", mid), ("base", base)])
        est = estimate(notes, overrides.get(slug) or overrides.get(name))
        variants.append({
            "name": name, "slug": slug, "inspiration": (insp or "").strip() or None,
            "frag": (frag or "").strip() or None,
            "top": top, "mid": mid, "base": base,
            "accords": acc, "primary": primary_accord(acc), **est,
            "desc_id": overrides.get(slug, {}).get("desc_id") or describe_id(name, (insp or "").strip(), top, mid, base),
            "desc_en": overrides.get(slug, {}).get("desc_en") or describe_en(name, (insp or "").strip(), top, mid, base),
        })

    by_acc = {}
    for v in variants:
        by_acc.setdefault(v["primary"], []).append(v)

    count = 0
    for v in variants:
        rel = [x for x in by_acc[v["primary"]] if x["slug"] != v["slug"]][:3]
        (ROOT / v["slug"]).mkdir(exist_ok=True)
        (ROOT / v["slug"] / "index.html").write_text(render_page(v, rel), encoding="utf-8")
        count += 1

    js = "const VARIANTS = " + json.dumps(
        [{"name": v["name"], "slug": v["slug"], "inspiration": v["inspiration"],
          "top": v["top"][:4], "cat": ("floral" if v["primary"] in ("floral",) else
                                       ("fresh" if v["primary"] in ("citrus", "fresh", "green") else "warm"))}
         for v in variants], ensure_ascii=False) + ";\n"
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "assets" / "variants.js").write_text(js, encoding="utf-8")
    print(f"OK: {count} pages + assets/variants.js")


def chips(notes):
    if not notes:
        return ""
    return "".join(
        f"<div class='note-item'><div class='img-wrap'>"
        f"<img data-note=\"{esc(n)}\" width=\"76\" height=\"76\" loading=\"lazy\" alt=\"{esc(n)}\" /></div>"
        f"<div class='note-name'>{esc(n)}</div></div>"
        for n in notes)


def tier(title, cls, notes):
    if not notes:
        return ""
    return (f"<div class='tier'><div class='tier-head'>"
            f"<span class='tier-pill {cls}'>{title} · {len(notes)}</span></div>"
            f"<div class='notes-grid'>{chips(notes)}</div></div>")


def render_page(v, rel):
    acc_list = ", ".join(a for a, _ in v["accords"]) or "musky"
    pyr = " | ".join((v["top"][:3] + v["mid"][:2] + v["base"][:2])) or ["—"]
    acc_html = "\n".join(
        f"<div class='acc'><span>{esc(a.title())}</span><div class='bar'><i style='width:{p}%'></i></div><b>{p}%</b></div>"
        for a, p in v["accords"]) or "<p>—</p>"
    long_pct = {"4-6": 55, "6-8": 75, "8-10": 95}.get(v["longevity_h"], 75)
    sil_en, sil_id = sillage_label(v["sillage"])
    dots = "".join("<i class='on'></i>" if i < int(v["sillage"]) else "<i></i>" for i in range(5))
    insp_html = (f"<p class='insp' data-id='Terinspirasi dari {esc(v['inspiration'])}' "
                 f"data-en='Inspired by {esc(v['inspiration'])}'>Terinspirasi dari {esc(v['inspiration'])}</p>") if v["inspiration"] else ""
    frag_html = (f"<p class='frag'><a href='{esc(v['frag'])}' target='_blank' rel='noopener'>"
                 f"<span data-id='Referensi notes: Fragrantica' data-en='Note reference: Fragrantica'>Referensi notes: Fragrantica</span> ↗</a></p>") if v["frag"] else ""
    if rel:
        cards = "".join(
            f"<a class='rel-card' href='../{esc(r['slug'])}/'><strong>{esc(r['name'])}</strong>"
            f"<span>{esc(', '.join(r['top'][:2]))}</span></a>" for r in rel)
        rel_html = (f"<section class='vcard'><h2 data-id='Varian se-aroma' data-en='Similar scents'>Varian se-aroma</h2>"
                    f"<div class='rel-grid'>{cards}</div></section>")
    else:
        rel_html = ""
    g_en, g_id = v["gender"]
    d_en, d_id = v["daytime"]
    s_en, s_id = v["seasons"]
    tiers_html = (tier("Top Notes", "tier-top", v["top"]) + tier("Heart Notes", "tier-mid", v["mid"])
                  + tier("Base Notes", "tier-base", v["base"]))
    if not tiers_html:
        tiers_html = ("<p class='muted' data-id='Detail notes menyusul.' "
                      "data-en='Detailed notes coming soon.'>Detail notes menyusul.</p>")
    return PAGE_TPL.format(
        name=esc(v["name"]), js_name=json.dumps(v["name"])[1:-1].replace('"', '\\"'),
        wa=WA_NUMBER, insp_html=insp_html, frag_html=frag_html,
        desc_id=esc(v["desc_id"]).replace('"', "&quot;"), desc_en=esc(v["desc_en"]).replace('"', "&quot;"),
        accord_list=esc(acc_list), pyr_short=esc(", ".join(pyr[:6])),
        accords_html=acc_html, long_h=esc(str(v["longevity_h"])), long_pct=long_pct,
        sil_en=sil_en, sil_id=sil_id, dots=dots,
        tiers_html=tiers_html,
        gender_en=g_en, gender_id=g_id, day_en=d_en, day_id=d_id, sea_en=s_en, sea_id=s_id,
        related_html=rel_html)


if __name__ == "__main__":
    main()
