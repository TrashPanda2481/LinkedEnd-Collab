/* data.js — LinkedEnd seeded mock dataset + storage helpers.
   Client-side only. Session state lives in memory for the app's lifetime (single-page
   app, no full reloads) — real browser storage (localStorage/cookies) is intentionally
   never used since the sandboxed preview iframe blocks it. All data is fictional/seeded
   for prototype purposes. */

(function (global) {
  'use strict';

  // ---------- Skill level thresholds (vouch count -> level) ----------
  const SKILL_LEVELS = [
    { name: 'Novice', min: 0 },
    { name: 'Skilled', min: 5 },
    { name: 'Expert', min: 12 },
    { name: 'Master', min: 20 },
  ];

  function levelForVouches(count) {
    let current = SKILL_LEVELS[0];
    let next = SKILL_LEVELS[1];
    for (let i = 0; i < SKILL_LEVELS.length; i++) {
      if (count >= SKILL_LEVELS[i].min) {
        current = SKILL_LEVELS[i];
        next = SKILL_LEVELS[i + 1] || null;
      }
    }
    const toNext = next ? Math.max(next.min - count, 0) : 0;
    const span = next ? next.min - current.min : 1;
    const progressed = next ? count - current.min : span;
    const pct = next ? Math.min(100, Math.round((progressed / span) * 100)) : 100;
    return { levelName: current.name, next: next ? next.name : null, toNext, pct };
  }

  // ---------- Closeness tiers (Dunbar layers) ----------
  const TIERS = [
    { id: 'inner', label: 'Inner Circle', cap: 5, blurb: 'up to 5 · precise zone, full inventory, standing comms' },
    { id: 'trusted', label: 'Trusted Circle', cap: 15, blurb: 'up to 15 · general zone, full skills, limited inventory' },
    { id: 'camp', label: 'Camp / Band', cap: 50, blurb: 'up to 50 · full Dossier, no location or inventory' },
    { id: 'network', label: 'Network', cap: 150, blurb: 'up to 150 · standard profile — default on Alliance' },
    { id: 'recon', label: 'Recon', cap: null, blurb: 'not allied · minimal public view only' },
  ];
  const TIER_ORDER = ['inner', 'trusted', 'camp', 'network', 'recon'];

  function tierInfo(id) {
    return TIERS.find((t) => t.id === id) || TIERS[TIERS.length - 1];
  }

  // ---------- Capability tag universe (bring / need) ----------
  const CAPABILITY_TAGS = [
    'has a well', 'knows which mushrooms kill you', 'veterinarian, mostly', 'makes excellent soup',
    'can sharpen anything', 'field medic training', 'can weld', 'keeps bees', 'runs a ham radio',
    'can hotwire almost anything', 'fluent in three languages', 'former electrician', 'good with a bow',
    'knows basic dentistry', 'can purify water', 'grows food in bad soil', 'can fix small engines',
    'knows knots that matter', 'trained in CPR', 'raises chickens', 'can read a map without GPS',
    'skilled forager', 'butchers cleanly', 'sews and mends', 'night-shift alert sleeper',
    'can build a smokehouse', 'knows local wildlife', 'carpentry, rough but solid',
    'stockpiled antibiotics (rationed)', 'can read weather', 'plays music (morale matters)',
    'trained in de-escalation', 'former nurse', 'knows the old sewer maps', 'can distill',
    'tans hides', 'keeps goats', 'gunsmith, licensed once', 'solar panel tinkerer', 'midwife training',
  ];

  const NEED_TAGS = [
    'needs insulin', 'needs a generator', 'needs antibiotics', 'needs winter boots',
    'needs a working radio', 'needs seed stock', 'needs a ride north', 'needs baby formula',
    'needs fuel', 'needs a dentist', 'needs water filters', 'needs batteries',
    'needs a splint kit', 'needs reading glasses', 'needs rope', 'needs a tarp',
    'needs someone who can weld', 'needs insulin storage (cold)', 'needs a translator',
    'needs a second set of hands', 'needs firewood', 'needs a working stove',
  ];

  // ---------- Inventory item catalog ----------
  const INVENTORY_ICONS = {
    'Water filter': '💧', 'Generator': '⚡', 'Seed bank': '🌱', 'First aid kit': '🩹',
    'Solar panel': '☀️', 'Hand-crank radio': '📻', 'Fuel canister': '⛽', 'Rope, 50ft': '🪢',
    'Fishing kit': '🎣', 'Tarp': '⛺', 'Antibiotics (rationed)': '💊', 'Batteries': '🔋',
    'Hand tools set': '🔧', 'Canned goods (crate)': '🥫', 'Winter tarp bundle': '🧣',
    'Water purification tabs': '🧪', 'Machete': '🔪', 'Bow + arrows': '🏹', 'Wood stove': '🔥',
    'Rain barrel': '🛢️', 'Sewing kit': '🧵', 'Snare wire': '🪤',
  };

  // ---------- Seeded survivor accounts ----------
  const AVATAR_PALETTES = [
    ['#ff7a28', '#0d1410'], ['#a8d8ae', '#090e0a'], ['#ffb347', '#0d1410'],
    ['#7fd88a', '#090e0a'], ['#ff6b5e', '#0d1410'], ['#dce8dd', '#0d1410'],
  ];

  function makeAvatarSVG(seed, palette) {
    // Deterministic abstract mark: rings + a shard, colored from palette. No photos, ever.
    const [fg, bg] = palette;
    const angle = (seed * 47) % 360;
    const r1 = 30 + (seed % 7) * 2;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="avatar mark">
      <rect width="100" height="100" fill="${bg}"/>
      <g transform="rotate(${angle} 50 50)">
        <circle cx="50" cy="50" r="${r1}" fill="none" stroke="${fg}" stroke-width="3" stroke-dasharray="6 5"/>
        <polygon points="50,20 62,50 50,80 38,50" fill="${fg}" opacity="0.85"/>
        <circle cx="50" cy="50" r="6" fill="${bg}"/>
      </g>
    </svg>`;
  }

  function svgDataUri(svg) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function avatarFor(seed) {
    const palette = AVATAR_PALETTES[seed % AVATAR_PALETTES.length];
    return svgDataUri(makeAvatarSVG(seed, palette));
  }

  // Each survivor: id, callsign, avatarSeed, zone (vague), bio, skills[{tag, vouches:[callsigns]}], needs[tags], inventory[{name,qty}]
  const SURVIVORS_RAW = [
    { callsign: 'Ash_Warden', zone: 'Zone 7 — Riverside', bio: 'Ran the old water treatment plant before everything went sideways. Still do, unofficially. Ask me about the reservoir.', skills: [['can purify water', 18], ['knows the old sewer maps', 9], ['trained in CPR', 6]], needs: ['needs batteries', 'needs a working radio'], inv: [['Water filter', 4], ['Water purification tabs', 12], ['Hand tools set', 1]] },
    { callsign: 'Foxglove_Rae', zone: 'Zone 3 — Old Mill District', bio: 'Botanist by training, forager by necessity. I will absolutely tell you if that mushroom will kill you.', skills: [['knows which mushrooms kill you', 22], ['skilled forager', 14], ['grows food in bad soil', 8]], needs: ['needs seed stock', 'needs rope'], inv: [['Seed bank', 3], ['Fishing kit', 1]] },
    { callsign: 'Grit_and_Gauze', zone: 'Zone 3 — Old Mill District', bio: 'Field medic, two tours before, now just the neighborhood. No judgment, no charts, just help.', skills: [['field medic training', 25], ['knows basic dentistry', 6], ['trained in CPR', 15]], needs: ['needs antibiotics', 'needs a splint kit'], inv: [['First aid kit', 5], ['Antibiotics (rationed)', 2]] },
    { callsign: 'Copper_Wren', zone: 'Zone 12 — Substation Row', bio: 'Electrician for 19 years. I keep the lights on for whoever needs them, in whatever order is fair.', skills: [['former electrician', 20], ['solar panel tinkerer', 13], ['can fix small engines', 7]], needs: ['needs a generator', 'needs fuel'], inv: [['Solar panel', 2], ['Batteries', 20]] },
    { callsign: 'Sable_Quorum', zone: 'Zone 1 — Uptown Ruins', bio: 'Ham radio since I was a kid. If it happened within 40 miles, I probably heard it first.', skills: [['runs a ham radio', 17], ['can read weather', 10], ['fluent in three languages', 5]], needs: ['needs a working radio', 'needs a ride north'], inv: [['Hand-crank radio', 3]] },
    { callsign: 'Nine_Tin_Cans', zone: 'Zone 7 — Riverside', bio: 'Welder. Also, apparently, the person everyone calls when a lock needs to stop being a lock.', skills: [['can weld', 19], ['can hotwire almost anything', 11], ['carpentry, rough but solid', 6]], needs: ['needs fuel', 'needs winter boots'], inv: [['Hand tools set', 2], ['Machete', 1]] },
    { callsign: 'Marrow_Jo', zone: 'Zone 9 — East Fields', bio: 'Vet tech, mostly cattle, now mostly whatever walks in the door with fur on it. Occasionally people, don\u2019t tell anyone.', skills: [['veterinarian, mostly', 16], ['knows basic dentistry', 4], ['midwife training', 3]], needs: ['needs antibiotics', 'needs reading glasses'], inv: [['First aid kit', 2]] },
    { callsign: 'Barleycorn', zone: 'Zone 9 — East Fields', bio: 'Soup. That\u2019s it. That\u2019s the whole bio. Ask anyone in Zone 9, the soup is real and it is good.', skills: [['makes excellent soup', 24], ['keeps chickens', 9], ['grows food in bad soil', 12]], needs: ['needs firewood', 'needs a working stove'], inv: [['Canned goods (crate)', 6], ['Rain barrel', 1]] },
    { callsign: 'Whetstone_Lira', zone: 'Zone 1 — Uptown Ruins', bio: 'I can sharpen anything. Knives, axes, your outlook on the week. Bring me your dull things.', skills: [['can sharpen anything', 21], ['bow and arrows', 5], ['knows knots that matter', 8]], needs: ['needs winter boots', 'needs a second set of hands'], inv: [['Bow + arrows', 1], ['Snare wire', 10]] },
    { callsign: 'Quiet_Halyard', zone: 'Zone 12 — Substation Row', bio: 'Night-shift alert sleeper — I hear things other people sleep through. Zone 7 Night Watch, most nights.', skills: [['night-shift alert sleeper', 13], ['trained in de-escalation', 9], ['can read a map without GPS', 7]], needs: ['needs a working radio', 'needs batteries'], inv: [['Rope, 50ft', 4]] },
    { callsign: 'Dovetail_Mo', zone: 'Zone 3 — Old Mill District', bio: 'Rough carpentry, solid results. If it needs to hold weight, I can probably build it or fix it.', skills: [['carpentry, rough but solid', 15], ['can fix small engines', 6], ['knows knots that matter', 5]], needs: ['needs rope', 'needs hand tools'], inv: [['Tarp', 3], ['Hand tools set', 1]] },
    { callsign: 'Hollow_Pines', zone: 'Zone 9 — East Fields', bio: 'Tan hides, keep goats, mostly self-sufficient and happy to teach anyone patient enough to learn.', skills: [['tans hides', 12], ['keeps goats', 14], ['sews and mends', 8]], needs: ['needs a translator', 'needs baby formula'], inv: [['Winter tarp bundle', 2]] },
    { callsign: 'Static_Ember', zone: 'Zone 1 — Uptown Ruins', bio: 'Former nurse, current everything-medical-adjacent. Bring me your fevers, I\u2019ll bring the cool cloths.', skills: [['former nurse', 23], ['midwife training', 10], ['trained in CPR', 18]], needs: ['needs insulin', 'needs insulin storage (cold)'], inv: [['First aid kit', 3], ['Antibiotics (rationed)', 1]] },
    { callsign: 'Rustcap_Dinah', zone: 'Zone 12 — Substation Row', bio: 'Licensed gunsmith once, now mostly fix things that go click when they shouldn\u2019t and things that should go click and don\u2019t.', skills: [['gunsmith, licensed once', 11], ['can weld', 7], ['can fix small engines', 9]], needs: ['needs fuel', 'needs a dentist'], inv: [['Hand tools set', 2]] },
    { callsign: 'Loam_and_Antler', zone: 'Zone 9 — East Fields', bio: 'Distiller — water purification and, yes, the other kind too. Priorities depend on the week.', skills: [['can distill', 16], ['knows local wildlife', 10], ['skilled forager', 6]], needs: ['needs a ride north', 'needs firewood'], inv: [['Water purification tabs', 8]] },
  ];

  function buildSurvivors() {
    return SURVIVORS_RAW.map((s, i) => ({
      id: 'sv_' + (i + 1),
      callsign: s.callsign,
      avatarSeed: i + 3,
      zone: s.zone,
      bio: s.bio,
      skills: s.skills.map(([tag, count]) => ({ tag, vouchCount: count, vouchers: sampleVouchers(count, i) })),
      needs: s.needs,
      inventory: s.inv.map(([name, qty]) => ({ name, qty, icon: INVENTORY_ICONS[name] || '📦' })),
    }));
  }

  function sampleVouchers(count, excludeIdx) {
    const names = SURVIVORS_RAW.map((s) => s.callsign).filter((_, idx) => idx !== excludeIdx);
    const shown = Math.min(count, 6);
    const out = [];
    for (let i = 0; i < shown; i++) {
      out.push(names[(excludeIdx + i * 3 + 1) % names.length]);
    }
    return out;
  }

  const SURVIVORS = buildSurvivors();

  function survivorById(id) {
    return SURVIVORS.find((s) => s.id === id);
  }

  // ---------- Seeded dispatches (The Wire) ----------
  const DISPATCH_TEMPLATES = [
    { authorIdx: 0, type: 'offer', text: 'Reservoir\u2019s holding steady this week. Running purification tabs low, but the well is producing clean. Anyone in Zone 7 needing water, come by before dusk — I\u2019m not doing night hand-offs anymore, learned that the hard way.', tags: ['can purify water'], vouches: 34, comments: 6 },
    { authorIdx: 1, type: 'warning', text: 'PSA: the white-gilled mushrooms growing behind the old mill are NOT the ones from last month\u2019s batch. Different cap shape, same size. If you foraged there this week, do not eat them. I\u2019ll post a photo comparison once I find someone with a working camera.', tags: ['knows which mushrooms kill you'], vouches: 61, comments: 14 },
    { authorIdx: 2, type: 'ask', text: 'Running low on antibiotics for the clinic. Rationing hard already. If anyone has any stashed, even expired, bring it in — expired beats none for most of what I\u2019m treating right now.', tags: [], needs: ['needs antibiotics'], vouches: 22, comments: 9 },
    { authorIdx: 3, type: 'offer', text: 'Got two solar panels wired into a shared bank behind Substation Row. If your place is within cable-reach, I can add you to the charging rotation. First come, first slot, no favorites.', tags: ['solar panel tinkerer'], vouches: 40, comments: 11 },
    { authorIdx: 4, type: 'offer', text: 'Picked up chatter last night from what sounded like a relief convoy near the old highway junction, about 40 miles out. Could be nothing. Could be something. Keeping the radio on.', tags: ['runs a ham radio'], vouches: 55, comments: 21 },
    { authorIdx: 6, type: 'ask', text: 'Dog came in yesterday, bad leg, not mine, no owner. Doing what I can but I\u2019m not really equipped for surgery. If anyone with actual vet training is near Zone 9, please reach out.', tags: ['veterinarian, mostly'], vouches: 19, comments: 5 },
    { authorIdx: 7, type: 'offer', text: 'Soup\u2019s on. Root vegetable and whatever\u2019s left of the canned tomatoes. Bring a container, take what you need, leave what you can. That\u2019s the whole system and it still works.', tags: ['makes excellent soup'], vouches: 47, comments: 8 },
    { authorIdx: 8, type: 'offer', text: 'Sharpening station is open all week. Knives, axes, machetes, your grandmother\u2019s garden shears, doesn\u2019t matter. Bring dull things, leave with sharp things.', tags: ['can sharpen anything'], vouches: 29, comments: 4 },
    { authorIdx: 9, type: 'warning', text: 'Heads up to Zone 7 Night Watch — noticed the fence gap near the old loading dock again. Patched it temporary but it needs real materials. Flagging for whoever\u2019s got welding gear.', tags: ['night-shift alert sleeper'], vouches: 26, comments: 7 },
    { authorIdx: 11, type: 'offer', text: 'Goat milk is in this week, more than I need. Also have hides tanning if anyone wants leather for boot repairs before it gets cold. Barter or just ask, I\u2019m flexible.', tags: ['keeps goats', 'tans hides'], vouches: 18, comments: 3 },
    { authorIdx: 12, type: 'ask', text: 'Need insulin, specifically need a cold storage solution for it more than the insulin itself right now. If anyone has a working fridge or reliable ice source, please send Comms.', tags: [], needs: ['needs insulin', 'needs insulin storage (cold)'], vouches: 38, comments: 16 },
    { authorIdx: 13, type: 'offer', text: 'Fixed three jammed rifles and a chainsaw this week. If it clicks when it shouldn\u2019t or doesn\u2019t click when it should, I\u2019m your person. Zone 12, ask around for me.', tags: ['gunsmith, licensed once', 'can fix small engines'], vouches: 15, comments: 2 },
    { authorIdx: 5, type: 'offer', text: 'Welded a proper gate hinge for the east fence line today. If your enclave needs metalwork, I\u2019m taking requests through the end of the month before materials run low.', tags: ['can weld'], vouches: 24, comments: 5 },
    { authorIdx: 14, type: 'offer', text: 'Distilled another batch of clean water, plus the usual. Trading both. Zone 9, you know where to find me. Bring containers.', tags: ['can distill'], vouches: 21, comments: 4 },
    { authorIdx: 10, type: 'ask', text: 'Looking for anyone with spare rope or paracord — rebuilding a rope bridge crossing near the old mill that washed out. Every foot helps.', tags: [], needs: ['needs rope'], vouches: 12, comments: 3 },
  ];

  function buildDispatches() {
    const now = Date.now();
    return DISPATCH_TEMPLATES.map((t, i) => {
      const author = SURVIVORS[t.authorIdx];
      return {
        id: 'dp_' + (i + 1),
        authorId: author.id,
        authorCallsign: author.callsign,
        authorAvatarSeed: author.avatarSeed,
        type: t.type,
        text: t.text,
        tags: t.tags || [],
        needs: t.needs || [],
        vouchCount: t.vouches,
        commentCount: t.comments,
        comments: seedComments(i, t.comments),
        minutesAgo: 6 + i * 37,
        createdAt: now - (6 + i * 37) * 60000,
      };
    }).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  }

  function seedComments(seed, count) {
    const pool = [
      'On my way, thank you for posting this.',
      'Sending Comms — don\u2019t want to put details here.',
      'This is why this network matters. Vouched.',
      'Can confirm, saw the same thing yesterday.',
      'Appreciate you. Zone 7 owes you a debt.',
      'Careful out there, take someone with you.',
      'Added to the Enclave board so more people see it.',
      'I might have a lead on this, sending Comms now.',
    ];
    const shown = Math.min(count, 3);
    const out = [];
    for (let i = 0; i < shown; i++) {
      const survivor = SURVIVORS[(seed + i * 5 + 2) % SURVIVORS.length];
      out.push({ callsign: survivor.callsign, avatarSeed: survivor.avatarSeed, text: pool[(seed + i) % pool.length] });
    }
    return out;
  }

  const DISPATCHES = buildDispatches();

  // ---------- Enclaves ----------
  const ENCLAVES = [
    { id: 'en_1', name: 'Water & Filtration', desc: 'Keeping taps running and reservoirs clean across every zone. Purification know-how, filter swaps, well maintenance.', members: 214, tags: ['can purify water', 'has a well'], dispatches: [
      { authorIdx: 0, text: 'Reservoir levels updated on the board at the pump house. We\u2019re in decent shape through the month if usage stays steady.', minutesAgo: 40 },
      { authorIdx: 14, text: 'Distillation rig #2 is back online after the valve repair. Can take on more volume starting this week.', minutesAgo: 190 },
    ] },
    { id: 'en_2', name: 'Zone 7 Night Watch', desc: 'Overnight patrol and perimeter checks for Riverside and the surrounding blocks. Alert sleepers welcome, no experience required to start.', members: 58, tags: ['night-shift alert sleeper', 'trained in de-escalation'], dispatches: [
      { authorIdx: 9, text: 'Fence gap near the loading dock patched temporary. Needs someone with welding gear for a permanent fix — flagged in The Wire too.', minutesAgo: 25 },
      { authorIdx: 4, text: 'Quiet night. Logged one stray dog, no incidents. Handoff notes in the usual spot.', minutesAgo: 500 },
    ] },
    { id: 'en_3', name: 'Foragers Guild', desc: 'Safe foraging routes, plant ID help, and seasonal maps of what\u2019s edible where. We will absolutely tell you if it\u2019ll kill you.', members: 132, tags: ['skilled forager', 'knows which mushrooms kill you'], dispatches: [
      { authorIdx: 1, text: 'Updated the mushroom ID sheet with photos comparing this month\u2019s safe batch vs. the lookalikes near the mill. Ask for a copy.', minutesAgo: 60 },
    ] },
    { id: 'en_4', name: 'Clinic Collective', desc: 'Field medics, former nurses, vets, and anyone who can hold a suture steady. Rationed supplies, shared knowledge, no charts kept on anyone.', members: 89, tags: ['field medic training', 'former nurse'], dispatches: [
      { authorIdx: 2, text: 'Antibiotic stock critically low across all three clinic points. Please read the ask in The Wire if you have any stashed.', minutesAgo: 15 },
      { authorIdx: 12, text: 'Cold storage solution found for one insulin case, still need more capacity for others. Progress, not solved.', minutesAgo: 300 },
    ] },
    { id: 'en_5', name: 'Substation Row Power Co-op', desc: 'Solar, generators, and anyone who understands a wiring diagram. We keep what lights remain, lit.', members: 71, tags: ['former electrician', 'solar panel tinkerer'], dispatches: [
      { authorIdx: 3, text: 'Charging rotation sign-up sheet is at the substation gate. First come first slot, still holding.', minutesAgo: 90 },
    ] },
    { id: 'en_6', name: 'East Fields Growers', desc: 'Food, livestock, and soil that refuses to cooperate. Chickens, goats, root vegetables, and the occasional miracle soup.', members: 103, tags: ['grows food in bad soil', 'makes excellent soup'], dispatches: [
      { authorIdx: 7, text: 'Soup\u2019s on again this week, same as always. Bring a container.', minutesAgo: 20 },
      { authorIdx: 11, text: 'Extra goat milk and tanning hides available, barter welcome.', minutesAgo: 240 },
    ] },
  ];

  // ---------- Comms threads ----------
  const COMMS_THREADS_RAW = [
    { withIdx: 4, unread: 2, messages: [
      { from: 'them', text: 'Heard you\u2019re near Zone 1. That convoy chatter I posted — you get anything on your end?', minutesAgo: 300 },
      { from: 'me', text: 'Nothing yet, radio\u2019s been quiet. Will keep you posted if that changes.', minutesAgo: 290 },
      { from: 'them', text: 'Appreciated. Also — still owe you for the battery swap last month, want to settle up?', minutesAgo: 20, burn: true },
    ] },
    { withIdx: 2, unread: 0, messages: [
      { from: 'me', text: 'Saw your ask about antibiotics. I don\u2019t have any but I know someone who might. Sending them your way if that\u2019s alright.', minutesAgo: 1400 },
      { from: 'them', text: 'Yes, please, absolutely. Thank you for thinking of it.', minutesAgo: 1390 },
    ] },
    { withIdx: 8, unread: 1, messages: [
      { from: 'them', text: 'Bringing you three knives and an axe tomorrow if the sharpening station\u2019s still open.', minutesAgo: 60, burn: false },
    ] },
    { withIdx: 9, unread: 0, messages: [
      { from: 'me', text: 'You still up for Zone 7 Night Watch this week? Heard some noise near the old depot.', minutesAgo: 5000 },
      { from: 'them', text: 'Yeah, I\u2019ve got it covered. If it gets loud again I\u2019ll send word over Comms, not the Wire.', minutesAgo: 4990 },
    ] },
  ];

  // ---------- Capability tag pools for onboarding picker (bring + need) ----------
  const ONBOARDING_BRING_TAGS = CAPABILITY_TAGS;
  const ONBOARDING_NEED_TAGS = NEED_TAGS;

  // ================= Session / storage layer =================
  // NOTE: sites are served in sandboxed iframes where localStorage/sessionStorage
  // throw and crash the page. LinkedEnd is built as a single-page app (one document,
  // JS-driven view switching, no full navigations) specifically so an in-memory JS
  // object can serve as "session state" for the whole app lifetime — it never needs
  // to survive a hard refresh, matching the spec. "Panic Wipe" resets this in-memory
  // object and re-renders the logged-out state, mirroring a real client-side wipe,
  // without ever touching real browser storage.
  const MEM = { session: null };

  function loadSession() {
    return MEM.session;
  }

  function defaultSession() {
    return {
      loggedIn: false,
      onboarded: false,
      email: '',
      callsign: '',
      avatarSeed: 1,
      zone: 'Zone 4 — Harbor Flats',
      bio: '',
      skills: [], // [{tag, vouchCount, vouchers:[]}]
      needs: [],
      inventory: [
        { name: 'Water filter', qty: 1, icon: INVENTORY_ICONS['Water filter'] },
        { name: 'First aid kit', qty: 1, icon: INVENTORY_ICONS['First aid kit'] },
      ],
      allies: [
        // Seeded so tier-gating is demonstrable immediately, per tier.
        { survivorId: 'sv_2', tier: 'inner' }, // Foxglove_Rae
        { survivorId: 'sv_3', tier: 'inner' }, // Grit_and_Gauze
        { survivorId: 'sv_4', tier: 'trusted' }, // Copper_Wren
        { survivorId: 'sv_6', tier: 'trusted' }, // Nine_Tin_Cans
        { survivorId: 'sv_7', tier: 'camp' }, // Marrow_Jo
        { survivorId: 'sv_8', tier: 'camp' }, // Barleycorn
        { survivorId: 'sv_10', tier: 'network' }, // Quiet_Halyard
        { survivorId: 'sv_11', tier: 'network' }, // Dovetail_Mo
        { survivorId: 'sv_12', tier: 'network' }, // Hollow_Pines
      ], // [{survivorId, tier}] -- sv_1, sv_14, sv_15 stay unallied (Recon) for contrast
      pendingIncoming: ['sv_5', 'sv_9'], // survivor ids requesting alliance with me
      pendingOutgoing: ['sv_13'],
      dispatches: [], // user's own dispatches (posted this session), newest first
      dispatchInteractions: {}, // dispatchId -> { vouched: bool }
      commsThreads: {}, // survivorId -> extra messages sent this session
      burnedMessages: [], // ids of messages marked read+burned (removed)
    };
  }

  function saveSession(s) {
    MEM.session = s;
  }

  function getSession() {
    let s = loadSession();
    if (!s) {
      s = defaultSession();
      saveSession(s);
    }
    // Backfill any new fields for sessions saved before an update
    const d = defaultSession();
    Object.keys(d).forEach((k) => { if (!(k in s)) s[k] = d[k]; });
    return s;
  }

  function updateSession(mutator) {
    const s = getSession();
    mutator(s);
    saveSession(s);
    return s;
  }

  function clearSession() {
    MEM.session = null;
  }

  function initials(callsign) {
    return (callsign || '?').slice(0, 1).toUpperCase();
  }

  // Ally lookup helpers
  function getAllyTier(session, survivorId) {
    const rec = session.allies.find((a) => a.survivorId === survivorId);
    return rec ? rec.tier : null; // null = not allied (Recon view)
  }

  function isAllied(session, survivorId) {
    return session.allies.some((a) => a.survivorId === survivorId);
  }

  global.LE = {
    SKILL_LEVELS, levelForVouches,
    TIERS, TIER_ORDER, tierInfo,
    CAPABILITY_TAGS, NEED_TAGS, INVENTORY_ICONS,
    SURVIVORS, survivorById,
    DISPATCHES, ENCLAVES, COMMS_THREADS_RAW,
    ONBOARDING_BRING_TAGS, ONBOARDING_NEED_TAGS,
    avatarFor, svgDataUri, makeAvatarSVG,
    getSession, updateSession, saveSession, clearSession, defaultSession,
    initials, getAllyTier, isAllied,
  };
})(window);
