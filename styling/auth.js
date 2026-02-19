const CLIENT_ID = '1323365609777528962';
const ADMIN_LIST = ["735531512124145674"]; // Your Discord ID

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

        const updateUI = () => {
            const navName = document.getElementById('nav-username');
            const navRank = document.getElementById('nav-rank');
            const menuRank = document.getElementById('menu-user-rank');
            const navPfp = document.getElementById('nav-pfp');
            const adminLink = document.getElementById('admin-link'); // The button in your header.html

            if (!navName || !navRank) {
                setTimeout(updateUI, 50);
                return;
            }

            // Update Basic Info
            navName.innerText = user.username;
            document.getElementById('menu-user-name').innerText = user.username;
            if(navPfp) navPfp.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

            // Admin Logic
            const isAdmin = ADMIN_LIST.includes(user.id);
            
            if(isAdmin) {
                window.isSiteOwner = true;
                navRank.innerText = "SITE OWNER";
                menuRank.innerText = "SUPREME ADMINISTRATOR";
                
                // Show the Admin Panel button in the dropdown
                if(adminLink) adminLink.classList.remove('hidden');
                
                // Also show the old trigger if it exists
                document.getElementById('admin-add-trigger')?.classList.remove('hidden');
            } else {
                window.isSiteOwner = false;
                navRank.innerText = "Teapotian Citizen";
                menuRank.innerText = "Verified Citizen";
                if(adminLink) adminLink.classList.add('hidden');
            }

            document.getElementById('login-btn')?.classList.add('hidden');
            document.getElementById('user-display')?.classList.remove('hidden');

            // Trigger jobs page re-render to show admin controls if on that page
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
        const headerUrl = window.location.origin + '/dprt/styling/header.html';
        console.log("📡 Attempting to fetch header from:", headerUrl);

        const resp = await fetch(headerUrl);
        
        if (!resp.ok) {
            const localResp = await fetch('/styling/header.html');
            if (!localResp.ok) throw new Error(`Status: ${resp.status}`);
            const localHtml = await localResp.text();
            document.getElementById('header-placeholder').innerHTML = localHtml;
        } else {
            const html = await resp.text();
            document.getElementById('header-placeholder').innerHTML = html;
        }
        
        const path = window.location.pathname;
        if (path.includes('jobs')) {
            setTimeout(() => {
                const jobsLink = document.getElementById('nav-jobs');
                if (jobsLink) jobsLink.style.color = '#bc2f32'; // Match your cinnabar color
            }, 100);
        }

        initAuth();
    } catch (e) {
        console.error("⛔ Header Load Failed:", e.message);
    }
}

window.addEventListener('DOMContentLoaded', loadGlobalHeader);
