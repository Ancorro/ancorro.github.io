'use strict';

(function() {
    const backgrounds = [
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

    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const bgUrl = `assets/art/backgrounds/${randomBg}`;
    
    // Set custom property on document element
    document.documentElement.style.setProperty('--bg-image', `url('${bgUrl}')`);
})();
