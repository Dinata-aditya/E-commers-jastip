# JastipMayza — Jasa Titip E-Commerce

Platform web jasa titip modern yang dibangun dengan HTML, CSS, JavaScript murni dan Supabase sebagai backend.

🌐 **Live Demo:** [jastipmayza.netlify.app](https://jastipmayza.netlify.app)

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6 Modules) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Netlify |
| Repo | GitHub |

---

## 📁 Struktur Direktori

```
JastipMayza/
│
├── index.html              # Homepage + featured products
├── products.html           # Katalog produk + filter kategori
├── product-detail.html     # Detail produk + galeri foto
├── about.html              # Tentang toko
├── how-to-order.html       # Cara order
├── contact.html            # Kontak
├── 404.html                # Halaman tidak ditemukan
│
├── admin/                  # Halaman admin panel (protected)
│   ├── login.html          # Login admin
│   ├── dashboard.html      # Dashboard + analytics
│   ├── products.html       # Kelola produk
│   ├── add-product.html    # Tambah produk
│   ├── edit-product.html   # Edit produk
│   ├── categories.html     # Kelola kategori
│   ├── profile.html        # Profil admin + ganti password
│   └── reset-password.html # Reset password
│
├── assets/
│   ├── js/
│   │   └── supabase-client.js   # Supabase client (anon key)
│   ├── client/
│   │   ├── css/            # CSS modular client
│   │   └── js/             # JS modular client (app, api, product, search, dll)
│   └── admin/
│       ├── css/            # CSS modular admin
│       └── js/             # JS modular admin (crud, dashboard, profile, dll)
│
├── img/                    # Gambar statis (logo, dll)
└── README.md
```

---

## ✨ Fitur

### Client (Publik)
- Lihat katalog produk dengan filter kategori
- Search produk real-time
- Sort produk (terbaru, harga naik/turun)
- Detail produk dengan galeri foto
- Badge "Terjual" pada produk yang sudah terjual
- Order via WhatsApp
- Skeleton screen saat loading
- Responsive mobile & desktop

### Admin Panel (Protected)
- Login dengan Supabase Auth
- Dashboard dengan analytics (total produk, pengunjung hari ini, total pengunjung)
- CRUD produk dengan multi-image upload
- Kelola kategori
- Toggle status terjual/tersedia
- Profil admin + ganti password dengan validasi
- Upload foto profil

---

## 🗄 Database (Supabase)

| Tabel | Keterangan |
|-------|------------|
| `products` | Data produk (nama, harga, gambar, kategori, status) |
| `categories` | Kategori produk |
| `store_profile` | Profil toko (nama, bio, avatar, kontak) |
| `admin_users` | Daftar user yang punya akses admin |
| `page_views` | Analytics kunjungan per halaman per hari |

### RLS Policies
- Public: SELECT produk, kategori, profil toko
- Admin: INSERT/UPDATE/DELETE produk, kategori, profil toko
- Storage: Admin-only upload/delete, public direct URL, listing diblok
- Page views: Hanya admin yang bisa SELECT, increment via RPC function

---

## 🔒 Security

- Menggunakan **anon key** (bukan service_role key) di frontend
- **Row Level Security (RLS)** aktif di semua tabel
- `is_admin()` function dengan `SET search_path = pg_catalog, public`
- Page views diproteksi dengan **SECURITY DEFINER** RPC function
- Storage bucket: listing diblok, hanya admin yang bisa write
- Ganti password dengan re-authentication

---

## 🚀 Deploy

### Frontend (Netlify)
1. Fork/clone repository ini
2. Connect ke Netlify via GitHub
3. Deploy dari branch `main`, publish directory `/`

### Backend (Supabase)
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buat tabel sesuai struktur di atas
3. Setup RLS policies
4. Ganti `SUPABASE_URL` dan `SUPABASE_ANON` di `assets/js/supabase-client.js`

---

## 📸 Storage

Bucket `product-images` di Supabase Storage:
- `public = true` (direct URL bekerja otomatis)
- Tidak ada SELECT policy (listing diblok)
- Admin-only INSERT/UPDATE/DELETE

---

*Dibuat dengan ❤️ — JastipMayza 2026*