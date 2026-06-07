'use strict';

class SiteNav extends HTMLElement {
    connectedCallback() {
        const root = this.getAttribute('root') || '';
        const homeHref = this.hasAttribute('home') ? '#top' : root;

        this.innerHTML = `
            <nav class="nav">
                <div class="nav-wrap nav-inner">
                    <a href="${homeHref}" class="nav-brand">
                        <img class="nav-art" src="${root}assets/art/el_sueno_de_la_razon_produce_monstruos-huge.jpg" alt="">
                        <span class="nav-brand-text">
                            <strong>SCM</strong>
                            <small>Steven Cleasby-Mayeda</small>
                        </span>
                    </a>
                    <div class="nav-menu">
                        <a href="${root}logic-expert/" class="nav-local nav-local-multiline"><span class="nav-desc">Transformers Research<br></span>Logic Expert</a>
                        <a href="${root}photography/" class="nav-local">Photography</a>
                        <a href="https://hlwa-portfolio.github.io/" class="nav-link nav-link-stack" target="_blank" rel="noopener">
                            Hanford
                            <small>Nuclear Waste Vitrification</small>
                        </a>
                        <a href="${root}assets/pdf/main_ML_class.pdf" class="nav-link nav-link-stack mobile-link" target="_blank" rel="noopener">
                            Resume
                            <small>PDF</small>
                        </a>
                        <a href="https://github.com/Ancorro" class="nav-link nav-link-stack mobile-link" target="_blank" rel="noopener">
                            GitHub
                            <small>ancorro</small>
                        </a>
                        <span class="nav-link-stack nav-emails">
                            <span>Email</span>
                            <small>steven.cleasby.mayeda@gmail.com</small>
                            <small>cleasbys@oregonstate.edu</small>
                        </span>
                    </div>
                </div>
            </nav>
        `;

        this.navEl = this.querySelector('.nav');

        this.updateScrollProgress = this.updateScrollProgress.bind(this);
        this.syncHeight = this.syncHeight.bind(this);

        window.addEventListener('scroll', this.updateScrollProgress, { passive: true });
        window.addEventListener('resize', this.syncHeight);

        // Keep the in-flow spacer (this host element) the same height as the
        // fixed bar, so content below is never hidden when the bar wraps.
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(this.syncHeight);
            this.resizeObserver.observe(this.navEl);
        }

        this.syncHeight();
        this.updateScrollProgress();

        // Re-measure after async reflows that change wrapping (and thus height):
        // the next frame, full load (images), and web-font load — the menu
        // widens once 'LINE Seed JP' replaces the fallback font.
        requestAnimationFrame(this.syncHeight);
        window.addEventListener('load', this.syncHeight);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(this.syncHeight);
        }
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.updateScrollProgress);
        window.removeEventListener('resize', this.syncHeight);
        window.removeEventListener('load', this.syncHeight);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }

    syncHeight() {
        // Reserve the bar's un-scrolled height. We only measure near the top of
        // the page; the scroll-shrink animation would otherwise feed its own
        // height changes back into the reservation and cause layout jitter.
        if (window.scrollY > 8) return;
        this.style.height = this.navEl.offsetHeight + 'px';
    }

    updateScrollProgress() {
        if (this.frameRequested) return;

        this.frameRequested = true;
        requestAnimationFrame(() => {
            const progress = Math.min(window.scrollY / 180, 1);
            this.style.setProperty('--nav-progress', progress.toFixed(3));
            this.frameRequested = false;
        });
    }
}

customElements.define('site-nav', SiteNav);
