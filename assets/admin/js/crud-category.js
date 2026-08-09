/**
 * crud-category.js
 * CRUD kategori menggunakan Supabase.
 */
import {
    adminGetCategories,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
} from './api.js';

/* ── Helpers ─────────────────────────────────────────────────── */
const escapeHtml = (str = '') => str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const showToast = (msg, type = 'success') => {
    const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };
    const t = Object.assign(document.createElement('div'), { textContent: msg });
    Object.assign(t.style, {
        position:'fixed', bottom:'28px', right:'28px',
        background: colors[type], color:'#fff',
        padding:'13px 22px', borderRadius:'10px',
        fontWeight:'500', fontSize:'0.92rem',
        zIndex:'9999', boxShadow:'0 4px 14px rgba(0,0,0,0.15)',
        opacity:'1', transition:'opacity .4s ease',
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 400); }, 2800);
};

/* ── State ───────────────────────────────────────────────────── */
let editingId = null;

/* ── DOM refs ────────────────────────────────────────────────── */
const tableBody = document.getElementById('category-table-body');
const form      = document.getElementById('add-category-form');
const nameInput = document.getElementById('category_name');
const idInput   = document.getElementById('category_id_input');
const formTitle = document.querySelector('.form-card h4');
const submitBtn = form?.querySelector('button[type="submit"]');

/* ── Render tabel ────────────────────────────────────────────── */
const renderTable = (categories) => {
    if (!tableBody) return;

    if (!categories.length) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4" style="text-align:center;padding:50px;color:#9ca3af;">
                    <i class="fa-solid fa-tags" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.3;"></i>
                    Belum ada kategori. Tambahkan kategori pertama.
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = categories.map((c, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td><span class="count-badge">${c.product_count ?? 0} Produk</span></td>
            <td class="action-btns">
                <button class="btn btn-secondary btn-sm btn-edit"
                        data-id="${c.id}" data-name="${escapeHtml(c.name)}" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-delete"
                        data-id="${c.id}" data-name="${escapeHtml(c.name)}" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    tableBody.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', () => enterEditMode(Number(btn.dataset.id), btn.dataset.name))
    );
    tableBody.querySelectorAll('.btn-delete').forEach(btn =>
        btn.addEventListener('click', () => handleDelete(Number(btn.dataset.id), btn.dataset.name))
    );
};

/* ── Load & render ───────────────────────────────────────────── */
const loadCategories = async () => {
    const cats = await adminGetCategories();
    renderTable(cats);
};

/* ── Form submit (add + edit) ────────────────────────────────── */
const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameInput?.value.trim();
    if (!name) { nameInput?.focus(); return; }

    submitBtn.disabled = true;

    try {
        if (editingId !== null) {
            await adminUpdateCategory(editingId, name);
            showToast('Kategori berhasil diperbarui.');
        } else {
            await adminCreateCategory(name);
            showToast('Kategori berhasil ditambahkan.');
        }
        resetForm();
        await loadCategories();
    } catch (err) {
        showToast(err.message || 'Operasi gagal.', 'danger');
    } finally {
        submitBtn.disabled = false;
    }
};

/* ── Edit mode ───────────────────────────────────────────────── */
const enterEditMode = (id, name) => {
    editingId = id;
    if (nameInput) nameInput.value = name;
    if (idInput)   idInput.value   = id;
    if (formTitle) formTitle.textContent = 'Edit Kategori';
    if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';

    if (form && !document.getElementById('btn-cancel-edit')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type      = 'button';
        cancelBtn.id        = 'btn-cancel-edit';
        cancelBtn.className = 'btn btn-cancel-edit';
        cancelBtn.textContent = 'Batal Edit';
        cancelBtn.addEventListener('click', resetForm);
        form.appendChild(cancelBtn);
    }
    nameInput?.focus();
};

/* ── Reset form ──────────────────────────────────────────────── */
const resetForm = () => {
    editingId = null;
    form?.reset();
    if (idInput)   idInput.value = '';
    if (formTitle) formTitle.textContent = 'Tambah Kategori Baru';
    if (submitBtn) submitBtn.textContent = 'Simpan Kategori';
    document.getElementById('btn-cancel-edit')?.remove();
};

/* ── Delete ──────────────────────────────────────────────────── */
const handleDelete = async (id, name) => {
    if (!confirm(`Hapus kategori "${name}"?\n\nProduk yang menggunakan kategori ini akan kehilangan kategorinya.`)) return;
    try {
        await adminDeleteCategory(id);
        if (editingId === id) resetForm();
        showToast('Kategori berhasil dihapus.', 'danger');
        await loadCategories();
    } catch (err) {
        showToast(err.message || 'Gagal menghapus.', 'danger');
    }
};

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    form?.addEventListener('submit', handleSubmit);
});
