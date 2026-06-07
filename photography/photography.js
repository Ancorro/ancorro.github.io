'use strict';

document.addEventListener('contextmenu', (event) => {
    if (event.target.closest('.gallery')) {
        event.preventDefault();
    }
});

document.addEventListener('dragstart', (event) => {
    if (event.target.closest('.gallery')) {
        event.preventDefault();
    }
});

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const blockedShortcut =
        (event.ctrlKey || event.metaKey) && ['p', 's', 'u', 'c'].includes(key);

    if (blockedShortcut || key === 'printscreen') {
        event.preventDefault();
    }
});
