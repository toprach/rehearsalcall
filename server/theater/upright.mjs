/* Keeps the pages upright on a phone held sideways.

   Android's installed app is locked by the manifest ("orientation") and
   screen.orientation.lock. Safari has no lock for web apps, and a browser
   tab cannot be locked anywhere - there the page turns itself back: html
   takes the portrait size and is rotated against the screen, body
   becomes the scroller, and fixed bars stay put because html is their
   containing block. Only on phones (coarse pointer, short side under
   600px); a tablet or a computer may turn as it likes.

   Used by every page (views.mjs) and by the documents the parsing tool
   writes (index.mjs, withViewport). */

export const UPRIGHT_STYLE = `
html.quer { width:100vh; height:100vw; overflow:hidden; transform-origin:0 0 }
html.quer.links { transform:translateY(100vh) rotate(-90deg) }
html.quer.rechts { transform:translateX(100vw) rotate(90deg) }
html.quer body { height:100%; overflow-x:hidden; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain }
html.quer .weekcal-wrap { width:100%; left:0; margin-left:0 }
html.quer .overlay .box { max-height:90% }
`;

/* The script. While turned, body is the scroller and the screen axes are
   swapped, so the few things the pages read from the window - scroll
   position, scrollTo/By, its size, element positions - are mapped back
   here and the rest of the code needs to know nothing. */
export const UPRIGHT_SCRIPT = `(function () {
  var d = document.documentElement, w = window;
  if (!w.matchMedia || !w.matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) >= 600) return;
  var own = function (n) { return Object.getOwnPropertyDescriptor(w, n) || Object.getOwnPropertyDescriptor(Window.prototype, n); };
  var iw = own('innerWidth'), ih = own('innerHeight'), sy = own('scrollY');
  var W = function () { return iw.get.call(w); }, H = function () { return ih.get.call(w); };
  var b = function () { return document.body || d; };
  var turned = function () { return d.classList.contains('quer'); };
  function hook(n, f) {
    var o = own(n); if (!o || !o.get || o.configurable === false) return;
    Object.defineProperty(w, n, { configurable: true, enumerable: o.enumerable, set: o.set,
      get: function () { return turned() ? f() : o.get.call(w); } });
  }
  hook('scrollY', function () { return b().scrollTop; });
  hook('pageYOffset', function () { return b().scrollTop; });
  hook('scrollX', function () { return b().scrollLeft; });
  hook('pageXOffset', function () { return b().scrollLeft; });
  hook('innerWidth', H);
  hook('innerHeight', W);
  var original = {};
  ['scrollTo', 'scroll', 'scrollBy'].forEach(function (n) {
    var f = original[n] = w[n];
    w[n] = function () { return turned() ? b()[n].apply(b(), arguments) : f.apply(w, arguments); };
  });
  var rect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    var q = rect.call(this);
    if (!turned()) return q;
    return d.classList.contains('links') ? new DOMRect(H() - q.bottom, q.left, q.height, q.width)
                                        : new DOMRect(q.top, W() - q.right, q.height, q.width);
  };
  document.addEventListener('scroll', function (e) {
    if (turned() && e.target === document.body) w.dispatchEvent(new Event('scroll'));
  }, true);
  /* The reading position, kept as it goes: by the time the turn is
     noticed the browser has already laid the page out sideways and moved
     the scroll position. Upright and turned have the same width, so the
     offset carries over as it is. */
  var lastY = 0, pending = null, settleTimer = 0;
  w.addEventListener('scroll', function () {
    if (pending === null) lastY = turned() ? b().scrollTop : sy.get.call(w);
  }, { passive: true });
  /* At orientationchange the viewport still has its old size; the
     position is set again once the size has settled (the next resize,
     and a moment later for browsers that resize in steps). */
  /* Turned, the page is as wide as the phone's short side; after a turn
     the browser would zoom in until that fills the long side. While
     turned the viewport therefore also says maximum-scale=1 (upright it
     stays as written, pinch zoom included). */
  function scale(turnedNow) {
    var m = document.querySelector('meta[name=viewport]');
    if (!m) return;
    if (!m.dataset.upright) m.dataset.upright = m.content;
    m.content = m.dataset.upright + (turnedNow ? ', maximum-scale=1' : '');
  }
  function settle() {
    if (pending === null) return;
    if (turned()) b().scrollTop = pending; else original.scrollTo.call(w, 0, pending);
  }
  function turn(e) {
    var a = typeof w.orientation === 'number' ? w.orientation : (screen.orientation ? screen.orientation.angle : 0);
    if (a === 270) a = -90;
    var side = a === 90 ? 'links' : a === -90 ? 'rechts' : '';
    if (side === (turned() ? (d.classList.contains('links') ? 'links' : 'rechts') : '')) { settle(); return; }
    d.classList.remove('quer', 'links', 'rechts');
    if (side) d.classList.add('quer', side);
    scale(!!side);
    if (!e) return;   // loading: the page finds its own place
    pending = lastY;
    settle();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () { settle(); pending = null; }, 400);
  }
  turn();
  w.addEventListener('orientationchange', turn);
  w.addEventListener('resize', turn);
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', turn);
})();`;


/* Media queries still see the screen held sideways (wider than any phone
   is upright), so the phone rules would switch off and the wide ones on.
   This gives every width query a turned twin: after each
   @media (max-width:N) for N above a phone's short side, the same rules
   once more for html.quer; and min-width rules are kept from html.quer.
   The original rules and their order stay as they are. */
const PHONE = 480;

function scope(rules, mark) {
  let out = '';
  for (const part of rules.replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const at = part.indexOf('{');
    if (at < 0) continue;
    const selectors = [];
    let depth = 0, cur = '';
    for (const ch of part.slice(0, at)) {
      if (ch === '(') depth++; else if (ch === ')') depth--;
      if (ch === ',' && !depth) { selectors.push(cur); cur = ''; } else cur += ch;
    }
    selectors.push(cur);
    const scoped = selectors.map(s => s.trim()).filter(Boolean).map(s =>
      /^html(?=$|[.#[:\s])/.test(s) ? 'html' + mark + s.slice(4)
        : /^:root(?=$|[.#[:\s])/.test(s) ? ':root' + mark + s.slice(5)
          : 'html' + mark + ' ' + s);
    out += `  ${scoped.join(', ')} {${part.slice(at + 1)}}\n`;
  }
  return out;
}

export function uprightMedia(css) {
  const re = /@media \((max|min)-width:\s*(\d+)px\)\s*\{/g;
  let out = '', last = 0, m;
  while ((m = re.exec(css))) {
    let i = re.lastIndex, depth = 1;
    while (depth && i < css.length) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++; }
    const inner = css.slice(re.lastIndex, i - 1), n = Number(m[2]);
    if (m[1] === 'max' && n >= PHONE) out += css.slice(last, i) + '\n' + scope(inner, '.quer');
    else if (m[1] === 'min' && n > PHONE) out += css.slice(last, re.lastIndex) + '\n' + scope(inner, ':not(.quer)') + '  }';
    else out += css.slice(last, i);
    last = re.lastIndex = i;
  }
  return out + css.slice(last);
}

/* The same for the <style> blocks inside a piece of HTML. */
export const uprightStyles = (html) => html.replace(/<style>([\s\S]*?)<\/style>/g, (all, css) => `<style>${uprightMedia(css)}</style>`);
