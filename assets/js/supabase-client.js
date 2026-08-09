/**
 * supabase-client.js
 * Satu-satunya file yang menyimpan konfigurasi Supabase.
 * Di-import oleh semua file JS yang butuh akses database.
 *
 * Menggunakan Supabase JS SDK v2 via CDN ESM.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://dmeinuaeeqigvlhlvsig.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWludWFlZXFpZ3ZsaGx2c2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTIyODUsImV4cCI6MjEwMTY2ODI4NX0.iY5twXSkBKk9kK9GpirAH8sLRvivbtx9UcUW56iwsFs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Nama bucket Storage untuk foto produk
export const STORAGE_BUCKET = 'product-images';

/**
 * Helper: upload gambar ke Supabase Storage.
 * @param {File} file - File gambar dari input
 * @returns {Promise<string|null>} - Public URL gambar, atau null jika gagal
 */
export const uploadProductImage = async (file) => {
    // Blob hasil crop tidak punya .name — fallback ke 'jpg'
    const ext      = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
        console.error('Upload error:', error.message, error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
};

/**
 * Helper: upload beberapa gambar ke Supabase Storage.
 * @param {Array<File|Blob>} files
 * @returns {Promise<string[]>} array public URL (skip null)
 */
export const uploadMultipleImages = async (files) => {
    const urls = [];
    for (const file of files) {
        if (!file) continue;
        const url = await uploadProductImage(file);
        if (url) urls.push(url);
    }
    return urls;
};

/**
 * Helper: hapus beberapa gambar dari Storage.
 * @param {string[]} publicUrls
 */
export const deleteMultipleImages = async (publicUrls = []) => {
    for (const url of publicUrls) {
        await deleteProductImage(url);
    }
};

/**
 * Helper: hapus gambar dari Storage berdasarkan URL publik.
 * @param {string} publicUrl
 */
export const deleteProductImage = async (publicUrl) => {
    if (!publicUrl) return;
    const path = publicUrl.split(`/${STORAGE_BUCKET}/`)[1];
    if (!path) return;
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
};
