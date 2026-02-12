(function() {
    // 1. Inject the CSS styles into the document head
    const style = document.createElement('style');
    style.innerHTML = `
        /* Custom Scrollbar Logic */
        .custom-scroll::-webkit-scrollbar, 
        [data-auto-scroll]::-webkit-scrollbar { 
            width: 4px; 
        }
        .custom-scroll::-webkit-scrollbar-track,
        [data-auto-scroll]::-webkit-scrollbar-track { 
            background: transparent; 
        }
        .custom-scroll::-webkit-scrollbar-thumb,
        [data-auto-scroll]::-webkit-scrollbar-thumb { 
            background: #b8860b; 
            box-shadow: 0 0 10px #b8860b;
            border-radius: 10px;
        }

        /* Page Border Frame */
        .dprt-frame::after {
            content: "";
            position: fixed;
            inset: 20px;
            border: 1px solid rgba(184, 134, 11, 0.2);
            pointer-events: none;
            z-index: 50;
        }
    `;
    document.head.appendChild(style);

    // 2. Logic to apply to scrollable elements
    function applyDPRTStyles() {
        // Add the border frame to the body
        document.body.classList.add('dprt-frame');

        // Find all elements that have overflow-y set to scroll/auto
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const isScrollable = style.overflowY === 'scroll' || style.overflowY === 'auto';
            const hasActualScroll = el.scrollHeight > el.clientHeight;

            if (isScrollable && hasActualScroll) {
                el.setAttribute('data-auto-scroll', 'true');
                // Optional: Ensure the class is added if not there
                el.classList.add('custom-scroll');
            }
        });
    }

    // Run on load
    if (document.readyState === 'complete') {
        applyDPRTStyles();
    } else {
        window.addEventListener('load', applyDPRTStyles);
    }
})();
