export const renderProductGrid = (products, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Bersihkan container

    if (!products || products.length === 0) {
        container.innerHTML = '<p>Tidak ada produk yang ditemukan.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'feature-card product-card';
        card.innerHTML = `
            <img src="../../backend/uploads/products/${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px; margin-bottom: 15px; height: 200px; object-fit: cover;">
            <span class="category-badge">${product.category}</span>
            <h3 style="margin: 10px 0; font-size: 1.1rem;">${product.name}</h3>
            <p style="color: var(--primary-color); font-weight: 700;">Rp ${product.price.toLocaleString('id-ID')}</p>
            <a href="product-detail.html?id=${product.id}" class="btn btn-outline" style="width: 100%; justify-content: center; margin-top: 15px;">Detail Produk</a>
        `;
        container.appendChild(card);
    });
};