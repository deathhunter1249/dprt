const CLIENT_ID = '1323365609777528962';

// DISCORD AUTH
async function initAuth() {
    console.log("=== AUTH START ===");
    console.log("URL:", window.location.href);
    console.log("Hash:", window.location.hash);
    
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let token = fragment.get('access_token');
    
    console.log("Token from URL:", token ? "FOUND" : "NOT FOUND");
    
    if (token) {
        console.log("💾 Saving token");
        localStorage.setItem('discord_access_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        token = localStorage.getItem('discord_access_token');
        console.log("Token from storage:", token ? "FOUND" : "NOT FOUND");
    }

    if (!token) {
        console.log("❌ No token");
        return;
    }

    console.log("🔑 Fetching user data...");

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("Response:", response.status);
        
        if (!response.ok) throw new Error("Invalid Token");
        
        const user = await response.json();
        console.log("✅ User:", user);

        // Update UI
        const navName = document.getElementById('nav-username');
        const menuName = document.getElementById('menu-user-name');
        const navRank = document.getElementById('nav-rank');
        const menuRank = document.getElementById('menu-user-rank');
        const navPfp = document.getElementById('nav-pfp');

        if(navName) navName.innerText = user.username;
        if(menuName) menuName.innerText = user.username;
        if(navPfp) navPfp.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

        const isAdmin = (user.id === '735531512124145674');
        console.log("Admin:", isAdmin);

        if(isAdmin) {
            if(navRank) navRank.innerText = "Supreme Brewer";
            if(menuRank) menuRank.innerText = "Overseer / Admin";
            const adminTrigger = document.getElementById('admin-add-trigger');
            if (adminTrigger) adminTrigger.classList.remove('hidden');
        } else {
            if(navRank) navRank.innerText = "Teapotian Citizen";
            if(menuRank) menuRank.innerText = "Verified Citizen";
        }

        document.getElementById('login-btn')?.classList.add('hidden');
        document.getElementById('user-display')?.classList.remove('hidden');

        console.log("✅ UI Updated");

        // For jobs page
        if (typeof renderApps === "function") {
            renderApps(isAdmin);
        }

    } catch (err) {
        console.error("❌ Error:", err);
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
    const blur = document.getElementById('blur-container');
    
    if (show) {
        menu?.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
        overlay?.classList.remove('opacity-0', 'pointer-events-none');
        if(blur) blur.style.filter = "blur(12px) brightness(0.4)";
    } else {
        menu?.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
        overlay?.classList.add('opacity-0', 'pointer-events-none');
        if(blur) blur.style.filter = "none";
    }
}

// LOAD HEADER & RUN AUTH
async function loadGlobalHeader() {
    try {
        const resp = await fetch('/dprt/styling/header.html');
        if (!resp.ok) throw new Error("Header not found");
        const html = await resp.text();
        document.getElementById('header-placeholder').innerHTML = html;
        
        // Highlight active page
        const path = window.location.pathname;
        if(path.includes('index.html') || path.endsWith('/dprt/')) {
            document.getElementById('nav-home')?.classList.add('text-[#b8860b]');
        } else if(path.includes('info')) {
            document.getElementById('nav-info')?.classList.add('text-[#b8860b]');
        } else if(path.includes('jobs')) {
            document.getElementById('nav-jobs')?.classList.add('text-[#b8860b]');
        }
        
        // Run auth after header loads
        initAuth();
    } catch (e) {
        console.error("Header load error:", e);
    }
}

// Auto-run on page load
window.addEventListener('DOMContentLoaded', loadGlobalHeader);
