'use strict';

const NAV_ICONS = {
    github: '<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.17-1.12-1.48-1.12-1.48-.92-.64.07-.63.07-.63 1.02.07 1.55 1.06 1.55 1.06.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85.004 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>',
    linkedin: '<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
    mail: '<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>'
};

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
                        <div class="nav-section" aria-label="Research projects">
                            <span class="nav-section-label">Research</span>
                            <div class="nav-section-links">
                                <a href="${root}logic-expert/" class="nav-local nav-local-stack">
                                    Logic Expert
                                    <small>Transformers Research</small>
                                </a>
                                <a href="${root}esm3-banb/" class="nav-local nav-local-stack">
                                    ESM3 bnAb
                                    <small>Foundation Models</small>
                                </a>
                            </div>
                        </div>
                        <div class="nav-section" aria-label="Experience">
                            <span class="nav-section-label">Experience</span>
                            <div class="nav-section-links">
                                <a href="https://hlwa-portfolio.github.io/" class="nav-local nav-local-stack nav-hanford" target="_blank" rel="noopener">
                                    Hanford
                                    <small>Nuclear Waste Vitrification</small>
                                </a>
                            </div>
                        </div>
                        <a href="${root}photography/" class="nav-local nav-local-stack">
                            Photography
                            <small>Gallery</small>
                        </a>
                        <a href="${root}assets/pdf/main_ML_class.pdf" class="nav-local nav-local-stack nav-resume" target="_blank" rel="noopener">
                            Resume
                            <small>PDF</small>
                        </a>
                        <div class="nav-social" aria-label="Contact and profiles">
                            <div class="nav-social-icons">
                                <a href="https://github.com/Ancorro" class="nav-icon" target="_blank" rel="noopener" aria-label="GitHub — Ancorro">${NAV_ICONS.github}</a>
                                <a href="https://linkedin.com/in/stevencm" class="nav-icon" target="_blank" rel="noopener" aria-label="LinkedIn — stevencm">${NAV_ICONS.linkedin}</a>
                                <a href="mailto:steven.cleasby.mayeda@gmail.com" class="nav-icon nav-icon-mail" aria-label="Email Steven">${NAV_ICONS.mail}</a>
                            </div>
                            <div class="nav-emails">
                                <a href="mailto:steven.cleasby.mayeda@gmail.com">steven.cleasby.mayeda@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.navEl = this.querySelector('.nav');

        this.updateScrollProgress = this.updateScrollProgress.bind(this);
        this.syncHeight = this.syncHeight.bind(this);

        window.addEventListener('scroll', this.updateScrollProgress, { passive: true });
        window.addEventListener('resize', this.syncHeight);

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(this.syncHeight);
            this.resizeObserver.observe(this.navEl);
        }

        this.syncHeight();
        this.updateScrollProgress();

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
        document.documentElement.style.removeProperty('--site-nav-offset');
    }

    syncHeight() {
        const height = this.navEl.offsetHeight;
        this.style.height = height + 'px';
        document.documentElement.style.setProperty('--site-nav-offset', height + 'px');
    }

    updateScrollProgress() {
        if (this.frameRequested) return;

        this.frameRequested = true;
        requestAnimationFrame(() => {
            const progress = Math.min(window.scrollY / 180, 1);
            this.style.setProperty('--nav-progress', progress.toFixed(3));
            this.syncHeight();
            this.frameRequested = false;
        });
    }
}

customElements.define('site-nav', SiteNav);
