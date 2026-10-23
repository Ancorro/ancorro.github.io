'use strict';

// Project detail dialog. Cards are static links to #slug; this script turns them into a
// large modal with the full write-up and a media viewer. Without JavaScript the links
// just change the hash, and the card text and outbound links still work.

(() => {
    const dataEl = document.getElementById('project-data');
    if (!dataEl) return;
    const projects = JSON.parse(dataEl.textContent);
    const bySlug = new Map(projects.map((p) => [p.slug, p]));
    const ICONS = { github: 'fab fa-github', page: 'fas fa-arrow-up-right-from-square', pdf: 'fas fa-file-pdf', play: 'fas fa-play' };

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const dlg = document.createElement('dialog');
    dlg.className = 'project-dialog';
    dlg.setAttribute('aria-labelledby', 'pd-title');
    document.body.appendChild(dlg);

    let current = null;
    let index = 0;

    function stage(item) {
        if (item.type === 'video') {
            const poster = item.poster ? ` poster="${esc(item.poster)}"` : '';
            return `<video src="${esc(item.src)}"${poster} controls autoplay muted loop playsinline aria-label="${esc(item.alt)}"></video>`;
        }
        return `<img src="${esc(item.src)}" alt="${esc(item.alt)}">`;
    }

    function thumb(item, i) {
        const src = item.type === 'video' ? item.poster || '' : item.src;
        const play = item.type === 'video' ? '<i class="fas fa-play"></i>' : '';
        return `<button class="pd-thumb${i === index ? ' active' : ''}" data-i="${i}" aria-label="Show item ${i + 1}: ${esc(item.alt)}">
                    ${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : ''}${play}</button>`;
    }

    function gallery(p) {
        return p.gallery && p.gallery.length ? p.gallery : [p.hero];
    }

    function showItem(i) {
        const items = gallery(current);
        index = (i + items.length) % items.length;
        const item = items[index];
        dlg.querySelector('.pd-stage').innerHTML = stage(item);
        dlg.querySelector('.pd-caption').innerHTML = item.caption ? esc(item.caption) : '';
        dlg.querySelectorAll('.pd-thumb').forEach((b) => b.classList.toggle('active', Number(b.dataset.i) === index));
        dlg.querySelector('.pd-count').textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    }

    function render(p) {
        current = p;
        index = 0;
        const items = gallery(p);
        const pos = projects.indexOf(p);
        const prev = projects[(pos - 1 + projects.length) % projects.length];
        const next = projects[(pos + 1) % projects.length];
        const links = (p.links || []).map((l) =>
            `<a href="${esc(l.href)}" target="_blank" rel="noopener"><i class="${ICONS[l.icon] || ICONS.page}"></i> ${esc(l.label)}</a>`).join('');
        const highlights = (p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join('');
        const multi = items.length > 1;

        dlg.innerHTML = `
            <div class="pd-shell">
                <header class="pd-head">
                    <div>
                        <div class="pd-kicker">${esc(p.kicker)}${p.status === 'wip' ? ' <span class="badge-wip">In progress</span>' : ''}</div>
                        <h2 id="pd-title">${esc(p.title)}</h2>
                        <div class="pd-meta">${esc(p.dates)} · ${esc(p.tools)}</div>
                    </div>
                    <button class="pd-close" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </header>
                <div class="pd-body">
                    <section class="pd-media">
                        <div class="pd-stage-wrap">
                            ${multi ? '<button class="pd-nav pd-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>' : ''}
                            <div class="pd-stage"></div>
                            ${multi ? '<button class="pd-nav pd-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>' : ''}
                        </div>
                        <div class="pd-caption-row"><p class="pd-caption"></p><span class="pd-count"></span></div>
                        ${multi ? `<div class="pd-thumbs">${items.map(thumb).join('')}</div>` : ''}
                    </section>
                    <section class="pd-text">
                        ${(p.long || [p.blurb]).map((para) => `<p>${para}</p>`).join('')}
                        ${highlights ? `<h3>Highlights</h3><ul class="pd-highlights">${highlights}</ul>` : ''}
                        <div class="pd-links">${links}${p.note ? `<span class="note">${esc(p.note)}</span>` : ''}</div>
                    </section>
                </div>
                <footer class="pd-foot">
                    <a href="#${esc(prev.slug)}" class="pd-step"><i class="fas fa-arrow-left"></i> ${esc(prev.title)}</a>
                    <a href="#${esc(next.slug)}" class="pd-step">${esc(next.title)} <i class="fas fa-arrow-right"></i></a>
                </footer>
            </div>`;

        dlg.querySelector('.pd-close').addEventListener('click', close);
        dlg.querySelector('.pd-prev')?.addEventListener('click', () => showItem(index - 1));
        dlg.querySelector('.pd-next')?.addEventListener('click', () => showItem(index + 1));
        dlg.querySelectorAll('.pd-thumb').forEach((b) => b.addEventListener('click', () => showItem(Number(b.dataset.i))));
        showItem(0);
        dlg.querySelector('.pd-shell').scrollTop = 0;
    }

    function open(slug) {
        const p = bySlug.get(slug);
        if (!p) return;
        render(p);
        if (!dlg.open) {
            document.documentElement.classList.add('dialog-open');
            dlg.showModal();
        }
    }

    function close() {
        if (dlg.open) dlg.close();
    }

    dlg.addEventListener('close', () => {
        document.documentElement.classList.remove('dialog-open');
        dlg.querySelectorAll('video').forEach((v) => v.pause());
        if (location.hash) history.replaceState(null, '', location.pathname + location.search + '#works');
        const card = current && document.getElementById(`proj-${current.slug}`);
        card?.querySelector('.card-open')?.focus({ preventScroll: true });
    });

    // Click on the backdrop (outside the shell) closes.
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

    dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && !e.target.closest('video')) showItem(index + 1);
        if (e.key === 'ArrowLeft' && !e.target.closest('video')) showItem(index - 1);
    });

    function fromHash() {
        const slug = decodeURIComponent(location.hash.slice(1));
        if (bySlug.has(slug)) open(slug);
        else close();
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();

    // Filter chips: All / In progress / Finished.
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach((chip) => chip.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        const f = chip.dataset.filter;
        document.querySelectorAll('.works-grid .work-media').forEach((card) => {
            card.hidden = f !== 'all' && card.dataset.status !== f;
        });
    }));
})();
