/**
 * Protection Script for Aprovação Psycho Apostilas
 * Disables copy, cut, paste, right-click, and print screen interactions.
 */

(function () {
    // 1. Inject CSS for user-select: none and print hiding
    const style = document.createElement('style');
    style.innerHTML = `
        body {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10 and IE 11 */
            user-select: none; /* Standard syntax */
        }
        
        /* Allow selection in input fields if any */
        input, textarea {
            -webkit-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }

        /* Overlay for blocked actions feedback */
        #protection-overlay {
            display: none; /* Hidden by default */
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.95);
            z-index: 2147483647; /* Max Z-Index */
            color: #ff00ff;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            text-align: center;
        }
        
        #protection-overlay h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }

        /* PRINT CSS - Hides everything except overlay */
        @media print {
            body > * {
                display: none !important; /* Hide all direct children of body */
            }
            
            body > #protection-overlay {
                display: flex !important; /* Show explicitly the overlay */
                visibility: visible !important;
                background: white !important;
                color: black !important;
            }
            
            #protection-overlay::after {
                content: "Conteúdo Protegido - Cópia Proibida";
                font-size: 20pt;
                font-weight: bold;
            }
            
            /* Hide the icons/text inside overlay for print, replace with simpler text */
            #protection-overlay * {
                display: none;
            }
        }
        
        /* SCREENSHOT MITIGATION CLASS */
        .screenshot-mode {
            filter: blur(20px) !important;
            opacity: 0 !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Create Overlay Element
    const overlay = document.createElement('div');
    overlay.id = 'protection-overlay';
    overlay.innerHTML = '<i class="fas fa-shield-alt text-6xl mb-4"></i><h2 class="text-2xl font-bold">Conteúdo Protegido</h2><p>A cópia ou impressão deste material não é permitida.</p>';
    document.body.appendChild(overlay);

    // 3. Prevent Context Menu (Right Click)
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
        return false;
    });

    // 4. Prevent Key Combinations
    document.addEventListener('keydown', function (e) {
        // Ctrl+C, X, U, S, P, A
        if (e.ctrlKey && ['c', 'x', 'u', 's', 'p', 'a'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            e.stopPropagation();
            showProtectionWarning();
            return false;
        }

        // PrintScreen / Screenshot Keys
        if (e.key === 'PrintScreen' || e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
            // Aggressive Hide
            document.documentElement.style.visibility = 'hidden';

            // Try to clear clipboard (Best effort)
            try {
                navigator.clipboard.writeText('');
            } catch (err) { }

            setTimeout(() => {
                document.documentElement.style.visibility = 'visible';
                showProtectionWarning("Captura de tela bloqueada!");
            }, 1000);
        }
    });

    // 5. Additional PrintScreen handling on KeyUp (sometimes captured here)
    document.addEventListener('keyup', function (e) {
        if (e.key === 'PrintScreen') {
            try {
                navigator.clipboard.writeText('');
            } catch (err) { }
            showProtectionWarning("Captura de tela bloqueada!");
        }
    });

    // 6. Prevent Clipboard Events
    ['copy', 'cut', 'paste', 'dragstart', 'drop'].forEach(action => {
        document.addEventListener(action, event => {
            event.preventDefault();
            return false;
        });
    });

    function showProtectionWarning(msg = 'Ação bloqueada - Conteúdo Protegido') {
        // Remove existing toast if any
        const existingToken = document.getElementById('prot-toast');
        if (existingToken) existingToken.remove();

        const toast = document.createElement('div');
        toast.id = 'prot-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #ff0000, #990000);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 2147483647;
            font-family: sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            pointer-events: none;
            transition: opacity 0.3s;
        `;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
})();
