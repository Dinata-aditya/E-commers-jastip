/**
 * dashboard.js
 * - Sidebar toggle + overlay backdrop
 * - Session guard
 * - Profile dropdown dengan email dari Supabase session
 * - Logout
 * - Dashboard stats & tabel produk terbaru
 */

document.addEventListener('DOMContentLoaded', async () => {

    /* ── 1. Sidebar toggle ───────────────────────────────────── */
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const closeBtn  = document.getElementById('close-sidebar-btn');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebar-overlay');

    const openSidebar  = () => {
        sidebar?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeSidebar = () => {
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggleBtn?.addEventListener('click', () => {
        sidebar?.classList.contains('active') ? closeSidebar() : openSidebar();
    });
    closeBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Tutup sidebar saat resize ke desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    /* ── 2. Session guard ────────────────────────────────────── */
    const isLoginPage = window.location.pathname.includes('login.html');
    if (isLoginPage) return;

    const { supabase } = await import('../../js/supabase-client.js');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    /* ── 3. Isi profil dari store_profile table ──────────────── */
    const user  = session.user;
    const email = user?.email || 'admin@jastipmayza.com';

    // Load dari store_profile table (lebih akurat dari user_metadata)
    let name      = email.split('@')[0];
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0,2).toUpperCase())}&background=4F46E5&color=fff&size=80`;

    try {
        const { getStoreProfile } = await import('./api.js');
        const profile = await getStoreProfile();
        if (profile) {
            if (profile.name)       name      = profile.name;
            if (profile.avatar_url) avatarUrl = profile.avatar_url;
        }
    } catch (_) {
        // fallback ke user_metadata
        name = user?.user_metadata?.full_name || user?.user_metadata?.name || name;
        if (user?.user_metadata?.avatar_url) avatarUrl = user.user_metadata.avatar_url;
    }

    // Isi elemen profil di topbar
    const elName    = document.getElementById('profile-name');
    const elEmail   = document.getElementById('profile-email');
    const elAvatar  = document.getElementById('profile-avatar');
    const elDName   = document.getElementById('dropdown-name');
    const elDEmail  = document.getElementById('dropdown-email');
    const elDAvatar = document.getElementById('dropdown-avatar');

    if (elName)    elName.textContent    = name;
    if (elEmail)   elEmail.textContent   = 'Admin';
    if (elAvatar)  elAvatar.src          = avatarUrl;
    if (elDName)   elDName.textContent   = name;
    if (elDEmail)  elDEmail.textContent  = email;
    if (elDAvatar) elDAvatar.src         = avatarUrl;

    /* ── 4. Profile dropdown toggle ──────────────────────────── */
    const profileTrigger  = document.getElementById('profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');

    profileTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileTrigger.classList.toggle('open');
        profileDropdown?.classList.toggle('open');
    });

    // Tutup dropdown saat klik di luar
    document.addEventListener('click', () => {
        profileTrigger?.classList.remove('open');
        profileDropdown?.classList.remove('open');
    });

    /* ── 5. Logout ───────────────────────────────────────────── */
    const handleLogout = async (e) => {
        e?.preventDefault();
        if (confirm('Yakin ingin keluar dari Panel Admin?')) {
            await supabase.auth.signOut();
            window.location.href = 'login.html?key=jastipmayza2026';
        }
    };

    document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-logout-dropdown')?.addEventListener('click', handleLogout);

    /* ── 6. Dashboard stats (hanya di dashboard.html) ───────── */
    if (!window.location.pathname.includes('dashboard.html')) return;

    const { adminGetProducts, adminGetCategories } = await import('./api.js');

    const [products, categories] = await Promise.all([
        adminGetProducts(),
        adminGetCategories(),
    ]);

    // Hitung stats nyata
    const totalProducts     = products.length;
    const availableProducts = products.filter(p => !p.is_sold && p.is_available).length;
    const soldProducts      = products.filter(p => p.is_sold).length;
    const totalCategories   = categories.length;

    // Count-up animation
    const countUp = (elId, target, duration = 1200) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const startTime = performance.now();
        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    countUp('stat-total-products',     totalProducts);
    countUp('stat-available-products', availableProducts);
    countUp('stat-sold-products',      soldProducts);
    countUp('stat-total-categories',   totalCategories);

    /* ── 7. Page view tracking ───────────────────────────────── */
    const trackAndShowVisitors = async () => {
        const today = new Date().toISOString().split('T')[0];

        // Upsert kunjungan hari ini untuk halaman 'dashboard'
        // (tidak track dashboard admin, hanya halaman client)
        try {
            // Ambil total semua kunjungan
            const { data: totalData } = await supabase
                .from('page_views')
                .select('count');
            const total = totalData?.reduce((sum, r) => sum + (r.count || 0), 0) || 0;

            // Ambil kunjungan hari ini
            const { data: todayData } = await supabase
                .from('page_views')
                .select('count')
                .eq('visit_date', today);
            const todayCount = todayData?.reduce((sum, r) => sum + (r.count || 0), 0) || 0;

            countUp('stat-total-visitors', total);
            countUp('stat-today-visitors', todayCount);
        } catch (err) {
            document.getElementById('stat-total-visitors').textContent = '-';
            document.getElementById('stat-today-visitors').textContent = '-';
        }
    };

    await trackAndShowVisitors();

    /* ── 7. Tabel 5 produk terbaru ───────────────────────────── */
    const widgetsEl = document.querySelector('.dashboard-widgets');
    if (!widgetsEl) return;

    const recent = products.slice(0, 5);
    const rows = recent.length > 0
        ? recent.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>
                    ${p.image_url
                        ? `<img src="${p.image_url}" alt="${p.name}" class="prod-img">`
                        : `<div style="width:40px;height:40px;background:#f3f4f6;border-radius:8px;"></div>`
                    }
                </td>
                <td>${p.name}</td>
                <td><span class="cat-pill">${p.categories?.name || '-'}</span></td>
                <td class="price-text">Rp ${p.price.toLocaleString('id-ID')}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="5" style="text-align:center;padding:30px;color:#9ca3af;">Belum ada produk</td></tr>`;

    const recentCard = document.createElement('div');
    recentCard.className = 'widget-card';
    recentCard.innerHTML = `
        <div class="widget-header">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Produk Terbaru</h3>
        </div>
        <div class="widget-body" style="padding:0;">
            <table class="recent-products-table">
                <thead>
                    <tr><th>#</th><th>Foto</th><th>Nama Produk</th><th>Kategori</th><th>Harga</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
    widgetsEl.appendChild(recentCard);
});
