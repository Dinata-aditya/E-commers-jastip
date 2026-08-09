const PHONE = '6283164959116';

/**
 * Generate link WhatsApp dengan pesan order lengkap.
 * @param {object} product - object produk dari Supabase
 */
export const generateWhatsAppLink = (product) => {
    const name     = product.name  || '-';
    const price    = product.price ? `Rp ${product.price.toLocaleString('id-ID')}` : '-';
    const imageUrl = product.image_url || '';
    const pageUrl  = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/product-detail.html?id=${product.id}`;

    let message = `Halo Admin JastipMayza! 👋\n\nSaya ingin memesan produk berikut:\n\n`;
    message += `*Nama Produk:* ${name}\n`;
    message += `*Harga:* ${price}\n`;
    message += `*Link Produk:* ${pageUrl}\n`;

    if (imageUrl) {
        message += `*Foto Produk:* ${imageUrl}\n`;
    }

    message += `\nMohon informasi ketersediaan dan total biaya jastipnya. Terima kasih! 🙏`;

    return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Setup tombol order WA di halaman detail produk.
 * @param {string} buttonId
 * @param {object} product - full product object
 */
export const setupWhatsAppButton = (buttonId, product) => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', () => {
        window.open(generateWhatsAppLink(product), '_blank');
    });
};
