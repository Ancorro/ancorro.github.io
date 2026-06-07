'use strict';

(function() {
    const fallbackBackgrounds = [
        'image-from-rawpixel-id-1805009-original.jpg',
        'pdia-033be42e-e1d8-4462-94c3-26b5384ef903.jpg',
        'pdia-22fe9f42-e31d-4a7b-878a-f48f86e8f4ef.jpg',
        'pdia-32c33d73-4f43-44f8-9823-aff24e692ecf.jpg',
        'pdia-39841183-71cb-4ed4-bb25-73b4c16b480f.jpg',
        'pdia-5adefa44-315e-4783-9ed9-61f47a569b85.jpg',
        'pdia-631ebf11-1523-49f1-ae2d-74d89bb14180.jpg',
        'pdia-70a93032-5464-45ad-a137-17c9df790258.jpg',
        'pdia-74b01ec6-3e92-4492-8ea4-d5e410d934e9.jpg',
        'pdia-906a0526-befe-4abc-9dbd-6874b084aed6.jpg',
        'pdia-98fa2408-1a15-4e72-a584-52a793c643ba.jpg',
        'pdia-c3df3bdf-79cb-4d52-8a77-9ae8d19ac8c5.jpg',
        'pdia-ced23b40-7cfc-4d28-955e-1a642fbb8255.jpg',
        'pdia-dcd04b69-5518-4ddf-adc8-63d0f61768dd.jpg',
        'pdia-e40049a3-5c89-406e-ad2c-2a142a4c2522.jpg',
        'pdia-e6a7f095-796c-48c2-99da-fa96cdb66c6d.jpg',
        'pdia-f946ecc9-50e9-4f46-9b6c-9f757559b043.jpg'
    ];

    function setBg(bgName) {
        const bgUrl = `assets/art/backgrounds/${bgName}`;
        document.documentElement.style.setProperty('--bg-image', `url('${bgUrl}')`);
    }

    // Set an initial quick background immediately from static fallbacks to prevent empty flash
    const initialBg = fallbackBackgrounds[Math.floor(Math.random() * fallbackBackgrounds.length)];
    setBg(initialBg);

    const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname);

    function tryLocalDirectory() {
        return fetch('assets/art/backgrounds/')
            .then(res => {
                if (!res.ok) throw new Error('Not OK');
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    return res.text();
                }
                throw new Error('Not HTML directory listing');
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = Array.from(doc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(href => href && /\.(jpe?g|png|webp|gif)$/i.test(href))
                    .map(href => href.split('/').pop());

                if (links.length > 0) {
                    return links;
                }
                throw new Error('No images found in local listing');
            });
    }

    function tryGitHubAPI() {
        let repoPath = "Ancorro/ancorro.github.io";
        const host = window.location.hostname;
        if (host.endsWith('.github.io')) {
            const username = host.split('.')[0];
            repoPath = `${username}/${host}`;
        }
        const apiUrl = `https://api.github.com/repos/${repoPath}/contents/assets/art/backgrounds`;

        return fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('GitHub API request failed');
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) throw new Error('Invalid API data');
                const images = data
                    .filter(file => file.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(file.name))
                    .map(file => file.name);
                if (images.length > 0) {
                    return images;
                }
                throw new Error('No images found via API');
            });
    }

    // Run Strategy
    if (isLocal) {
        // Try local directory listing first, then fallback to GitHub API, then to static list
        tryLocalDirectory()
            .then(images => {
                const randomBg = images[Math.floor(Math.random() * images.length)];
                setBg(randomBg);
            })
            .catch(err => {
                console.log('Local directory fetch failed, trying remote API:', err.message);
                tryGitHubAPI()
                    .then(images => {
                        const randomBg = images[Math.floor(Math.random() * images.length)];
                        setBg(randomBg);
                    })
                    .catch(apiErr => {
                        console.log('GitHub API also failed, keeping initial fallback background:', apiErr.message);
                    });
            });
    } else {
        // Try GitHub API first (production), then fallback to static list
        tryGitHubAPI()
            .then(images => {
                const randomBg = images[Math.floor(Math.random() * images.length)];
                setBg(randomBg);
            })
            .catch(apiErr => {
                console.log('GitHub API failed, keeping initial fallback background:', apiErr.message);
            });
    }
})();
