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
                    <a href="${root}logic-expert/" class="nav-local nav-local-multiline">Transformers Research<br>Logic Expert</a>
                    <a href="${root}photography/" class="nav-local">Photography</a>
                    <div class="nav-links">
                        <a href="https://hlwa-portfolio.github.io/" class="nav-link-stack" target="_blank" rel="noopener">
                            Hanford
                            <small>Nuclear Waste Vitrification</small>
                        </a>
                        <a href="${root}assets/pdf/main_ML_class.pdf" class="mobile-link" target="_blank" rel="noopener">Resume PDF</a>
                        <a href="https://github.com/Ancorro" class="mobile-link" target="_blank" rel="noopener">GitHub</a>
                        <span class="nav-link-stack nav-emails">
                            <span>Email</span>
                            <small>steven.cleasby.mayeda@gmail.com</small>
                            <small>cleasbys@oregonstate.edu</small>
                        </span>
                    </div>
                </div>
            </nav>
        `;

        this.updateScrollProgress = this.updateScrollProgress.bind(this);
        window.addEventListener('scroll', this.updateScrollProgress, { passive: true });
        this.updateScrollProgress();
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.updateScrollProgress);
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
