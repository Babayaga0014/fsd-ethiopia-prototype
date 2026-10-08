/* Content model for the FSD Ethiopia prototype.
   Sources: fsdethiopia.org (Resource Center, Our Work, Our Team, Our Funders, Blogs, Events,
   Procurement Opportunities), read 6 Oct 2026. Anything not published by FSD Ethiopia is
   flagged `illustrative: true` and rendered with an "Illustrative" label. */

window.FSD = (function () {
  const PILLARS = {
    inclusion: {
      id: "inclusion", name: "Financial Inclusion", short: "Inclusion",
      img: "img/pillar-inclusion.jpg",
      brief: "Savings, payments, credit and insurance that reach women, young people and small businesses.",
      lede: "Helping more Ethiopians, especially women, young people and small business owners, save, pay, borrow and insure through formal financial services.",
      body: "Advancing inclusive growth requires an improved policy and regulatory environment with better financial solutions, more responsive financial service providers, and more informed individuals participating in the financial system, especially women, youth and entrepreneurs.",
      focus: [
        ["Expanding basic financial access", "Supporting traditional and digital solutions that allow all consumers to save, transact, access credit, invest and safeguard their assets easily and responsibly."],
        ["Supporting financial sector reform agendas", "Backing government economic reform initiatives centred on digitisation and liberalisation."],
        ["Deepening financial services", "Fostering public-private collaboration for innovative market development targeting underserved populations."],
        ["Supporting an inclusive insurance sector", "Expanding coverage to vulnerable communities and providing risk management resources."]
      ],
      fact: { value: "45%", label: "of Ethiopians have access to a bank account", source: "FSD Ethiopia, Our Work: Financial Inclusion" }
    },
    capital: {
      id: "capital", name: "Access to Capital", short: "Capital",
      img: "img/pillar-capital.jpg",
      brief: "Long-term finance and working capital for businesses, through lenders and the new capital market.",
      lede: "Working with capital-market institutions and lenders so businesses can find long-term finance and working capital on fair terms.",
      body: "FSD Ethiopia works in close partnership with key industry actors to increase access to long-term financing options and working capital for business owners. The objective is equitable and efficient access to capital systems for diverse people to build strong businesses, communities, and economies.",
      focus: [
        ["Long-term financing options", "Increasing the availability of extended-duration capital for entrepreneurs."],
        ["Working capital", "Enhancing access to operational funding for business owners."],
        ["Business owner engagement", "Promoting adoption of affordable and accessible working and risk capital through targeted programming."]
      ],
      fact: { value: "2 tenders", label: "open for capital-markets work this month", source: "Procurement Opportunities, Oct 2026" }
    },
    climate: {
      id: "climate", name: "Climate Finance", short: "Climate",
      img: "img/pillar-climate.jpg",
      brief: "Public and private capital for adaptation and mitigation, tracked and directed to national priorities.",
      lede: "Mobilising domestic and international capital for climate adaptation and mitigation, and building a financial system that can withstand climate shocks.",
      body: "Climate finance is fast becoming important in Ethiopia, as the country faces a range of climate change-related challenges. FSD Ethiopia's approach focuses on mobilising domestic and international capital to fund climate adaptation and mitigation initiatives while building environmental resilience across government, business, households and vulnerable communities.",
      focus: [
        ["Mobilising climate capital", "Tracking and growing the flow of public and private climate finance into Ethiopia."],
        ["Green and sustainable finance instruments", "Assessing the feasibility of green bonds, sustainability-linked loans and related instruments with the Ethiopian Capital Market Authority."],
        ["Convening", "Annual Climate Finance Summits bringing government, financial institutions and development partners together in Addis Ababa."]
      ],
      fact: { value: "~200", label: "participants at the Second Climate Finance Summit, March 2026", source: "FSD Ethiopia, Our Events" }
    }
  };

  const TOPICS = ["Financial Inclusion", "Digital Finance", "MSME Finance", "Climate Finance", "Agricultural Finance", "Access to Capital", "Capital Markets", "Gender", "Insurance", "Policy & Regulation"];
  const TYPES = ["Report", "Scoping study", "Strategy", "Roadmap", "Booklet", "Event report", "Policy document", "Analysis"];

  // Publications listed in the current Resource Center. `origin` separates FSD Ethiopia's own
  // work from partner and government documents the Resource Center hosts for reference.
  const PUBS = [
    { id: "climate-landscape-2026", title: "Landscape of Climate Finance in Ethiopia", year: 2026, date: "April 2026", type: "Report",
      topics: ["Climate Finance", "Policy & Regulation"], pillar: "climate", origin: "fsd", featured: true, cover: "img/cover-climate.jpg",
      authors: ["FSD Ethiopia", "Climate Policy Initiative"],
      summary: "The first comprehensive mapping of climate finance flows into and within Ethiopia, prepared with Climate Policy Initiative. It tracks who is funding adaptation and mitigation, through which instruments, and where the gaps are against the country's NDC 3.0 (2025–2035).",
      pages: 64 },
    { id: "green-instruments-2025", title: "Feasibility of Green & Sustainable Finance Instruments in Ethiopia", year: 2025, date: "2025", type: "Scoping study",
      topics: ["Climate Finance", "Capital Markets"], pillar: "climate", origin: "fsd", cover: "img/cover-green.jpg",
      authors: ["Ethiopian Capital Market Authority", "FSD Ethiopia"],
      summary: "A scoping study with the Ethiopian Capital Market Authority on whether green bonds, sustainability-linked loans and similar instruments are viable in Ethiopia's emerging capital market, and what regulation and market infrastructure would need to be in place." },
    { id: "nafir-2025", title: "National Agricultural Finance Implementation Roadmap (2025–2030)", year: 2025, date: "2025", type: "Roadmap",
      topics: ["Agricultural Finance", "Financial Inclusion", "MSME Finance"], pillar: "inclusion", origin: "fsd", cover: "img/cover-nafir.jpg",
      authors: ["FSD Ethiopia"],
      summary: "A five-year implementation roadmap for expanding finance to smallholder farmers and agribusinesses, sequencing policy, product and infrastructure actions for lenders, regulators and development partners." },
    { id: "women-capital-markets-2025", title: "Unlock Capital Markets to Advance Women's Economic Participation & Leadership in Ethiopia", year: 2025, date: "2025", type: "Booklet",
      topics: ["Gender", "Capital Markets", "Access to Capital"], pillar: "capital", origin: "fsd", cover: "img/cover-women.jpg",
      authors: ["FSD Ethiopia"],
      summary: "An advocacy booklet on how Ethiopia's new capital market can be designed to widen women's participation as issuers, investors and leaders." },
    { id: "unlocking-potentials-2025", title: "Unlocking Potentials: Financial Inclusion & Capital Markets for Women's Economic Empowerment", year: 2025, date: "2025", type: "Report",
      topics: ["Gender", "Financial Inclusion", "Capital Markets"], pillar: "inclusion", origin: "fsd", cover: "img/cover-women.jpg",
      authors: ["FSD Ethiopia"],
      summary: "A comprehensive analysis of the barriers women face in Ethiopia's financial system and the role financial inclusion and capital markets can play in women's economic empowerment." },
    { id: "agent-network-2025", title: "Enabling Sustainable Digital Payment Agent Network Expansion: Cash-In Cash-Out Agent Mapping Strategy", year: 2025, date: "2025", type: "Strategy",
      topics: ["Digital Finance", "Financial Inclusion"], pillar: "inclusion", origin: "fsd", cover: "img/cover-agent.jpg",
      authors: ["National Bank of Ethiopia", "FSD Ethiopia"],
      summary: "A strategy for mapping and expanding Ethiopia's cash-in cash-out agent network by identifying and supporting viable agent business cases, prepared with the National Bank of Ethiopia." },
    { id: "climate-summit-2024", title: "Climate Finance Summit 2024: Workshop Report", year: 2025, date: "2025", type: "Event report",
      topics: ["Climate Finance"], pillar: "climate", origin: "fsd", cover: "img/cover-summit.jpg",
      authors: ["FSD Ethiopia"],
      summary: "Proceedings of the first annual Climate Finance Summit held in Addis Ababa in December 2024, convening government officials and private-sector leaders on building a green economy." },
    { id: "mobile-money-2023", title: "Mobile Money in Ethiopia", year: 2023, date: "2023", type: "Analysis",
      topics: ["Digital Finance", "Financial Inclusion"], pillar: "inclusion", origin: "fsd", cover: "img/cover-mobile.jpg",
      authors: ["FSD Ethiopia"],
      summary: "An analysis of the state of mobile money in Ethiopia and what it would take to deepen usage beyond account opening." },
    { id: "nfis-ii", title: "National Financial Inclusion Strategy II", year: 2021, date: "2021", type: "Policy document",
      topics: ["Financial Inclusion", "Policy & Regulation"], pillar: "inclusion", origin: "partner",
      authors: ["National Bank of Ethiopia"],
      summary: "Ethiopia's national financial inclusion framework, published by the National Bank of Ethiopia and hosted here for reference." },
    { id: "ndps-2021", title: "National Digital Payments Strategy 2021–2024", year: 2021, date: "2021", type: "Policy document",
      topics: ["Digital Finance", "Policy & Regulation"], pillar: "inclusion", origin: "partner",
      authors: ["National Bank of Ethiopia"],
      summary: "The National Bank of Ethiopia's plan for modernising the payment system. Hosted for reference." },
    { id: "jobs-plan", title: "Plan of Action for Job Creation", year: 2020, date: "2020", type: "Policy document",
      topics: ["MSME Finance", "Policy & Regulation"], pillar: "capital", origin: "partner",
      authors: ["Jobs Creation Commission"],
      summary: "The Jobs Creation Commission's national plan of action. Hosted for reference." },
    { id: "homegrown-reform", title: "A Homegrown Economic Reform Agenda: A Pathway to Prosperity", year: 2020, date: "2020", type: "Policy document",
      topics: ["Policy & Regulation", "Access to Capital"], pillar: "capital", origin: "partner",
      authors: ["Federal Democratic Republic of Ethiopia"],
      summary: "The Government of Ethiopia's macroeconomic, structural and sectoral reform framework. Hosted for reference." },
    { id: "ten-year-plan", title: "Ten Years Development Plan: A Pathway to Prosperity (2021–2030)", year: 2021, date: "2021", type: "Policy document",
      topics: ["Policy & Regulation"], pillar: "capital", origin: "partner",
      authors: ["Federal Democratic Republic of Ethiopia"],
      summary: "Ethiopia's long-term national development plan. Hosted for reference." },
    { id: "doing-business-2023", title: "Ethiopia: Improving Ease of Doing Business", year: 2023, date: "2023", type: "Policy document",
      topics: ["MSME Finance", "Policy & Regulation"], pillar: "capital", origin: "partner",
      authors: ["Office of the Prime Minister"],
      summary: "Regulatory reform documentation from the Office of the Prime Minister. Hosted for reference." },
    { id: "gsma-mobile-money", title: "Mobile Money in Ethiopia: Advancing Financial Inclusion & Driving Growth", year: 2023, date: "2023", type: "Report",
      topics: ["Digital Finance", "Financial Inclusion"], pillar: "inclusion", origin: "partner",
      authors: ["GSMA"],
      summary: "GSMA's industry analysis of mobile money growth and projections for Ethiopia. Hosted for reference." }
  ];

  // Flagship report detail. Only the executive summary is drawn from the published cover text;
  // key findings, figures and the chart are illustrative placeholders for approved content.
  const REPORT = {
    id: "climate-landscape-2026",
    execSummary: [
      "Ethiopia's climate policy framework is increasingly investment-oriented, moving from ambition to action. Building on the Climate Resilient Green Economy (CRGE) Strategy (2011) and earlier NDCs, the country's NDC 3.0 (2025–2035) shifts from high-level ambition toward defined sectoral pathways and financing needs.",
      "This report maps the climate finance that reached Ethiopia and was raised domestically, by source, instrument, sector and use. It is intended as a baseline that government, financial institutions and development partners can use to direct capital to where the NDC says it is needed."
    ],
    findings: [
      { h: "Public international finance dominates tracked flows", d: "Most tracked climate finance arrives as grants and concessional loans from multilateral and bilateral sources. Private flows remain a small share.", illustrative: true },
      { h: "Adaptation is under-financed relative to need", d: "Adaptation accounts for a minority of tracked flows despite Ethiopia's exposure to drought and flooding. Agriculture and water receive the largest adaptation allocations.", illustrative: true },
      { h: "Domestic instruments are emerging but untested", d: "Green bonds and sustainability-linked lending are being explored by the Ethiopian Capital Market Authority and banks, but no instrument has yet been issued at scale.", illustrative: true },
      { h: "Tracking gaps limit accountability", d: "Reporting on climate finance is fragmented across ministries and development partners. A common tagging standard would make future landscapes faster and more complete.", illustrative: true }
    ],
    figures: [
      { v: "NDC 3.0", l: "Ethiopia's 2025–2035 climate commitment the report tracks against", src: "Report cover", ok: true },
      { v: "CRGE 2011", l: "The strategy the current framework builds on", src: "Report cover", ok: true },
      { v: "USD — bn", l: "Total tracked climate finance (placeholder for approved figure)", src: "Illustrative", ok: false },
      { v: "— %", l: "Share flowing to adaptation (placeholder for approved figure)", src: "Illustrative", ok: false }
    ],
    chart: {
      title: "Tracked climate finance by source, share of total",
      note: "Illustrative composition for layout only. Values will be replaced with the report's approved figures.",
      rows: [["Multilateral DFIs", 46], ["Bilateral donors", 27], ["Domestic public", 14], ["Private & commercial", 9], ["Philanthropy", 4]]
    },
    related: ["green-instruments-2025", "climate-summit-2024", "nafir-2025"]
  };

  const NEWS = [
    { id: "gender-market-systems", date: "2026-07-21", kind: "Blog", title: "Gender Integration as a Market Systems Strategy: Advancing Women's Financial Inclusion", author: "Sinidu Fikadu", pillar: "inclusion", topics: ["Gender", "Financial Inclusion"],
      summary: "In 2024, 42 percent of women owned an account compared with 57 percent of men. Closing that gap requires treating gender as a market-systems question, not a side programme." },
    { id: "open-finance", date: "2026-07-20", kind: "Blog", title: "Ethiopia's Open Finance Future Is Closer Than It Looks", author: "Abel Tadelle", pillar: "inclusion", topics: ["Digital Finance"],
      summary: "Within four years Ethiopia moved from almost no mobile money to nearly 50 million people carrying a mobile payment capability. The next question is who controls the data." },
    { id: "stakeholder-summit-2026", date: "2026-07-17", kind: "News", title: "From Inception to Enduring Impact: FSD Ethiopia Stakeholder Summit", author: "", pillar: "", topics: ["Policy & Regulation"],
      summary: "Government leaders and regulators joined FSD Ethiopia to review progress since 2022 and the organisation's direction toward sustainable impact." },
    { id: "islamic-climate-alliance", date: "2026-06-27", kind: "News", title: "FSD Ethiopia Joins the Global Islamic Climate Finance Alliance", author: "", pillar: "climate", topics: ["Climate Finance"],
      summary: "FSD Ethiopia joined the alliance at the Islamic Development Bank Annual Meetings in Baku to strengthen Islamic finance's role in climate resilience." },
    { id: "india-dpi", date: "2026-05-08", kind: "Blog", title: "India's DPI Flywheel: From Payment Rails to the Last Mile", author: "Abel Tadelle", pillar: "inclusion", topics: ["Digital Finance"],
      summary: "What a benchmarking visit to India suggests about combining identity, payments and last-mile access in Ethiopia." },
    { id: "insurance-reform", date: "2026-03-26", kind: "Blog", title: "Growing Ethiopia's Insurance Market: From Reform to Real Impact", author: "Abel Tadelle", pillar: "inclusion", topics: ["Insurance"],
      summary: "Premiums are rising and regulation is being reformed, yet insurance penetration remains below one percent of GDP, leaving millions of households and businesses exposed to shocks." },
    { id: "dfs-women", date: "2026-03-26", kind: "Blog", title: "Designing Digital Finance Markets That Work for Women", author: "Sinidu Fikadu and Hanna Hailu", pillar: "inclusion", topics: ["Gender", "Digital Finance"],
      summary: "Mobile money accounts grew from 12.2 million in 2020 to 139.5 million in 2025. Rapid expansion has not automatically translated into women's economic empowerment." },
    { id: "climate-summit-2026", date: "2026-03-05", kind: "Event", title: "Second Climate Finance Summit, Addis Ababa", author: "", pillar: "climate", topics: ["Climate Finance"],
      summary: "Nearly 200 participants from government and financial institutions met for the second annual summit." },
    { id: "bimalab-demo-day", date: "2024-03-07", kind: "Press release", title: "BimaLab Ethiopia Comes to a Successful Finish with Demo Day Showcase", author: "", pillar: "inclusion", topics: ["Insurance", "Digital Finance"],
      summary: "The insurtech accelerator launched in December 2023 closed with a demo day for participating start-ups." },
    { id: "bimalab-launch", date: "2023-12-07", kind: "Press release", title: "FSD Ethiopia Launches BimaLab Insurtech Accelerator", author: "", pillar: "inclusion", topics: ["Insurance"],
      summary: "An accelerator to foster innovation in Ethiopia's insurance sector." }
  ];

  // Statistics that appear on fsdethiopia.org, each with where it was found.
  const STATS = [
    { id: "mm-accounts", value: "139.5m", num: 139.5, label: "Mobile money accounts, 2025", delta: "from 12.2m in 2020", source: "FSD Ethiopia blog, Mar 2026, citing National Bank of Ethiopia", topic: "Digital Finance" },
    { id: "gender-gap", value: "42% vs 57%", label: "Women and men with an account, 2024", delta: "15-point gap", source: "FSD Ethiopia blog, Jul 2026", topic: "Gender" },
    { id: "bank-access", value: "45%", label: "Population with access to a bank account", delta: "", source: "FSD Ethiopia, Our Work: Financial Inclusion", topic: "Financial Inclusion" },
    { id: "formal-savings", value: "<30%", label: "Adults who save with a formal institution", delta: "", source: "FSD Ethiopia, Our Work: Financial Inclusion", topic: "Financial Inclusion" },
    { id: "insurance", value: "<1%", label: "Insurance penetration, share of GDP", delta: "", source: "FSD Ethiopia blog, Mar 2026", topic: "Insurance" },
    { id: "insured-share", value: "~1 in 10", label: "Share of the population served by insurance", delta: "", source: "FSD Ethiopia, Our Work: Financial Inclusion", topic: "Insurance" }
  ];

  const PEOPLE = [
    { id: "hikmet", name: "Hikmet Abdella", role: "Chief Executive Officer", topics: ["Strategy", "Financial sector development"], media: true },
    { id: "abel", name: "Abel Tadelle", role: "Director of Financial Inclusion", topics: ["Digital finance", "Insurance", "Open finance"], media: true },
    { id: "gosaye", name: "Gosaye Warsa", role: "Director of Financial Markets", topics: ["Capital markets", "Access to capital"], media: true },
    { id: "selamsew", name: "Selamsew Tesfaye", role: "Director of Operations & Finance", topics: ["Operations"], media: false },
    { id: "yohannes", name: "Yohannes Ameha", role: "Climate Finance Lead", topics: ["Climate finance", "Green instruments"], media: true },
    { id: "sinidu", name: "Sinidu Fikadu", role: "Gender Lead", topics: ["Women's financial inclusion", "Gender integration"], media: true },
    { id: "berhanu", name: "Berhanu Alene", role: "Development Impact Manager", topics: ["Results measurement", "Impact"], media: false },
    { id: "samson", name: "Samson Berhane", role: "Communications & Advocacy Specialist", topics: ["Media enquiries"], media: true, contact: true },
    { id: "rahel", name: "Rahel Taddese", role: "Senior Procurement Officer", topics: ["Procurement"], media: false }
  ];

  const BOARD = [
    ["Admassu Tadesse", "Board Chairman; President Emeritus & MD, TDB Group"],
    ["Berhane Demissie", "Co-Founder & Managing Partner, Cepheus Growth Capital Partners"],
    ["Maleda Bisrat", "Country Director Ethiopia, Tony Blair Institute for Global Change"]
  ];

  const FUNDERS = ["Bill & Melinda Gates Foundation", "UK International Development"];
  const NETWORK = ["FSD Africa", "FSD Kenya", "FSD Tanzania", "FSD Uganda", "EFInA (Nigeria)", "Access to Finance Rwanda", "FinMark Trust"];

  // Procurement. The first two are live notices on fsdethiopia.org (Oct 2026). References are
  // shown in a proposed format because the current notices do not publish one.
  const TENDERS = [
    { id: "rfp-2026-ir", ref: "FSDE/RFP/2026/014", title: "Investor Relations Capacity Strengthening for Listed, OTC-traded and Prospective Public Companies",
      category: "Consulting services", pillar: "capital", type: "Request for Proposal", status: "open", published: "2026-09-23", deadline: "2026-10-14", deadlineTime: "17:00 EAT", qaDeadline: "2026-10-07",
      real: true, refIllustrative: true,
      summary: "FSD Ethiopia is seeking qualified consultants or consortiums to strengthen investor relations capacity among listed, OTC-traded, and prospective public companies. Focus areas include investor relations tools, disclosure practices, capacity building, investor engagement, ESG communication, and market-wide investor relations mechanisms.",
      scope: ["Assess current investor relations practice among listed and prospective public companies", "Develop investor relations tools and disclosure templates aligned with ECMA requirements", "Deliver capacity-building sessions for company secretaries, CFOs and IR officers", "Recommend market-wide investor relations mechanisms, including ESG communication"],
      eligibility: ["Registered firm or consortium with a valid business licence", "Demonstrated experience in capital markets advisory or investor relations in an emerging market", "Team lead with at least 10 years' relevant experience", "No conflict of interest with FSD Ethiopia or ECMA"],
      docs: ["Business licence (valid)", "Tax registration certificate (TIN) and tax clearance", "Technical proposal", "Financial proposal (separate file)", "Signed declaration of eligibility and no conflict of interest", "CVs of proposed team"],
      evaluation: [["Technical approach and methodology", 35], ["Relevant experience of the firm", 25], ["Qualifications of key personnel", 20], ["Financial proposal", 20]],
      downloads: [["Terms of Reference (PDF)", "0.4 MB"], ["Declaration template (DOCX)", "0.1 MB"]],
      contact: "procurement@fsdethiopia.org" },
    { id: "tor-2026-web", ref: "FSDE/TOR/2026/015", title: "Website Redesign and Redevelopment",
      category: "Digital services", pillar: "", type: "Terms of Reference", status: "open", published: "2026-09-25", deadline: "2026-10-16", deadlineTime: "17:00 EAT", qaDeadline: "2026-10-09",
      real: true, refIllustrative: true,
      summary: "FSD Ethiopia is seeking qualified firms to redesign and redevelop its website into a modern, secure, accessible, and user-focused digital platform.",
      scope: ["Discovery, user research and information architecture", "Design system and responsive UI design", "Development, CMS implementation and content migration", "Accessibility (WCAG 2.1 AA), security and performance", "Training, documentation and post-launch support"],
      eligibility: ["Registered firm with a valid business licence", "Portfolio of at least three comparable institutional websites", "Demonstrated accessibility and security practice", "No conflict of interest with FSD Ethiopia"],
      docs: ["Business licence (valid)", "Tax registration certificate (TIN) and tax clearance", "Technical proposal including portfolio", "Financial proposal (separate file)", "Signed declaration of eligibility and no conflict of interest"],
      evaluation: [["Technical approach and methodology", 30], ["Portfolio and relevant experience", 30], ["Team qualifications", 20], ["Financial proposal", 20]],
      downloads: [["Terms of Reference (PDF)", "0.6 MB"], ["Declaration template (DOCX)", "0.1 MB"]],
      contact: "procurement@fsdethiopia.org" },
    { id: "rfq-2026-print", ref: "FSDE/RFQ/2026/011", title: "Printing and Production of Research Publications (Framework)",
      category: "Goods and printing", pillar: "", type: "Request for Quotation", status: "closed", published: "2026-07-01", deadline: "2026-07-22", deadlineTime: "17:00 EAT", qaDeadline: "2026-07-10",
      real: false, illustrative: true,
      summary: "Illustrative closed notice, shown to demonstrate how past opportunities and award outcomes would be displayed.",
      scope: [], eligibility: [], docs: [], evaluation: [], downloads: [], contact: "procurement@fsdethiopia.org", outcome: "Awarded" },
    { id: "eoi-2026-agri", ref: "FSDE/EOI/2026/016", title: "Expression of Interest: Agricultural Finance Product Design Partners",
      category: "Consulting services", pillar: "inclusion", type: "Expression of Interest", status: "upcoming", published: "2026-10-20", deadline: "2026-11-12", deadlineTime: "17:00 EAT", qaDeadline: "2026-11-03",
      real: false, illustrative: true,
      summary: "Illustrative upcoming notice, shown to demonstrate a pre-announcement with an alert option.",
      scope: [], eligibility: [], docs: [], evaluation: [], downloads: [], contact: "procurement@fsdethiopia.org" }
  ];

  // Careers. fsdethiopia.org lists no open vacancies at the time of writing, so these are
  // illustrative roles that match FSD Ethiopia's actual team structure.
  const JOBS = [
    { id: "climate-finance-specialist", title: "Climate Finance Specialist", team: "Climate Finance", location: "Addis Ababa", contract: "Fixed term, 2 years", grade: "Specialist", deadline: "2026-10-31", posted: "2026-10-01", kind: "Vacancy", illustrative: true,
      summary: "Lead the technical work behind FSD Ethiopia's climate finance tracking, green instrument pilots and the annual Climate Finance Summit.",
      responsibilities: ["Manage the annual Landscape of Climate Finance research with partners", "Support the Ethiopian Capital Market Authority and banks on green and sustainable finance instrument pilots", "Convene the annual Climate Finance Summit and related working groups", "Contribute to results measurement for the Climate Finance pillar"],
      qualifications: ["Master's degree in finance, economics, environmental policy or related field", "At least 7 years' experience in climate finance, development finance or banking", "Experience working with regulators or capital-market institutions in East Africa", "Strong analytical writing in English; Amharic an advantage"],
      docs: ["CV (PDF, max 4 pages)", "Cover letter", "Two writing samples or publications"] },
    { id: "research-data-analyst", title: "Research & Data Analyst", team: "Development Impact", location: "Addis Ababa", contract: "Fixed term, 2 years", grade: "Officer", deadline: "2026-10-24", posted: "2026-09-29", kind: "Vacancy", illustrative: true,
      summary: "Maintain FSD Ethiopia's financial-sector indicators, support research publications and keep the public Data & Markets section accurate.",
      responsibilities: ["Collect and quality-check indicators from the National Bank of Ethiopia and partners", "Support research teams with analysis and data visualisation", "Maintain methodology notes for all published indicators"],
      qualifications: ["Bachelor's degree in statistics, economics or related field", "At least 3 years' experience in quantitative analysis", "Proficiency in Excel and at least one of R, Python or Stata"],
      docs: ["CV (PDF, max 4 pages)", "Cover letter"] },
    { id: "regional-coordinator-afar", title: "Regional Coordinator, Afar Regional State", team: "Financial Inclusion", location: "Semera", contract: "Fixed term, 1 year", grade: "Coordinator", deadline: "2026-10-17", posted: "2026-09-26", kind: "Vacancy", illustrative: true,
      summary: "Represent FSD Ethiopia in Afar, coordinating with regional government, financial service providers and community organisations.",
      responsibilities: ["Coordinate regional implementation of financial inclusion programmes", "Maintain relationships with the regional bureau of finance and local financial institutions"],
      qualifications: ["Bachelor's degree in economics, development studies or related field", "At least 5 years' experience in the region", "Fluency in Afar and Amharic"],
      docs: ["CV (PDF, max 4 pages)", "Cover letter"] },
    { id: "call-gender-consultant", title: "Call for Applications: Gender and Financial Inclusion Consultant", team: "Gender", location: "Remote / Addis Ababa", contract: "Consultancy, 40 days", grade: "Consultant", deadline: "2026-10-28", posted: "2026-10-02", kind: "Consulting", illustrative: true,
      summary: "Short-term consultancy to design a gender integration toolkit for financial service providers.",
      responsibilities: ["Review existing gender integration practice among Ethiopian FSPs", "Design and test a toolkit with two partner institutions"],
      qualifications: ["At least 8 years' experience in gender and financial inclusion", "Published work on women's financial inclusion"],
      docs: ["CV", "Technical note (max 3 pages)", "Daily rate"] }
  ];

  // Application intelligence (admin). All applicants and vendors are demonstration records.
  const ADMIN = {
    recruitment: {
      job: "climate-finance-specialist",
      criteria: [
        { k: "Relevant experience", max: 30, mandatory: true },
        { k: "Education", max: 15, mandatory: true },
        { k: "Financial-sector exposure", max: 20, mandatory: false },
        { k: "Research and writing", max: 20, mandatory: false },
        { k: "Regulatory experience in East Africa", max: 10, mandatory: true },
        { k: "Right to work in Ethiopia", max: 5, mandatory: true }
      ],
      items: [
        { id: "A-2026-0147", name: "Applicant 0147", submitted: "2026-10-04 14:22", score: 86, mandatory: "5 of 6", status: "Awaiting review", reviewer: "—",
          docs: [["CV", "PDF", "4 pp"], ["Cover letter", "PDF", "1 p"], ["Writing sample 1", "PDF", "12 pp"], ["Writing sample 2", "PDF", "8 pp"]],
          scores: [
            { pts: 25, verdict: "Strong", evidence: "Senior Climate Finance Specialist, regional development bank, 2019–2025", src: "CV, p.1", quote: "Led the climate finance tracking workstream across four country programmes and co-authored two annual landscape reports." },
            { pts: 15, verdict: "Met", evidence: "MSc Environmental Economics, 2014", src: "CV, p.3", quote: "MSc Environmental Economics (Distinction), 2014." },
            { pts: 18, verdict: "Strong", evidence: "Seven years in development finance institutions", src: "CV, p.1–2", quote: "Structured two blended-finance facilities with commercial bank partners." },
            { pts: 13, verdict: "Moderate", evidence: "Two co-authored reports; no sole-authored publication identified", src: "Writing samples", quote: "Co-author, Landscape of Climate Finance in East Africa, 2023." },
            { pts: 10, verdict: "Met", evidence: "Advisory to a central bank green taxonomy working group, 2022–2024", src: "Cover letter", quote: "Advised the green taxonomy working group convened by the central bank." },
            { pts: 0, verdict: "No evidence", evidence: "", src: "", quote: "" }
          ],
          gaps: ["No evidence identified for right to work in Ethiopia. The system did not find a nationality, residence permit or work authorisation statement in any document. This is a mandatory criterion and must be confirmed by the reviewer before shortlisting."],
          audit: [["2026-10-04 14:22", "Applicant", "Application submitted (4 documents)"], ["2026-10-04 14:23", "System", "Documents extracted; 4 of 4 readable"], ["2026-10-04 14:23", "System", "Rules check: 5 of 6 mandatory criteria met; 1 unresolved"], ["2026-10-04 14:24", "System", "AI-assisted analysis complete; score 86/100; 1 gap flagged"], ["2026-10-05 09:10", "HR Officer", "Opened for review"]] },
        { id: "A-2026-0152", name: "Applicant 0152", submitted: "2026-10-05 09:48", score: 74, mandatory: "6 of 6", status: "Shortlisted", reviewer: "HR Officer",
          docs: [["CV", "PDF", "3 pp"], ["Cover letter", "PDF", "1 p"], ["Writing sample 1", "PDF", "20 pp"], ["Writing sample 2", "PDF", "6 pp"]],
          scores: [
            { pts: 20, verdict: "Met", evidence: "Climate programme manager, international NGO, 2018–2026", src: "CV, p.1", quote: "Managed a USD 12m adaptation finance portfolio across three regions." },
            { pts: 15, verdict: "Met", evidence: "MA Development Economics, 2016", src: "CV, p.2", quote: "" },
            { pts: 12, verdict: "Moderate", evidence: "Grant finance only; no banking or capital-market exposure identified", src: "CV", quote: "" },
            { pts: 14, verdict: "Met", evidence: "Sole-authored policy brief on adaptation finance, 2024", src: "Writing sample 1", quote: "" },
            { pts: 8, verdict: "Met", evidence: "Worked with regional bureaux of finance in Ethiopia", src: "Cover letter", quote: "" },
            { pts: 5, verdict: "Met", evidence: "Ethiopian national", src: "CV, p.1", quote: "" }
          ],
          gaps: ["Financial-sector exposure is limited to grant management. Not a mandatory criterion; flagged for interview questions."],
          audit: [["2026-10-05 09:48", "Applicant", "Application submitted"], ["2026-10-05 09:49", "System", "Rules check: 6 of 6 mandatory criteria met"], ["2026-10-05 09:50", "System", "AI-assisted analysis complete; score 74/100"], ["2026-10-05 15:30", "HR Officer", "Reviewed; shortlisted. Rationale: all mandatory criteria met; strong Ethiopia field experience."]] },
        { id: "A-2026-0139", name: "Applicant 0139", submitted: "2026-10-02 18:05", score: 58, mandatory: "4 of 6", status: "Awaiting review", reviewer: "—",
          docs: [["CV", "PDF", "6 pp"], ["Cover letter", "DOCX", "2 pp"]],
          scores: [
            { pts: 14, verdict: "Moderate", evidence: "Banking operations roles, 2012–2026; limited climate content", src: "CV", quote: "" },
            { pts: 15, verdict: "Met", evidence: "MBA, 2011", src: "CV", quote: "" },
            { pts: 18, verdict: "Strong", evidence: "Fourteen years in commercial banking", src: "CV", quote: "" },
            { pts: 6, verdict: "Weak", evidence: "No writing samples submitted (required)", src: "", quote: "" },
            { pts: 0, verdict: "No evidence", evidence: "", src: "", quote: "" },
            { pts: 5, verdict: "Met", evidence: "Ethiopian national", src: "CV", quote: "" }
          ],
          gaps: ["Required writing samples not submitted.", "No evidence identified for regulatory experience in East Africa (mandatory)."],
          audit: [["2026-10-02 18:05", "Applicant", "Application submitted (2 documents)"], ["2026-10-02 18:06", "System", "Rules check: 4 of 6 mandatory criteria met; required documents missing"], ["2026-10-02 18:06", "System", "AI-assisted analysis complete; score 58/100; 2 gaps flagged"]] },
        { id: "A-2026-0161", name: "Applicant 0161", submitted: "2026-10-06 08:12", score: null, mandatory: "—", status: "Processing", reviewer: "—", docs: [["CV", "PDF", "5 pp"], ["Cover letter", "PDF", "1 p"], ["Writing sample 1", "PDF", "30 pp"]], scores: [], gaps: [], audit: [["2026-10-06 08:12", "Applicant", "Application submitted"], ["2026-10-06 08:12", "System", "Document extraction in progress"]] }
      ]
    },
    procurement: {
      tender: "rfp-2026-ir",
      criteria: [
        { k: "Technical approach and methodology", max: 35, mandatory: false },
        { k: "Relevant experience of the firm", max: 25, mandatory: false },
        { k: "Qualifications of key personnel", max: 20, mandatory: false },
        { k: "Financial proposal", max: 20, mandatory: false },
        { k: "Valid business licence and tax documents", max: 0, mandatory: true },
        { k: "Signed declaration", max: 0, mandatory: true }
      ],
      items: [
        { id: "V-2026-014-03", name: "Vendor 03 (consortium)", submitted: "2026-10-05 16:40", score: 81, mandatory: "2 of 2", status: "Awaiting review", reviewer: "—",
          docs: [["Business licence", "PDF", "2 pp"], ["TIN & tax clearance", "PDF", "3 pp"], ["Technical proposal", "PDF", "42 pp"], ["Financial proposal", "PDF", "4 pp"], ["Signed declaration", "PDF", "1 p"], ["Team CVs", "PDF", "18 pp"]],
          scores: [
            { pts: 29, verdict: "Strong", evidence: "Methodology covers all four scope areas; includes ECMA disclosure template mapping", src: "Technical proposal, §3", quote: "We propose a three-phase approach: diagnostic, toolkit development, and institutionalisation with ECMA." },
            { pts: 19, verdict: "Met", evidence: "Investor relations advisory for two frontier-market exchanges, 2019–2025", src: "Technical proposal, §5", quote: "" },
            { pts: 16, verdict: "Met", evidence: "Team lead: 14 years' capital-markets advisory", src: "Team CVs, p.1", quote: "" },
            { pts: 17, verdict: "Opened after technical", evidence: "Financial proposal sealed until technical scoring is complete", src: "", quote: "" },
            { pts: 0, verdict: "Met", evidence: "Licence valid to 2027; tax clearance dated Sept 2026", src: "Business licence; TIN", quote: "" },
            { pts: 0, verdict: "Met", evidence: "Declaration signed by authorised representative", src: "Signed declaration", quote: "" }
          ],
          gaps: ["Consortium agreement referenced in the technical proposal but not attached. Reviewer should request it before scoring is finalised."],
          audit: [["2026-10-05 16:40", "Vendor", "Submission received (6 documents)"], ["2026-10-05 16:41", "System", "Mandatory document check: 2 of 2 met"], ["2026-10-05 16:43", "System", "AI-assisted analysis complete; technical score 81; 1 gap flagged"]] },
        { id: "V-2026-014-01", name: "Vendor 01", submitted: "2026-10-03 11:15", score: 66, mandatory: "1 of 2", status: "Clarification requested", reviewer: "Procurement Officer",
          docs: [["Business licence", "PDF", "1 p"], ["Technical proposal", "PDF", "25 pp"], ["Financial proposal", "PDF", "2 pp"], ["Signed declaration", "PDF", "1 p"]],
          scores: [
            { pts: 22, verdict: "Moderate", evidence: "Methodology addresses tools and training; ESG communication not covered", src: "Technical proposal", quote: "" },
            { pts: 16, verdict: "Moderate", evidence: "Corporate communications experience; limited capital-markets work", src: "Technical proposal", quote: "" },
            { pts: 12, verdict: "Moderate", evidence: "Team lead: 8 years (requirement: 10)", src: "Technical proposal, annex", quote: "" },
            { pts: 16, verdict: "Opened after technical", evidence: "", src: "", quote: "" },
            { pts: 0, verdict: "Not met", evidence: "Tax clearance certificate not found", src: "", quote: "" },
            { pts: 0, verdict: "Met", evidence: "", src: "Signed declaration", quote: "" }
          ],
          gaps: ["Tax clearance certificate missing (mandatory). Clarification requested 2026-10-04; response due 2026-10-08.", "Team lead experience below the 10-year requirement stated in the ToR."],
          audit: [["2026-10-03 11:15", "Vendor", "Submission received (4 documents)"], ["2026-10-03 11:16", "System", "Mandatory document check: 1 of 2 met"], ["2026-10-04 10:02", "Procurement Officer", "Clarification requested: tax clearance certificate"]] },
        { id: "V-2026-014-02", name: "Vendor 02", submitted: "2026-10-04 09:30", score: 73, mandatory: "2 of 2", status: "Awaiting review", reviewer: "—",
          docs: [["Business licence", "PDF", "1 p"], ["TIN & tax clearance", "PDF", "2 pp"], ["Technical proposal", "PDF", "31 pp"], ["Financial proposal", "PDF", "3 pp"], ["Signed declaration", "PDF", "1 p"]],
          scores: [
            { pts: 25, verdict: "Met", evidence: "Covers scope; light on market-wide mechanisms", src: "Technical proposal", quote: "" },
            { pts: 18, verdict: "Met", evidence: "IR advisory for listed companies in two African markets", src: "Technical proposal", quote: "" },
            { pts: 14, verdict: "Met", evidence: "Team lead: 11 years", src: "Technical proposal, annex", quote: "" },
            { pts: 16, verdict: "Opened after technical", evidence: "", src: "", quote: "" },
            { pts: 0, verdict: "Met", evidence: "", src: "Business licence; TIN", quote: "" },
            { pts: 0, verdict: "Met", evidence: "", src: "Signed declaration", quote: "" }
          ],
          gaps: [],
          audit: [["2026-10-04 09:30", "Vendor", "Submission received (5 documents)"], ["2026-10-04 09:31", "System", "Mandatory document check: 2 of 2 met"], ["2026-10-04 09:33", "System", "AI-assisted analysis complete; technical score 73"]] }
      ]
    }
  };

  // Impact & results. Programmes are real; outcome figures are placeholders unless sourced.
  const IMPACT = [
    { outcome: "More women prepared for board roles in Ethiopia's financial institutions",
      intervention: "Board Ready Women programme, a corporate governance training for female professionals aspiring to board membership, delivered with IFC over three rounds.",
      evidence: [{ t: "Three cohorts completed", ok: true, src: "FSD Ethiopia, Board Ready Program" }, { t: "— participants trained; — appointed to boards within 12 months", ok: false, src: "Placeholder for approved programme figures" }],
      related: { pub: "women-capital-markets-2025", news: "gender-market-systems" }, pillar: "inclusion" },
    { outcome: "An insurance sector that can innovate for underserved households",
      intervention: "BimaLab Insurtech Accelerator, launched December 2023 to foster innovation in Ethiopia's insurance sector, closing with a demo day in March 2024.",
      evidence: [{ t: "Accelerator cohort completed with demo day showcase, March 2024", ok: true, src: "FSD Ethiopia press release" }, { t: "— start-ups supported; — pilots with licensed insurers", ok: false, src: "Placeholder for approved programme figures" }],
      related: { news: "insurance-reform" }, pillar: "inclusion" },
    { outcome: "Climate finance that can be tracked, so capital can be directed to NDC priorities",
      intervention: "Annual Landscape of Climate Finance research with Climate Policy Initiative, and two Climate Finance Summits in Addis Ababa.",
      evidence: [{ t: "First national climate finance landscape published, April 2026", ok: true, src: "Resource Center" }, { t: "Nearly 200 participants at the second summit, March 2026", ok: true, src: "FSD Ethiopia, Our Events" }, { t: "USD — mobilised toward green instruments", ok: false, src: "Placeholder for approved figure" }],
      related: { pub: "climate-landscape-2026", news: "climate-summit-2026" }, pillar: "climate" },
    { outcome: "A national plan for financing agriculture that lenders and regulators act on",
      intervention: "National Agricultural Finance Implementation Roadmap (2025–2030), sequencing policy, product and infrastructure actions.",
      evidence: [{ t: "Roadmap published, 2025", ok: true, src: "Resource Center" }, { t: "— roadmap actions adopted by partner institutions", ok: false, src: "Placeholder for approved figure" }],
      related: { pub: "nafir-2025" }, pillar: "inclusion" },
    { outcome: "Cash-in cash-out agents where people actually live",
      intervention: "Agent network mapping strategy with the National Bank of Ethiopia, identifying and supporting viable agent business cases.",
      evidence: [{ t: "Strategy published with the National Bank of Ethiopia, 2025", ok: true, src: "Resource Center" }, { t: "— agents mapped; — new agent locations in underserved woredas", ok: false, src: "Placeholder for approved figure" }],
      related: { pub: "agent-network-2025", news: "open-finance" }, pillar: "inclusion" }
  ];

  const CONTACT_ROUTES = {
    research: { label: "Research and data", who: "Development Impact team", hint: "Questions about a publication, a dataset or a methodology note. Include the title or indicator you are asking about.", email: "comms@fsdethiopia.org", sla: "We aim to reply within five working days.", fields: ["publication"] },
    media: { label: "Media", who: "Communications & Advocacy", hint: "Interview requests, statistics checks and comment. Tell us your outlet and deadline.", email: "comms@fsdethiopia.org", sla: "Same-day acknowledgement on working days.", fields: ["outlet", "deadline"] },
    partnership: { label: "Partnerships", who: "Office of the CEO", hint: "Proposals from financial institutions, government bodies and development partners.", email: "comms@fsdethiopia.org", sla: "We aim to reply within ten working days.", fields: ["organisation"] },
    procurement: { label: "Procurement", who: "Procurement office", hint: "Clarifications on an open tender must be sent before the published Q&A deadline. Quote the tender reference.", email: "procurement@fsdethiopia.org", sla: "Answers to clarification questions are published to all bidders.", fields: ["tender"], illustrativeEmail: true },
    careers: { label: "Careers", who: "HR & Administration", hint: "Questions about a vacancy or an application you have submitted. Quote your application reference.", email: "careers@fsdethiopia.org", sla: "We aim to reply within five working days.", fields: ["appref"], illustrativeEmail: true },
    general: { label: "General", who: "Front office", hint: "Anything else.", email: "comms@fsdethiopia.org", sla: "", fields: [] }
  };

  return { PILLARS, TOPICS, TYPES, PUBS, REPORT, NEWS, STATS, PEOPLE, BOARD, FUNDERS, NETWORK, TENDERS, JOBS, ADMIN, IMPACT, CONTACT_ROUTES,
    OFFICE: { phone: "+251 9 93969696", email: "comms@fsdethiopia.org", hours: "Mon–Fri 8:30–17:00 EAT", city: "Addis Ababa, Ethiopia" } };
})();
