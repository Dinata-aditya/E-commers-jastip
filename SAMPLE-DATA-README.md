# 📦 SAMPLE DATA - Panduan Penggunaan & Penghapusan

## Tentang File Ini

File-file sample data berikut ini **hanya untuk keperluan demo** sebelum backend (PHP + MySQL) tersedia. Data ini memungkinkan website menampilkan produk-produk contoh tanpa perlu database.

---

## 📂 File-File Sample Data yang Dibuat

| File | Lokasi | Deskripsi |
|------|--------|-----------|
| **sample-data.js** | `assets/client/js/sample-data.js` | Berisi 11 produk contoh dari berbagai kategori (Skincare, Makeup, Fashion, Aksesoris, Snack Import) |
| **app.js (modifikasi)** | `assets/client/js/app.js` | Ditambahkan logika fallback ke sample data jika API gagal |
| **product.js (modifikasi)** | `assets/client/js/product.js` | Ditambahkan dukungan gambar URL eksternal (Unsplash) |

---

## 🗑️ Cara Menghapus Sample Data (Saat Backend Sudah Siap)

### Langkah 1: Hapus File `sample-data.js`
```bash
# Di terminal/command prompt:
cd "c:\Users\Dell\OneDrive\Documents\PROJECK CODING ADT\E-commers-jastip"
rm assets/client/js/sample-data.js
```

### Langkah 2: Edit File `app.js`
Buka file `assets/client/js/app.js` dan **hapus/komentari semua baris yang ditandai `// [SAMPLE]`**:

**Baris yang perlu dihapus:**
1. Line ~7:
   ```javascript
   // HAPUS 2 BARIS INI:
   import { SAMPLE_PRODUCTS, filterSampleProducts } from './sample-data.js';
   ```

2. Line ~19-23 (di bagian homepage):
   ```javascript
   // HAPUS BLOCK INI:
   if (!products || products.length === 0) {
       products = filterSampleProducts(SAMPLE_PRODUCTS, { limit: 4 });
   }
   ```

3. Line ~27-30 (di bagian products.html):
   ```javascript
   // HAPUS BLOCK INI:
   let activeCategory = 'all';
   let activeKeyword  = '';
   ```

4. Line ~38-45 (di function refreshGrid):
   ```javascript
   // HAPUS BLOCK INI:
   if (!products || products.length === 0) {
       products = filterSampleProducts(SAMPLE_PRODUCTS, {
           category: activeCategory,
           keyword:  activeKeyword,
       });
   }
   ```

5. Line ~59-62 (di search handler):
   ```javascript
   // HAPUS BLOCK INI:
   const products = filterSampleProducts(SAMPLE_PRODUCTS, { keyword });
   renderProductGrid(products, 'all-products-grid');
   
   // GANTI DENGAN:
   await refreshGrid();
   ```

6. Line ~72-76 (di product-detail.html):
   ```javascript
   // HAPUS BLOCK INI:
   if (!product) {
       product = SAMPLE_PRODUCTS.find(p => p.id === productId) || null;
   }
   ```

7. Line ~86-90 (di image src):
   ```javascript
   // HAPUS BLOCK INI:
   imgEl.src = product.image.startsWith('http')
       ? product.image
       : `../../backend/uploads/products/${product.image}`;
   
   // GANTI DENGAN:
   imgEl.src = `../../backend/uploads/products/${product.image}`;
   ```

### Langkah 3: Edit File `product.js`
Buka file `assets/client/js/product.js` dan edit baris ~16-18:

**Hapus:**
```javascript
const imgSrc = product.image && product.image.startsWith('http')
    ? product.image
    : `../../backend/uploads/products/${product.image}`;
```

**Ganti dengan:**
```javascript
const imgSrc = `../../backend/uploads/products/${product.image}`;
```

---

## ✅ Verifikasi

Setelah menghapus sample data dan mengaktifkan backend asli:
1. Pastikan backend API (`get-products.php`, `get-product.php`) sudah berjalan
2. Buka browser dan refresh halaman
3. Produk seharusnya dimuat dari database MySQL, bukan dari sample data

---

## 📋 Daftar Kategori Sample

Sample data menggunakan 5 kategori:
- **Skincare** (3 produk)
- **Makeup** (2 produk)
- **Fashion** (2 produk)
- **Aksesoris** (2 produk)
- **Snack Import** (2 produk)

**Total: 11 produk contoh**

---

## 🖼️ Sumber Gambar

Semua gambar produk sample menggunakan **Unsplash.com** (free stock photos) sebagai placeholder. Gambar ini akan otomatis terupdate saat backend sudah menyediakan gambar asli dari folder `backend/uploads/products/`.

---

**Dibuat:** 30 Juli 2026  
**Versi:** 1.0  
**Catatan:** File ini juga bisa dihapus setelah sample data tidak digunakan lagi.
