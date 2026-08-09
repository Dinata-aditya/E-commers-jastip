export const initNavbar = () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu      = document.getElementById('nav-menu');

    if (!hamburgerBtn || !navMenu) return;

    const openNav = () => {
        navMenu.classList.add('active');
        const icon = hamburgerBtn.querySelector('i');
        icon?.classList.replace('fa-bars', 'fa-xmark');
    };

    const closeNav = () => {
        navMenu.classList.remove('active');
        const icon = hamburgerBtn.querySelector('i');
        icon?.classList.replace('fa-xmark', 'fa-bars');
    };

    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.contains('active') ? closeNav() : openNav();
    });

    // Tutup saat klik link di dalam nav
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Tutup saat klik di luar nav
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            closeNav();
        }
    });
};
