/* FSD Ethiopia prototype — router, views and interactions. Vanilla JS, no build step. */
(function () {
  "use strict";
  const D = window.FSD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TODAY = new Date("2026-10-06T09:00:00+03:00");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const daysLeft = (iso) => Math.ceil((new Date(iso + "T17:00:00+03:00") - TODAY) / 86400000);
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const pillarName = (id) => (D.PILLARS[id] ? D.PILLARS[id].name : "Cross-cutting");

  const ICON = {
    search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m0 0 5-5m-5 5-5-5M4 20h16"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
  };

  const state = {
    research: { q: "", topics: [], years: [], types: [], pillars: [], origin: "all", sort: "newest", filtersOpen: false },
    search: { q: "", scope: "All" },
    apply: { step: 1, data: {}, uploads: {} },
    submit: { step: 1, data: {}, uploads: {} },
    admin: { mode: "recruitment", sel: null, decided: {} },
    contact: { route: "research", sent: false, data: {} },
    news: { tab: "all" },
    data: { topic: "All" },
    impact: { pillar: "all" },
    proc: { tab: "open" }
  };

  /* ---------------- search index ---------------- */
  function buildIndex() {
    const idx = [];
    D.PUBS.forEach((p) => idx.push({ type: "Research", title: p.title, desc: p.summary, href: "#report-" + p.id, meta: `${p.type} · ${p.year}`, text: [p.title, p.summary, p.topics.join(" "), (p.authors || []).join(" "), pillarName(p.pillar)].join(" ") }));
    D.STATS.forEach((s) => idx.push({ type: "Data", title: `${s.value} · ${s.label}`, desc: s.source, href: "#data", meta: s.topic, text: [s.label, s.topic, s.source].join(" ") }));
    Object.values(D.PILLARS).forEach((p) => idx.push({ type: "Programmes", title: p.name, desc: p.lede, href: "#pillar-" + p.id, meta: "Strategic pillar", text: [p.name, p.lede, p.body, p.focus.map((f) => f.join(" ")).join(" ")].join(" ") }));
    D.IMPACT.forEach((i) => idx.push({ type: "Programmes", title: i.intervention.split(",")[0], desc: i.outcome, href: "#impact", meta: "Impact & results", text: [i.intervention, i.outcome, pillarName(i.pillar)].join(" ") }));
    D.NEWS.forEach((n) => idx.push({ type: "News", title: n.title, desc: n.summary, href: "#news", meta: `${n.kind} · ${fmtDate(n.date)}`, text: [n.title, n.summary, n.author, n.topics.join(" ")].join(" ") }));
    D.PEOPLE.forEach((p) => idx.push({ type: "People", title: p.name, desc: p.role, href: "#about", meta: p.topics.join(", "), text: [p.name, p.role, p.topics.join(" ")].join(" ") }));
    D.TENDERS.forEach((t) => idx.push({ type: "Opportunities", title: t.title, desc: `${t.type} · ${t.category} · closes ${fmtDate(t.deadline)}`, href: "#tender-" + t.id, meta: t.status === "open" ? "Open tender" : t.status, text: [t.title, t.summary, t.category, t.ref, pillarName(t.pillar)].join(" ") }));
    D.JOBS.forEach((j) => idx.push({ type: "Opportunities", title: j.title, desc: `${j.kind} · ${j.location} · closes ${fmtDate(j.deadline)}`, href: "#job-" + j.id, meta: j.kind, text: [j.title, j.summary, j.team, j.location].join(" ") }));
    return idx;
  }
  const INDEX = buildIndex();
  const GROUP_ORDER = ["Research", "Data", "Programmes", "News", "People", "Opportunities"];

  function runSearch(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX.map((it) => {
      const t = it.title.toLowerCase(), x = it.text.toLowerCase();
      let score = 0;
      for (const term of terms) { if (t.includes(term)) score += 5; else if (x.includes(term)) score += 1; else return null; }
      if (t.includes(q.toLowerCase())) score += 6;
      return Object.assign({ score }, it);
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }
  const groupResults = (res) => GROUP_ORDER.map((g) => ({ g, items: res.filter((r) => r.type === g) })).filter((x) => x.items.length);
  const hi = (text, q) => { if (!q) return esc(text); const re = new RegExp("(" + q.trim().split(/\s+/).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "ig"); return esc(text).replace(re, "<mark>$1</mark>"); };

  /* ---------------- shared components ---------------- */
  const illus = (txt) => `<span class="chip illustrative" title="Demonstration content. Not an FSD Ethiopia figure.">${esc(txt || "Illustrative")}</span>`;
  const sectionHead = (eyebrow, title, sub, link) => `<div class="section-head"><div>${eyebrow ? `<p class="eyebrow brand">${esc(eyebrow)}</p>` : ""}<h2>${esc(title)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</div>${link ? `<a class="textlink" href="${link[1]}">${esc(link[0])} ${ICON.arrow}</a>` : ""}</div>`;
  const breadcrumb = (items) => `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map((it, i) => i < items.length - 1 ? `<a href="${it[1]}">${esc(it[0])}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(it[0])}</span>`).join("")}</nav>`;
  const pageHead = (crumbs, title, lede, extra) => `<header class="page-head"><div class="container">${breadcrumb(crumbs)}<h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}${extra || ""}</div></header>`;

  function pubRow(p, opts) {
    opts = opts || {};
    return `<article class="pub-row">
      <a class="cover ${p.cover ? "" : "blank"}" href="#report-${p.id}" tabindex="-1" aria-hidden="true">${p.cover ? `<img src="${p.cover}" alt="">` : esc(p.type)}</a>
      <div>
        <div class="meta"><span class="chip type">${esc(p.type)}</span><span class="num">${esc(p.date)}</span><span>${esc((p.authors || []).join(", "))}</span>${p.origin === "partner" ? '<span class="chip outline">Partner document</span>' : ""}</div>
        <h3><a href="#report-${p.id}">${esc(p.title)}</a></h3>
        ${opts.compact ? "" : `<p class="summary">${esc(p.summary)}</p><div class="tags">${p.topics.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}<span class="chip outline">${esc(pillarName(p.pillar))}</span></div>`}
        ${opts.compact ? "" : `<div class="actions"><a class="textlink" href="#report-${p.id}">Read summary ${ICON.arrow}</a><a class="textlink" href="#report-${p.id}">${ICON.down} PDF</a></div>`}
      </div></article>`;
  }

  const deadlineChip = (t) => {
    if (t.status === "closed") return `<span class="status neutral">Closed</span>`;
    if (t.status === "upcoming") return `<span class="status brand">Opens ${fmtDate(t.published)}</span>`;
    const n = daysLeft(t.deadline);
    if (n <= 0) return `<span class="status neutral">Closed</span>`;
    if (n <= 10) return `<span class="status warn">Closing soon · ${n} day${n === 1 ? "" : "s"} left</span>`;
    return `<span class="status good">Open · ${n} days left</span>`;
  };

  function tenderRow(t, actions) {
    return `<article class="opp">
      <div>
        <div class="row" style="gap:8px;margin-bottom:6px"><span class="chip type">${esc(t.type)}</span><span class="tiny muted num">${esc(t.ref)}</span>${t.illustrative ? illus() : ""}</div>
        <h3><a href="#tender-${t.id}">${esc(t.title)}</a></h3>
        <div class="meta"><span>${esc(t.category)}</span><span>${esc(pillarName(t.pillar))}</span><span>Published ${fmtDate(t.published)}</span></div>
      </div>
      <div class="side">${deadlineChip(t)}<div class="deadline muted">Submission deadline<strong class="num" style="color:var(--fg)">${fmtDate(t.deadline)}, ${esc(t.deadlineTime)}</strong></div>${actions ? `<div class="row" style="gap:6px"><a class="btn btn-secondary btn-sm" href="#tender-${t.id}">View tender</a>${t.status === "open" ? `<a class="btn btn-primary btn-sm" href="#submit-${t.id}">Submit</a>` : ""}</div>` : ""}</div>
    </article>`;
  }
  function jobRow(j) {
    const n = daysLeft(j.deadline);
    return `<article class="opp">
      <div>
        <div class="row" style="gap:8px;margin-bottom:6px"><span class="chip type">${esc(j.kind)}</span>${j.illustrative ? illus() : ""}</div>
        <h3><a href="#job-${j.id}">${esc(j.title)}</a></h3>
        <div class="meta"><span>${esc(j.team)}</span><span>${esc(j.location)}</span><span>${esc(j.contract)}</span></div>
      </div>
      <div class="side">${n <= 7 ? `<span class="status warn">Closing soon · ${n} days left</span>` : `<span class="status good">Open · ${n} days left</span>`}<div class="deadline muted">Apply by<strong class="num" style="color:var(--fg)">${fmtDate(j.deadline)}</strong></div></div>
    </article>`;
  }
  const newsItem = (n) => `<a class="news-item" href="#news"><span class="date">${fmtDate(n.date)}</span><div><span class="eyebrow" style="font-size:11px">${esc(n.kind)}${n.author ? " · " + esc(n.author) : ""}</span><h3>${esc(n.title)}</h3><p class="d">${esc(n.summary)}</p></div></a>`;

  /* charts (single hue, drawn to scale) */
  function barChart(rows, opts) {
    opts = opts || {};
    const W = opts.W || 480, H = opts.H || 220, padL = 44, padR = 12, padT = 16, padB = 32;
    const max = opts.max || Math.max(...rows.map((r) => r[1])) * 1.15;
    const iw = W - padL - padR, ih = H - padT - padB;
    const bw = Math.min(64, iw / rows.length * 0.55);
    const ticks = 4;
    let g = "";
    for (let i = 0; i <= ticks; i++) { const v = max / ticks * i, y = padT + ih - (v / max) * ih; g += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end">${Math.round(v)}</text>`; }
    const bars = rows.map((r, i) => {
      const x = padL + iw / rows.length * (i + 0.5) - bw / 2, bh = (r[1] / max) * ih, y = padT + ih - bh;
      const fill = r[2] ? "var(--chart-2)" : "var(--chart-1)";
      return `<rect class="bar" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="${fill}" data-tip="${esc(r[0])}: ${esc(opts.fmt ? opts.fmt(r[1]) : r[1])}${r[3] ? " · " + esc(r[3]) : ""}"/><text class="lbl" x="${x + bw / 2}" y="${y - 6}" text-anchor="middle">${esc(opts.fmt ? opts.fmt(r[1]) : r[1])}</text><text x="${x + bw / 2}" y="${H - 10}" text-anchor="middle">${esc(r[0])}</text>`;
    }).join("");
    return `<figure class="chart" role="img" aria-label="${esc(opts.aria || "Bar chart")}"><svg viewBox="0 0 ${W} ${H}"><g class="grid">${g}</g>${bars}</svg>${opts.caption ? `<figcaption class="chart-cap"><span>${opts.caption}</span>${opts.right ? `<span>${opts.right}</span>` : ""}</figcaption>` : ""}</figure>`;
  }
  function hbarChart(rows, opts) {
    opts = opts || {};
    const W = opts.W || 480, rowH = 34, padL = opts.padL || 150, padR = 56, padT = 6;
    const H = padT + rows.length * rowH + 6;
    const max = opts.max || Math.max(...rows.map((r) => r[1]));
    const iw = W - padL - padR;
    const bars = rows.map((r, i) => {
      const y = padT + i * rowH + 6, w = (r[1] / max) * iw;
      const fill = r[2] ? "var(--chart-2)" : "var(--chart-1)";
      return `<text x="${padL - 10}" y="${y + 15}" text-anchor="end" class="lbl" style="font-weight:500">${esc(r[0])}</text><rect class="bar" x="${padL}" y="${y}" width="${w}" height="20" rx="2" fill="${fill}" data-tip="${esc(r[0])}: ${esc(opts.fmt ? opts.fmt(r[1]) : r[1])}"/><text x="${padL + w + 8}" y="${y + 15}" class="lbl">${esc(opts.fmt ? opts.fmt(r[1]) : r[1])}</text>`;
    }).join("");
    return `<figure class="chart" role="img" aria-label="${esc(opts.aria || "Horizontal bar chart")}"><svg viewBox="0 0 ${W} ${H}"><line class="axis" x1="${padL}" x2="${padL}" y1="${padT}" y2="${H - 6}" stroke="var(--line)"/>${bars}</svg>${opts.caption ? `<figcaption class="chart-cap"><span>${opts.caption}</span>${opts.right ? `<span>${opts.right}</span>` : ""}</figcaption>` : ""}</figure>`;
  }

  /* ---------------- views ---------------- */
  const views = {};

  views.home = () => {
    const openT = D.TENDERS.filter((t) => t.status === "open");
    const featured = byId(D.PUBS, D.REPORT.id);
    const latest = D.PUBS.filter((p) => p.origin === "fsd").slice(0, 3);
    const later = D.PUBS.filter((p) => p.origin === "fsd").slice(3, 7);
    return `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-text">
          <p class="eyebrow" style="color:var(--on-teal-muted)">Financial Sector Deepening Ethiopia · Established 2022</p>
          <h1>Making Ethiopia's financial system work for more people and more businesses.</h1>
          <p class="lede">FSD Ethiopia is an independent development agency. We study how Ethiopia's financial sector works, test solutions with banks, insurers, regulators and the new capital market, and publish what we learn. <strong>Funded by the Bill &amp; Melinda Gates Foundation and UK International Development. Incubated by FSD Africa.</strong></p>
          <div class="cta"><a class="btn btn-inverse" href="#research">Explore research</a><a class="btn btn-outline-inverse" href="#data">See the data</a><a class="btn btn-outline-inverse" href="#workwithus">Open opportunities</a></div>
        </div>
        <div class="photo"><img src="img/hero.jpg" alt="A shopkeeper counts Ethiopian birr notes at the doorway of her shop while a customer waits."><span class="cap">Photo: FSD Ethiopia</span></div>
        <div class="hero-pillars" aria-label="Our three areas of work">
          <p class="eyebrow" style="color:var(--on-teal-muted);grid-column:1/-1">Our work · three areas</p>
          ${Object.values(D.PILLARS).map((p) => `<a href="#pillar-${p.id}"><span class="t">${esc(p.name)}</span><span class="d">${esc(p.brief)}</span><span class="f"><strong>${esc(p.fact.value)}</strong> ${esc(p.fact.label)}</span></a>`).join("")}
        </div>
      </div>
    </section>

    <section class="section tight band">
      <div class="container first-band">
        <div>
          <div class="row between"><p class="eyebrow brand">Research &amp; Insights</p><a class="textlink small" href="#research">All ${D.PUBS.length} publications ${ICON.arrow}</a></div>
          <div class="list-divided">${latest.map((p) => `<a class="mini-pub" href="#report-${p.id}"><span class="t">${esc(p.title)}</span><span class="m"><span class="chip type">${esc(p.type)}</span>${esc(p.date)} · ${esc((p.authors || []).join(", "))}</span></a>`).join("")}</div>
        </div>
        <div>
          <div class="row between"><p class="eyebrow brand">Data &amp; Markets</p><a class="textlink small" href="#data">All indicators ${ICON.arrow}</a></div>
          <div class="list-divided">${D.STATS.slice(0, 3).map((s) => `<div class="mini-stat"><span class="v">${esc(s.value)}</span><span><span class="l">${esc(s.label)}</span><span class="s">${esc(s.source)}</span></span></div>`).join("")}</div>
        </div>
        <div>
          <div class="row between"><p class="eyebrow brand">Impact &amp; current work</p><a class="textlink small" href="#impact">All results ${ICON.arrow}</a></div>
          <div class="list-divided">${[D.IMPACT[2], D.IMPACT[0]].map((i) => `<a class="mini-impact" href="#impact"><span class="status ${i.evidence[0].ok ? "good" : "warn"}">${i.evidence[0].ok ? "Sourced" : "Placeholder"}</span><span class="t">${esc(i.outcome)}</span><span class="s">${esc(i.evidence[0].t)}</span></a>`).join("")}<a class="mini-impact" href="#procurement"><span class="status warn">Closing soon</span><span class="t">${openT.length} open tenders, next deadline ${fmtDate(openT[0].deadline)}</span><span class="s">${esc(openT[0].title)}</span></a></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead("Featured insight", "Where Ethiopia's climate finance comes from, and where it falls short", "The first national mapping of climate finance flows, published with Climate Policy Initiative in April 2026.")}
        <div class="feature">
          <div class="body">
            <p class="eyebrow">Report · April 2026 · FSD Ethiopia and Climate Policy Initiative</p>
            <h2><a href="#report-${featured.id}" style="color:inherit;text-decoration:none">${esc(featured.title)}</a></h2>
            <p>${esc(D.REPORT.execSummary[0])}</p>
            <div class="row" style="gap:8px"><span class="eyebrow" style="font-size:11px">Key findings</span>${illus("Illustrative until approved figures are supplied")}</div>
            <ul class="findings on-dark" style="padding-left:0;gap:8px">${D.REPORT.findings.slice(0, 3).map((f) => `<li style="grid-template-columns:28px minmax(0,1fr);padding-top:8px;border-top-color:rgba(255,255,255,0.15)"><span style="color:#fff">${esc(f.h)}</span></li>`).join("")}</ul>
            <div class="row"><a class="btn btn-inverse" href="#report-${featured.id}">Read the summary</a><a class="btn btn-outline-inverse" href="#report-${featured.id}">${ICON.down} Full report (PDF)</a></div>
          </div>
          <div class="media"><img src="${featured.cover}" alt="Cover of the Landscape of Climate Finance in Ethiopia report"></div>
        </div>
      </div>
    </section>

    <section class="section band">
      <div class="container">
        ${sectionHead("Our work", "Three areas of focus", "Each pillar combines research, market testing with partners and support to policy.", ["About our approach", "#work"])}
        <div class="pillars">${Object.values(D.PILLARS).map((p) => `<a class="pillar" href="#pillar-${p.id}"><div class="img"><img src="${p.img}" alt=""></div><h3>${esc(p.name)}</h3><p>${esc(p.lede)}</p><div class="fact"><strong>${esc(p.fact.value)}</strong>${esc(p.fact.label)}<div class="tiny muted">Source: ${esc(p.fact.source)}</div></div></a>`).join("")}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid-sidebar">
          <div>
            ${sectionHead("Research & Insights", "More recent publications", null, ["All research", "#research"])}
            <div class="list-divided">${later.map((p) => pubRow(p)).join("")}</div>
          </div>
          <aside class="stack">
            <div class="card">
              <p class="eyebrow brand">For journalists</p>
              <p style="margin-top:6px">Sourced statistics, plain-language summaries and the right person to speak to.</p>
              <a class="textlink" href="#media" style="margin-top:10px">Media resources ${ICON.arrow}</a>
            </div>
            <div class="card">
              <p class="eyebrow brand">News &amp; commentary</p>
              <div class="list-divided">${D.NEWS.slice(0, 3).map((n) => `<a href="#news" style="display:block;padding:10px 0;text-decoration:none;color:inherit"><span class="tiny muted">${fmtDate(n.date)} · ${esc(n.kind)}</span><div style="font-weight:600;font-size:var(--fs-15)">${esc(n.title)}</div></a>`).join("")}</div>
              <a class="textlink" href="#news" style="margin-top:8px">All news ${ICON.arrow}</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section band-teal">
      <div class="container">
        ${sectionHead("Impact & results", "What has changed because of this work", "Each result is shown as an outcome, the intervention behind it, the evidence we have, and where to read more.", ["All results", "#impact"])}
        <div class="grid grid-2">${D.IMPACT.slice(0, 2).map((i) => `<article class="stack-sm"><p class="eyebrow" style="color:var(--on-teal-muted)">${esc(pillarName(i.pillar))}</p><h3 class="serif" style="font-size:var(--fs-24);color:#fff">${esc(i.outcome)}</h3><p class="muted">${esc(i.intervention)}</p><ul class="quiet-list" style="margin-top:8px">${i.evidence.map((e) => `<li class="row" style="gap:8px;align-items:flex-start"><span class="status ${e.ok ? "good" : "warn"}" style="flex:none">${e.ok ? "Sourced" : "Placeholder"}</span><span class="small" style="color:#e6edec">${esc(e.t)}</span></li>`).join("")}</ul></article>`).join("")}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid-2" style="align-items:stretch">
          <article class="card flush" style="display:grid;grid-template-rows:200px 1fr"><img src="img/pillar-inclusion.jpg" alt="A woman reading on her phone" style="width:100%;height:100%;object-fit:cover"><div style="padding:var(--s-5)"><p class="eyebrow brand">Programme</p><h3 class="serif" style="font-size:var(--fs-24);margin:6px 0 10px">Board Ready Women</h3><p class="muted">A corporate governance training for women aspiring to board membership, delivered with IFC across three rounds. It pairs leadership skills with environmental, social and governance principles.</p><a class="textlink" href="#impact" style="margin-top:12px">See the results ${ICON.arrow}</a></div></article>
          <div>
            ${sectionHead("Work With Us", "Open opportunities", "Careers, consulting calls and procurement each have their own route.", ["Work With Us", "#workwithus"])}
            <div class="list-divided">${openT.map(tenderRow).join("")}${D.JOBS.slice(0, 1).map(jobRow).join("")}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section tight band">
      <div class="container">
        <div class="grid grid-2" style="gap:var(--s-7)">
          <div><p class="eyebrow brand">Funders and incubator</p><div class="logos" style="margin-top:12px">${D.FUNDERS.map((f) => `<span class="logo-tile">${esc(f)}</span>`).join("")}<span class="logo-tile">FSD Africa <span class="tiny muted" style="font-family:var(--font-body);font-weight:400">· incubator</span></span></div></div>
          <div><p class="eyebrow brand">Part of the FSD Network</p><div class="logos" style="margin-top:12px">${D.NETWORK.map((n) => `<span class="logo-tile">${esc(n)}</span>`).join("")}</div></div>
        </div>
      </div>
    </section>

    <section class="section tight">
      <div class="container">
        <div class="grid grid-2" style="align-items:center">
          <div><h2 style="font-size:var(--fs-24)">Updates from FSD Ethiopia</h2><p class="muted" style="margin-top:6px">New research, data releases and opportunities, about once a month. Recent editions: Vol.1 Edition 3 (Feb/Mar 2024), Edition 2 (Jan 2024), Edition 1 (Oct/Nov 2023).</p></div>
          <form class="row" data-form="newsletter" novalidate><div class="field" style="flex:1;min-width:220px"><label for="nl-email" class="sr-only">Email address</label><input class="input" id="nl-email" type="email" placeholder="Your email address" autocomplete="email"></div><button class="btn btn-primary" type="submit">Subscribe</button></form>
        </div>
      </div>
    </section>`;
  };

  /* --- About / Our work --- */
  views.about = () => `
    ${pageHead([["Home", "#home"], ["About"]], "Who we are", "Established in 2022, FSD Ethiopia is an agency that aims to support the development of accessible, inclusive, and sustainable financial markets for economic growth and human development.")}
    <section class="section"><div class="container grid grid-sidebar">
      <div class="prose">
        <p>We identify where the financial system fails people and businesses, help market actors address those constraints, and work toward a functional and effective financial sector that generates economic gains for a wide cross-section of Ethiopian individuals and businesses.</p>
        <p>Our work is organised around three pillars: <a href="#pillar-inclusion">Financial Inclusion</a>, <a href="#pillar-capital">Access to Capital</a> and <a href="#pillar-climate">Climate Finance</a>. In each we combine research, testing solutions with partners, and support to policy and regulation.</p>
        <h2 style="font-size:var(--fs-24);margin-top:var(--s-6)">Funders and network</h2>
        <p>FSD Ethiopia is funded by the Bill &amp; Melinda Gates Foundation and UK International Development, and was incubated by FSD Africa. We are a member of the FSD Network alongside ${D.NETWORK.slice(1).join(", ")}.</p>
        <h2 style="font-size:var(--fs-24);margin-top:var(--s-6)">Board of directors</h2>
        <div class="list-divided">${D.BOARD.map((b) => `<div style="padding:10px 0"><strong>${esc(b[0])}</strong><div class="small muted">${esc(b[1])}</div></div>`).join("")}</div>
        <h2 style="font-size:var(--fs-24);margin-top:var(--s-6)">Leadership and specialists</h2>
        <div class="list-divided">${D.PEOPLE.map((p) => `<div class="expert"><span class="av" aria-hidden="true">${esc(p.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><div class="n">${esc(p.name)}</div><div class="r">${esc(p.role)}</div><div class="topics">${esc(p.topics.join(" · "))}</div></div></div>`).join("")}</div>
        <p class="small muted" style="margin-top:var(--s-4)">Names and roles as listed on fsdethiopia.org, October 2026. The full team of ${30} staff and seven regional coordinators is listed on the Our Team page.</p>
      </div>
      <aside class="stack"><img src="img/about.jpg" alt="The Addis Ababa skyline" style="border-radius:3px"><div class="card"><p class="eyebrow brand">Office</p><dl class="kv" style="margin-top:8px"><dt>City</dt><dd>${esc(D.OFFICE.city)}</dd><dt>Phone</dt><dd class="num">${esc(D.OFFICE.phone)}</dd><dt>Email</dt><dd>${esc(D.OFFICE.email)}</dd><dt>Hours</dt><dd>${esc(D.OFFICE.hours)}</dd></dl><a class="btn btn-secondary btn-sm" href="#contact" style="margin-top:12px">Contact routing</a></div></aside>
    </div></section>`;

  views.work = () => `
    ${pageHead([["Home", "#home"], ["Our Work"]], "Our work", "Three pillars, one method: understand the constraint, test a solution with market actors, and support the policy that lets it scale.")}
    <section class="section"><div class="container">
      <div class="pillars">${Object.values(D.PILLARS).map((p) => `<a class="pillar" href="#pillar-${p.id}"><div class="img"><img src="${p.img}" alt=""></div><h3>${esc(p.name)}</h3><p>${esc(p.lede)}</p><div class="fact"><strong>${esc(p.fact.value)}</strong>${esc(p.fact.label)}<div class="tiny muted">Source: ${esc(p.fact.source)}</div></div></a>`).join("")}</div>
    </div></section>`;

  views.pillar = (id) => {
    const p = D.PILLARS[id]; if (!p) return views.notfound();
    const pubs = D.PUBS.filter((x) => x.pillar === id), news = D.NEWS.filter((n) => n.pillar === id), imp = D.IMPACT.filter((i) => i.pillar === id);
    return `
    ${pageHead([["Home", "#home"], ["Our Work", "#work"], [p.name]], p.name, p.lede)}
    <section class="section"><div class="container grid grid-sidebar">
      <div class="stack" style="gap:var(--s-6)">
        <img src="${p.img}" alt="" style="aspect-ratio:21/9;object-fit:cover;border-radius:3px">
        <p class="prose" style="font-size:var(--fs-18)">${esc(p.body)}</p>
        <div><h2 style="font-size:var(--fs-24);margin-bottom:var(--s-4)">What we focus on</h2><div class="list-divided">${p.focus.map((f) => `<div style="padding:12px 0"><strong>${esc(f[0])}</strong><p class="muted" style="margin-top:2px">${esc(f[1])}</p></div>`).join("")}</div></div>
        ${imp.length ? `<div><h2 style="font-size:var(--fs-24);margin-bottom:var(--s-4)">Results</h2><div class="list-divided">${imp.map((i) => `<div style="padding:12px 0"><strong>${esc(i.outcome)}</strong><p class="muted small" style="margin-top:2px">${esc(i.intervention)}</p></div>`).join("")}</div><a class="textlink" href="#impact" style="margin-top:8px">How we measure results ${ICON.arrow}</a></div>` : ""}
        <div><h2 style="font-size:var(--fs-24);margin-bottom:var(--s-2)">Research under this pillar</h2><div class="list-divided">${pubs.map((x) => pubRow(x, { compact: true })).join("")}</div></div>
      </div>
      <aside class="stack">
        <div class="panel"><p class="eyebrow brand">Key figure</p><div class="stat" style="border-top:0;padding-top:8px"><span class="value">${esc(p.fact.value)}</span><span class="label">${esc(p.fact.label)}</span><span class="source">Source: ${esc(p.fact.source)}</span></div></div>
        ${news.length ? `<div class="card"><p class="eyebrow brand">Related commentary</p><div class="list-divided">${news.slice(0, 3).map((n) => `<a href="#news" style="display:block;padding:10px 0;text-decoration:none;color:inherit"><span class="tiny muted">${fmtDate(n.date)}</span><div style="font-weight:600">${esc(n.title)}</div></a>`).join("")}</div></div>` : ""}
        <div class="card"><p class="eyebrow brand">Talk to us</p><p class="small" style="margin-top:6px">Partnership and research enquiries about ${esc(p.name)}.</p><a class="btn btn-secondary btn-sm" href="#contact" style="margin-top:10px">Contact</a></div>
      </aside>
    </div></section>`;
  };

  /* --- Research & Insights --- */
  function filterPubs() {
    const s = state.research;
    const q = s.q.trim().toLowerCase();
    let list = D.PUBS.filter((p) =>
      (!s.topics.length || p.topics.some((t) => s.topics.includes(t))) &&
      (!s.years.length || s.years.includes(String(p.year))) &&
      (!s.types.length || s.types.includes(p.type)) &&
      (!s.pillars.length || s.pillars.includes(p.pillar)) &&
      (s.origin === "all" || p.origin === s.origin) &&
      (!q || [p.title, p.summary, p.topics.join(" "), (p.authors || []).join(" ")].join(" ").toLowerCase().includes(q)));
    if (s.sort === "newest") list.sort((a, b) => b.year - a.year || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (s.sort === "oldest") list.sort((a, b) => a.year - b.year);
    if (s.sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }
  const countBy = (fn) => { const m = {}; D.PUBS.forEach((p) => fn(p).forEach((k) => { m[k] = (m[k] || 0) + 1; })); return m; };

  views.research = () => {
    const s = state.research, list = filterPubs();
    const tc = countBy((p) => p.topics), yc = countBy((p) => [String(p.year)]), tyc = countBy((p) => [p.type]), pc = countBy((p) => [p.pillar]);
    const years = Object.keys(yc).sort((a, b) => b - a);
    const anyFilter = s.q || s.topics.length || s.years.length || s.types.length || s.pillars.length || s.origin !== "all";
    const group = (key, title, opts, counts, labelFn) => `<div class="filter-group"><div class="fg-head"><span>${title}</span>${s[key].length ? `<button class="btn btn-ghost btn-sm" data-clear="${key}">Clear</button>` : ""}</div><div class="opts">${opts.map((o) => `<label class="check"><input type="checkbox" data-filter="${key}" value="${esc(o)}" id="f-${key}-${esc(o).replace(/\W+/g, "")}" ${s[key].includes(o) ? "checked" : ""}><span>${esc(labelFn ? labelFn(o) : o)}</span><span class="count">${counts[o] || 0}</span></label>`).join("")}</div></div>`;
    const chips = [].concat(
      s.topics.map((t) => ["topics", t, t]), s.years.map((y) => ["years", y, y]), s.types.map((t) => ["types", t, t]), s.pillars.map((p) => ["pillars", p, pillarName(p)]),
      s.origin !== "all" ? [["origin", s.origin, s.origin === "fsd" ? "FSD Ethiopia publications" : "Partner documents"]] : [], s.q ? [["q", s.q, `“${s.q}”`]] : []);
    return `
    <header class="page-head compact"><div class="container">
      <div class="head-row">
        <div>${breadcrumb([["Home", "#home"], ["Research & Insights"]])}<h1>Research &amp; Insights</h1><p class="lede">${D.PUBS.length} publications, each summarised and citable. Filter by topic, pillar, type and year, or search the full library.</p></div>
        <form class="row head-search" data-form="research-search" role="search"><div class="field" style="flex:1;min-width:0"><label class="sr-only" for="rs-q">Search research</label><input class="input" id="rs-q" type="search" placeholder="Search titles, summaries, authors and topics" value="${esc(s.q)}"></div><button class="btn btn-primary" type="submit">Search</button></form>
      </div>
    </div></header>
    <section class="section tight"><div class="container grid grid-sidebar-left">
      <aside>
        <button class="btn btn-secondary filters-toggle" data-toggle-filters aria-expanded="${s.filtersOpen}">Filters ${anyFilter ? `(${chips.length})` : ""}</button>
        <div class="filters compact ${s.filtersOpen ? "open" : ""}" id="research-filters">
          <div class="row between"><h2 style="font-size:var(--fs-16);font-family:var(--font-body)">Filter publications</h2>${anyFilter ? `<button class="btn btn-ghost btn-sm" data-clear="all">Reset</button>` : ""}</div>
          ${group("topics", "Topic", D.TOPICS.filter((t) => tc[t]), tc)}
          ${group("pillars", "Strategic pillar", Object.keys(D.PILLARS), pc, pillarName)}
          ${group("types", "Publication type", D.TYPES.filter((t) => tyc[t]), tyc)}
          ${group("years", "Year", years, yc)}
          <div class="filter-group"><div class="fg-head"><span>Source</span></div><div class="opts">${[["all", "All documents"], ["fsd", "FSD Ethiopia publications"], ["partner", "Partner and government documents"]].map((o) => `<label class="check"><input type="radio" name="origin" data-origin value="${o[0]}" id="f-origin-${o[0]}" ${s.origin === o[0] ? "checked" : ""}><span>${o[1]}</span></label>`).join("")}</div></div>
        </div>
      </aside>
      <div>
        <div class="results-bar"><span class="count num">${list.length} publication${list.length === 1 ? "" : "s"}${anyFilter ? "" : " · newest first"}</span><div class="row"><label class="small muted" for="rs-sort">Sort</label><select class="select" id="rs-sort" data-sort style="min-height:36px;padding:6px 36px 6px 10px;width:auto"><option value="newest" ${s.sort === "newest" ? "selected" : ""}>Newest first</option><option value="oldest" ${s.sort === "oldest" ? "selected" : ""}>Oldest first</option><option value="title" ${s.sort === "title" ? "selected" : ""}>Title A–Z</option></select></div></div>
        ${chips.length ? `<div class="active-filters">${chips.map((c) => `<button class="pill-filter" aria-pressed="true" data-remove="${c[0]}" data-value="${esc(c[1])}">${esc(c[2])} <span class="x" aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>`).join("")}</div>` : ""}
        <div class="list-divided" aria-live="polite">${list.length ? list.map((p) => pubRow(p)).join("") : `<div class="panel" style="margin-top:16px"><strong>No publications match these filters.</strong><p class="muted small" style="margin-top:4px">Try removing a filter, or search the whole site.</p><button class="btn btn-secondary btn-sm" data-clear="all" style="margin-top:10px">Reset filters</button></div>`}</div>
      </div>
    </div></section>`;
  };

  views.report = (id) => {
    const p = byId(D.PUBS, id); if (!p) return views.notfound();
    const isFlag = id === D.REPORT.id, R = D.REPORT;
    const related = isFlag ? R.related.map((r) => byId(D.PUBS, r)) : D.PUBS.filter((x) => x.id !== id && (x.pillar === p.pillar || x.topics.some((t) => p.topics.includes(t)))).slice(0, 3);
    const citation = `${(p.authors || ["FSD Ethiopia"]).join(" and ")} (${p.year}). ${p.title}. Addis Ababa: FSD Ethiopia.`;
    return `
    <header class="report-head"><div class="container">
      <div class="stack" style="gap:10px">
        ${breadcrumb([["Home", "#home"], ["Research & Insights", "#research"], [p.type]])}
        <div class="row" style="gap:8px"><span class="chip type">${esc(p.type)}</span>${p.topics.map((t) => `<a class="chip" href="#research" data-topic="${esc(t)}" style="text-decoration:none">${esc(t)}</a>`).join("")}<span class="chip outline">${esc(pillarName(p.pillar))}</span>${p.origin === "partner" ? '<span class="chip outline">Partner document</span>' : ""}</div>
        <h1>${esc(p.title)}</h1>
        <div class="meta-row"><span><strong style="color:var(--fg)">Published</strong> ${esc(p.date)}</span><span><strong style="color:var(--fg)">Authors</strong> ${esc((p.authors || []).join(", "))}</span>${p.pages ? `<span><strong style="color:var(--fg)">Length</strong> ${p.pages} pages</span>` : ""}<span><strong style="color:var(--fg)">Format</strong> HTML summary and PDF</span></div>
        ${isFlag ? "" : `<p class="lede">${esc(p.summary)}</p>`}
        <div class="row"><a class="btn btn-primary" href="#download" data-toast="In the live site this downloads the PDF${p.pages ? ` (${p.pages} pages)` : ""}.">${ICON.down} Download full report (PDF)</a><button class="btn btn-secondary" data-copy="${esc(citation)}">Copy citation</button><button class="btn btn-secondary" data-copy="https://fsdethiopia.org/#report-${id}">Copy link</button></div>
      </div>
      ${p.cover ? `<div class="cover"><img src="${p.cover}" alt="Report cover"></div>` : ""}
    </div></header>
    <section class="section tight"><div class="container grid grid-sidebar report-body">
      <div class="stack" style="gap:var(--s-6)">
        <section id="summary" class="prose" style="max-width:none"><p class="eyebrow brand" style="margin-bottom:8px">Executive summary</p>${isFlag ? R.execSummary.map((x) => `<p style="font-size:var(--fs-18)">${esc(x)}</p>`).join("") : `<p style="font-size:var(--fs-18)">${esc(p.summary)}</p><p class="muted">A structured summary, key findings and figures would be entered for each publication through the content management system. The full treatment is shown on the flagship report: <a href="#report-${R.id}">${esc(byId(D.PUBS, R.id).title)}</a>.</p>`}</section>
        ${isFlag ? `<section id="findings"><div class="row between" style="margin-bottom:var(--s-3)"><p class="eyebrow brand">Key findings</p>${illus("Illustrative placeholders for approved findings")}</div><ol class="findings">${R.findings.map((f) => `<li><div><strong>${esc(f.h)}</strong><span class="muted">${esc(f.d)}</span></div></li>`).join("")}</ol></section>` : ""}
        <section id="related"><p class="eyebrow brand" style="margin-bottom:var(--s-2)">Related research</p><div class="list-divided">${related.map((r) => pubRow(r, { compact: true })).join("")}</div></section>
      </div>
      <aside class="stack">
        ${isFlag ? `<div class="card"><p class="eyebrow brand" style="margin-bottom:var(--s-3)">Key figures</p><div class="grid grid-2" style="gap:var(--s-3) var(--s-4)">${R.figures.map((f) => `<div class="stat" style="padding:8px 0"><span class="value" style="font-size:var(--fs-24)">${esc(f.v)}</span><span class="label" style="font-size:var(--fs-13)">${esc(f.l)}</span><span class="source">${f.ok ? "Source: " + esc(f.src) : illus()}</span></div>`).join("")}</div></div>
        <div class="card" id="chart"><p class="eyebrow brand" style="margin-bottom:var(--s-3)">${esc(R.chart.title)}</p>${hbarChart(R.chart.rows, { fmt: (v) => v + "%", max: 60, padL: 140, W: 420, aria: R.chart.title, caption: esc(R.chart.note), right: illus() })}</div>` : ""}
        <div class="card" id="cite"><p class="eyebrow brand" style="margin-bottom:var(--s-2)">How to cite</p><p class="small">${esc(citation)}</p><button class="btn btn-secondary btn-sm" data-copy="${esc(citation)}" style="margin-top:10px">Copy citation</button></div>
      </aside>
    </div></section>`;
  };

  /* --- Data & Markets --- */
  views.data = () => {
    const topics = ["All"].concat(Array.from(new Set(D.STATS.map((s) => s.topic))));
    const t = state.data.topic;
    const stats = D.STATS.filter((s) => t === "All" || s.topic === t);
    return `
    <header class="page-head compact"><div class="container"><div class="head-row"><div>${breadcrumb([["Home", "#home"], ["Data & Markets"]])}<h1>Data &amp; Markets</h1><p class="lede">Headline indicators on Ethiopia's financial sector, each with the publication it comes from. Written to be quoted, not mined.</p></div><div class="row" style="align-self:end"><span class="small muted">Reviewed quarterly by the Development Impact team · last review Oct 2026</span></div></div></div></header>
    <section class="section tight"><div class="container">
      <div class="grid grid-sidebar" style="margin-bottom:var(--s-6)">
        <article>
          <p class="eyebrow brand">Headline indicator · Digital finance</p>
          <h2 style="margin:6px 0 10px;font-size:var(--fs-28)">Mobile money accounts grew more than tenfold in five years</h2>
          <p class="prose" style="max-width:none;color:var(--ink-700)">Ethiopia had 12.2 million mobile money accounts in 2020 and 139.5 million in 2025, as Telebirr, M-Pesa and bank wallets launched and salaries, fuel and utilities moved onto digital rails. Accounts are not the same as active users, and the gender gap in account ownership has not closed at the same pace.</p>
          <div class="card" style="margin-top:var(--s-4)">${barChart([["2020", 12.2, false, "sourced"], ["2025", 139.5, false, "sourced"]], { W: 640, H: 200, fmt: (v) => v + "m", max: 160, aria: "Mobile money accounts in Ethiopia, 2020 and 2025, in millions", caption: "Mobile money accounts, millions. Source: FSD Ethiopia blog (Mar 2026), citing the National Bank of Ethiopia. Only the two published points are shown.", right: '<span class="legend"><span style="--c:var(--chart-1)">Sourced value</span></span>' })}</div>
        </article>
        <aside class="stack">
          <div class="card"><p class="eyebrow brand">Account ownership by gender, 2024</p>${hbarChart([["Women", 42], ["Men", 57]], { fmt: (v) => v + "%", max: 100, padL: 60, W: 320, aria: "Share of women and men with an account in 2024", caption: "Share of adults with an account. Source: FSD Ethiopia blog, Jul 2026." })}</div>
          <div class="card"><p class="eyebrow brand">Methodology and sources</p><p class="small" style="margin-top:6px">Each indicator names the publication it was taken from. Where FSD Ethiopia republishes a regulator's figure, the regulator is named. Request the underlying series through the <a href="#contact">research enquiry route</a>.</p></div>
          <div class="card"><p class="eyebrow brand">Read the analysis</p><div class="list-divided">${["mobile-money-2023", "agent-network-2025"].map((id) => { const p = byId(D.PUBS, id); return `<a href="#report-${p.id}" style="display:block;padding:8px 0;text-decoration:none;color:inherit"><span class="tiny muted">${esc(p.type)} · ${esc(p.date)}</span><div style="font-weight:600;font-size:var(--fs-14)">${esc(p.title)}</div></a>`; }).join("")}</div></div>
        </aside>
      </div>
      <div class="row between" style="margin-bottom:var(--s-4)"><h2 style="font-size:var(--fs-24)">All indicators</h2><div class="row" role="group" aria-label="Filter indicators by topic">${topics.map((x) => `<button class="pill-filter" data-data-topic="${esc(x)}" aria-pressed="${x === t}">${esc(x)}</button>`).join("")}</div></div>
      <div class="grid grid-3" style="gap:var(--s-4) var(--s-6)" aria-live="polite">${stats.map((s) => `<div class="stat"><span class="eyebrow" style="font-size:11px">${esc(s.topic)}</span><span class="value">${esc(s.value)}</span><span class="label">${esc(s.label)}</span>${s.delta ? `<span class="small">${esc(s.delta)}</span>` : ""}<span class="source">Source: ${esc(s.source)}</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:var(--s-5);max-width:80ch">All six indicators are quoted from fsdethiopia.org as of October 2026. The live platform would add time series, regional breakdowns and downloadable tables once a data governance process agrees which series FSD Ethiopia publishes and how often.</p>
    </div></section>`;
  };

  /* --- Impact --- */
  views.impact = () => {
    const f = state.impact.pillar;
    const rows = D.IMPACT.filter((i) => f === "all" || i.pillar === f);
    return `
    <header class="page-head compact"><div class="container"><div class="head-row"><div>${breadcrumb([["Home", "#home"], ["Impact & Results"]])}<h1>Impact &amp; results</h1><p class="lede">What changed, what we did, and the evidence for it. Every result names its source; anything awaiting approved figures is marked as a placeholder.</p></div><div class="row" role="group" aria-label="Filter by pillar" style="align-self:end">${[["all", "All pillars"]].concat(Object.keys(D.PILLARS).map((k) => [k, pillarName(k)])).map((x) => `<button class="pill-filter" data-impact-pillar="${x[0]}" aria-pressed="${x[0] === f}">${esc(x[1])}</button>`).join("")}</div></div></div></header>
    <section class="section tight"><div class="container">
      <div class="impact-summary">
        ${[["Policies and strategies supported", "4", "NAFIR, agent network strategy, green instruments scoping, climate finance landscape", "Source: Resource Center", true], ["Convenings held", "4", "Two Climate Finance Summits, a women's DFS convening and a stakeholder summit", "Source: Our Events", true], ["Capital mobilised", "USD —", "Toward green instruments and MSME lending facilities", "", false], ["Market interventions live", "—", "Pilots with licensed financial institutions", "", false]].map((k) => `<div class="stat" style="padding:10px 0"><span class="value" style="font-size:var(--fs-28)">${esc(k[1])}</span><span class="label" style="font-size:var(--fs-14)">${esc(k[0])}</span><span class="source">${esc(k[2])}</span>${k[4] ? `<span class="tiny muted">${esc(k[3])}</span>` : illus("Placeholder")}</div>`).join("")}
        <div class="how"><p class="eyebrow brand">How to read this page</p><p class="small" style="margin-top:4px">Each result is a chain: <strong>Outcome</strong> in the market → <strong>Intervention</strong> behind it → <strong>Evidence</strong> we can point to → where to <strong>read more</strong>. Activities alone are not counted as results.</p></div>
      </div>
      <div class="stack" style="gap:var(--s-4)" aria-live="polite">${rows.map((i) => `<article class="impact-row">
        <div><span class="eyebrow">Outcome</span><span class="big">${esc(i.outcome)}</span><span class="tiny muted">${esc(pillarName(i.pillar))}</span></div>
        <div><span class="eyebrow">Intervention</span><p class="small">${esc(i.intervention)}</p></div>
        <div><span class="eyebrow">Evidence</span><ul class="quiet-list">${i.evidence.map((e) => `<li><span class="status ${e.ok ? "good" : "warn"}" style="margin-bottom:4px">${e.ok ? "Sourced" : "Placeholder"}</span><div class="small">${esc(e.t)}</div><div class="tiny muted">${esc(e.src)}</div></li>`).join("")}</ul></div>
        <div><span class="eyebrow">Read more</span>${i.related.pub ? `<a class="textlink small" href="#report-${i.related.pub}">${esc(byId(D.PUBS, i.related.pub).title)}</a>` : ""}${i.related.news ? `<a class="textlink small" href="#news">${esc(byId(D.NEWS, i.related.news).title)}</a>` : ""}<a class="textlink small" href="#pillar-${i.pillar}">${esc(pillarName(i.pillar))} pillar</a></div>
      </article>`).join("")}</div>
    </div></section>`;
  };

  /* --- News & Media --- */
  views.news = (tab) => {
    state.news.tab = tab || state.news.tab;
    const t = state.news.tab;
    const list = D.NEWS.filter((n) => t === "all" || (t === "blog" && n.kind === "Blog") || (t === "press" && n.kind === "Press release") || (t === "events" && n.kind === "Event") || (t === "news" && n.kind === "News"));
    const tabs = [["all", "All"], ["blog", "Commentary"], ["news", "News"], ["press", "Press releases"], ["events", "Events"], ["media", "For journalists"]];
    return `
    ${pageHead([["Home", "#home"], ["News"]], "News & commentary", "Analysis from the team, press releases and events. Journalists have their own tab with sourced numbers and contacts.")}
    <section class="section tight"><div class="container">
      <div class="tabs" role="tablist">${tabs.map((x) => `<button role="tab" aria-selected="${x[0] === t}" data-news-tab="${x[0]}">${x[1]}</button>`).join("")}</div>
      ${t === "media" ? views.mediaPanel() : `<div class="grid grid-sidebar"><div class="list-divided">${list.map(newsItem).join("")}</div><aside class="stack"><div class="card"><p class="eyebrow brand">Media enquiries</p><p style="margin-top:6px"><strong>${esc(byId(D.PEOPLE, "samson").name)}</strong><br><span class="small muted">${esc(byId(D.PEOPLE, "samson").role)}</span></p><p class="small num" style="margin-top:8px">${esc(D.OFFICE.email)}<br>${esc(D.OFFICE.phone)}</p><button class="btn btn-secondary btn-sm" data-news-tab="media" style="margin-top:10px">Journalist resources</button></div><div class="card"><p class="eyebrow brand">Newsletter archive</p><div class="list-divided small" style="margin-top:6px">${["FSDE Vol.1 Edition 3 · Feb/Mar 2024", "FSDE Vol.1 Edition 2 · Jan 2024", "FSDE Vol.1 Edition 1 · Oct/Nov 2023"].map((x) => `<a href="#news" style="display:block;padding:8px 0;text-decoration:none;color:inherit">${esc(x)}</a>`).join("")}</div></div></aside></div>`}
    </div></section>`;
  };
  views.media = () => views.news("media");
  views.mediaPanel = () => `
    <div class="grid grid-sidebar">
      <div class="stack" style="gap:var(--s-7)">
        <div><p class="eyebrow brand" style="margin-bottom:var(--s-3)">Numbers you can quote, with sources</p><div class="grid grid-3" style="gap:var(--s-4) var(--s-5)">${D.STATS.map((s) => `<div class="stat"><span class="value" style="font-size:var(--fs-28)">${esc(s.value)}</span><span class="label">${esc(s.label)}</span><span class="source">${esc(s.source)}</span></div>`).join("")}</div><a class="textlink" href="#data" style="margin-top:12px">All indicators and methodology ${ICON.arrow}</a></div>
        <div><p class="eyebrow brand" style="margin-bottom:var(--s-3)">Research in two sentences</p><div class="list-divided">${D.PUBS.filter((p) => p.origin === "fsd").slice(0, 5).map((p) => `<div style="padding:12px 0"><div class="row" style="gap:8px"><span class="chip type">${esc(p.type)}</span><span class="tiny muted">${esc(p.date)}</span></div><a href="#report-${p.id}" style="font-weight:600;color:var(--fg);text-decoration:none;display:block;margin-top:4px">${esc(p.title)}</a><p class="small muted" style="margin-top:2px">${esc(p.summary)}</p></div>`).join("")}</div></div>
        <div><p class="eyebrow brand" style="margin-bottom:var(--s-3)">Boilerplate</p><div class="cite-box"><code>Established in 2022, FSD Ethiopia is an agency that aims to support the development of accessible, inclusive, and sustainable financial markets for economic growth and human development. It is funded by the Bill &amp; Melinda Gates Foundation and UK International Development, incubated by FSD Africa, and is a member of the FSD Network.</code><button class="btn btn-secondary btn-sm" data-copy="Established in 2022, FSD Ethiopia is an agency that aims to support the development of accessible, inclusive, and sustainable financial markets for economic growth and human development. It is funded by the Bill & Melinda Gates Foundation and UK International Development, incubated by FSD Africa, and is a member of the FSD Network.">Copy</button></div></div>
      </div>
      <aside class="stack">
        <div class="card"><p class="eyebrow brand">Media contact</p><p style="margin-top:6px"><strong>${esc(byId(D.PEOPLE, "samson").name)}</strong><br><span class="small muted">${esc(byId(D.PEOPLE, "samson").role)}</span></p><div class="row" style="margin-top:8px;gap:8px"><span class="small num">${esc(D.OFFICE.email)}</span><button class="copybtn" data-copy="${esc(D.OFFICE.email)}">Copy</button></div><p class="small num muted" style="margin-top:4px">${esc(D.OFFICE.phone)} · ${esc(D.OFFICE.hours)}</p><a class="btn btn-primary btn-sm" href="#contact" data-route="media" style="margin-top:12px">Send a media enquiry</a></div>
        <div class="card"><p class="eyebrow brand">Who can speak on what</p><div class="list-divided">${D.PEOPLE.filter((p) => p.media && !p.contact).map((p) => `<div class="expert"><span class="av" aria-hidden="true">${esc(p.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><div class="n">${esc(p.name)}</div><div class="r">${esc(p.role)}</div><div class="topics">${esc(p.topics.join(" · "))}</div></div></div>`).join("")}</div><p class="tiny muted" style="margin-top:8px">Interview requests go through the media contact.</p></div>
      </aside>
    </div>`;

  /* --- Work With Us hub --- */
  views.workwithus = () => {
    const openT = D.TENDERS.filter((t) => t.status === "open").length, vac = D.JOBS.filter((j) => j.kind === "Vacancy").length, cons = D.JOBS.filter((j) => j.kind === "Consulting").length;
    return `
    ${pageHead([["Home", "#home"], ["Work With Us"]], "Work with us", "Three different routes for three different audiences. Pick the one that matches you; each has its own process, documents and contact.")}
    <section class="section"><div class="container">
      <div class="hub">
        <a href="#careers"><p class="eyebrow brand">For individuals</p><h3>Careers</h3><p class="muted">Staff vacancies in Addis Ababa and the regions. Apply online with a CV and cover letter; track your application by reference.</p><span class="n num">${vac} open vacanc${vac === 1 ? "y" : "ies"}</span></a>
        <a href="#careers"><p class="eyebrow brand">For independent experts</p><h3>Consulting opportunities</h3><p class="muted">Short-term calls for applications from individual consultants. Simpler than a tender, with a technical note and daily rate.</p><span class="n num">${cons} open call${cons === 1 ? "" : "s"}</span></a>
        <a href="#procurement"><p class="eyebrow brand">For firms and consortia</p><h3>Procurement &amp; tenders</h3><p class="muted">Requests for proposals and quotations from registered firms. Terms of reference, eligibility, document checklist and sealed submission.</p><span class="n num">${openT} open tender${openT === 1 ? "" : "s"}</span></a>
      </div>
      <div class="grid grid-3" style="margin-top:var(--s-7)">
        <div><h4>How we hire</h4><p class="small muted" style="margin-top:4px">Every application is checked against the published criteria. Shortlisting decisions are made by FSD Ethiopia staff; software helps organise documents and evidence but does not decide.</p></div>
        <div><h4>How we procure</h4><p class="small muted" style="margin-top:4px">Clarification questions and answers are published to all bidders before the deadline. Financial proposals are opened only after technical evaluation.</p></div>
        <div><h4>Questions</h4><p class="small muted" style="margin-top:4px">Use the <a href="#contact">careers or procurement route</a> on the contact page so your question reaches the right team.</p></div>
      </div>
    </div></section>`;
  };

  /* --- Careers --- */
  views.careers = () => `
    ${pageHead([["Home", "#home"], ["Work With Us", "#workwithus"], ["Careers"]], "Careers and consulting", "Join a team of about thirty specialists working with Ethiopia's regulators, banks, insurers and capital market.")}
    <section class="section tight"><div class="container grid grid-sidebar">
      <div>
        <div class="callout warn" style="margin-bottom:var(--s-5)"><strong>Illustrative vacancies.</strong> fsdethiopia.org lists no open positions at the time of this prototype. The roles below are examples that match FSD Ethiopia's real team structure.</div>
        <h2 style="font-size:var(--fs-24);margin-bottom:var(--s-2)">Vacancies</h2>
        <div class="list-divided">${D.JOBS.filter((j) => j.kind === "Vacancy").map(jobRow).join("")}</div>
        <h2 style="font-size:var(--fs-24);margin:var(--s-7) 0 var(--s-2)">Calls for applications (consultants)</h2>
        <div class="list-divided">${D.JOBS.filter((j) => j.kind === "Consulting").map(jobRow).join("")}</div>
      </div>
      <aside class="stack">
        <div class="card"><p class="eyebrow brand">How applying works</p><ol class="small" style="margin-top:8px;display:grid;gap:6px"><li>Read the role and the required documents.</li><li>Complete the online form (about 10 minutes).</li><li>Upload your documents as PDF.</li><li>Receive a reference number and a confirmation email.</li><li>Shortlisted candidates hear from us within three weeks of the deadline.</li></ol></div>
        <div class="card"><p class="eyebrow brand">Questions about a role</p><p class="small" style="margin-top:6px">Use the careers route on the contact page and quote the vacancy title.</p><a class="btn btn-secondary btn-sm" href="#contact" data-route="careers" style="margin-top:10px">Careers enquiry</a></div>
        <div class="card"><p class="eyebrow brand">Looking for tenders?</p><p class="small" style="margin-top:6px">Firms and consortia respond to requests for proposals under <a href="#procurement">Procurement &amp; tenders</a>.</p></div>
      </aside>
    </div></section>`;

  views.job = (id) => {
    const j = byId(D.JOBS, id); if (!j) return views.notfound();
    const n = daysLeft(j.deadline);
    const flow = ["Apply online", "Upload documents", "Confirmation and reference", "Initial screening against criteria", "Human review by the panel", "Outcome to every applicant"];
    return `
    <header class="page-head compact"><div class="container">
      ${breadcrumb([["Work With Us", "#workwithus"], ["Careers", "#careers"], [j.title]])}
      <div class="head-row" style="align-items:flex-start">
        <div><h1>${esc(j.title)}</h1><p class="lede">${esc(j.summary)}</p><div class="row" style="gap:8px;margin-top:10px"><span class="chip type">${esc(j.kind)}</span><span class="chip">${esc(j.team)}</span><span class="chip">${esc(j.location)}</span><span class="chip">${esc(j.contract)}</span><span class="chip">${esc(j.grade)}</span>${j.illustrative ? illus() : ""}</div></div>
        <div class="deadline-box"><span class="eyebrow">Apply by</span><span class="serif num" style="font-size:var(--fs-24);font-weight:600">${fmtDate(j.deadline)}, 17:00 EAT</span>${n <= 7 ? `<span class="status warn">${n} days left</span>` : `<span class="status good">${n} days left</span>`}<a class="btn btn-primary btn-lg" href="#apply-${j.id}">Apply for this role</a></div>
      </div>
    </div></header>
    <section class="section tight"><div class="container grid grid-sidebar">
      <div class="stack" style="gap:var(--s-5)">
        <div class="grid grid-2" style="gap:var(--s-6)">
          <div><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-3)">What you will do</h2><ul class="prose" style="display:grid;gap:8px;font-size:var(--fs-15)">${j.responsibilities.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
          <div><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-3)">What we are looking for</h2><ul class="prose" style="display:grid;gap:8px;font-size:var(--fs-15)">${j.qualifications.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
        </div>
        <div class="card"><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-3)">How applying works</h2><ol class="flow">${flow.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p class="small muted" style="margin-top:var(--s-3)">Every application is checked against the published criteria. Software organises documents and evidence for the panel; shortlisting decisions are made by FSD Ethiopia staff. FSD Ethiopia is an equal opportunity employer; women and candidates from under-represented regions are encouraged to apply.</p></div>
      </div>
      <aside class="stack">
        <div class="card"><p class="eyebrow brand">Documents you will need</p><ul class="checklist" style="margin-top:8px">${j.docs.map((d) => `<li><span class="ic" aria-hidden="true"></span><span>${esc(d)}</span><span class="tiny muted">PDF</span></li>`).join("")}</ul><p class="tiny muted" style="margin-top:8px">Each file under 10 MB. You can replace a document until the deadline by quoting your reference.</p></div>
        <div class="card"><dl class="kv"><dt>Posted</dt><dd>${fmtDate(j.posted)}</dd><dt>Team</dt><dd>${esc(j.team)}</dd><dt>Reports to</dt><dd>${esc(j.team)} lead</dd><dt>Questions</dt><dd><a href="#contact" data-route="careers">Careers enquiry</a></dd></dl></div>
      </aside>
    </div></section>`;
  };

  function stepper(steps, cur) { return `<ol class="stepper" aria-label="Progress">${steps.map((s, i) => `<li class="${i + 1 < cur ? "done" : i + 1 === cur ? "current" : ""}" ${i + 1 === cur ? 'aria-current="step"' : ""}>${esc(s)}</li>`).join("")}</ol>`; }
  function uploadRow(key, label, st, hint) {
    const u = st.uploads[key];
    return `<div class="upload ${u ? "done" : ""}" data-upload-row="${esc(key)}"><div class="meta"><span class="doc-ico" aria-hidden="true">PDF</span><div><div style="font-weight:600">${esc(label)}</div><div class="state ${u ? "ok" : ""}">${u ? `Uploaded · ${esc(u.name)} · ${esc(u.size)}` : esc(hint || "PDF or DOCX, up to 10 MB")}</div></div></div><div class="row"><label class="btn btn-secondary btn-sm" for="up-${esc(key)}">${u ? "Replace" : "Choose file"}<input type="file" id="up-${esc(key)}" data-upload="${esc(key)}" accept=".pdf,.doc,.docx"></label>${u ? `<button class="btn btn-ghost btn-sm" data-upload-remove="${esc(key)}">Remove</button>` : ""}</div></div>`;
  }
  const fieldInput = (id, label, st, opts) => { opts = opts || {}; return `<div class="field ${opts.span ? "span2" : ""}" data-field="${id}"><label for="${id}">${esc(label)}${opts.req === false ? "" : ' <span class="req" aria-hidden="true">*</span>'}</label>${opts.type === "textarea" ? `<textarea class="textarea" id="${id}" name="${id}" ${opts.req === false ? "" : "required"}>${esc(st.data[id] || "")}</textarea>` : opts.type === "select" ? `<select class="select" id="${id}" name="${id}" ${opts.req === false ? "" : "required"}><option value="">Select</option>${opts.options.map((o) => `<option ${st.data[id] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>` : `<input class="input" id="${id}" name="${id}" type="${opts.type || "text"}" value="${esc(st.data[id] || "")}" ${opts.auto ? `autocomplete="${opts.auto}"` : ""} ${opts.req === false ? "" : "required"}>`}${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ""}<span class="err">${esc(opts.err || "This field is required.")}</span></div>`; };

  views.apply = (id) => {
    const j = byId(D.JOBS, id); if (!j) return views.notfound();
    const st = state.apply, step = st.step;
    const steps = ["Your details", "Documents", "Declarations", "Review"];
    const docKeys = j.docs.map((d, i) => ["doc" + i, d]);
    let body = "";
    if (step === 1) body = `<form data-form="apply-1" novalidate class="stack"><div class="form-grid">${fieldInput("firstName", "First name", st, { auto: "given-name" })}${fieldInput("lastName", "Last name", st, { auto: "family-name" })}${fieldInput("email", "Email", st, { type: "email", auto: "email", err: "Enter a valid email address." })}${fieldInput("phone", "Phone", st, { type: "tel", auto: "tel", hint: "Include the country code, for example +251." })}${fieldInput("city", "City of residence", st, { auto: "address-level2" })}${fieldInput("workRight", "Right to work in Ethiopia", st, { type: "select", options: ["Ethiopian national", "Valid work permit", "Will require a work permit"] })}${fieldInput("source", "How did you hear about this role?", st, { type: "select", options: ["FSD Ethiopia website", "LinkedIn", "Referral", "Newsletter", "Other"], req: false })}</div><div class="row end"><button class="btn btn-primary" type="submit">Continue to documents</button></div></form>`;
    if (step === 2) body = `<form data-form="apply-2" novalidate class="stack"><p class="muted">Upload each document as a separate file. Files are scanned and stored encrypted; only the recruitment panel can open them.</p><div class="stack" style="gap:10px">${docKeys.map((d) => uploadRow(d[0], d[1], st)).join("")}</div><div class="field" data-field="uploads"><span class="err">Upload every required document before continuing.</span></div><div class="row between"><button class="btn btn-secondary" type="button" data-step="1">Back</button><button class="btn btn-primary" type="submit">Continue to declarations</button></div></form>`;
    if (step === 3) body = `<form data-form="apply-3" novalidate class="stack"><fieldset class="stack"><legend class="legend">Declarations</legend><div class="field" data-field="d1"><label class="check"><input type="checkbox" id="d1" name="d1" ${st.data.d1 ? "checked" : ""} required><span>I confirm that the information and documents I have provided are accurate and complete. <span class="req" aria-hidden="true">*</span></span></label><span class="err">You must confirm this to continue.</span></div><div class="field" data-field="d2"><label class="check"><input type="checkbox" id="d2" name="d2" ${st.data.d2 ? "checked" : ""} required><span>I have read the data-processing notice. FSD Ethiopia will process my personal data to assess this application, retain it for 12 months after the recruitment closes, and will not share it outside the recruitment panel without my consent. I can ask for my data to be deleted at any time by quoting my application reference. <span class="req" aria-hidden="true">*</span></span></label><span class="err">You must acknowledge the data-processing notice to continue.</span></div><div class="field" data-field="d3"><label class="check"><input type="checkbox" id="d3" name="d3" ${st.data.d3 ? "checked" : ""}><span>I would like to be told about future vacancies that match my profile.</span></label></div></fieldset><div class="row between"><button class="btn btn-secondary" type="button" data-step="2">Back</button><button class="btn btn-primary" type="submit">Review application</button></div></form>`;
    if (step === 4) body = `<form data-form="apply-4" novalidate class="stack" style="gap:var(--s-5)"><div class="card"><div class="row between"><h3>Your details</h3><button class="btn btn-ghost btn-sm" type="button" data-step="1">Edit</button></div><dl class="kv" style="margin-top:12px"><dt>Name</dt><dd>${esc(st.data.firstName)} ${esc(st.data.lastName)}</dd><dt>Email</dt><dd>${esc(st.data.email)}</dd><dt>Phone</dt><dd class="num">${esc(st.data.phone)}</dd><dt>City</dt><dd>${esc(st.data.city)}</dd><dt>Right to work</dt><dd>${esc(st.data.workRight)}</dd></dl></div><div class="card"><div class="row between"><h3>Documents</h3><button class="btn btn-ghost btn-sm" type="button" data-step="2">Edit</button></div><ul class="checklist" style="margin-top:8px">${docKeys.map((d) => `<li class="ok"><span class="ic">${ICON.check}</span><span>${esc(d[1])}<div class="d">${esc(st.uploads[d[0]] ? st.uploads[d[0]].name : "")}</div></span><span class="tiny muted">${esc(st.uploads[d[0]] ? st.uploads[d[0]].size : "")}</span></li>`).join("")}</ul></div><div class="callout">After you submit, you will receive a reference number here and by email. You can withdraw or update your application by quoting it before the deadline.</div><div class="row between"><button class="btn btn-secondary" type="button" data-step="3">Back</button><button class="btn btn-primary btn-lg" type="submit">Submit application</button></div></form>`;
    return `
    ${pageHead([["Careers", "#careers"], [j.title, "#job-" + j.id], ["Apply"]], "Apply: " + j.title, null, `<p class="small muted">Deadline ${fmtDate(j.deadline)}, 17:00 EAT · ${j.illustrative ? "Illustrative vacancy" : ""}</p>`)}
    <section class="section tight"><div class="container" style="max-width:860px">${stepper(steps, step)}<div class="fade-in">${body}</div></div></section>`;
  };

  views.applied = (id) => {
    const j = byId(D.JOBS, id); if (!j) return views.notfound();
    const ref = "FSDE-APP-2026-" + String(1000 + Math.floor(Math.random() * 9000));
    return `<section class="section"><div class="container confirm">
      <div class="ok-ico">${ICON.check}</div>
      <h1>Application received</h1>
      <p class="lede" style="margin-top:8px">Thank you. Your application for <strong>${esc(j.title)}</strong> was submitted on ${fmtDate("2026-10-06")} at 09:14 EAT.</p>
      <div class="card" style="margin-top:var(--s-5)"><p class="eyebrow brand">Your reference</p><p class="ref" style="font-size:var(--fs-28);margin:6px 0">${ref}</p><p class="small muted">A confirmation has been sent to ${esc(state.apply.data.email || "your email")}. Quote this reference in any correspondence.</p></div>
      <h3 style="margin-top:var(--s-6)">What happens next</h3>
      <ol class="prose" style="margin-top:8px;display:grid;gap:6px"><li>Your documents are checked against the published criteria.</li><li>The recruitment panel reviews every eligible application after the deadline on ${fmtDate(j.deadline)}.</li><li>Shortlisted candidates are contacted within three weeks of the deadline. Everyone receives an outcome.</li></ol>
      <div class="row" style="margin-top:var(--s-6)"><a class="btn btn-primary" href="#careers">Back to careers</a><a class="btn btn-secondary" href="#home">Home</a></div>
    </div></section>`;
  };

  /* --- Procurement --- */
  views.procurement = () => {
    const open = D.TENDERS.filter((t) => t.status === "open"), up = D.TENDERS.filter((t) => t.status === "upcoming"), closed = D.TENDERS.filter((t) => t.status === "closed");
    const flow = ["Read the tender and terms of reference", "Check eligibility and required documents", "Ask clarification questions before the Q&A deadline", "Submit online and keep the receipt", "Compliance check of mandatory documents", "Technical evaluation and human review", "Award notice published here"];
    return `
    <header class="page-head compact"><div class="container"><div class="head-row"><div>${breadcrumb([["Home", "#home"], ["Work With Us", "#workwithus"], ["Procurement & Tenders"]])}<h1>Procurement &amp; tenders</h1><p class="lede">Requests for proposals and quotations from FSD Ethiopia, with terms of reference, eligibility, a document checklist and online submission. Separate from <a href="#careers">careers</a>.</p></div><div class="row" style="align-self:end;gap:var(--s-4)"><span class="status good">${open.length} open</span><span class="status brand">${up.length} upcoming</span><span class="status neutral">${closed.length} closed</span></div></div></div></header>
    <section class="section tight"><div class="container grid grid-sidebar">
      <div>
        <h2 style="font-size:var(--fs-20);margin-bottom:4px">Open now</h2>
        <div class="list-divided">${open.map((t) => tenderRow(t, true)).join("")}</div>
        <h2 style="font-size:var(--fs-20);margin:var(--s-6) 0 4px">Upcoming</h2>
        <div class="list-divided">${up.map((t) => tenderRow(t, true)).join("")}</div>
        <h2 style="font-size:var(--fs-20);margin:var(--s-6) 0 4px">Closed and awarded</h2>
        <div class="list-divided">${closed.map((t) => tenderRow(t, true)).join("")}</div>
      </div>
      <aside class="stack">
        <div class="card"><p class="eyebrow brand">How tendering works</p><ol class="flow" style="margin-top:8px">${flow.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p class="tiny muted" style="margin-top:10px">Financial proposals are opened only after technical evaluation.</p></div>
        <div class="card"><p class="eyebrow brand">Tender alerts</p><form class="stack-sm" data-form="alerts" novalidate style="margin-top:8px"><div class="field"><label for="al-email" class="sr-only">Email</label><input class="input" id="al-email" type="email" placeholder="Email address"></div><div class="field"><label for="al-cat" class="sr-only">Category</label><select class="select" id="al-cat"><option>All categories</option><option>Consulting services</option><option>Digital services</option><option>Goods and printing</option></select></div><button class="btn btn-secondary" type="submit">Subscribe to alerts</button></form></div>
        <div class="card"><p class="eyebrow brand">Procurement contact</p><p class="small" style="margin-top:6px">${esc(byId(D.PEOPLE, "rahel").name)}, ${esc(byId(D.PEOPLE, "rahel").role)}</p><p class="small num muted">procurement@fsdethiopia.org ${illus("Illustrative address")}</p><a class="btn btn-secondary btn-sm" href="#contact" data-route="procurement" style="margin-top:10px">Procurement enquiry</a></div>
      </aside>
    </div></section>`;
  };

  views.tender = (id) => {
    const t = byId(D.TENDERS, id); if (!t) return views.notfound();
    const open = t.status === "open" && daysLeft(t.deadline) > 0;
    const timeline = [["Published", t.published, true], ["Q&A deadline", t.qaDeadline, daysLeft(t.qaDeadline) <= 0], ["Submission deadline", t.deadline, daysLeft(t.deadline) <= 0], ["Compliance check and technical evaluation", null, false], ["Award notification", null, false]];
    return `
    <header class="page-head compact"><div class="container">
      ${breadcrumb([["Work With Us", "#workwithus"], ["Procurement & Tenders", "#procurement"], [t.ref]])}
      <div class="head-row" style="align-items:flex-start">
        <div><h1>${esc(t.title)}</h1><p class="lede">${esc(t.summary)}</p><div class="row" style="gap:8px;margin-top:10px"><span class="chip type">${esc(t.type)}</span><span class="chip">${esc(t.category)}</span><span class="chip">${esc(pillarName(t.pillar))}</span>${t.illustrative ? illus() : t.real ? `<span class="chip outline">Live notice on fsdethiopia.org</span>` : ""}</div></div>
        <div class="deadline-box">${deadlineChip(t)}<span class="eyebrow" style="margin-top:4px">Submission deadline</span><span class="serif num" style="font-size:var(--fs-24);font-weight:600">${fmtDate(t.deadline)}, ${esc(t.deadlineTime)}</span>${open ? `<a class="btn btn-primary btn-lg" href="#submit-${t.id}">Submit a proposal</a>` : t.status === "upcoming" ? `<button class="btn btn-secondary btn-lg" data-toast="Alert set for this opportunity (prototype).">Notify me when it opens</button>` : `<span class="muted small">This opportunity is closed.</span>`}</div>
      </div>
    </div></header>
    <section class="section tight"><div class="container grid grid-sidebar">
      <div class="stack" style="gap:var(--s-6)">
        <div class="grid grid-4 meta-grid"><div><span class="eyebrow">Reference</span><div class="ref">${esc(t.ref)}</div>${t.refIllustrative ? `<div class="tiny muted">Proposed reference format</div>` : ""}</div><div><span class="eyebrow">Published</span><div class="num" style="font-weight:600">${fmtDate(t.published)}</div></div><div><span class="eyebrow">Q&amp;A deadline</span><div class="num" style="font-weight:600">${fmtDate(t.qaDeadline)}</div><div class="tiny muted">Answers published to all bidders</div></div><div><span class="eyebrow">Contact</span><div style="font-weight:600;font-size:var(--fs-14)">${esc(t.contact)}</div><div class="tiny muted">Quote the reference</div></div></div>
        ${t.docs.length ? `<div><div class="row between" style="margin-bottom:var(--s-2)"><h2 style="font-size:var(--fs-20)">Required documents</h2><span class="small muted">${t.docs.length} files, uploaded separately</span></div><ul class="checklist">${t.docs.map((d, i) => `<li><span class="ic" aria-hidden="true" style="border-radius:2px;font-size:11px;color:var(--fg-muted)">${i + 1}</span><span>${esc(d)}</span><span class="tiny muted">${/Financial/.test(d) ? "Sealed until technical scoring" : /Technical/.test(d) ? "PDF, max 40 pages" : "PDF"}</span></li>`).join("")}</ul><p class="small muted" style="margin-top:8px">Submissions missing any of these are not evaluated.</p></div>` : ""}
        ${t.eligibility.length ? `<div><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-2)">Eligibility</h2><ul class="checklist">${t.eligibility.map((e) => `<li><span class="ic" aria-hidden="true"></span><span>${esc(e)}</span><span></span></li>`).join("")}</ul></div>` : ""}
        ${t.scope.length ? `<div><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-3)">Scope of work</h2><ul class="prose" style="display:grid;gap:6px;max-width:none">${t.scope.map((s) => `<li>${esc(s)}</li>`).join("")}</ul><p class="small muted" style="margin-top:8px">The full scope, deliverables and timeline are in the terms of reference.</p></div>` : ""}
        ${t.evaluation.length ? `<div><h2 style="font-size:var(--fs-20);margin-bottom:var(--s-3)">Evaluation criteria</h2><div class="table-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Criterion</th><th class="num">Weight</th></tr></thead><tbody>${t.evaluation.map((e) => `<tr><td>${esc(e[0])}</td><td class="num">${e[1]}%</td></tr>`).join("")}<tr><td><strong>Total</strong></td><td class="num"><strong>100%</strong></td></tr></tbody></table></div><p class="small muted" style="margin-top:8px">Technical proposals must score at least 70 of the technical points to have their financial proposal opened.</p></div>` : ""}
        ${t.status === "closed" ? `<div class="panel"><strong>Outcome: ${esc(t.outcome || "Closed")}</strong><p class="small muted" style="margin-top:4px">Award notices are published here within ten working days of contract signature.</p></div>` : ""}
      </div>
      <aside class="stack">
        ${t.downloads.length ? `<div class="card"><p class="eyebrow brand">Tender documents</p><ul class="doc-list" style="margin-top:8px">${t.downloads.map((d) => `<li><span class="doc-ico" aria-hidden="true">${/PDF/.test(d[0]) ? "PDF" : "DOC"}</span><a href="#download" data-toast="In the live site this downloads ${esc(d[0])}." style="font-weight:500">${esc(d[0])}</a><span class="tiny muted" style="margin-left:auto">${esc(d[1])}</span></li>`).join("")}</ul></div>` : ""}
        <div class="card"><p class="eyebrow brand">Timeline</p><ul class="audit" style="margin-top:4px">${timeline.map((x) => `<li><span class="t">${x[1] ? fmtDate(x[1]) : "After deadline"}</span><span class="${x[2] ? "muted" : ""}">${esc(x[0])}${x[2] ? " · passed" : ""}</span></li>`).join("")}</ul></div>
        <div class="card"><p class="eyebrow brand">What happens after you submit</p><ol class="flow" style="margin-top:8px"><li>Receipt with reference and file checksums</li><li>Compliance check of mandatory documents</li><li>Technical evaluation by the panel</li><li>Financial proposal opened if threshold met</li><li>Human review and award decision</li></ol></div>
        <div class="card"><p class="eyebrow brand">Clarifications</p><p class="small" style="margin-top:6px">Questions received before the Q&amp;A deadline are answered in writing and published here for all bidders.</p><a class="btn btn-secondary btn-sm" href="#contact" data-route="procurement" style="margin-top:10px">Ask a question</a></div>
      </aside>
    </div></section>`;
  };

  views.submit = (id) => {
    const t = byId(D.TENDERS, id); if (!t) return views.notfound();
    const st = state.submit, step = st.step;
    const steps = ["Bidder details", "Documents", "Declaration", "Review & submit"];
    const docKeys = t.docs.map((d, i) => ["td" + i, d]);
    let body = "";
    if (step === 1) body = `<form data-form="submit-1" novalidate class="stack"><div class="form-grid">${fieldInput("company", "Legal name of firm or lead consortium member", st, { span: true, auto: "organization" })}${fieldInput("country", "Country of registration", st)}${fieldInput("tin", "Tax identification number (TIN)", st)}${fieldInput("contactName", "Authorised contact person", st, { auto: "name" })}${fieldInput("contactRole", "Role", st)}${fieldInput("email", "Email for all correspondence", st, { type: "email", auto: "email", err: "Enter a valid email address." })}${fieldInput("phone", "Phone", st, { type: "tel", auto: "tel" })}${fieldInput("consortium", "Submitting as a consortium?", st, { type: "select", options: ["No", "Yes, consortium agreement attached"] })}</div><div class="row end"><button class="btn btn-primary" type="submit">Continue to documents</button></div></form>`;
    if (step === 2) body = `<form data-form="submit-2" novalidate class="stack"><div class="callout">Upload each required document separately. The financial proposal is stored sealed and is not visible to evaluators until technical scoring is complete.</div><div class="stack" style="gap:10px">${docKeys.map((d) => uploadRow(d[0], d[1], st, /Financial/.test(d[1]) ? "PDF, sealed until technical evaluation" : /Technical/.test(d[1]) ? "PDF, maximum 40 pages" : "PDF, up to 10 MB")).join("")}</div><div class="field" data-field="uploads"><span class="err">Upload every required document before continuing.</span></div><div class="row between"><button class="btn btn-secondary" type="button" data-step="1">Back</button><button class="btn btn-primary" type="submit">Continue to declaration</button></div></form>`;
    if (step === 3) body = `<form data-form="submit-3" novalidate class="stack"><fieldset class="stack"><legend class="legend">Declaration by the authorised representative</legend><div class="field" data-field="d1"><label class="check"><input type="checkbox" id="d1" ${st.data.d1 ? "checked" : ""} required><span>The firm is not insolvent, under administration or debarred by any government or multilateral institution. <span class="req" aria-hidden="true">*</span></span></label><span class="err">Required.</span></div><div class="field" data-field="d2"><label class="check"><input type="checkbox" id="d2" ${st.data.d2 ? "checked" : ""} required><span>The firm has no conflict of interest with FSD Ethiopia, its board, its funders or the Ethiopian Capital Market Authority in relation to this assignment. <span class="req" aria-hidden="true">*</span></span></label><span class="err">Required.</span></div><div class="field" data-field="d3"><label class="check"><input type="checkbox" id="d3" ${st.data.d3 ? "checked" : ""} required><span>I have read the data-processing notice and understand that submitted documents are retained for seven years in line with FSD Ethiopia's procurement policy. <span class="req" aria-hidden="true">*</span></span></label><span class="err">Required.</span></div></fieldset><div class="row between"><button class="btn btn-secondary" type="button" data-step="2">Back</button><button class="btn btn-primary" type="submit">Review submission</button></div></form>`;
    if (step === 4) body = `<form data-form="submit-4" novalidate class="stack" style="gap:var(--s-5)"><div class="card"><div class="row between"><h3>Bidder</h3><button class="btn btn-ghost btn-sm" type="button" data-step="1">Edit</button></div><dl class="kv" style="margin-top:12px"><dt>Firm</dt><dd>${esc(st.data.company)}</dd><dt>Country</dt><dd>${esc(st.data.country)}</dd><dt>TIN</dt><dd class="num">${esc(st.data.tin)}</dd><dt>Contact</dt><dd>${esc(st.data.contactName)}, ${esc(st.data.contactRole)}</dd><dt>Email</dt><dd>${esc(st.data.email)}</dd><dt>Consortium</dt><dd>${esc(st.data.consortium)}</dd></dl></div><div class="card"><div class="row between"><h3>Documents (${docKeys.length} of ${docKeys.length})</h3><button class="btn btn-ghost btn-sm" type="button" data-step="2">Edit</button></div><ul class="checklist" style="margin-top:8px">${docKeys.map((d) => `<li class="ok"><span class="ic">${ICON.check}</span><span>${esc(d[1])}<div class="d">${esc(st.uploads[d[0]] ? st.uploads[d[0]].name : "")}</div></span><span class="tiny muted">${/Financial/.test(d[1]) ? "Sealed" : esc(st.uploads[d[0]] ? st.uploads[d[0]].size : "")}</span></li>`).join("")}</ul></div><div class="callout">Submitting generates a time-stamped receipt. You may replace documents until the deadline by quoting the receipt reference; the latest version is evaluated.</div><div class="row between"><button class="btn btn-secondary" type="button" data-step="3">Back</button><button class="btn btn-primary btn-lg" type="submit">Submit proposal</button></div></form>`;
    return `
    ${pageHead([["Procurement & Tenders", "#procurement"], [t.ref, "#tender-" + t.id], ["Submit"]], "Submit: " + t.title, null, `<p class="small muted num">${esc(t.ref)} · Deadline ${fmtDate(t.deadline)}, ${esc(t.deadlineTime)}</p>`)}
    <section class="section tight"><div class="container" style="max-width:860px">${stepper(steps, step)}<div class="fade-in">${body}</div></div></section>`;
  };

  views.submitted = (id) => {
    const t = byId(D.TENDERS, id); if (!t) return views.notfound();
    const ref = t.ref.replace(/^FSDE\//, "RCPT/") + "-" + String(10 + Math.floor(Math.random() * 89));
    return `<section class="section"><div class="container confirm">
      <div class="ok-ico">${ICON.check}</div>
      <h1>Proposal received</h1>
      <p class="lede" style="margin-top:8px">Your submission for <strong>${esc(t.title)}</strong> (${esc(t.ref)}) was received on 6 Oct 2026 at 09:21 EAT, before the deadline of ${fmtDate(t.deadline)}, ${esc(t.deadlineTime)}.</p>
      <div class="card" style="margin-top:var(--s-5)"><p class="eyebrow brand">Receipt reference</p><p class="ref" style="font-size:var(--fs-28);margin:6px 0">${esc(ref)}</p><p class="small muted">A receipt listing every file and its checksum has been sent to ${esc(state.submit.data.email || "your email")}.</p></div>
      <div class="card" style="margin-top:var(--s-4)"><p class="eyebrow brand">Submission status</p><ul class="audit" style="margin-top:4px"><li><span class="t">6 Oct 2026 09:21</span><span><span class="who">Received</span> · ${t.docs.length} documents</span></li><li><span class="t">6 Oct 2026 09:21</span><span><span class="who">Mandatory documents</span> · ${t.docs.length} of ${t.docs.length} present</span></li><li><span class="t">After ${fmtDate(t.deadline)}</span><span class="muted">Technical evaluation</span></li><li><span class="t">—</span><span class="muted">Financial proposal opened (if technical threshold met)</span></li><li><span class="t">—</span><span class="muted">Award notification</span></li></ul></div>
      <div class="row" style="margin-top:var(--s-6)"><a class="btn btn-primary" href="#procurement">Back to tenders</a><a class="btn btn-secondary" href="#admin">See how FSD staff review submissions</a></div>
    </div></section>`;
  };

  /* --- Admin: application intelligence --- */
  views.admin = (sel) => {
    const a = state.admin; if (sel) { a.sel = sel; const other = a.mode === "recruitment" ? "procurement" : "recruitment"; if (!byId(D.ADMIN[a.mode].items, sel) && byId(D.ADMIN[other].items, sel)) a.mode = other; }
    const mode = a.mode, set = D.ADMIN[mode];
    if (!a.sel || !byId(set.items, a.sel)) a.sel = set.items[0].id;
    const ctx = mode === "recruitment" ? byId(D.JOBS, set.job) : byId(D.TENDERS, set.tender);
    const item = byId(set.items, a.sel);
    const statusChip = (s) => s === "Shortlisted" ? "good" : s === "Processing" ? "neutral" : s === "Clarification requested" ? "warn" : s === "Not progressed" ? "neutral" : "brand";
    const counts = { total: set.items.length, review: set.items.filter((i) => (a.decided[i.id] || i.status) === "Awaiting review").length, short: set.items.filter((i) => (a.decided[i.id] || i.status) === "Shortlisted").length };
    return `
    <div class="admin-bar"><div class="container"><span class="brandlbl">FSD Ethiopia · Review console</span><span class="muted" style="color:#a6b5b4">Application intelligence</span><span class="demo">Demonstration data. No real applicants or vendors.</span></div></div>
    <section class="section tight admin"><div class="container">
      <div class="row between" style="margin-bottom:var(--s-4);align-items:flex-end">
        <div><p class="eyebrow brand">${mode === "recruitment" ? "Recruitment · " + esc(ctx.kind) : "Procurement · " + esc(ctx.type)}</p><h1 style="font-size:var(--fs-24);margin-top:2px">${esc(ctx.title)}</h1><p class="small muted num" style="margin-top:4px">${mode === "recruitment" ? `Deadline ${fmtDate(ctx.deadline)} · ${counts.total} applications · ${counts.review} awaiting review · ${counts.short} shortlisted` : `${esc(ctx.ref)} · Deadline ${fmtDate(ctx.deadline)} · ${counts.total} submissions · ${counts.review} awaiting review · ${counts.short} shortlisted`}</p></div>
        <div class="row"><div class="pipeline"><span>Submission</span><i>→</i><span>Extraction</span><i>→</i><span>Rules check</span><i>→</i><span class="ai">AI-assisted analysis</span><i>→</i><span class="human">Human review</span><i>→</i><span class="human">Decision</span></div><div class="seg" role="group" aria-label="Review type"><button data-admin-mode="recruitment" aria-pressed="${mode === "recruitment"}">Recruitment</button><button data-admin-mode="procurement" aria-pressed="${mode === "procurement"}">Procurement</button></div></div>
      </div>
      <div class="admin-grid">
        <aside class="queue card flush">
          <div class="qh"><span class="eyebrow">${mode === "recruitment" ? "Applicants" : "Vendors"} (${set.items.length})</span><span class="tiny muted">by AI score</span></div>
          ${set.items.map((it) => `<a class="q-item ${a.sel === it.id ? "sel" : ""}" href="#admin-${esc(it.id)}" aria-current="${a.sel === it.id ? "true" : "false"}">${it.score == null ? '<span class="score sm" style="--p:0" data-v="…" aria-label="Processing"></span>' : `<span class="score sm" style="--p:${it.score}" data-v="${it.score}" aria-label="Score ${it.score} of 100"></span>`}<span class="qb"><span class="n">${esc(it.name)}</span><span class="m">${esc(it.id)} · ${it.mandatory === "—" ? "processing" : esc(it.mandatory) + " mandatory"}</span><span class="status ${statusChip(a.decided[it.id] || it.status)}" style="margin-top:4px">${esc(a.decided[it.id] || it.status)}</span></span></a>`).join("")}
        </aside>
        ${views.adminDetail(item, set, mode)}
      </div>
    </div></section>`;
  };

  views.adminDetail = (item, set, mode) => {
    const a = state.admin;
    const total = set.criteria.reduce((s, c) => s + c.max, 0);
    const decided = a.decided[item.id];
    const mand = set.criteria.map((c, i) => ({ c, s: item.scores[i] || {} })).filter((x) => x.c.mandatory);
    const pref = set.criteria.map((c, i) => ({ c, s: item.scores[i] || {} })).filter((x) => !x.c.mandatory);
    const met = (v) => /Strong|Met/.test(v || "");
    const vClass = (v) => met(v) ? "good" : /Moderate|Opened/.test(v || "") ? "brand" : /Weak/.test(v || "") ? "warn" : "bad";
    const summary = item.score == null ? "" : mode === "recruitment"
      ? `${item.name} meets ${item.mandatory} mandatory criteria with an overall match of ${item.score}%. ${item.scores[0].verdict === "Strong" ? "Relevant experience is the strongest area" : "Relevant experience is " + item.scores[0].verdict.toLowerCase()}, based on the CV and cover letter. ${item.gaps.length ? "The system could not find evidence for " + item.gaps.length + " item" + (item.gaps.length === 1 ? "" : "s") + ", listed below, which the reviewer should confirm before deciding." : "No gaps were flagged."}`
      : `${item.name} submitted ${item.docs.length} documents and meets ${item.mandatory} mandatory document checks. Technical score is ${item.score} of 100 before the financial proposal is opened. ${item.gaps.length ? item.gaps.length + " item" + (item.gaps.length === 1 ? "" : "s") + " need" + (item.gaps.length === 1 ? "s" : "") + " clarification before scoring is final." : "No gaps were flagged."}`;
    const recommendation = item.score == null ? "" : item.gaps.length && /mandatory/i.test(item.gaps.join(" ")) ? "Request clarification" : item.score >= 70 ? (mode === "recruitment" ? "Shortlist for interview" : "Advance to financial opening") : "Hold";
    const evidenceRow = (x, i, showPts) => `<div class="crit"><div><div class="row" style="gap:8px"><span class="tick ${met(x.s.verdict) ? "ok" : x.s.verdict === "No evidence" || x.s.verdict === "Not met" ? "no" : "part"}" aria-hidden="true">${met(x.s.verdict) ? ICON.check : x.s.verdict === "No evidence" || x.s.verdict === "Not met" ? "!" : "–"}</span><strong>${esc(x.c.k)}</strong><span class="status ${vClass(x.s.verdict)}">${esc(x.s.verdict || "—")}</span></div>${x.s.evidence ? `<div class="ev"><span class="muted">Evidence:</span> ${esc(x.s.evidence)}${x.s.quote || x.s.src ? `<details ${i === 0 ? "open" : ""}><summary>Source passage</summary>${x.s.quote ? `<blockquote>“${esc(x.s.quote)}”</blockquote>` : ""}<div class="src">${x.s.src ? `<span>${esc(x.s.src)}</span><a href="#admin-${esc(item.id)}" data-toast="In the live console this opens the document at the highlighted passage.">Open document ${ICON.ext}</a>` : ""}</div></details>` : ""}</div>` : `<div class="ev muted">No evidence identified in the submitted documents.</div>`}</div>${showPts ? `<div class="bar-col"><div class="bar" aria-hidden="true"><i style="width:${x.c.max ? Math.round((x.s.pts / x.c.max) * 100) : 0}%"></i></div></div><div class="pts num">${x.s.pts == null ? "—" : x.s.pts}/${x.c.max}</div>` : `<div></div><div class="pts num">${met(x.s.verdict) ? "Pass" : x.s.verdict === "Opened after technical" ? "—" : "Fail"}</div>`}</div>`;
    return `
      <div class="review stack" style="gap:var(--s-4)">
        <div class="card">
          <div class="row between" style="align-items:flex-start"><div><p class="eyebrow brand">${mode === "recruitment" ? "Candidate match" : "Compliance and technical score"}</p><h2 style="font-size:var(--fs-24)">${esc(item.name)} <span class="muted small num" style="font-family:var(--font-body);font-weight:400">${esc(item.id)}</span></h2><p class="small muted" style="margin-top:2px">${mode === "recruitment" ? "Applied for" : "Submitted for"} <strong style="color:var(--fg)">${esc(mode === "recruitment" ? byId(D.JOBS, set.job).title : byId(D.TENDERS, set.tender).title)}</strong></p></div>${item.score == null ? '<span class="status neutral">Processing</span>' : `<div class="row" style="gap:12px"><span class="score" style="--p:${item.score}" data-v="${item.score}%" aria-label="Score ${item.score} percent"></span><div class="small"><div><strong>${esc(item.mandatory)}</strong> mandatory met</div><div class="muted">${total} weighted points</div></div></div>`}</div>
          ${item.score == null ? `<p class="muted" style="margin-top:12px">Document extraction is still running. Scores and evidence will appear here.</p>` : `<div class="ai-summary"><span class="eyebrow">AI summary · advisory</span><p>${esc(summary)}</p><p class="small"><strong>AI recommendation:</strong> ${esc(recommendation)}. <span class="muted">A named reviewer makes the decision.</span></p></div>`}
        </div>
        ${item.score == null ? "" : `
        <div class="card"><p class="eyebrow brand" style="margin-bottom:4px">Mandatory requirements</p>${mand.map((x, i) => evidenceRow(x, i, false)).join("")}</div>
        <div class="card"><div class="row between" style="margin-bottom:4px"><p class="eyebrow brand">Preferred criteria · weighted</p><span class="tiny muted">Criteria version ${mode === "recruitment" ? "CFS-2026-v2" : "RFP-014-v1"}</span></div>${pref.map((x, i) => evidenceRow(x, i + 1, true)).join("")}</div>
        ${item.gaps.length ? `<div class="card" style="border-color:var(--status-warn)"><p class="eyebrow" style="color:var(--status-warn)">Missing or unclear information</p><ul class="prose" style="margin-top:8px;display:grid;gap:8px;max-width:none">${item.gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul><p class="tiny muted" style="margin-top:10px">A gap means the system found no evidence. It does not mean the requirement is unmet. Check the documents before deciding.</p></div>` : ""}`}
        <div class="card"><p class="eyebrow brand">Audit history</p><ul class="audit" style="margin-top:4px">${item.audit.concat(decided ? [["2026-10-08 09:30", "You", `Decision recorded: ${decided}. Rationale: ${a.rationale || ""}`]] : []).map((x) => `<li><span class="t">${esc(x[0])}</span><span><span class="who">${esc(x[1])}</span> · ${esc(x[2])}</span></li>`).join("")}</ul></div>
      </div>
      <aside class="side stack" style="gap:var(--s-4)">
        <div class="decision"><p class="eyebrow brand">Human review</p>${decided ? `<p style="margin-top:8px"><span class="status ${statusChipFor(decided)}">${esc(decided)}</span></p><p class="small muted" style="margin-top:8px">Recorded by you with rationale. The ${mode === "recruitment" ? "applicant" : "vendor"} will be notified according to the published process.</p><button class="btn btn-secondary btn-sm" data-admin-undo="${esc(item.id)}" style="margin-top:10px">Reopen</button>` : item.score == null ? `<p class="small muted" style="margin-top:8px">Available once processing completes.</p>` : `<form data-form="decision" data-id="${esc(item.id)}" novalidate><p class="small muted" style="margin-top:6px">AI recommendation: <strong style="color:var(--fg)">${esc(recommendation)}</strong>. Your decision:</p><div class="opts" role="radiogroup" aria-label="Decision"><label><input type="radio" name="dec" value="Shortlisted"> Advance ${mode === "recruitment" ? "to interview" : "to financial opening"}</label><label><input type="radio" name="dec" value="On hold"> Hold</label><label><input type="radio" name="dec" value="Clarification requested"> Request clarification</label><label><input type="radio" name="dec" value="Not progressed"> Do not progress</label></div><div class="field" data-field="rationale"><label for="rationale">Rationale <span class="req" aria-hidden="true">*</span></label><textarea class="textarea" id="rationale" style="min-height:72px" placeholder="Required. Written to the audit log and used in feedback."></textarea><span class="err">Choose an outcome and write a rationale.</span></div><button class="btn btn-primary" type="submit" style="width:100%;margin-top:10px">Record decision</button></form>`}</div>
        <div class="card"><p class="eyebrow brand">Traceability</p><dl class="kv small" style="margin-top:8px"><dt>Submitted</dt><dd class="num">${esc(item.submitted)}</dd><dt>Screened</dt><dd class="num">${esc((item.audit.find((x) => /analysis complete/i.test(x[2])) || item.audit[item.audit.length - 1])[0])}</dd><dt>Criteria</dt><dd>${mode === "recruitment" ? "CFS-2026-v2" : "RFP-014-v1"}</dd><dt>Model</dt><dd>screening-2026.09, logged</dd><dt>Reviewer</dt><dd>${esc(decided ? "You" : item.reviewer)}</dd><dt>Status</dt><dd><span class="status ${statusChipFor(decided || item.status)}">${esc(decided || item.status)}</span></dd></dl></div>
        <div class="card"><p class="eyebrow brand">Documents (${item.docs.length})</p><ul class="doc-list" style="margin-top:8px">${item.docs.map((d) => `<li><span class="doc-ico" aria-hidden="true">${esc(d[1])}</span><a href="#admin-${esc(item.id)}" data-toast="In the live console this opens the document viewer." style="font-weight:500">${esc(d[0])}</a><span class="tiny muted" style="margin-left:auto">${esc(d[2])}</span></li>`).join("")}</ul></div>
      </aside>`;
  };
  function statusChipFor(s) { return s === "Shortlisted" ? "good" : s === "Processing" || s === "Not progressed" ? "neutral" : s === "Clarification requested" || s === "On hold" ? "warn" : "brand"; }

  /* --- Contact --- */
  views.contact = (route) => {
    const c = state.contact; if (route && D.CONTACT_ROUTES[route]) c.route = route;
    const r = D.CONTACT_ROUTES[c.route];
    const extra = { publication: ["publication", "Publication or indicator", "text"], outlet: ["outlet", "Outlet", "text"], deadline: ["deadline", "Your deadline", "text"], organisation: ["organisation", "Organisation", "text"], tender: ["tender", "Tender reference", "text"], appref: ["appref", "Application reference", "text"] };
    return `
    ${pageHead([["Home", "#home"], ["Contact"]], "Contact", "Tell us what your enquiry is about and it goes straight to the right team, with the information they need to answer.")}
    <section class="section"><div class="container grid grid-sidebar-left">
      <div><p class="legend" style="margin-bottom:8px">What is your enquiry about?</p><div class="stack-sm" role="radiogroup" aria-label="Enquiry type">${Object.entries(D.CONTACT_ROUTES).map(([k, v]) => `<label class="route-card" style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;${k === c.route ? "border-color:var(--brand);background:var(--brand-soft)" : ""}"><input type="radio" name="route" value="${k}" ${k === c.route ? "checked" : ""} data-route-pick style="margin-top:4px;accent-color:var(--brand)"><div><div class="who">${esc(v.label)}</div><div class="tiny muted">${esc(v.who)}</div></div></label>`).join("")}</div></div>
      <div>${c.sent ? `<div class="confirm" style="margin:0"><div class="ok-ico">${ICON.check}</div><h2>Sent to the ${esc(r.who)}</h2><p class="lede" style="margin-top:8px">${esc(r.sla || "We will reply as soon as we can.")} Your reference is <span class="ref">FSDE-ENQ-2026-${String(100 + Math.floor(Math.random() * 899))}</span>.</p><button class="btn btn-secondary" data-contact-reset style="margin-top:var(--s-5)">Send another enquiry</button></div>` : `
        <div class="route-card fade-in" style="margin-bottom:var(--s-5)"><div class="row between"><div><p class="eyebrow brand">${esc(r.label)}</p><p class="who" style="margin-top:4px">Handled by the ${esc(r.who)}</p></div><div class="row" style="gap:8px"><span class="small num">${esc(r.email)}</span><button class="copybtn" data-copy="${esc(r.email)}">Copy</button>${r.illustrativeEmail ? illus("Illustrative address") : ""}</div></div><p class="small muted" style="margin-top:8px">${esc(r.hint)}${r.sla ? " " + esc(r.sla) : ""}</p></div>
        <form data-form="contact" novalidate class="stack fade-in"><div class="form-grid">${fieldInput("name", "Your name", c, { auto: "name" })}${fieldInput("cemail", "Email", c, { type: "email", auto: "email", err: "Enter a valid email address." })}${r.fields.map((f) => fieldInput(extra[f][0], extra[f][1], c, { type: extra[f][2], req: false })).join("")}${fieldInput("message", "Message", c, { type: "textarea", span: true })}</div><div class="field"><label class="check"><input type="checkbox" id="cprivacy" required><span>I agree that FSD Ethiopia may process these details to answer my enquiry. <span class="req" aria-hidden="true">*</span></span></label><span class="err">Please agree before sending.</span></div><div class="row between"><p class="tiny muted num">Or call ${esc(D.OFFICE.phone)}, ${esc(D.OFFICE.hours)}</p><button class="btn btn-primary" type="submit">Send to ${esc(r.who)}</button></div></form>`}</div>
    </div></section>`;
  };

  /* --- Search results page --- */
  views.search = () => {
    const q = state.search.q, res = runSearch(q), groups = groupResults(res);
    const scope = state.search.scope;
    const shown = scope === "All" ? groups : groups.filter((g) => g.g === scope);
    return `
    <header class="page-head compact"><div class="container"><div class="head-row"><div>${breadcrumb([["Home", "#home"], ["Search"]])}<h1>${q ? `Results for “${esc(q)}”` : "Search"}</h1><p class="lede">${q ? `${res.length} results across research, data, programmes, news, people and opportunities.` : "Search research, data, programmes, news, people and opportunities in one place."}</p></div><form data-form="search-page" role="search" class="row head-search"><div class="field" style="flex:1;min-width:0"><label class="sr-only" for="sp-q">Search</label><input class="input" id="sp-q" type="search" value="${esc(q)}" placeholder="Search the site"></div><button class="btn btn-primary" type="submit">Search</button></form></div></div></header>
    <section class="section tight"><div class="container">
      <div class="row" style="margin-bottom:var(--s-4)">${["All"].concat(GROUP_ORDER).map((g) => { const n = g === "All" ? res.length : res.filter((r) => r.type === g).length; return `<button class="pill-filter" data-search-scope="${g}" aria-pressed="${scope === g}" ${n ? "" : "disabled"}>${g} <span class="num">${n}</span></button>`; }).join("")}</div>
      ${q && !res.length ? `<div class="panel"><strong>No results for “${esc(q)}”.</strong><p class="small muted" style="margin-top:4px">Try a broader term such as “inclusion”, “climate” or “tender”.</p></div>` : ""}
      ${!q ? `<div class="panel"><p class="eyebrow brand">Try</p><div class="suggest" style="margin-top:8px">${["financial inclusion", "climate finance", "tender", "mobile money", "gender", "capital markets"].map((s) => `<button type="button" data-search-try="${s}">${s}</button>`).join("")}</div></div>` : ""}
      <div class="sr-grid">${shown.map((g) => `<section class="sr-group card" style="padding:var(--s-4)"><div class="gh"><h2 style="font-size:var(--fs-16);font-family:var(--font-body)">${g.g} <span class="muted num small">(${g.items.length})</span></h2>${g.g === "Research" ? `<a class="tiny" href="#research">Open the library</a>` : g.g === "Opportunities" ? `<a class="tiny" href="#workwithus">Work With Us</a>` : ""}</div>${g.items.slice(0, scope === "All" ? 4 : 50).map((it) => `<a class="sr-item" href="${it.href}"><div><div class="t">${hi(it.title, q)}</div><div class="d">${hi(it.desc, q)}</div></div><span class="k">${esc(it.meta)}</span></a>`).join("")}${scope === "All" && g.items.length > 4 ? `<button class="btn btn-ghost btn-sm" data-search-scope="${g.g}" style="margin-top:6px">All ${g.items.length} in ${g.g}</button>` : ""}</section>`).join("")}</div>
    </div></section>`;
  };

  /* --- Design system page --- */
  views.system = () => `
    ${pageHead([["Home", "#home"], ["Design system"]], "Design system", "The tokens and components every page in this prototype is built from. Nothing on any page is styled outside this set.")}
    <section class="section"><div class="container stack" style="gap:var(--s-8)">
      <div>${sectionHead("Colour", "Brand, neutrals and status")}<div class="grid grid-4" style="gap:var(--s-4)">${[["--teal-900", "Teal 900 · footer, top bar"], ["--teal-800", "Teal 800 · bands"], ["--teal-700", "Teal 700 · header, primary (from current site)"], ["--teal-500", "Teal 500 · dark-mode brand"], ["--teal-100", "Teal 100"], ["--teal-50", "Teal 50 · soft fills"], ["--green-600", "Green 600 · sourced / success"], ["--amber-600", "Amber 600 · illustrative / closing soon"], ["--red-600", "Red 600 · error / not met"], ["--ink-900", "Ink 900 · text"], ["--ink-500", "Ink 500 · muted text"], ["--line", "Line · borders"]].map((c) => `<div class="swatch"><i style="--c:var(${c[0]})"></i><span>${esc(c[1])}</span><span class="tiny muted num">${c[0]}</span></div>`).join("")}</div></div>
      <div>${sectionHead("Type", "Source Serif 4 for editorial headings, IBM Plex Sans for everything else")}<div>${[["Display 44", "h1 serif", "Making Ethiopia's financial system work for more people"], ["Heading 34", "h2 serif", "Where Ethiopia's climate finance comes from"], ["Heading 20", "h3 sans 600", "Required documents"], ["Lede 18", "lede", "Helping more Ethiopians save, pay, borrow and insure."], ["Body 16", "body", "Each pillar combines research, market testing with partners and support to policy."], ["Small 14", "small", "Source: FSD Ethiopia blog, Mar 2026"], ["Eyebrow 13", "eyebrow", "Strategic pillar"]].map((t) => `<div class="type-row"><span class="n">${esc(t[0])}<br>${esc(t[1])}</span><span class="${t[1].includes("h1") ? "serif" : t[1].includes("h2") ? "serif" : t[1]}" style="${t[1].includes("h1") ? "font-size:var(--fs-44);font-weight:600;line-height:1.1" : t[1].includes("h2") ? "font-size:var(--fs-34);font-weight:600" : t[1].includes("h3") ? "font-size:var(--fs-20);font-weight:600" : ""}">${esc(t[2])}</span></div>`).join("")}</div></div>
      <div class="grid grid-2">
        <div>${sectionHead("Buttons and links", "")}<div class="row"><button class="btn btn-primary">Primary</button><button class="btn btn-secondary">Secondary</button><button class="btn btn-ghost">Ghost</button><button class="btn btn-primary" disabled>Disabled</button><a class="textlink" href="#system">Text link ${ICON.arrow}</a></div></div>
        <div>${sectionHead("Status and chips", "")}<div class="row"><span class="status good">Open · 8 days left</span><span class="status warn">Closing soon</span><span class="status neutral">Closed</span><span class="status bad">Not met</span><span class="status brand">Awaiting review</span><span class="chip type">Report</span><span class="chip">Climate Finance</span><span class="chip outline">Partner document</span>${illus()}</div></div>
      </div>
      <div class="grid grid-2">
        <div>${sectionHead("Form controls", "")}<div class="form-grid"><div class="field"><label for="ds-1">Text input</label><input class="input" id="ds-1" value="Addis Ababa"></div><div class="field invalid"><label for="ds-2">With error</label><input class="input" id="ds-2" value="not-an-email"><span class="err">Enter a valid email address.</span></div><div class="field"><label for="ds-3">Select</label><select class="select" id="ds-3"><option>Consulting services</option></select></div><div class="field"><label class="check"><input type="checkbox" id="ds-4" checked><span>Checkbox</span></label></div></div></div>
        <div>${sectionHead("Chart", "")}<div class="card">${barChart([["2020", 12.2], ["2025", 139.5]], { fmt: (v) => v + "m", max: 160, caption: "Single hue, baseline-anchored, labelled values, hover tooltip." })}</div></div>
      </div>
      <div>${sectionHead("Table", "")}<div class="table-wrap"><table class="tbl"><thead><tr><th>Criterion</th><th>Status</th><th class="num">Weight</th></tr></thead><tbody><tr><td>Technical approach</td><td><span class="status good">Met</span></td><td class="num">35%</td></tr><tr><td>Financial proposal</td><td><span class="status neutral">Sealed</span></td><td class="num">20%</td></tr></tbody></table></div></div>
      <div>${sectionHead("Accessibility", "")}<ul class="prose" style="display:grid;gap:6px"><li>Text contrast meets WCAG 2.1 AA on every surface, in light and dark themes.</li><li>Every interactive element is reachable by keyboard and shows a visible focus ring.</li><li>Form fields have visible labels, required markers and inline error text tied to the field.</li><li>Charts carry an accessible name and their values are printed as text, not only as bars.</li><li>Status is never conveyed by colour alone; each status has a label.</li><li>Motion is limited to short fades and is disabled under reduced-motion settings.</li></ul></div>
    </div></section>`;

  views.notfound = () => `<section class="section"><div class="container confirm"><h1>Page not found</h1><p class="lede" style="margin-top:8px">The page you followed does not exist in this prototype.</p><a class="btn btn-primary" href="#home" style="margin-top:var(--s-5)">Home</a></div></section>`;

  /* ---------------- shell ---------------- */
  const NAV = [["about", "About"], ["work", "Our Work"], ["research", "Research & Insights"], ["data", "Data"], ["impact", "Impact"], ["news", "News"], ["workwithus", "Work With Us"]];
  const ACTIVE = { pillar: "work", report: "research", media: "news", careers: "workwithus", job: "workwithus", apply: "workwithus", applied: "workwithus", procurement: "workwithus", tender: "workwithus", submit: "workwithus", submitted: "workwithus" };

  function renderShell() {
    $("#app").innerHTML = `
      <div class="topbar"><div class="container"><span>Part of the FSD Network</span><span class="net">${D.NETWORK.map((n) => `<a href="#about">${esc(n)}</a>`).join("")}</span></div></div>
      <header class="header"><div class="container">
        <a class="logo" href="#home" aria-label="FSD Ethiopia home"><img class="logo-img" src="img/logo.png" alt="FSD Ethiopia" width="714" height="490"></a>
        <nav class="nav" aria-label="Primary" id="primary-nav">${NAV.map((n) => `<a href="#${n[0]}" data-nav="${n[0]}">${esc(n[1])}</a>`).join("")}</nav>
        <div class="header-actions"><button class="btn-search" data-open-search aria-label="Search the site"><span class="row" style="gap:8px">${ICON.search}<span class="lbl">Search the site…</span></span><kbd>/</kbd></button><button class="btn-menu" data-open-menu aria-label="Open menu" aria-expanded="false">${ICON.menu} Menu</button></div>
      </div></header>
      <main id="main" tabindex="-1"></main>
      <footer class="footer"><div class="container">
        <div class="cols">
          <div><div class="logo" style="margin-bottom:12px"><img class="logo-img lg" src="img/logo.png" alt="FSD Ethiopia" width="714" height="490"></div><p style="max-width:40ch">Established in 2022, FSD Ethiopia is an agency that aims to support the development of accessible, inclusive, and sustainable financial markets for economic growth and human development.</p><p class="num" style="margin-top:12px">${esc(D.OFFICE.email)}<br>${esc(D.OFFICE.phone)}<br>${esc(D.OFFICE.hours)}</p></div>
          <div><h4>Explore</h4><a href="#research">Research &amp; Insights</a><a href="#data">Data &amp; Markets</a><a href="#impact">Impact &amp; Results</a><a href="#news">News</a><a href="#media">For journalists</a></div>
          <div><h4>Work With Us</h4><a href="#careers">Careers</a><a href="#careers">Consulting opportunities</a><a href="#procurement">Procurement &amp; Tenders</a><a href="#contact">Contact</a></div>
          <div><h4>Organisation</h4><a href="#about">Who we are</a><a href="#about">Board and team</a><a href="#about">Funders and network</a><a href="#system">Design system</a><a href="#admin">Staff review console</a></div>
        </div>
        <div class="bottom"><span>© 2026 FSD Ethiopia · Interactive prototype for proposal purposes. Content is from fsdethiopia.org unless marked ${illus()}. <a href="#system" style="display:inline">Design system</a> · <a href="#admin" style="display:inline">Staff review console</a></span><span>Funded by the Bill &amp; Melinda Gates Foundation and UK International Development · Incubated by FSD Africa</span></div>
      </div></footer>
      <div class="drawer" id="drawer" aria-hidden="true"><div class="scrim" data-close-menu></div><div class="panel" role="dialog" aria-label="Menu"><button class="close" data-close-menu>Close</button><nav>${NAV.map((n) => `<a href="#${n[0]}">${esc(n[1])}</a>${n[0] === "workwithus" ? `<a class="sub" href="#careers">Careers</a><a class="sub" href="#procurement">Procurement &amp; Tenders</a>` : ""}${n[0] === "work" ? Object.values(D.PILLARS).map((p) => `<a class="sub" href="#pillar-${p.id}">${esc(p.name)}</a>`).join("") : ""}`).join("")}<a href="#contact">Contact</a><a href="#admin" class="sub">Staff review console</a></nav></div></div>
      <div class="modal" id="search-modal" aria-hidden="true"><div class="scrim" data-close-search></div><div class="dialog" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-head">${ICON.search}<input type="search" id="gs-q" placeholder="Search research, data, programmes, news, people, opportunities" autocomplete="off" aria-label="Search"><button class="esc" data-close-search>Esc</button></div>
        <div class="scope" id="gs-scope"></div>
        <div class="results" id="gs-results"></div>
        <div class="foot"><span>Enter opens full results · ↑↓ to move · Esc to close</span><span class="suggest">Try ${["financial inclusion", "climate finance", "tender", "mobile money", "gender"].map((s) => `<button type="button" data-suggest="${s}">${s}</button>`).join("")}</span></div>
      </div></div>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
      <div class="tip" id="tip" aria-hidden="true"></div>`;
  }

  function parseHash() {
    const h = (location.hash || "#home").slice(1);
    if (!h || h === "home") return { route: "home", id: null };
    const m = h.match(/^(pillar|report|job|apply|applied|tender|submit|submitted|admin|contact|news)-(.+)$/);
    if (m) return { route: m[1], id: m[2] };
    return { route: h, id: null };
  }

  function render() {
    const { route, id } = parseHash();
    const fn = views[route] || views.notfound;
    const main = $("#main");
    main.innerHTML = fn(id);
    const active = ACTIVE[route] || route;
    $$("[data-nav]").forEach((a) => { if (a.dataset.nav === active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.title = (({ home: "FSD Ethiopia", research: "Research & Insights", data: "Data & Markets", impact: "Impact & Results", admin: "Review console", procurement: "Procurement & Tenders", careers: "Careers" })[route] || (main.querySelector("h1") || {}).textContent || "FSD Ethiopia") + " · FSD Ethiopia prototype";
    window.scrollTo({ top: 0, behavior: "auto" });
    const h1 = main.querySelector("h1"); if (h1) { h1.setAttribute("tabindex", "-1"); if (route !== "home") h1.focus({ preventScroll: true }); }
    closeMenu();
  }

  /* ---------------- search modal ---------------- */
  let gsActive = -1;
  function openSearch(prefill) { const m = $("#search-modal"); m.classList.add("open"); m.setAttribute("aria-hidden", "false"); const i = $("#gs-q"); if (prefill != null) i.value = prefill; i.focus(); i.select(); gsRender(); }
  function closeSearch() { const m = $("#search-modal"); m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  function gsRender() {
    const q = $("#gs-q").value.trim(), out = $("#gs-results"), sc = $("#gs-scope");
    gsActive = -1;
    if (!q) { sc.innerHTML = ""; out.innerHTML = `<div class="sr-group"><p class="eyebrow" style="margin-bottom:8px">Popular right now</p>${[["Landscape of Climate Finance in Ethiopia", "Report · April 2026", "#report-climate-landscape-2026"], ["Investor Relations Capacity Strengthening (RFP)", "Open tender · closes 14 Oct 2026", "#tender-rfp-2026-ir"], ["Mobile money accounts, 2025", "Data indicator", "#data"], ["Board Ready Women", "Programme results", "#impact"]].map((x) => `<a class="sr-item" href="${x[2]}" data-gs-item><div><div class="t">${esc(x[0])}</div><div class="d">${esc(x[1])}</div></div></a>`).join("")}</div>`; return; }
    const res = runSearch(q), groups = groupResults(res);
    const scope = state.search.scope;
    sc.innerHTML = ["All"].concat(GROUP_ORDER).map((g) => { const n = g === "All" ? res.length : res.filter((r) => r.type === g).length; return n ? `<button class="pill-filter" data-gs-scope="${g}" aria-pressed="${scope === g}" style="padding:3px 9px;font-size:12px">${g} <span class="num">${n}</span></button>` : ""; }).join("");
    const shown = scope === "All" ? groups : groups.filter((g) => g.g === scope);
    if (!res.length) { out.innerHTML = `<div class="sr-group"><strong>No results for “${esc(q)}”.</strong><p class="small muted" style="margin-top:4px">Try “inclusion”, “climate”, “tender” or a person's name.</p></div>`; return; }
    out.innerHTML = `<div class="gs-grid ${scope === "All" ? "" : "single"}">` + shown.map((g) => `<div class="sr-group"><div class="gh"><span class="eyebrow">${g.g} <span class="num">(${g.items.length})</span></span>${g.items.length > 3 && scope === "All" ? `<a class="tiny" href="#search" data-gs-all="${g.g}">View all</a>` : ""}</div>${g.items.slice(0, scope === "All" ? 2 : 20).map((it) => `<a class="sr-item" href="${it.href}" data-gs-item><div><div class="t">${hi(it.title, q)}</div><div class="d">${hi(it.desc, q)}</div></div><span class="k">${esc(it.meta)}</span></a>`).join("")}</div>`).join("") + `</div><div class="sr-group" style="text-align:center;border-top:1px solid var(--line-soft)"><a class="textlink" href="#search" data-gs-all="All">All ${res.length} results for “${esc(q)}” ${ICON.arrow}</a></div>`;
  }
  function gsMove(dir) { const items = $$("[data-gs-item]", $("#gs-results")); if (!items.length) return; gsActive = (gsActive + dir + items.length) % items.length; items.forEach((el, i) => el.style.background = i === gsActive ? "var(--brand-soft)" : ""); items[gsActive].scrollIntoView({ block: "nearest" }); }

  /* ---------------- menu / toast / tooltip ---------------- */
  function openMenu() { $("#drawer").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false"); $("[data-open-menu]").setAttribute("aria-expanded", "true"); }
  function closeMenu() { const d = $("#drawer"); if (!d) return; d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); const b = $("[data-open-menu]"); if (b) b.setAttribute("aria-expanded", "false"); }
  let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }
  function copy(text) { const done = () => toast("Copied to clipboard"); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done)); else fallbackCopy(text, done); }
  function fallbackCopy(text, done) { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Select the text and copy it manually"); } document.body.removeChild(ta); }

  /* ---------------- validation ---------------- */
  function validate(form, st) {
    let ok = true, first = null;
    $$(".field", form).forEach((f) => f.classList.remove("invalid"));
    $$("input, select, textarea", form).forEach((el) => {
      if (el.type === "file") return;
      const field = el.closest(".field");
      let valid = true;
      if (el.required) { if (el.type === "checkbox") valid = el.checked; else valid = el.value.trim() !== ""; }
      if (valid && el.type === "email" && el.value.trim()) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (st && el.id && el.type !== "checkbox") st.data[el.id] = el.value; else if (st && el.type === "checkbox" && el.id) st.data[el.id] = el.checked;
      if (!valid) { ok = false; if (field) field.classList.add("invalid"); if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  const fmtSize = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";

  /* ---------------- events ---------------- */
  document.addEventListener("click", (e) => {
    const toc = e.target.closest(".toc a"); if (toc) { e.preventDefault(); const el = document.getElementById(toc.getAttribute("href").slice(1)); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } return; }
    const t = e.target.closest("[data-open-search]"); if (t) { openSearch(); return; }
    if (e.target.closest("[data-close-search]")) { closeSearch(); return; }
    if (e.target.closest("[data-open-menu]")) { openMenu(); return; }
    if (e.target.closest("[data-close-menu]")) { closeMenu(); return; }
    const sug = e.target.closest("[data-suggest]"); if (sug) { $("#gs-q").value = sug.dataset.suggest; state.search.scope = "All"; gsRender(); $("#gs-q").focus(); return; }
    const gsc = e.target.closest("[data-gs-scope]"); if (gsc) { state.search.scope = gsc.dataset.gsScope; gsRender(); return; }
    const gall = e.target.closest("[data-gs-all]"); if (gall) { state.search.q = $("#gs-q").value.trim(); state.search.scope = gall.dataset.gsAll; closeSearch(); return; }
    if (e.target.closest("[data-gs-item]")) { closeSearch(); return; }
    const cp = e.target.closest("[data-copy]"); if (cp) { e.preventDefault(); copy(cp.dataset.copy); return; }
    const ts = e.target.closest("[data-toast]"); if (ts) { e.preventDefault(); toast(ts.dataset.toast); return; }
    const rp = e.target.closest("a[data-route]"); if (rp) { state.contact.route = rp.dataset.route; state.contact.sent = false; }
    const tp = e.target.closest("a[data-topic]"); if (tp) { state.research = Object.assign(state.research, { q: "", topics: [tp.dataset.topic], years: [], types: [], pillars: [], origin: "all" }); }
    // research filters
    const clr = e.target.closest("[data-clear]"); if (clr) { const k = clr.dataset.clear; if (k === "all") Object.assign(state.research, { q: "", topics: [], years: [], types: [], pillars: [], origin: "all" }); else state.research[k] = []; render(); return; }
    const rm = e.target.closest("[data-remove]"); if (rm) { const k = rm.dataset.remove, v = rm.dataset.value; if (k === "q") state.research.q = ""; else if (k === "origin") state.research.origin = "all"; else state.research[k] = state.research[k].filter((x) => x !== v); render(); return; }
    if (e.target.closest("[data-toggle-filters]")) { state.research.filtersOpen = !state.research.filtersOpen; render(); return; }
    const dt = e.target.closest("[data-data-topic]"); if (dt) { state.data.topic = dt.dataset.dataTopic; render(); return; }
    const ip = e.target.closest("[data-impact-pillar]"); if (ip) { state.impact.pillar = ip.dataset.impactPillar; render(); return; }
    const nt = e.target.closest("[data-news-tab]"); if (nt) { state.news.tab = nt.dataset.newsTab; if (location.hash !== "#news") location.hash = "#news"; else render(); return; }
    const pt = e.target.closest("[data-proc-tab]"); if (pt) { state.proc.tab = pt.dataset.procTab; render(); return; }
    const stry = e.target.closest("[data-search-try]"); if (stry) { state.search.q = stry.dataset.searchTry; state.search.scope = "All"; render(); return; }
    const ss = e.target.closest("[data-search-scope]"); if (ss) { state.search.scope = ss.dataset.searchScope; render(); return; }
    const stp = e.target.closest("[data-step]"); if (stp) { const r = parseHash().route; (r === "apply" ? state.apply : state.submit).step = +stp.dataset.step; render(); return; }
    const ur = e.target.closest("[data-upload-remove]"); if (ur) { const r = parseHash().route; delete (r === "apply" ? state.apply : state.submit).uploads[ur.dataset.uploadRemove]; render(); return; }
    const am = e.target.closest("[data-admin-mode]"); if (am) { state.admin.mode = am.dataset.adminMode; state.admin.sel = null; if (location.hash !== "#admin") location.hash = "#admin"; else render(); return; }
    const asel = e.target.closest("tr[data-admin-sel]"); if (asel && !e.target.closest("a")) { location.hash = "#admin-" + asel.dataset.adminSel; return; }
    const au = e.target.closest("[data-admin-undo]"); if (au) { delete state.admin.decided[au.dataset.adminUndo]; render(); return; }
    if (e.target.closest("[data-contact-reset]")) { state.contact.sent = false; state.contact.data = {}; render(); return; }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches("[data-filter]")) { const k = el.dataset.filter, v = el.value; const arr = state.research[k]; if (el.checked) { if (!arr.includes(v)) arr.push(v); } else state.research[k] = arr.filter((x) => x !== v); render(); return; }
    if (el.matches("[data-origin]")) { state.research.origin = el.value; render(); return; }
    if (el.matches("[data-sort]")) { state.research.sort = el.value; render(); return; }
    if (el.matches("[data-route-pick]")) { state.contact.route = el.value; state.contact.sent = false; render(); return; }
    if (el.matches("[data-upload]")) { const f = el.files && el.files[0]; if (!f) return; const r = parseHash().route; const st = r === "apply" ? state.apply : state.submit; st.uploads[el.dataset.upload] = { name: f.name, size: fmtSize(f.size) }; render(); return; }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("form[data-form]"); if (!form) return; e.preventDefault();
    const kind = form.dataset.form, { route, id } = parseHash();
    if (kind === "newsletter" || kind === "alerts") { const em = $("input[type=email]", form); if (!em.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.closest(".field").classList.add("invalid"); em.focus(); toast("Enter a valid email address"); return; } toast(kind === "alerts" ? "Tender alerts set for this category (prototype)" : "Subscribed (prototype)"); form.reset(); return; }
    if (kind === "research-search") { state.research.q = $("#rs-q").value; render(); return; }
    if (kind === "search-page") { state.search.q = $("#sp-q").value; state.search.scope = "All"; render(); return; }
    if (kind === "apply-1" || kind === "submit-1") { const st = kind === "apply-1" ? state.apply : state.submit; if (validate(form, st)) { st.step = 2; render(); } return; }
    if (kind === "apply-2" || kind === "submit-2") { const st = kind === "apply-2" ? state.apply : state.submit; const need = $$("[data-upload-row]", form).map((r) => r.dataset.uploadRow); const missing = need.filter((k) => !st.uploads[k]); if (missing.length) { $("[data-field=uploads]", form).classList.add("invalid"); const first = $(`[data-upload-row="${missing[0]}"] label`, form); if (first) first.focus(); return; } st.step = 3; render(); return; }
    if (kind === "apply-3" || kind === "submit-3") { const st = kind === "apply-3" ? state.apply : state.submit; if (validate(form, st)) { st.step = 4; render(); } return; }
    if (kind === "apply-4") { state.apply = { step: 1, data: state.apply.data, uploads: {} }; location.hash = "#applied-" + id; return; }
    if (kind === "submit-4") { state.submit = { step: 1, data: state.submit.data, uploads: {} }; location.hash = "#submitted-" + id; return; }
    if (kind === "contact") { if (validate(form, state.contact)) { state.contact.sent = true; render(); } return; }
    if (kind === "decision") { const dec = $("input[name=dec]:checked", form), rat = $("#rationale", form); if (!dec || !rat.value.trim()) { $("[data-field=rationale]", form).classList.add("invalid"); (dec ? rat : $("input[name=dec]", form)).focus(); return; } state.admin.decided[form.dataset.id] = dec.value; state.admin.rationale = rat.value.trim(); render(); toast("Decision recorded to the audit log"); return; }
  });

  document.addEventListener("keydown", (e) => {
    const modalOpen = $("#search-modal").classList.contains("open");
    if (e.key === "Escape") { if (modalOpen) closeSearch(); closeMenu(); return; }
    if (e.key === "/" && !modalOpen && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); return; }
    if (modalOpen) {
      if (e.key === "ArrowDown") { e.preventDefault(); gsMove(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); gsMove(-1); }
      else if (e.key === "Enter" && document.activeElement === $("#gs-q")) { e.preventDefault(); const items = $$("[data-gs-item]", $("#gs-results")); if (gsActive >= 0 && items[gsActive]) { location.hash = items[gsActive].getAttribute("href"); } else { state.search.q = $("#gs-q").value.trim(); state.search.scope = "All"; if (location.hash === "#search") render(); else location.hash = "#search"; } closeSearch(); }
    }
    const row = e.target.closest && e.target.closest("tr[data-admin-sel]"); if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); location.hash = "#admin-" + row.dataset.adminSel; }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "gs-q") { state.search.scope = "All"; gsRender(); } });

  // chart tooltips
  document.addEventListener("mousemove", (e) => { const el = e.target.closest && e.target.closest("[data-tip]"); const tip = $("#tip"); if (!tip) return; if (el) { tip.textContent = el.dataset.tip; tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px"; tip.classList.add("show"); } else tip.classList.remove("show"); });
  document.addEventListener("focusin", (e) => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) { const r = el.getBoundingClientRect(); const tip = $("#tip"); tip.textContent = el.dataset.tip; tip.style.left = r.left + r.width / 2 + "px"; tip.style.top = r.top + "px"; tip.classList.add("show"); } });
  document.addEventListener("focusout", () => { const tip = $("#tip"); if (tip) tip.classList.remove("show"); });

  window.addEventListener("hashchange", render);

  renderShell();
  // Deep link #contact-media etc.
  render();
})();
