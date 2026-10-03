// ===== CONFIG: GANTI NOMOR WA DI SINI =====
const WA_NUMBER = "6281384812214"; // WA Tjoomde
const IG_URL = "https://instagram.com/tjoomde";

const PRODUCTS = [
  { id: "blanc", name: "Blanc", cat: "fresh", price: 189000, tag: "Best for Daily", color: "linear-gradient(180deg,#FBFAF7,#D9DED2)",
    id_desc: "White musk + bergamot + neroli. Bersih, segar, aman untuk semua acara.",
    en_desc: "White musk + bergamot + neroli. Clean, fresh, safe for any occasion.",
    id_notes: "Top: bergamot • Heart: neroli • Base: white musk",
    en_notes: "Top: bergamot • Heart: neroli • Base: white musk" },
  { id: "noir", name: "Noir Absolu", cat: "warm", price: 349000, tag: "Best Seller", color: "linear-gradient(180deg,#2E251B,#0E0C09)",
    id_desc: "Oud ringan + amber + vanilla. Mewah tapi tetap sopan dipakai malam.",
    en_desc: "Light oud + amber + vanilla. Luxurious yet polite for evenings.",
    id_notes: "Top: cardamom • Heart: oud • Base: vanilla amber",
    en_notes: "Top: cardamom • Heart: oud • Base: vanilla amber" },
  { id: "dune", name: "Citrus Dune", cat: "fresh", price: 199000, tag: "Fresh", color: "linear-gradient(180deg,#FFF6DE,#D8C99A)",
    id_desc: "Bergamot + vetiver + green tea. Semangat pagi, anti gerah.",
    en_desc: "Bergamot + vetiver + green tea. Morning energy, anti-humid.",
    id_notes: "Top: bergamot • Heart: green tea • Base: vetiver",
    en_notes: "Top: bergamot • Heart: green tea • Base: vetiver" },
  { id: "rose", name: "Rose Sable", cat: "floral", price: 329000, tag: "Elegant", color: "linear-gradient(180deg,#F4DAD3,#BE8F83)",
    id_desc: "Mawar Taif + saffron + sandalwood. Floral dewasa, tidak menor.",
    en_desc: "Taif rose + saffron + sandalwood. Mature floral, never loud.",
    id_notes: "Top: saffron • Heart: Taif rose • Base: sandalwood",
    en_notes: "Top: saffron • Heart: Taif rose • Base: sandalwood" },
  { id: "vetiver", name: "Vetiver Clair", cat: "fresh", price: 219000, tag: "Green", color: "linear-gradient(180deg,#E7EBE0,#9AA78E)",
    id_desc: "Vetiver + cedar + white tea. Wangi rapi seperti habis mandi.",
    en_desc: "Vetiver + cedar + white tea. Crisp, just-showered scent.",
    id_notes: "Top: white tea • Heart: vetiver • Base: cedar",
    en_notes: "Top: white tea • Heart: vetiver • Base: cedar" },
  { id: "ambre", name: "Ambre Nuit", cat: "warm", price: 299000, tag: "Warm", color: "linear-gradient(180deg,#E9C98F,#7A4E2B)",
    id_desc: "Amber + tonka + patchouli. Hangat, cocok untuk dinner & acara.",
    en_desc: "Amber + tonka + patchouli. Warm, perfect for dinner & events.",
    id_notes: "Top: bergamot • Heart: tonka • Base: amber patchouli",
    en_notes: "Top: bergamot • Heart: tonka • Base: amber patchouli" },
];

let lang = localStorage.getItem("tjoomde-lang") || "id";
let filter = "all";

const fmtIDR = (n) => "Rp " + n.toLocaleString("id-ID");

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  PRODUCTS.filter(p => filter === "all" || p.cat === filter).forEach(p => {
    const desc = lang === "id" ? p.id_desc : p.en_desc;
    const notes = lang === "id" ? p.id_notes : p.en_notes;
    const orderLabel = lang === "id" ? "Order" : "Order";
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-visual" style="background:${p.color};color:${p.cat === 'warm' && p.id==='noir' ? '#fff' : '#222'}">${p.name}</div>
      <div class="card-body">
        <h3>Tjoomde ${p.name}</h3>
        <span class="tag">${p.tag} • 50ml</span>
        <p class="notes">${desc}<br/><small>${notes}</small></p>
        <div class="price-row">
          <div class="price">${fmtIDR(p.price)}<br/><small>EDP 50ml</small></div>
          <button class="order" data-p="${p.id}">${orderLabel} →</button>
        </div>
      </div>`;
    grid.appendChild(el);
  });
  grid.querySelectorAll(".order").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = PRODUCTS.find(x => x.id === btn.dataset.p);
      const msg = lang === "id"
        ? `Halo Tjoomde! Saya mau order Tjoomde ${p.name} 50ml (${fmtIDR(p.price)}). Apakah masih ready?`
        : `Hi Tjoomde! I'd like to order Tjoomde ${p.name} 50ml (${fmtIDR(p.price)}). Is it available?`;
      window.open(waLink(msg), "_blank");
    });
  });
}

function applyLang() {
  document.documentElement.lang = lang === "id" ? "id" : "en";
  document.querySelectorAll("[data-id]").forEach(el => {
    el.textContent = lang === "id" ? el.dataset.id : el.dataset.en;
  });
  document.getElementById("btnID").classList.toggle("active", lang === "id");
  document.getElementById("btnEN").classList.toggle("active", lang === "en");
  localStorage.setItem("tjoomde-lang", lang);
  renderProducts();
  document.querySelectorAll(".chip").forEach(c => {
    if (c.dataset.filter === "all") c.textContent = lang === "id" ? "Semua" : "All";
    if (c.dataset.filter === "warm") c.textContent = lang === "id" ? "Warm" : "Warm";
  });
}

document.getElementById("btnID").addEventListener("click", () => { lang = "id"; applyLang(); });
document.getElementById("btnEN").addEventListener("click", () => { lang = "en"; applyLang(); });

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    renderProducts();
  });
});

function generalWA() {
  const msg = lang === "id"
    ? "Halo Tjoomde! Saya bingung pilih aroma. Aktivitas saya: [kantor/outdoor/malam]. Tolong rekomendasikan ya."
    : "Hi Tjoomde! I need scent advice. My routine: [office/outdoor/night]. Please recommend.";
  window.open(waLink(msg), "_blank");
}
document.getElementById("waGeneral").addEventListener("click", generalWA);
document.getElementById("waGeneral2").addEventListener("click", generalWA);

document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  document.getElementById("navLinks").classList.remove("open");
}));

document.getElementById("year").textContent = new Date().getFullYear();
applyLang();
