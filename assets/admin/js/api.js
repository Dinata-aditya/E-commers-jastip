/**
 * assets/admin/js/api.js
 * Semua query Supabase untuk halaman admin.
 * Operasi write (insert/update/delete) memerlukan user yang sudah login.
 */
import { supabase, uploadProductImage, deleteProductImage, uploadMultipleImages, deleteMultipleImages } from '../../js/supabase-client.js';

/* ── Loading helpers ───────────────────────────────────────── */
export const showLoading = () => {
    const el = document.getElementById('loading-spinner');
    if (el) el.style.display = 'flex';
};

export const hideLoading = () => {
    const el = document.getElementById('loading-spinner');
    if (el) el.style.display = 'none';
};

/* ── Auth ──────────────────────────────────────────────────── */
export const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

/* ── Produk ─────────────────────────────────────────────────  */

export const adminGetProducts = async () => {
    showLoading();
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('adminGetProducts:', err.message);
        return [];
    } finally {
        hideLoading();
    }
};

export const adminGetProductById = async (id) => {
    showLoading();
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('adminGetProductById:', err.message);
        return null;
    } finally {
        hideLoading();
    }
};

export const adminCreateProduct = async (fields, newImageFiles = []) => {
    showLoading();
    try {
        // Upload semua gambar baru
        const uploadedUrls = await uploadMultipleImages(newImageFiles.filter(Boolean));

        const image_url = uploadedUrls[0] || null;   // foto utama = index 0
        const images    = uploadedUrls;               // semua foto

        const { data, error } = await supabase
            .from('products')
            .insert({ ...fields, image_url, images })
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('adminCreateProduct:', err.message);
        throw err;
    } finally {
        hideLoading();
    }
};

export const adminUpdateProduct = async (id, fields, newImageFiles = [], existingUrls = [], oldImages = []) => {
    showLoading();
    try {
        // Upload gambar baru
        const uploadedUrls = await uploadMultipleImages(newImageFiles.filter(Boolean));

        // Gabungkan: existing yang masih dipakai + yang baru diupload
        const allImages = [...existingUrls, ...uploadedUrls];
        const image_url = allImages[0] || null;

        // Hapus gambar lama yang sudah tidak dipakai
        const removedUrls = oldImages.filter(u => !existingUrls.includes(u));
        await deleteMultipleImages(removedUrls);

        const updates = { ...fields, image_url, images: allImages };

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('adminUpdateProduct:', err.message);
        throw err;
    } finally {
        hideLoading();
    }
};

export const adminDeleteProduct = async (id, imageUrl) => {
    showLoading();
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        if (imageUrl) await deleteProductImage(imageUrl);
        return true;
    } catch (err) {
        console.error('adminDeleteProduct:', err.message);
        return false;
    } finally {
        hideLoading();
    }
};

/* ── Kategori ──────────────────────────────────────────────── */

export const adminGetCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*, products(id)')
            .order('name', { ascending: true });
        if (error) throw error;
        // Hitung jumlah produk per kategori
        return (data || []).map(c => ({
            ...c,
            product_count: c.products ? c.products.length : 0,
            products: undefined,
        }));
    } catch (err) {
        console.error('adminGetCategories:', err.message);
        return [];
    }
};

export const adminCreateCategory = async (name) => {
    const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const adminUpdateCategory = async (id, name) => {
    const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const adminDeleteCategory = async (id) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

/* ── Store Profile ─────────────────────────────────────────── */

export const getStoreProfile = async () => {
    try {
        const { data, error } = await supabase
            .from('store_profile')
            .select('*')
            .eq('id', 1)
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('getStoreProfile:', err.message);
        return null;
    }
};

export const updateStoreProfile = async (fields) => {
    const { data, error } = await supabase
        .from('store_profile')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single();
    if (error) throw error;
    return data;
};
