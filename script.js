// Homepage catalog — data from assets/variants.js (generated from Data/Tjoomde.xlsx)
const WA_NUMBER = "6281384812214"; // WA Tjoomde

let lang = localStorage.getItem("tjoomde-lang") || "id";
let filter = "all";

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  VARIANTS.filter(p => filter === "all" || p.cat === filter).forEach(p => {
    const notes = (p.top || []).slice(0, 3).join(" • ");
    const insp = p.inspiration ? `<p class="insp-small">${p.inspiration}</p>` : "";
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-body">
        <h3>${p.name}</h3>
        ${insp}
        <span class="tag">EDP • 50ml</span>
        <p class="notes">${notes}</p>
        <div class="card-btns">
          <a class="order btn-outline" style="text-decoration:none;padding:9px 16px;font-size:.86rem" href="${p.slug}/">${lang === "id" ? "Detail →" : "Details →"}</a>
          <button class="order" data-p="${p.slug}">Order →</button>
        </div>
      </div>`;
    grid.appendChild(el);
  });
  grid.querySelectorAll(".order[data-p]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = VARIANTS.find(x => x.slug === btn.dataset.p);
      const msg = lang === "id"
        ? `Halo Tjoomde! Saya mau order ${p.name} 50ml EDP. Apakah masih ready?`
        : `Hi Tjoomde! I'd like to order ${p.name} 50ml EDP. Is it available?`;
      window.open(waLink(msg), "_blank");
    });
  });
  const count = document.getElementById("variantCount");
  if (count) count.textContent = VARIANTS.length;
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
