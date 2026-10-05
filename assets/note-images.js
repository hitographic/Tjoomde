/* Note photo resolver for Tjoomde variant pages.
 * Chain per note: Fragrantica fimgs (via NOTES_DB id) -> Wikipedia thumbnail -> emoji.
 * Images: <img data-note="Bergamot" ...> are resolved on DOMContentLoaded.
 */
(function () {
  var IDX = {};
  Object.keys(NOTES_DB).forEach(function (k) { IDX[k.toLowerCase()] = k; });

  var EMOJI_CAT = { citrus: "🍊", floral: "🌸", fruit: "🍓", sweet: "🍯", herbal: "🌿", aquatic: "🌊", resin: "🌲", musk: "💎", wood: "🪵", spice: "🌶️", earthy: "🍄", general: "🌿" };

  // Manual aliases for notes missing from NOTES_DB -> best Wikipedia title
  var NOTE_ALIAS = {
    "ambrofix": "Ambroxan", "bourbon vanilla": "Vanilla", "madagascar vanilla": "Vanilla",
    "calabrian bergamot": "Bergamot", "cedarwood": "Cedar", "granny smith apple": "Granny Smith",
    "haitian vetiver": "Vetiver", "herbal notes": "Herb", "jasmine sambac": "Jasmine",
    "mandarin": "Mandarin orange", "mimosa absolute": "Mimosa", "tobacco leaf": "Tobacco",
    "tonka": "Tonka bean", "tunisian orange blossom": "Orange blossom",
    "white tea": "White tea", "woodsy notes": "Wood"
  };

  function guessEmoji(name) {
    var n = (name || "").toLowerCase();
    if (/lemon|orange|bergamot|citrus|lime|grapefruit|yuzu|mandarin|tangerine|neroli|petitgrain|clementine|pomelo/.test(n)) return "🍊";
    if (/rose|jasmine|peony|orchid|lily|violet|iris|magnolia|freesia|tuberose|blossom|flower|mimosa|frangipani|ylang|gardenia|muguet|hyacinth|tulip|cyclamen/.test(n)) return "🌸";
    if (/apple|berr|peach|pineapple|mango|cherry|plum|grape|fig|melon|coconut|strawberry|raspberry|pear|apricot|fruit|banana|kiwi|papaya|nectarine|quince|currant/.test(n)) return "🍓";
    if (/vanilla|sugar|caramel|honey|chocolate|candy|marshmallow|tonka|praline|toffee|fudge|syrup/.test(n)) return "🍯";
    if (/tea|mint|basil|rosemary|sage|thyme|herb|mate|verbena|shiso|lemongrass|artemisia/.test(n)) return "🌿";
    if (/marine|aquatic|ocean|sea|ozonic|rain|water|calone|driftwood|salt/.test(n)) return "🌊";
    if (/oud|amber|benzoin|myrrh|incense|labdanum|copal|opoponax|balsam|frankincense/.test(n)) return "🌲";
    if (/musk|ambroxan|ambrette|ambrettolide/.test(n)) return "💎";
    if (/cedar|sandalwood|vetiver|patchouli|\boak\b|pine|cypress|teak|guaiac|birch|ebony|agarwood|akigala/.test(n)) return "🪵";
    if (/pepper|saffron|cinnamon|cardamom|clove|nutmeg|cumin|coriander|ginger|curry|paprika|anise|pink pepper|timur/.test(n)) return "🌶️";
    if (/leather|tobacco|suede|smoke|earth|moss|mushroom|truffle|hay|birch tar/.test(n)) return "🍄";
    return "🌿";
  }

  function emojiFor(name) {
    var key = IDX[(name || "").toLowerCase()];
    if (key && NOTES_DB[key].cat && EMOJI_CAT[NOTES_DB[key].cat]) return EMOJI_CAT[NOTES_DB[key].cat];
    return guessEmoji(name);
  }

  function wikiCandidates(name) {
    var cands = [], key = IDX[(name || "").toLowerCase()];
    var alias = NOTE_ALIAS[(name || "").toLowerCase()];
    if (alias) cands.push(alias);
    if (key && NOTES_DB[key].wiki) cands.push(NOTES_DB[key].wiki);
    if (name) cands.push(name);
    var noAcc = String(name || "").replace(/\s*accord\s*/gi, "").trim();
    if (noAcc && noAcc !== name) cands.push(noAcc);
    var words = noAcc.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      cands.push(words[words.length - 1]);
      cands.push(words[words.length - 1].replace(/s$/, ""));
    }
    if (/peel/i.test(name)) cands.push("Orange (fruit)");
    return cands.filter(Boolean).slice(0, 5);
  }

  var wikiCache = {};
  function wikiThumb(title) {
    if (wikiCache[title] !== undefined) return Promise.resolve(wikiCache[title]);
    return fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var src = (j && (j.thumbnail || {}).source) || (j && (j.originalimage || {}).source) || null;
        wikiCache[title] = src;
        return src;
      })
      .catch(function () { wikiCache[title] = null; return null; });
  }

  function wikiFor(name) {
    var cands = wikiCandidates(name), p = Promise.resolve(null);
    cands.forEach(function (t) {
      p = p.then(function (found) {
        if (found) return found;
        return wikiThumb(t);
      });
    });
    return p;
  }

  function showEmoji(img, name) {
    img.style.display = "none";
    var d = document.createElement("div");
    d.className = "ph";
    d.textContent = emojiFor(name);
    img.parentNode.insertBefore(d, img);
  }

  function resolve(img) {
    var name = img.getAttribute("data-note") || "";
    img.addEventListener("load", function () { img.classList.add("ld"); });
    var key = IDX[name.toLowerCase()];
    var fimgs = key && NOTES_DB[key].id
      ? "https://fimgs.net/mdimg/sastojci/t." + NOTES_DB[key].id + ".jpg"
      : null;
    if (fimgs) {
      img.onerror = function () {
        img.onerror = function () { showEmoji(img, name); };
        wikiFor(name).then(function (src) {
          if (src) { img.src = src; } else { showEmoji(img, name); }
        });
      };
      img.src = fimgs;
    } else {
      wikiFor(name).then(function (src) {
        if (src) {
          img.onerror = function () { showEmoji(img, name); };
          img.src = src;
        } else {
          showEmoji(img, name);
        }
      });
    }
  }

  function init() {
    var imgs = document.querySelectorAll("img[data-note]");
    for (var i = 0; i < imgs.length; i++) resolve(imgs[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
