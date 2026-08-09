/**
 * assets/client/js/api.js
 * Semua query Supabase untuk halaman client (publik).
 * Tidak memerlukan login — menggunakan anon key dengan RLS SELECT.
 */
import { supabase } from '../../js/supabase-client.js';
import { showLoading, hideLoading } from './loading.js';

/* ── Produk ────────────────────────────────────────────────── */

/**
 * Ambil daftar produk dengan join kategori.
 * @param {{ categoryId?, keyword?, sortBy?, limit? }} opts
 */
export const getProducts = async ({ categoryId = null, keyword = '', sortBy = 'newest', limit = 0 } = {}) => {
    showLoading();
    try {
        let query = supabase
            .from('products')
            .select('*, categories(id, name)')
            .eq('is_available', true);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (keyword.trim()) {
            query = query.ilike('name', `%${keyword.trim()}%`);
        }

        if (sortBy === 'price-low')  query = query.order('price', { ascending: true });
        else if (sortBy === 'price-high') query = query.order('price', { ascending: false });
        else query = query.order('created_at', { ascending: false }); // newest

        if (limit > 0) query = query.limit(limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('getProducts error:', err.message);
        return [];
    } finally {
        hideLoading();
    }
};

/**
 * Ambil satu produk berdasarkan ID.
 * @param {number} id
 */
export const getProductById = async (id) => {
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
        console.error('getProductById error:', err.message);
        return null;
    } finally {
        hideLoading();
    }
};

/* ── Kategori ──────────────────────────────────────────────── */

/**
 * Ambil semua kategori.
 */
export const getCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('getCategories error:', err.message);
        return [];
    }
};

/* ── Store Profile (publik) ────────────────────────────────── */

/**
 * Ambil profil toko untuk ditampilkan ke client.
 */
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
