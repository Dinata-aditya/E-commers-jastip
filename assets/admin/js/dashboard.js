document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Toggle Logic
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // 2. Logout Logic
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari Panel Admin?");
            if (confirmLogout) {
                localStorage.removeItem('admin_logged_in');
                window.location.href = 'login.html';
            }
        });
    }

    // 3. (Opsional) Proteksi Halaman Sederhana
    // Jika tidak ada sesi login, kembalikan ke halaman login
    if (!localStorage.getItem('admin_logged_in') && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
});