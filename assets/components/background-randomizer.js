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
                    .map(a => a.textContent.trim())
                    .filter(t => imagePattern.test(t));
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
    // The CSS body::before already has a hardcoded fallback image.
    // We discover all images in the folder dynamically — no list to maintain.

    const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname);
    const primary = isLocal ? fromDirectoryListing : fromGitHubAPI;
    const secondary = isLocal ? fromGitHubAPI : fromDirectoryListing;

    primary()
        .catch(err => {
            console.log('Background: primary strategy failed (' + err.message + '), trying secondary…');
            return secondary();
        })
        .then(images => {
            // Filter out non-photo files (e.g. screenshots)
            const photos = images.filter(name => !name.toLowerCase().startsWith('screenshot'));
            const pool = photos.length ? photos : images;
            setBg(pickRandom(pool));
        })
        .catch(err => {
            console.log('Background: all strategies failed, using CSS fallback.', err.message);
        });
})();
