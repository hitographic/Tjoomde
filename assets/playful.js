/* Playful interactive logic — 9-AM-Dive contoh. Vanilla, no deps. */
(function(){
  const root = document.documentElement;
  const langKey = "tjoomde-lang";
  let lang = localStorage.getItem(langKey) || "id";

  /* ---------- lang ---------- */
  function applyLang(){
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-id]").forEach(el=>{
      const v = lang==="id"? el.dataset.id : el.dataset.en;
      if(v!=null) el.textContent = v;
    });
    const bID=document.getElementById("btnID"), bEN=document.getElementById("btnEN");
    if(bID) bID.classList.toggle("active",lang==="id");
    if(bEN) bEN.classList.toggle("active",lang==="en");
    localStorage.setItem(langKey,lang);
  }
  const bID=document.getElementById("btnID"), bEN=document.getElementById("btnEN");
  if(bID) bID.onclick=()=>{lang="id";applyLang();};
  if(bEN) bEN.onclick=()=>{lang="en";applyLang();};
  const burger=document.getElementById("burger");
  if(burger) burger.onclick=()=>document.getElementById("navLinks").classList.toggle("open");
  const y=document.getElementById("year"); if(y) y.textContent=new Date().getFullYear();

  /* ---------- order ---------- */
  const WA="6281384812214", NAME="9 AM Dive";
  function order(msgExtra){
    const base = lang==="id"
      ? `Halo Tjoomde! Saya mau order ${NAME} 50ml EDP. Apakah masih ready?`
      : `Hi Tjoomde! I'd like to order ${NAME} 50ml EDP. Is it available?`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msgExtra? base+" "+msgExtra : base)}`,"_blank");
  }
  ["orderBtn","orderBtn2"].forEach(id=>{
    const b=document.getElementById(id); if(b) b.onclick=()=>order();
  });

  /* ---------- theme day/night ---------- */
  const savedTheme = localStorage.getItem("tjoomde-theme");
  if(savedTheme) root.setAttribute("data-theme",savedTheme);
  function setTheme(t){ root.setAttribute("data-theme",t); localStorage.setItem("tjoomde-theme",t);
    document.querySelectorAll(".dn-lab").forEach(el=>el.classList.toggle("night",t==="night"));
    const tt=document.getElementById("themeToggle"); if(tt) tt.textContent = t==="night"?"Day":"Night";
  }
  if(!savedTheme) root.setAttribute("data-theme","day");
  setTheme(root.getAttribute("data-theme")||"day");
  const tt=document.getElementById("themeToggle"); if(tt) tt.onclick=()=>setTheme(root.getAttribute("data-theme")==="night"?"day":"night");

  /* time slider -> lab bg */
  const timeRange=document.getElementById("timeRange"), timeOut=document.getElementById("timeOut"), sunmoon=document.getElementById("sunmoon");
  function renderTime(){
    if(!timeRange) return;
    const h=+timeRange.value;
    const isNight = h<6||h>=18;
    if(sunmoon) sunmoon.textContent = h<11?"☀":h<16?"☀":h<18?"○":"●";
    if(timeOut) timeOut.textContent = `${h}:00 — ` + (h>=6&&h<11 ? (lang==="id"?"Pagi hari — citrus dan green paling segar.":"Morning — citrus and green at their freshest.")
      : h>=11&&h<16 ? (lang==="id"?"Siang hari — sillage sopan untuk aktivitas outdoor.":"Midday — polite sillage for outdoor activity.")
      : h>=16&&h<18 ? (lang==="id"?"Sore hari — heart menghangat: apple dan cedar.":"Late afternoon — the heart warms: apple and cedar.")
      : (lang==="id"?"Malam hari — base dominan: sandalwood dan patchouli.":"Evening — base dominant: sandalwood and patchouli."));
    // auto-suggest theme tapi jangan paksa: hanya ubah lab
    document.querySelectorAll(".dn-lab").forEach(el=>el.classList.toggle("night",isNight));
  }
  if(timeRange){ timeRange.addEventListener("input",renderTime); renderTime(); }

  /* ---------- 3D tilt ---------- */
  const tilt=document.getElementById("tilt");
  if(tilt){
    const stage=tilt.closest(".stage3d")||tilt;
    let raf=null;
    function move(e){
      const r=tilt.getBoundingClientRect();
      const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
      const cy=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
      const rx=((cy/r.height)-.5)*-7, ry=((cx/r.width)-.5)*9;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{ tilt.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`; });
    }
    function reset(){ tilt.style.transform="rotateX(0) rotateY(0)"; }
    stage.addEventListener("mousemove",move);
    stage.addEventListener("mouseleave",reset);
    stage.addEventListener("touchmove",move,{passive:true});
    stage.addEventListener("touchend",reset);
  }

  /* ---------- sillage visualizer (pengganti spray preview) ---------- */
  const sCanvas=document.getElementById("sillageCanvas"), sOut=document.getElementById("sillageOut");
  let sprays=3, pulse=0;
  function sillageText(){
    if(lang==="id"){
      if(sprays<=1) return "1× spray — Intimate. Tercium <0,5m. Cocok untuk ruang kecil / sholat.";
      if(sprays<=3) return "3× spray — Personal, ±1m. Rekomendasi kantor / kampus. Sopan, tidak menyengat.";
      return "5× spray — Strong, >2m. Untuk outdoor / malam. Jangan dipakai rapat kecil.";
    }
    if(sprays<=1) return "1× spray — Intimate. Noticed under 0.5m. For small rooms.";
    if(sprays<=3) return "3× sprays — Personal, around 1m. Office / campus safe.";
    return "5× sprays — Strong, over 2m. Outdoor / night only.";
  }
  function drawSillage(){
    if(!sCanvas) return;
    const ctx2=sCanvas.getContext("2d");
    const W=sCanvas.width, H=sCanvas.height, cx=W/2, cy=H/2+14;
    ctx2.clearRect(0,0,W,H);
    const night=root.getAttribute("data-theme")==="night";
    const gold=getComputedStyle(document.documentElement).getPropertyValue("--gold").trim()||"#A9853F";
    // radius by sprays: 1x kecil, 3x sedang, 5x besar
    const R = sprays<=1? 42 : sprays<=3? 72 : 102;
    pulse+=0.03;
    const breathe=1+Math.sin(pulse)*0.03;
    const rings=[
      {r:R*breathe, fill:night?"rgba(200,167,95,.14)":"rgba(169,133,63,.14)", dash:[], label:">2m"},
      {r:R*0.66*breathe, fill:night?"rgba(200,167,95,.18)":"rgba(169,133,63,.20)", dash:[], label:"±1m"},
      {r:R*0.36*breathe, fill:gold, dash:[], label:""}
    ];
    rings.forEach(rg=>{
      ctx2.beginPath(); ctx2.arc(cx,cy,rg.r,0,7);
      if(rg.fill===gold){ ctx2.globalAlpha=.9; ctx2.fillStyle=rg.fill; ctx2.fill(); ctx2.globalAlpha=1; }
      else { ctx2.fillStyle=rg.fill; ctx2.fill(); ctx2.strokeStyle=gold; ctx2.lineWidth=1; ctx2.setLineDash(rg.dash); ctx2.stroke(); ctx2.setLineDash([]); }
    });
    // orang di tengah
    ctx2.fillStyle=night?"#F2EDE3":"#1B1814";
    ctx2.beginPath(); ctx2.arc(cx,cy,9,0,7); ctx2.fill();
    ctx2.font="10px Inter, sans-serif"; ctx2.fillStyle=night?"#A8A094":"#6E6860"; ctx2.textAlign="center";
    ctx2.fillText("<0,5m",cx,cy-R*0.36-6);
    ctx2.fillText("±1m",cx,cy-R*0.66-6);
    ctx2.fillText(">2m",cx,cy-R-6);
    if(sOut) sOut.textContent=sillageText();
  }
  document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".seg button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    sprays=+b.dataset.sprays||3;
    drawSillage();
  });
  if(sCanvas){
    setInterval(drawSillage,50);
    drawSillage();
  }
  // expose untuk refresh bahasa/tema
  window.__sillageRedraw=drawSillage;

  /* ---------- reveal + accords ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:.18});
  document.querySelectorAll(".rv, .acc-anim").forEach(el=>io.observe(el));

  /* ---------- longevity timeline ---------- */
  const tl=document.getElementById("lifeRange"), tlOut=document.getElementById("lifeOut");
  function renderLife(){
    if(!tl) return;
    const h=+tl.value;
    let phase = h<0.5?0 : h<4?1 : 2;
    document.querySelectorAll(".tl-phase div").forEach((d,i)=>d.classList.toggle("active",i===phase));
    const txt = [
      lang==="id"?`0–30 menit: Lemon, Mint, Pink Pepper. Opening citrus-green yang segar.`:`0–30 min: Lemon, Mint, Pink Pepper. A fresh citrus-green opening.`,
      lang==="id"?`${h} jam: Apple, Cedar, Incense. Karakter fruity-woody yang seimbang.`:`${h}h: Apple, Cedar, Incense. A balanced fruity-woody character.`,
      lang==="id"?`${h} jam: Ginger, Sandalwood, Patchouli. Dry-down hangat, tahan di kain 2–3 hari.`:`${h}h: Ginger, Sandalwood, Patchouli. A warm dry-down, lasts 2–3 days on fabric.`
    ][phase];
    if(tlOut) tlOut.textContent=`${txt}`;
  }
  if(tl){ tl.addEventListener("input",renderLife); renderLife(); }

  /* ---------- pyramid tabs ---------- */
  document.querySelectorAll(".ptab").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".ptab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tier-pane").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const pane=document.getElementById("pane-"+b.dataset.tier);
    if(pane) pane.classList.add("active");
  });
  const noteDetail=document.getElementById("noteDetail");
  const NOTE_INFO={
    "Lemon":"Citrus yang tajam — opening segar untuk pagi hari.",
    "Mint":"Hijau yang dingin — kesan bersih 30 menit pertama.",
    "Black Currant":"Fruity yang juicy — manis-asam yang seimbang.",
    "Pink Pepper":"Rempah ringan — aksen segar di atas citrus.",
    "Apple":"Fruity manis — penghubung top ke heart.",
    "Cedar":"Woody kering — struktur unisex yang rapi.",
    "Incense":"Smoky tipis — misterius namun tetap ringan.",
    "Ginger":"Rempah hangat — dry-down yang berenergi.",
    "Sandalwood":"Woody creamy — tahan lama dan sopan.",
    "Patchouli":"Earthy yang dalam — kedalaman untuk malam.",
    "Jasmine":"White floral lembut — menghaluskan base."
  };
  document.querySelectorAll(".note-item").forEach(n=>n.onclick=()=>{
    document.querySelectorAll(".note-item").forEach(x=>x.classList.remove("sel"));
    n.classList.add("sel");
    const name=n.querySelector(".note-name")?.textContent.trim()||"";
    if(noteDetail) noteDetail.textContent=NOTE_INFO[name]||`${name} — bagian dari karakter 9 AM Dive.`;
  });

  /* ---------- mini quiz ---------- */
  const quizData=[
    {q:{id:"Kapan paling sering memakai parfum?",en:"When do you wear perfume most?"},opts:[
      {t:{id:"Pagi / kantor / kampus",en:"Morning / office / campus"},s:30},
      {t:{id:"Sore hari",en:"Afternoon"},s:22},
      {t:{id:"Malam hari",en:"Evening"},s:12}]},
    {q:{id:"Karakter apa yang diinginkan?",en:"What character do you prefer?"},opts:[
      {t:{id:"Segar dan bersih",en:"Fresh and clean"},s:30},
      {t:{id:"Manis fruity",en:"Sweet fruity"},s:25},
      {t:{id:"Woody yang berat",en:"Heavy woody"},s:10}]},
    {q:{id:"Sillage seperti apa?",en:"What sillage?"},opts:[
      {t:{id:"Sopan, sekitar 1 meter",en:"Polite, around 1 meter"},s:25},
      {t:{id:"Moderat",en:"Moderate"},s:20},
      {t:{id:"Kuat",en:"Strong"},s:5}]}
  ];
  let qi=0, score=0;
  const qBox=document.getElementById("quizBox"), qQ=document.getElementById("quizQ"),
        qOpts=document.getElementById("quizOpts"), qBar=document.getElementById("quizBar"),
        qRes=document.getElementById("quizRes"), qNext=document.getElementById("quizRestart");
  function renderQuiz(){
    if(!qBox) return;
    if(qi>=quizData.length){
      const pct=Math.min(98,55+score);
      qQ.style.display="none"; qOpts.style.display="none";
      qBar.style.width="100%";
      qRes.style.display="block";
      qRes.innerHTML=`<span class="quiz-result">${pct}% cocok.</span><br><span style="font-weight:400;font-size:.9rem">${pct>=85?(lang==="id"?"9 AM Dive sesuai untuk kebutuhan harian. Citrus-green-fruity, unggul siang hari.":"9 AM Dive suits daily wear. Citrus-green-fruity, daytime leaning."):lang==="id"?"Cukup cocok. Jika butuh lebih manis atau berat, lihat Kirke atau 9 PM Rebel.":"A partial match. If you need sweeter or heavier, see Kirke or 9 PM Rebel."}</span>`;
      if(qNext) qNext.style.display="inline-block";
      return;
    }
    const step=quizData[qi];
    qQ.textContent=`${qi+1}/3 — ${lang==="id"?step.q.id:step.q.en}`;
    qOpts.innerHTML="";
    step.q && step.opts.forEach(o=>{
      const b=document.createElement("button");
      b.textContent=lang==="id"?o.t.id:o.t.en;
      b.onclick=()=>{ score+=o.s/3; qi++; qBar.style.width=(qi/quizData.length*100)+"%"; renderQuiz(); };
      qOpts.appendChild(b);
    });
  }
  if(qNext) qNext.onclick=()=>{ qi=0; score=0; qQ.style.display="block"; qOpts.style.display="grid"; qRes.style.display="none"; qNext.style.display="none"; qBar.style.width="0%"; renderQuiz(); };
  renderQuiz();
  // re-render dynamic texts on lang change
  const _applyOrig = applyLang;
  applyLang = function(){ _applyOrig(); renderTime(); renderLife(); renderQuizKeep(); if(window.__sillageRedraw) window.__sillageRedraw(); };
  function renderQuizKeep(){
    // keep progress, just re-render current step without resetting score
    if(qi>=quizData.length) return; // result already shown, keep it
    if(!qBox) return;
    const step=quizData[qi];
    if(!step) return;
    qQ.style.display="block"; qOpts.style.display="grid";
    qQ.textContent=`${qi+1}/3 — ${lang==="id"?step.q.id:step.q.en}`;
    const btns=qOpts.querySelectorAll("button");
    btns.forEach((b,i)=>{ if(step.opts[i]) b.textContent=lang==="id"?step.opts[i].t.id:step.opts[i].t.en; });
  }
  window.__tjoomdeApply=applyLang;
  applyLang();
})();
