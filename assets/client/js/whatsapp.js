export const generateWhatsAppLink = (productName, price) => {
    const phone = "6281234567890"; // Ganti dengan nomor admin
    const message = `Halo Admin JastipMayla, saya ingin titip beli produk ini:\n\n*Nama Produk:* ${productName}\n*Harga Est:* Rp ${price}\n\nMohon informasi total biaya dan ketersediaannya. Terima kasih!`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const setupWhatsAppButton = (buttonId, productName, price) => {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.addEventListener('click', () => {
            const waUrl = generateWhatsAppLink(productName, price);
            window.open(waUrl, '_blank');
        });
    }
};