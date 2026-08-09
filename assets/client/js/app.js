/**
 * app.js — Client-side routing & logika halaman.
 * Semua data diambil dari Supabase via api.js.
 */
import { initNavbar }          from './navbar.js';
import { getProducts, getProductById, getCategories, getStoreProfile } from './api.js';
import { renderProductGrid }   from './product.js';
import { setupWhatsAppButton } from './whatsapp.js';
import { initSearch, initCategoryFilter } from './search.js';

document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    const path = window.location.pathname;

    /* ── Homepage ─────────────────────────────────────────── */
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        const chipsEl   = document.getElementById('home-category-chips');
        let activeCatId = null;
        let activeKw    = '';
        let activeSort  = 'newest';

        const cats = await getCategories();

        const renderHomeGrid = async () => {
            const products = await getProducts({
                categoryId: activeCatId,
                keyword:    activeKw,
                sortBy:     activeSort,
            });
            renderProductGrid(products, 'product-grid');
        };

        // Chips
        if (chipsEl) {
            const allChip = document.createElement('button');
            allChip.type = 'button';
            allChip.className = 'home-chip active';
            allChip.textContent = 'Semua';
            allChip.addEventListener('click', () => {
                activeCatId = null;
                document.querySelectorAll('.home-chip').forEach(c => c.classList.remove('active'));
                allChip.classList.add('active');
                renderHomeGrid();
            });
            chipsEl.appendChild(allChip);

            cats.forEach(cat => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'home-chip';
                chip.textContent = cat.name;
                chip.addEventListener('click', () => {
                    activeCatId = cat.id;
                    document.querySelectorAll('.home-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    renderHomeGrid();
                });
                chipsEl.appendChild(chip);
            });
        }

        // Search dengan debounce
        const searchForm  = document.getElementById('home-search-form');
        const searchInput = document.getElementById('home-search-input');
        if (searchForm && searchInput) {
            let debTimer;
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                activeKw = searchInput.value.trim();
                renderHomeGrid();
            });
            searchInput.addEventListener('input', () => {
                clearTimeout(debTimer);
                debTimer = setTimeout(() => {
                    activeKw = searchInput.value.trim();
                    renderHomeGrid();
                }, 350);
            });
        }

        // Sort
        const sortSelect = document.getElementById('home-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                activeSort = e.target.value;
                renderHomeGrid();
            });
        }

        await renderHomeGrid();
    }

    /* ── Katalog Produk ───────────────────────────────────── */
    if (path.includes('products.html') || path.endsWith('/products') || path === '/products') {
        let activeCategoryId = null;
        let activeKeyword    = '';
        let activeSort       = 'newest';

        // Muat kategori dari DB
        const filterList  = document.getElementById('category-filter-list');
        const chipsEl     = document.getElementById('category-chips');
        const cats        = await getCategories();

        // Helper: set active chip
        const setActiveChip = (val) => {
            document.querySelectorAll('.category-chip').forEach(c => {
                c.classList.toggle('active', c.dataset.value === val);
            });
        };

        // Helper: set active radio
        const setActiveRadio = (val) => {
            const radio = document.querySelector(`input[name="category"][value="${val}"]`);
            if (radio) radio.checked = true;
        };

        // ── Sidebar filter list (desktop) ──
        if (filterList) {
            filterList.innerHTML = `
                <li>
                    <label>
                        <input type="radio" name="category" value="all" checked>
                        Semua
                    </label>
                </li>
            `;
            cats.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <label>
                        <input type="radio" name="category" value="${cat.id}">
                        ${cat.name}
                    </label>
                `;
                filterList.appendChild(li);
            });

            initCategoryFilter((val) => {
                activeCategoryId = val === 'all' ? null : Number(val);
                activeKeyword    = '';
                const searchInput = document.getElementById('product-search-input');
                if (searchInput) searchInput.value = '';
                setActiveChip(val);
                refreshGrid();
            });
        }

        // ── Chips (mobile) ──
        if (chipsEl) {
            // Chip "Semua"
            const allChip = document.createElement('button');
            allChip.type = 'button';
            allChip.className = 'category-chip active';
            allChip.dataset.value = 'all';
            allChip.textContent = 'Semua';
            allChip.addEventListener('click', () => {
                activeCategoryId = null;
                activeKeyword    = '';
                const searchInput = document.getElementById('product-search-input');
                if (searchInput) searchInput.value = '';
                setActiveChip('all');
                setActiveRadio('all');
                refreshGrid();
            });
            chipsEl.appendChild(allChip);

            cats.forEach(cat => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'category-chip';
                chip.dataset.value = String(cat.id);
                chip.textContent = cat.name;
                chip.addEventListener('click', () => {
                    activeCategoryId = cat.id;
                    activeKeyword    = '';
                    const searchInput = document.getElementById('product-search-input');
                    if (searchInput) searchInput.value = '';
                    setActiveChip(String(cat.id));
                    setActiveRadio(String(cat.id));
                    refreshGrid();
                });
                chipsEl.appendChild(chip);
            });
        }

        const refreshGrid = async () => {
            const products = await getProducts({
                categoryId: activeCategoryId,
                keyword:    activeKeyword,
                sortBy:     activeSort,
            });
            renderProductGrid(products, 'all-products-grid');
        };

        await refreshGrid();

        // Search
        initSearch((keyword) => {
            activeKeyword    = keyword;
            activeCategoryId = null;
            setActiveChip('all');
            setActiveRadio('all');
            refreshGrid();
        });

        // Sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                activeSort = e.target.value;
                refreshGrid();
            });
        }
    }

    /* ── About Us ─────────────────────────────────────────── */
    if (path.includes('about.html') || path.endsWith('/about') || path === '/about') {
        const profile = await getStoreProfile();
        if (!profile) return;

        const setEl  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
        const setAttr= (id, attr, val) => { const el = document.getElementById(id); if (el) el[attr] = val || ''; };

        // Avatar
        const avatarEl = document.getElementById('about-avatar');
        if (avatarEl && profile.avatar_url) {
            avatarEl.src = profile.avatar_url;
            avatarEl.onerror = () => {
                avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.name||'JM').slice(0,2).toUpperCase())}&background=4F46E5&color=fff&size=128`;
            };
        }

        setEl('about-name', profile.name);
        setEl('about-bio',  profile.bio || 'Melayani jasa titip dengan penuh amanah dan profesional.');

        // WhatsApp
        const wa = profile.whatsapp || '6283164959116';
        setAttr('about-wa-link', 'href', `https://wa.me/${wa}`);
        setEl('about-wa-text', `+${wa}`);

        // Email
        const email = profile.email || 'support@jastipmayla.com';
        setAttr('about-email-link', 'href', `mailto:${email}`);
        setEl('about-email-text', email);
    }
    if (path.includes('product-detail.html') || path.includes('/product-detail') || path.includes('product-detail')) {
        const productId = Number(new URLSearchParams(window.location.search).get('id'));
        if (!productId) return;

        const product = await getProductById(productId);
        if (!product) {
            document.getElementById('detail-title').textContent = 'Produk tidak ditemukan.';
            return;
        }

        document.getElementById('detail-title').textContent            = product.name;
        document.getElementById('breadcrumb-product-name').textContent = product.name;
        document.getElementById('detail-category').textContent         = product.categories?.name || '-';
        document.getElementById('detail-price').textContent            = `Rp ${product.price.toLocaleString('id-ID')}`;
        document.getElementById('detail-description').textContent      = product.description || 'Tidak ada deskripsi.';
        document.title = `${product.name} - JastipMayla`;

        // Badge terjual di detail produk
        if (product.is_sold) {
            const priceEl = document.getElementById('detail-price');
            if (priceEl) {
                const soldBadge = document.createElement('span');
                soldBadge.className = 'detail-sold-badge';
                soldBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sudah Terjual';
                priceEl.after(soldBadge);
            }
            // Disable tombol order
            const orderBtn = document.getElementById('btn-order-whatsapp');
            if (orderBtn) {
                orderBtn.disabled = true;
                orderBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Produk Sudah Terjual';
                orderBtn.style.opacity = '0.5';
                orderBtn.style.cursor = 'not-allowed';
            }
        }

        const imgEl      = document.getElementById('main-product-image');
        const skeletonEl = document.getElementById('img-skeleton');
        const thumbsEl   = document.getElementById('gallery-thumbs');

        // Susun array semua foto: pakai kolom images jika ada, fallback ke image_url
        const allImages = (product.images && product.images.length > 0)
            ? product.images
            : (product.image_url ? [product.image_url] : []);

        const showImage = (src) => {
            if (!imgEl) return;
            imgEl.classList.remove('loaded');
            imgEl.src = src;
            imgEl.onload  = () => { imgEl.classList.add('loaded'); if (skeletonEl) skeletonEl.style.display = 'none'; };
            imgEl.onerror = () => { imgEl.src = 'https://placehold.co/600x600?text=No+Image'; imgEl.classList.add('loaded'); if (skeletonEl) skeletonEl.style.display = 'none'; };
        };

        if (allImages.length > 0) {
            showImage(allImages[0]);
        } else if (skeletonEl) {
            skeletonEl.style.display = 'none';
        }

        // Render thumbnail gallery
        if (thumbsEl && allImages.length > 1) {
            thumbsEl.innerHTML = '';
            allImages.forEach((url, i) => {
                const thumb = document.createElement('div');
                thumb.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
                thumb.innerHTML = `<img src="${url}" alt="Foto ${i + 1}" loading="lazy">`;
                thumb.addEventListener('click', () => {
                    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    showImage(url);
                });
                thumbsEl.appendChild(thumb);
            });
        }

        setupWhatsAppButton('btn-order-whatsapp', product);
    }
});

/* ── Page View Tracker ───────────────────────────────────── */
import { supabase } from '../../js/supabase-client.js';

const trackPageView = async () => {
    try {
        const path = window.location.pathname;
        const page = path.includes('product-detail') ? 'product-detail'
                   : path.includes('products')        ? 'products'
                   : path.includes('about')           ? 'about'
                   : path.includes('how-to-order')    ? 'how-to-order'
                   : 'home';

        // Gunakan RPC function — client tidak bisa manipulasi count secara langsung
        await supabase.rpc('increment_page_view', { page_name: page });
    } catch (_) {
        // Silent fail — tracking tidak boleh ganggu UX
    }
};

// Track setelah halaman load
trackPageView();
