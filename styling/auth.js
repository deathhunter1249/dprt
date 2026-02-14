const CLIENT_ID = '1323365609777528962';

// DISCORD AUTH
async function initAuth() {
    console.log("=== AUTH START ===");
    
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let token = fragment.get('access_token');
    
    if (token) {
        localStorage.setItem('discord_access_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        token = localStorage.getItem('discord_access_token');
    }

    if (!token) return;

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Invalid Token");
        const user = await response.json();

        // Ensure header elements exist before updating
        const updateUI = () => {
            const navName = document.getElementById('nav-username');
            const navRank = document.getElementById('nav-rank');
            const menuRank = document.getElementById('menu-user-rank');
            const navPfp = document.getElementById('nav-pfp');

            if (!navName || !navRank) {
                // If elements aren't ready yet, wait 50ms and try again
                setTimeout(updateUI, 50);
                return;
            }

            // Update Basic Info
            navName.innerText = user.username;
            document.getElementById('menu-user-name').innerText = user.username;
            if(navPfp) navPfp.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

            // Admin Logic
            const isAdmin = (user.id === '735531512124145674');
            
            if(isAdmin) {
                navRank.innerText = "Site Owner";
                menuRank.innerText = "Admin";
                document.getElementById('admin-add-trigger')?.classList.remove('hidden');
            } else {
                navRank.innerText = "Teapotian Citizen";
                menuRank.innerText = "Verified Citizen";
            }

            document.getElementById('login-btn')?.classList.add('hidden');
            document.getElementById('user-display')?.classList.remove('hidden');

            // Trigger jobs page if applicable
            if (typeof renderApps === "function") {
                renderApps(isAdmin);
            }
            console.log("✅ UI Updated Successfully");
        };

        updateUI();

    } catch (err) {
        console.error("❌ Auth Error:", err);
        localStorage.removeItem('discord_access_token');
    }
}

// GLOBAL FUNCTIONS
function login() {
    const redirect = encodeURIComponent('https://deathhunter1249.github.io/dprt/');
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirect}&scope=identify`;
}

function logout() {
    localStorage.removeItem('discord_access_token');
    window.location.reload();
}

function toggleMenu(show) {
    const menu = document.getElementById('profile-menu');
    const overlay = document.getElementById('global-overlay');
    const blurContainer = document.getElementById('blur-container');
    
    // Logic: 
    // 1. If 'show' is explicitly false (from overlay click), we close.
    // 2. If 'show' is undefined/event (from PFP click), we check current state to toggle.
    const isCurrentlyOpen = !menu?.classList.contains('opacity-0');
    const shouldOpen = (show === true) || (show !== false && !isCurrentlyOpen);

    if (shouldOpen) {
        menu?.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-2');
        overlay?.classList.remove('opacity-0', 'pointer-events-none');
        if(blurContainer) {
            blurContainer.style.transition = "filter 0.3s ease, opacity 0.3s ease";
            blurContainer.style.filter = "brightness(0.5)"; 
        }
    } else {
        menu?.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
        overlay?.classList.add('opacity-0', 'pointer-events-none');
        if(blurContainer) {
            blurContainer.style.filter = "none";
        }
    }
}

async function loadGlobalHeader() {
    try {
        // This is the most reliable way for GitHub Pages:
        // If we're on deathhunter1249.github.io/dprt/, 
        // this ensures the path always points to the root 'dprt' folder.
        const headerUrl = window.location.origin + '/dprt/styling/header.html';

        console.log("📡 Attempting to fetch header from:", headerUrl);

        const resp = await fetch(headerUrl);
        
        if (!resp.ok) {
            // Fallback for local testing (where /dprt/ might not exist)
            const localResp = await fetch('/styling/header.html');
            if (!localResp.ok) throw new Error(`Status: ${resp.status}`);
            const localHtml = await localResp.text();
            document.getElementById('header-placeholder').innerHTML = localHtml;
        } else {
            const html = await resp.text();
            document.getElementById('header-placeholder').innerHTML = html;
        }
        
        // --- Highlighting logic for the Jobs page ---
        const path = window.location.pathname;
        if (path.includes('jobs')) {
            // Wait a tiny bit for the HTML to inject, then highlight
            setTimeout(() => {
                const jobsLink = document.getElementById('nav-jobs');
                if (jobsLink) jobsLink.style.color = '#b8860b';
            }, 100);
        }

        initAuth();
    } catch (e) {
        console.error("⛔ Header Load Failed:", e.message);
    }
}

window.addEventListener('DOMContentLoaded', loadGlobalHeader);
