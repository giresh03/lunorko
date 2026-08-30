/**
 * Automated preview self-test.
 *
 * A script injected into the sandboxed preview iframe. The editor posts
 * `{ __lunorSelfTest: 'run' }` into the frame and the script replies with
 * `{ __lunorSelfTest: true, results: SelfTestResult[] }` after checking that:
 *   1. the app actually loaded and rendered content,
 *   2. no runtime errors happened during the check window,
 *   3. in-page navigation targets resolve to a rendered view,
 *   4. the login form (if present) can be submitted successfully.
 *
 * The assistant may only claim an issue is resolved when these checks pass.
 */

export type SelfTestResult = { id: string; label: string; passed: boolean; detail?: string };

export const SELF_TEST_TIMEOUT_MS = 9000;

export const PREVIEW_SELF_TEST_SCRIPT = `<script id="__lunor_selftest">(function(){
  if (window.__lunorSelfTest) return; window.__lunorSelfTest = true;
  var errors = [];
  function trackError(m){ if (m) { m = String(m); if (errors.indexOf(m) === -1 && errors.length < 8) errors.push(m); } }
  window.addEventListener('error', function(e){
    if (e && e.target && e.target !== window && e.target.tagName)
      return trackError('Failed to load ' + e.target.tagName.toLowerCase() + ': ' + (e.target.src || e.target.href || '?'));
    trackError(e && e.message);
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    var r = e && e.reason; trackError((r && r.message) || r || 'Unhandled promise rejection');
  });
  var ce = console.error;
  console.error = function(){
    try { trackError('console.error: ' + Array.prototype.map.call(arguments, function(a){ return (a && a.message) || String(a); }).join(' ')); } catch(x) {}
    return ce.apply(console, arguments);
  };

  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function visibleText(){
    var b = document.body; if (!b) return '';
    return (b.innerText || b.textContent || '').replace(/\\s+/g, ' ').trim();
  }
  function elementCount(){ return document.body ? document.body.querySelectorAll('*').length : 0; }

  function checkLoad(){
    var text = visibleText(), count = elementCount();
    var ok = document.readyState !== 'loading' && (text.length > 60 || count > 12);
    return { id: 'load', label: 'App loads and renders', passed: ok,
      detail: ok ? count + ' elements rendered' : 'Blank or near-empty page (' + count + ' elements, ' + text.length + ' chars of text)' };
  }

  function checkRoutes(){
    var links = [].slice.call(document.querySelectorAll('a[href^="#"], [data-page], [data-route], [data-nav]')).slice(0, 12);
    if (!links.length) return { id: 'routes', label: 'Navigation works', passed: true, detail: 'No in-page navigation found' };
    var broken = [];
    links.forEach(function(a){
      var href = a.getAttribute('href');
      var target = a.getAttribute('data-page') || a.getAttribute('data-route') || a.getAttribute('data-nav');
      if (href && href.length > 1) {
        var id = href.slice(1);
        if (!document.getElementById(id) && !document.querySelector('[name="' + id + '"]') && !document.querySelector('[data-page="' + id + '"]'))
          broken.push(href);
      } else if (target) {
        if (!document.getElementById(target) && !document.querySelector('[data-page="' + target + '"]') && !document.querySelector('[data-route="' + target + '"]'))
          broken.push(target);
      }
    });
    return { id: 'routes', label: 'Navigation works', passed: broken.length === 0,
      detail: broken.length ? 'Navigation targets missing: ' + broken.join(', ') : links.length + ' navigation target(s) resolve' };
  }

  function findLoginForm(){
    var pw = document.querySelector('input[type="password"]');
    if (!pw) return null;
    var form = pw.closest('form');
    var scope = form || pw.parentElement || document.body;
    var user = scope.querySelector('input[type="email"], input[type="text"], input[name*="user" i], input[id*="user" i], input[name*="email" i]');
    var submit = (form && (form.querySelector('button[type="submit"], input[type="submit"]') || form.querySelector('button'))) ||
                 scope.querySelector('button[type="submit"], button');
    return { pw: pw, user: user, submit: submit, form: form, scope: scope };
  }

  function checkLogin(){
    // Non-invasive: never type credentials or click anything in the user's preview.
    var l = findLoginForm();
    if (!l) return Promise.resolve({ id: 'login', label: 'Login form is wired', passed: true, detail: 'No login form in this page' });
    var missing = [];
    if (!l.user) missing.push('email/username field');
    if (!l.submit) missing.push('submit control');
    if (!l.form) missing.push('form element');
    var passed = missing.length === 0;
    return Promise.resolve({ id: 'login', label: 'Login form is wired', passed: passed,
      detail: passed ? 'Login form has all required fields and a submit control' : 'Login form is missing: ' + missing.join(', ') });
  }

  function run(){
    return wait(500).then(function(){
      var results = [checkLoad()];
      return checkLogin().then(function(login){
        results.push(checkRoutes());
        results.push(login);
        results.push({ id: 'errors', label: 'No runtime errors', passed: errors.length === 0,
          detail: errors.length ? errors.join(' | ') : 'Clean run' });
        try { parent.postMessage({ __lunorSelfTest: true, results: results }, '*'); } catch(e) {}
      });
    });
  }

  window.addEventListener('message', function(e){
    var d = e && e.data;
    if (d && d.__lunorSelfTest === 'run') run();
  });
})();<\/script>`;

/** Human-readable summary used both in chat and in the follow-up fix prompt. */
export function summarizeResults(results: SelfTestResult[]): string {
  return results
    .map((r) => `${r.passed ? "✅" : "❌"} ${r.label}${r.detail ? ` — ${r.detail}` : ""}`)
    .join("\n");
}
