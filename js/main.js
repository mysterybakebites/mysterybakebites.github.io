// Mystery Bakebite: tiny progressive-enhancement script
document.documentElement.classList.add('js');

// Navigation v2: dropdowns, drawer, current page
(function () {
  var items = document.querySelectorAll('.has-dd');
  function closeAll(except) { items.forEach(function (i) { if (i !== except) { i.classList.remove('open'); i.querySelector('.dd-btn').setAttribute('aria-expanded', 'false'); } }); }
  items.forEach(function (it) {
    var b = it.querySelector('.dd-btn');
    b.addEventListener('click', function (e) {
      e.stopPropagation(); var o = !it.classList.contains('open'); closeAll(it);
      it.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-dd')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeDrawer(); } });
  document.querySelectorAll('.dd-link, .dd-foot').forEach(function (a) { a.addEventListener('click', function () { closeAll(); }); });

  var toggle = document.querySelector('.nav-toggle');
  function openDrawer() { document.body.classList.add('drawer-open'); toggle.setAttribute('aria-expanded', 'true'); document.getElementById('drawer').setAttribute('aria-hidden', 'false'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); var d = document.getElementById('drawer'); if (d) d.setAttribute('aria-hidden', 'true'); }
  if (toggle) toggle.addEventListener('click', openDrawer);
  document.querySelectorAll('[data-close], .dr-panel a').forEach(function (el) { el.addEventListener('click', closeDrawer); });

  // current page highlight
  var page = location.pathname.split('/').pop() || 'index.html';
  var key = page === 'menu.html' ? 'menu' : page === 'order.html' ? 'order' : page === 'contact.html' ? 'contact' : (/^class/.test(page) || page === 'pastries.html') ? 'classes' : page === 'index.html' ? 'home' : null;
  if (key) { var el = document.querySelector('.main-nav [data-key="' + key + '"]'); if (el) el.classList.add('current'); }
  document.querySelectorAll('.dr-main').forEach(function (a) { if (a.getAttribute('href') === page || (key === 'classes' && a.getAttribute('href') === 'classes.html')) a.classList.add('current'); });
  document.querySelectorAll('.dd-link').forEach(function (a) { if (a.getAttribute('href') === page) a.style.background = 'rgba(212,164,55,.14)'; });
})();

// Reveal-on-scroll
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
} else {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
}

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep scroll work inside animation frames so rapid wheel/touch input never
// forces repeated style and layout work on the browser's scroll thread.
function rafThrottle(fn) {
  var ticking = false;
  return function () {
    if (ticking) return;
    ticking = true;
    var run = function () { ticking = false; fn(); };
    if ('requestAnimationFrame' in window) requestAnimationFrame(run);
    else setTimeout(run, 16);
  };
}

// Stagger reveals among siblings + directional variants
document.querySelectorAll('.menu-grid, .insta-grid, .steps, .pl-grid, .svc-grid, .info-grid, .pay-grid, .g-grid, .class-choice-grid, .guide-grid, .cd-facts, .bundle-grid, .level-list, .rgrid, .sgrid, .dgrid').forEach(function (g) {
  Array.prototype.forEach.call(g.querySelectorAll('.reveal'), function (el, i) {
    el.style.setProperty('--d', (i % 4) * 0.1 + 's');
  });
});
document.querySelectorAll('.insta-grid .reveal').forEach(function (el) { el.classList.add('zoom'); });
// Page-purpose motion: stagger menu cards and order-builder steps without adding markup.
document.querySelectorAll('.pricelist .pl-card, .menu-guide-grid .menu-guide-card, .op-form .op-step, .ocats .ocat').forEach(function (el, i) {
  el.style.setProperty('--d', (i % 5) * 0.08 + 's');
});
var sp = document.querySelector('.story-photo'); if (sp) sp.classList.add('from-left');
var sc = document.querySelector('.story-grid > div:last-child'); if (sc) sc.classList.add('from-right');

// Scroll progress + header state + hero parallax
var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
var header = document.querySelector('.site-header');
var frame = document.querySelector('.hero-frame');
var headerScrolled = false;
function onScroll() {
  var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  var nextHeaderState = y > 30;
  if (header && nextHeaderState !== headerScrolled) {
    header.classList.toggle('scrolled', nextHeaderState);
    headerScrolled = nextHeaderState;
  }
  if (frame && !reduce && y < 900) frame.style.transform = 'rotate(-1.6deg) translateY(' + (y * -0.08) + 'px)';
}
var scheduleScrollChrome = rafThrottle(onScroll);
addEventListener('scroll', scheduleScrollChrome, { passive: true }); onScroll();

var desktop = window.matchMedia('(min-width: 769px)').matches;
if (!reduce && desktop) {
  // Cursor sheen on menu cards (no tilt)
  document.querySelectorAll('.mcard').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) / r.width * 100 + '%');
      c.style.setProperty('--my', (e.clientY - r.top) / r.height * 100 + '%');
    });
  });
  // A few sprinkles, homepage hero only
  var hero = document.querySelector('.hero');
  if (hero) {
    var box = document.createElement('div'); box.className = 'sprinkles';
    var cols = ['#F7B7C8', '#D4A437', '#F5E6D6'];
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = cols[i % cols.length];
      s.style.animationDuration = 14 + Math.random() * 10 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      box.appendChild(s);
    }
    hero.insertBefore(box, hero.firstChild);
  }
}

// Ambient glass blobs in each section
(function () {
  if (!window.matchMedia('(min-width: 769px)').matches) return;
  var sets = [['pink', 'gold'], ['gold', 'warm'], ['pink', 'warm']];
  document.querySelectorAll('section, .footer').forEach(function (sec, i) {
    sets[i % 3].concat(['pink']).forEach(function (c, j) {
      var b = document.createElement('span');
      b.className = 'blob ' + c;
      var size = 260 + Math.random() * 220;
      b.style.width = b.style.height = size + 'px';
      b.style.left = (j === 0 ? -8 : j === 1 ? 62 : 30) + Math.random() * 12 + '%';
      b.style.top = (j === 1 ? -10 : 45) + Math.random() * 25 + '%';
      b.style.animationDelay = -Math.random() * 18 + 's';
      b.style.animationDuration = 16 + Math.random() * 10 + 's';
      sec.insertBefore(b, sec.firstChild);
    });
  });
})();

// Gallery lightbox
(function () {
  var lb = document.getElementById('lightbox'); if (!lb) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), idx = 0;
  function show(i) { idx = (i + items.length) % items.length; img.src = items[idx].dataset.src; img.alt = items[idx].dataset.cap; cap.innerHTML = items[idx].dataset.cap; }
  function open(i) { show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  items.forEach(function (it, i) { it.addEventListener('click', function () { open(i); }); });
  lb.querySelector('.lb-close').onclick = close;
  lb.querySelector('.lb-prev').onclick = function (e) { e.stopPropagation(); show(idx - 1); };
  lb.querySelector('.lb-next').onclick = function (e) { e.stopPropagation(); show(idx + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

// Class booking form -> WhatsApp (multi-class bundles)
document.querySelectorAll('.book-form').forEach(function (f) {
  var fmt = function (n) { return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var d2 = +f.dataset.d2, d3 = +f.dataset.d3;
  var track = f.dataset.track || 'baking';
  var boxes = Array.prototype.slice.call(f.querySelectorAll('[name=cls]'));
  var seats = f.querySelector('[name=seats]');
  var q = f.querySelector.bind(f);
  // preselect from ?add=slug or ?add=all
  var add = new URLSearchParams(location.search).get('add');
  if (add) boxes.forEach(function (b) { if (add === 'all' || add.split(',').indexOf(b.value) > -1) b.checked = true; });
  var state = {};
  function calc() {
    var chosen = boxes.filter(function (b) { return b.checked; });
    if (!chosen.length) { chosen = [boxes.filter(function (b) { return b.defaultChecked; })[0] || boxes[0]]; chosen[0].checked = true; }
    var sub = chosen.reduce(function (t, b) { return t + (+b.dataset.fee); }, 0);
    var pct = chosen.length >= 3 ? d3 : chosen.length === 2 ? d2 : 0;
    var n = +seats.value, disc = sub * pct / 100, tot = (sub - disc) * n;
    q('.sub').textContent = fmt(sub);
    var discEl = q('.disc'), discPctEl = q('.disc-pct');
    if (discEl) discEl.textContent = fmt(disc);
    if (discPctEl) discPctEl.textContent = pct;
    var discRow = q('.disc-row'); if (discRow) discRow.hidden = !pct;
    q('.n').textContent = n; q('.tot').textContent = fmt(tot);
    state = { chosen: chosen, sub: sub, pct: pct, disc: disc, n: n, tot: tot };
  }
  boxes.forEach(function (b) { b.addEventListener('change', calc); });
  seats.addEventListener('change', calc); calc();
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (n) { var el = f.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ''; };
    var sch = f.querySelector('[name=schedule]:checked') || f.querySelector('[name=schedule]');
    var list = state.chosen.map(function (b) { return '   - ' + b.dataset.name + ' (GH₵ ' + fmt(+b.dataset.fee) + ')'; }).join('\n');
    var intent = track === 'pastry' ? "I'd like to book the pastry classes below" : "I'd like to book the bread classes below";
    var msg = "Hello Mystery Bakebite! 👩🏾‍🍳 " + intent + ".\n\n" +
      '• Class' + (state.chosen.length > 1 ? 'es' : '') + ' (1 week each):\n' + list + '\n' +
      (state.pct ? '• Bundle discount: ' + state.pct + '% (− GH₵ ' + fmt(state.disc) + ' per student)\n' : '') +
      '• Recommended daily time: ' + (sch ? sch.value : '') + '\n' +
      '• Preferred start date: ' + (g('date') || 'Flexible') + '\n' +
      '• Number of students: ' + state.n + '\n' +
      '• Estimated total: GH₵ ' + fmt(state.tot) + '\n\n' +
      'Name: ' + g('name') + '\nPhone: ' + g('phone');
    window.open('https://wa.me/233554520532?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
});

// Soft fade-out when moving between pages
if (!reduce) {
  document.querySelectorAll('a[href]').forEach(function (a) {
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download') || /^(https?:|mailto:|tel:)/.test(h) || h.indexOf('#') > 0 && h.split('#')[0] === location.pathname.split('/').pop()) return;
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); document.body.classList.add('leaving');
      setTimeout(function () { location.href = h; }, 220);
    });
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
}
// Flash the total when it changes
document.querySelectorAll('.book-form').forEach(function (f) {
  var t = f.querySelector('.bk-total b');
  f.addEventListener('change', function () { t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); });
});

// Class page sub-nav: reliable anchor scrolling, active state, and horizontal reveal
(function () {
  var allLinks = document.querySelectorAll('.subnav a[href^="#"]');
  if (!allLinks.length) return;
  var links = document.querySelectorAll('.subnav a:not(.sn-book)');
  var navInner = document.querySelector('.subnav .sn-inner');
  var map = {};

  function revealLink(link) {
    if (!navInner || navInner.scrollWidth <= navInner.clientWidth) return;
    var lr = link.getBoundingClientRect(), nr = navInner.getBoundingClientRect();
    if (lr.left < nr.left + 10 || lr.right > nr.right - 10) {
      navInner.scrollTo({ left: navInner.scrollLeft + (lr.left - nr.left) - 24, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function setActive(id) {
    links.forEach(function (link) { link.classList.toggle('active', link === map[id]); });
    if (map[id]) revealLink(map[id]);
  }

  // Do not rely on the browser's default anchor calculation under the sticky
  // header and sub-navigation. The target sections already define the correct
  // scroll margin, so this keeps every click aligned below both bars.
  allLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = (link.getAttribute('href') || '').slice(1), target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start', inline: 'nearest' });
      try { history.replaceState(null, '', '#' + id); } catch (ignore) {}
      if (map[id]) setActive(id);
    });
  });

  links.forEach(function (link) { map[link.getAttribute('href').slice(1)] = link; });
  if (!('IntersectionObserver' in window)) { setActive('overview'); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && map[entry.target.id]) setActive(entry.target.id);
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
  Object.keys(map).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) io.observe(section);
  });
})();

// Sliding glow pill behind hovered nav item
(function () {
  var nav = document.querySelector('.nav2 .main-nav'), glow = nav && nav.querySelector('.nav-glow'); if (!glow) return;
  var links = nav.querySelectorAll(':scope > .nav-link, :scope > .nav-item > .nav-link');
  function move(el) { var r = el.getBoundingClientRect(), n = nav.getBoundingClientRect(); glow.style.left = (r.left - n.left) + 'px'; glow.style.width = r.width + 'px'; glow.style.opacity = 1; }
  function rest() { var cur = nav.querySelector('.current > .nav-link, .nav-link.current'); if (cur) move(cur); else glow.style.opacity = 0; }
  links.forEach(function (l) { (l.closest('.nav-item') || l).addEventListener('mouseenter', function () { move(l); }); l.addEventListener('focus', function () { move(l); }); });
  nav.addEventListener('mouseleave', function () { if (!nav.querySelector('.has-dd.open')) rest(); });
  setTimeout(rest, 50); addEventListener('resize', rest);
})();

// Home navigation follows sections in page order and keeps the active link in sync.
(function () {
  var page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html') return;
  var sequence = [
    ['story', 'story'], ['menu', 'menu'], ['classes', 'classes'], ['custom', 'custom'],
    ['reviews', 'reviews'], ['gallery', 'gallery'], ['contact', 'contact']
  ];
  var links = document.querySelectorAll('.nav6 .main-nav [data-key]');
  function sync() {
    var line = Math.min(window.innerHeight * .4, 380);
    var active = 'home';
    sequence.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el && el.getBoundingClientRect().top <= line) active = pair[1];
    });
    links.forEach(function (a) { a.classList.toggle('current', a.dataset.key === active); });
  }
  var scheduleHomeNav = rafThrottle(sync);
  addEventListener('scroll', scheduleHomeNav, { passive: true });
  addEventListener('resize', scheduleHomeNav);
  sync();
})();

// Show floating WhatsApp button after the first screen
(function () {
  var f = document.querySelector('.wa-float'); if (!f) return;
  function t() { f.classList.toggle('show', window.scrollY > window.innerHeight * 0.6); }
  var scheduleWa = rafThrottle(t);
  addEventListener('scroll', scheduleWa, { passive: true }); t();
})();

// ============ ORDER PAGE ============
(function () {
  var form = document.getElementById('orderForm'); if (!form) return;
  document.documentElement.classList.add('page-order');
  var fmt = function (n) { return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var rows = Array.prototype.slice.call(form.querySelectorAll('.oi'));
  var list = document.querySelector('.cart-list'), empty = document.querySelector('.cart-empty');
  var err = document.querySelector('.cart-err'), bar = document.querySelector('.cart-bar');
  var q = function (sel) { return document.querySelector(sel); };

  function qtyOf(r) { return Math.max(0, Math.min(99, parseInt(r.querySelector('input').value, 10) || 0)); }
  function set(r, v) { r.querySelector('input').value = Math.max(0, Math.min(99, v)); update(); }

  var cakeBuilder = form.querySelector('.cake-builder');
  var cakeBuilderRow = cakeBuilder && cakeBuilder.querySelector('.cake-builder-line');
  var cakeConfig = window.MB_CAKE_CONFIG || {};
  var cakeState = { structureId: '', files: [] };
  var cakeBuilderFiles = [];
  var cakeBuilderFileUrls = [];

  function cakeEscape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function cakePriceText(item, base) {
    if (!item || item.pricing_type === 'included' || item.price === 0) return 'Included';
    if (item.pricing_type === 'custom_quote' || item.price == null) return 'Custom Quote';
    var amount = 'GH₵ ' + fmt(item.price);
    if (item.range) amount = 'from ' + amount;
    return base ? amount : '+ ' + amount;
  }
  function cakeOptionBy(list, id) {
    return (list || []).filter(function (item) { return item.id === id; })[0] || null;
  }
  function cakeStructureBy(id) { return cakeOptionBy(cakeConfig.structures, id); }
  function cakeTierCount(id) {
    if (id === 'one-layer' || id === 'one-tier') return 1;
    if (id === 'two-tier') return 2;
    if (id === 'three-tier') return 3;
    if (id === 'four-tier') return 4;
    return 0;
  }
  function cakeFieldName(prefix, key) { return prefix + '-' + key; }
  function cakeRadioValue(name) {
    var select = cakeBuilder && cakeBuilder.querySelector('select[name="' + name + '"]');
    if (select) return select.value || '';
    var input = cakeBuilder && cakeBuilder.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : '';
  }
  function cakeCheckedValues(name) {
    var select = cakeBuilder && cakeBuilder.querySelector('select[name="' + name + '"]');
    if (select) return Array.prototype.slice.call(select.selectedOptions || []).map(function (option) { return option.value; }).filter(Boolean);
    return Array.prototype.slice.call(cakeBuilder ? cakeBuilder.querySelectorAll('input[name="' + name + '"]:checked') : []).map(function (input) { return input.value; });
  }
  function cakeTierLabel(index, count) {
    if (count === 1) return 'Cake configuration';
    var labels = ['Bottom', 'Middle', 'Upper Middle', 'Top'];
    if (count === 2) labels = ['Bottom', 'Top'];
    if (count === 3) labels = ['Bottom', 'Middle', 'Top'];
    return 'Tier ' + (index + 1) + ' — ' + labels[index];
  }
  function cakeOptionCards(list, name, mode, selected, group, required) {
    var selectedValues = Array.isArray(selected) ? selected : [selected || ''];
    var max = mode === 'multiple' ? (group === 'filling' ? cakeConfig.limits.fillings : group === 'decoration' ? cakeConfig.limits.decorations : group === 'topping' ? cakeConfig.limits.toppings : group === 'extras' ? cakeConfig.limits.extras : 10) : 1;
    var placeholder = mode === 'multiple' ? 'Select up to ' + max + ' options' : 'Choose an option';
    var options = (list || []).filter(function (item) { return item.active !== false; }).map(function (item) {
      var selectedAttr = selectedValues.indexOf(item.id) > -1 ? ' selected' : '';
      return '<option value="' + cakeEscape(item.id) + '"' + selectedAttr + '>' + cakeEscape(item.name) + ' · ' + cakeEscape(cakePriceText(item, group === 'size')) + '</option>';
    }).join('');
    var multiple = mode === 'multiple' ? ' multiple size="1"' : '';
    var placeholderOption = mode === 'multiple' ? '' : '<option value="">' + cakeEscape(placeholder) + '</option>';
    return '<fieldset class="cake-choice-group cake-choice-' + mode + '" data-builder-group="' + cakeEscape(group || name) + '" data-max="' + max + '">' +
      '<legend>' + cakeEscape(name) + (required ? ' <i>Required</i>' : '') + '</legend>' +
      '<select class="cake-choice-select" name="' + cakeEscape(name) + '" data-option-group="' + cakeEscape(group || name) + '"' + multiple + (required ? ' aria-required="true"' : '') + '>' + placeholderOption + options + '</select>' +
      (mode === 'multiple' ? '<small class="cake-select-help">' + cakeEscape(placeholder) + '</small>' : '') + '</fieldset>';
  }
  function cakeSizeOptions(shape, tierIndex, previousSize) {
    var allowed = (shape && cakeConfig.shapeSizes && cakeConfig.shapeSizes[shape]) || cakeConfig.sizeOrder || [];
    var previousNumber = previousSize ? parseFloat(previousSize) : null;
    if (tierIndex > 0 && previousNumber) allowed = allowed.filter(function (id) { return parseFloat(id) <= previousNumber; });
    return (cakeConfig.sizes || []).filter(function (item) { return item.active !== false && allowed.indexOf(item.id) > -1; }).sort(function (a, b) { return (cakeConfig.sizeOrder || []).indexOf(a.id) - (cakeConfig.sizeOrder || []).indexOf(b.id); });
  }
  function cakeTierFieldMarkup(index, count, shape) {
    var prefix = 'tier-' + index;
    var previousSize = index === 1 ? cakeRadioValue('cake-global-size') : (index > 1 ? cakeRadioValue(cakeFieldName('tier-' + (index - 1), 'size')) : '');
    var sizeList = cakeSizeOptions(shape, index, previousSize);
    var selectedSize = index === 0 ? cakeRadioValue('cake-global-size') : cakeRadioValue(cakeFieldName(prefix, 'size'));
    var selectedLayers = cakeRadioValue(cakeFieldName(prefix, 'layers'));
    var selectedFlavour = cakeRadioValue(cakeFieldName(prefix, 'flavour'));
    var selectedFilling = cakeRadioValue(cakeFieldName(prefix, 'filling'));
    var selectedIcing = cakeRadioValue(cakeFieldName(prefix, 'icing'));
    var fields = '';
    if (index > 0) fields += cakeOptionCards(sizeList, cakeFieldName(prefix, 'size'), 'single', selectedSize, 'size-' + index, true);
    if (count > 1 || cakeState.structureId === 'one-tier') fields += cakeOptionCards(cakeConfig.internalLayers, cakeFieldName(prefix, 'layers'), 'single', selectedLayers, 'layers', true);
    fields += cakeOptionCards(cakeConfig.flavours, cakeFieldName(prefix, 'flavour'), 'single', selectedFlavour, 'flavour', true);
    fields += cakeOptionCards(cakeConfig.fillings, cakeFieldName(prefix, 'filling'), 'single', selectedFilling, 'filling', false);
    fields += cakeOptionCards(cakeConfig.icings, cakeFieldName(prefix, 'icing'), 'single', selectedIcing, 'icing', true);
    return '<article class="cake-tier-card" data-tier-index="' + index + '"><header><div><span class="cake-tier-kicker">' + cakeEscape(count === 1 ? 'Cake configuration' : 'Tier ' + (index + 1)) + '</span><h4>' + cakeEscape(cakeTierLabel(index, count)) + '</h4></div><div class="cake-tier-head-actions"><strong data-tier-subtotal>GH₵ 0.00</strong><button type="button" class="cake-tier-edit" data-tier-edit="' + index + '">Edit</button></div></header><p class="cake-tier-help">' + cakeEscape(count === 1 ? 'Choose the cake details below. A layer is one cake layer; a tier is a separate stacked cake size.' : 'The next tier is filtered to a smaller or equal size so the stack remains valid.') + '</p><div class="cake-tier-fields">' + fields + '</div><p class="cake-inline-error" data-tier-error hidden></p></article>';
  }
  function cakeRenderStructureOptions() {
    if (!cakeBuilder) return;
    var target = cakeBuilder.querySelector('#cakeStructureOptions');
    target.innerHTML = '<div class="cake-simple-select-grid"><label class="cake-structure-select-label"><span>Cake type <i>Required</i></span><select name="cake-structure" aria-required="true"><option value="">Choose a cake type</option>' + (cakeConfig.structures || []).map(function (item) {
      return '<option value="' + cakeEscape(item.id) + '">' + cakeEscape(item.name) + '</option>';
    }).join('') + '</select></label><label class="cake-structure-select-label"><span>Shape <i>Required</i></span><select name="cake-global-shape" aria-required="true"><option value="">Choose a shape</option>' + (cakeConfig.shapes || []).filter(function (item) { return item.active !== false; }).map(function (item) {
      return '<option value="' + cakeEscape(item.id) + '">' + cakeEscape(item.name) + '</option>';
    }).join('') + '</select></label><label class="cake-structure-select-label"><span>Size <i>Required</i></span><select name="cake-global-size" aria-required="true"><option value="">Choose a size</option></select></label></div><small class="cake-simple-help">For tiered cakes, this is the cake size for one cake or the bottom tier. Upper tiers are chosen smaller in the next step.</small>';
    cakeRenderGlobalSizeOptions();
  }
  function cakeRenderGlobalSizeOptions() {
    if (!cakeBuilder) return;
    var select = cakeBuilder.querySelector('select[name="cake-global-size"]');
    if (!select) return;
    var shape = cakeRadioValue('cake-global-shape'), current = select.value;
    var allowed = (shape && cakeConfig.shapeSizes && cakeConfig.shapeSizes[shape]) || cakeConfig.sizeOrder || [];
    var options = (cakeConfig.sizes || []).filter(function (item) { return item.active !== false && allowed.indexOf(item.id) > -1; }).sort(function (a, b) { return (cakeConfig.sizeOrder || []).indexOf(a.id) - (cakeConfig.sizeOrder || []).indexOf(b.id); });
    select.innerHTML = '<option value="">Choose a size</option>' + options.map(function (item) { return '<option value="' + cakeEscape(item.id) + '">' + cakeEscape(item.name) + ' · ' + cakeEscape(cakePriceText(item, true)) + '</option>'; }).join('');
    if (options.some(function (item) { return item.id === current; })) select.value = current;
  }
  function cakeUploadMarkup() {
    return '<div class="cake-upload-field"><label for="cakeInspirationImages">Inspiration images <small>Optional · up to ' + cakeConfig.limits.inspirationImages + ' JPG, PNG or WEBP files · ' + cakeConfig.limits.maxFileSizeMb + 'MB each</small></label><input id="cakeInspirationImages" type="file" accept="image/jpeg,image/png,image/webp" multiple><div class="cake-upload-list" id="cakeUploadList">No inspiration images added.</div><p class="cake-upload-help">Images are listed in your order request. Please also attach them in the WhatsApp chat so the baker can review them.</p></div>';
  }
  function cakeRenderOverall(count) {
    var overall = cakeBuilder.querySelector('#cakeOverallConfig');
    if (!overall) return;
    var selectedDesign = cakeRadioValue('cake-design') || 'simple', selectedExtras = cakeCheckedValues('cake-extras'), selectedTopper = cakeRadioValue('cake-topper') || 'none', selectedColour = cakeRadioValue('cake-colour') || 'colour-0';
    var extraOptions = (cakeConfig.decorations || []).concat(cakeConfig.toppings || []);
    var html = '<div class="cake-overall-heading"><span class="cake-tier-kicker">Final touches</span><h4>Keep it simple</h4><p>Choose one design and any extras. The baker will confirm unusual requests.</p></div>';
    html += '<div class="cake-overall-fields">';
    html += cakeOptionCards(cakeConfig.designs, 'cake-design', 'single', selectedDesign, 'design', false);
    html += cakeOptionCards(extraOptions, 'cake-extras', 'multiple', selectedExtras, 'extras', false);
    html += cakeOptionCards(cakeConfig.toppers, 'cake-topper', 'single', selectedTopper, 'topper', false);
    html += cakeOptionCards(cakeConfig.colours, 'cake-colour', 'single', selectedColour, 'colour', false);
    html += '<label class="cake-custom-colour-field" data-custom-colour-for="global" hidden><span>Custom colour</span><input type="color" name="cake-custom-colour" value="#F7B7C8"><small>Use this only when Custom Colour is selected.</small></label>';
    html += '<label class="cake-text-field"><span>Message or special request</span><input id="cakeOverallMessage" maxlength="120" type="text" placeholder="e.g. Happy Birthday Ama"><small>Use this for colours, themes or anything not covered above.</small></label>';
    html += cakeUploadMarkup() + '</div>';
    overall.innerHTML = html;
    var msg = overall.querySelector('#cakeOverallMessage'); if (msg && cakeState.message) msg.value = cakeState.message;
    cakeRenderUploadList();
  }
  function cakeRenderCustom() {
    var custom = cakeBuilder.querySelector('#cakeCustomQuotePanel');
    if (!custom) return;
    custom.innerHTML = '<div class="cake-custom-quote"><span class="cake-tier-kicker">Baker review</span><h4>Custom cake brief</h4><p><b>Custom Quote Required.</b> Describe the unusual size, structure or design and the baker will confirm the final price before production.</p><label class="cake-text-field"><span>Describe your custom cake <i>Required</i></span><textarea id="cakeCustomDescription" maxlength="1000" rows="5" placeholder="Tell us what you need, including size, shape, servings or special construction."></textarea></label>' + cakeUploadMarkup() + '</div>';
    var text = custom.querySelector('#cakeCustomDescription'); if (text && cakeState.customDescription) text.value = cakeState.customDescription;
    cakeRenderUploadList();
  }
  function cakeRenderUploadList() {
    var list = cakeBuilder && cakeBuilder.querySelector('#cakeUploadList');
    if (!list) return;
    cakeBuilderFileUrls.forEach(function (url) { try { URL.revokeObjectURL(url); } catch (ignore) {} });
    cakeBuilderFileUrls = [];
    if (!cakeBuilderFiles.length) { list.textContent = 'No inspiration images added.'; return; }
    cakeBuilderFileUrls = cakeBuilderFiles.map(function (file) { return URL.createObjectURL(file); });
    list.innerHTML = cakeBuilderFiles.map(function (file, i) { return '<span class="cake-upload-file"><img src="' + cakeBuilderFileUrls[i] + '" alt=""><b>' + (i + 1) + '</b><span>' + cakeEscape(file.name) + '</span></span>'; }).join('');
  }
  function cakeRenderConfig(id) {
    var panel = cakeBuilder.querySelector('#cakeConfigPanel'), heading = cakeBuilder.querySelector('#cakeConfigHeading'), help = cakeBuilder.querySelector('#cakeConfigHelp'), tiers = cakeBuilder.querySelector('#cakeTierConfigs'), overall = cakeBuilder.querySelector('#cakeOverallConfig'), optional = cakeBuilder.querySelector('#cakeOptionalStep'), custom = cakeBuilder.querySelector('#cakeCustomQuotePanel');
    if (!id) { panel.hidden = true; return; }
    panel.hidden = false;
    var count = cakeTierCount(id);
    if (id === 'custom') {
      heading.textContent = '2 · Tell us about your custom cake'; help.textContent = 'Keep it short: describe the unusual size, shape or design and the baker will prepare a quote.'; tiers.innerHTML = ''; if (optional) optional.hidden = true; overall.hidden = true; custom.hidden = false; cakeRenderCustom(); return;
    }
    heading.textContent = count === 1 && id === 'one-layer' ? '2 · Cake details' : '2 · Configure ' + count + (count === 1 ? ' tier' : ' tiers');
    help.textContent = count === 1 && id === 'one-layer' ? 'One simple cake: choose the size, flavour and icing.' : 'Each tier only needs a size, internal layers, flavour and icing.';
    custom.hidden = true; if (optional) { optional.hidden = false; optional.open = false; } overall.hidden = false;
    var shape = cakeRadioValue('cake-global-shape') || '';
    tiers.innerHTML = Array.apply(null, Array(count)).map(function (_, index) { return cakeTierFieldMarkup(index, count, shape); }).join('');
    cakeRenderOverall(count);
    cakeRefreshSizeConstraints();
    cakeToggleCustomColours();
  }
  function cakeRenderUploadPreviews() {
    var list = cakeBuilder && cakeBuilder.querySelector('#cakeUploadList');
    if (!list || !cakeBuilderFiles.length) return;
    cakeRenderUploadList();
  }
  function cakeRefreshSizeConstraints() {
    if (!cakeBuilder) return;
    var cards = Array.prototype.slice.call(cakeBuilder.querySelectorAll('.cake-tier-card'));
    cards.forEach(function (card, index) {
      if (index === 0) return;
      var previous = index === 1 ? cakeRadioValue('cake-global-size') : cakeRadioValue(cakeFieldName('tier-' + (index - 1), 'size'));
      var previousNumber = previous ? parseFloat(previous) : null;
      var select = card.querySelector('select[data-option-group="size-' + index + '"]');
      if (!select) return;
      Array.prototype.forEach.call(select.options, function (option) {
        if (!option.value) return;
        var invalid = previousNumber == null || parseFloat(option.value) > previousNumber;
        option.disabled = invalid;
        if (invalid && option.selected) option.selected = false;
      });
    });
  }
  function cakeToggleCustomColours() {
    if (!cakeBuilder) return;
    var custom = cakeOptionBy(cakeConfig.colours, 'colour-9');
    var customId = custom ? custom.id : '';
    cakeBuilder.querySelectorAll('[data-custom-colour-for]').forEach(function (field) {
      var prefix = field.dataset.customColourFor;
      field.hidden = cakeRadioValue(prefix === 'global' ? 'cake-colour' : prefix + '-colour') !== customId;
    });
  }
  function cakeHandleMultipleRules(select) {
    var group = select.closest('[data-builder-group]'); if (!group || !select.matches('select[multiple]')) return;
    var groupName = group.dataset.builderGroup;
    var selected = Array.prototype.slice.call(select.selectedOptions || []);
    if (groupName === 'filling') {
      var none = Array.prototype.filter.call(select.options, function (option) { return option.value === 'none'; })[0];
      if (none && none.selected) Array.prototype.forEach.call(select.options, function (option) { if (option !== none) option.selected = false; });
      else if (none) none.selected = false;
      selected = Array.prototype.slice.call(select.selectedOptions || []);
    }
    var max = parseInt(group.dataset.max, 10) || 10;
    if (selected.length > max) {
      selected.slice(max).forEach(function (option) { option.selected = false; });
    }
  }
  function cakeApplyAll(key) {
    var first = cakeRadioValue('tier-0-' + key); if (!first) return;
    var count = cakeTierCount(cakeState.structureId);
    for (var i = 1; i < count; i++) {
      var select = cakeBuilder.querySelector('select[name="tier-' + i + '-' + key + '"]');
      if (select && Array.prototype.some.call(select.options, function (option) { return option.value === first && !option.disabled; })) select.value = first;
    }
    cakeRefreshSizeConstraints(); cakeToggleCustomColours(); cakeSyncBuilder(); update();
  }
  function cakeHandleFiles(input) {
    var files = Array.prototype.slice.call(input.files || []), max = cakeConfig.limits.inspirationImages, maxBytes = cakeConfig.limits.maxFileSizeMb * 1024 * 1024;
    var accepted = files.filter(function (file) { return /image\/(jpeg|png|webp)/i.test(file.type) && file.size <= maxBytes; }).slice(0, max);
    cakeBuilderFiles = accepted;
    var warning = files.length > max ? ' Only the first ' + max + ' images are included.' : '';
    if (accepted.length < files.length) warning += ' JPG, PNG or WEBP files must be under ' + cakeConfig.limits.maxFileSizeMb + 'MB.';
    var help = cakeBuilder.querySelector('.cake-upload-help'); if (help && warning) help.textContent = warning.replace(/^ /, '');
    cakeRenderUploadPreviews(); cakeSyncBuilder(); update();
  }
  function cakeReadTier(index, count) {
    var prefix = 'tier-' + index, size = cakeOptionBy(cakeConfig.sizes, index === 0 ? cakeRadioValue('cake-global-size') : cakeRadioValue(cakeFieldName(prefix, 'size'))), layers = cakeOptionBy(cakeConfig.internalLayers, cakeRadioValue(cakeFieldName(prefix, 'layers'))), flavour = cakeOptionBy(cakeConfig.flavours, cakeRadioValue(cakeFieldName(prefix, 'flavour'))), icing = cakeOptionBy(cakeConfig.icings, cakeRadioValue(cakeFieldName(prefix, 'icing'))), colour = cakeOptionBy(cakeConfig.colours, cakeRadioValue('cake-colour')), customColourInput = cakeBuilder && cakeBuilder.querySelector('input[name="cake-custom-colour"]'), shape = cakeOptionBy(cakeConfig.shapes, cakeRadioValue('cake-global-shape')), fillings = cakeCheckedValues(cakeFieldName(prefix, 'filling')).map(function (id) { return cakeOptionBy(cakeConfig.fillings, id); }).filter(Boolean);
    var total = 0, quote = false, lines = [];
    function add(item, label, base) { if (!item) return; if (item.pricing_type === 'custom_quote' || item.price == null) { quote = true; lines.push(label + ': Custom Quote'); } else { total += Number(item.price || 0); if (item.price > 0) lines.push(label + ': ' + (base ? 'GH₵ ' : '+ GH₵ ') + fmt(item.price) + (item.range ? ' starting' : '')); } }
    add(size, 'Size', true); add(layers, 'Internal layers', false); add(flavour, 'Flavour', false); fillings.forEach(function (item) { add(item, 'Filling', false); }); add(icing, 'Icing', false); add(colour, 'Colour', false); add(shape, 'Shape', false);
    return { index: index, label: cakeTierLabel(index, count), size: size, layers: layers, flavour: flavour, shape: shape, fillings: fillings, icing: icing, colour: colour, customColour: customColourInput ? customColourInput.value : '', subtotal: total, quote: quote, lines: lines };
  }
  function cakeCalculate() {
    var structure = cakeStructureBy(cakeState.structureId), count = cakeTierCount(cakeState.structureId), tiers = [], total = 0, quote = cakeState.structureId === 'custom', lines = [];
    if (structure && count) tiers = Array.apply(null, Array(count)).map(function (_, index) { var tier = cakeReadTier(index, count); total += tier.subtotal; quote = quote || tier.quote; return tier; });
    var design = cakeOptionBy(cakeConfig.designs, cakeRadioValue('cake-design')), extraOptions = (cakeConfig.decorations || []).concat(cakeConfig.toppings || []), extras = cakeCheckedValues('cake-extras').map(function (id) { return cakeOptionBy(extraOptions, id); }).filter(Boolean), decorations = extras.filter(function (item) { return item.category === 'decoration'; }), toppings = extras.filter(function (item) { return item.category === 'topping'; }), topper = cakeOptionBy(cakeConfig.toppers, cakeRadioValue('cake-topper') || 'none');
    function addOverall(item, label) { if (!item) return; if (item.pricing_type === 'custom_quote' || item.price == null) { quote = true; lines.push(label + ': Custom Quote'); } else { total += Number(item.price || 0); if (item.price > 0) lines.push(label + ': +GH₵ ' + fmt(item.price) + (item.range ? ' starting' : '')); } }
    if (design) addOverall(design, 'Design'); decorations.forEach(function (item) { addOverall(item, 'Decoration'); }); toppings.forEach(function (item) { addOverall(item, 'Topping'); }); addOverall(topper, 'Topper');
    var assembly = cakeConfig.assembly[count]; if (assembly && count > 1) addOverall(assembly, 'Assembly / tiering');
    var messageInput = cakeBuilder && cakeBuilder.querySelector('#cakeOverallMessage'), customInput = cakeBuilder && cakeBuilder.querySelector('#cakeCustomDescription');
    var message = messageInput ? messageInput.value.trim() : '', customDescription = customInput ? customInput.value.trim() : '';
    cakeState.message = message; cakeState.customDescription = customDescription; cakeState.files = cakeBuilderFiles.map(function (file) { return file.name; });
    return { structure: structure, structureId: cakeState.structureId, tiers: tiers, design: design, decorations: decorations, toppings: toppings, topper: topper, assembly: assembly, message: message, customDescription: customDescription, files: cakeState.files, total: total, quote: quote, lines: lines };
  }
  function cakeSummaryText(spec) {
    if (!spec.structure) return 'Choose a cake structure to begin.';
    var html = '<div class="cake-summary-structure"><span>Structure</span><b>' + cakeEscape(spec.structure.name) + '</b></div>';
    if (spec.structureId === 'custom') html += '<p>' + cakeEscape(spec.customDescription || 'Custom brief still needed.') + '</p>';
    spec.tiers.forEach(function (tier) {
      html += '<div class="cake-summary-tier"><b>' + cakeEscape(tier.label) + '</b><span>' + cakeEscape(tier.size ? tier.size.name : 'Size not selected') + (tier.flavour ? ' · ' + cakeEscape(tier.flavour.name) : '') + '</span><small>' + (tier.layers ? cakeEscape(tier.layers.name) + ' · ' : '') + (tier.fillings.length ? cakeEscape(tier.fillings.map(function (item) { return item.name; }).join(', ')) + ' · ' : '') + (tier.icing ? cakeEscape(tier.icing.name) : 'Icing not selected') + (tier.colour ? ' · ' + cakeEscape(tier.colour.name) : '') + (tier.customColour && tier.colour && tier.colour.name === 'Custom Colour' ? ' · ' + cakeEscape(tier.customColour) : '') + '</small><em>Subtotal: ' + (tier.quote ? 'Custom Quote' : 'GH₵ ' + fmt(tier.subtotal)) + '</em></div>';
    });
    if (spec.design || spec.decorations.length || spec.toppings.length || spec.topper || spec.message || spec.files.length) {
      html += '<div class="cake-summary-extras"><b>Design & extras</b>';
      if (spec.design) html += '<span>Design: ' + cakeEscape(spec.design.name) + '</span>';
      if (spec.decorations.length) html += '<span>Decorations: ' + cakeEscape(spec.decorations.map(function (item) { return item.name; }).join(', ')) + '</span>';
      if (spec.toppings.length) html += '<span>Toppings: ' + cakeEscape(spec.toppings.map(function (item) { return item.name; }).join(', ')) + '</span>';
      if (spec.topper) html += '<span>Topper: ' + cakeEscape(spec.topper.name) + '</span>';
      if (spec.message) html += '<span>Message: “' + cakeEscape(spec.message) + '”</span>';
      if (spec.files.length) html += '<span>Inspiration images: ' + spec.files.length + ' attached file name' + (spec.files.length === 1 ? '' : 's') + '</span>';
      html += '</div>';
    }
    return html;
  }
  function cakeCartDetails(spec) {
    if (!spec || !spec.structure) return '';
    var html = '<span class="cake-cart-spec"><span class="cake-cart-spec-title">Details:</span>';
    if (spec.structureId === 'custom') {
      html += '<span>Custom brief: ' + cakeEscape(spec.customDescription || 'Awaiting details') + '</span>';
    }
    spec.tiers.forEach(function (tier) {
      html += '<span class="cake-cart-tier"><b>' + cakeEscape(tier.label) + '</b></span>';
      if (tier.shape) html += '<span>Shape: ' + cakeEscape(tier.shape.name) + ' <em>' + cakePriceText(tier.shape, false) + '</em></span>';
      if (tier.size) html += '<span>Size: ' + cakeEscape(tier.size.name) + ' <em>' + cakePriceText(tier.size, true) + '</em></span>';
      if (tier.layers) html += '<span>Layers: ' + cakeEscape(tier.layers.name) + ' <em>' + cakePriceText(tier.layers, false) + '</em></span>';
      if (tier.flavour) html += '<span>Flavour: ' + cakeEscape(tier.flavour.name) + ' <em>' + cakePriceText(tier.flavour, false) + '</em></span>';
      if (tier.fillings.length) tier.fillings.forEach(function (item) { html += '<span>Filling: ' + cakeEscape(item.name) + ' <em>' + cakePriceText(item, false) + '</em></span>'; });
      if (tier.icing) html += '<span>Icing: ' + cakeEscape(tier.icing.name) + ' <em>' + cakePriceText(tier.icing, false) + '</em></span>';
      if (tier.colour) html += '<span>Colour: ' + cakeEscape(tier.colour.name) + ' <em>' + cakePriceText(tier.colour, false) + '</em></span>';
      if (tier.customColour && tier.colour && tier.colour.name === 'Custom Colour') html += '<span>Custom colour: ' + cakeEscape(tier.customColour) + ' <em>Included</em></span>';
      html += '<span class="cake-cart-tier-total">Tier subtotal: <em>' + (tier.quote ? 'Custom Quote' : 'GH₵ ' + fmt(tier.subtotal)) + '</em></span>';
    });
    if (spec.design) html += '<span>Design: ' + cakeEscape(spec.design.name) + ' <em>' + cakePriceText(spec.design, false) + '</em></span>';
    spec.decorations.forEach(function (item) { html += '<span>Extra: ' + cakeEscape(item.name) + ' <em>' + cakePriceText(item, false) + '</em></span>'; });
    spec.toppings.forEach(function (item) { html += '<span>Extra: ' + cakeEscape(item.name) + ' <em>' + cakePriceText(item, false) + '</em></span>'; });
    if (spec.topper) html += '<span>Topper: ' + cakeEscape(spec.topper.name) + ' <em>' + cakePriceText(spec.topper, false) + '</em></span>';
    if (spec.message) html += '<span>Message: “' + cakeEscape(spec.message) + '” <em>Included</em></span>';
    if (spec.files.length) html += '<span>Inspiration images: ' + spec.files.length + ' <em>Included</em></span>';
    if (spec.assembly && spec.tiers.length > 1) html += '<span>Assembly: ' + cakeEscape(spec.assembly.name) + ' <em>' + cakePriceText(spec.assembly, false) + '</em></span>';
    html += '</span>';
    return html;
  }
  function cakeSpecMessage(spec) {
    if (!spec || !spec.structure) return '';
    var lines = ['CUSTOM CAKE SPECIFICATION', 'Structure: ' + spec.structure.name];
    if (spec.structureId === 'custom') lines.push('Custom brief: ' + (spec.customDescription || 'Not provided'));
    spec.tiers.forEach(function (tier) {
      lines.push('', tier.label);
      lines.push('Size: ' + (tier.size ? tier.size.name : 'Not selected'));
      if (tier.shape) lines.push('Shape: ' + tier.shape.name);
      if (tier.layers) lines.push('Internal layers: ' + tier.layers.name);
      lines.push('Flavour: ' + (tier.flavour ? tier.flavour.name : 'Not selected'));
      lines.push('Filling: ' + (tier.fillings.length ? tier.fillings.map(function (item) { return item.name; }).join(', ') : 'No Filling'));
      lines.push('Icing: ' + (tier.icing ? tier.icing.name : 'Not selected'));
      lines.push('Colour: ' + (tier.colour ? tier.colour.name : 'Not selected') + (tier.customColour && tier.colour && tier.colour.name === 'Custom Colour' ? ' (' + tier.customColour + ')' : ''));
      lines.push('Tier subtotal: ' + (tier.quote ? 'Custom Quote' : 'GH₵ ' + fmt(tier.subtotal)));
    });
    if (spec.design) lines.push('', 'Design: ' + spec.design.name);
    if (spec.decorations.length) lines.push('Decorations: ' + spec.decorations.map(function (item) { return item.name; }).join(', '));
    if (spec.toppings.length) lines.push('Toppings: ' + spec.toppings.map(function (item) { return item.name; }).join(', '));
    if (spec.topper) lines.push('Cake topper: ' + spec.topper.name);
    if (spec.message) lines.push('Cake message: "' + spec.message + '"');
    if (spec.files.length) lines.push('Inspiration images to attach: ' + spec.files.join(', '));
    lines.push('', spec.quote ? 'Status: AWAITING BAKER REVIEW / CUSTOM QUOTE' : 'Status: ESTIMATE AWAITING BAKER CONFIRMATION', 'Estimated cake total: ' + (spec.quote ? 'GH₵ ' + fmt(spec.total) + ' + custom quote items' : 'GH₵ ' + fmt(spec.total)));
    return lines.join('\n');
  }
  function cakeUpdateProgress(step) {
    if (!cakeBuilder) return;
    cakeBuilder.querySelectorAll('#cakeProgress li').forEach(function (item, index) { item.classList.toggle('is-active', index + 1 === step); item.classList.toggle('is-done', index + 1 < step); });
  }
  function cakeSyncBuilder() {
    if (!cakeBuilder || !cakeBuilderRow) return;
    var spec = cakeCalculate();
    var shortName = spec.structure ? spec.structure.name : 'Customized cake';
    cakeBuilderRow.dataset.name = 'Custom cake: ' + shortName + (spec.quote ? ' · Awaiting baker quote' : '');
    cakeBuilderRow.dataset.price = Number(spec.total || 0).toFixed(2);
    cakeBuilderRow.dataset.cakeSpec = JSON.stringify(spec);
    var info = cakeBuilderRow.querySelector('.oi-info b'), variant = cakeBuilderRow.querySelector('.oi-var'), price = cakeBuilderRow.querySelector('.oi-price');
    if (info) info.textContent = 'Custom cake: ' + shortName;
    if (variant) variant.textContent = spec.structure ? (spec.tiers.length ? spec.tiers.length + (spec.tiers.length === 1 ? ' configuration' : ' tiers') + (spec.message ? ' · message added' : '') : 'Custom brief') : 'Choose your cake details above';
    if (price) price.textContent = spec.quote ? 'GH₵ ' + fmt(spec.total) + ' + review' : 'GH₵ ' + fmt(spec.total);
    var totalLabel = cakeBuilder.querySelector('#cakeBuilderTotalLabel'), total = cakeBuilder.querySelector('#cakeBuilderTotal'), summary = cakeBuilder.querySelector('#cakeBuilderSummary'), review = cakeBuilder.querySelector('#cakeBuilderReviewNote'), add = cakeBuilder.querySelector('#addCakeBuilder');
    if (totalLabel) totalLabel.textContent = spec.quote ? 'Estimate + baker review' : 'Estimated cake total';
    if (total) total.textContent = 'GH₵ ' + fmt(spec.total || 0) + (spec.quote ? ' +' : '');
    if (summary) summary.innerHTML = cakeSummaryText(spec);
    cakeBuilder.querySelectorAll('.cake-tier-card').forEach(function (card, index) {
      var tierTotal = card.querySelector('[data-tier-subtotal]'), tier = spec.tiers[index];
      if (tierTotal && tier) tierTotal.textContent = tier.quote ? 'GH₵ ' + fmt(tier.subtotal) + ' + review' : 'GH₵ ' + fmt(tier.subtotal);
    });
    if (review) review.textContent = spec.quote ? 'Custom Quote Required. The baker will review the full specification before confirming the final price.' : 'Your final design and price are confirmed by the baker before production.';
    if (add) add.disabled = !spec.structure;
    var addedQuantity = cakeBuilder.querySelector('.cake-builder-line') ? (parseInt(cakeBuilderRow.querySelector('input').value, 10) || 0) : 0;
    cakeUpdateProgress(spec.structure ? (addedQuantity > 0 ? 3 : 2) : 1);
  }
  function cakeValidation() {
    var spec = cakeCalculate(), errors = [];
    if (!spec.structure) errors.push('Please choose a cake structure first.');
    if (spec.structureId === 'custom') { if (!spec.customDescription) errors.push('Please describe your custom cake so the baker can prepare a quote.'); }
    else {
      if (!cakeRadioValue('cake-global-shape')) errors.push('Please select a cake shape.');
      if (!cakeRadioValue('cake-global-size')) errors.push('Please select a cake size.');
      spec.tiers.forEach(function (tier, index) {
        if (index > 0 && !tier.size) errors.push('Please select a smaller size for ' + tier.label + '.');
        if (!tier.layers && (spec.structureId !== 'one-layer')) errors.push('Please select the number of internal layers for ' + tier.label + '.');
        if (!tier.flavour) errors.push('Please select a flavour for ' + tier.label + '.');
        if (!tier.icing) errors.push('Please select an icing for ' + tier.label + '.');
        if (!tier.colour) errors.push('Please select an icing colour for ' + tier.label + '.');
        if (tier.fillings.length > cakeConfig.limits.fillings) errors.push(tier.label + ' can have a maximum of ' + cakeConfig.limits.fillings + ' fillings.');
      });
      // Design, topper and extras are optional; simple defaults keep the order quick.
    }
    if (cakeBuilderFiles.length > cakeConfig.limits.inspirationImages) errors.push('Please select no more than ' + cakeConfig.limits.inspirationImages + ' inspiration images.');
    return { spec: spec, errors: errors };
  }
  function cakeShowErrors(errors) {
    var box = cakeBuilder && cakeBuilder.querySelector('#cakeBuilderValidation');
    if (!box) return;
    box.hidden = !errors.length; box.innerHTML = errors.length ? '<b>Please complete the cake builder:</b><ul>' + errors.map(function (error) { return '<li>' + cakeEscape(error) + '</li>'; }).join('') + '</ul>' : '';
    if (errors.length) box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
  if (cakeBuilder) {
    cakeRenderStructureOptions();
    var validation = document.createElement('div'); validation.id = 'cakeBuilderValidation'; validation.className = 'cake-builder-validation'; validation.hidden = true; cakeBuilder.querySelector('.cake-builder-main').appendChild(validation);
    cakeBuilder.querySelector('#cakeStructureOptions').addEventListener('change', function (event) {
      if (event.target.name === 'cake-structure') {
        cakeState.structureId = event.target.value; cakeState.message = ''; cakeState.customDescription = ''; cakeBuilderFiles = []; cakeRenderConfig(cakeState.structureId);
        var panel = cakeBuilder.querySelector('#cakeConfigPanel'); if (panel) setTimeout(function () { panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 80);
      } else if (event.target.name === 'cake-global-shape') {
        cakeRenderGlobalSizeOptions();
        if (cakeState.structureId) cakeRenderConfig(cakeState.structureId);
      } else if (event.target.name === 'cake-global-size' && cakeState.structureId) {
        cakeRenderConfig(cakeState.structureId);
      }
      cakeToggleCustomColours(); cakeSyncBuilder();
    });
    cakeBuilder.addEventListener('change', function (event) {
      var input = event.target;
      if (input.id === 'cakeInspirationImages') { cakeHandleFiles(input); return; }
      if (input.matches('select[multiple]')) cakeHandleMultipleRules(input);
      if (input.name && input.name.indexOf('-size') > -1) cakeRefreshSizeConstraints();
      cakeToggleCustomColours();
      cakeSyncBuilder(); update();
    });
    cakeBuilder.addEventListener('input', function (event) { if (event.target.matches('textarea, #cakeOverallMessage')) { cakeSyncBuilder(); update(); } });
    cakeBuilder.addEventListener('click', function (event) {
      var apply = event.target.closest('[data-apply-all]'); if (apply) { cakeApplyAll(apply.dataset.applyAll); return; }
      var edit = event.target.closest('[data-tier-edit]'); if (edit) { var card = cakeBuilder.querySelector('.cake-tier-card[data-tier-index="' + edit.dataset.tierEdit + '"]'); if (card) { card.classList.remove('is-collapsed'); card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } return; }
    });
    var addCakeButton = cakeBuilder.querySelector('#addCakeBuilder');
    if (addCakeButton) addCakeButton.addEventListener('click', function () { var result = cakeValidation(); cakeShowErrors(result.errors); if (result.errors.length) return; cakeBuilderRow.querySelector('input').value = 1; cakeSyncBuilder(); update(); cakeBuilderRow.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); });
  }
  rows.forEach(function (r) {
    r.querySelector('.q-plus').addEventListener('click', function () { set(r, qtyOf(r) + 1); });
    r.querySelector('.q-minus').addEventListener('click', function () { set(r, qtyOf(r) - 1); });
    r.querySelector('input').addEventListener('input', update);
  });

  // preselect from ?add=id and open #cat-
  var add = new URLSearchParams(location.search).get('add');
  if (add) { var r0 = rows.filter(function (r) { return r.dataset.id === add; })[0]; if (r0) { r0.querySelector('input').value = 1; var d = r0.closest('details'); d.open = true; setTimeout(function () { d.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); } }
  if (location.hash.indexOf('#cat-') === 0) { var d2 = document.querySelector(location.hash); if (d2) d2.open = true; }

  // min date = today
  var dt = form.querySelector('[name=date]'); var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); dt.min = t.toISOString().slice(0, 10);

  form.querySelectorAll('[name=fulfil]').forEach(function (x) { x.addEventListener('change', update); });
  form.querySelectorAll('[name=pay]').forEach(function (x) { x.addEventListener('change', update); });

  function chosen() { return rows.filter(function (r) { return qtyOf(r) > 0; }); }
  function update() {
    cakeSyncBuilder();
    var items = chosen(), sub = 0, n = 0;
    list.innerHTML = '';
    items.forEach(function (r) {
      var qn = qtyOf(r), line = qn * parseFloat(r.dataset.price); sub += line; n += qn;
      var li = document.createElement('li');
      var cakeDetails = '';
      if (r.dataset.cakeSpec) { try { cakeDetails = cakeCartDetails(JSON.parse(r.dataset.cakeSpec)); } catch (ignore) {} }
      li.innerHTML = '<span class="oli-q">' + qn + '×</span><span class="oli-n">' + r.dataset.name + '<small>' + r.dataset.cat + '</small>' + cakeDetails + '</span><span class="oli-p">GH₵ ' + fmt(line) + '</span><button type="button" class="oli-x" aria-label="Remove">×</button>';
      li.querySelector('.oli-x').addEventListener('click', function () { set(r, 0); });
      list.appendChild(li);
    });
    empty.hidden = items.length > 0;
    // category counters
    document.querySelectorAll('.ocat').forEach(function (d) {
      var c = 0; d.querySelectorAll('.oi').forEach(function (r) { c += qtyOf(r); r.classList.toggle('on', qtyOf(r) > 0); });
      var b = d.querySelector('.oc-count'); b.textContent = c; b.hidden = !c;
      var tp = d.querySelector('.topping');
      if (tp) tp.hidden = !Array.prototype.some.call(d.querySelectorAll('.oi[data-id$="t"]'), function (r) { return qtyOf(r) > 0; });
    });
    var deliv = form.querySelector('[name=fulfil]:checked').value === 'Delivery';
    form.querySelector('.deliv').hidden = !deliv; q('.c-del').hidden = !deliv;
    var pay = form.querySelector('[name=pay]:checked').value;
    form.querySelector('.momo-net').hidden = pay.indexOf('Mobile Money') < 0;
    q('.c-paym').textContent = pay.indexOf('Mobile Money') > -1 ? 'MoMo, full upfront' : 'Cash on delivery / pickup';
    q('.c-sub').textContent = fmt(sub); q('.c-total').textContent = fmt(sub) + (deliv ? ' + delivery' : '');
    q('.cb-n').textContent = n; q('.cb-t').textContent = fmt(sub); bar.hidden = n === 0;
    err.hidden = true;
    return { items: items, sub: sub, n: n, deliv: deliv, pay: pay };
  }
  update();

  function fail(msg, el) { err.textContent = msg; err.hidden = false; if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }

  var receiptBox = document.getElementById('receiptResult');
  var receiptMarkup = '', receiptFileStamp = '';
  function escReceipt(value) {
    return String(value == null ? '' : value).replace(/[&<>"\']/g, function (ch) {
      var entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return entities[ch];
    });
  }
  function logoDataUrl() {
    // Embedded during the build so the standalone printable receipt always carries the logo.
    return form.dataset.receiptLogo || '';
  }
  function makeReceipt(data) {
    var logo = data.logo ? '<img class="receipt-logo" src="' + data.logo + '" alt="Mystery Bakebite logo">' : '';
    var rows = data.items.map(function (it) {
      return '<tr><td><b>' + escReceipt(it.name) + '</b><small>' + escReceipt(it.category) + '</small>' + (it.details ? '<small class="receipt-details">' + escReceipt(it.details).replace(/\n/g, '<br>') + '</small>' : '') + '</td><td>' + it.qty + '</td><td>GH₵ ' + fmt(it.unit) + '</td><td>GH₵ ' + fmt(it.line) + '</td></tr>';
    }).join('');
    var delivery = data.delivery ? '<div class="sum-row"><span>Delivery fee</span><b>Confirmed on WhatsApp</b></div>' : '<div class="sum-row"><span>Pickup</span><b>Free</b></div>';
    var notes = data.notes ? '<section class="receipt-info"><h3>Order notes</h3><p>' + escReceipt(data.notes).replace(/\n/g, '<br>') + '</p></section>' : '';
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mystery Bakebite order receipt</title><style>' +
      ' :root{--brown:#3A1F0F;--gold:#D4A437;--pink:#F7B7C8;--cream:#F5E6D6;--warm:#8B5E3C}*{box-sizing:border-box}body{width:80mm;max-width:100vw;margin:0 auto;padding:0;background:#fff;color:var(--brown);font:11px/1.45 Georgia,serif}.receipt{width:80mm;max-width:100%;margin:0 auto;padding:4mm;background:#fff;color:var(--brown);border:0;border-radius:0;box-shadow:none}.brand{display:flex;flex-direction:column;align-items:center;gap:2mm;padding-bottom:3mm;border-bottom:1px dashed rgba(139,94,60,.45);text-align:center}.receipt-logo{display:block;width:36mm;height:36mm;max-width:100%;object-fit:contain;border:0;border-radius:0;background:transparent}.eyebrow{color:var(--warm);font-size:8px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase}.brand h1{margin:1mm 0 0;font-size:15px;line-height:1.15;color:var(--brown)}.slogan{margin:1mm 0 0;color:var(--warm);font-size:9px;font-style:italic}.title{display:flex;align-items:flex-start;flex-direction:column;gap:2mm;margin:4mm 0}.title h2{margin:0;font-size:16px;line-height:1.2}.title p{margin:1mm 0 0;color:var(--warm);font-size:9px}.status{display:inline-block;padding:1.5mm 2mm;border:1px solid var(--gold);border-radius:99px;color:var(--brown);background:rgba(212,164,55,.14);font-size:7px;font-weight:bold;letter-spacing:.08em;text-align:center}.table-wrap{width:100%;overflow:visible}table{width:100%;table-layout:fixed;border-collapse:collapse}th{padding:1.5mm .8mm;text-align:left;color:var(--warm);font-size:7px;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(--gold)}td{padding:2mm .8mm;border-bottom:1px dashed rgba(139,94,60,.26);vertical-align:top;font-size:8px;overflow-wrap:anywhere}td small{display:block;color:var(--warm);font-size:7px}th:nth-child(1),td:nth-child(1){width:39%}th:nth-child(2),td:nth-child(2){width:9%}th:nth-child(3),td:nth-child(3){width:25%}th:nth-child(4),td:nth-child(4){width:27%}td:nth-child(n+2),th:nth-child(n+2){text-align:right;white-space:nowrap}.summary{width:100%;max-width:none;margin:4mm 0 0;padding:2mm;border:1px solid rgba(212,164,55,.5);border-radius:2mm;background:#fff}.sum-row{display:flex;justify-content:space-between;gap:2mm;padding:1mm 0;color:var(--warm);font-size:8px}.sum-total{display:flex;justify-content:space-between;gap:2mm;padding-top:2mm;margin-top:1mm;border-top:1px solid var(--gold);font-weight:bold;color:var(--brown);font-size:11px}.sum-total b{color:var(--brown)}.receipt-info{margin-top:3mm;padding-top:2mm;border-top:1px dashed rgba(139,94,60,.3)}.receipt-info h3{margin:0 0 1mm;font-size:9px}.receipt-info p{margin:0;color:var(--warm);font-size:8px}.notice{margin:3mm 0 0;padding:2mm;border-left:2px solid var(--gold);background:rgba(212,164,55,.08);color:var(--warm);font-size:8px}.contact{margin-top:3mm;color:var(--warm);font-size:7px;text-align:center;overflow-wrap:anywhere}.actions{margin-top:4mm;display:flex;justify-content:center;gap:2mm;flex-wrap:wrap}.actions button{border:0;border-radius:99px;padding:2mm 3mm;background:var(--brown);color:var(--cream);font:inherit;font-size:9px;font-weight:bold;cursor:pointer}.actions button:hover{background:var(--warm)}@media(max-width:340px){body,.receipt{width:100vw}}@page{size:80mm 250mm;margin:0}@media print{html,body{width:80mm;min-width:80mm;max-width:80mm;margin:0;padding:0;background:#fff}.receipt{width:80mm;max-width:80mm;margin:0;padding:4mm 4mm 6mm;border:0;border-radius:0;box-shadow:none}.actions{display:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}' +
      '</style></head><body><main class="receipt"><header class="brand">' + logo + '<div><span class="eyebrow">Tamale, Ghana</span><h1>Mystery Bakebite</h1><p class="slogan">Unveiling The Uniqueness of A Recipe</p></div></header>' +
      '<section class="title"><div><h2>Order request receipt</h2><p>Prepared ' + escReceipt(data.created) + '</p></div><span class="status">AWAITING WHATSAPP CONFIRMATION</span></section>' +
      '<section class="receipt-info"><h3>Customer</h3><p><b>' + escReceipt(data.name) + '</b><br>' + escReceipt(data.phone) + (data.email ? '<br>' + escReceipt(data.email) : '') + '</p></section>' +
      '<section class="receipt-info"><h3>Order details</h3><p>' + escReceipt(data.fulfilment) + ' on ' + escReceipt(data.date) + ' at ' + escReceipt(data.time) + (data.delivery && data.area ? '<br>Delivery area: ' + escReceipt(data.area) : '') + '</p></section>' +
      '<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<section class="summary"><div class="sum-row"><span>Subtotal</span><b>GH₵ ' + fmt(data.subtotal) + '</b></div>' + delivery + '<div class="sum-row"><span>Payment</span><b>' + escReceipt(data.payment) + '</b></div><div class="sum-total"><span>Estimated total</span><b>GH₵ ' + fmt(data.subtotal) + (data.delivery ? ' + delivery' : '') + '</b></div></section>' +
      notes + '<p class="notice">This is an order request receipt, not proof of payment. We will confirm availability, any delivery fee and your final total in the WhatsApp chat.</p>' +
      '<p class="contact">+233 55 452 0532 · mysterybakebite@gmail.com · Tamale, Ghana</p><div class="actions"><button onclick="window.print()">Print or save as PDF</button></div></main></body></html>';
  }
  function saveReceipt() {
    if (!receiptMarkup) return;
    var url = URL.createObjectURL(new Blob([receiptMarkup], { type: 'text/html;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = 'Mystery-Bakebite-Order-Receipt-' + receiptFileStamp + '.html';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }
  function openReceiptForPrint() {
    if (!receiptMarkup) return;
    var url = URL.createObjectURL(new Blob([receiptMarkup], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener'); setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }
  // The receipt is downloaded automatically as soon as it is generated.
  // Printing remains available as a separate POS/PDF action.
  var printReceiptButton = document.getElementById('printReceipt');
  if (printReceiptButton) printReceiptButton.addEventListener('click', openReceiptForPrint);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var s = update(), g = function (nm) { var el = form.querySelector('[name=' + nm + ']'); return el ? el.value.trim() : ''; };
    if (!s.items.length) return fail('Please add at least one item to your order.', document.querySelector('.ocat summary'));
    if (!g('date')) return fail('Please choose the date you need your order.', form.querySelector('[name=date]'));
    if (s.deliv && !g('area')) return fail('Please enter your delivery area or landmark.', form.querySelector('[name=area]'));
    if (!g('name')) return fail('Please enter your name.', form.querySelector('[name=name]'));
    if (!g('phone')) return fail('Please enter your phone number.', form.querySelector('[name=phone]'));
    var lines = s.items.map(function (r) {
      var qn = qtyOf(r), line = '• ' + qn + ' × ' + r.dataset.name + ' (' + r.dataset.cat + ') = GH₵ ' + fmt(qn * parseFloat(r.dataset.price));
      if (r.dataset.cakeSpec) { try { line += '\n' + cakeSpecMessage(JSON.parse(r.dataset.cakeSpec)); } catch (ignore) {} }
      return line;
    }).join('\n');
    var tp = form.querySelector('.topping:not([hidden]) select');
    var momo = s.pay.indexOf('Mobile Money') > -1;
    var net = form.querySelector('[name=net]:checked');
    var d = new Date(g('date') + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    var msg = "Hello Mystery Bakebite! 🍩 I'd like to place an order.\n\n" +
      '*ORDER*\n' + lines + '\n' + (tp ? 'Loaf topping: ' + tp.value + '\n' : '') +
      '\nSubtotal: GH₵ ' + fmt(s.sub) + (s.deliv ? ' (+ delivery fee)' : '') + '\n\n' +
      '*' + (s.deliv ? 'DELIVERY' : 'PICKUP') + '*\n' +
      'Date: ' + d + '\nTime: ' + g('time') + '\n' + (s.deliv ? 'Area: ' + g('area') + '\n' : '') + '\n' +
      '*PAYMENT*\n' + (momo ? 'Full payment upfront via Mobile Money (' + (net ? net.value : '') + '). Please send your MoMo details.' : 'Cash on ' + (s.deliv ? 'delivery' : 'pickup')) + '\n\n' +
      '*CUSTOMER*\nName: ' + g('name') + '\nPhone: ' + g('phone') + (g('email') ? '\nEmail: ' + g('email') : '') + (g('notes') ? '\nNotes: ' + g('notes') : '');
    var now = new Date();
    var orderItems = s.items.map(function (r) {
      var quantity = qtyOf(r), unit = parseFloat(r.dataset.price);
      var topping = tp && r.dataset.cat === 'Cake Loaves' ? ' (Topping: ' + tp.value + ')' : '';
      var details = '';
      if (r.dataset.cakeSpec) { try { details = cakeSpecMessage(JSON.parse(r.dataset.cakeSpec)); } catch (ignore) {} }
      return { name: r.dataset.name + topping, category: r.dataset.cat, qty: quantity, unit: unit, line: quantity * unit, details: details };
    });
    receiptFileStamp = now.toISOString().slice(0, 16).replace(/[T:]/g, '-');
    receiptMarkup = makeReceipt({
      logo: logoDataUrl(), created: now.toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }),
      name: g('name'), phone: g('phone'), email: g('email'), fulfilment: s.deliv ? 'Delivery' : 'Pickup', date: d,
      time: g('time'), delivery: s.deliv, area: g('area'), subtotal: s.sub,
      payment: momo ? 'Mobile Money, ' + (net ? net.value : '') + ', full payment upfront' : 'Cash on ' + (s.deliv ? 'delivery' : 'pickup'),
      notes: g('notes'), items: orderItems
    });
    saveReceipt();
    if (receiptBox) { receiptBox.hidden = false; }
    window.open('https://wa.me/233554520532?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    if (receiptBox) setTimeout(function () { receiptBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  });
})();

// ============ CINEMATIC HOME: story crossfade + subtle parallax ============
(function () {
  var sec = document.querySelector('.cine');
  if (sec) {
    var imgs = Array.prototype.slice.call(sec.querySelectorAll('.cs-img'));
    var panels = Array.prototype.slice.call(sec.querySelectorAll('.cine-panel'));
    function setActive(i) {
      var img = Math.min(i, imgs.length - 1);
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === img); });
      panels.forEach(function (p, k) { p.classList.toggle('active', k === i); });
    }
    if (panels.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setActive(panels.indexOf(e.target)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      panels.forEach(function (p) { io.observe(p); });
      setActive(0);
    } else {
      panels.forEach(function (p) { p.classList.add('active'); });
      setActive(0);
    }
  }
})();

// subtle scroll parallax for [data-para]
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-para]'));
  if (!els.length || reduce || !('requestAnimationFrame' in window)) return;
  var ticking = false;
  function frame() {
    var vh = window.innerHeight;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = 'translate3d(0,' + (d * parseFloat(el.dataset.para) * 100).toFixed(2) + 'px,0)';
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
})();

// ============ MENU PAGE: sticky category chips ============
(function () {
  var bar = document.querySelector('.mchips');
  if (!bar) return;
  var chips = Array.prototype.slice.call(bar.querySelectorAll('.mchip'));
  var targets = chips.map(function (c) { return document.getElementById(c.dataset.cat); });
  function mark(i) {
    chips.forEach(function (c, k) { c.classList.toggle('active', k === i); });
    var c = chips[i];
    if (c && bar.scrollWidth > bar.clientWidth) {
      var cr = c.getBoundingClientRect(), br = bar.getBoundingClientRect();
      if (cr.left < br.left + 12 || cr.right > br.right - 12) {
        bar.scrollTo({ left: bar.scrollLeft + (cr.left - br.left) - 24, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }
  chips.forEach(function (c, i) {
    c.addEventListener('click', function (event) {
      var target = targets[i];
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start', inline: 'nearest' });
      try { history.replaceState(null, '', '#' + c.dataset.cat); } catch (ignore) {}
      mark(i);
    });
  });
  var ticking = false;
  function update() {
    var line = bar.getBoundingClientRect().height + 120, best = 0, bestTop = -Infinity;
    targets.forEach(function (t, i) {
      if (!t) return;
      var tp = t.getBoundingClientRect().top;
      if (tp <= line && tp > bestTop + 2) { bestTop = tp; best = i; }
    });
    if (bestTop === -Infinity) {
      var first = Infinity;
      targets.forEach(function (t, i) { if (!t) return; var tp = t.getBoundingClientRect().top; if (tp < first) { first = tp; best = i; } });
    }
    mark(best);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();

// Homepage sample-review carousel: duplicate the review set for a seamless
// left-to-right loop, while pausing whenever a keyboard or pointer user is
// interacting with the carousel.
(function () {
  var viewport = document.querySelector('.v2-review-viewport');
  var track = viewport && viewport.querySelector('.v2-review-list');
  if (!viewport || !track || track.dataset.carouselReady) return;
  track.dataset.carouselReady = 'true';
  var cards = Array.prototype.slice.call(track.children);
  cards.forEach(function (card) { track.appendChild(card.cloneNode(true)); });
  track.style.setProperty('--review-duration', Math.max(78, cards.length * 2.8) + 's');
  function pause() { track.classList.add('is-paused'); }
  function resume() { track.classList.remove('is-paused'); }
  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', function (event) {
    if (!viewport.contains(event.relatedTarget)) resume();
  });
  if (reduce) {
    viewport.classList.add('reduced-motion');
    pause();
  }
})();
