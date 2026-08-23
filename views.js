/* views.js — LinkedEnd view renderers. Each function returns an HTML string for #app-root.
   Event handling uses inline data-action attributes + a single delegated listener
   installed in afterRender(), so views stay declarative. */
(function (global) {
  'use strict';

  const esc = (s) => (s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function timeAgo(mins) {
    if (mins < 60) return mins + 'm ago';
    const h = Math.floor(mins / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function avatarImg(seed, size, cls) {
    return `<img src="${LE.avatarFor(seed)}" width="${size}" height="${size}" class="${cls||''}" alt="" loading="lazy" decoding="async" />`;
  }

  // ================= Logo ================= 
  function logoMark(withWordmark) {
    return `<a href="#/" class="shell__brand" aria-label="LinkedEnd home" style="text-decoration:none;">
      <img src="./assets/logo.svg" alt="" width="32" height="32" />
      ${withWordmark ? '<span>LinkedEnd</span>' : ''}
    </a>`;
  }

  // ================= Ticker (real animated marquee — the fix from the old site) =================
  const URGENT_NEEDS = [
    'Zone 12 clinic critically low on antibiotics — any stock, even expired, helps',
    'Insulin cold-storage needed urgently — send Comms if you have reliable ice or a fridge',
    'Rope/paracord needed for mill bridge rebuild — every foot helps',
    'Winter boots needed, multiple sizes, Zone 1 and Zone 7',
    'Working radio needed for Zone 7 Night Watch relay',
    'Ride north requested from Zone 1 — one adult, has supplies to trade',
    'Fuel needed for Substation Row generator rotation',
  ];
  function tickerHTML() {
    const items = URGENT_NEEDS.map((t) => `<span class="ticker__item"><span class="dot">●</span>${esc(t)}</span>`).join('');
    return `<div class="ticker" role="region" aria-label="Urgent needs ticker">
      <span class="ticker__label">Urgent</span>
      <div class="ticker__track-wrap">
        <div class="ticker__track">${items}${items}</div>
      </div>
    </div>`;
  }

  // ================= App shell (nav + ticker + content) =================
  const NAV_ITEMS = [
    { path: '/wire', label: 'The Wire', icon: '📡' },
    { path: '/allies', label: 'Allies', icon: '🤝' },
    { path: '/comms', label: 'Comms', icon: '🔒' },
    { path: '/enclaves', label: 'Enclaves', icon: '⛺' },
    { path: '/recon', label: 'Recon', icon: '🔎' },
    { path: '/dossier', label: 'Dossier', icon: '🗂️' },
  ];

  function shell(contentHTML, session, activePath) {
    const pendingCount = (session.pendingIncoming || []).length;
    const navLinks = NAV_ITEMS.map((n) => {
      const badge = n.path === '/allies' && pendingCount ? `<span class="badge-count">${pendingCount}</span>` : '';
      return `<a href="#${n.path}" data-route="${n.path}" class="${activePath === n.path ? 'is-active' : ''}">
        <span aria-hidden="true">${n.icon}</span> ${n.label} ${badge}
      </a>`;
    }).join('');
    return `
    <div class="shell">
      <div class="shell__scrim" data-action="close-sidebar"></div>
      <aside class="shell__sidebar" id="sidebar">
        ${logoMark(true)}
        <nav class="shell__nav" aria-label="Primary">
          ${navLinks}
        </nav>
        <a href="#/settings" data-route="/settings" class="${activePath === '/settings' ? 'is-active' : ''}">⚙️ Settings</a>
        <div class="shell__user">
          ${avatarImg(session.avatarSeed, 36)}
          <div>
            <div class="cs">${esc(session.callsign)}</div>
            <div class="zn">${esc(session.zone)}</div>
          </div>
        </div>
      </aside>
      <div class="shell__main">
        <div class="shell__mobile-topbar">
          <button aria-label="Open menu" data-action="open-sidebar">☰</button>
          ${logoMark(true)}
          <span style="width:44px"></span>
        </div>
        ${tickerHTML()}
        <div class="shell__content">
          ${contentHTML}
        </div>
      </div>
    </div>`;
  }

  // ================= 404 =================
  function notFound() {
    return `<div class="empty-state"><div class="icon">🧭</div><h1>Signal lost.</h1><p>That path doesn\u2019t exist. <a href="#/">Head back to The Wire.</a></p></div>`;
  }

  // ================= Landing / marketing =================
  function landing(params, session) {
    const enterHref = session.loggedIn ? '#/wire' : '#/signup';
    const enterLabel = session.loggedIn ? 'Enter the app' : 'Join the network';
    return `
    <div class="container">
      <nav class="landing-nav">
        ${logoMark(true)}
        <div class="landing-nav__links">
          <a href="#" data-scroll="how">How it works</a>
          <a href="#" data-scroll="security">Security</a>
          ${session.loggedIn
            ? `<a class="btn btn-primary btn-sm" href="#/wire">Enter the app</a>`
            : `<a class="btn btn-secondary btn-sm" href="#/login">Log in</a><a class="btn btn-primary btn-sm" href="#/signup">Join the network</a>`}
        </div>
      </nav>
    </div>

    <header class="container landing-hero">
      <p class="landing-hero__eyebrow">A network for the collapse</p>
      <h1>No one is coming to save us. <em>We are.</em></h1>
      <p class="lede">You have skills. Your neighbors have skills. The stores have three days of food. Do the math — then do something about it. LinkedEnd connects what you bring with what your neighbors need, without ever asking who you really are.</p>
      <div class="landing-hero__ctas">
        <a href="${enterHref}" class="btn btn-primary" data-testid="link-enter-app">${enterLabel}</a>
        <a href="#" class="btn btn-secondary" data-scroll="how">See how it works</a>
      </div>

      <div class="landing-hero__wall">
        <span class="spray">Linked<span class="end">END</span></span>
        <p class="caption">// spray-painted on the overpass wall, zone 4. still there.</p>
      </div>
    </header>

    <section class="section container" id="how">
      <p class="section__label">Join the resilience syndicate*</p>
      <h2>Not a syndicate. It's mutual aid. We just liked how it sounded.</h2>
      <div class="tag-cloud" aria-label="Example capability tags">
        <span class="tag">has a well</span>
        <span class="tag">knows which mushrooms kill you</span>
        <span class="tag">veterinarian, mostly</span>
        <span class="tag">makes excellent soup</span>
        <span class="tag">can sharpen anything</span>
        <span class="tag">runs a ham radio</span>
        <span class="tag">field medic training</span>
        <span class="tag tag--need">needs insulin</span>
        <span class="tag tag--need">needs a generator</span>
      </div>
    </section>

    <section class="section container">
      <p class="section__label">How it works</p>
      <h2>Skills in. Needs out. No names required.</h2>
      <div class="feature-row">
        <div><span class="num">01</span><h3>Post a Dispatch</h3></div>
        <p>Share what you can offer, what you need, or warn the network about danger \u2014 bad water, bad mushrooms, worse people. Dispatches replace the feed. Vouches replace likes.</p>
      </div>
      <div class="feature-row">
        <div><span class="num">02</span><h3>Build Alliances, not connections</h3></div>
        <p>Request Alliance with survivors whose skills match your needs. Sort allies into closeness tiers \u2014 Inner Circle, Trusted Circle, Camp, Network \u2014 and control exactly what each tier can see.</p>
      </div>
      <div class="feature-row">
        <div><span class="num">03</span><h3>Take it to Comms</h3></div>
        <p>Every profile has a "Send Comms" button and never a contact field. All coordination \u2014 meeting up, sharing a location, exchanging real names if you ever choose to \u2014 happens through encrypted, burn-after-reading Comms. Never in public.</p>
      </div>
    </section>

    <section class="section container" id="security">
      <p class="section__label">Security, not theater</p>
      <h2>We don't want your name. We want your skills.</h2>
      <div class="feature-row">
        <div><span class="num">→</span><h3>Callsign + illustrated avatar only</h3></div>
        <p>No photos, no real names, no phone numbers, no precise locations \u2014 ever, on any profile, post, or search result. Your email is used only for account recovery and is never shown to anyone, including us in the UI.</p>
      </div>
      <div class="feature-row">
        <div><span class="num">→</span><h3>Encrypted Comms, burn-after-reading</h3></div>
        <p>Every message thread carries an encrypted-lock badge. Mark any message to self-destruct after it's read. Coordination happens off the public record, by design.</p>
      </div>
      <div class="feature-row">
        <div><span class="num">→</span><h3>Panic Wipe</h3></div>
        <p>One control in Settings instantly clears your local session and logs you out. For when you need to disappear faster than you logged in.</p>
      </div>
    </section>

    <section class="footer-cta container">
      <h2 style="font-family:var(--font-display); font-size:var(--text-2xl); max-width:18ch;">Do the math. Then do something.</h2>
      ${session.loggedIn ? `
        <a href="#/wire" class="btn btn-primary" style="margin-top:var(--space-6);">Enter the app</a>
      ` : `
        <form class="email-capture" data-action="capture-email">
          <label class="sr-only" for="landing-email">Email</label>
          <input id="landing-email" type="email" placeholder="you@somewhere-still-standing.net" required />
          <button class="btn btn-primary" type="submit">Get early access</button>
        </form>
        <p class="faint" style="margin-top:var(--space-3); font-size:var(--text-xs);">Or skip the line \u2014 <a href="#/signup">join the network now</a>.</p>
      `}
    </section>

    <footer class="landing-footer container">
      <div>${logoMark(true)}</div>
      <p class="faint" style="font-size:var(--text-xs);">LinkedEnd is a prototype. Mutual aid is not.</p>
    </footer>
    `;
  }

  // ================= Auth: signup / login =================
  const AVATAR_SEED_CHOICES = [1,2,3,4,5,6,7,8,9,10,11,12];

  function authHead(title, sub) {
    return `<div class="auth-card__head">${logoMark(true)}<h1 style="margin-top:var(--space-6);">${title}</h1><p class="muted">${sub}</p></div>`;
  }

  function signup(params, session) {
    return `<div class="auth-wrap"><div class="auth-card card">
      ${authHead('Join the network', 'Email for recovery only. Callsign and avatar are all anyone will ever see.')}
      <form data-action="submit-signup">
        <div class="field">
          <label for="su-email">Email (private, recovery only)</label>
          <input id="su-email" name="email" type="email" required placeholder="you@somewhere-still-standing.net" autocomplete="email" />
          <small>Never shown to other survivors. Never shown anywhere in the UI.</small>
        </div>
        <div class="field">
          <label for="su-callsign">Callsign</label>
          <input id="su-callsign" name="callsign" type="text" required placeholder="e.g. Ash_Warden" minlength="3" autocomplete="off" />
          <small>This is your identity. Choose something that isn't your name.</small>
        </div>
        <div class="field">
          <label for="su-password">Password</label>
          <input id="su-password" name="password" type="password" required minlength="6" autocomplete="new-password" />
        </div>
        <div class="field">
          <label>Choose your avatar</label>
          <div class="avatar-picker" role="radiogroup" aria-label="Avatar picker" id="avatar-picker">
            ${AVATAR_SEED_CHOICES.map((seed, i) => `<button type="button" role="radio" aria-checked="${i===0}" data-avatar-seed="${seed}" class="${i===0?'is-selected':''}">${avatarImg(seed, 44)}</button>`).join('')}
          </div>
          <small>Illustrated, abstract. No photos, ever \u2014 that's not a limitation, it's the point.</small>
        </div>
        <div class="reassurance-box">🔒 We don't want your name. We want your skills. Nothing here can be traced back to who you were before.</div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--space-6);" data-testid="button-create-account">Create account</button>
      </form>
      <p class="auth-switch">Already have an account? <a href="#/login">Log in</a></p>
    </div></div>`;
  }

  function login(params, session) {
    return `<div class="auth-wrap"><div class="auth-card card">
      ${authHead('Welcome back, survivor', 'Log in with the email and password from signup. (Prototype: any credentials work.)')}
      <form data-action="submit-login">
        <div class="field">
          <label for="li-email">Email</label>
          <input id="li-email" name="email" type="email" required placeholder="you@somewhere-still-standing.net" autocomplete="email" />
        </div>
        <div class="field">
          <label for="li-password">Password</label>
          <input id="li-password" name="password" type="password" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" data-testid="button-login">Log in</button>
      </form>
      <p class="auth-switch">New here? <a href="#/signup">Join the network</a></p>
    </div></div>`;
  }

  // ================= Onboarding =================
  let onboardState = { step: 1, bring: [], need: [], bio: '' };

  function onboarding(params, session) {
    const s = onboardState;
    const totalSteps = 3;
    const progress = Array.from({ length: totalSteps }, (_, i) => `<div class="step ${i < s.step ? 'is-done' : ''}"></div>`).join('');

    let body = '';
    if (s.step === 1) {
      body = `<div class="onboard-step">
        <h1>What do you bring?</h1>
        <p class="hint">Pick everything that applies. Vague is fine \u2014 "veterinarian, mostly" counts.</p>
        <div class="tag-picker" id="bring-picker">
          ${LE.ONBOARDING_BRING_TAGS.map((t) => `<button type="button" class="tag-choice ${s.bring.includes(t)?'is-selected':''}" data-toggle-bring="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>`;
    } else if (s.step === 2) {
      body = `<div class="onboard-step">
        <h1>What do you need?</h1>
        <p class="hint">No shame in needing things. That's the whole premise.</p>
        <div class="tag-picker" id="need-picker">
          ${LE.ONBOARDING_NEED_TAGS.map((t) => `<button type="button" class="tag-choice is-need ${s.need.includes(t)?'is-selected':''}" data-toggle-need="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>`;
    } else {
      body = `<div class="onboard-step">
        <h1>A short bio</h1>
        <p class="hint">Keep it about what you do, not who you were. No names, no locations more specific than a zone.</p>
        <div class="field">
          <label for="ob-bio">Bio</label>
          <textarea id="ob-bio" rows="4" placeholder="e.g. Ran water treatment before. Still do, unofficially.">${esc(s.bio)}</textarea>
        </div>
        <div class="reassurance-box">🔒 We don't want your name. We want your skills. This bio is the only "about" anyone will read.</div>
      </div>`;
    }

    return `<div class="onboard-wrap">
      <div class="onboard-progress">${progress}</div>
      <div id="onboard-body">${body}</div>
      <div class="onboard-actions">
        ${s.step > 1 ? `<button class="btn btn-secondary" data-action="onboard-back">Back</button>` : `<span></span>`}
        <button class="btn btn-primary" data-action="onboard-next" data-testid="button-onboard-next">${s.step < totalSteps ? 'Continue' : 'Enter LinkedEnd'}</button>
      </div>
    </div>`;
  }

  // ================= The Wire (feed) =================
  const COMPOSER_TYPES = [
    { id: 'offer', label: 'Offer' },
    { id: 'ask', label: 'Ask' },
    { id: 'warning', label: 'Warning' },
  ];
  let composerType = 'offer';

  function typeBadge(type) {
    const label = type === 'offer' ? 'Offer' : type === 'ask' ? 'Ask' : 'Warning';
    return `<span class="dispatch__type-badge ${type}">${label}</span>`;
  }

  function dispatchCard(d, session) {
    const interaction = session.dispatchInteractions[d.id] || {};
    const vouched = !!interaction.vouched;
    const vouchCount = d.vouchCount + (vouched ? 1 : 0);
    const tagsHTML = [
      ...(d.tags||[]).map((t) => `<span class="tag">${esc(t)}</span>`),
      ...(d.needs||[]).map((t) => `<span class="tag tag--need">${esc(t)}</span>`),
    ].join('');
    const comments = d.comments.map((c) => `
      <div class="comment">
        ${avatarImg(c.avatarSeed, 26)}
        <div class="comment__body"><span class="comment__author">${esc(c.callsign)}</span><br/>${esc(c.text)}</div>
      </div>`).join('');
    const authorHref = d.authorId === 'me' ? '#/dossier' : ('#/dossier/' + d.authorId);
    return `<article class="card dispatch" data-dispatch-id="${d.id}">
      <div class="dispatch__head">
        <a href="${authorHref}">${avatarImg(d.authorAvatarSeed, 40)}</a>
        <div>
          <a href="${authorHref}" class="dispatch__author" style="text-decoration:none;">${esc(d.authorCallsign)}</a> ${typeBadge(d.type)}
          <div class="dispatch__meta">${timeAgo(d.minutesAgo)}</div>
        </div>
      </div>
      <p class="dispatch__body">${esc(d.text)}</p>
      ${tagsHTML ? `<div class="dispatch__tags">${tagsHTML}</div>` : ''}
      <div class="dispatch__actions">
        <button data-action="vouch-dispatch" data-id="${d.id}" class="${vouched?'is-vouched':''}" aria-pressed="${vouched}">👍 Vouch (${vouchCount})</button>
        <button data-action="toggle-comments" data-id="${d.id}">💬 ${d.commentCount + (d.comments.length - d.comments.length)} comments</button>
        <button data-action="take-to-comms" data-id="${d.authorId}">🔒 Take to Comms</button>
      </div>
      <div class="dispatch__comments is-hidden" data-comments-for="${d.id}" hidden>
        ${comments}
        <div class="comment-input">
          ${avatarImg(session.avatarSeed, 26)}
          <input type="text" placeholder="Say something useful..." data-comment-input="${d.id}" aria-label="Write a comment" />
          <button class="btn btn-sm btn-secondary" data-action="post-comment" data-id="${d.id}">Post</button>
        </div>
      </div>
    </article>`;
  }

  function wire(params, session) {
    const own = (session.dispatches || []).map((d) => dispatchCard(d, session)).join('');
    const seeded = LE.DISPATCHES.map((d) => dispatchCard(d, session)).join('');
    const content = `
      <div class="page-head"><div><h1>The Wire</h1><p>Skill shares, resource asks, warnings — from survivors across every zone.</p></div></div>
      <div class="card composer">
        <form data-action="post-dispatch">
          <div class="composer__row">
            ${avatarImg(session.avatarSeed, 40)}
            <textarea name="text" placeholder="Share a skill, an offer, an ask, or a warning..." required data-testid="input-composer"></textarea>
          </div>
          <div class="composer__meta">
            <div class="composer__types" role="radiogroup" aria-label="Dispatch type">
              ${COMPOSER_TYPES.map((t) => `<button type="button" data-composer-type="${t.id}" class="${composerType===t.id?'is-selected':''}">${t.label}</button>`).join('')}
            </div>
            <button type="submit" class="btn btn-primary btn-sm" data-testid="button-post-dispatch">Post Dispatch</button>
          </div>
        </form>
      </div>
      ${own}
      ${seeded}
    `;
    return shell(content, session, '/wire');
  }

  // ================= Dossier (RPG sheet) =================
  function skillCardHTML(skill, session, opts) {
    const { canSeeVouchers, canVouch, alreadyVouched, skillIndex, subjectId } = opts;
    const effectiveCount = skill.vouchCount + (alreadyVouched ? 1 : 0);
    const lv = LE.levelForVouches(effectiveCount);
    const vouchersHTML = canSeeVouchers
      ? `<div class="skill-card__vouchers">${(skill.vouchers || []).slice(0, 6).map((v) => `<span class="voucher-chip">${esc(v)}</span>`).join('')}${alreadyVouched ? `<span class="voucher-chip">you</span>` : ''}</div>`
      : `<span class="locked-note">vouchers hidden at this closeness tier</span>`;

    let vouchControl = '';
    if (subjectId) {
      // Viewing another survivor's Dossier — vouch action available only if allied.
      if (canVouch) {
        vouchControl = `<button class="vouch-btn ${alreadyVouched ? 'is-vouched' : ''}" data-action="vouch-skill" data-subject="${subjectId}" data-skill-index="${skillIndex}" ${alreadyVouched ? 'aria-pressed="true"' : ''}>👍 ${alreadyVouched ? 'Vouched' : 'Vouch this skill'}</button>`;
      } else {
        vouchControl = `<span class="locked-note" title="Allies only \u2014 Request Alliance to vouch for their skills">🔒 Ally-only vouching</span>`;
      }
    }

    return `<div class="skill-card">
      <div class="skill-card__top">
        <span class="skill-card__name">${esc(skill.tag)}</span>
        <span class="skill-card__level">${lv.levelName}</span>
      </div>
      <div class="skill-card__bar-wrap">
        <div class="skill-card__bar-track"><div class="skill-card__bar-fill" style="width:${lv.pct}%"></div></div>
        <div class="skill-card__bar-caption">
          <span>${effectiveCount} Vouches</span>
          <span>${lv.next ? (lv.toNext + ' to ' + lv.next) : 'Max level'}</span>
        </div>
      </div>
      <div class="skill-card__vouch-row">
        ${vouchersHTML}
        ${vouchControl}
      </div>
    </div>`;
  }

  function inventoryGrid(inventory, visible) {
    if (!visible) {
      return `<div class="locked-panel">🔒 Inventory details are hidden at this closeness tier. Move this ally closer on the Allies page to see what they're holding.</div>`;
    }
    if (!inventory || !inventory.length) {
      return `<div class="empty-state"><div class="icon">📦</div><p>Nothing logged in inventory yet.</p></div>`;
    }
    const slots = inventory.map((item) => `
      <div class="inv-slot" title="${esc(item.name)}">
        <span class="qty">×${item.qty}</span>
        <span class="icon" aria-hidden="true">${item.icon}</span>
        <span class="name">${esc(item.name)}</span>
      </div>`).join('');
    // Pad with empty slots for that RPG-grid feel
    const emptyCount = Math.max(0, (Math.ceil(inventory.length / 6) * 6) - inventory.length);
    const emptySlots = Array.from({ length: Math.min(emptyCount, 5) }, () => `<div class="inv-slot inv-slot--empty" aria-hidden="true">—</div>`).join('');
    return `<div class="inventory-grid">${slots}${emptySlots}</div>`;
  }

  function tierBadgeHTML(tierId) {
    const info = LE.tierInfo(tierId);
    return `<span class="dossier-tier-badge">🔗 ${info.label} · ${info.blurb.split(' · ')[0]}</span>`;
  }

  function dossierSelf(params, session) {
    const skillsHTML = session.skills.length
      ? session.skills.map((sk, i) => skillCardHTML(sk, session, { canSeeVouchers: true, canVouch: false, alreadyVouched: false, skillIndex: i, subjectId: null })).join('')
      : `<div class="empty-state"><div class="icon">🧭</div><p>No capabilities logged yet. <a href="#/onboarding">Revisit onboarding</a> to add some.</p></div>`;

    const content = `
      <div class="card dossier-head">
        ${avatarImg(session.avatarSeed, 96, 'avatar-lg')}
        <div class="dossier-head__info">
          <h1>${esc(session.callsign)}</h1>
          <div class="dossier-head__zone">${esc(session.zone)}</div>
          <p class="dossier-bio">${esc(session.bio) || 'No bio yet \u2014 add one in onboarding or settings.'}</p>
          <div class="dossier-tier-badge">🗂️ This is your own Dossier \u2014 full visibility, always</div>
        </div>
      </div>

      <div class="rpg-section-label">Skills</div>
      ${skillsHTML}

      <div class="rpg-section-label">Inventory</div>
      ${inventoryGrid(session.inventory, true)}

      <div class="rpg-section-label">What you need</div>
      <div class="needs-list">${session.needs.length ? session.needs.map((n) => `<span class="tag tag--need">${esc(n)}</span>`).join('') : '<p class="faint">Nothing listed \u2014 add needs any time from Settings.</p>'}</div>
    `;
    return shell(content, session, '/dossier');
  }

  function visibilityForTier(tierId) {
    // Returns what's visible to the viewer based on the ally's closeness tier toward them.
    switch (tierId) {
      case 'inner': return { zone: 'precise', inventory: true, allSkills: true, vouchers: true };
      case 'trusted': return { zone: 'general', inventory: 'limited', allSkills: true, vouchers: true };
      case 'camp': return { zone: 'none', inventory: false, allSkills: true, vouchers: true };
      case 'network': return { zone: 'none', inventory: false, allSkills: 'top3', vouchers: false };
      default: return { zone: 'none', inventory: false, allSkills: 'top2', vouchers: false }; // recon / stranger
    }
  }

  function dossierOther(params, session) {
    const survivor = LE.survivorById(params.id);
    if (!survivor) return shell(notFound(), session, '');
    const tier = LE.getAllyTier(session, survivor.id); // null if not allied
    const allied = tier !== null;
    const effectiveTier = tier || 'recon';
    const vis = visibilityForTier(effectiveTier);
    const tierMeta = LE.tierInfo(effectiveTier);

    let skillsToShow = survivor.skills;
    if (vis.allSkills === 'top3') skillsToShow = survivor.skills.slice(0, 3);
    if (vis.allSkills === 'top2') skillsToShow = survivor.skills.slice(0, 2);

    const skillsHTML = skillsToShow.map((sk, i) => skillCardHTML(sk, session, {
      canSeeVouchers: vis.vouchers,
      canVouch: allied,
      alreadyVouched: (session.dispatchInteractions['vouch_' + survivor.id + '_' + i]) || false,
      skillIndex: i,
      subjectId: survivor.id,
    })).join('');

    const hiddenSkillsNote = (vis.allSkills !== true) ? `<p class="locked-note" style="margin-top:var(--space-3);">🔒 ${survivor.skills.length - skillsToShow.length} more capabilities hidden at this closeness tier.</p>` : '';

    const zoneDisplay = vis.zone === 'precise' ? survivor.zone
      : vis.zone === 'general' ? survivor.zone.split(' — ')[0]
      : 'Location hidden \u2014 take it to Comms';

    const inventoryVisible = vis.inventory === true;
    const inventoryHTML = vis.inventory === 'limited'
      ? `<div class="locked-panel">🔒 Full inventory hidden at Trusted Circle. Visible: ${survivor.inventory.length} item categories logged (details hidden).</div>`
      : inventoryGrid(survivor.inventory, inventoryVisible);

    const bioVisible = effectiveTier !== 'recon';
    const needsVisible = effectiveTier !== 'recon';

    const content = `
      <div class="card dossier-head">
        ${avatarImg(survivor.avatarSeed, 96, 'avatar-lg')}
        <div class="dossier-head__info">
          <h1>${esc(survivor.callsign)}</h1>
          <div class="dossier-head__zone">${esc(zoneDisplay)}</div>
          ${bioVisible ? `<p class="dossier-bio">${esc(survivor.bio)}</p>` : `<p class="dossier-bio faint">Bio hidden \u2014 Request Alliance to see more.</p>`}
          ${tierBadgeHTML(effectiveTier)}
          <div class="dossier-actions">
            ${allied
              ? `<button class="btn btn-secondary" disabled>✓ Allied</button>`
              : `<button class="btn btn-primary" data-action="request-alliance" data-id="${survivor.id}" data-testid="button-request-alliance">Request Alliance</button>`}
            <button class="btn btn-secondary" data-action="take-to-comms" data-id="${survivor.id}" data-testid="button-send-comms">🔒 Send Comms</button>
          </div>
        </div>
      </div>

      <div class="rpg-section-label">Skills</div>
      ${skillsHTML}
      ${hiddenSkillsNote}

      <div class="rpg-section-label">Inventory</div>
      ${inventoryHTML}

      ${needsVisible ? `
      <div class="rpg-section-label">What they need</div>
      <div class="needs-list">${survivor.needs.map((n) => `<span class="tag tag--need">${esc(n)}</span>`).join('')}</div>
      ` : ''}
    `;
    return shell(content, session, '');
  }

  // ================= Allies =================
  function allyRow(survivor, session, tier) {
    const skillNames = survivor.skills.slice(0, 3).map((s) => s.tag).join(' · ');
    return `<div class="ally-row" data-ally-id="${survivor.id}">
      <a href="#/dossier/${survivor.id}">${avatarImg(survivor.avatarSeed, 44)}</a>
      <div class="ally-row__info">
        <a href="#/dossier/${survivor.id}" class="ally-row__cs" style="text-decoration:none;">${esc(survivor.callsign)}</a>
        <div class="ally-row__skills">${esc(skillNames)}</div>
      </div>
      <div class="tier-select" role="radiogroup" aria-label="Closeness tier for ${esc(survivor.callsign)}">
        ${LE.TIER_ORDER.filter((t) => t !== 'recon').map((t) => `<button type="button" class="tier-chip ${tier===t?'is-active':''}" data-action="set-tier" data-id="${survivor.id}" data-tier="${t}">${LE.tierInfo(t).label}</button>`).join('')}
      </div>
    </div>`;
  }

  function requestRow(survivor, direction) {
    return `<div class="request-row" data-request-id="${survivor.id}">
      <a href="#/dossier/${survivor.id}">${avatarImg(survivor.avatarSeed, 40)}</a>
      <div class="request-row__info">
        <a href="#/dossier/${survivor.id}" style="text-decoration:none; font-family:var(--font-mono); color:var(--color-text); font-weight:600;">${esc(survivor.callsign)}</a>
        <div class="faint" style="font-size:var(--text-xs);">${direction === 'in' ? 'wants to ally with you' : 'alliance request pending'}</div>
      </div>
      ${direction === 'in' ? `
        <button class="btn btn-sm btn-primary" data-action="accept-alliance" data-id="${survivor.id}">Accept</button>
        <button class="btn btn-sm btn-ghost" data-action="decline-alliance" data-id="${survivor.id}">Decline</button>
      ` : `<span class="faint mono" style="font-size:var(--text-xs);">awaiting response</span>`}
    </div>`;
  }

  let alliesTab = 'allies';

  function allies(params, session) {
    const allyIds = new Set(session.allies.map((a) => a.survivorId));
    const alliedSurvivors = session.allies.map((a) => ({ survivor: LE.survivorById(a.survivorId), tier: a.tier })).filter((x) => x.survivor);
    const nearby = LE.SURVIVORS.filter((s) => s.id !== 'sv_1' && !allyIds.has(s.id) && !session.pendingIncoming.includes(s.id) && !session.pendingOutgoing.includes(s.id)).slice(0, 6);

    const tierLegend = LE.TIERS.map((t) => `<div class="card"><strong>${t.label}</strong><p>${t.blurb}</p></div>`).join('');

    const tabsHTML = `<div class="tabs" role="tablist">
      <button role="tab" class="${alliesTab==='allies'?'is-active':''}" data-action="allies-tab" data-tab="allies" aria-selected="${alliesTab==='allies'}">Allies (${alliedSurvivors.length})</button>
      <button role="tab" class="${alliesTab==='requests'?'is-active':''}" data-action="allies-tab" data-tab="requests" aria-selected="${alliesTab==='requests'}">Requests (${session.pendingIncoming.length})</button>
      <button role="tab" class="${alliesTab==='nearby'?'is-active':''}" data-action="allies-tab" data-tab="nearby" aria-selected="${alliesTab==='nearby'}">Nearby Survivors</button>
    </div>`;

    let body = '';
    if (alliesTab === 'allies') {
      body = `
        <p class="muted" style="margin-bottom:var(--space-5);">Assign each ally to a closeness tier. This controls exactly what they can see on your Dossier \u2014 and what you can see on theirs.</p>
        <div class="tier-legend">${tierLegend}</div>
        ${alliedSurvivors.length ? alliedSurvivors.map((x) => allyRow(x.survivor, session, x.tier)).join('') : `<div class="empty-state"><div class="icon">🤝</div><p>No allies yet. Check Nearby Survivors or Recon to find your first one.</p></div>`}
      `;
    } else if (alliesTab === 'requests') {
      const incoming = session.pendingIncoming.map((id) => LE.survivorById(id)).filter(Boolean);
      const outgoing = session.pendingOutgoing.map((id) => LE.survivorById(id)).filter(Boolean);
      body = `
        <h2 style="font-size:var(--text-lg); margin-bottom:var(--space-3);">Incoming</h2>
        ${incoming.length ? incoming.map((s) => requestRow(s, 'in')).join('') : '<p class="faint">No incoming requests right now.</p>'}
        <h2 style="font-size:var(--text-lg); margin: var(--space-8) 0 var(--space-3);">Outgoing</h2>
        ${outgoing.length ? outgoing.map((s) => requestRow(s, 'out')).join('') : '<p class="faint">No outgoing requests right now.</p>'}
      `;
    } else {
      body = `
        <p class="muted" style="margin-bottom:var(--space-5);">Matched by overlapping capabilities and needs \u2014 people-you-may-know, but for after the collapse.</p>
        <div class="recon-grid">
          ${nearby.map((s) => `
            <div class="card recon-card">
              <a href="#/dossier/${s.id}">${avatarImg(s.avatarSeed, 56)}</a>
              <a href="#/dossier/${s.id}" style="text-decoration:none;"><h3>${esc(s.callsign)}</h3></a>
              <div class="zone">${esc(s.zone)}</div>
              <div class="tag-cloud">${s.skills.slice(0,2).map((sk) => `<span class="tag">${esc(sk.tag)}</span>`).join('')}</div>
              <button class="btn btn-sm btn-primary" style="margin-top:var(--space-4);" data-action="request-alliance" data-id="${s.id}">Request Alliance</button>
            </div>`).join('')}
        </div>
      `;
    }

    const content = `<div class="page-head"><div><h1>Allies</h1><p>Alliances, requests, and closeness tiers.</p></div></div>${tabsHTML}${body}`;
    return shell(content, session, '/allies');
  }

  // ================= Comms =================
  let activeThreadId = null;

  function buildCommsThreads(session) {
    return LE.COMMS_THREADS_RAW.map((t, i) => {
      const survivor = LE.SURVIVORS[t.withIdx];
      const extra = session.commsThreads[survivor.id] || [];
      return {
        id: 'th_' + i,
        survivor,
        unread: t.unread,
        messages: [...t.messages, ...extra],
      };
    });
  }

  function comms(params, session) {
    const threads = buildCommsThreads(session);
    if (!activeThreadId && threads.length) activeThreadId = threads[0].id;
    const active = threads.find((t) => t.id === activeThreadId) || threads[0];

    const listHTML = threads.map((t) => `
      <button class="comms-list-item ${active && t.id===active.id ? 'is-active':''}" data-action="open-thread" data-id="${t.id}">
        ${avatarImg(t.survivor.avatarSeed, 36)}
        <div class="comms-list-item__meta">
          <div class="comms-list-item__cs">${esc(t.survivor.callsign)} <span class="badge-lock" style="padding:0 4px;">🔒</span>${t.unread ? `<span class="badge-count">${t.unread}</span>`:''}</div>
          <div class="comms-list-item__preview">${esc((t.messages[t.messages.length-1]||{}).text || '')}</div>
        </div>
      </button>`).join('');

    let threadHTML = `<div class="empty-state"><div class="icon">🔒</div><p>Select a thread to view encrypted Comms.</p></div>`;
    if (active) {
      const msgs = active.messages.map((m, i) => {
        const burned = session.burnedMessages.includes(active.id + '_' + i);
        if (burned) return `<div class="msg-bubble ${m.from==='me'?'mine':'theirs'} is-burned">This message self-destructed after reading.</div>`;
        return `<div class="msg-bubble ${m.from==='me'?'mine':'theirs'}">${esc(m.text)}${m.burn ? `<span class="burn-tag" data-action="burn-message" data-thread="${active.id}" data-idx="${i}" role="button" tabindex="0">🔥 burn after reading \u2014 click to mark read &amp; destroy</span>` : ''}</div>`;
      }).join('');
      threadHTML = `
        <div class="thread-head">
          ${avatarImg(active.survivor.avatarSeed, 40)}
          <div>
            <div style="font-family:var(--font-mono); font-weight:600;">${esc(active.survivor.callsign)}</div>
            <span class="badge-lock">🔒 End-to-end encrypted (prototype)</span>
          </div>
        </div>
        <div class="thread-messages" id="thread-messages">${msgs}</div>
        <div class="thread-compose">
          <input type="text" placeholder="Type a message..." id="comms-input" aria-label="Message" data-testid="input-comms-message" />
          <label class="burn-toggle"><input type="checkbox" id="comms-burn-toggle" /> 🔥 burn after reading</label>
          <button class="btn btn-primary btn-sm" data-action="send-comms" data-thread="${active.id}" data-survivor="${active.survivor.id}" data-testid="button-send-message">Send</button>
        </div>
      `;
    }

    const content = `
      <div class="page-head"><div><h1>Comms</h1><p><span class="badge-lock">🔒 encrypted</span> Take coordination here \u2014 never in public.</p></div></div>
      <div class="comms-layout">
        <div class="comms-list">${listHTML}</div>
        <div class="card">${threadHTML}</div>
      </div>
    `;
    return shell(content, session, '/comms');
  }

  // ================= Enclaves =================
  function enclaves(params, session) {
    const cards = LE.ENCLAVES.map((e) => `
      <div class="card enclave-card">
        <h3>${esc(e.name)}</h3>
        <p class="desc">${esc(e.desc)}</p>
        <div class="tag-cloud">${e.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="members">${e.members} survivors</div>
        <div class="enclave-card__foot">
          <a href="#/enclave/${e.id}" class="btn btn-sm btn-secondary">View Wire</a>
          <button class="btn btn-sm btn-primary" data-action="join-enclave" data-id="${e.id}">Join</button>
        </div>
      </div>`).join('');
    const content = `<div class="page-head"><div><h1>Enclaves</h1><p>Groups organized around shared purpose \u2014 water, watch, forage, care, power, growth.</p></div></div>
      <div class="enclave-grid">${cards}</div>`;
    return shell(content, session, '/enclaves');
  }

  function enclaveDetail(params, session) {
    const e = LE.ENCLAVES.find((x) => x.id === params.id);
    if (!e) return shell(notFound(), session, '');
    const posts = e.dispatches.map((d) => {
      const author = LE.SURVIVORS[d.authorIdx];
      return `<article class="card dispatch">
        <div class="dispatch__head">
          <a href="#/dossier/${author.id}">${avatarImg(author.avatarSeed, 40)}</a>
          <div>
            <a href="#/dossier/${author.id}" class="dispatch__author" style="text-decoration:none;">${esc(author.callsign)}</a>
            <div class="dispatch__meta">${timeAgo(d.minutesAgo)} \u00b7 ${esc(e.name)}</div>
          </div>
        </div>
        <p class="dispatch__body">${esc(d.text)}</p>
      </article>`;
    }).join('');
    const content = `
      <div class="page-head"><div><h1>${esc(e.name)}</h1><p>${esc(e.desc)}</p></div>
      <button class="btn btn-primary" data-action="join-enclave" data-id="${e.id}">Join Enclave</button></div>
      <p class="faint mono" style="margin-bottom:var(--space-5); font-size:var(--text-xs);">${e.members} survivors \u00b7 mini-Wire below</p>
      ${posts}
    `;
    return shell(content, session, '/enclaves');
  }

  // ================= Recon =================
  let reconQuery = '';
  function recon(params, session) {
    const q = reconQuery.trim().toLowerCase();
    const results = LE.SURVIVORS.filter((s) => {
      if (s.id === 'sv_1') return false; // that's you (demo self / Ash_Warden) -- never list self in Recon
      if (!q) return true;
      return s.callsign.toLowerCase().includes(q)
        || s.zone.toLowerCase().includes(q)
        || s.skills.some((sk) => sk.tag.toLowerCase().includes(q))
        || s.needs.some((n) => n.toLowerCase().includes(q));
    });
    const allyIds = new Set(session.allies.map((a) => a.survivorId));
    const cards = results.map((s) => {
      const allied = allyIds.has(s.id);
      const topSkills = s.skills.slice(0, allied ? 3 : 2).map((sk) => `<span class="tag">${esc(sk.tag)}</span>`).join('');
      return `<div class="card recon-card">
        <a href="#/dossier/${s.id}">${avatarImg(s.avatarSeed, 56)}</a>
        <a href="#/dossier/${s.id}" style="text-decoration:none;"><h3>${esc(s.callsign)}</h3></a>
        <div class="zone">${allied ? esc(s.zone) : 'Zone hidden \u2014 not allied'}</div>
        <div class="tag-cloud">${topSkills}</div>
        ${!allied ? `<button class="btn btn-sm btn-primary" style="margin-top:var(--space-4);" data-action="request-alliance" data-id="${s.id}">Request Alliance</button>` : `<a class="btn btn-sm btn-secondary" style="margin-top:var(--space-4);" href="#/dossier/${s.id}">View Dossier</a>`}
      </div>`;
    }).join('');
    const content = `
      <div class="page-head"><div><h1>Recon</h1><p>Search survivors by callsign, zone, or capability. Strangers see minimal public info only.</p></div></div>
      <div class="search-bar">
        <label class="sr-only" for="recon-search">Search survivors</label>
        <input id="recon-search" type="search" placeholder="Search callsigns, zones, or skills..." value="${esc(reconQuery)}" data-action-input="recon-search" data-testid="input-recon-search" />
      </div>
      <div class="recon-grid">${cards || '<div class="empty-state"><div class="icon">🔎</div><p>No survivors match that search.</p></div>'}</div>
    `;
    return shell(content, session, '/recon');
  }

  // ================= Settings =================
  function settings(params, session) {
    const content = `
      <div class="page-head"><div><h1>Settings</h1><p>Your privacy posture, session, and account.</p></div></div>

      <div class="settings-block">
        <h2>Privacy, explained</h2>
        <div class="card">
          <p style="margin-bottom:var(--space-3);">🔒 We don't want your name. We want your skills.</p>
          <p class="muted" style="margin-bottom:var(--space-2);">Your callsign and illustrated avatar are the only identity anyone on LinkedEnd ever sees. No real names, phone numbers, or precise locations appear on your Dossier, your Dispatches, or in Recon results \u2014 full stop.</p>
          <p class="muted">Coordination \u2014 meeting up, sharing an exact location, exchanging real contact info \u2014 always happens through encrypted Comms, never in public. Closeness tiers on the Allies page further control exactly what each ally can see.</p>
        </div>
      </div>

      <div class="settings-block">
        <h2>Account</h2>
        <div class="card">
          <div class="field"><label>Callsign</label><input type="text" value="${esc(session.callsign)}" data-field="callsign" /></div>
          <div class="field"><label>Email (private \u2014 shown only here, never to other survivors)</label><input type="email" value="${esc(session.email)}" data-field="email" /></div>
          <div class="field"><label>Bio</label><textarea rows="3" data-field="bio">${esc(session.bio)}</textarea></div>
          <button class="btn btn-secondary" data-action="save-settings">Save changes</button>
        </div>
      </div>

      <div class="settings-block">
        <h2>Danger zone</h2>
        <div class="danger-zone">
          <p><strong>Panic Wipe</strong> instantly clears your local session \u2014 dispatches, comms, alliances, everything held in this browser tab \u2014 and logs you out. Use it if you need to disappear faster than you logged in. This cannot be undone.</p>
          <button class="btn btn-danger" data-action="panic-wipe" data-testid="button-panic-wipe">🔥 Panic Wipe</button>
        </div>
      </div>
    `;
    return shell(content, session, '/settings');
  }

  // ================= Event delegation (installed once) =================
  let delegationInstalled = false;

  function installDelegation() {
    if (delegationInstalled) return;
    delegationInstalled = true;
    const root = document.getElementById('app-root');

    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action], [data-scroll], [data-toggle-bring], [data-toggle-need], [data-composer-type], [data-avatar-seed]');
      if (!t) return;

      // Smooth scroll for on-page anchors (landing page)
      if (t.dataset.scroll) {
        e.preventDefault();
        const target = document.getElementById(t.dataset.scroll);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (t.dataset.avatarSeed) {
        document.querySelectorAll('#avatar-picker button').forEach((b) => { b.classList.remove('is-selected'); b.setAttribute('aria-checked', 'false'); });
        t.classList.add('is-selected');
        t.setAttribute('aria-checked', 'true');
        return;
      }

      if (t.dataset.toggleBring) {
        const idx = onboardState.bring.indexOf(t.dataset.toggleBring);
        if (idx >= 0) onboardState.bring.splice(idx, 1); else onboardState.bring.push(t.dataset.toggleBring);
        t.classList.toggle('is-selected');
        return;
      }
      if (t.dataset.toggleNeed) {
        const idx = onboardState.need.indexOf(t.dataset.toggleNeed);
        if (idx >= 0) onboardState.need.splice(idx, 1); else onboardState.need.push(t.dataset.toggleNeed);
        t.classList.toggle('is-selected');
        return;
      }
      if (t.dataset.composerType) {
        composerType = t.dataset.composerType;
        document.querySelectorAll('[data-composer-type]').forEach((b) => b.classList.toggle('is-selected', b === t));
        return;
      }

      const action = t.dataset.action;
      if (!action) return;

      switch (action) {
        case 'open-sidebar':
          document.getElementById('sidebar').classList.add('is-open');
          document.querySelector('.shell__scrim').classList.add('is-open');
          break;
        case 'close-sidebar':
          document.getElementById('sidebar').classList.remove('is-open');
          document.querySelector('.shell__scrim').classList.remove('is-open');
          break;
        case 'capture-email':
          break; // handled by submit
        case 'onboard-next':
          if (onboardState.step < 3) {
            onboardState.step += 1;
            window.LEApp.rerender();
          } else {
            const bioField = document.getElementById('ob-bio');
            if (bioField) onboardState.bio = bioField.value;
            LE.updateSession((s) => {
              s.onboarded = true;
              s.skills = onboardState.bring.map((tag) => ({ tag, vouchCount: 0, vouchers: [] }));
              s.needs = onboardState.need;
              s.bio = onboardState.bio;
            });
            window.LEApp.toast('Welcome to LinkedEnd. Your Dossier is live.');
            window.LEApp.navigate('/wire');
          }
          break;
        case 'onboard-back':
          onboardState.step = Math.max(1, onboardState.step - 1);
          window.LEApp.rerender();
          break;
        case 'vouch-dispatch': {
          const id = t.dataset.id;
          LE.updateSession((s) => {
            const cur = s.dispatchInteractions[id] || {};
            cur.vouched = !cur.vouched;
            s.dispatchInteractions[id] = cur;
          });
          window.LEApp.rerender();
          break;
        }
        case 'toggle-comments': {
          const panel = document.querySelector(`[data-comments-for="${t.dataset.id}"]`);
          if (panel) panel.hidden = !panel.hidden;
          break;
        }
        case 'post-comment': {
          const input = document.querySelector(`[data-comment-input="${t.dataset.id}"]`);
          if (input && input.value.trim()) {
            window.LEApp.toast('Comment posted.');
            input.value = '';
          }
          break;
        }
        case 'take-to-comms':
          window.LEApp.navigate('/comms');
          window.LEApp.toast('Coordination happens in Comms \u2014 never in public.');
          break;
        case 'request-alliance': {
          const id = t.dataset.id;
          LE.updateSession((s) => {
            if (!s.pendingOutgoing.includes(id)) s.pendingOutgoing.push(id);
          });
          window.LEApp.toast('Alliance requested.');
          window.LEApp.rerender();
          break;
        }
        case 'accept-alliance': {
          const id = t.dataset.id;
          LE.updateSession((s) => {
            s.pendingIncoming = s.pendingIncoming.filter((x) => x !== id);
            if (!s.allies.some((a) => a.survivorId === id)) s.allies.push({ survivorId: id, tier: 'network' });
          });
          window.LEApp.toast('Alliance formed \u2014 added to Network tier.');
          window.LEApp.rerender();
          break;
        }
        case 'decline-alliance': {
          const id = t.dataset.id;
          LE.updateSession((s) => { s.pendingIncoming = s.pendingIncoming.filter((x) => x !== id); });
          window.LEApp.rerender();
          break;
        }
        case 'set-tier': {
          const id = t.dataset.id, tier = t.dataset.tier;
          LE.updateSession((s) => {
            const rec = s.allies.find((a) => a.survivorId === id);
            if (rec) rec.tier = tier;
          });
          window.LEApp.rerender();
          break;
        }
        case 'vouch-skill': {
          const key = 'vouch_' + t.dataset.subject + '_' + t.dataset.skillIndex;
          LE.updateSession((s) => {
            s.dispatchInteractions[key] = !s.dispatchInteractions[key];
          });
          window.LEApp.rerender();
          break;
        }
        case 'allies-tab':
          alliesTab = t.dataset.tab;
          window.LEApp.rerender();
          break;
        case 'open-thread':
          activeThreadId = t.dataset.id;
          window.LEApp.rerender();
          break;
        case 'send-comms': {
          const input = document.getElementById('comms-input');
          const burnToggle = document.getElementById('comms-burn-toggle');
          if (input && input.value.trim()) {
            const survivorId = t.dataset.survivor;
            LE.updateSession((s) => {
              if (!s.commsThreads[survivorId]) s.commsThreads[survivorId] = [];
              s.commsThreads[survivorId].push({ from: 'me', text: input.value.trim(), minutesAgo: 0, burn: burnToggle && burnToggle.checked });
            });
            window.LEApp.rerender();
          }
          break;
        }
        case 'burn-message': {
          const key = t.dataset.thread + '_' + t.dataset.idx;
          LE.updateSession((s) => { if (!s.burnedMessages.includes(key)) s.burnedMessages.push(key); });
          window.LEApp.rerender();
          break;
        }
        case 'join-enclave':
          window.LEApp.toast('Joined Enclave.');
          break;
        case 'save-settings': {
          const callsign = document.querySelector('[data-field="callsign"]').value;
          const email = document.querySelector('[data-field="email"]').value;
          const bio = document.querySelector('[data-field="bio"]').value;
          LE.updateSession((s) => { s.callsign = callsign; s.email = email; s.bio = bio; });
          window.LEApp.toast('Settings saved.');
          window.LEApp.rerender();
          break;
        }
        case 'panic-wipe': {
          LE.clearSession();
          window.LEApp.navigate('/');
          setTimeout(() => window.LEApp.toast('Session wiped. You are logged out.'), 60);
          break;
        }
      }
    });

    root.addEventListener('keydown', (e) => {
      const t = e.target.closest('[data-action="burn-message"]');
      if (t && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        t.click();
      }
    });

    root.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.dataset.action === 'submit-signup') {
        e.preventDefault();
        const email = form.querySelector('[name="email"]').value;
        const callsign = form.querySelector('[name="callsign"]').value;
        const avatarBtn = form.querySelector('#avatar-picker .is-selected');
        const avatarSeed = avatarBtn ? Number(avatarBtn.dataset.avatarSeed) : 1;
        LE.updateSession((s) => {
          s.loggedIn = true;
          s.email = email;
          s.callsign = callsign;
          s.avatarSeed = avatarSeed;
        });
        onboardState.step = 1; onboardState.bring = []; onboardState.need = []; onboardState.bio = '';
        window.LEApp.navigate('/onboarding');
      } else if (form.dataset.action === 'submit-login') {
        e.preventDefault();
        const email = form.querySelector('[name="email"]').value;
        LE.updateSession((s) => {
          s.loggedIn = true;
          s.onboarded = true;
          s.email = email;
          if (!s.callsign) s.callsign = 'Ash_Warden';
          if (!s.skills.length) {
            s.skills = [{ tag: 'can purify water', vouchCount: 3, vouchers: ['Foxglove_Rae', 'Grit_and_Gauze'] }];
            s.needs = ['needs batteries'];
            s.bio = 'Ran the old water treatment plant before everything went sideways.';
          }
        });
        window.LEApp.toast('Welcome back.');
        window.LEApp.navigate('/wire');
      } else if (form.dataset.action === 'post-dispatch') {
        e.preventDefault();
        const text = form.querySelector('[name="text"]').value.trim();
        if (!text) return;
        const session = LE.getSession();
        LE.updateSession((s) => {
          s.dispatches.unshift({
            id: 'own_' + Date.now(),
            authorId: 'me',
            authorCallsign: s.callsign,
            authorAvatarSeed: s.avatarSeed,
            type: composerType,
            text,
            tags: [],
            needs: [],
            vouchCount: 0,
            commentCount: 0,
            comments: [],
            minutesAgo: 0,
          });
        });
        form.reset();
        window.LEApp.toast('Dispatch posted to The Wire.');
        window.LEApp.rerender();
      } else if (form.dataset.action === 'capture-email') {
        e.preventDefault();
        window.LEApp.toast('You\u2019re on the list. Or just join now \u2014 up to you.');
        form.reset();
      }
    });

    root.addEventListener('input', (e) => {
      if (e.target.dataset.actionInput === 'recon-search') {
        reconQuery = e.target.value;
        const activeEl = e.target;
        const selStart = activeEl.selectionStart;
        window.LEApp.rerender();
        const again = document.getElementById('recon-search');
        if (again) { again.focus(); again.setSelectionRange(selStart, selStart); }
      }
    });

    root.addEventListener('keydown', (e) => {
      if (e.target.id === 'comms-input' && e.key === 'Enter') {
        const btn = document.querySelector('[data-action="send-comms"]');
        if (btn) btn.click();
      }
    });
  }

  function afterRender(path) {
    installDelegation();
  }

  global.LEViews = {
    esc, timeAgo, avatarImg, logoMark, tickerHTML, shell, notFound,
    landing, signup, login, onboarding,
    wire, dossierSelf, dossierOther, allies, comms, enclaves, enclaveDetail, recon, settings,
    afterRender,
    NAV_ITEMS,
  };
})(window);
