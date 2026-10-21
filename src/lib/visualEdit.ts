/**
 * Visual edit engine for the Lunor.AI preview.
 *
 * - `annotateHtml` stamps a stable `data-lunor-id` on every element of a source HTML file.
 * - `VISUAL_EDIT_AGENT` is injected into the preview iframe and turns it into a
 *   cursor-driven editor (inline text editing, image swap by drop, drag & drop reorder, delete).
 * - `applyVisualEdit` replays an operation onto the ORIGINAL source string so the code
 *   in the editor is updated with exactly what the user changed in the preview.
 */

export type VisualEditOp =
  | { kind: "text"; id: string; value: string; previous?: string }
  | { kind: "src"; id: string; value: string }
  | { kind: "style"; id: string; prop: string; value: string }
  | { kind: "move"; id: string; targetId: string; position: "before" | "after" | "inside" }
  | { kind: "delete"; id: string };

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "META", "LINK", "TITLE", "HEAD", "HTML", "BODY"]);

function parse(source: string): Document | null {
  try {
    return new DOMParser().parseFromString(source, "text/html");
  } catch {
    return null;
  }
}

function serialize(doc: Document, source: string): string {
  const hasDoctype = /^\s*<!doctype/i.test(source);
  const html = doc.documentElement.outerHTML;
  return hasDoctype ? `<!DOCTYPE html>\n${html}` : html;
}

/** Adds `data-lunor-id` to every meaningful element so preview edits map back to source. */
export function annotateHtml(source: string): string {
  const doc = parse(source);
  if (!doc) return source;
  let i = 0;
  doc.querySelectorAll("*").forEach((el) => {
    if (SKIP_TAGS.has(el.tagName)) return;
    el.setAttribute("data-lunor-id", `l${++i}`);
  });
  return serialize(doc, source);
}

/**
 * Re-applies a preview edit onto the original (un-annotated) source.
 * Elements are matched by walking the same order used by `annotateHtml`.
 */
export function applyVisualEdit(source: string, op: VisualEditOp): string {
  const doc = parse(source);
  if (!doc) return source;

  const index = new Map<string, Element>();
  let i = 0;
  doc.querySelectorAll("*").forEach((el) => {
    if (SKIP_TAGS.has(el.tagName)) return;
    const id = el.getAttribute("data-lunor-id") || `l${i + 1}`;
    if (!SKIP_TAGS.has(el.tagName)) i++;
    index.set(id, el);
  });

  const el = index.get(op.id);
  if (!el) return source;

  switch (op.kind) {
    case "text": {
      el.textContent = op.value;
      break;
    }
    case "src": {
      el.setAttribute("src", op.value);
      break;
    }
    case "style": {
      (el as HTMLElement).style.setProperty(op.prop, op.value);
      break;
    }
    case "delete": {
      el.remove();
      break;
    }
    case "move": {
      const target = index.get(op.targetId);
      if (!target || target === el || el.contains(target)) return source;
      if (op.position === "inside") target.appendChild(el);
      else if (op.position === "before") target.parentElement?.insertBefore(el, target);
      else target.parentElement?.insertBefore(el, target.nextSibling);
      break;
    }
  }

  // Strip the helper attribute so the saved source stays clean.
  doc.querySelectorAll("[data-lunor-id]").forEach((n) => n.removeAttribute("data-lunor-id"));
  return serialize(doc, source);
}

/** Script injected into the preview iframe while Visual Edit mode is ON. */
export const VISUAL_EDIT_AGENT = `<script>(function(){
  if (window.__lunorVisualEdit) return;
  window.__lunorVisualEdit = true;

  var STYLE = document.createElement('style');
  STYLE.textContent = [
    '[data-lunor-id]:hover{outline:1px dashed #ef4444 !important;outline-offset:1px;}',
    '.__lunor-sel{outline:2px solid #ef4444 !important;outline-offset:1px;}',
    '[contenteditable]{cursor:text !important;}',
    '.__lunor-drop-before{box-shadow:0 -3px 0 0 #ef4444 !important;}',
    '.__lunor-drop-after{box-shadow:0 3px 0 0 #ef4444 !important;}',
    '.__lunor-drop-inside{outline:2px dotted #ef4444 !important;}',
    '#__lunor-hud{position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#000;color:#fff;font:11px/1.4 ui-monospace,monospace;padding:6px 9px;border:1px solid #ef4444;border-radius:6px;opacity:.9;pointer-events:none;max-width:70vw}'
  ].join('');
  document.head && document.head.appendChild(STYLE);

  var hud = document.createElement('div');
  hud.id = '__lunor-hud';
  var HINT = 'Visual Edit: click text to type - Alt+drag to reorder - drop image to swap - Del to remove';
  hud.textContent = HINT;
  document.body && document.body.appendChild(hud);
  function say(m){ hud.textContent = m; }

  function send(op){ try { parent.postMessage({ __lunorVisualEdit: true, op: op }, '*'); } catch(e){} }
  function ready(){ try { parent.postMessage({ __lunorVisualEdit: true, type: 'ready' }, '*'); } catch(e){} }
  function idOf(el){ return el && el.getAttribute && el.getAttribute('data-lunor-id'); }
  function pick(t){ while (t && t !== document.body && !idOf(t)) t = t.parentElement; return idOf(t) ? t : null; }

  var selected = null;
  var editing = null;
  var editingOriginal = '';
  var dragArmed = false;
  var TEXTY = { P:1, H1:1, H2:1, H3:1, H4:1, H5:1, H6:1, SPAN:1, A:1, BUTTON:1, LI:1, LABEL:1, STRONG:1, EM:1, TD:1, TH:1, BLOCKQUOTE:1, FIGCAPTION:1, DIV:1, SMALL:1, DT:1, DD:1, CAPTION:1, LEGEND:1 };

  function isTexty(el){
    if (!el || el.tagName === 'IMG') return false;
    if (el.children.length > 0) return false;
    if (!TEXTY[el.tagName]) return false;
    return (el.textContent || '').trim().length > 0 || TEXTY[el.tagName] === 1;
  }

  function placeCaret(el, x, y){
    try {
      var r = null;
      if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(x, y);
      else if (document.caretPositionFromPoint) {
        var p = document.caretPositionFromPoint(x, y);
        if (p) { r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); }
      }
      if (r) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    } catch(e){}
  }

  function select(el){
    if (selected === el) return;
    if (selected) { selected.classList.remove('__lunor-sel'); }
    selected = el;
    if (el) { el.classList.add('__lunor-sel'); say('Selected <' + el.tagName.toLowerCase() + '>' + (isTexty(el) ? ' - type to edit' : '')); }
  }

  function commit(){
    if (!editing) return;
    var el = editing; editing = null;
    el.removeAttribute('contenteditable');
    var id = idOf(el);
    if (id) send({ kind:'text', id: id, value: el.innerText, previous: editingOriginal });
    editingOriginal = '';
    say('Text saved to code');
  }

  document.addEventListener('mousedown', function(e){
    if (editing && !editing.contains(e.target)) commit();
  }, true);

  document.addEventListener('click', function(e){
    var el = pick(e.target);
    if (!el) return;
    if (editing === el) return;           // let the caret work while typing
    e.preventDefault(); e.stopPropagation();
    select(el);
    if (isTexty(el)) {
      editing = el;
      editingOriginal = el.innerText;
      el.removeAttribute('draggable');
      el.setAttribute('contenteditable', 'true');
      el.focus();
      placeCaret(el, e.clientX, e.clientY);
      say('Editing text - Esc or click away to save');
      return;
    }
    if (el.tagName === 'IMG') {
      var url = prompt('Image URL (or cancel and drop an image file here):', el.getAttribute('src') || '');
      if (url) { el.setAttribute('src', url); send({ kind:'src', id: idOf(el), value: url }); say('Image updated'); }
    }
  }, true);

  document.addEventListener('submit', function(e){ e.preventDefault(); e.stopPropagation(); }, true);

  // Scripts can add content after the source HTML was annotated. Stamp those nodes too,
  // then let the parent map their original text back to the owning JS/JSX source file.
  var dynamicId = 0;
  function annotateDynamic(root){
    var nodes = [];
    if (root && root.nodeType === 1) nodes.push(root);
    if (root && root.querySelectorAll) nodes = nodes.concat(Array.prototype.slice.call(root.querySelectorAll('*')));
    nodes.forEach(function(el){
      if (!idOf(el) && !/^(SCRIPT|STYLE|META|LINK|TITLE|HEAD|HTML|BODY)$/.test(el.tagName)) {
        el.setAttribute('data-lunor-id', 'ld' + (++dynamicId));
      }
    });
  }
  annotateDynamic(document.body);
  new MutationObserver(function(records){
    records.forEach(function(record){
      Array.prototype.forEach.call(record.addedNodes || [], annotateDynamic);
    });
  }).observe(document.documentElement, { childList:true, subtree:true });

  document.addEventListener('focusout', function(e){
    if (editing && e.target === editing) commit();
  }, true);

  document.addEventListener('keydown', function(e){
    if (e.altKey) dragArmed = true;
    if (editing) {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); commit(); }
      return;                              // never hijack keys while typing
    }
    if (e.key === 'Delete' && selected) {
      e.preventDefault();
      var id = idOf(selected);
      selected.remove(); selected = null;
      send({ kind:'delete', id: id });
      say('Element deleted');
    }
  }, true);
  document.addEventListener('keyup', function(){ dragArmed = false; }, true);
  window.addEventListener('blur', function(){ dragArmed = false; if (editing) commit(); });

  // ---- drag & drop reorder (Alt+drag) + image file drop ----
  var dragEl = null;
  function clearMarks(el){ if(!el) return; el.classList.remove('__lunor-drop-before','__lunor-drop-after','__lunor-drop-inside'); }
  var lastOver = null;

  document.addEventListener('mouseover', function(e){
    var el = pick(e.target);
    if (!el) return;
    if (editing || !dragArmed) el.removeAttribute('draggable');   // keep the caret usable
    else el.setAttribute('draggable', 'true');
  }, true);

  document.addEventListener('dragstart', function(e){
    dragEl = pick(e.target);
    if (!dragEl) return;
    try { e.dataTransfer.setData('text/plain', idOf(dragEl)); e.dataTransfer.effectAllowed = 'all'; } catch(err){}
    say('Dragging <' + dragEl.tagName.toLowerCase() + '>');
  }, true);

  document.addEventListener('dragover', function(e){
    e.preventDefault();
    var el = pick(e.target);
    if (!el) return;
    if (lastOver && lastOver !== el) clearMarks(lastOver);
    lastOver = el;
    clearMarks(el);
    if (!dragEl) { el.classList.add('__lunor-drop-inside'); return; }
    var r = el.getBoundingClientRect();
    el.classList.add((e.clientY - r.top) < r.height / 2 ? '__lunor-drop-before' : '__lunor-drop-after');
  }, true);

  document.addEventListener('dragleave', function(e){ clearMarks(pick(e.target)); }, true);

  document.addEventListener('drop', function(e){
    e.preventDefault();
    var el = pick(e.target);
    clearMarks(el); clearMarks(lastOver);
    if (!el) return;

    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length && /^image\\//.test(files[0].type)) {
      var fr = new FileReader();
      fr.onload = function(){
        var url = String(fr.result);
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (img) { img.setAttribute('src', url); send({ kind:'src', id: idOf(img) || idOf(el), value: url }); say('Image replaced'); }
        else { el.style.backgroundImage = 'url(' + url + ')'; send({ kind:'style', id: idOf(el), prop:'background-image', value:'url(' + url + ')' }); say('Background image set'); }
      };
      fr.readAsDataURL(files[0]);
      return;
    }

    var uri = e.dataTransfer && (e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain'));
    if (uri && /^https?:\\/\\/\\S+\\.(png|jpe?g|gif|webp|svg)/i.test(uri)) {
      var img2 = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img2) { img2.setAttribute('src', uri); send({ kind:'src', id: idOf(img2), value: uri }); say('Image replaced'); return; }
    }

    if (dragEl && dragEl !== el && !dragEl.contains(el)) {
      var r2 = el.getBoundingClientRect();
      var pos = (e.clientY - r2.top) < r2.height / 2 ? 'before' : 'after';
      if (el.parentElement) {
        el.parentElement.insertBefore(dragEl, pos === 'before' ? el : el.nextSibling);
        send({ kind:'move', id: idOf(dragEl), targetId: idOf(el), position: pos });
        say('Moved element - code updated');
      }
    }
    dragEl = null;
  }, true);

  document.addEventListener('dragend', function(){ dragEl = null; clearMarks(lastOver); lastOver = null; }, true);
  ready();
})();<\/script>`;
