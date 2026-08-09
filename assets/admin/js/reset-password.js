/**
 * reset-password.js
 * Dua mode:
 * 1. MODE REQUEST  — user belum punya token → tampilkan form email → kirim link reset
 * 2. MODE RECOVERY — user klik link dari email (URL berisi #access_token atau ?type=recovery)
 *                  → tampilkan form password baru → simpan → redirect login
 */
import { supabase } from '../../js/supabase-client.js';

/* ── Helper UI ──────────────────────────────────────────────── */
const showMsg = (elId, msg) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
};

const hideMsg = (elId) => {
    const el = document.getElementById(elId);
    if (el) el.style.display = 'none';
};

const togglePass = (btnId, inputId, iconId) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
        const input = document.getElementById(inputId);
        const icon  = document.getElementById(iconId);
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type     = isHidden ? 'text' : 'password';
        if (icon) icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
};

/* ── Deteksi mode ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

    // Supabase v2 menaruh token di hash URL: #access_token=...&type=recovery
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const type   = params.get('type');

    // Juga cek query string untuk versi lain
    const qParams = new URLSearchParams(window.location.search);
    const qType   = qParams.get('type');

    const isRecovery = type === 'recovery' || qType === 'recovery';

    if (isRecovery) {
        /* ════════════════════════════════════════════════════
           MODE RECOVERY — tampilkan form password baru
        ════════════════════════════════════════════════════ */
        showRecoveryForm();

        // Set session dari token di URL
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' });
        }

    } else {
        /* ════════════════════════════════════════════════════
           MODE REQUEST — tampilkan form email
        ════════════════════════════════════════════════════ */
        showRequestForm();
    }

    // Bind toggle password
    togglePass('toggle-new-pass',     'new-password',     'toggle-new-icon');
    togglePass('toggle-confirm-pass', 'confirm-password', 'toggle-confirm-icon');
});

/* ── MODE REQUEST: form email ──────────────────────────────── */
const showRequestForm = () => {
    const form = document.getElementById('reset-password-form');
    if (!form) return;

    // Ganti form jadi input email
    form.innerHTML = `
        <div class="input-group">
            <label for="reset-email">Email Admin</label>
            <div class="input-icon">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" id="reset-email"
                       placeholder="Masukkan email admin" required autocomplete="email">
            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full" id="submit-btn">
            Kirim Link Reset <i class="fa-solid fa-paper-plane"></i>
        </button>
    `;

    // Update header
    const header = document.querySelector('.login-header p');
    if (header) header.textContent = 'Masukkan email admin untuk menerima link reset password.';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('reset-error');
        hideMsg('reset-success');

        const email = document.getElementById('reset-email')?.value.trim();
        if (!email) return;

        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/reset-password.html`,
        });

        if (error) {
            showMsg('reset-error', error.message || 'Gagal mengirim email reset.');
        } else {
            showMsg('reset-success',
                '✅ Link reset password telah dikirim ke email kamu. Cek inbox atau folder spam.'
            );
            form.style.display = 'none';
        }

        btn.disabled = false;
        btn.innerHTML = 'Kirim Link Reset <i class="fa-solid fa-paper-plane"></i>';
    });
};

/* ── MODE RECOVERY: form password baru ─────────────────────── */
const showRecoveryForm = () => {
    const header = document.querySelector('.login-header p');
    if (header) header.textContent = 'Buat password baru untuk akun admin kamu.';

    const form = document.getElementById('reset-password-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('reset-error');
        hideMsg('reset-success');

        const newPass     = document.getElementById('new-password')?.value;
        const confirmPass = document.getElementById('confirm-password')?.value;

        if (!newPass || newPass.length < 6) {
            showMsg('reset-error', 'Password minimal 6 karakter.');
            return;
        }

        if (newPass !== confirmPass) {
            showMsg('reset-error', 'Konfirmasi password tidak cocok.');
            return;
        }

        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        const { error } = await supabase.auth.updateUser({ password: newPass });

        if (error) {
            showMsg('reset-error', error.message || 'Gagal menyimpan password baru.');
            btn.disabled = false;
            btn.innerHTML = 'Simpan Password <i class="fa-solid fa-check"></i>';
        } else {
            showMsg('reset-success', '✅ Password berhasil diperbarui! Mengalihkan ke halaman login...');
            form.style.display = 'none';
            setTimeout(() => {
                window.location.href = 'login.html?key=jastipmayla2026';
            }, 2500);
        }
    });
};
