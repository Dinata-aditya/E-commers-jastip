/**
 * login.js
 * Auth admin menggunakan Supabase Auth (email + password).
 */
import { supabase } from '../../js/supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── 1. Cek session — kalau sudah login langsung ke dashboard ─
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.replace('dashboard.html');
        return;
    }

    // ── 2. Setup form ─────────────────────────────────────────
    const form           = document.getElementById('admin-login-form');
    const errorBox       = document.getElementById('login-error');
    const submitBtn      = form?.querySelector('button[type="submit"]');
    const togglePassBtn  = document.getElementById('toggle-password');
    const togglePassIcon = document.getElementById('toggle-pass-icon');
    const passwordInput  = document.getElementById('password');

    if (!form) return;

    const showError = (msg) => {
        errorBox.textContent   = msg;
        errorBox.style.display = 'block';
    };

    const hideError = () => {
        errorBox.style.display = 'none';
        errorBox.textContent   = '';
    };

    // Toggle show/hide password
    togglePassBtn?.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type       = isHidden ? 'text' : 'password';
        togglePassIcon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    // ── 3. Submit login ───────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email    = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Email dan password wajib diisi.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled  = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Masuk...';
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            let msg = 'Email atau password salah.';
            if (error.message.toLowerCase().includes('email not confirmed')) {
                msg = 'Email belum dikonfirmasi. Cek inbox email kamu.';
            }
            showError(msg);
            if (submitBtn) {
                submitBtn.disabled  = false;
                submitBtn.innerHTML = 'Login <i class="fa-solid fa-right-to-bracket"></i>';
            }
            return;
        }

        window.location.href = 'dashboard.html';
    });
});
