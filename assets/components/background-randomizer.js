'use strict';

(function () {
    const bgDir = 'assets/art/backgrounds/';
    const imagePattern = /\.(jpe?g|png|webp)$/i;

    // This list is the production fallback since GitHub Pages has no directory
    // listing and the API is rate-limited. Just add filenames here when you
    // drop new images into the folder.
    const knownImages = [
        'image-from-rawpixel-id-1805009-original.jpg',
        'pdia-22fe9f42-e31d-4a7b-878a-f48f86e8f4ef.jpg',
        'pdia-2a78ef44-4e30-46c8-8968-0ad3d6a312f4.jpg',
        'pdia-32c33d73-4f43-44f8-9823-aff24e692ecf.jpg',
        'pdia-39841183-71cb-4ed4-bb25-73b4c16b480f.jpg',
        'pdia-5adefa44-315e-4783-9ed9-61f47a569b85.jpg',
        'pdia-631ebf11-1523-49f1-ae2d-74d89bb14180.jpg',
        'pdia-679d8578-095d-4672-ad16-54ae0a3c4242.jpg',
        'pdia-70a93032-5464-45ad-a137-17c9df790258.jpg',
        'pdia-906a0526-befe-4abc-9dbd-6874b084aed6.jpg',
        'pdia-98fa2408-1a15-4e72-a584-52a793c643ba.jpg',
        'pdia-b24e8dbc-4502-41a2-bcd0-eee42a3d5662.jpg',
        'pdia-c3df3bdf-79cb-4d52-8a77-9ae8d19ac8c5.jpg',
        'pdia-ced23b40-7cfc-4d28-955e-1a642fbb8255.jpg',
        'pdia-e6a7f095-796c-48c2-99da-fa96cdb66c6d.jpg',
        'pdia-f946ecc9-50e9-4f46-9b6c-9f757559b043.jpg',
        'pdia-fa6510fc-ae09-486f-9e17-15220099e29b.jpg'
    ];

    function setBg(filename) {
        document.documentElement.style.setProperty(
            '--bg-image',
            `url('${bgDir}${filename}')`
        );
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Set a random background immediately from the known list
    setBg(pickRandom(knownImages));

    // On a local dev server, try to auto-discover from directory listing
    // so new images work without updating the list above.
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

    if (isLocal) {
        fetch(bgDir)
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
                    .filter(t => imagePattern.test(t))
                    .filter(t => !t.toLowerCase().startsWith('screenshot'));
                if (names.length) {
                    setBg(pickRandom(names));
                }
            })
            .catch(() => {}); // Already set from knownImages, nothing to do
    }
})();
