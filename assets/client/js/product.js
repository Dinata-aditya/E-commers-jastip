export const renderProductGrid = (products, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                color: var(--text-muted, #868e96);
                padding: 60px 20px;
                font-size: 0.95rem;
            ">
                <i class="fa-solid fa-box-open" style="display:block;font-size:2.5rem;margin-bottom:12px;opacity:0.3;"></i>
                Tidak ada produk yang ditemukan.
            </p>`;
        return;
    }

    products.forEach(product => {
        // Gunakan image_url dari Supabase Storage
        const imgSrc      = product.image_url || '';
        const categoryName = product.categories?.name || '';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <a href="product-detail.html?id=${product.id}" class="product-card-link">
                <div class="product-card-img">
                    ${imgSrc
                        ? `<img src="${imgSrc}" alt="${escapeHtml(product.name)}" loading="lazy">`
                        : `<div class="no-image-placeholder"><i class="fa-solid fa-image"></i></div>`
                    }
                    ${categoryName ? `<span class="category-badge">${escapeHtml(categoryName)}</span>` : ''}
                    ${product.is_sold ? `<span class="sold-overlay-badge">Terjual</span>` : ''}
                </div>
                <div class="product-card-body">
                    <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
                    <p class="product-card-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                    <div class="btn-detail ${product.is_sold ? 'btn-detail-sold' : ''}">
                        ${product.is_sold ? 'Sudah Terjual' : 'Detail Produk'}
                    </div>
                </div>
            </a>
        `;
        container.appendChild(card);
    });
};

// XSS guard — escape teks yang dimasukkan ke innerHTML
const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};
