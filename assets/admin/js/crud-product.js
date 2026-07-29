import { fetchAdminAPI } from './api.js';
import { initImagePreview } from './preview-image.js';
import { showModal, hideModal, initModalCloseEvents } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // --- LOGIKA HALAMAN DAFTAR PRODUK (products.html) ---
    if (path.includes('products.html')) {
        initModalCloseEvents(); // Aktifkan tombol close pada modal
        
        let productToDelete = null;

        // Simulasi fungsi mengambil data
        const loadProducts = async () => {
            // const products = await fetchAdminAPI('get-products.php');
            const tableBody = document.getElementById('product-table-body');
            
            // Placeholder tampilan sementara sebelum PHP siap
            tableBody.innerHTML = `
                <tr>
                    <td>1</td>
                    <td><img src="https://via.placeholder.com/50" alt="Produk"></td>
                    <td>Skincare Mawar</td>
                    <td>Skincare</td>
                    <td>Rp 150.000</td>
                    <td class="action-btns">
                        <a href="edit-product.html?id=1" class="btn btn-secondary btn-sm"><i class="fa-solid fa-pen"></i></a>
                        <button class="btn btn-danger btn-sm btn-delete-trigger" data-id="1"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;

            // Pasang event listener untuk tombol hapus dinamis
            document.querySelectorAll('.btn-delete-trigger').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    productToDelete = e.currentTarget.getAttribute('data-id');
                    showModal('delete-modal');
                });
            });
        };

        loadProducts();

        // Tombol Konfirmasi Hapus di Modal
        const btnConfirmDelete = document.getElementById('btn-confirm-delete');
        if (btnConfirmDelete) {
            btnConfirmDelete.addEventListener('click', async () => {
                if (productToDelete) {
                    /*
                    await fetchAdminAPI(`delete-product.php?id=${productToDelete}`, { method: 'DELETE' });
                    */
                    alert(`Produk ID ${productToDelete} berhasil dihapus (Simulasi)`);
                    hideModal('delete-modal');
                    loadProducts(); // Refresh tabel
                }
            });
        }
    }

    // --- LOGIKA HALAMAN TAMBAH PRODUK (add-product.html) ---
    if (path.includes('add-product.html')) {
        initImagePreview('product_image', 'image-preview-container', 'preview-img');

        const addForm = document.getElementById('add-product-form');
        if (addForm) {
            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(addForm);
                
                // await fetchAdminAPI('add-product.php', { method: 'POST', body: formData });
                alert("Data produk berhasil disimpan! (Simulasi)");
                window.location.href = 'products.html';
            });
        }
    }
});