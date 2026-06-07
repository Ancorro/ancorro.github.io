'use strict';

(function() {
    const fallbackBackgrounds = [
        'image-from-rawpixel-id-1805009-original.jpg',
        'pdia-39841183-71cb-4ed4-bb25-73b4c16b480f.jpg',
        'pdia-70a93032-5464-45ad-a137-17c9df790258.jpg',
        'pdia-7baf0c11-5758-4478-bad5-e3ff308314f9.jpg',
        'pdia-906a0526-befe-4abc-9dbd-6874b084aed6.jpg',
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

    // Set an initial quick background from the static fallback list to prevent empty flash
    const initialBg = fallbackBackgrounds[Math.floor(Math.random() * fallbackBackgrounds.length)];
    setBg(initialBg);

    // Determine repo path dynamically if hosted on github.io
    let repoPath = "Ancorro/ancorro.github.io";
    const host = window.location.hostname;
    if (host.endsWith('.github.io')) {
        const username = host.split('.')[0];
        repoPath = `${username}/${host}`;
    }

    const apiUrl = `https://api.github.com/repos/${repoPath}/contents/assets/art/backgrounds`;

    // Attempt to fetch file list dynamically from GitHub API
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error('GitHub API request failed');
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data)) return;
            const images = data
                .filter(file => file.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(file.name))
                .map(file => file.name);
            
            if (images.length > 0) {
                const randomBg = images[Math.floor(Math.random() * images.length)];
                setBg(randomBg);
            }
        })
        .catch(err => {
            console.log('GitHub API fetch failed, trying local directory listing:', err.message);
            
            // Try fetching the local directory listing index (supported by python -m http.server)
            fetch('assets/art/backgrounds/')
                .then(res => {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        return res.text();
                    }
                    throw new Error('Local server does not support HTML directory listing');
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const links = Array.from(doc.querySelectorAll('a'))
                        .map(a => a.getAttribute('href'))
                        .filter(href => href && /\.(jpe?g|png|webp|gif)$/i.test(href))
                        .map(href => href.split('/').pop()); // Extract filename

                    if (links.length > 0) {
                        const randomBg = links[Math.floor(Math.random() * links.length)];
                        setBg(randomBg);
                    }
                })
                .catch(localErr => {
                    console.log('Local directory fetch failed, using fallback list:', localErr.message);
                });
        });
})();
