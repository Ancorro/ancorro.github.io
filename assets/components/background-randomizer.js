'use strict';

(function () {
    const bgDir = 'assets/art/backgrounds/';
    const imagePattern = /\.(jpe?g|png|webp)$/i;

    function setBg(filename) {
        document.documentElement.style.setProperty(
            '--bg-image',
            `url('${bgDir}${filename}')`
        );
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- Discovery strategies ---

    function fromDirectoryListing() {
        return fetch(bgDir)
            .then(res => {
                if (!res.ok) throw new Error('Not OK');
                const ct = res.headers.get('content-type');
                if (!ct || !ct.includes('text/html')) throw new Error('Not a directory listing');
                return res.text();
            })
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const names = Array.from(doc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(h => h && imagePattern.test(h))
                    .map(h => h.split('/').pop());
                if (!names.length) throw new Error('No images in listing');
                return names;
            });
    }

    function fromGitHubAPI() {
        let repo = 'Ancorro/ancorro.github.io';
        const host = window.location.hostname;
        if (host.endsWith('.github.io')) {
            repo = `${host.split('.')[0]}/${host}`;
        }
        return fetch(`https://api.github.com/repos/${repo}/contents/${bgDir}`)
            .then(res => {
                if (!res.ok) throw new Error('GitHub API failed');
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) throw new Error('Bad API response');
                const names = data
                    .filter(f => f.type === 'file' && imagePattern.test(f.name))
                    .map(f => f.name);
                if (!names.length) throw new Error('No images from API');
                return names;
            });
    }

    // --- Run ---
    // CSS body::before already shows a fallback image while this loads.

    const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname);
    const primary = isLocal ? fromDirectoryListing : fromGitHubAPI;
    const secondary = isLocal ? fromGitHubAPI : fromDirectoryListing;

    primary()
        .catch(() => secondary())
        .then(images => setBg(pickRandom(images)))
        .catch(err => console.log('Background randomizer: using CSS fallback.', err.message));
})();
