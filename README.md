# E-commers-jastip
ini adalah projeck ketiga saya

JastipMayla adalah platform web aplikasi jasa titip (*jastip*) modern yang dirancang bersih, responsif, dan terstruktur dengan pemisahan tugas yang ketat antara *Client*, *Admin*, dan *Backend*.

## 📁 Struktur Direktori Proyek

```text
JastipMayla/
│
├── index.html              # Homepage
├── products.html           # All Products
├── product-detail.html     # Product Details
├── about.html              # About Us
├── how-to-order.html       # How to Order
├── contact.html            # Contact
├── 404.html
│
├── assets/
│   ├── client/
│   │   ├── css/            # CSS modular per komponen & halaman client
│   │   ├── js/             # JavaScript modular (ES6) client
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── admin/
│       ├── css/            # CSS modular admin (login, dashboard, table, form, dll)
│       ├── js/             # JavaScript modular admin (crud, login, preview image, dll)
│       ├── images/
│       └── icon/
│
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── products.html
│   ├── add-product.html
│   ├── edit-product.html
│   ├── categories.html
│   ├── settings.html
│   └── profile.html
│
├── backend/
│   ├── config/             # Koneksi database & konfigurasi
│   ├── fire/               # File API PHP (CRUD produk, login, upload, kategori)
│   ├── middleware/         # Autentikasi
│   ├── uploads/            # Direktori penyimpanan file (products, banners)
│   └── helpers/            # Fungsi bantuan, respons, & validasi
│
├── database/
│   ├── jastipmayla.sql
│   └── README.md
│
├── .htaccess
├── README.md
└── LICENSE