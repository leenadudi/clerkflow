(function () {
  var script = document.currentScript;
  var town = script.getAttribute('data-town');
  var feature = script.getAttribute('data-feature') || 'foia';
  var label = script.getAttribute('data-label') || 'Town Services';

  if (!town) return;

  var BASE = 'https://clerkflow.software';

  // Inject button + overlay styles
  var style = document.createElement('style');
  style.textContent = [
    '#cf-widget-btn{position:fixed;bottom:24px;right:24px;z-index:2147483646;',
    'background:#1e3a5f;color:#fff;border:none;border-radius:9999px;',
    'padding:12px 20px;font-size:14px;font-weight:600;cursor:pointer;',
    'box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;gap:8px;',
    'font-family:system-ui,-apple-system,sans-serif;line-height:1;}',
    '#cf-widget-btn:hover{background:#16305a;}',
    '#cf-widget-overlay{display:none;position:fixed;inset:0;z-index:2147483647;',
    'background:rgba(0,0,0,.45);align-items:flex-end;justify-content:center;}',
    '#cf-widget-overlay.open{display:flex;}',
    '@media(min-width:640px){#cf-widget-overlay{align-items:center;}}',
    '#cf-widget-panel{background:#fff;border-radius:16px 16px 0 0;width:100%;max-width:480px;',
    'height:90vh;overflow:hidden;display:flex;flex-direction:column;position:relative;}',
    '@media(min-width:640px){#cf-widget-panel{border-radius:16px;height:640px;}}',
    '#cf-widget-header{display:flex;align-items:center;justify-content:space-between;',
    'padding:14px 16px;border-bottom:1px solid #e2e8f0;flex-shrink:0;}',
    '#cf-widget-title{font-size:14px;font-weight:600;color:#0f172a;',
    'font-family:system-ui,-apple-system,sans-serif;}',
    '#cf-widget-close{background:none;border:none;cursor:pointer;color:#475569;',
    'padding:4px;border-radius:6px;font-size:18px;line-height:1;}',
    '#cf-widget-close:hover{background:#f1f5f9;}',
    '#cf-widget-iframe{flex:1;border:none;width:100%;display:block;}',
  ].join('');
  document.head.appendChild(style);

  // Build the embed URL
  var FEATURE_LABELS = { meetings: 'Meetings', foia: 'Submit a Records Request', apply: 'Apply for a Permit', track: 'Track My Request' };
  var panelTitle = FEATURE_LABELS[feature] || label;
  var embedUrl = BASE + '/embed/' + encodeURIComponent(town) + '/' + encodeURIComponent(feature);

  // Create overlay + panel
  var overlay = document.createElement('div');
  overlay.id = 'cf-widget-overlay';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', panelTitle);

  var panel = document.createElement('div');
  panel.id = 'cf-widget-panel';

  var header = document.createElement('div');
  header.id = 'cf-widget-header';

  var title = document.createElement('span');
  title.id = 'cf-widget-title';
  title.textContent = panelTitle;

  var closeBtn = document.createElement('button');
  closeBtn.id = 'cf-widget-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&#x2715;';

  header.appendChild(title);
  header.appendChild(closeBtn);

  var iframe = document.createElement('iframe');
  iframe.id = 'cf-widget-iframe';
  iframe.src = embedUrl;
  iframe.title = panelTitle;
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'forms');

  panel.appendChild(header);
  panel.appendChild(iframe);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Create trigger button
  var btn = document.createElement('button');
  btn.id = 'cf-widget-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' + label;
  document.body.appendChild(btn);

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  // Close on backdrop click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
