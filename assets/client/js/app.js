import { initNavbar } from './navbar.js';
import { fetchAPI } from './api.js';
import { renderProductGrid } from './product.js';
import { setupWhatsAppButton } from './whatsapp.js';
import { initSearch, initCategoryFilter } from './search.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inisialisasi Fitur Global (Ada di setiap halaman)
    initNavbar();

    // Deteksi Halaman Saat Ini
    const path = window.location.pathname;

    // 2. Logika Halaman Homepage (`index.html`)
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        const products = await fetchAPI('get-products.php?limit=4'); 
        // Note: karena backend belum ada, ini akan error di console tapi tidak merusak web (ditangkap oleh try-catch di api.js)
        renderProductGrid(products, 'product-grid');
    }

    // 3. Logika Halaman Katalog (`products.html`)
    if (path.includes('products.html')) {
        let currentProducts = await fetchAPI('get-products.php') || [];
        renderProductGrid(currentProducts, 'all-products-grid');

        // Setup Filter
        initCategoryFilter(async (category) => {
            const url = category === 'all' ? 'get-products.php' : `get-products.php?category=${category}`;
            const filteredProducts = await fetchAPI(url);
            renderProductGrid(filteredProducts, 'all-products-grid');
        });

        // Setup Search
        initSearch(async (keyword) => {
            const searchedProducts = await fetchAPI(`get-products.php?search=${keyword}`);
            renderProductGrid(searchedProducts, 'all-products-grid');
        });
    }

    // 4. Logika Halaman Detail (`product-detail.html`)
    if (path.includes('product-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const product = await fetchAPI(`get-product.php?id=${productId}`);
            if (product) {
                document.getElementById('detail-title').textContent = product.name;
                document.getElementById('breadcrumb-product-name').textContent = product.name;
                document.getElementById('detail-category').textContent = product.category;
                document.getElementById('detail-price').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
                document.getElementById('detail-description').textContent = product.description;
                document.getElementById('main-product-image').src = `../../backend/uploads/products/${product.image}`;
                
                setupWhatsAppButton('btn-order-whatsapp', product.name, product.price.toLocaleString('id-ID'));
            }
        }
    }
});