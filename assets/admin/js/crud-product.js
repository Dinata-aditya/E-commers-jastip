/**
 * crud-product.js
 * CRUD produk lengkap menggunakan Supabase.
 */
import {
    adminGetProducts,
    adminGetProductById,
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
} from './api.js';
import { adminGetCategories } from './api.js';
import { initMultiImageUpload, getImageData, getImageCount } from './multi-image-upload.js';
import { showModal, hideModal, initModalCloseEvents } from './modal.js';
import { validateProductForm } from './validation.js';
import { supabase } from '../../js/supabase-client.js';

/* ── Helper ─────────────────────────────────────────────────── */
const escapeHtml = (str = '') => str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const showToast = (msg, type = 'success') => {
    const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };
    const t = Object.assign(document.createElement('div'), { textContent: msg });
    Object.assign(t.style, {
        position:'fixed', bottom:'28px', right:'28px',
        background: colors[type] || colors.success,
        color:'#fff', padding:'13px 22px', borderRadius:'10px',
        fontWeight:'500', fontSize:'0.92rem', zIndex:'9999',
        boxShadow:'0 4px 14px rgba(0,0,0,0.15)', opacity:'1',
        transition:'opacity .4s ease',
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2800);
};

/* ── Isi dropdown kategori ──────────────────────────────────── */
const populateCategorySelect = async (selectId, selectedId = null) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '<option value="">Memuat kategori...</option>';
    sel.disabled  = true;
    const cats = await adminGetCategories();
    sel.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    cats.forEach(c => {
        const opt = new Option(c.name, c.id, false, Number(selectedId) === c.id);
        sel.appendChild(opt);
    });
    sel.disabled = false;
};

/* ══════════════════════════════════════════════════════════════
   HALAMAN: products.html — Daftar Produk
   ══════════════════════════════════════════════════════════════ */
const initProductList = async () => {
    initModalCloseEvents();

    const tableBody       = document.getElementById('product-table-body');
    const btnConfirmDel   = document.getElementById('btn-confirm-delete');
    let productToDelete   = null;
    let imageUrlToDelete  = null;

    /* ── Render Mobile Cards ───────────────────────────────── */
    const renderCards = (products) => {
        let container = document.getElementById('product-cards-mobile');
        if (!container) {
            container = document.createElement('div');
            container.id = 'product-cards-mobile';
            container.className = 'product-cards-mobile';
            tableBody?.closest('.table-responsive')?.after(container);
        }
        container.innerHTML = '';

        if (!products.length) {
            container.innerHTML = `<p style="text-align:center;padding:40px;color:#9ca3af;">Belum ada produk.</p>`;
            return;
        }

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = `product-card-admin${p.is_sold ? ' sold-card' : ''}`;
            card.innerHTML = `
                ${p.image_url
                    ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" class="product-card-admin-img">`
                    : `<div class="product-card-admin-img no-img"><i class="fa-solid fa-image"></i></div>`
                }
                <div class="product-card-admin-info">
                    <h4>${escapeHtml(p.name)}</h4>
                    <span class="cat">${escapeHtml(p.categories?.name || '-')}</span>
                    <div class="price">Rp ${p.price.toLocaleString('id-ID')}</div>
                    ${p.is_sold ? '<span class="sold-badge">Terjual</span>' : ''}
                </div>
                <div class="product-card-admin-actions">
                    <div class="action-btns">
                        <a href="edit-product.html?id=${p.id}" class="btn btn-secondary btn-sm" title="Edit">
                            <i class="fa-solid fa-pen"></i> Edit
                        </a>
                        <button class="btn btn-danger btn-sm btn-delete-card"
                                data-id="${p.id}" data-img="${p.image_url || ''}" title="Hapus">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </div>
                    <label class="sold-toggle-wrap">
                        <label class="sold-toggle" title="${p.is_sold ? 'Tandai Tersedia' : 'Tandai Terjual'}">
                            <input type="checkbox" class="sold-checkbox-card" data-id="${p.id}" ${p.is_sold ? 'checked' : ''}>
                            <span class="sold-slider"></span>
                        </label>
                        <span class="sold-toggle-label">${p.is_sold ? 'Terjual' : 'Tersedia'}</span>
                    </label>
                </div>
            `;
            container.appendChild(card);
        });

        // Toggle sold di cards
        container.querySelectorAll('.sold-checkbox-card').forEach(cb => {
            cb.addEventListener('change', async () => {
                const id = cb.dataset.id;
                const isSold = cb.checked;
                const { error } = await supabase.from('products').update({ is_sold: isSold }).eq('id', id);
                if (error) {
                    showToast('Gagal update status.', 'danger');
                    cb.checked = !isSold;
                } else {
                    showToast(isSold ? 'Ditandai Terjual ✓' : 'Ditandai Tersedia ✓');
                    const updated = await adminGetProducts();
                    renderTable(updated);
                    renderCards(updated);
                }
            });
        });

        // Hapus dari cards
        container.querySelectorAll('.btn-delete-card').forEach(btn => {
            btn.addEventListener('click', () => {
                productToDelete  = btn.dataset.id;
                imageUrlToDelete = btn.dataset.img;
                showModal('delete-modal');
            });
        });
    };

    const renderTable = (products) => {
        if (!products.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:50px;color:#9ca3af;">
                        <i class="fa-solid fa-box-open" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.3;"></i>
                        Belum ada produk. <a href="add-product.html">Tambah produk pertama</a>.
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = products.map((p, i) => `
            <tr class="${p.is_sold ? 'row-sold' : ''}">
                <td>${i + 1}</td>
                <td>
                    ${p.image_url
                        ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">`
                        : `<div style="width:50px;height:50px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-image" style="color:#d1d5db;"></i></div>`
                    }
                </td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td><span class="category-badge">${escapeHtml(p.categories?.name || '-')}</span></td>
                <td style="color:#4f46e5;font-weight:600;">Rp ${p.price.toLocaleString('id-ID')}</td>
                <td>
                    <label class="sold-toggle" title="${p.is_sold ? 'Tandai Tersedia' : 'Tandai Terjual'}">
                        <input type="checkbox" class="sold-checkbox"
                            data-id="${p.id}"
                            ${p.is_sold ? 'checked' : ''}>
                        <span class="sold-slider"></span>
                    </label>
                    ${p.is_sold ? '<span class="sold-badge">Terjual</span>' : ''}
                </td>
                <td class="action-btns">
                    <a href="edit-product.html?id=${p.id}" class="btn btn-secondary btn-sm" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button class="btn btn-danger btn-sm btn-delete-trigger"
                            data-id="${p.id}" data-img="${p.image_url || ''}" title="Hapus">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Toggle terjual
        tableBody.querySelectorAll('.sold-checkbox').forEach(cb => {
            cb.addEventListener('change', async () => {
                const id     = cb.dataset.id;
                const isSold = cb.checked;
                const { error } = await supabase
                    .from('products')
                    .update({ is_sold: isSold })
                    .eq('id', id);
                if (error) {
                    showToast('Gagal update status.', 'danger');
                    cb.checked = !isSold;
                } else {
                    showToast(isSold ? 'Ditandai Terjual ✓' : 'Ditandai Tersedia ✓');
                    renderTable(await adminGetProducts());
                }
            });
        });

        // Hapus
        tableBody.querySelectorAll('.btn-delete-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                productToDelete  = btn.dataset.id;
                imageUrlToDelete = btn.dataset.img;
                showModal('delete-modal');
            });
        });
    };

    // Load awal
    const products = await adminGetProducts();
    renderTable(products);
    renderCards(products);

    // Konfirmasi hapus
    if (btnConfirmDel) {
        btnConfirmDel.addEventListener('click', async () => {
            if (!productToDelete) return;
            const ok = await adminDeleteProduct(productToDelete, imageUrlToDelete || null);
            if (ok) {
                showToast('Produk berhasil dihapus.', 'danger');
                hideModal('delete-modal');
                const updated = await adminGetProducts();
                renderTable(updated);
                renderCards(updated);
            } else {
                showToast('Gagal menghapus produk. Coba lagi.', 'warning');
            }
            productToDelete = imageUrlToDelete = null;
        });
    }

    // Search produk di tabel
    const searchInput = document.getElementById('search-product');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const kw = searchInput.value.toLowerCase();
            tableBody.querySelectorAll('tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(kw) ? '' : 'none';
            });
        });
    }
};

/* ══════════════════════════════════════════════════════════════
   HALAMAN: add-product.html — Tambah Produk
   ══════════════════════════════════════════════════════════════ */
const initAddProduct = async () => {
    await populateCategorySelect('category_id');
    initMultiImageUpload([]);  // kosong untuk produk baru

    const form = document.getElementById('add-product-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateProductForm('add-product-form')) return;

        if (getImageCount() === 0) {
            alert('Minimal 1 foto produk harus diupload.');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        const fields = {
            name:        form.product_name.value.trim(),
            category_id: Number(form.category_id.value),
            price:       Number(form.price.value),
            description: form.description.value.trim(),
            condition:   form.condition?.value || null,
            is_available: true,
        };

        const { newFiles } = getImageData();

        try {
            await adminCreateProduct(fields, newFiles);
            showToast('Produk berhasil ditambahkan!');
            setTimeout(() => { window.location.href = 'products.html'; }, 1200);
        } catch (err) {
            showToast(err.message || 'Gagal menyimpan produk.', 'danger');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Produk';
        }
    });
};

/* ══════════════════════════════════════════════════════════════
   HALAMAN: edit-product.html — Edit Produk
   ══════════════════════════════════════════════════════════════ */
const initEditProduct = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('ID produk tidak ditemukan.');
        window.location.href = 'products.html';
        return;
    }

    const hiddenId = document.getElementById('edit_product_id');
    if (hiddenId) hiddenId.value = productId;

    const product = await adminGetProductById(productId);
    if (!product) {
        alert('Produk tidak ditemukan.');
        window.location.href = 'products.html';
        return;
    }

    await populateCategorySelect('category_id', product.category_id);

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    setVal('product_name', product.name);
    setVal('price',        product.price);
    setVal('description',  product.description);
    if (product.condition) setVal('condition', product.condition);

    // Load existing images — pakai kolom images jika ada, fallback ke image_url
    const existingUrls = (product.images && product.images.length > 0)
        ? product.images
        : (product.image_url ? [product.image_url] : []);

    initMultiImageUpload(existingUrls);

    const form = document.getElementById('edit-product-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateProductForm('edit-product-form')) return;

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        const fields = {
            name:        form.product_name.value.trim(),
            category_id: Number(form.category_id.value),
            price:       Number(form.price.value),
            description: form.description.value.trim(),
            condition:   form.condition?.value || null,
        };

        const { newFiles, existingUrls: keptUrls } = getImageData();
        const oldImages = existingUrls; // URL gambar sebelum edit

        try {
            await adminUpdateProduct(productId, fields, newFiles, keptUrls, oldImages);
            showToast('Produk berhasil diperbarui!');
            setTimeout(() => { window.location.href = 'products.html'; }, 1200);
        } catch (err) {
            showToast(err.message || 'Gagal memperbarui produk.', 'danger');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Perbarui Produk';
        }
    });
};

/* ── Router ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    if (path.includes('products.html'))    await initProductList();
    if (path.includes('add-product.html')) await initAddProduct();
    if (path.includes('edit-product.html'))await initEditProduct();
});
