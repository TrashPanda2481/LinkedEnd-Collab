/* app.js — LinkedEnd router + global event delegation.
   Single-page app: one document, hash-based routes, in-memory session (see data.js). */
(function () {
  'use strict';
  const root = document.getElementById('app-root');

  const ROUTES = {
    '/': LEViews.landing,
    '/login': LEViews.login,
    '/signup': LEViews.signup,
    '/onboarding': LEViews.onboarding,
    '/wire': LEViews.wire,
    '/dossier': LEViews.dossierSelf,
    '/dossier/:id': LEViews.dossierOther,
    '/allies': LEViews.allies,
    '/comms': LEViews.comms,
    '/enclaves': LEViews.enclaves,
    '/enclave/:id': LEViews.enclaveDetail,
    '/recon': LEViews.recon,
    '/settings': LEViews.settings,
  };

  function currentPath() {
    const hash = location.hash || '#/';
    return hash.slice(1) || '/';
  }

  function matchRoute(path) {
    if (ROUTES[path]) return { fn: ROUTES[path], params: {} };
    for (const pattern of Object.keys(ROUTES)) {
      if (!pattern.includes(':')) continue;
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');
      if (patternParts.length !== pathParts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (patternParts[i] !== pathParts[i]) {
          ok = false; break;
        }
      }
      if (ok) return { fn: ROUTES[pattern], params };
    }
    return null;
  }

  // Guard: routes that require login / onboarding
  const PUBLIC_ROUTES = new Set(['/', '/login', '/signup']);

  function render() {
    const path = currentPath();
    const session = LE.getSession();
    const match = matchRoute(path);

    if (!match) {
      root.innerHTML = LEViews.notFound();
      window.scrollTo(0, 0);
      return;
    }

    if (!PUBLIC_ROUTES.has(path) && path !== '/onboarding' && !session.loggedIn) {
      location.hash = '#/login';
      return;
    }
    if (session.loggedIn && !session.onboarded && path !== '/onboarding') {
      location.hash = '#/onboarding';
      return;
    }

    root.innerHTML = match.fn(match.params, session);
    window.scrollTo(0, 0);
    afterRender(path);
  }

  function afterRender(path) {
    // Highlight active nav link
    document.querySelectorAll('.shell__nav a').forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('data-route') === path.split('/').slice(0, 2).join('/'));
    });
    if (LEViews.afterRender) LEViews.afterRender(path);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();

  // ---------- Global helpers exposed for views.js event handlers ----------
  window.LEApp = {
    navigate(path) { location.hash = '#' + path; },
    rerender: render,
    toast(msg) {
      const el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    },
  };
})();
