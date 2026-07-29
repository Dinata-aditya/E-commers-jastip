import { fetchAdminAPI } from './api.js';

// --- Simulated category data (replace with real API calls when backend is ready) ---
let categories = [
    { id: 1, name: 'Skincare', product_count: 5 },
    { id: 2, name: 'Makeup', product_count: 8 },
    { id: 3, name: 'Fashion', product_count: 3 },
    { id: 4, name: 'Aksesoris', product_count: 6 },
    { id: 5, name: 'Elektronik', product_count: 2 },
];
let nextId = 6;
let editingId = null; // tracks which category is being edited

// --- DOM References ---
const tableBody = document.getElementById('category-table-body');
const form = document.getElementById('add-category-form');
const nameInput = document.getElementById('category_name');
const idInput = document.getElementById('category_id_input');
const formTitle = document.querySelector('.form-card h4');
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

// --- Render Table ---
const renderCategories = () => {
    if (!tableBody) return;

    if (categories.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">
                    <i class="fa-solid fa-tags" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:10px;"></i>
                    Belum ada kategori. Tambahkan kategori pertama Anda.
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = categories.map((cat, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(cat.name)}</strong></td>
            <td><span class="count-badge">${cat.product_count} Produk</span></td>
            <td class="action-btns">
                <button class="btn btn-secondary btn-sm btn-edit" data-id="${cat.id}" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${cat.id}" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Attach event listeners to dynamic buttons
    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => handleEdit(Number(btn.dataset.id)));
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(Number(btn.dataset.id)));
    });
};

// --- Handle Add / Edit Submit ---
const handleFormSubmit = async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();

    if (!name) {
        nameInput.focus();
        return;
    }

    if (editingId !== null) {
        // === EDIT MODE ===
        /*
        // Real API call:
        await fetchAdminAPI(`update-category.php`, {
            method: 'POST',
            body: JSON.stringify({ id: editingId, name }),
            headers: { 'Content-Type': 'application/json' }
        });
        */
        const idx = categories.findIndex(c => c.id === editingId);
        if (idx !== -1) {
            categories[idx].name = name;
        }
        resetForm();
        showToast('Kategori berhasil diperbarui.', 'success');
    } else {
        // === ADD MODE ===
        /*
        // Real API call:
        await fetchAdminAPI('add-category.php', {
            method: 'POST',
            body: JSON.stringify({ name }),
            headers: { 'Content-Type': 'application/json' }
        });
        */
        categories.push({ id: nextId++, name, product_count: 0 });
        showToast('Kategori berhasil ditambahkan.', 'success');
    }

    renderCategories();
};

// --- Handle Edit ---
const handleEdit = (id) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    editingId = id;
    nameInput.value = cat.name;
    if (idInput) idInput.value = id;
    if (formTitle) formTitle.textContent = 'Edit Kategori';
    if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';

    // Show cancel button if not already present
    if (form && !document.getElementById('btn-cancel-edit')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'btn-cancel-edit';
        cancelBtn.className = 'btn btn-cancel-edit';
        cancelBtn.textContent = 'Batal Edit';
        cancelBtn.addEventListener('click', resetForm);
        form.appendChild(cancelBtn);
    }

    nameInput.focus();
};

// --- Handle Delete ---
const handleDelete = (id) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const confirmed = confirm(`Yakin ingin menghapus kategori "${cat.name}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;

    /*
    // Real API call:
    await fetchAdminAPI(`delete-category.php?id=${id}`, { method: 'DELETE' });
    */
    categories = categories.filter(c => c.id !== id);

    // If we were editing the deleted category, reset the form
    if (editingId === id) resetForm();

    renderCategories();
    showToast('Kategori berhasil dihapus.', 'danger');
};

// --- Reset Form to Add Mode ---
const resetForm = () => {
    editingId = null;
    if (form) form.reset();
    if (idInput) idInput.value = '';
    if (formTitle) formTitle.textContent = 'Tambah Kategori Baru';
    if (submitBtn) submitBtn.textContent = 'Simpan Kategori';

    const cancelBtn = document.getElementById('btn-cancel-edit');
    if (cancelBtn) cancelBtn.remove();
};

// --- Toast Notification ---
const showToast = (message, type = 'success') => {
    const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: colors[type] || colors.success,
        color: '#fff',
        padding: '14px 24px',
        borderRadius: '10px',
        fontWeight: '500',
        fontSize: '0.95rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '9999',
        transition: 'opacity 0.4s ease',
        opacity: '1',
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
};

// --- XSS helper ---
const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
